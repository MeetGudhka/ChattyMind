import express from 'express';
import mongoose from 'mongoose';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

if (!process.env.GEMINI_API_KEY) {
  console.warn("WARNING: GEMINI_API_KEY is not set in environment variables. AI features will fail.");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy_key");

// Helper function to sequentially try models if one hits a quota limit or region restriction
async function generateWithFallback(prompt, temperature = 0.7, isJson = false) {
  // STRICT REQUIREMENT: Only use stable, globally-supported models.
  const models = [
    'gemini-1.5-flash',
    'gemini-1.5-pro'
  ];
  let lastError;
  
  for (const modelName of models) {
    try {
      console.log(`[AI] Attempting generation with model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const config = { temperature };
      if (isJson) config.responseMimeType = "application/json";

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: config
      });
      
      return result.response.text().trim();
    } catch (error) {
      console.warn(`[AI Fallback] Model ${modelName} failed. Error:`, error.message);
      lastError = error;
      // Continue to the next model in the array
    }
  }
  
  console.error('[AI Error] All fallback models failed. Last error:', lastError?.message);
  throw lastError; // If all models fail, throw the final error
}

router.post('/suggest', async (req, res) => {
  try {
    const { text, tone = 'Professional', context = [] } = req.body;

    if (!text || text.trim().length < 3) {
      return res.json({ suggestions: [] });
    }

    const contextString = context.length > 0
      ? `Recent conversation context:\n${context.map(c => `${c.sender}: ${c.text}`).join('\n')}\n`
      : "";

    const prompt = `
You are a real-time AI writing assistant for a chat application.
Your task is to take the user's current draft message and provide exactly 2 improved alternative ways to say it.
The output MUST be in a specific tone: ${tone}.
Maintain the original meaning but improve clarity, grammar, and adapt to the requested tone.
If the input is Hinglish (Hindi written in English) or pure Hindi, translate or improve it in well-structured English while keeping the tone.

${contextString}
User's draft message: "${text}"

Provide EXACTLY 2 distinct suggestions. 
IMPORTANT: Your response must be NOTHING BUT a raw JSON array of 2 strings. Do not include markdown formatting, backticks, or any conversational text.
Example: ["Suggestion 1", "Suggestion 2"]
`;

    const responseText = await generateWithFallback(prompt, 0.7, true);

    let suggestions = [];
    try {
      suggestions = JSON.parse(responseText);
    } catch (e) {
      console.warn("[AI Parse Warning] Failed to parse JSON, attempting manual extraction.", e.message);
      suggestions = responseText
        .split('\n')
        .map(s => s.replace(/^\d+\.\s*/, '').replace(/^-\s*/, '').replace(/^"|"$/g, '').replace(/\[|\]/g, '').trim())
        .filter(s => s.length > 0);
    }

    if (!Array.isArray(suggestions)) suggestions = [suggestions];

    res.status(200).json({ suggestions: suggestions.slice(0, 2) });
  } catch (error) {
    console.error("[AI Route Error] /suggest route failed:", error.message);
    res.status(500).json({
      error: 'Failed to generate suggestions.',
      suggestions: [
        `[Fallback Error] ${error.message || 'Check terminal logs'}`,
        `Please ensure GEMINI_API_KEY is configured correctly.`
      ]
    });
  }
});

router.post('/translate', async (req, res) => {
  try {
    const { text, targetScript } = req.body;
    if (!text || text.trim() === '') return res.json({ text: '' });

    const prompt = `
You are a highly accurate script transliteration assistant for a chat application.
The user wants to convert the script/letters of the following text into exactly: ${targetScript}.
CRITICAL RULES:
1. DO NOT translate the language. DO NOT change the meaning or the spoken words.
2. ONLY convert the alphabet/script/letters to the requested target.
3. If the target is "English Letters", write the exact same pronunciation using the English alphabet (Romanization).
4. If target is "Hindi Letters" or "Marathi Letters", output in Devanagari script.
5. If target is "Gujarati Letters", output in Gujarati script.
6. Only return the final converted string. Do not add quotes, explanations, or any conversational text.

Text to convert: "${text}"
`;

    const translatedText = await generateWithFallback(prompt, 0.3);
    res.status(200).json({ text: translatedText });
  } catch (error) {
    console.error("[AI Route Error] /translate route failed:", error.message);
    res.status(500).json({ error: 'Failed to translate message script.', details: error.message });
  }
});

router.post('/translate-language', async (req, res) => {
  try {
    const { text, targetLanguage } = req.body;
    if (!text || text.trim() === '') return res.json({ text: '' });

    const prompt = `
You are a highly accurate translation assistant for a chat application.
Translate the following text into exactly: ${targetLanguage}.
CRITICAL RULES:
1. Translate the meaning of the text accurately and naturally.
2. Only return the final translated string. Do not add quotes, explanations, or any conversational text.

Text to translate: "${text}"
`;

    const translatedText = await generateWithFallback(prompt, 0.3);
    res.status(200).json({ text: translatedText });
  } catch (error) {
    console.error("[AI Route Error] /translate-language route failed:", error.message);
    res.status(500).json({ error: 'Failed to translate message language.', details: error.message });
  }
});

router.post('/refine', async (req, res) => {
  try {
    const { text, action } = req.body;
    if (!text || text.trim() === '') return res.json({ text: '' });

    let actionPrompt = "";
    if (action === "Shorter") {
      actionPrompt = "Make the text shorter, more concise, and to the point.";
    } else if (action === "Polite") {
      actionPrompt = "Rewrite the text to be much more polite, respectful, and courteous.";
    } else if (action === "Clarity") {
      actionPrompt = "Improve the clarity, grammar, and flow of the text so it's very easy to understand.";
    } else {
      actionPrompt = "Enhance the text generally.";
    }

    const prompt = `
You are a highly capable writing assistant for a chat application.
The user wants you to apply the following action to their draft message: "${actionPrompt}"

CRITICAL RULES:
1. ONLY return the final perfectly rewritten string. 
2. Do not add quotes, formatting, explanations, or conversational text.
3. Preserve the core meaning of the original message.

Text to refine: "${text}"
`;

    const refinedText = await generateWithFallback(prompt, 0.4);
    res.status(200).json({ text: refinedText });
  } catch (error) {
    console.error("[AI Route Error] /refine route failed:", error.message);
    res.status(500).json({ error: 'Failed to refine message.', details: error.message });
  }
});

router.post('/analyze-persona', async (req, res) => {
  try {
    const { userId } = req.body;
    const Message = mongoose.model('Message');
    const userObjectId = new mongoose.Types.ObjectId(userId);
    
    // Fetch last 50 sent messages for analysis
    const sentMessages = await Message.find({ senderId: userObjectId })
      .sort({ createdAt: -1 })
      .limit(50)
      .select('text');

    if (!sentMessages || sentMessages.length < 5) {
      return res.status(200).json({ 
        error: "Not enough messages sent yet to build a persona profile. Keep chatting!",
        persona: null 
      });
    }

    const messagesText = sentMessages.map(m => m.text).join('\n---\n');

    const prompt = `
You are an expert communication analyst. 
Analyze the following messages sent by a user and build a communication persona profile.

Messages:
${messagesText}

Based on these messages, provide:
1. Tone Breakdown (Percentage split across: Professional, Casual, Friendly, Sarcastic).
2. Overall Sentiment Score (1-100, where 100 is extremely positive/enthusiastic).
3. A short "Persona Title" (e.g., The Diplomat, The Direct Leader, The Friendly Neighbor).
4. A 2-sentence summary of their communication style.

IMPORTANT: Your response must be NOTHING BUT a raw JSON object with this exact structure:
{
  "personaTitle": "string",
  "summary": "string",
  "sentimentScore": number,
  "toneBreakdown": [
    { "name": "Professional", "value": number },
    { "name": "Casual", "value": number },
    { "name": "Friendly", "value": number },
    { "name": "Sarcastic", "value": number }
  ]
}
`;

    const responseText = await generateWithFallback(prompt, 0.4, true);
    const analysis = JSON.parse(responseText);
    
    res.status(200).json(analysis);
  } catch (error) {
    console.error("[AI Route Error] /analyze-persona route failed:", error.message);
    res.status(500).json({ error: 'Failed to analyze communication persona.', details: error.message });
  }
});

export default router;
