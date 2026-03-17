import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const SHEET_ID = "1mDYRcroBWB9IR7W0mLwa-27qAY9wcaG1Y0RpiT4RU8A";

const creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT || "{}");

// ===== SMS CONFIG =====
const SMS_SERVICE = "munkh";
const SMS_USERNAME = "khada";
const SMS_FROM = "130044";

// ===== OTP STORE =====
const otpStore = new Map();

// ===== HELPERS =====
const clean = (v) => String(v ?? "").trim();

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function normalizePhone(phone) {
  let p = clean(phone).replace(/\D/g, "");
  if (p.startsWith("976") && p.length > 8) {
    p = p.slice(3);
  }
  return p;
}

function normalizeKey(key) {
  return clean(key).toLowerCase().replace(/\s+/g, " ");
}

function isMembershipActive(value) {
  const v = clean(value).toLowerCase();
  return v.includes("хүчинтэй") && !v.includes("цуц");
}

function rowToObj(row) {
  if (!row) return {};
  if (typeof row.toObject === "function") {
    return row.toObject();
  }
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
  return getValueByPossibleKeys(row, [
    "овог",
    "lastname",
    "last name",
  ]);
}

function getFirstnameFromRow(row) {
  return getValueByPossibleKeys(row, [
    "нэр",
    "firstname",
    "first name",
  ]);
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

// ===== LOAD SHEET =====
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

// ===== FIND USER =====
async function findUserByPhone(phone) {
  const doc = await loadSheet();
  const sheet = doc.sheetsByIndex[0];
  const rows = await sheet.getRows();

  const target = normalizePhone(phone);
  console.log("Searching phone:", target);
  console.log("Rows count:", rows.length);

  const found = rows.find((row) => {
    const rowPhone = normalizePhone(getPhoneFromRow(row));
    return rowPhone && rowPhone === target;
  });

  if (found) {
    console.log("User found:", {
      lastname: getLastnameFromRow(found),
      firstname: getFirstnameFromRow(found),
      phone: getPhoneFromRow(found),
      membership: getMembershipFromRow(found),
    });
  } else {
    if (rows[0]) {
      console.log("First row headers:", Object.keys(rowToObj(rows[0])));
      console.log("First row sample:", rowToObj(rows[0]));
    }
  }

  return found || null;
}

// ===== SEND SMS =====
async function sendSms(phone, otp) {
  const normalizedPhone = normalizePhone(phone);
  const message = encodeURIComponent(`Lexus Owners код: ${otp}`);

  const url =
    `http://27.123.214.168/smsmt/mt` +
    `?servicename=${SMS_SERVICE}` +
    `&username=${SMS_USERNAME}` +
    `&from=${SMS_FROM}` +
    `&to=${normalizedPhone}` +
    `&msg=${message}`;

  console.log("SMS URL:", url);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, { signal: controller.signal });
    const text = await response.text();

    console.log("SMS STATUS:", response.status);
    console.log("SMS RESPONSE:", text);

    if (!response.ok) {
      throw new Error(`SMS HTTP error: ${response.status} ${text}`);
    }

    if (
      text.toLowerCase().includes("error") ||
      text.toLowerCase().includes("failed")
    ) {
      throw new Error(`SMS gateway error: ${text}`);
    }

    return text;
  } finally {
    clearTimeout(timeout);
  }
}

// ===== HEALTH CHECK =====
app.get("/", (req, res) => {
  res.send("Lexus Owners Backend OK 🚗");
});

// ===== CHECK PHONE =====
app.get("/check-phone", async (req, res) => {
  try {
    const { phone } = req.query;

    if (!phone) {
      return res.json({
        success: false,
        message: "Утас оруулаагүй байна",
      });
    }

    const found = await findUserByPhone(phone);

    if (!found) {
      return res.json({
        success: false,
        message: "Бүртгэлгүй хэрэглэгч",
      });
    }

    const membership = getMembershipFromRow(found);

    if (!isMembershipActive(membership)) {
      return res.json({
        success: false,
        message: "Нэвтрэх эрх дууссан байна",
      });
    }

    return res.json({
      success: true,
      membership,
    });
  } catch (e) {
    console.error("CHECK PHONE ERROR:", e);

    return res.status(500).json({
      success: false,
      message: "Server алдаа",
      error: e.message || String(e),
    });
  }
});

// ===== SEND OTP =====
app.get("/send-otp", async (req, res) => {
  try {
    const { phone } = req.query;

    if (!phone) {
      return res.json({
        success: false,
        message: "Утас оруулаагүй байна",
      });
    }

    const inputPhone = normalizePhone(phone);
    const found = await findUserByPhone(inputPhone);

    if (!found) {
      return res.json({
        success: false,
        message: "Бүртгэлгүй хэрэглэгч",
      });
    }

    const membership = getMembershipFromRow(found);
    console.log("MEMBERSHIP:", membership);

    if (!isMembershipActive(membership)) {
      return res.json({
        success: false,
        message: "Нэвтрэх эрх дууссан байна",
      });
    }

    const otp = generateOtp();
    otpStore.set(inputPhone, otp);

    console.log("OTP:", inputPhone, otp);

    const smsResult = await sendSms(inputPhone, otp);

    return res.json({
      success: true,
      message: "OTP илгээгдлээ",
      smsResult,
    });
  } catch (e) {
    console.error("SEND OTP ERROR:", e);

    return res.status(500).json({
      success: false,
      message: "OTP илгээж чадсангүй",
      error: e.message || String(e),
    });
  }
});

// ===== VERIFY OTP =====
app.get("/verify-otp", async (req, res) => {
  try {
    const { phone, otp } = req.query;

    const p = normalizePhone(phone);
    const o = clean(otp);

    if (!p || !o) {
      return res.json({
        success: false,
        message: "Мэдээлэл дутуу",
      });
    }

    if (!otpStore.has(p)) {
      return res.json({
        success: false,
        message: "OTP хугацаа дууссан",
      });
    }

    if (otpStore.get(p) !== o) {
      return res.json({
        success: false,
        message: "OTP код буруу",
      });
    }

    otpStore.delete(p);

    const found = await findUserByPhone(p);

    if (!found) {
      return res.json({
        success: false,
        message: "Бүртгэлгүй хэрэглэгч",
      });
    }

    const membership = getMembershipFromRow(found);

    if (!isMembershipActive(membership)) {
      return res.json({
        success: false,
        message: "Нэвтрэх эрх дууссан байна",
      });
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
        membership,
      },
    });
  } catch (e) {
    console.error("VERIFY OTP ERROR:", e);

    return res.status(500).json({
      success: false,
      message: "Server алдаа",
      error: e.message || String(e),
    });
  }
});

// ===== START SERVER =====
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
