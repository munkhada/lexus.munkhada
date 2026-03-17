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

function isMembershipActive(value) {
  const v = clean(value).toLowerCase();
  return v.includes("хүчинтэй") && !v.includes("дуус");
}

// ===== LOAD SHEET =====
async function loadSheet() {
  const auth = new JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const doc = new GoogleSpreadsheet(SHEET_ID, auth);
  await doc.loadInfo();
  return doc;
}

// ===== FIND USER =====
async function findUserByPhone(phone) {
  console.log("🔍 Finding user...");

  const doc = await loadSheet();
  const sheet = doc.sheetsByIndex[0];

  const rows = await sheet.getRows();
  console.log("📄 Total rows:", rows.length);

  const target = clean(phone);

  const found = rows.find(
    (r) => clean(r["Утасны дугаар"]) === target
  );

  console.log("👤 Found:", !!found);

  return found || null;
}

// ===== SEND SMS (TIMEOUT FIXED) =====
async function sendSms(phone, otp) {
  const message = encodeURIComponent(`Lexus Owners код: ${otp}`);

  const url =
    `http://27.123.214.168/smsmt/mt` +
    `?servicename=${SMS_SERVICE}` +
    `&username=${SMS_USERNAME}` +
    `&from=${SMS_FROM}` +
    `&to=${phone}` +
    `&msg=${message}`;

  console.log("📨 SMS URL:", url);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
    });

    const text = await response.text();

    console.log("📨 SMS STATUS:", response.status);
    console.log("📨 SMS RESPONSE:", text);

    return text;
  } catch (e) {
    console.error("❌ SMS ERROR:", e.message);
    throw e;
  } finally {
    clearTimeout(timeout);
  }
}

// ===== HEALTH =====
app.get("/", (req, res) => {
  res.send("Lexus Owners Backend OK 🚗");
});

// ===== CHECK PHONE =====
app.get("/check-phone", async (req, res) => {
  try {
    const { phone } = req.query;

    const found = await findUserByPhone(phone);

    if (!found) {
      return res.json({
        success: false,
        message: "Бүртгэлгүй хэрэглэгч",
      });
    }

    const membership = clean(found["Гишүүнчлэл хүчинтэй"]);

    if (!isMembershipActive(membership)) {
      return res.json({
        success: false,
        message: "Нэвтрэх эрх дууссан байна",
      });
    }

    return res.json({ success: true });

  } catch (e) {
    console.error("CHECK ERROR:", e);
    return res.json({
      success: false,
      message: "Server алдаа",
    });
  }
});

// ===== SEND OTP =====
app.get("/send-otp", async (req, res) => {
  try {
    console.log("🚀 SEND OTP START");

    const { phone } = req.query;

    const found = await findUserByPhone(phone);

    if (!found) {
      return res.json({
        success: false,
        message: "Бүртгэлгүй хэрэглэгч",
      });
    }

    const membership = clean(found["Гишүүнчлэл хүчинтэй"]);
    console.log("📊 Membership:", membership);

    if (!isMembershipActive(membership)) {
      return res.json({
        success: false,
        message: "Нэвтрэх эрх дууссан байна",
      });
    }

    const otp = generateOtp();
    otpStore.set(clean(phone), otp);

    console.log("🔐 OTP:", otp);

    // ===== DEBUG: SMS-г түр алгасаж шалгах =====
    // comment хасвал SMS ажиллана
    /*
    const smsResult = await sendSms(clean(phone), otp);

    return res.json({
      success: true,
      smsResult,
    });
    */

    return res.json({
      success: true,
      message: "OTP created",
      otp: otp,
    });

  } catch (e) {
    console.error("SEND OTP ERROR:", e);

    return res.json({
      success: false,
      message: "Алдаа",
      error: e.message,
    });
  }
});

// ===== VERIFY OTP =====
app.get("/verify-otp", async (req, res) => {
  try {
    const { phone, otp } = req.query;

    if (!otpStore.has(phone)) {
      return res.json({
        success: false,
        message: "OTP олдсонгүй",
      });
    }

    if (otpStore.get(phone) !== otp) {
      return res.json({
        success: false,
        message: "Буруу код",
      });
    }

    otpStore.delete(phone);

    const found = await findUserByPhone(phone);

    const membership = clean(found["Гишүүнчлэл хүчинтэй"]);

    return res.json({
      success: true,
      user: {
        model: clean(found["Model-Detail"]),
        lastname: clean(found["Овог"]),
        firstname: clean(found["Нэр"]),
        phone: clean(found["Утасны дугаар"]),
        email: clean(found["И-мэйл хаяг"]),
        membership,
      },
    });

  } catch (e) {
    console.error("VERIFY ERROR:", e);

    return res.json({
      success: false,
      message: "Server алдаа",
    });
  }
});

// ===== START =====
app.listen(PORT, () => {
  console.log(`🚀 Running on ${PORT}`);
});
