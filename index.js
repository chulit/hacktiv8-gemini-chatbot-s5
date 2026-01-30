import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from "@google/genai";

const app = express();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const ALLOWED_MODELS = new Set(["gemini-2.5-flash", "gemini-2.0-flash"]);

app.use(cors());
app.use(express.json());

// Serve all files in public_solution (HTML, JS, CSS) at root path
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server ready on http://localhost:${PORT}`)
);

app.post('/api/chat', async (req, res) => {
  const { conversation, model } = req.body;

  try {
    if (!Array.isArray(conversation)) {
      throw new Error('Messages must be an array!');
    }

    const contents = conversation.map(({ role, text }) => {
      if (!text) {
        throw new Error('Message text is required for all conversation parts.');
      }
      return {
        role,
        parts: [{ text }]
      };
    });

    const selectedModel = ALLOWED_MODELS.has(model) ? model : GEMINI_MODEL;
    const temperature = Number.parseFloat(process.env.GEMINI_TEMPERATURE ?? "0.9");

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents,
      config: {
        temperature: Number.isFinite(temperature) ? temperature : 0.9,
        systemInstruction: "Jawab hanya menggunakan bahasa Indonesia.",
      },
    });

    res.status(200).json({ result: response.text });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
