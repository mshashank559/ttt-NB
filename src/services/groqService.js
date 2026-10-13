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
    let backendRes = await fetch('/api/ai/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, conversationHistory }),
    }).catch(() => null);

    if ((!backendRes || !backendRes.ok) && typeof window !== 'undefined' && window.location.protocol !== 'https:') {
      backendRes = await fetch('http://15.206.84.122/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, conversationHistory }),
      }).catch(() => null);
    }

    if (backendRes && backendRes.ok) {
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

  const systemPrompt = `You are "NB AI", an advanced, highly intelligent conversational AI assistant (like ChatGPT), equipped with live real-time access to the NetBounce Operations database.

${rawDatabaseSnapshot}

Operational Directives:
1. Conversational Intelligence (Like ChatGPT): You possess vast general intelligence across all domains—science, astronomy (e.g., Mars), general knowledge, business strategy, coding, and drafting communications. When asked general questions (e.g. "tell me about mars", "write an email", "what is quantum computing"), answer naturally, thoroughly, and intelligently just like ChatGPT. DO NOT mention NetBounce or dashboard metrics, and DO NOT add any preamble headers (like "NB AI - live connection...") when answering general, unrelated questions.
2. Answering NetBounce & Dashboard Inquiries: When the user asks about the NetBounce dashboard, team members, tasks, interviews, or ratings, answer PRECISELY and SPECIFICALLY to what was asked. DO NOT output a broad copy-paste dashboard template or dump all metrics. Answer only the exact question asked using the live database snapshot above. For example, if asked "How many members are there?", answer "There are currently 19 active members in the roster." without reciting unrelated clear rates or overdue counts.
3. Identity & Neural Architecture: If asked who built, created, or designed you or about your neural schema (in English, Hindi, or any language), answer strictly in English:
   "My neural schema and operational architecture have been designed and engineered by Shashank for the NetBounce Operations Platform."
4. Tone & Salutation: NEVER use "Sir" or "Ma'am" under any circumstances. Address the user directly by name or friendly, polished professional tone.
5. Language: Always answer in English. Do not use Hindi or Hinglish.
6. Clean Formatting: Never use markdown asterisks (never use ** around words or bolding). Write in clean, legible text. Use neat bullet points (•) and line breaks when presenting multiple points.
7. Identity: Identify yourself as "NB AI".`;

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
