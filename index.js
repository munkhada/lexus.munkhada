import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const SHEET_ID = "1mDYRcroBWB9IR7W0mLwa-27qAY9wcaG1Y0RpiT4RU8A";

const creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT || "{}");

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

const otpStore = new Map();

const clean = (v) => String(v ?? "").trim();

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function normalizePhone(phone) {
  let p = clean(phone).replace(/\D/g, "");
  if (p.startsWith("976") && p.length > 8) p = p.slice(3);
  return p;
}

function normalizeKey(key) {
  return clean(key).toLowerCase().replace(/\s+/g, " ");
}

function isMembershipActive(value) {
  const v = clean(value).toLowerCase();
  if (!v) return false;
  if (v.includes("цуц")) return false;
  if (v.includes("хүчингүй")) return false;
  return v.includes("хүчинтэй");
}

function rowToObj(row) {
  if (!row) return {};
  if (typeof row.toObject === "function") return row.toObject();
  return {};
}

function getValueByPossibleKeys(row, possibleMatchers = []) {
  const obj = rowToObj(row);

  for (const key of Object.keys(obj)) {
    const nk = normalizeKey(key);

    for (const matcher of possibleMatchers) {
      if (typeof matcher === "string" && nk === normalizeKey(matcher)) {
        return clean(obj[key]);
      }

      if (matcher instanceof RegExp && matcher.test(nk)) {
        return clean(obj[key]);
      }

      if (typeof matcher === "function" && matcher(nk, key)) {
        return clean(obj[key]);
      }
    }
  }

  return "";
}

function getPhoneFromRow(row) {
  return getValueByPossibleKeys(row, [
    (nk) => nk.includes("утас"),
    "утасны дугаар",
    "утас",
    "phone",
    "phone number",
  ]);
}

function getMembershipFromRow(row) {
  return getValueByPossibleKeys(row, [
    (nk) => nk.includes("гишүүн"),
    "гишүүнчлэл хүчинтэй",
    "membership",
    "status",
  ]);
}

function getModelFromRow(row) {
  return getValueByPossibleKeys(row, [
    "model-detail",
    "model detail",
    (nk) => nk.includes("model"),
  ]);
}

function getOwnerDateFromRow(row) {
  return getValueByPossibleKeys(row, [
    "автомашин хүлээлгэж өгсөн огноо",
    (nk) => nk.includes("огноо"),
    "owner date",
    "date",
  ]);
}

function getLastnameFromRow(row) {
  return getValueByPossibleKeys(row, ["овог", "lastname", "last name"]);
}

function getFirstnameFromRow(row) {
  return getValueByPossibleKeys(row, ["нэр", "firstname", "first name"]);
}

function getEmailFromRow(row) {
  return getValueByPossibleKeys(row, [
    (nk) => nk.includes("и-мэйл"),
    (nk) => nk.includes("имэйл"),
    (nk) => nk.includes("email"),
    "и-мэйл хаяг",
    "email",
  ]);
}

function getPlateFromRow(row) {
  return getValueByPossibleKeys(row, [
    "plate",
    "plate number",
    "улсын дугаар",
    (nk) => nk.includes("дугаар"),
  ]);
}

async function loadSheet() {
  const auth = new JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  const doc = new GoogleSpreadsheet(SHEET_ID, auth);
  await doc.loadInfo();
  return doc;
}

async function findUserByPhone(phone) {
  const doc = await loadSheet();
  const sheet = doc.sheetsByIndex[0];
  const rows = await sheet.getRows();

  const target = normalizePhone(phone);

  return (
    rows.find((row) => {
      const rowPhone = normalizePhone(getPhoneFromRow(row));
      return rowPhone && rowPhone === target;
    }) || null
  );
}

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 587,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

