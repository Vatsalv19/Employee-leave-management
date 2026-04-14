const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash-lite";

function resolveGeminiModelName() {
  const rawModel = (import.meta.env.VITE_GEMINI_MODEL || DEFAULT_GEMINI_MODEL).trim();
  if (!rawModel) {
    return DEFAULT_GEMINI_MODEL;
  }

  // Accept friendly names such as "Gemini 2.5 Flash" and normalize to API slug format.
  const normalized = rawModel
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/_/g, "-");

  if (normalized === "gemini-2.5-flash-lite") {
    return normalized;
  }

  // Guard against invalid strings and keep the app operational.
  if (!/^gemini-[a-z0-9.-]+$/.test(normalized)) {
    return DEFAULT_GEMINI_MODEL;
  }

  return normalized;
}

function getGeminiApiKey() {
  return (import.meta.env.VITE_GEMINI_API_KEY || "").trim();
}

function buildContextPayload(currentUser, contextData) {
  const balances = (contextData.userBalances || []).map((balance) => {
    const leaveType = (contextData.leaveTypes || []).find((type) => type.id === balance.leaveTypeId);
    const remaining = (balance.totalAllocated || 0) + (balance.carriedOver || 0) - (balance.used || 0) - (balance.pending || 0);

    return {
      leaveTypeId: balance.leaveTypeId,
      leaveTypeName: leaveType?.name || "Unknown",
      totalAllocated: balance.totalAllocated || 0,
      used: balance.used || 0,
      pending: balance.pending || 0,
      carriedOver: balance.carriedOver || 0,
      remaining,
    };
  });

  return {
    employee: {
      id: currentUser?.id || null,
      firstName: currentUser?.firstName || "",
      lastName: currentUser?.lastName || "",
      role: currentUser?.role || "employee",
      departmentId: currentUser?.departmentId || null,
    },
    leaveBalances: balances,
    leaveRequests: contextData.userLeaves || [],
    holidays: contextData.holidays || [],
    leaveTypes: contextData.leaveTypes || [],
  };
}

function toGeminiHistory(history) {
  return history
    .filter((msg) => (msg?.role === "user" || msg?.role === "ai") && String(msg?.text || "").trim())
    .slice(-8)
    .map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.text }],
    }));
}

export function isGeminiConfigured() {
  return Boolean(getGeminiApiKey());
}

export async function askGeminiAboutLeaves({ question, currentUser, contextData, history = [] }) {
  const apiKey = getGeminiApiKey();
  const modelName = resolveGeminiModelName();
  if (!apiKey) {
    throw new Error("missing-gemini-api-key");
  }

  const contextPayload = buildContextPayload(currentUser, contextData);
  const conversation = toGeminiHistory(history);

  conversation.push({
    role: "user",
    parts: [
      {
        text: `Employee leave context (JSON):\n${JSON.stringify(contextPayload, null, 2)}\n\nUser question:\n${question}`,
      },
    ],
  });

  const body = {
    systemInstruction: {
      parts: [
        {
          text: "You are ELMS AI Assistant for Employee Leave Management. Answer only leave-related HR queries. Use the provided JSON context as the source of truth. If data is missing, clearly say it is not available. Keep answers concise and practical.",
        },
      ],
    },
    contents: conversation,
    generationConfig: {
      temperature: 0.3,
      topP: 0.9,
      maxOutputTokens: 700,
    },
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelName)}:generateContent`;
    const response = await fetch(`${endpoint}?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error(`gemini-request-failed:${response.status}:${details}`);
    }

    const payload = await response.json();
    const answer = (payload?.candidates || [])[0]?.content?.parts
      ?.map((part) => part?.text || "")
      .join("\n")
      .trim();

    if (!answer) {
      throw new Error("gemini-empty-response");
    }

    return answer;
  } finally {
    clearTimeout(timeout);
  }
}
