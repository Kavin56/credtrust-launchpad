import { GoogleGenAI } from "@google/genai";

const SYSTEM_PROMPT = `You are Sharanam Assistant, a helpful and friendly customer support chatbot for Sharanam Multi State Cooperative Credit Society Ltd.

About Sharanam:
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
const SUPPORT_LINE = "For exact assistance, call 1800 425 1444 or 1800 572 8031.";

const FAQ_FALLBACKS: Array<{ pattern: RegExp; response: string }> = [
  {
    pattern: /\b(open|create|start).*(savings account)|\bsavings account\b/i,
    response:
      "To open a savings account with Sharanam Multi State Cooperative Credit Society, you need to complete member onboarding, submit your KYC details, and provide basic documents such as ID proof, address proof, PAN, photo, and contact details. Once verification is completed, your savings account can be activated. For branch-specific requirements, call 1800 425 1444 or 1800 572 8031.",
  },
  {
    pattern: /\bloan\b.*\binterest\b|\binterest\b.*\bloan\b/i,
    response:
      "Loan interest rates at Sharanam depend on the loan product, requested amount, tenure, and your eligibility profile. The exact rate is usually confirmed during the application and approval process. For the latest applicable rate on your loan type, please check with the loan desk or call 1800 425 1444 or 1800 572 8031.",
  },
  {
    pattern: /\bdeposit\b.*\bmaturity\b|\bmaturity\b.*\bdeposit\b/i,
    response:
      "You can check your deposit maturity details from your member account dashboard after signing in. Look for the deposit section to view maturity amount, maturity date, and scheme details. If you need help locating it or confirming a maturity value, call 1800 425 1444 or 1800 572 8031.",
  },
  {
    pattern: /\bdocuments?\b.*\bmembership\b|\bmembership\b.*\bdocuments?\b/i,
    response:
      "Membership usually requires identity proof, address proof, PAN, a passport-size photo, and basic contact details. Additional documents may be requested depending on the membership category or compliance checks. For the exact list applicable to your case, call 1800 425 1444 or 1800 572 8031.",
  },
];

function getFaqFallback(message: string): string | null {
  const match = FAQ_FALLBACKS.find((item) => item.pattern.test(message));
  return match?.response ?? null;
}

function isLikelyIncompleteResponse(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return true;
  if (/[.!?]["')\]]?$/.test(trimmed)) return false;

  const lastWord = trimmed.split(/\s+/).pop()?.toLowerCase() ?? "";
  const danglingWords = new Set([
    "a",
    "an",
    "and",
    "at",
    "because",
    "by",
    "for",
    "from",
    "if",
    "in",
    "of",
    "on",
    "or",
    "the",
    "to",
    "with",
    "you",
    "your",
  ]);

  return trimmed.length < 80 || danglingWords.has(lastWord);
}

function finalizeAssistantResponse(userMessage: string, responseText: string): string {
  const fallback = getFaqFallback(userMessage);

  if (isLikelyIncompleteResponse(responseText) && fallback) {
    return fallback;
  }

  if (!responseText.trim()) {
    return fallback ?? `I'm sorry, I couldn't process that request. ${SUPPORT_LINE}`;
  }

  return responseText.trim();
}

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

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function sendMessage(
  message: string,
  sessionId: string = "default"
): Promise<string> {
  const apiKey = getApiKey();
  const faqFallback = getFaqFallback(message);

  if (!apiKey) {
    console.error("VITE_GEMINI_API_KEY is missing. Check your .env file and restart the dev server.");
    return faqFallback ?? `Chat is currently unavailable. ${SUPPORT_LINE}`;
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

  const MAX_RETRIES = 3;
  let retryCount = 0;

  while (retryCount <= MAX_RETRIES) {
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

      const text = finalizeAssistantResponse(
        message,
        response.text || "I'm sorry, I couldn't process that. Please try again.",
      );
      history.push({ role: "model", content: text });

      if (history.length > 20) {
        chatHistories.set(sessionId, history.slice(-20));
      }

      return text;
    } catch (error: any) {
      const isRetryable = error?.message?.includes("503") || 
                        error?.message?.includes("Service Unavailable") || 
                        error?.message?.includes("CAPACITY_EXHAUSTED") ||
                        error?.status === 503;

      if (isRetryable && retryCount < MAX_RETRIES) {
        retryCount++;
        const backoff = Math.pow(2, retryCount) * 1000;
        console.warn(`Gemini API busy (503/Capacity). Retrying in ${backoff}ms... (Attempt ${retryCount}/${MAX_RETRIES})`);
        await delay(backoff);
        continue;
      }

      console.error("Gemini API error after retries:", error?.message || error);

      if (error?.message?.includes("API_KEY_INVALID") || error?.message?.includes("invalid API key")) {
        return "Invalid API key. Please check your VITE_GEMINI_API_KEY in the .env file.";
      }

      if (
        error?.message?.includes("CAPACITY_EXHAUSTED") ||
        error?.message?.includes("RESOURCE_EXHAUSTED") ||
        error?.message?.includes("quota") ||
        error?.status === 429 ||
        error?.status === 503
      ) {
        return faqFallback ?? `Our Smart Assistant is experiencing high demand right now. ${SUPPORT_LINE}`;
      }

      if (error?.message?.includes("not found") || error?.message?.includes("404")) {
        return faqFallback ?? "Model not available. The AI service may be temporarily unavailable.";
      }

      return faqFallback ?? `Sorry, I encountered an error: ${error?.message || "Unknown error"}. ${SUPPORT_LINE}`;
    }
  }
  
  return faqFallback ?? `I'm having trouble connecting to my brain right now. ${SUPPORT_LINE}`;
}

export function clearChatHistory(sessionId: string = "default"): void {
  chatHistories.delete(sessionId);
}
