import { getAiResults } from "@/actions/getAiResults";
import { AiResultFile } from "@/types/ai";
import {
  Bot,
  User,
  Navigation,
  Mic,
  Clock,
  CheckCircle2,
  XCircle,
  FileJson,
  Sparkles,
} from "lucide-react";

export const revalidate = 0;

export default async function AiChatPage() {
  const results: AiResultFile[] = await getAiResults();

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 dir-rtl text-right font-sans space-y-6">
      {/* Hero Banner Header - مطابق لأسلوب REC Company */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-gradient-to-br from-slate-950 via-[#0B111D] to-[#08121E] p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#00B8A9]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#00B8A9]/10 text-[#00B8A9] border border-[#00B8A9]/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI agent LOGS</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
            سجل محادثات الذكاء الاصطناعي
          </h1>

          <p className="text-slate-400 text-sm sm:text-base max-w-2xl leading-relaxed">
            استعراض نتائج الأوامر الصوتية والتوجيه الآلي المفرغة من نتائج النظام بأسلوب مبسط ونظيف.
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      {results.length === 0 ? (
        <div className="rounded-xl border border-slate-800/80 bg-[#0B0F17] p-12 text-center text-slate-400">
          <FileJson className="w-10 h-10 mx-auto mb-3 text-slate-600" />
          <p className="text-base font-medium">لا توجد محادثات أو نتائج مسجلة حالياً.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {results.map((result) => {
            // تصفية التاريخ لعرض الرسائل الموجهة للمستخدم فقط دون أجزاء الـ tools/thoughts
            const displayMessages = result.history
              .map((turn) => {
                const userTextParts = turn.parts
                  .filter((p) => p.text && !p.thought && !p.functionCall && !p.functionResponse)
                  .map((p) => p.text);

                if (userTextParts.length === 0) return null;

                return {
                  role: turn.role,
                  text: userTextParts.join("\n"),
                };
              })
              .filter(Boolean);

            return (
              <div
                key={result.filename}
                className="rounded-xl border border-slate-800/80 bg-[#0B0F17] shadow-lg overflow-hidden transition-all hover:border-slate-700/80"
              >
                {/* Meta Header */}
                <div className="p-4 sm:p-5 bg-slate-900/50 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {result.success ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" /> ناجح
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        <XCircle className="w-3.5 h-3.5" /> فشل
                      </span>
                    )}

                    {/* <span className="font-mono text-xs text-slate-400 flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800">
                      <FileJson className="w-3.5 h-3.5 text-[#00B8A9]" />
                      {result.filename}
                    </span> */}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                    <span className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {new Date(result.time).toLocaleString("ar-EG")}
                    </span>

                    {result.navigation && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono bg-[#00B8A9]/10 text-[#00B8A9] border border-[#00B8A9]/30">
                        <Navigation className="w-3 h-3" />
                        {result.navigation}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-5 sm:p-6 space-y-5">
                  {/* التفريغ الصوتي إن وجد */}
                  {result.transcription && (
                    <div className="flex items-start gap-3 bg-slate-900/60 p-3.5 rounded-lg border border-slate-800/80">
                      <div className="p-2 rounded-md bg-amber-500/10 text-amber-400 shrink-0">
                        <Mic className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-xs font-medium text-slate-400">الأمر الصوتي المفرغ:</span>
                        <p className="text-sm font-semibold text-slate-200">{result.transcription}</p>
                      </div>
                    </div>
                  )}

                  {/* سجل المحادثة (الرسائل المباشرة فقط) */}
                  <div className="space-y-3 pt-2">
                    {displayMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex gap-3 p-4 rounded-xl text-sm transition-colors ${
                          msg?.role === "user"
                            ? "bg-[#0F172A]/80 border border-slate-800/80 mr-auto max-w-[85%]"
                            : "bg-[#0D1B2A]/60 border border-[#00B8A9]/20 ml-auto max-w-[90%]"
                        }`}
                      >
                        <div className="shrink-0 mt-0.5">
                          {msg?.role === "user" ? (
                            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                              <User className="w-4 h-4" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-[#00B8A9]/20 border border-[#00B8A9]/30 flex items-center justify-center text-[#00B8A9]">
                              <Bot className="w-4 h-4" />
                            </div>
                          )}
                        </div>

                        <div className="space-y-1 flex-1">
                          <div className="font-semibold text-xs text-slate-400">
                            {msg?.role === "user" ? "المستخدم" : "مساعد الذكاء الاصطناعي"}
                          </div>
                          <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
                            {msg?.text}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}