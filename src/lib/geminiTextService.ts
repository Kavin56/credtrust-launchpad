import { GoogleGenAI } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.warn("VITE_GEMINI_API_KEY is not set. Chat widget will not function.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || "" });

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

export async function sendMessage(
  message: string,
  sessionId: string = "default"
): Promise<string> {
  if (!apiKey) {
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
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
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
  } catch (error) {
    console.error("Gemini API error:", error);
    return "I'm experiencing a technical issue. Please call our toll-free numbers: 1800 425 1444 or 1800 572 8031 for immediate assistance.";
  }
}

export function clearChatHistory(sessionId: string = "default"): void {
  chatHistories.delete(sessionId);
}
