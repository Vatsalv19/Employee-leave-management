import { useState, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { Bot, Send, User, X } from "lucide-react";

const AI_RESPONSES = {
  "leave balance": (user, ctx) => {
    const bal = ctx.userBalances;
    if (!bal.length) return "I couldn't find your leave balance data. Please contact HR.";
    const lines = bal.map((b) => {
      const lt = ctx.leaveTypes.find((t) => t.id === b.leaveTypeId);
      const remaining = b.totalAllocated + b.carriedOver - b.used - b.pending;
      return `• ${lt?.name || "Unknown"}: ${remaining} days remaining (Used: ${b.used}, Pending: ${b.pending})`;
    });
    return `Here's your leave balance for 2026, ${user.firstName}:\n\n${lines.join("\n")}\n\nTotal remaining: ${bal.reduce((s, b) => s + b.totalAllocated + b.carriedOver - b.used - b.pending, 0)} days`;
  },
  holidays: (user, ctx) => {
    const today = new Date().toISOString().split("T")[0];
    const upcoming = ctx.holidays.filter((h) => h.date >= today).slice(0, 5);
    if (!upcoming.length) return "There are no upcoming holidays this year.";
    const lines = upcoming.map((h) => `• ${h.name} — ${new Date(h.date + "T00:00:00").toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" })}${h.isOptional ? " (Optional)" : ""}`);
    return `Upcoming holidays:\n\n${lines.join("\n")}`;
  },
  "pending": (user, ctx) => {
    const pending = ctx.userLeaves.filter((l) => l.status === "Pending");
    if (!pending.length) return "You have no pending leave requests. 🎉";
    const lines = pending.map((l) => `• ${l.type}: ${l.startDate} to ${l.endDate} (${l.totalDays} day${l.totalDays > 1 ? "s" : ""})`);
    return `You have ${pending.length} pending request(s):\n\n${lines.join("\n")}`;
  },
  "apply": () => "To apply for leave:\n\n1. Go to **Apply Leave** from the sidebar\n2. Select the leave type\n3. Choose start and end dates\n4. Add a reason and submit\n\nYour manager will be notified automatically.",
  "policy": (user, ctx) => {
    return `Leave Policy Summary:\n\n• **Carry Over**: Up to 5 days, expires in 3 months\n• **Encashment**: Available with min balance of 10 days\n• **Documentation**: Required for Sick Leave (3+ days) and Maternity/Paternity\n• **Year**: January - December 2026`;
  },
  hello: (user) => `Hello ${user.firstName}! 👋 I'm your ELMS AI Assistant. I can help you with:\n\n• Checking your **leave balance**\n• Viewing **upcoming holidays**\n• Checking **pending** requests\n• Understanding **leave policies**\n• How to **apply** for leave\n\nJust ask me anything!`,
  default: (user) => `I'm not sure I understand that, ${user.firstName}. Try asking about:\n\n• "leave balance" — View your available leaves\n• "holidays" — See upcoming holidays\n• "pending" — Check pending requests\n• "policy" — Learn about leave policies\n• "apply" — How to apply for leave`,
};

function matchResponse(input, user, ctx) {
  const q = input.toLowerCase().trim();
  if (q.includes("balance") || q.includes("how many")) return AI_RESPONSES["leave balance"](user, ctx);
  if (q.includes("holiday")) return AI_RESPONSES.holidays(user, ctx);
  if (q.includes("pending") || q.includes("status")) return AI_RESPONSES.pending(user, ctx);
  if (q.includes("apply") || q.includes("request") || q.includes("how to")) return AI_RESPONSES.apply(user, ctx);
  if (q.includes("policy") || q.includes("rule") || q.includes("carry")) return AI_RESPONSES.policy(user, ctx);
  if (q.includes("hello") || q.includes("hi") || q === "hey") return AI_RESPONSES.hello(user);
  return AI_RESPONSES.default(user);
}

export default function AIAssistant() {
  const { currentUser, userLeaves, userBalances, leaveTypes, holidays } = useApp();
  const [messages, setMessages] = useState([
    { role: "ai", text: `Hi ${currentUser?.firstName || "there"}! 👋 I'm your ELMS AI Assistant. Ask me about your leave balance, holidays, pending requests, or policies!` },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typing]);

  function handleSend() {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setInput("");
    setTyping(true);

    setTimeout(() => {
      const ctx = { userLeaves, userBalances, leaveTypes, holidays };
      const response = matchResponse(userMsg, currentUser, ctx);
      setMessages((prev) => [...prev, { role: "ai", text: response }]);
      setTyping(false);
    }, 800 + Math.random() * 700);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  return (
    <div className="animate-fade-in h-[calc(100vh-130px)] flex flex-col max-w-3xl">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-theme-primary flex items-center gap-2">
          <Bot className="w-6 h-6 text-primary-400" /> AI Assistant
        </h2>
        <p className="mt-1 text-sm text-theme-secondary">Ask me anything about your leaves, balance, or policies</p>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-thin glass-card-static rounded-2xl p-4 mb-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""} animate-slide-up`}>
            {msg.role === "ai" && (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-accent-cyan shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              msg.role === "user"
                ? "bg-primary-500/15 text-theme-primary border border-primary-500/20"
                : "bg-theme-surface-lighter text-theme-primary border border-theme"
            }`}>
              {msg.text.split("\n").map((line, j) => (
                <p key={j} className={j > 0 ? "mt-1" : ""}>
                  {line.split("**").map((part, k) =>
                    k % 2 === 1 ? <strong key={k} className="font-semibold text-primary-400">{part}</strong> : part
                  )}
                </p>
              ))}
            </div>
            {msg.role === "user" && (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500/20 shrink-0">
                <User className="w-4 h-4 text-primary-400" />
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {typing && (
          <div className="flex gap-3 animate-fade-in">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-accent-cyan shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-theme-surface-lighter border border-theme rounded-2xl px-4 py-3 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-theme-muted typing-dot" />
              <span className="w-2 h-2 rounded-full bg-theme-muted typing-dot" />
              <span className="w-2 h-2 rounded-full bg-theme-muted typing-dot" />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="glass-card-static rounded-2xl p-3 flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your question..."
          className="input-field flex-1 border-0 bg-transparent focus:ring-0 focus:shadow-none"
          disabled={typing}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || typing}
          className="btn-primary px-4 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