async function sendOtpEmail(toEmail, otp, firstname = "") {
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    throw new Error("SMTP тохиргоо дутуу байна");
  }

  const name = clean(firstname) || "Хэрэглэгч";

  await transporter.sendMail({
    from: `"Lexus Owners" <${SMTP_USER}>`,
    to: clean(toEmail),
    subject: "Lexus Owners нэвтрэх код",
    html: `
      <div style="font-family: Arial, sans-serif; color: #111; line-height: 1.6;">
        <h2 style="margin-bottom: 12px;">Lexus Owners</h2>
        <p>Сайн байна уу, ${name}</p>
        <p>Таны нэвтрэх нэг удаагийн баталгаажуулах код:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px; margin: 18px 0;">
          ${otp}
        </div>
        <p>Энэ кодыг бусдад бүү дамжуулаарай.</p>
      </div>
    `,
  });
}

app.get("/", (req, res) => {
  res.send("Lexus Owners Backend OK 🚗");
});

app.get("/smtp-test", async (req, res) => {
  try {
    await transporter.verify();
    return res.json({ success: true, message: "SMTP OK" });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: "SMTP алдаа",
      error: e.message || String(e),
    });
  }
});

app.get("/check-phone", async (req, res) => {
  try {
    const { phone } = req.query;

    if (!phone) {
      return res.json({ success: false, message: "Утас оруулаагүй байна" });
    }

    const found = await findUserByPhone(phone);

    if (!found) {
      return res.json({ success: false, message: "Бүртгэлгүй хэрэглэгч" });
    }

    const membership = getMembershipFromRow(found);

    if (!isMembershipActive(membership)) {
      return res.json({ success: false, message: "Гишүүнчлэл хүчингүй" });
    }

    return res.json({
      success: true,
      membership,
      user: {
        model: getModelFromRow(found),
        ownerDate: getOwnerDateFromRow(found),
        lastname: getLastnameFromRow(found),
        firstname: getFirstnameFromRow(found),
        phone: getPhoneFromRow(found),
        email: getEmailFromRow(found),
        plate: getPlateFromRow(found),
        membership,
      },
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: "Server алдаа",
      error: e.message || String(e),
    });
  }
});

app.get("/send-otp", async (req, res) => {
  try {
    const { phone } = req.query;

    if (!phone) {
      return res.json({ success: false, message: "Утас оруулаагүй байна" });
    }

    const inputPhone = normalizePhone(phone);
    const found = await findUserByPhone(inputPhone);

    if (!found) {
      return res.json({ success: false, message: "Бүртгэлгүй хэрэглэгч" });
    }

    const membership = getMembershipFromRow(found);

    if (!isMembershipActive(membership)) {
      return res.json({ success: false, message: "Гишүүнчлэл хүчингүй" });
    }

    const email = getEmailFromRow(found);

    if (!email) {
      return res.json({
        success: false,
        message: "И-мэйл хаяг бүртгэлгүй байна",
      });
    }

    const otp = generateOtp();
    otpStore.set(inputPhone, otp);

    await sendOtpEmail(email, otp, getFirstnameFromRow(found));

    return res.json({
      success: true,
      message: "OTP код и-мэйлээр илгээгдлээ",
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: "OTP илгээж чадсангүй",
      error: e.message || String(e),
    });
  }
});

app.get("/verify-otp", async (req, res) => {
  try {
    const { phone, otp } = req.query;

    const p = normalizePhone(phone);
    const o = clean(otp);

    if (!p || !o) {
      return res.json({ success: false, message: "Мэдээлэл дутуу" });
    }

    if (!otpStore.has(p)) {
      return res.json({ success: false, message: "OTP хугацаа дууссан" });
    }

    if (otpStore.get(p) !== o) {
      return res.json({ success: false, message: "OTP код буруу" });
    }

    otpStore.delete(p);

    const found = await findUserByPhone(p);

    if (!found) {
      return res.json({ success: false, message: "Бүртгэлгүй хэрэглэгч" });
    }

    const membership = getMembershipFromRow(found);

    if (!isMembershipActive(membership)) {
      return res.json({ success: false, message: "Гишүүнчлэл хүчингүй" });
    }

    return res.json({
      success: true,
      user: {
        model: getModelFromRow(found),
        ownerDate: getOwnerDateFromRow(found),
        lastname: getLastnameFromRow(found),
        firstname: getFirstnameFromRow(found),
        phone: getPhoneFromRow(found),
        email: getEmailFromRow(found),
        plate: getPlateFromRow(found),
        membership,
      },
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: "Server алдаа",
      error: e.message || String(e),
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
