import React, { useState } from "react";
import { Award, CheckCircle2, AlertTriangle, FileText, Send, HelpCircle, RefreshCw, Loader2, Sparkles, TrendingUp, Check, ShieldAlert } from "lucide-react";
import { EMBEZZLEMENT_BEHAVIORS } from "../utils";

interface CaseReportProps {
  unlockedSmokingGuns: string[];
  onRestartGame: () => void;
  studentId: string;
  studentEmail: string;
  caseData: {
    embezzledAmount: number;
    correctCellKeyword: string;
    correctBehavior: { value: string; label: string; description: string };
  };
}

export default function CaseReport({ unlockedSmokingGuns, onRestartGame, studentId, studentEmail, caseData }: CaseReportProps) {
  // Form values
  const [qAmount, setQAmount] = useState("");
  const [qMethod, setQMethod] = useState("");
  const [writtenReport, setWrittenReport] = useState("");
  
  // Grading API states
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [score, setScore] = useState(0);
  const [moneyReview, setMoneyReview] = useState("");
  const [behaviorReview, setBehaviorReview] = useState("");
  const [formulaReview, setFormulaReview] = useState("");
  const [instructorFeedback, setInstructorFeedback] = useState("");
  const [showReviews, setShowReviews] = useState(false);

  const fetchExistingSubmission = async (silent = false) => {
    if (!studentId) return;
    if (!silent) setIsRefreshing(true);
    try {
      const response = await fetch(`/api/student/submission?studentId=${studentId}`);
      if (response.ok) {
        const data = await response.json();
        if (data) {
          // Always pick up feedback and custom adjusted scores if there are any
          setInstructorFeedback(data.instructorFeedback || "");
          setShowReviews(!!data.showReviews);
          if (data.score !== null && data.score !== undefined) {
            setScore(Number(data.score));
          }
          
          if (!data.isPlaceholder && data.qAmount) {
            setQAmount(data.qAmount || "");
            setQMethod(data.qMethod || "");
            setWrittenReport(data.writtenReport || "");
            if (data.moneyReview) setMoneyReview(data.moneyReview);
            if (data.behaviorReview) setBehaviorReview(data.behaviorReview);
            if (data.formulaReview) setFormulaReview(data.formulaReview);
            setIsSubmitted(true);
          } else {
            // Placeholder represents not fully submitted yet
            setIsSubmitted(false);
          }
        } else {
          // Wiped or deleted by admin
          setIsSubmitted(false);
          setInstructorFeedback("");
          setScore(0);
          setShowReviews(false);
          setQAmount("");
          setQMethod("");
          setWrittenReport("");
          setMoneyReview("");
          setBehaviorReview("");
          setFormulaReview("");
        }

        if (!silent) {
          alert("✓ ซิงค์ตรวจสอบสถานะและประดับคะแนนล่าสุดกับระบบอาจารย์เรียบร้อยแล้ว!");
        }
      } else {
        if (!silent) {
          alert("ไม่สามารถซิงค์ข้อมูลได้ในขณะนี้: ระบบตอบสนองผิดพลาด");
        }
      }
    } catch (err) {
      console.error("Failed to fetch existing submission:", err);
      if (!silent) {
        alert("ไม่สามารถซิงค์ข้อมูลได้ในขณะนี้: การเชื่อมต่อเซิร์ฟเวอร์ขัดข้อง");
      }
    } finally {
      if (!silent) setIsRefreshing(false);
    }
  };

  // Fetch feedback and status on mount and set up real-time 4-second polling
  React.useEffect(() => {
    fetchExistingSubmission(false);

    const timer = setInterval(() => {
      fetchExistingSubmission(true);
    }, 4000);

    return () => clearInterval(timer);
  }, [studentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qAmount.trim() || !qMethod) {
      alert("กรุณากรอกข้อมูลจำนวนเงินทุจริต และเลือกทฤษฎีพฤติกรรมการทุจริตก่อนทำการส่งผลครับ");
      return;
    }
    if (writtenReport.trim().length < 5) {
      alert("กรุณาป้อนคำอธิบายวิเคราะห์สูตรและสรุปรายงานเพิ่มเติม (ขั้นต่ำ 5 ตัวอักษร) เพื่อบันทึกพยานหลักฐานประเมินตรรกะผลคะแนนครับ");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          studentEmail,
          qAmount: qAmount.replace(/,/g, "").trim(),
          qMethod,
          writtenReport,
        }),
      });

      if (!response.ok) {
        throw new Error("ระบบเชื่อมต่อเซิร์ฟเวอร์ประเมินคลาดเคลื่อน กรุณาลองใหม่อีกครั้ง");
      }

      const data = await response.json();
      setScore(data.score || 0);
      setMoneyReview(data.moneyReview || "");
      setBehaviorReview(data.behaviorReview || "");
      setFormulaReview(data.formulaReview || "");
      setInstructorFeedback(data.instructorFeedback || "");
      setIsSubmitted(true);
      alert("🎉 ยื่นสมุดวิเคราะห์ชันสูตรคดีสำเร็จ! คะแนนและการวิเคราะห์ความจริงถูกนำส่งบอร์ดบริหารเรียบร้อยแล้ว");
    } catch (err: any) {
      alert(err.message || "เกิดข้อผิดพลาดในการส่งคำตอบ");
    } finally {
      setIsLoading(false);
    }
  };

  const hasDiscoveredGuns = unlockedSmokingGuns.length > 0;

  return (
    <div id="case-report-panel" className="flex flex-col h-full bg-[#1e293b] text-slate-100 rounded-xl overflow-hidden border border-slate-700 shadow-2xl">
      {/* Title Bar */}
      <div className="bg-[#0f172a] px-4 py-3 border-b border-slate-700 flex items-center justify-between col-span-1">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-rose-500" />
          <span className="font-semibold text-sm text-rose-200">
            รายงานชันสูตรคดีบัญชี (Audit Report System) — Forensic AC432
          </span>
        </div>
        <span className="text-xs bg-rose-950/80 border border-rose-900 text-rose-300 px-2.5 py-1 rounded font-mono">
          BU ALec Evaluator
        </span>
      </div>

      {isSubmitted ? (
        /* VERDICT / RESULTS SCREEN - BEAUTIFUL forensically graded dashboard */
        <div className="flex-1 p-5 overflow-auto bg-gradient-to-b from-[#0f172a] to-[#1e293b] flex flex-col space-y-5">
          
          {/* Header Score Circular Box */}
          <div className="bg-slate-900/45 border border-slate-800/80 p-5 rounded-xl flex flex-col md:flex-row items-center justify-between gap-5 shadow-xl">
            <div className="text-center md:text-left space-y-1">
              <span className="text-[10px] bg-emerald-950 text-emerald-400 font-bold border border-emerald-900 px-2 py-0.5 rounded-full uppercase tracking-widest font-mono">
                AI REAL-TIME GRADING COMPLETE
              </span>
              <h3 className="text-lg font-bold text-white font-sans">
                {score >= 80 ? "🎉 บรรลุการคลี่คลายคดีขั้นสูงสุด!" : score >= 50 ? "⚠️ ตรวจเจอหลักฐานมีสิทธิ์ยื่นเพิ่มเติม" : "❌ ข้อมูลรายงานหลักฐานยังไม่เพียงพอ"}
              </h3>
              <p className="text-xs text-slate-400 max-w-sm">
                อาจารย์ ALec ได้ประเมินพฤติการ และคำวิเคราะห์ตรรกะบัญชีของคุณเรียบร้อยแล้ว
              </p>
            </div>
            
            {/* Round Grade Circle */}
            <div className="shrink-0 flex items-center gap-3 bg-slate-950/85 border border-slate-850 p-4 rounded-xl shadow-inner">
              <div className="relative w-16 h-16 rounded-full border-4 border-slate-800 flex items-center justify-center">
                <div className={`absolute inset-0 rounded-full border-4 ${score >= 80 ? "border-emerald-500" : score >= 50 ? "border-amber-500" : "border-rose-500"} animate-pulse`} />
                <span className="text-xl font-mono font-extrabold text-white">{score}</span>
              </div>
              <div className="text-left font-mono">
                <span className="text-[10px] text-slate-500 block">TOTAL SCORE</span>
                <span className="text-sm font-extrabold text-slate-300">/ 100 คะแนน</span>
              </div>
            </div>
          </div>

          {/* Graded Critiques Blocks - Explicit requested form */}
          {showReviews ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* 1. Money Review Card */}
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 font-sans block">1. วิจารณ์เรื่องการหาจำนวนเงิน</span>
                  <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-950/50 px-2 py-0.5 rounded">40 คะแนน</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-sans text-justify bg-slate-950/30 p-2.5 rounded border border-slate-900 min-h-[100px]">
                  {moneyReview}
                </p>
              </div>

              {/* 2. Behavior Review Card */}
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 font-sans block">2. วิจารณ์พฤติกรรมการทุจริต</span>
                  <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-950/50 px-2 py-0.5 rounded">30 คะแนน</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-sans text-justify bg-slate-950/30 p-2.5 rounded border border-slate-900 min-h-[100px]">
                  {behaviorReview}
                </p>
              </div>

              {/* 3. Formula Analyze Card */}
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 font-sans block">3. วิจารณ์สูตรและการวิเคราะห์</span>
                  <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-950/50 px-2 py-0.5 rounded">30 คะแนน</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-sans text-justify bg-slate-950/30 p-2.5 rounded border border-slate-900 min-h-[100px]">
                  {formulaReview}
                </p>
              </div>

            </div>
          ) : (
            <div className="bg-slate-900/55 border border-amber-900/35 p-5 rounded-xl text-center space-y-2 flex flex-col items-center justify-center py-6 shadow-lg">
              <div className="w-10 h-10 rounded-full bg-slate-950 border border-amber-800/50 flex items-center justify-center shadow-inner">
                <ShieldAlert className="w-5 h-5 text-amber-500 animate-pulse" />
              </div>
              <h4 className="text-xs font-bold text-slate-200 font-sans">🔒 รายละเอียดวิจารณ์คำตอบข้อ 1-3 และตัวบทเฉลยถูกสงวนไว้</h4>
              <p className="text-[11px] text-slate-400 max-w-lg leading-relaxed font-sans mt-1">
                การประกาศเฉลยพฤติการณ์ คำนวณเบื้องหลัง และรายงานการวิเคราะห์รายข้อ (ข้อ 1-3) จะปรากฏให้สืบสวนต่อเมื่อ ผู้ตรวจสอบบัญชีหรือคณาจารย์คุมคดีทำการอนุมัติคำขอเปิดรับทราบคะแนนเฉลยสิทธิ์ให้กับรหัสนักศึกษาของคุณแบบเฉพาะเจาะจง
              </p>
            </div>
          )}

          {/* Live Sync Status for Results Screen */}
          <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800 p-3 rounded-lg text-xs">
            <span className="text-slate-400 font-sans flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
              <span>ระบบเชื่อมต่อตรวจสอบความคิดเห็นและปรับแก้คะแนนย้อนหลังโดยอาจารย์ (Live Synced)</span>
            </span>
            <button
              type="button"
              onClick={() => fetchExistingSubmission(false)}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 px-3 py-1 rounded text-[10.5px] font-bold transition font-mono border border-slate-700 cursor-pointer active:scale-95 shrink-0"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin text-white" : ""}`} />
              <span>{isRefreshing ? "กำลังซิงค์ค่าติชม..." : "ซิงค์ผลการตรวจด่วน"}</span>
            </button>
          </div>

          {/* Instructor Feedback Card */}
          {instructorFeedback && (
            <div className="bg-emerald-950/20 border border-emerald-900/40 p-4 rounded-xl leading-relaxed text-xs">
              <p className="text-emerald-400 font-bold flex items-center gap-1 mb-1.5 font-sans">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>คำวิเคราะห์และคะแนนติชมจำลองประจักษ์จากบอร์ดผู้สอบบัญชี (Instructor Feedback):</span>
              </p>
              <div className="text-slate-200 bg-slate-950/50 p-3 rounded-lg border border-emerald-950/40 font-mono text-[11px] whitespace-pre-wrap leading-relaxed">
                {instructorFeedback}
              </div>
            </div>
          )}

          {/* Interactive confession text if successful */}
          {score >= 80 && showReviews && (
            <div className="bg-slate-900/70 border border-indigo-950 p-4 rounded-xl leading-relaxed text-xs">
              <p className="text-indigo-300 font-bold flex items-center gap-1 mb-1.5">
                <Award className="w-4 h-4 shrink-0" />
                <span>คำสารภาพสุดท้ายของจำเลย ณภัทร (K.Min):</span>
              </p>
              <p className="italic text-slate-300 bg-[#0f172a]/60 p-3 rounded-lg border border-indigo-900/30 font-serif">
                &ldquo;เราขอสารภาพ... เราตกแต่งสูตร SUM ข้ามแถวที่เกี่ยวกับ M.N. Accounting Solution จริงๆ เพราะหลังจัดพิธีแต่งงานเงินเราตึงมือมาก... เราต้องส่งเสียค่าผ่อนบ้านและโดนทางธนาคารส่งหนังสือทวงเงิน... เราเห็นว่าไฟล์รวมคลังตั้งสูตรสลายไปได้โดยไม่มีใครดูรายละเอียดเลยแอบทำ ยอดสเตทเม้นท์คือยอดโอนจริงเข้าบัญชีรองของเรา... ยอมจำนนต่อหลักฐานแล้วค่ะ...&rdquo;
              </p>
            </div>
          )}

          {/* Restart Button */}
          <div className="flex justify-center pt-2">
            <button
              onClick={() => {
                setIsSubmitted(false);
                setQAmount("");
                setQMethod("");
                setWrittenReport("");
                onRestartGame();
              }}
              className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-slate-100 px-6 py-2.5 rounded-lg text-xs font-bold transition-all shadow-md font-sans cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>ทำบันทึกฝึกสืบสวนคดีใหม่อีกครั้ง</span>
            </button>
          </div>
        </div>
      ) : (
        /* AUDITOR QUESTIONS SUBMISSION FORM */
        <form onSubmit={handleSubmit} className="flex-1 p-5 overflow-auto space-y-4 bg-[#121b2a]">
          
          {/* Real-time sync & Instructor Feedback card on student's active form page */}
          <div className="flex items-center justify-between bg-slate-900/40 border border-slate-800 p-2.5 rounded-lg text-xs">
            <span className="text-slate-400 font-sans flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse shrink-0" />
              <span>ตรวจพบสถานะและอัพเดทคะแนนตรงกับระบบอาจารย์ (Live Synced)</span>
            </span>
            <button
              type="button"
              onClick={() => fetchExistingSubmission(false)}
              disabled={isRefreshing}
              className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded text-[10px] font-bold transition font-mono border border-slate-700 cursor-pointer active:scale-95 shrink-0"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin text-white" : ""}`} />
              <span>{isRefreshing ? "กำลังซิงค์..." : "ซิงค์ด่วนพิเศษ"}</span>
            </button>
          </div>

          {(instructorFeedback || (score !== null && score > 0)) && (
            <div className="bg-emerald-950/20 border border-emerald-900/40 p-4 rounded-xl leading-relaxed text-xs space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-900/30 pb-2">
                <p className="text-emerald-400 font-bold flex items-center gap-1.5 font-sans">
                  <Award className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>บันทึกการประเมิน & คำแนะนำจากอาจารย์ผู้คุมคดี:</span>
                </p>
                {score !== null && score !== undefined && (
                  <span className="bg-emerald-900/70 border border-emerald-700 text-[#34d399] font-mono text-[11px] px-2.5 py-1 rounded-full font-bold">
                    คะแนนรวมเฉลยกรณีของคุณ: {score} / 100
                  </span>
                )}
              </div>
              {instructorFeedback ? (
                <div className="text-slate-200 bg-slate-950/60 p-3 rounded-lg border border-emerald-950/40 font-mono text-[11px] whitespace-pre-wrap leading-relaxed shadow-inner">
                  {instructorFeedback}
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 italic font-mono">อาจารย์ยังไม่ได้บันทึกหรือระบุตัวอักษรป้อนกลับเพิ่มเติม แต่ได้รับการอัพเดตสิทธิเกรดคะแนนส่งกลับเรียบร้อยแล้ว</p>
              )}
            </div>
          )}

          <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-lg text-xs text-slate-300 space-y-1.5 font-sans leading-relaxed">
            <p className="font-semibold text-slate-200 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>ระเบียบเกณฑ์พิพากษาคดี (AC432 Dynamic Assessment):</span>
            </p>
            <p className="text-slate-300">
              ข้อนี้ใช้วิธีประเมินโจทย์แบบสุ่มตามรายบุคคลของนักศึกษา (รหัส: <strong className="text-amber-300 font-mono">{studentId}</strong>) ข้อมูลที่พบในสมุดบัญชีจริงจะอ้างอิงและจำลองยอดตรงกับตัวคุณเท่านั้น กรุณาวิเคราะห์แล้วป้อนตัวเลขให้ถูกต้อง
            </p>
            <div className="flex gap-2 pt-1 font-mono text-[10px]">
              <span className="bg-slate-800 text-slate-300 px-2.2 py-0.5 rounded border border-slate-700">เบาะแสสแกนได้ในสมุด: {unlockedSmokingGuns.length} / 3</span>
              {hasDiscoveredGuns ? (
                <span className="bg-indigo-950 text-indigo-400 px-2 py-0.5 rounded border border-indigo-900 animate-pulse">พบรอยแผลจำเลยแล้ว</span>
              ) : (
                <span className="bg-amber-950/80 text-amber-400 px-2 py-0.5 rounded border border-amber-900">กำลังสืบค้น...</span>
              )}
            </div>
          </div>

          {/* Dynamic Question 1 (Strict Numeric Entry) */}
          <div className="bg-[#1e293b]/60 border border-slate-700/60 p-4 rounded-xl space-y-2 ">
            <label className="text-xs font-bold text-slate-200 block font-sans">
              1. ระบุยอดเงินทุจริตทับซ้อน (Reconciliation Discrepancy) ที่ตรวจสืบเจอในกรณีของรหัสตัวคุณ *
            </label>
            <div className="relative rounded-lg shadow-sm">
              <input
                type="text"
                placeholder="กรอกยอดเงินเป็นตัวเลข (เช่น 506,150)"
                value={qAmount}
                onChange={(e) => setQAmount(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-3 pr-12 text-xs font-mono text-slate-100 focus:outline-none focus:ring-1 focus:ring-rose-500"
                required
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-slate-400 text-[11px] font-sans">บาท THB</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              * คำแนะนำ: สืบค้นยอดโอนไปหาภายนอกสลับที่กระทบยอดไม่ลงตัวมาตอบ
            </p>
          </div>

          {/* Dynamic Question 2 (10 MCQ Audit Behaviors) */}
          <div className="bg-[#1e293b]/60 border border-slate-700/60 p-4 rounded-xl space-y-2">
            <label className="text-xs font-bold text-slate-200 block font-sans">
              2. ระบุพฤติกรรมการทุจริตและการแต่งพิกัดสูตร (เลือกจากข้อวินิจฉัยต่อไปนี้) *
            </label>
            <select
              value={qMethod}
              onChange={(e) => setQMethod(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-rose-500"
              required
            >
              <option value="">--เลือกวิธีจัดการตกแต่งพฤติกรรมในงวดนี้--</option>
              {EMBEZZLEMENT_BEHAVIORS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-slate-400 font-sans">
              * คำแนะนำ: ตรวจทานเฉลยพฤติการณ์ที่สุมแต่งข้ามเซลล์ตารางเฉพาะรายกรณีของคุณ
            </p>
          </div>

          {/* Open-ended written report explaining formulas */}
          <div className="bg-[#1e293b]/60 border border-slate-700/60 p-4 rounded-xl space-y-2">
            <label className="text-xs font-bold text-slate-200 block font-sans">
              3. บันทึกคำอธิบายเชิงประจักษ์พลาสติกสูตร Excel และการควบคุมภายใน (Forensic Notes) *
            </label>
            <textarea
              placeholder="เขียนบันทึกเจาะลึก: ระบุตำแหน่งเซลล์ที่ถูกตั้งใจละเว้น (เฉลาย G12, G13, หรือ G14), ความพยายามเปลี่ยนความหมายสูตรยอดรวมสรุปที่ช่อง G16, และความน่าสงสัยของการโยงเลขบัญชีที่ตรงกับเงินเดือนพนักงาน..."
              value={writtenReport}
              onChange={(e) => setWrittenReport(e.target.value)}
              rows={4}
              className="w-full bg-slate-900 border border-slate-700/60 rounded-lg p-3 text-xs text-slate-100 font-sans focus:outline-none focus:ring-1 focus:ring-rose-500"
              required
            />
            <p className="text-[10px] text-slate-500 font-sans">
              * ระบบ AI ของ ALec จะขูดเช็คคุณภาพ คีย์เวิร์ดสูตรบวก และพิกัดเซลล์ที่เกี่ยวข้องเพื่อคิดสัดส่วนเกรดคะแนน 30 คะแนนเต็ม
            </p>
          </div>

          {/* Submit Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-rose-600 hover:bg-rose-500 disabled:bg-rose-800 text-slate-100 font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-rose-950/30 font-sans cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>กำลังส่งผลชันสูตรแอนะล็อก AI ชั่งตวงตรรกะ...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-white" />
                  <span>ยื่นบันทึกชันสูตรต่อบอร์ดคณะกรรมการ AC432 เพื่อตรวจคะแนนทันที</span>
                </>
              )}
            </button>
          </div>

        </form>
      )}
    </div>
  );
}
