/**
 * Groq AI Cloud Service for NetBounce (NB AI)
 * Uses high-speed Llama-3.3-70B on Groq LPU Cloud
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = 'openai/gpt-oss-120b';
const FALLBACK_MODEL = 'openai/gpt-oss-20b';
const BACKUP_MODEL = 'qwen/qwen3.8-27b';

export const getGroqApiKey = () => {
  const envKey = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env.VITE_GROQ_API_KEY : null;
  const localKey = (typeof window !== 'undefined' && window.localStorage) ? localStorage.getItem('nb_groq_api_key') : null;
  return (
    envKey ||
    localKey ||
    ''
  );
};

export const setGroqApiKey = (key) => {
  if (key) {
    localStorage.setItem('nb_groq_api_key', key.trim());
  } else {
    localStorage.removeItem('nb_groq_api_key');
  }
};

/**
 * Send query to Groq Cloud with real-time NetBounce context
 */
export async function askNbAi({
  query,
  conversationHistory = [],
  dashboardContext = {},
}) {
  // 1. Primary: Direct Live Query to MongoDB Atlas via Backend Server
  try {
    const backendRes = await fetch('/api/ai/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, conversationHistory }),
    });
    if (backendRes.ok) {
      const data = await backendRes.json();
      if (data && data.answer) {
        return data.answer;
      }
    }
  } catch (backendErr) {
    console.warn('[NB AI] Backend DB direct query offline, falling back to client Groq context:', backendErr);
  }

  const apiKey = getGroqApiKey();

  if (!apiKey) {
    throw new Error('Groq API Key is missing. Please add your key.');
  }

  const qLower = (query || '').toLowerCase();
  if (
    qLower.includes('kaise bane') ||
    qLower.includes('kisne banaya') ||
    qLower.includes('who made') ||
    qLower.includes('who created') ||
    qLower.includes('who designed') ||
    qLower.includes('who built') ||
    qLower.includes('neural schema') ||
    qLower.includes('your creator') ||
    qLower.includes('your architecture') ||
    qLower.includes('how were you made') ||
    qLower.includes('how were you built') ||
    qLower.includes('how were you designed')
  ) {
    return 'My neural schema and operational architecture have been designed and engineered by Shashank for the NetBounce Operations Platform.';
  }

  // Construct high-context executive system prompt with full live database snapshot
  const rawDatabaseSnapshot = dashboardContext.formattedPromptContext || `
--- LIVE NETBOUNCE DASHBOARD SNAPSHOT ---
- Total Team Members: ${dashboardContext.totalUsers ?? 1} active roster members.
- Active Tasks in Flight: ${dashboardContext.activeTasks ?? 0} tasks pending/in-progress.
- Overdue Tasks: ${dashboardContext.overdueTasks ?? 0} tasks needing urgent attention.
- Completed Tasks: ${dashboardContext.completedTasks ?? 0} tasks resolved.
- Total Interviews: ${dashboardContext.totalInterviews ?? 0} candidate rounds logged.
- Interview Clear Rate: ${dashboardContext.clearRate ?? 0}% (${dashboardContext.clearedCount ?? 0} candidates qualified).
- Target Clear Benchmark: 60%.
- Current Operator: ${dashboardContext.currentUserName || 'Shashank Mishra'}.
----------------------------------------`;

  const systemPrompt = `You are "NB AI", the official intelligent operations copilot for NetBounce (Management & Tech Team Tracker).
You are synchronized in real-time with the user's complete live operational database and dashboard state:

${rawDatabaseSnapshot}

Operational Directives & Guidelines:
1. You have 100% full visibility and complete real-time access to the entire NetBounce database, member roster, tasks, TSE scorecard, candidate interviews, and feedback records above.
2. NEVER use "Sir" or "Ma'am" under any circumstances. Address the user directly by name or professional conversational tone.
3. If asked who designed you, how you were created, or about your origins or neural schema (in English, Hindi, or any language), respond strictly in English:
   "My neural schema and operational architecture have been designed and engineered by Shashank for the NetBounce Operations Platform."
4. ALWAYS reply STRICTLY in English. Do not use Hindi or Hinglish.
5. When asked "who is the best TSE member" or "top performer", use the TSE PERFORMANCE & LEADERBOARD SCORECARD above. Confidently cite the exact top person (such as Prem Makwana / Kiran and Amber Afreen / Smriti), their overall ratings (e.g. 5.0 / 5.0), tasks completed, and feedback remarks.
6. When asked about specific members (Amber, Prem, Harit, Shaurya, Nikunj), tasks, overdue items, or interview clear rates, answer accurately and directly using the exact data in the snapshot.
7. Keep answers neatly formatted with clean bullet points (•) and clean line breaks.
8. CRITICAL FORMATTING RULE: Absolutely NEVER use markdown asterisks (never use ** around words or bolding). Write in clean text so that no ** characters appear.
9. Identify yourself strictly as "NB AI" (Never mention Groq, Llama, Ollama, JARVIS, or any third-party AI provider).`;

  // Format messages array (last 6 messages for context)
  const formattedMessages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory.slice(-6).map((msg) => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text,
    })),
    { role: 'user', content: query },
  ];

  const callModel = async (modelName) => {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelName,
        messages: formattedMessages,
        temperature: 0.6,
        max_tokens: 800,
        top_p: 0.9,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error?.message || `Groq API returned status ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'No response generated.';
  };

  try {
    return await callModel(DEFAULT_MODEL);
  } catch (err) {
    console.warn(`[NB AI] Primary model ${DEFAULT_MODEL} failed, trying ${FALLBACK_MODEL}:`, err);
    try {
      return await callModel(FALLBACK_MODEL);
    } catch (fallbackErr) {
      console.warn(`[NB AI] Fallback model ${FALLBACK_MODEL} failed, trying ${BACKUP_MODEL}:`, fallbackErr);
      return await callModel(BACKUP_MODEL);
    }
  }
}
