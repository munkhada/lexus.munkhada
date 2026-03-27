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

      if (typeof matcher === "function" && matcher(nk)) {
        return clean(obj[key]);
      }
    }
  }

  return "";
}

// ================== GETTERS ==================

function getPhoneFromRow(row) {
  return getValueByPossibleKeys(row, [
    (nk) => nk.includes("утас"),
    "утасны дугаар",
    "phone",
  ]);
}

function getMembershipFromRow(row) {
  return getValueByPossibleKeys(row, [
    (nk) => nk.includes("гишүүн"),
    "membership",
  ]);
}

function getModelFromRow(row) {
  return getValueByPossibleKeys(row, [
    "model-detail",
    (nk) => nk.includes("model"),
  ]);
}

function getOwnerDateFromRow(row) {
  return getValueByPossibleKeys(row, [
    (nk) => nk.includes("огноо"),
  ]);
}

function getLastnameFromRow(row) {
  return getValueByPossibleKeys(row, ["овог"]);
}

function getFirstnameFromRow(row) {
  return getValueByPossibleKeys(row, ["нэр"]);
}

function getEmailFromRow(row) {
  return getValueByPossibleKeys(row, [
    (nk) => nk.includes("email"),
    (nk) => nk.includes("имэйл"),
  ]);
}

// 👉 VIN (ШИНЭ)
function getVinFromRow(row) {
  return getValueByPossibleKeys(row, [
    "vin number",
    "vin",
    (nk) => nk.includes("vin"),
  ]);
}

// 👉 PLATE (зүгээр fallback)
function getPlateFromRow(row) {
  return getValueByPossibleKeys(row, [
    "plate",
    "улсын дугаар",
  ]);
}

// ================== SHEET ==================

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

  return rows.find((row) => {
    const rowPhone = normalizePhone(getPhoneFromRow(row));
    return rowPhone && rowPhone === target;
  });
}

// ================== ROUTES ==================

app.get("/check-phone", async (req, res) => {
  const { phone } = req.query;

  const found = await findUserByPhone(phone);
  if (!found) return res.json({ success: false });

  return res.json({
    success: true,
    user: {
      model: getModelFromRow(found),
      vinNumber: getVinFromRow(found),   // ✅ VIN
      plate: getVinFromRow(found),       // 👉 plate оронд VIN ашиглаж байна
      ownerDate: getOwnerDateFromRow(found),
      lastname: getLastnameFromRow(found),
      firstname: getFirstnameFromRow(found),
      phone: getPhoneFromRow(found),
      email: getEmailFromRow(found),
      membership: getMembershipFromRow(found),
    },
  });
});

app.get("/verify-otp", async (req, res) => {
  const { phone } = req.query;

  const found = await findUserByPhone(phone);
  if (!found) return res.json({ success: false });

  return res.json({
    success: true,
    user: {
      model: getModelFromRow(found),
      vinNumber: getVinFromRow(found),   // ✅ VIN
      plate: getVinFromRow(found),       // ✅ PROFILE дээр гарах
      ownerDate: getOwnerDateFromRow(found),
      lastname: getLastnameFromRow(found),
      firstname: getFirstnameFromRow(found),
      phone: getPhoneFromRow(found),
      email: getEmailFromRow(found),
      membership: getMembershipFromRow(found),
    },
  });
});

app.listen(PORT, () => {
  console.log("🚀 Backend running");
});
