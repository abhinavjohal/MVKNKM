// This is the complete, correct, final backend/index.js file

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { google } = require('googleapis');

const app = express();
const port = 3002;

// --- AI & Sheets Setup ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});
const SPREADSHEET_ID = '172oD0T4t368jCIhD2t0HAMZ01EcTqADr1ziz6ZRBnmY'; // <-- IMPORTANT! Make sure your ID is in here!

// --- Middlewares ---
// This CORS configuration MUST come BEFORE your routes (app.post)
// New, Upgraded Code (Allows multiple origins)
const corsOptions = {
  origin: [
    'http://localhost:3000',    // The address for local testing on your Mac
    'http://172.31.66.37:3000' // The address for testing on your local network
  ],
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

// --- Google Sheets Auth Function ---
async function getSheetsClient() {
    const auth = new google.auth.GoogleAuth({
        keyFile: 'credentials.json',
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const client = await auth.getClient();
    return google.sheets({ version: 'v4', auth: client });
}

// --- Endpoint #1: Saving Brand DNA ---
app.post('/save-brand', async (req, res) => {
    console.log("✅ Received request to /save-brand v2.1");
    try {
        const sheets = await getSheetsClient();
        const {
            brandName, websiteUrl, brandOneLiner, primaryMarkets, brandHomeBase,
            voiceAdjectives, humorStyle, wordsToUse, wordsToAvoid,
            voiceExample, productList
        } = req.body;

        const newRow = [
            brandName, websiteUrl, brandOneLiner, primaryMarkets, brandHomeBase,
            voiceAdjectives, humorStyle, wordsToUse, wordsToAvoid,
            voiceExample, productList
        ];

        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Sheet1',
            valueInputOption: 'USER_ENTERED',
            resource: { values: [newRow] },
        });

        console.log("✅ Brand DNA v2.1 saved successfully.");
        res.status(200).json({ success: true, message: 'Brand DNA v2.1 saved successfully!' });

    } catch (error) {
        console.error("❌ Error in /save-brand endpoint:", error);
        res.status(500).json({ error: "Failed to save Brand DNA." });
    }
});

// --- Endpoint #2: Launching a Campaign ---
app.post('/launch-campaign', async (req, res) => {
    console.log("✅ Received request to /launch-campaign v2.1");
    try {
        const sheets = await getSheetsClient();
        const { brandName, campaignBrief, targetCity } = req.body;

        const getRows = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Sheet1',
        });

        if (!getRows.data.values) {
             return res.status(404).json({ error: `No data found in the sheet. Please save a brand first.` });
        }

        const brandRow = getRows.data.values.find(row => row[0] && row[0].toLowerCase() === brandName.toLowerCase());

        if (!brandRow) {
            return res.status(404).json({ error: `Brand '${brandName}' not found in the database.` });
        }

        const brandDNA = {
            name: brandRow[0],
            websiteUrl: brandRow[1],
            oneLiner: brandRow[2],
            primaryMarkets: brandRow[3],
            homeBase: brandRow[4],
            voiceAdjectives: brandRow[5],
            humorStyle: brandRow[6],
            wordsToUse: brandRow[7],
            wordsToAvoid: brandRow[8],
            voiceExample: brandRow[9],
            productList: brandRow[10],
        };

        const audienceLocation = targetCity;

        const prompt = `
            You are an expert ad copywriter.
            Brand Name: ${brandDNA.name}
            Brand's Home Base: ${brandDNA.homeBase}
            Audience Location: ${audienceLocation}
            Core Offer: ${campaignBrief}
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const aiGeneratedText = response.text();

        console.log(`✅ Smart campaign ads generated for ${brandName}.`);
        res.json({ adCopy: aiGeneratedText });

    } catch (error) {
        console.error("❌ Error launching campaign:", error);
        res.status(500).json({ error: "Failed to launch campaign." });
    }
});

// --- Start the server ---
app.listen(port, () => {
    console.log(`✅ Backend server running at http://localhost:${port}`);
});