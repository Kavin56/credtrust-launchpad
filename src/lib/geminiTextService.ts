import { GoogleGenAI } from "@google/genai";

const SYSTEM_PROMPT = `You are CredTrust Assistant, a helpful and friendly customer support chatbot for CredTrust Cooperative Society Ltd.

About CredTrust:
- A Credit Cooperative Society offering savings accounts, fixed deposits, recurring deposits, loans, and financial services
- Services include: Member Management, Deposit Management (RD, FD, Savings), Loan Management, Accounting & Finance, Dividend Distribution
- Toll-free numbers: 1800 425 1444, 1800 572 8031
- Member portal for account access

Guidelines:
- Be concise, professional, and friendly
- Help with general questions about deposits, loans, accounts, membership
- For account-specific queries, direct members to login to the member portal or call toll-free numbers
- Keep responses under 150 words
- Use simple language
- If unsure, recommend contacting customer support`;

const chatHistories = new Map<string, Array<{ role: string; content: string }>>();

function getApiKey(): string | undefined {
  return import.meta.env.VITE_GEMINI_API_KEY;
}

function getAI(): GoogleGenAI {
  const key = getApiKey();
  if (!key) {
    throw new Error("VITE_GEMINI_API_KEY is not set");
  }
  return new GoogleGenAI({ apiKey: key });
}

export async function sendMessage(
  message: string,
  sessionId: string = "default"
): Promise<string> {
  const apiKey = getApiKey();

  if (!apiKey) {
    console.error("VITE_GEMINI_API_KEY is missing. Check your .env file and restart the dev server.");
    return "Chat is currently unavailable. Please call our toll-free numbers: 1800 425 1444 or 1800 572 8031 for assistance.";
  }

  if (!chatHistories.has(sessionId)) {
    chatHistories.set(sessionId, []);
  }

  const history = chatHistories.get(sessionId)!;
  history.push({ role: "user", content: message });

  const recentHistory = history.slice(-10);

  const contents = recentHistory.map((msg) => ({
    role: msg.role,
    parts: [{ text: msg.content }],
  }));

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7,
        maxOutputTokens: 300,
      },
    });

    const text = response.text || "I'm sorry, I couldn't process that. Please try again.";

    history.push({ role: "model", content: text });

    if (history.length > 20) {
      chatHistories.set(sessionId, history.slice(-20));
    }

    return text;
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Gemini API error:", err?.message || error);

    if (err?.message?.includes("API_KEY_INVALID") || err?.message?.includes("invalid API key")) {
      return "Invalid API key. Please check your VITE_GEMINI_API_KEY in the .env file.";
    }
    if (err?.message?.includes("not found") || err?.message?.includes("404")) {
      return "Model not available. The AI service may be temporarily unavailable.";
    }

    return `Sorry, I encountered an error: ${err?.message || "Unknown error"}. Please call 1800 425 1444 for help.`;
  }
}

export function clearChatHistory(sessionId: string = "default"): void {
  chatHistories.delete(sessionId);
}
