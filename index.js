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
    return v === "хүчинтэй";
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

    const doc = await loadSheet();

    const sheet = doc.sheetsByIndex[0];

    const rows = await sheet.getRows();

    const target = clean(phone);

    const found = rows.find((r) => clean(r._rawData?.[5]) === target);

    return found || null;
}


// ===== SEND SMS =====

async function sendSms(phone, otp) {
    const message = encodeURIComponent(`Lexus Owners код: ${otp}`);

    const url =
        `http://27.123.214.168/smsmt/mt` +
        `?servicename=${SMS_SERVICE}` +
        `&username=${SMS_USERNAME}` +
        `&from=${SMS_FROM}` +
        `&to=${phone}` +
        `&msg=${message}`;

    console.log("SMS URL:", url);

    const response = await fetch(url);
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

        const membership = clean(found._rawData?.[7]);

        if (!isMembershipActive(membership)) {
            return res.json({
                success: false,
                message: "Нэвтрэх эрх дууссан байна",
            });
        }

        return res.json({ success: true });

    } catch (e) {

        console.error("CHECK PHONE ERROR:", e);

        return res.json({
            success: false,
            message: "Server алдаа",
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

        const found = await findUserByPhone(phone);

        if (!found) {
            return res.json({
                success: false,
                message: "Бүртгэлгүй хэрэглэгч",
            });
        }

        const membership = clean(found._rawData?.[7]);

        if (!isMembershipActive(membership)) {
            return res.json({
                success: false,
                message: "Нэвтрэх эрх дууссан байна",
            });
        }

        const otp = generateOtp();

        otpStore.set(clean(phone), otp);

        console.log("OTP:", phone, otp);

        const smsResult = await sendSms(clean(phone), otp);

        return res.json({
            success: true,
            message: "OTP ilgeegdlee",
            smsResult: smsResult
        });

    } catch (e) {
        console.error("SEND OTP ERROR:", e);

        return res.status(500).json({
            success: false,
            message: "OTP ilgeej chadsangui",
            error: e.message || String(e)
        });
    }
});

// ===== VERIFY OTP =====

app.get("/verify-otp", async (req, res) => {

    try {

        const { phone, otp } = req.query;

        const p = clean(phone);
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

        const membership = clean(found._rawData?.[7]);

        if (!isMembershipActive(membership)) {
            return res.json({
                success: false,
                message: "Нэвтрэх эрх дууссан байна",
            });
        }

        return res.json({
            success: true,
            user: {
                model: clean(found._rawData?.[0]),
                vin: clean(found._rawData?.[1]),
                ownerDate: clean(found._rawData?.[2]),
                lastname: clean(found._rawData?.[3]),
                firstname: clean(found._rawData?.[4]),
                phone: clean(found._rawData?.[5]),
                email: clean(found._rawData?.[6]),
                membership: membership,
            },
        });

    } catch (e) {

        console.error("VERIFY OTP ERROR:", e);

        return res.json({
            success: false,
            message: "Server алдаа",
        });
    }
});


// ===== START SERVER =====

app.listen(PORT, () => {

    console.log(`🚀 Backend running on port ${PORT}`);

});
