import express from "express";
import cors from "cors";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";

const app = express();

// ✅ CORS
app.use(
    cors({
        origin: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);
app.options("*", cors());

app.use(express.json());

// ✅ Render дээр PORT заавал process.env.PORT ашиглана
const PORT = process.env.PORT || 4000;

// ✅ Sheet ID
const SHEET_ID = "1mDYRcroBWB9IR7W0mLwa-27qAY9wcaG1Y0RpiT4RU8A";

// ✅ Service Account JSON-г Render ENV-ээс уншина
// Render -> Environment -> GOOGLE_SERVICE_ACCOUNT = { ...json... }
if (!process.env.GOOGLE_SERVICE_ACCOUNT) {
    console.error("❌ GOOGLE_SERVICE_ACCOUNT env not found!");
}

const creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT || "{}");

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

// ===== HELPERS =====
const clean = (v) => String(v ?? "").trim();

function isMembershipActive(value) {
    // Sheet дээр "Гишүүнчлэл хүчинтэй" гэдэгтэй адил утгыг зөвшөөрнө
    const v = clean(value).toLowerCase();
    if (v.includes("хүчинтэй")) return true;
    return false;
}

async function findUserByPhone(phone) {
    const doc = await loadSheet();
    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();

    // Танай sheet дээр Phone нь F багана => index = 5
    const target = clean(phone);
    const found = rows.find((r) => clean(r._rawData?.[5]) === target);

    return found || null;
}

// ===== HEALTH CHECK =====
app.get("/", (req, res) => {
    res.send("Lexus Owners Backend OK 🚗");
});

// ===== CHECK PHONE (Зөвхөн хүчинтэй гишүүнчлэлтэй бол OK) =====
app.get("/check-phone", async (req, res) => {
    try {
        const { phone } = req.query;
        if (!phone) return res.json({ success: false, message: "Утас оруулаагүй байна" });

        const found = await findUserByPhone(phone);
        if (!found) return res.json({ success: false, message: "Бүртгэлгүй хэрэглэгч" });

        // Membership нь H багана => index = 7
        const membership = clean(found._rawData?.[7]);

        if (!isMembershipActive(membership)) {
            return res.json({ success: false, message: "Нэвтрэх эрх дууссан байна" });
        }

        return res.json({ success: true });
    } catch (e) {
        console.error("CHECK PHONE ERROR:", e);
        return res.json({ success: false, message: "Server алдаа" });
    }
});

// ===== OTP STORE =====
const otpStore = new Map();

// ===== SEND OTP (ЗӨВХӨН ХҮЧИНТЭЙ ГИШҮҮНЧЛЭЛТЭЙ ХҮНД) =====
app.get("/send-otp", async (req, res) => {
    try {
        const { phone } = req.query;
        if (!phone) return res.json({ success: false, message: "Утас оруулаагүй байна" });

        const found = await findUserByPhone(phone);
        if (!found) return res.json({ success: false, message: "Бүртгэлгүй хэрэглэгч" });

        const membership = clean(found._rawData?.[7]);
        if (!isMembershipActive(membership)) {
            return res.json({ success: false, message: "Нэвтрэх эрх дууссан байна" });
        }

        // ⚠️ Түр тест OTP
        const otp = "123456";
        otpStore.set(clean(phone), otp);

        console.log("✅ OTP:", phone, otp);
        return res.json({ success: true });
    } catch (e) {
        console.error("SEND OTP ERROR:", e);
        return res.json({ success: false, message: "Server алдаа" });
    }
});

// ===== VERIFY OTP (ЗӨВХӨН ХҮЧИНТЭЙ ГИШҮҮНЧЛЭЛТЭЙ ХҮНД) =====
app.get("/verify-otp", async (req, res) => {
    try {
        const { phone, otp } = req.query;

        const p = clean(phone);
        const o = clean(otp);

        if (!p || !o) return res.json({ success: false, message: "Мэдээлэл дутуу" });

        if (!otpStore.has(p)) return res.json({ success: false, message: "OTP хугацаа дууссан" });
        if (otpStore.get(p) !== o) return res.json({ success: false, message: "OTP код буруу" });

        // OTP зөв бол устгана
        otpStore.delete(p);

        const found = await findUserByPhone(p);
        if (!found) return res.json({ success: false, message: "Бүртгэлгүй хэрэглэгч" });

        const membership = clean(found._rawData?.[7]);
        if (!isMembershipActive(membership)) {
            return res.json({ success: false, message: "Нэвтрэх эрх дууссан байна" });
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
                membership: membership, // H багана
            },
        });
    } catch (e) {
        console.error("VERIFY OTP ERROR:", e);
        return res.json({ success: false, message: "Server алдаа" });
    }
});

// ✅ Render дээр ажиллуулах
app.listen(PORT, () => {
    console.log(`🚀 Backend running on port ${PORT}`);
});