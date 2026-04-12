import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
async function run() {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{role: "user", content: "say exactly the word: hello"}],
      max_tokens: 10
    });
    console.log("Success:", response.choices[0].message.content);
  } catch(e) {
    console.error("Error:", e.message);
  }
}
run();
