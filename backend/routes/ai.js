import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy_key");

// Helper function to sequentially try models if one hits a quota limit
async function generateWithFallback(prompt, temperature = 0.7, isJson = false) {
  const models = [
    'gemini-3.1-flash-lite',
    'gemini-2.5-flash-lite',
    'gemini-3.0-flash',
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-1.5-flash-8b',
    'gemini-1.5-pro',
    'gemini-1.0-pro',
    'gemini-pro'
  ];
  let lastError;
  
  for (const modelName of models) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const config = { temperature };
      if (isJson) config.responseMimeType = "application/json";

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: config
      });
      return result.response.text().trim();
    } catch (error) {
      console.log(`[AI Fallback] ${modelName} failed, trying next... Error:`, error.message);
      lastError = error;
    }
  }
  
  throw lastError; // If all models fail (e.g. invalid API key), throw the final error
}

router.post('/suggest', async (req, res) => {
  try {
    const { text, tone = 'Professional', context = [] } = req.body;

    if (!text || text.trim().length < 3) {
      return res.json({ suggestions: [] });
    }

    // Format context to feed AI if available
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
      // Fallback if AI didn't return perfectly formatted JSON
      suggestions = responseText
        .split('\n')
        .map(s => s.replace(/^\d+\.\s*/, '').replace(/^-\s*/, '').replace(/^"|"$/g, '').replace(/\[|\]/g, '').trim())
        .filter(s => s.length > 0);
    }

    if (!Array.isArray(suggestions)) suggestions = [suggestions];

    res.json({ suggestions: suggestions.slice(0, 2) });
  } catch (error) {
    console.error("Gemini AI suggestion error:", error);

    // Fallback mock to prove UI works even if API fails
    res.json({
      suggestions: [
        `[Fallback] Gemini Error: ${error.message || 'Check terminal logs'}`,
        `Make sure your GEMINI_API_KEY is correctly set in backend/.env`,
        `The vertical suggestions UI is communicating properly!`
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
    res.json({ text: translatedText });
  } catch (error) {
    console.error("Gemini AI translation error:", error);
    res.status(500).json({ error: 'Failed to translate message.' });
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
    res.json({ text: translatedText });
  } catch (error) {
    console.error("Gemini AI language translation error:", error);
    res.status(500).json({ error: 'Failed to translate message.' });
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
    res.json({ text: refinedText });
  } catch (error) {
    console.error("Gemini AI refinement error:", error);
    res.status(500).json({ error: 'Failed to refine message.' });
  }
});

export default router;

