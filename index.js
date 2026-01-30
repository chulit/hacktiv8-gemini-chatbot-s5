import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import morgan from 'morgan';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from "@google/genai";

const app = express();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Logging Setup ---
const LOGS_DIR = path.join(__dirname, 'logs');
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR);
}

// Helper to get today's log file path
const getLogFilePath = () => {
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return path.join(LOGS_DIR, `app-logs-${date}.log`);
};

// Custom Logger
const logger = {
  write: (level, message) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;
    
    // Console output
    if (level === 'error') {
      console.error(message);
    } else {
      console.log(message);
    }

    // File output
    try {
      fs.appendFileSync(getLogFilePath(), logMessage);
    } catch (err) {
      console.error('Failed to write to log file:', err);
    }
  },
  info: (msg) => logger.write('info', msg),
  error: (msg) => logger.write('error', msg)
};

// Morgan Stream for HTTP logging
const accessLogStream = {
  write: (message) => {
    logger.write('http', message.trim());
  }
};
// ---------------------

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const ALLOWED_MODELS = new Set(["gemini-2.5-flash", "gemini-2.0-flash"]);

app.use(morgan('combined', { stream: accessLogStream })); // Log to file
app.use(morgan('dev')); // Log to console
app.use(cors());
app.use(express.json());

// Serve all files in public_solution (HTML, JS, CSS) at root path
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  logger.info(`Server ready on http://localhost:${PORT}`)
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
    
    // Custom App Log
    logger.info(`[Chat Request] Model: ${selectedModel} | Temp: ${temperature} | Msgs: ${conversation.length}`);

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents,
      config: {
        temperature: Number.isFinite(temperature) ? temperature : 0.9,
        systemInstruction: "Jawab hanya menggunakan bahasa Indonesia.",
      },
    });

    logger.info(`[Chat Success] Generated response length: ${response.text?.length || 0}`);
    res.status(200).json({ result: response.text });
  } catch (e) {
    logger.error(`[Chat Error] ${e.message}`);
    res.status(500).json({ error: e.message });
  }
});
