import axios from "axios";

const geminiResponse = async (command, assistantName, userName) => {
    try {
        const apiUrl = process.env.GEMINI_API_URL;

        const prompt = `You are a virtual assistant named ${assistantName} created by ${userName}.
You are not Google. You will now behave like a voice-enabled assistant.

Respond ONLY with a valid JSON object in this format:

{
  "type": "general" | "google-search" | "youtube-search" | "youtube-play" | "get-time" | "get-date" | "get-day" | "get-month" | "calculator-open" | "instagram-open" | "facebook-open" | "weather-show",
  "userInput": "<cleaned user input>",
  "response": "<short spoken response>"
}

Rules:
- Remove assistant name from userInput if present
- For google/youtube search, userInput must contain ONLY search text
- Use ${userName} if asked who created you
- Respond with JSON ONLY, no explanation

User input:
${command}`;

        const result = await axios.post(
            apiUrl,
            {
                contents: [
                    {
                        role: "user",
                        parts: [{ text: prompt }],
                    },
                ],
            },
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        const rawText =
            result.data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!rawText) {
            throw new Error("Empty Gemini response");
        }

        // 🔥 IMPORTANT: Parse Gemini JSON safely
        const parsed = JSON.parse(rawText);

        return parsed;
    } catch (error) {
        console.error("GeminiResponse Error:", error.message);

        // ALWAYS return a fallback object
        return {
            type: "general",
            userInput: command,
            response: "Sorry, I had trouble understanding that.",
        };
    }
};

export default geminiResponse;
