/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Send, 
  AlertTriangle, 
  HelpCircle, 
  Award, 
  TrendingUp, 
  Flame, 
  Heart, 
  User, 
  FileSpreadsheet, 
  Landmark, 
  FileText, 
  RefreshCw, 
  Compass, 
  GraduationCap, 
  Sparkles,
  Info,
  Lock,
  CheckCircle2
} from "lucide-react";
import { ChatMessage, ActiveTab } from "./types";
import SheetViewer from "./components/SheetViewer";
import BankStatementViewer from "./components/BankStatementViewer";
import EmployeeProfile from "./components/EmployeeProfile";
import CaseReport from "./components/CaseReport";
import { generateCaseFromId } from "./utils";

const PRESET_PROMPTS = [
  { label: "❓ สวัสดี K.Min ทางเราขอสอบถามแนวคิดการจัดทำข้อมูลบัญชีรอบนี้หน่อย", text: "สวัสดี K.Min ทางเราขอสอบถามแนวคิดการจัดทำข้อมูลบัญชีรอบนี้หน่อย" },
  { label: "📊 ทำไมช่อง Credit Total G16 ถึงใช้สูตรบวกข้ามพิกัด?", text: "ทำไมสูตรบวกยอดสะสม Credit Total ในเซลล์ G16 ถึงบวกเว้นข้ามแถวไป ไม่คลุมทั้งตาราง?" },
  { label: "💳 รายการโอนเงิน 1,000,000 บาท ให้ M.N. Accounting Solution คือค่าบริการอะไร?", text: "รายการจ่ายเงิน 1,000,000 บาท ในวันที่ 15 ธันวาคม 2025 ให้พอร์ต M.N. Accounting Solution คือค่าใช้จ่ายอะไรและมีสัญญาแนบไหม?" },
  { label: "🔍 บัญชีโอนค่าที่ปรึกษา '022-2-21954-3' ทำไมไปตรงพิกัดบัญชีเงินเดือนพนักงานสะสม?", text: "เราตรวจสอบพิกัดเลขที่บัญชี 022-2-21954-3 ของบริษัทที่ปรึกษาทำไมไปตรงกับเลขที่บัญชีเงินเดือนพนักงานของคุณเองแบบนี้อธิบายยังไง?" },
  { label: "💸 ยอดรวมเงินสดใน Bank Statement ไม่ปรกติตรงพิกัดผลต่างหายไปล้านนึง ใช่ฝีมือเรายักยอกไหม?", text: "เงินสุทธิโอนขาดดุลใน Cash Book หายไปล้านนึงตรงกับยอดโอนไป บัญชี เอ็ม.เอ็น. แอคเคาท์ติ้ง โซลูชั่น นี่คือเจตนาทุจริตยักยอกใช่หรือไม่?" },
];

const PRESET_PROMPTS_EP2 = [
  { label: "❓ ทำไมรหัส ดนัย จัง แถว 10 ถึงขึ้นเตือน GHOST_SUSPECT (G10)?", text: "ทำไมสถานะตรวจสอบรหัสพนักงาน ดนัย จัง ในพิกัดเซลล์ G10 ถึงแจ้งเตือนว่า GHOST_SUSPECT?" },
  { label: "📊 ทำไมเลขบัญชี ดนัย จัง ถึงซ้ำกับซัพพลายเออร์ M.N. (H10)?", text: "เราตรวจสอบพิกัดช่องข้อมูล H10 ทำไมเลขบัญชีกสิกรไทยของ ดนัย จัง ถึงตรงกับใบสัญญาคู่ค้า M.N. Accounting Solution?" },
  { label: "🔍 ใครคือคนส่งข้อมูลอนุมัติจ่ายเงินเดือพนักงานสวมรอยคนนี้เข้าคลัง?", text: "รายการจ่ายเงินเดือน ดนัย จัง ใครเป็นผู้อนุมัติหรือส่งข้อมูลจ้างงานฝ่ายจัดจัดจ้างเข้าพอร์ตระบบบัญชี?" },
  { label: "💸 K.Min และ J.Jin วางแผนแบ่งครึ่งงบพนักงานผี ดนัย จัง ใช่หรือไม่?", text: "พวกคุณสองคน K.Min และ J.Jin จงใจร่วมหัวสมคบคิดฟอกทะเบียนเงินเดือนสวมขัดจ้าง ดนัย จัง เพื่อนำเงินทุจริตยักยอกไปจ่ายให้ตนใช่หรือไม่?" }
];

export default function App() {
  // Active selected episode state: Null by default to display the Episode Selection Landing Page
  const [selectedEpisode, setSelectedEpisode] = useState<number | null>(() => {
    const saved = localStorage.getItem("bu_selected_episode");
    return saved ? parseInt(saved, 10) : null;
  });

  const [interrogationTarget, setInterrogationTarget] = useState<"KM" | "JJ">("KM");

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<ActiveTab>("instructions");
  
  // Student Login States (Mandatory 10-digit Student ID and Email)
  const [studentId, setStudentId] = useState(() => localStorage.getItem("bu_student_id") || "");
  const [studentEmail, setStudentEmail] = useState(() => localStorage.getItem("bu_student_email") || "");
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem("bu_student_id"));
  const [loginIdInput, setLoginIdInput] = useState("");
  const [loginEmailInput, setLoginEmailInput] = useState("");
  const [loginError, setLoginError] = useState("");

  const [episodeStatus, setEpisodeStatus] = useState<{
    1: boolean;
    2: boolean;
    3: boolean;
    4: boolean;
    5: boolean;
    completed: { [key: number]: boolean };
  }>({
    1: true,
    2: false,
    3: false,
    4: false,
    5: false,
    completed: { 1: false, 2: false, 3: false, 4: false, 5: false }
  });

  const [unlockedSmokingGuns, setUnlockedSmokingGuns] = useState<string[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [stressLevel, setStressLevel] = useState(15);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const caseData = isLoggedIn ? generateCaseFromId(studentId, studentEmail) : generateCaseFromId("1234567895", "test@bu.ac.th");

  const studentIdWithEp = selectedEpisode ? `${studentId}-ep${selectedEpisode}` : studentId;

  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    const cleanId = loginIdInput.trim().replace(/\D/g, "");
    if (cleanId.length !== 10) {
      setLoginError("กรุณาระบุรหัสนักศึกษาให้ถูกต้อง (ตัวเลขเข้มงวด 10 หลัก) เช่น 1640901234");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(loginEmailInput.trim())) {
      setLoginError("กรุณาระบุรูปแบบอีเมลนักศึกษาที่ถูกต้อง เช่น student@bu.ac.th");
      return;
    }

    // Save credentials to local storage
    localStorage.setItem("bu_student_id", cleanId);
    localStorage.setItem("bu_student_email", loginEmailInput.trim());
    setStudentId(cleanId);
    setStudentEmail(loginEmailInput.trim());
    setIsLoggedIn(true);
  };

  const [questionsCount, setQuestionsCount] = useState<number>(() => {
    const saved = localStorage.getItem("bu_questions_count");
    return saved ? parseInt(saved, 10) : 0;
  });

  const fetchEpisodeStatus = async () => {
    if (!studentId) return;
    try {
      const res = await fetch(`/api/student/episodes-status?studentId=${studentId}`);
      if (res.ok) {
        const data = await res.json();
        setEpisodeStatus(data);
      }
    } catch (err) {
      console.error("Failed to fetch episode statuses:", err);
    }
  };

  useEffect(() => {
    if (isLoggedIn && studentId && selectedEpisode === null) {
      fetchEpisodeStatus();
    }
  }, [isLoggedIn, studentId, selectedEpisode]);

  const handleStudentLogout = () => {
    localStorage.removeItem("bu_student_id");
    localStorage.removeItem("bu_student_email");
    localStorage.removeItem("bu_questions_count");
    localStorage.removeItem("bu_selected_episode");
    setStudentId("");
    setStudentEmail("");
    setIsLoggedIn(false);
    setSelectedEpisode(null);
    setLoginIdInput("");
    setLoginEmailInput("");
    setUnlockedSmokingGuns([]);
    setQuestionsCount(0);
    setEpisodeStatus({
      1: true,
      2: false,
      3: false,
      4: false,
      5: false,
      completed: { 1: false, 2: false, 3: false, 4: false, 5: false }
    });
  };

  // Admin Central System States
  const [instructorClicks, setInstructorClicks] = useState(0);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminSubmissions, setAdminSubmissions] = useState<any[]>([]);
  const [isAdminLoading, setIsAdminLoading] = useState(false);

  const fetchAdminSubmissions = async () => {
    setIsAdminLoading(true);
    try {
      const res = await fetch("/api/admin/submissions");
      if (res.ok) {
        const data = await res.json();
        setAdminSubmissions(data);
      }
    } catch (err) {
      console.error("Failed to query submissions list:", err);
    } finally {
      setIsAdminLoading(false);
    }
  };

  useEffect(() => {
    if (isAdminAuthenticated) {
      fetchAdminSubmissions();
    }
  }, [isAdminAuthenticated]);

  // Synchronize student login session to create a database placeholder in real-time
  useEffect(() => {
    if (isLoggedIn && studentId && studentEmail) {
      fetch("/api/register-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: studentIdWithEp, studentEmail }),
      })
        .then(() => {
          if (isAdminAuthenticated) {
            fetchAdminSubmissions();
          }
        })
        .catch((err) => console.error("Session registry error:", err));
    }
  }, [isLoggedIn, studentId, studentEmail, studentIdWithEp, isAdminAuthenticated]);

  const getCorrectAnswersForId = (studentId: string) => {
    const cleanId = String(studentId).replace(/\D/g, "");
    const idNum = cleanId.length >= 10 ? parseInt(cleanId.slice(-6)) : 123456;
    const correctAmount = 500000 + (idNum % 7) * 100000 + (idNum % 9) * 10000 + (idNum % 8) * 1000 + (idNum % 3) * 100 + 150;
    
    const behaviorsList = [
      "opt-1", "opt-2", "opt-3", "opt-4", "opt-5",
      "opt-6", "opt-7", "opt-8", "opt-9", "opt-10"
    ];
    const correctBehaviorCode = behaviorsList[idNum % behaviorsList.length];
    const correctCellKeyword = ["G12", "G13", "G14"][idNum % 3];

    const behaviorLabels: { [key: string]: string } = {
      "opt-1": "A) โอนซ้อนคู่ค้าปลอม (M.N. Accounting Solution) และเลี่ยงสูตร SUM",
      "opt-2": "B) สร้างพนักงานผี (Ghost Employees) และคีย์ payroll สอดไส้",
      "opt-3": "C) เบิกซ้ำซ้อนค่าบริการอินเทอร์เน็ตพอร์ตไอทีกระเป๋าพนักงาน",
      "opt-4": "D) ดัดแปลงค่าใช้จ่ายเล่มประกันกองรถยนต์ไปนอมินีม้า",
      "opt-5": "E) จ่ายใบสำคัญค่าเช่าสำนักงานซ้ำเบิ้ลสองดีลลอยตัว",
      "opt-6": "F) สอดไส้ยอดทำความสะอาดแม่บ้านปั่นราคาส่งเงินออก",
      "opt-7": "G) อ้างปรับปรุงคลังสินค้าทิพย์พร้อมปัดสิงสู่ HR บั๊ก",
      "opt-8": "H) แปลงบำรุงโรงนาเป็นโอนปั้นกำไรสะสมหนีผู้สอบ",
      "opt-9": "I) ออกใบแจ้งหนี้จัดกระดาษแพงสลับตัวเลขสเตทเม้นท์จริง",
      "opt-10": "J) จำลองทีมกู้หน้ายอดโคมโซเชียลสอดไส้บัญชีคลัง"
    };

    const behaviorLabel = behaviorLabels[correctBehaviorCode] || correctBehaviorCode;

    return {
      correctAmount,
      correctBehaviorCode,
      correctBehaviorLabel: behaviorLabel,
      correctCellKeyword,
      calculationExplanation: `
        • ยอดถอนกสิกรไทยคดีจริง: (450,000 + ${correctAmount.toLocaleString()}) บาท 
        • Credit Total เคลื่อนไหวใน Excel: 450,000 บาท 
        • ดึงสูตรข้ามละเว้นพิกัด: [${correctCellKeyword}] 
        • ยอดผลต่างฉ้อโกง: ${correctAmount.toLocaleString()} บาท (K.Min ชักเข้าส่วนตัว 022-2-21954-3)
      `
    };
  };

  const [editingFeedback, setEditingFeedback] = useState<{ [subId: string]: string }>({});
  const [editingScores, setEditingScores] = useState<{ [subId: string]: string }>({});

  useEffect(() => {
    if (adminSubmissions && adminSubmissions.length > 0) {
      const initFeedback: { [subId: string]: string } = {};
      const initScores: { [subId: string]: string } = {};
      adminSubmissions.forEach((sub) => {
        initFeedback[sub.id] = sub.instructorFeedback || "";
        initScores[sub.id] = sub.score !== null && sub.score !== undefined ? String(sub.score) : "";
      });
      setEditingFeedback((prev) => ({ ...initFeedback, ...prev }));
      setEditingScores((prev) => ({ ...initScores, ...prev }));
    }
  }, [adminSubmissions]);

  const handleSendFeedback = async (id: string) => {
    const feedbackText = editingFeedback[id] || "";
    const scoreVal = editingScores[id];
    try {
      const res = await fetch("/api/admin/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id, 
          instructorFeedback: feedbackText,
          instructorScore: scoreVal !== "" && scoreVal !== null && scoreVal !== undefined ? Number(scoreVal) : undefined
        }),
      });
      if (res.ok) {
        alert("บันทึกคำแนะนำ (Feedback) และคะแนนส่งปรับปรุงเรียบร้อยแล้ว!");
        fetchAdminSubmissions();
      } else {
        const errData = await res.json();
        alert("ไม่สามารถนำส่งข้อมูลป้อนกลับ: " + (errData.error || ""));
      }
    } catch (err) {
      console.error(err);
      alert("ไม่สามารถสถาปนาลิงก์ไปติชมได้");
    }
  };

  const handleDeleteSubmission = async (id: string) => {
   
    try {
      const res = await fetch(`/api/admin/submissions/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchAdminSubmissions();
        alert("ทำลายระเบียนข้อมูลเรียบร้อย!");
      } else {
        alert("ไม่สามารถลบข้อมูลได้");
      }
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการลบข้อมูล");
    }
  };

  const handleWipeAllSubmissions = async () => {
    
    try {
      const res = await fetch("/api/admin/submissions", { method: "DELETE" });
      if (res.ok) {
        fetchAdminSubmissions();
        alert("ล้างสารพอร์ตประวัติการส่งงานทั้งหมดหมดเกลี้ยงแล้ว!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleInstructorClick = () => {
    const nextClicks = instructorClicks + 1;
    setInstructorClicks(nextClicks);
    if (nextClicks >= 5) {
      setShowAdminLogin(true);
      setInstructorClicks(0);
    }
  };

  const downloadCSV = () => {
    if (!adminSubmissions || adminSubmissions.length === 0) {
      alert("ไม่มีข้อมูลที่จะดาวน์โหลด");
      return;
    }
    const headers = ["ID", "Student ID", "Student Email", "Submitted Time", "qAmount", "qMethod", "Score", "Written Report", "Feedback"];
    const rows = adminSubmissions.map((sub, idx) => [
      sub.id || idx + 1,
      sub.studentId || "",
      sub.studentEmail || "",
      sub.timestamp || "",
      sub.qAmount || "0",
      sub.qMethod || "",
      sub.score !== undefined && sub.score !== null ? sub.score : "N/A",
      `"${(sub.writtenReport || "").replace(/"/g, '""')}"`,
      `"${(sub.instructorFeedback || "").replace(/"/g, '""')}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `forensic_submissions_${studentId || "admin"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    if (selectedEpisode === null) return;

    let initText = "สวัสดีครับ... ผม K.Min ยินดีต้อนรับครับ พิมพ์ถามผมได้เลย!";
    if (selectedEpisode === 1) {
      initText = "สวัสดีครับ ผม K.Min ฝ่ายบัญชีและการเงินครับ มีข้อมูลชุดพานพาณิชย์รายงานตัวเลขไม่ตรงที่คุณกำลังตามหารึเปล่า?";
    } else if (selectedEpisode === 2) {
      initText = "สวัสดีครับคุณอาจารย์ Alec... ตรวจเรียบร้อยแล้วนะ มีอะไรเพิ่มเติมรึเปล่า?";
    } else if (selectedEpisode === 3) {
      initText = "สวัสดีครับอาจารย์ รอมารายงานความคืบหน้ารวมงบดุลของฝั่งคลังสินค้าอยู่พอดีเลยครับ มีอะไรให้ผมช่วยแกะไหม?";
    } else if (selectedEpisode === 4) {
      initText = "สวัสดีครับ ผมชื่อ K.Min สารรับส่งของพอร์ตโอนเช็คพนักงานมีอะไรให้ชันสูตรประเด็นไหนปรึกษาผมได้ทันทีครับ";
    } else if (selectedEpisode === 5) {
      initText = "ยินดีตอนรับสู่การพิจารณาคดีขั้นสุดท้ายครับ พยานหลักฐานพร้อมหมดแล้ว มีคำถามประเด็นใดสอบถามได้เลย!";
    }

    setChatHistory([
      {
        id: "mod-init",
        role: "model",
        text: initText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }
    ]);
    setStressLevel(15);
    setUnlockedSmokingGuns([]);
    setActiveTab("instructions");
    setQuestionsCount(0);
    localStorage.removeItem("bu_questions_count");
  }, [selectedEpisode]);

  const renderAdminModal = () => {
    if (!showAdminLogin) return null;
    return (
      <div id="admin-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-fadeIn overflow-y-auto">
        <div className={`bg-[#1e293b] border border-slate-755 p-6 rounded-2xl w-full transition-all duration-300 shadow-2xl ${isAdminAuthenticated ? "max-w-5xl" : "max-w-sm"} space-y-4`}>
          <div className="flex items-center justify-between border-b border-slate-705 pb-3">
            <div className="flex items-center gap-2 text-sky-400 font-mono font-bold text-sm">
              <Sparkles className="w-5 h-5 text-[#38bdf8]" />
              <span>BU PORTAL: CENTRAL AUDITING CONTROL</span>
            </div>
            {isAdminAuthenticated && (
              <button
                onClick={() => {
                  setIsAdminAuthenticated(false);
                  setShowAdminLogin(false);
                  setAdminPasswordInput("");
                }}
                className="bg-slate-800 hover:bg-slate-700 text-slate-405 hover:text-white px-2.5 py-1 rounded text-xs transition font-mono border border-slate-70 cursor-pointer"
              >
                LOGOUT ADMIN
              </button>
            )}
          </div>

          {!isAdminAuthenticated ? (
            <div className="space-y-3.5">
              <p className="text-xs text-slate-300 leading-relaxed font-sans text-left">
                กรุณากรอกรหัสผ่านบอร์ดผู้ฝึกสอนจำลอง เพื่อเข้าทบทวนผลคะแนนและประวัติการส่งงานของนักศึกษา (BU ADMIN):
              </p>
              <input
                type="password"
                placeholder="ป้อนรหัสผ่าน"
                value={adminPasswordInput}
                onChange={(e) => setAdminPasswordInput(e.target.value)}
                className="w-full bg-slate-900 border border-slate-755 p-2.5 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-sky-500 text-white text-center font-mono placeholder-slate-600"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (adminPasswordInput === "BUADMIN2024") {
                      setIsAdminAuthenticated(true);
                    } else {
                      alert("รหัสผ่านไม่ถูกต้อง!");
                    }
                  }
                }}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAdminLogin(false);
                    setAdminPasswordInput("");
                  }}
                  className="flex-grow bg-slate-800 hover:bg-slate-700 text-slate-405 py-2.5 rounded-lg text-xs transition duration-200 cursor-pointer text-center font-sans border border-slate-70"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (adminPasswordInput === "BUADMIN2024") {
                      setIsAdminAuthenticated(true);
                    } else {
                      alert("รหัสผ่านไม่ถูกต้อง!");
                    }
                  }}
                  className="flex-grow bg-[#38bdf8] hover:bg-[#7dd3fc] text-[#0f172a] font-bold py-2.5 rounded-lg text-xs transition duration-200 cursor-pointer text-center font-sans"
                >
                  ยืนยัน
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Utility Tools */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-sky-950/20 border border-sky-900/40 p-4 rounded-xl text-xs text-sky-200">
                <div className="space-y-1">
                  <span className="font-bold text-sky-400 block font-mono">⚡ ฟังก์ชั่นระบบกลางบอร์ดผู้ฝึกสอน (ADMIN TOOLS):</span>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    คุณตรวจสอบสถิติรายงานชันสูตร, ดาวน์โหลดข้อมูล CSV นำไปประเมินนอกคลาส หรือล้างฐานข้อมูลการเรียนได้
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  <button
                    onClick={downloadCSV}
                    className="bg-sky-600 hover:bg-sky-550 text-white py-1.5 px-3 rounded text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    📥 Export CSV
                  </button>
                  <button
                    onClick={handleWipeAllSubmissions}
                    className="bg-rose-900 hover:bg-rose-850 text-rose-100 py-1.5 px-3 rounded text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    💥 Wipe All Data
                  </button>
                </div>
              </div>

              {/* Submissions Table / List */}
              <div className="overflow-x-auto border border-slate-800 rounded-xl bg-[#0c101b]/60">
                <table className="w-full text-left text-xs border-collapse min-w-[1200px]">
                  <thead className="bg-[#111827] text-slate-300 uppercase text-[10px] font-mono border-b border-slate-800">
                    <tr>
                      <th className="p-3">ID / รหัส</th>
                      <th className="p-3">Ep / วันที่ยื่น</th>
                      <th className="p-3">สถานะ</th>
                      <th className="p-3">คำตอบนักศึกษา</th>
                      <th className="p-3 bg-emerald-950/30 text-emerald-400">คำเฉลย</th>
                      <th className="p-3">สูตรคำนวณ</th>
                      <th className="p-3 text-center">คะแนน</th>
                      <th className="p-3">รายงานข้อ 3</th>
                      <th className="p-3">คำติชมผู้ฝึกสอน (ติชมข้อ 3 & คะแนนรวม)</th>
                      <th className="p-3 text-center">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850/60">
                    {adminSubmissions.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="p-8 text-center text-slate-500 italic">
                          ไม่พบบันทึกการยื่นตรวจสอบรายงานชันสูตรในฐานข้อมูลบอร์ดระบบ
                        </td>
                      </tr>
                    ) : (
                      adminSubmissions.map((sub) => {
                        const isUnsubmitted = !!sub.isUnsubmitted;
                        const correct = getCorrectAnswersForId(sub.studentId || "");

                        return (
                          <tr key={sub.id} className="hover:bg-slate-900/40 border-b border-slate-850 transition-colors">
                            <td className="p-3 font-mono">
                              <div className="font-bold text-sky-400">{sub.studentId || "N/A"}</div>
                              <div className="text-[10px] text-slate-500">{sub.studentEmail || "N/A"}</div>
                              <div className="text-[9px] text-slate-600 truncate max-w-[120px]">{sub.id}</div>
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 bg-slate-800 text-slate-300 border border-slate-700 text-[10px] rounded font-mono font-bold">
                                Ep. {sub.episode || 1}
                              </span>
                              <div className="text-[9px] text-slate-505 mt-1 font-mono">{sub.timestamp || "N/A"}</div>
                            </td>
                            <td className="p-3">
                              {isUnsubmitted ? (
                                <span className="px-2 py-0.5 bg-amber-955/40 text-amber-400 border border-amber-900/60 text-[10px] rounded">
                                  🔴 เพียงเข้าระบบ (ยังไม่ส่ง)
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 bg-emerald-950/70 text-emerald-400 text-[10px] rounded border border-emerald-900/40">
                                  🟢 ยื่นรายงานเสร็จสิ้น
                                </span>
                              )}
                            </td>
                            <td className="p-3 leading-relaxed">
                              {isUnsubmitted ? (
                                <span className="text-slate-505 italic text-[11px]">รอการทบทวนแก้ไข...</span>
                              ) : (
                                <div className="space-y-0.5 max-w-[180px]">
                                  <div>
                                    <span className="text-slate-550 text-[10px]">เงินตอบ: </span>
                                    <span className="font-mono text-amber-400 font-bold">{parseInt(sub.qAmount || "0").toLocaleString()} บาท</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-550 text-[10px]">พฤติกรรม: </span>
                                    <span className="text-slate-300 font-sans font-medium text-[10.5px] block truncate" title={sub.qMethod || ""}>{sub.qMethod || "N/A"}</span>
                                  </div>
                                </div>
                              )}
                            </td>
                            <td className="p-3 bg-emerald-950/10 leading-relaxed">
                              <div className="space-y-1 max-w-[200px]">
                                <div>
                                  <span className="text-emerald-500/80 text-[10px] block font-sans">ยอดโกงจริง: </span>
                                  <span className="font-mono text-[#10b981] font-bold text-xs">{correct.correctAmount.toLocaleString()} บาท</span>
                                </div>
                                <div>
                                  <span className="text-emerald-500/80 text-[10px] block font-sans">คำเฉลยพฤติกรรม: </span>
                                  <span className="text-emerald-300 text-[10px] block font-sans font-medium leading-normal">{correct.correctBehaviorLabel}</span>
                                </div>
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="bg-[#0c101b] border border-slate-800 p-2 rounded text-[10px] text-sky-400 font-mono leading-relaxed whitespace-pre-line max-w-[250px]">
                                {correct.calculationExplanation}
                              </div>
                            </td>
                            <td className="p-3 text-center">
                              {isUnsubmitted ? (
                                <span className="font-mono text-slate-500 text-[10px]">รอส่ง</span>
                              ) : (
                                <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                                  (sub.score || 0) >= 80 
                                    ? "bg-emerald-950 text-emerald-400 border border-emerald-900" 
                                    : (sub.score || 0) >= 50
                                      ? "bg-amber-955/40 text-amber-400 border border-amber-900/60"
                                      : "bg-rose-955/40 text-rose-400 border border-rose-900/60"
                                }`}>
                                  {sub.score} / 100
                                </span>
                              )}
                            </td>
                            <td className="p-3">
                              {isUnsubmitted ? (
                                <span className="text-slate-505 italic text-[10px]">รอส่ง</span>
                              ) : (
                                <div className="text-slate-300 bg-[#0c101b] p-2 border border-slate-800 rounded text-[10.5px] leading-relaxed max-w-[185px] max-h-[95px] overflow-y-auto whitespace-pre-wrap select-all font-mono">
                                  {sub.writtenReport}
                                </div>
                              )}
                            </td>
                            <td className="p-3">
                              <div className="flex flex-col gap-1.5 min-w-[245px]">
                                <textarea
                                  className="w-full bg-[#0c101b] border border-slate-800 rounded p-1.5 text-[10px] text-slate-205 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono text-white"
                                  rows={3}
                                  placeholder="พิมพ์คำติชมข้อ 3 และผลสรุปที่นี่..."
                                  value={editingFeedback[sub.id] || ""}
                                  onChange={(e) => setEditingFeedback(prev => ({ ...prev, [sub.id]: e.target.value }))}
                                />
                                <div className="flex items-center justify-between gap-1.5">
                                  <label className="flex items-center gap-1 cursor-pointer select-none">
                                    <input
                                      type="checkbox"
                                      checked={!!sub.showReviews}
                                      onChange={async (e) => {
                                        const newVal = e.target.checked;
                                        try {
                                          const res = await fetch("/api/admin/feedback", {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({ id: sub.studentId || sub.id, showReviews: newVal }),
                                          });
                                          if (res.ok) {
                                            fetchAdminSubmissions();
                                          }
                                        } catch (err) {
                                          console.error(err);
                                        }
                                      }}
                                      className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
                                    />
                                    <span className="text-[10px] text-slate-300 font-medium select-none">🔓 เปิดสิทธิ์เฉลยและวิจารณ์ 1-3</span>
                                  </label>
                                  <div className="flex items-center gap-1 select-none">
                                    <span className="text-[10px] text-slate-400 font-bold font-sans">คะแนน:</span>
                                    <input
                                      type="number"
                                      min="0"
                                      max="100"
                                      className="w-12 bg-slate-900 border border-slate-800 rounded p-0.5 text-[10px] font-mono text-[#38bdf8] text-center focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold"
                                      placeholder="0-100"
                                      value={editingScores[sub.id] || ""}
                                      onChange={(e) => setEditingScores(prev => ({ ...prev, [sub.id]: e.target.value }))}
                                    />
                                    <span className="text-[10px] text-slate-500 font-bold">/ 100</span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleSendFeedback(sub.id)}
                                  className="bg-[#059669] hover:bg-[#047857] text-slate-100 font-sans text-[10px] py-1 px-2 rounded font-bold transition-all border border-emerald-600 active:scale-95 cursor-pointer text-center"
                                >
                                  ✔ บันทึกคำติชม & ปรับแก้คะแนนส่งกลับ
                                </button>
                                {sub.instructorFeedback && (
                                  <div className="text-[9px] text-emerald-400 bg-emerald-950/30 p-1 border border-emerald-900/30 rounded mt-0.5 leading-normal">
                                    ✓ ส่งแล้ว: "{sub.instructorFeedback}"
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="p-3 text-center">
                              <button
                                onClick={() => handleDeleteSubmission(sub.id)}
                                className="bg-rose-955/80 hover:bg-rose-900 text-rose-300 hover:text-white px-2 py-1 rounded text-[10px] font-bold border border-rose-900/40 cursor-pointer transition"
                              >
                                ลบข้อมูล
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Close Button */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAdminAuthenticated(false);
                    setShowAdminLogin(false);
                    setAdminPasswordInput("");
                  }}
                  className="bg-slate-800 hover:bg-slate-755 text-slate-300 py-2.5 px-6 rounded-lg text-xs transition duration-200 cursor-pointer font-sans font-bold"
                >
                  ปิดหน้าต่างควบคุม
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };


  if (selectedEpisode === null) {
    const EPISODES = [
      { ep: 1, title: "ม่านมายา พนักงานบัญชีปริศนา Ep. 1", desc: "บัญชีเงินล้าน", active: true, tag: "" },
      { ep: 2, title: "เงาร้ายใต้ตัวเลข Ep. 2", desc: "พนักงานเงา (Ghost Employees)", active: true, tag: "" },
      { ep: 3, title: "เส้นทางสายปริศนา Ep. 3", desc: "อินวอยซ์หลงทาง", active: true, tag: "" },
      { ep: 4, title: "แกะรอยบัญชีผี Ep. 4", desc: "รั่วกันหมด", active: true, tag: "" },
      { ep: 5, title: "บทสรุปแห่งสัจธรรม Ep. 5", desc: "อะมิตาพุต", active: true, tag: "" }
    ];

    return (
      <div className="min-h-screen bg-[#0b0f19] text-slate-200 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
        {/* BU Decorative background ambient accents */}
        <div className="absolute top-10 right-10 w-96 h-96 bg-indigo-900/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-rose-955/10 rounded-full blur-3xl pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-2xl bg-[#111827]/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 relative z-10"
        >
          {/* Header BU Crest and Title */}
          <div className="text-center space-y-3">
            <div 
              onClick={() => setShowAdminLogin(true)}
              title="สิทธิ์ระบบบอร์ดกลาง (BU ADMIN ACCESS)"
              className="mx-auto w-16 h-16 rounded-full bg-gradient-to-tr from-[#3b82f6] to-[#ec4899] p-0.5 flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 active:scale-95 transition-all"
            >
              <div className="w-full h-full bg-[#111827] rounded-full flex items-center justify-center text-[#38bdf8] font-mono text-xl font-bold">
                BU
              </div>
            </div>
            
            {/* Student ID Banner if Logged In on selection screen */}
            {isLoggedIn && (
              <div className="flex items-center justify-center gap-2 bg-[#1e293b]/80 border border-slate-800 rounded-lg py-1 px-3 max-w-xs mx-auto text-xs shadow-inner">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-slate-400 font-sans">ผู้ใช้งาน:</span>
                <strong className="text-[#38bdf8] font-mono">{studentId}</strong>
                <button
                  type="button"
                  onClick={handleStudentLogout}
                  className="bg-slate-800 hover:bg-[#991b1b]/80 text-[#fecdd3] hover:text-white px-1.5 py-0.5 rounded text-[9px] font-mono font-bold transition ml-1 cursor-pointer"
                >
                  LOGOUT
                </button>
              </div>
            )}

            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1.5 font-mono">
                <span className="text-[10px] bg-[#075985]/30 text-[#38bdf8] font-extrabold px-2 py-0.5 rounded border border-[#38bdf8]/40 uppercase tracking-widest">
                  Series Selection
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-300 font-bold px-2 py-0.5 rounded border border-slate-700/60 uppercase">
                  AC432 Forensic Series
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                The Accountant&apos;s Veil
              </h1>
              <p className="text-xs text-slate-400 max-w-md mx-auto font-sans leading-relaxed text-slate-405">
                ระบบสืบสวนและเปิดข้อมูลบัญชีซ่อนเร้น บทเรียนจำลองค้นหาความจริง คณะบัญชี มหาวิทยาลัยกรุงเทพ
              </p>
            </div>
          </div>

          <div className="border-t border-slate-800/80 my-2" />

          {/* Episode List Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase font-mono">กรุณาเลือก Episode</h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#1e293b] text-[#38bdf8] border border-slate-700 font-mono">5 Episodes Unlocked Sequentially</span>
            </div>
            
            <div className="grid grid-cols-1 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
              {EPISODES.map((item) => {
                const isPlayable = item.ep === 1 || !!episodeStatus[item.ep as 1|2|3|4|5];
                const isCompleted = !!episodeStatus.completed?.[item.ep as 1|2|3|4|5];

                return (
                  <button
                    key={item.ep}
                    type="button"
                    onClick={() => {
                      if (!isPlayable) {
                        if (!isLoggedIn) {
                          alert("กรุณาเข้าสู่ระบบด้วยรหัสนักศึกษา เพื่อตรวจสอบประวัติและเล่นตามลำดับ (Ep 1 -> 5)");
                        } else {
                          alert(`ขออภัย ยอดสืบค้นภารกิจกดยังไม่ผ่านเกณฑ์การประเมิน! คุณต้องทำภารกิจ Ep. ${item.ep - 1} ให้สำเร็จก่อน จึงจะผ่านไปเล่น Ep. ${item.ep} ถัดไปได้`);
                        }
                        return;
                      }
                      setSelectedEpisode(item.ep);
                      localStorage.setItem("bu_selected_episode", String(item.ep));
                    }}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                      !isPlayable
                        ? "bg-slate-900/35 border-slate-900/40 text-slate-550 opacity-60 cursor-not-allowed"
                        : isCompleted
                          ? "bg-emerald-950/20 hover:bg-[#10b981]/15 border-emerald-900/40 hover:border-emerald-500/55 group cursor-pointer"
                          : "bg-[#1e293b]/50 hover:bg-[#1e293b] border-slate-800 hover:border-sky-500/80 group cursor-pointer"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {isCompleted ? (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-900 text-emerald-400 border border-emerald-700/60 flex items-center gap-1 shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>สำเร็จแล้ว</span>
                          </span>
                        ) : !isPlayable ? (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-950 text-slate-500 border border-slate-850 flex items-center gap-1 shrink-0">
                            <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span>ล็อค</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#0284c7]/20 text-[#38bdf8] border border-[#0284c7]/40 shrink-0">
                            เปิดอยู่
                          </span>
                        )}
                        <h4 className={`text-xs sm:text-sm font-bold transition-colors font-sans ${
                          !isPlayable ? "text-slate-500" : isCompleted ? "text-emerald-300 group-hover:text-emerald-400" : "text-white group-hover:text-sky-400"
                        }`}>
                          {item.title}
                        </h4>
                      </div>
                      <p className={`text-[11px] font-sans leading-relaxed ${!isPlayable ? "text-slate-550" : "text-slate-400"}`}>
                        {item.desc}
                      </p>
                    </div>
                    <div className="shrink-0 flex items-center justify-end">
                      {isCompleted ? (
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 group-hover:translate-x-1 transition-all">
                          ทบทวนภารกิจ &rarr;
                        </span>
                      ) : !isPlayable ? (
                        <span className="text-xs font-mono text-slate-600">
                          Locked 🔒
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-[#38bdf8] opacity-80 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                          เริ่มสืบคดี &rarr;
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="text-center pt-2 text-[10px] text-slate-600 font-sans">
            คณะบัญชี มหาวิทยาลัยกรุงเทพ (BU) | AC432 Forensic Series
          </div>
        </motion.div>
        {/* Render Admin Access Modal Overlay directly here on landing screen */}
        {renderAdminModal()}
      </div>
    );
  }


  // Chat Submission to server.ts Route
  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    if (questionsCount >= 10) {
      alert("⚠️ คุณใช้สิทธิ์แชทสอบถาม K.Min ครบเกณฑ์โควตา 10 คำถามเรียบร้อยแล้ว! กรุณายื่นผลชันสูตรคดีด้านขวาเพื่อรับคะแนนวิเคราะห์สรุป");
      return;
    }

    const nextCount = questionsCount + 1;
    setQuestionsCount(nextCount);
    localStorage.setItem("bu_questions_count", String(nextCount));

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatHistory(prev => [...prev, userMsg]);
    setUserInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: [...chatHistory, userMsg],
          studentId: studentIdWithEp,
          studentEmail,
          target: selectedEpisode === 2 ? interrogationTarget : "KM"
        })
      });

      if (res.ok) {
        const data = await res.json();
        const modelReply: ChatMessage = {
          id: `mod-${Date.now()}`,
          role: "model",
          text: data.reply || "ไม่สามารถอ่านการวิเคราะห์ได้",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sender: selectedEpisode === 2 ? interrogationTarget : "KM"
        };
        setChatHistory(prev => [...prev, modelReply]);
        if (data.stressIncrease) {
          setStressLevel(prev => Math.min(100, prev + data.stressIncrease));
        }
      } else {
        const err = await res.json();
        alert(err.error || "เกิดข้อผิดพลาดในการเชื่อมต่อกับ K.Min");
      }
    } catch (err) {
      console.error(err);
      alert("ไม่สามารถติดต่อเซิร์ฟเวอร์จำลองการพิมพ์ได้");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    if (selectedEpisode === null) {
      const EPISODES = [
        { ep: 1, title: "ม่านมายา พนักงานบัญชีปริศนา Ep. 1", desc: "บัญชีเงินล้าน", active: true, tag: "" },
        { ep: 2, title: "เงาร้ายใต้ตัวเลข Ep. 2", desc: "พนักงานเงา (Ghost Employees)", active: true, tag: "" },
        { ep: 3, title: "เส้นทางสายปริศนา Ep. 3", desc: "ชันสูตรแกะรอยประเด็นจัดกระดาษข้อมูลสลับใบอินวอยซ์คู่ค้าปลอมขัดงบดุล", active: true, tag: "" },
        { ep: 4, title: "แกะรอยบัญชีผี Ep. 4", desc: "เปิดโปงเอกสารสั่งโอนจ่ายเช็ครั่วไหลสู่นอมินีนมัสการกองทุนสำรองส่วนบุคคล", active: true, tag: "" },
        { ep: 5, title: "บทสรุปแห่งสัจธรรม Ep. 5", desc: "สารบาญรวบรวมพยานหลักฐานเบื้องลึกมัดตัว K.Min ในสารบบพิจารณาคดีขั้นสุดท้าย", active: true, tag: "" }
      ];

      return (
        <div className="min-h-screen bg-[#0b0f19] text-slate-200 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
          {/* BU Decorative background ambient accents */}
          <div className="absolute top-10 right-10 w-96 h-96 bg-indigo-900/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-rose-955/10 rounded-full blur-3xl pointer-events-none" />

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-2xl bg-[#111827]/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 relative z-10"
          >
            {/* Header BU Crest and Title */}
            <div className="text-center space-y-3">
              <div 
                onClick={() => setShowAdminLogin(true)}
                title="สิทธิ์ระบบบอร์ดกลาง (BU ADMIN ACCESS)"
                className="mx-auto w-16 h-16 rounded-full bg-gradient-to-tr from-[#3b82f6] to-[#ec4899] p-0.5 flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 active:scale-95 transition-all"
              >
                <div className="w-full h-full bg-[#111827] rounded-full flex items-center justify-center text-[#38bdf8] font-mono text-xl font-bold">
                  BU
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1.5 font-mono">
                  <span className="text-[10px] bg-[#075985]/30 text-[#38bdf8] font-extrabold px-2 py-0.5 rounded border border-[#38bdf8]/40 uppercase tracking-widest">
                    Series Selection
                  </span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 font-bold px-2 py-0.5 rounded border border-slate-700/60 uppercase">
                    AC432 Forensic Series
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  The Accountant&apos;s Veil
                </h1>
                <p className="text-xs text-slate-400 max-w-md mx-auto font-sans leading-relaxed">
                  ระบบสืบสวนและเปิดข้อมูลบัญชีซ่อนเร้น บทเรียนจำลองค้นหาความจริง คณะบัญชี มหาวิทยาลัยกรุงเทพ
                </p>
              </div>
            </div>

            <div className="border-t border-slate-800/80 my-2" />

            {/* Episode List Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase font-mono">กรุณาเลือก Episode</h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#1e293b] text-[#38bdf8] border border-slate-700 font-mono">5 Episodes Structurally Built</span>
              </div>
              
              <div className="grid grid-cols-1 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
                {EPISODES.map((item) => (
                  <button
                    key={item.ep}
                    onClick={() => {
                      setSelectedEpisode(item.ep);
                      localStorage.setItem("bu_selected_episode", String(item.ep));
                    }}
                    className="w-full text-left p-3.5 rounded-xl border transition-all duration-200 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#1e293b]/50 hover:bg-[#1e293b] border-slate-800 hover:border-sky-500/80 group cursor-pointer"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {item.tag && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            item.ep === 1 
                              ? "bg-sky-950 text-[#38bdf8] border border-sky-900/60"
                              : "bg-slate-800 text-slate-405 border border-slate-700/60"
                          }`}>
                            {item.tag}
                          </span>
                        )}
                        <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-sky-400 transition-colors font-sans">
                          {item.title}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                    <div className="shrink-0 flex items-center justify-end">
                      <span className="text-xs font-bold text-[#38bdf8] opacity-80 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                        ทำภารกิจนี้ &rarr;
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="text-center pt-2 text-[10px] text-slate-600 font-sans">
              คณะบัญชี มหาวิทยาลัยกรุงเทพ (BU) | AC432 Forensic Series
            </div>
          </motion.div>
          {/* Render Admin Access Modal Overlay directly here on landing screen */}
          {renderAdminModal()}
        </div>
      );
    }

    // Selected episode title helper
    const selectedEpTitle = selectedEpisode === 1 
      ? "ม่านมายา พนักงานบัญชีปริศนา Ep. 1" 
      : selectedEpisode === 2 
        ? "เงาร้ายใต้ตัวเลข Ep. 2" 
        : selectedEpisode === 3 
          ? "เส้นทางสายปริศนา Ep. 3" 
          : selectedEpisode === 4 
            ? "แกะรอยบัญชีผี Ep. 4" 
            : "บทสรุปแห่งสัจธรรม Ep. 5";

    return (
      <div className="min-h-screen bg-[#0b0f19] text-slate-200 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
        {/* BU Decorative background ambient accents */}
        <div className="absolute top-10 right-10 w-96 h-96 bg-indigo-900/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-rose-955/10 rounded-full blur-3xl pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md bg-[#111827]/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 relative z-10"
        >
          {/* Header BU Crest and Title */}
          <div className="text-center space-y-2">
            <div 
              onClick={() => setShowAdminLogin(true)}
              title="สิทธิ์ระบบบอร์ดกลาง (BU ADMIN ACCESS)"
              className="mx-auto w-16 h-16 rounded-full bg-gradient-to-tr from-[#3b82f6] to-[#ec4899] p-0.5 flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 active:scale-95 transition-all"
            >
              <div className="w-full h-full bg-[#111827] rounded-full flex items-center justify-center text-[#38bdf8] font-mono text-xl font-bold">
                BU
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1.5 font-mono">
                <span className="text-[10px] bg-[#075985]/30 text-[#38bdf8] font-extrabold px-2 py-0.5 rounded border border-[#38bdf8]/40 uppercase tracking-widest">
                  Case Files Login
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-300 font-bold px-2 py-0.5 rounded border border-slate-700/60 uppercase">
                  Active Episode
                </span>
              </div>
              <h1 className="text-lg font-bold text-white tracking-tight">
                {selectedEpTitle}
              </h1>
              <p className="text-xs text-slate-405 max-w-xs mx-auto font-sans leading-relaxed">
                ระบุรหัสนักศึกษาเพื่อเริ่มต้นชันสูตรสัจธรรมในคดีสืบสวนจำลองนี้
              </p>
            </div>
          </div>

          <div className="border-t border-slate-800/80 my-2" />

          {/* Login Form */}
          <form onSubmit={handleStudentLogin} className="space-y-4">
            {loginError && (
              <div className="bg-rose-955/70 border border-rose-900/60 p-3 rounded-lg text-xs text-rose-300 font-sans flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{loginError}</span>
              </div>
            )}

            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                <span>รหัสนักศึกษา (10 หลัก เท่านั้น) *</span>
              </label>
              <input
                type="text"
                placeholder="ป้อนรหัสนักศึกษา 10 หลัก (เช่น 1640901234)"
                value={loginIdInput}
                onChange={(e) => setLoginIdInput(e.target.value)}
                maxLength={10}
                className="w-full bg-[#0b0f1a] border border-slate-755 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-sky-500 placeholder-slate-600 shadow-inner"
                required
              />
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                <span>อีเมลนักศึกษา (Student Email) *</span>
              </label>
              <input
                type="type"
                placeholder="ป้อนอีเมล (เช่น student@bu.ac.th)"
                value={loginEmailInput}
                onChange={(e) => setLoginEmailInput(e.target.value)}
                className="w-full bg-[#0b0f1a] border border-slate-755 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-sky-500 placeholder-slate-600 shadow-inner"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#4f46e5] hover:bg-[#4338ca] text-slate-100 font-sans font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#4f46e5]/10 cursor-pointer"
            >
              <GraduationCap className="w-5 h-5 text-indigo-200" />
              <span>เข้าสู่คดีนี้ (Access Case Files)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedEpisode(null);
                localStorage.removeItem("bu_selected_episode");
              }}
              className="w-full bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 font-sans text-slate-300 font-bold py-2 rounded-xl text-[11px] flex items-center justify-center gap-1 transition duration-200 cursor-pointer"
            >
              &larr; ย้อนกลับไปหน้าเลือกตอน (Select Episode)
            </button>
          </form>

          {/* Educational Note */}
          <div className="bg-slate-900/50 border border-slate-800 p-3.5 rounded-lg text-[11px] leading-relaxed text-slate-400 font-sans text-left">
            <span className="font-bold text-slate-300 block mb-0.5 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-[#38bdf8] shrink-0" />
              <span>ภารกิจในคดีนี้ (Note):</span>
            </span>
            วิเคราะห์บันทึกและสืบหาหลักฐานในตอนที่คุณเลือก สอบความเคลื่อนไหวงวดต่างๆ กับผู้รับผิดชอบ และสรุปคำตอบให้ตรงหลักความจริงเชิงประจักษ์
          </div>

          <div className="text-center pt-2 text-[10px] text-slate-600 font-sans animate-pulse">
            คณะบัญชี มหาวิทยาลัยกรุงเทพ (BU) | AC432 Forensic Series
          </div>
        </motion.div>
        {/* Render Admin Access Modal Overlay directly here on landing screen */}
        {renderAdminModal()}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 flex flex-col font-sans">
      
      {/* Top Banner Header - Professional Polish Theme */}
      <header className="bg-[#0f172a] border-b border-slate-700 py-3.5 px-4 sm:px-8 flex flex-col md:flex-row justify-between items-center gap-4 shadow-xl shrink-0">
        <div className="flex items-center gap-4 text-center sm:text-left flex-wrap justify-center sm:justify-start">
          <div className="flex items-center gap-2 bg-[#1e293b] border border-slate-700 px-3 py-1.5 rounded-lg shadow-sm">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#38bdf8] font-bold">CASE #AC432-SEC LIVE INTERROGATION</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5 justify-center sm:justify-start mb-0.5">
              <span className="text-[9px] bg-sky-600/25 text-[#38bdf8] font-extrabold px-1.5 py-0.5 rounded border border-[#38bdf8]/30 uppercase tracking-widest font-mono">
                Case Dossier
              </span>
              <span className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono border border-slate-700/60 font-sans">
                Bangkok University
              </span>
              <span className="text-[9px] bg-slate-855 text-[#38bdf8] px-1.5 py-0.5 rounded font-mono border border-slate-700 text-slate-300">
                คณะบัญชี
              </span>
            </div>
            <h1 className="text-lg sm:text-xl tracking-tight flex items-center gap-2 justify-center sm:justify-start">
              <span className="text-slate-400 font-sans font-normal border-r border-[#334155] pr-2 hidden sm:inline text-sm">
                {selectedEpisode === 1 
                  ? "ม่านมายา พนักงานบัญชีปริศนา Ep. 1" 
                  : selectedEpisode === 2 
                    ? "เงาร้ายใต้ตัวเลข Ep. 2" 
                    : selectedEpisode === 3 
                      ? "เส้นทางสายปริศนา Ep. 3" 
                      : selectedEpisode === 4 
                        ? "แกะรอยบัญชีผี Ep. 4" 
                        : "บทสรุปแห่งสัจธรรม Ep. 5"}
              </span>
              <span className="font-serif italic font-semibold text-white">The Accountant&apos;s Veil</span>
              <button
                onClick={() => {
                  setSelectedEpisode(null);
                  localStorage.removeItem("bu_selected_episode");
                }}
                className="bg-slate-800 hover:bg-slate-700 hover:text-sky-405 border border-slate-700/80 text-slate-350 px-2.5 py-0.5 rounded text-[10px] font-sans font-semibold transition-all cursor-pointer ml-1.5 shadow-sm shrink-0"
                title="ย้อนกลับไปหน้าเลือก Episode (Switch Episode)"
              >
                สลับ Ep. อื่น
              </button>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3.5">
          {/* Student Profile & Logout Badge */}
          <div className="flex items-center gap-3 bg-[#1e293b]/70 border border-slate-700/80 px-4 py-1.5 rounded-xl text-xs font-sans">
            <div className="text-right">
              <span className="text-[9px] uppercase text-slate-500 font-bold block leading-none mb-1">STUDENT DOCKET</span>
              <span className="text-xs text-[#38bdf8] font-bold font-mono">{studentId}</span>
            </div>
            <div className="w-px h-6 bg-slate-700" />
            <button
              onClick={handleStudentLogout}
              className="bg-slate-800 hover:bg-rose-950/80 border border-slate-700 hover:border-rose-900/45 text-slate-300 hover:text-rose-200 px-2 py-1 rounded text-[10px] font-mono font-bold transition-all cursor-pointer"
              title="ออกจากระบบเพื่อป้อนรหัสนักศึกษาคนอื่น"
            >
              LOGOUT
            </button>
          </div>

          {/* LEAD INSTRUCTOR INTERACTIVE ACCENTS */}
          <div 
            onClick={handleInstructorClick}
            className="flex items-center gap-4 bg-[#1e293b]/70 border border-slate-700/80 px-4 py-2 rounded-xl text-xs shrink-0 cursor-pointer select-none hover:border-sky-500/50 transition-all font-sans"
            title="เคาะเพื่อเข้าระบบ Admin"
          >
            <div className="text-right">
              <p className="text-[9px] uppercase text-slate-500 font-bold tracking-tight mb-0.5">Lead Instructor</p>
              <p className="text-xs font-serif italic font-semibold text-white hover:text-sky-400">ALec</p>
            </div>
            <div className="w-px h-8 bg-slate-700/60" />
            <div className="text-left font-mono">
              <p className="text-[9px] uppercase text-slate-500 font-bold tracking-tight mb-0.5">Active Terminal</p>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#38bdf8] animate-pulse"></span>
                <span className="text-xs text-[#38bdf8] font-bold">Group Forensic 33</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Flex Workspace */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* LEFT WORKSPACE PANEL: Chat / Interrogation Room */}
        <section id="interrogation-room" className="w-full lg:w-[450px] bg-[#1e293b] border-b lg:border-b-0 lg:border-r border-slate-700 flex flex-col h-[500px] lg:h-auto overflow-hidden">
          
          {/* Dynamic Suspect Bio Card */}
          <div className="bg-[#0f172a]/60 p-4 border-b border-slate-700 shrink-0">
            <div className="flex items-center gap-3.5">
              <div className="relative">
                <div className="w-12 h-12 rounded bg-slate-850 border border-slate-700 flex items-center justify-center text-slate-300 font-bold shadow-md">
                  KM
                </div>
                <div className="absolute -bottom-1.5 -right-1.5 bg-red-600/90 text-[8px] font-bold px-1.5 py-0.5 rounded border border-red-950 flex items-center justify-center h-4 text-white uppercase font-mono tracking-wider">
                  SUSPECT
                </div>
              </div>
              <div className="flex-1 space-y-0.5">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-slate-200">K.Min ณภัทร</h2>
                  <span className="text-[10px] font-mono text-sky-400 bg-sky-950/80 px-2 py-0.5 border border-sky-900/60 rounded">
                    Senior Accountant
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  อายุงาน 5 ปี | คุมสมุดรายวัน Cash Book ของ VeloBike
                </p>
              </div>
            </div>

            {/* Dynamic Psychological Stress Meter Panel */}
            <div className={`mt-4 border border-slate-700 rounded-lg p-3.5 bg-slate-900/40 space-y-2.5 transition-colors duration-500`}>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-bold font-mono tracking-wider text-[10px] uppercase flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-rose-500 animate-pulse" />
                  <span>ดัชนีความเครียดผู้ถูกสงสัย (Stress Index)</span>
                </span>
                <span className={`text-xs font-mono font-bold ${stressInfo.color}`}>
                  {stressLevel}%
                </span>
              </div>
              
              {/* Stress Progress bar view */}
              <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className={`h-full bg-gradient-to-r ${stressInfo.color} transition-all duration-700`}
                  style={{ width: `${stressLevel}%` }}
                />
              </div>

              {/* Auxiliary Heart beats metrics */}
              <div className="flex items-center justify-between mt-1 text-[11px] font-mono">
                <span className="text-slate-400 flex items-center gap-1">Focus State: <strong className="text-slate-300 font-sans font-normal">{stressInfo.label}</strong></span>
                <span className="text-rose-400 flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500 animate-pulse" />
                  <span>ชีพจร: <strong className="text-rose-200">{heartRate} BPM</strong></span>
                </span>
              </div>
            </div>

            {/* 10-Questions Countdown Alert Indicator Banner */}
            <div className="mt-3 flex items-center justify-between bg-[#0a1220] p-2.5 border border-slate-800 rounded-lg text-xs font-sans leading-none shadow-inner">
              <span className="text-slate-400 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-sky-400" />
                <span>{selectedEpisode === 2 ? "โควตาคำถามทั้งหมดของคุณ:" : "โควตาคำถาม K.Min ของคุณ:"}</span>
              </span>
              <span className={`font-mono font-black text-xs px-2.5 py-1 rounded-md border ${
                questionsCount >= 10 
                  ? "bg-red-950/80 text-red-400 border-red-900/60 animate-pulse" 
                  : questionsCount >= 8
                    ? "bg-orange-950/80 text-orange-400 border-orange-900/60 animate-pulse"
                    : "bg-sky-950/80 text-sky-400 border-sky-900/60"
              }`}>
                {10 - questionsCount} / 10 คำถามคงเหลือ
              </span>
            </div>

            {/* Interrogation Character Selector Tab (Ep 2 Specific) */}
            {selectedEpisode === 2 && (
              <div className="mt-3 grid grid-cols-2 gap-2 bg-[#090d16] p-1.5 border border-slate-800 rounded-lg shadow-inner">
                <button
                  type="button"
                  onClick={() => setInterrogationTarget("KM")}
                  className={`py-2 px-1 text-[11px] font-bold rounded-md transition-all cursor-pointer flex items-center justify-center gap-1 border ${
                    interrogationTarget === "KM"
                      ? "bg-[#075985] text-white border-sky-500/40 shadow"
                      : "bg-transparent text-slate-400 border-transparent hover:text-slate-200"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${interrogationTarget === "KM" ? "bg-sky-400 animate-ping" : "bg-sky-600"}`} />
                  <span>K. Min ณภัทร (บัญชี)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInterrogationTarget("JJ")}
                  className={`py-2 px-1 text-[11px] font-bold rounded-md transition-all cursor-pointer flex items-center justify-center gap-1 border ${
                    interrogationTarget === "JJ"
                      ? "bg-purple-900 text-white border-purple-500/40 shadow"
                      : "bg-transparent text-slate-400 border-transparent hover:text-slate-200"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${interrogationTarget === "JJ" ? "bg-purple-400 animate-ping" : "bg-purple-600"}`} />
                  <span>J. Jin เจนจิรา (จัดซื้อ)</span>
                </button>
              </div>
            )}
          </div>

          {/* Interrogation Logs Viewport */}
          <div className="flex-1 p-5 overflow-auto space-y-5 bg-[#0f172a] shadow-inner">
            {chatHistory.map((msg) => {
              const isSys = msg.id.startsWith("sys-");
              const isUser = msg.role === "user";

              if (isSys) {
                return (
                  <div key={msg.id} className="bg-slate-900 border border-slate-700/80 p-3 rounded-lg text-center text-xs text-sky-400 leading-relaxed max-w-sm mx-auto shadow font-mono">
                    <p className="font-bold flex items-center justify-center gap-1.5 mb-1 text-[11px] uppercase tracking-wider">
                      <Sparkles className="w-4 h-4 text-[#38bdf8] shrink-0" />
                      <span>Audit Alert System Report</span>
                    </p>
                    {msg.text}
                  </div>
                );
              }

              return (
                <div
                  key={msg.id}
                  className={`flex ${isUser ? "justify-end" : "justify-start"} items-start gap-3`}
                >
                  {isUser ? (
                    <div className="flex flex-col items-end max-w-[85%] space-y-1">
                      <div className="flex items-center gap-2 mb-0.5 justify-end">
                        <span className="text-[9px] uppercase font-bold text-[#38bdf8] tracking-widest font-mono">Investigator</span>
                        <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-650 flex items-center justify-center text-[10px] font-bold text-white uppercase tracking-wider font-mono">
                          DET
                        </div>
                      </div>
                      <div className="p-3.5 bg-slate-800 text-slate-200 rounded-tl-xl rounded-b-xl border border-slate-700/60 text-xs sm:text-[13px] leading-relaxed break-words font-sans shadow-md">
                        {msg.text}
                      </div>
                      <span className="text-[9px] text-slate-500 font-mono block pr-1">
                        {msg.timestamp}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-start max-w-[85%] space-y-1">
                      <div className="flex items-center gap-2 mb-0.5 justify-start">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-serif font-black italic text-white shadow-sm border ${
                          msg.sender === "JJ" 
                            ? "bg-purple-900 border-purple-400/30" 
                            : "bg-[#075985] border-sky-400/30"
                        }`}>
                          {msg.sender === "JJ" ? "JJ" : "KM"}
                        </div>
                        <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider font-mono">
                          {msg.sender === "JJ" ? "J. Jin เจนจิรา (จัดซื้อ)" : "K. Min ณภัทร (บัญชี)"}
                        </span>
                      </div>
                      <div className={`p-3.5 rounded-tr-xl rounded-b-xl font-medium italic text-xs sm:text-[13px] leading-relaxed break-words font-sans shadow-md border ${
                        msg.sender === "JJ"
                          ? "bg-purple-950/85 text-purple-100 border-purple-500/30 font-medium"
                          : "bg-[#094e75] text-sky-100 border-[#0ea5e9]/30"
                      }`}>
                        {msg.text}
                      </div>
                      <span className="text-[9px] text-slate-500/80 font-mono block pl-1">
                        {msg.timestamp}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
            
            {loading && (
              <div className="flex justify-start items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-serif font-black italic text-white animate-pulse border ${
                  selectedEpisode === 2 && interrogationTarget === "JJ"
                    ? "bg-purple-900 border-purple-400/30"
                    : "bg-[#075985] border-sky-400/30"
                }`}>
                  {selectedEpisode === 2 && interrogationTarget === "JJ" ? "JJ" : "KM"}
                </div>
                <div className="bg-slate-800/80 border border-slate-700/60 p-3 rounded-tr-xl rounded-b-xl text-xs text-slate-400 italic font-sans flex items-center gap-2">
                  <span className="inline-block w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                  <span className="inline-block w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                  <span className="inline-block w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Preset Prompts Help Center - Squeezable container */}
          <div className="bg-[#0f172a]/90 p-2.5 border-t border-slate-700 shrink-0">
            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1.5 px-1 font-mono">
              {selectedEpisode === 2 ? "💡 แนะนำคำถามซักฟอกพยานปากสำคัญ:" : "💡 แนะนำหัวข้อเพื่อเค้นข้อมูล K.Min:"}
            </div>
            <div className="flex flex-col gap-1 max-h-[140px] overflow-y-auto pr-1">
              {(selectedEpisode === 2 ? PRESET_PROMPTS_EP2 : PRESET_PROMPTS).map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt.text)}
                  disabled={loading || questionsCount >= 10}
                  className="text-left bg-slate-900 hover:bg-slate-800 text-[11px] text-[#38bdf8] hover:text-sky-305 border border-slate-850 p-2 rounded-lg transition-all line-clamp-1 truncate cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-sans"
                >
                  {prompt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Typing Area */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(userInput);
            }}
            className="p-3 bg-slate-900 border-t border-slate-700/60 flex gap-2 shrink-0"
          >
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              disabled={loading || questionsCount >= 10}
              placeholder={questionsCount >= 10 ? "🔴 โควตาคำถามสิ้นสุดแล้ว กรุณายื่นรายงานฯ ด้านขวา" : "ซักฟอกข้อมูล/ถามคำถามที่นี่..."}
              className="flex-grow bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 disabled:opacity-60 font-sans"
            />
            <button
              type="submit"
              disabled={loading || !userInput.trim() || questionsCount >= 10}
              className="bg-[#38bdf8] hover:bg-[#7dd3fc] text-[#0f172a] px-3.5 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center cursor-pointer font-sans shadow-md"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

        </section>

        {/* RIGHT WORKSPACE PANEL: Game Play/Auditing Desk */}
        <section id="auditing-desk" className="flex-1 flex flex-col h-full overflow-hidden">
          
          {/* Main Top Horizontal Tabs Nav Rail */}
          <div className="bg-[#111827] border-b border-slate-700 p-3.5 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0 shadow-md">
            <div className="flex flex-wrap gap-1.5 shrink-0">
              <button
                onClick={() => setActiveTab("instructions")}
                className={`flex items-center gap-1.5 py-1.5 px-3 rounded font-semibold transition-all cursor-pointer text-xs
                  ${activeTab === "instructions" 
                    ? "bg-orange-500/15 text-orange-400 border border-orange-500/35 shadow-sm" 
                    : "bg-slate-800/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent"}`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>1. ทำความเข้าใจคดี</span>
              </button>

              <button
                onClick={() => setActiveTab("sheets")}
                className={`flex items-center gap-1.5 py-1.5 px-3 rounded font-semibold transition-all cursor-pointer text-xs
                  ${activeTab === "sheets" 
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/35 shadow-sm" 
                    : "bg-slate-800/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent"}`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>2. สมุดรายจ่าย Excel</span>
                {unlockedSmokingGuns.includes("mismatch_sum") && (
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                )}
              </button>

              <button
                onClick={() => setActiveTab("bank")}
                className={`flex items-center gap-1.5 py-1.5 px-3 rounded font-semibold transition-all cursor-pointer text-xs
                  ${activeTab === "bank" 
                    ? "bg-amber-500/15 text-amber-400 border border-amber-500/35 shadow-sm" 
                    : "bg-slate-800/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent"}`}
              >
                <Landmark className="w-3.5 h-3.5" />
                <span>3. สเตทเม้นท์ธนาคาร</span>
                {unlockedSmokingGuns.includes("mn_payment") && (
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                )}
              </button>

              <button
                onClick={() => setActiveTab("employee")}
                className={`flex items-center gap-1.5 py-1.5 px-3 rounded font-semibold transition-all cursor-pointer text-xs
                  ${activeTab === "employee" 
                    ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/35 shadow-sm" 
                    : "bg-slate-800/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent"}`}
              >
                <User className="w-3.5 h-3.5" />
                <span>4. ทะเบียนประวัติ K.Min</span>
                {unlockedSmokingGuns.includes("bank_match") && (
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                )}
              </button>

              <button
                onClick={() => setActiveTab("casefile")}
                className={`flex items-center gap-1.5 py-1.5 px-3 rounded font-semibold transition-all cursor-pointer text-xs
                  ${activeTab === "casefile" 
                    ? "bg-rose-500/15 text-rose-400 border border-rose-500/35 shadow-sm" 
                    : "bg-slate-800/40 text-slate-405 hover:text-slate-200 hover:bg-slate-800 border border-transparent"}`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>5. ยื่นรายงานผลการตรวจสอบ (Submit)</span>
              </button>

            </div>

            {/* Smoking Guns Count HUD badge */}
            <div className="flex items-center gap-1.5 bg-[#0f172a] border border-slate-700 px-3 py-1.5 rounded text-xs font-bold text-amber-400 shrink-0 font-mono">
              <TrendingUp className="w-3.5 h-3.5 text-[#38bdf8]" />
              <span>เบาะแส: {unlockedSmokingGuns.length} / 3 ชิ้น</span>
            </div>
          </div>

          {/* Dynamic Window Display based on Active Navigation Tab */}
          <div className="flex-1 overflow-hidden min-h-[350px]">
            <AnimatePresence mode="wait">
              {activeTab === "instructions" && (
                <motion.div
                  key="instructions"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="h-full overflow-auto bg-slate-900/60 border border-slate-800 rounded-xl p-5 sm:p-6 space-y-4"
                >
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                    <Compass className="w-6 h-6 text-orange-500" />
                    <h2 className="text-base font-bold text-slate-100 font-sans">
                      คู่มือการสืบสวนสอบสวนเกี่ยวกับบัญชี (Forensic Auditing Brief)
                    </h2>
                  </div>

                  <p className="text-xs sm:text-[13px] leading-relaxed text-slate-300 font-sans text-justify">
                    ยินดีต้อนรับสู่วันปฏิบัติการจำลองของ <strong>&ldquo;นักสืบบัญชีดีเทล (Forensic Accountant)&rdquo;</strong> 
                    ภารกิจของคุณคือการตรวจสอบความถูกต้องสอดคล้องกันของบันทึกสมุดบัญชีเงินสด และข้อมูลความเคลื่อนไหวทางธุรกรรมของบริษัท VeloBike Logistics Co., Ltd. 
                    เพื่อค้นหาข้อผิดพลาดและวิเคราะห์ความน่าเชื่อถือภายในองค์กร โดยคุณสามารถประสานงานกับผู้รับผิดชอบหลักฝ่ายบัญชีคือ <strong>K.Min ณภัทร</strong>
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-2 text-xs">
                      <h3 className="font-bold text-slate-200 flex items-center gap-1 font-sans">
                        <Flame className="w-4 h-4 text-orange-500" />
                        <span>ขั้นตอนการปฏิบัติงานและสืบค้น:</span>
                      </h3>
                      <ul className="list-decimal list-inside space-y-1 text-slate-400 text-[11.5px] leading-relaxed font-sans">
                        <li>
                          เปิดแท็บ <strong>&ldquo;2. สมุดรายจ่าย Excel&rdquo;</strong> เพื่อตรวจสอบรายการบันทึกสมุดค่าใช้จ่ายและตรวจสอบวิธีการคำนวณสรุปผลยอดสะสมย่อมุมต่างทางการบัญชี
                        </li>
                        <li>
                          วิเคราะห์เทียบเคียงประวัติในแท็บ <strong>&ldquo;3. สเตทเม้นท์ธนาคาร&rdquo;</strong> เพื่อสืบค้นรายการเคลื่อนไหวโอนสุทธิทางการเงินจริงที่สะท้อนจากระบบธนาคาร
                        </li>
                        <li>
                          ตรวจสอบข้อมูลในแท็บ <strong>&ldquo;4. ทะเบียนประวัติ K.Min&rdquo;</strong> เพื่อใช้ศึกษาและประกอบการเทียบข้อมูลโครงสร้างทะเบียนส่วนบุคคล
                        </li>
                        <li>
                          ซักถามและสอบข้อมูลเชิงลึกกับ K.Min ผ่านทางช่อง <strong>Interrogation Chat</strong> ด้านซ้าย เพื่อรวบรวมคำชี้แจง
                        </li>
                      </ul>
                    </div>

                    <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-2 text-xs">
                      <h3 className="font-bold text-slate-200 flex items-center gap-1 font-sans">
                        <Award className="w-4 h-4 text-emerald-500" />
                        <span>หลักเกณฑ์การนำเสนอรายงานและสรุปผล:</span>
                      </h3>
                      <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11.5px] leading-relaxed font-sans">
                        <li>
                          รวบรวมประเด็นความผิดปกติให้ครบถ้วนสมบูรณ์ผ่านทางการตรวจสอบเชิงเอกสารและกระดาษทำการ
                        </li>
                        <li>
                          ซักฟอกข้อมูลร่วมกับพนักงานที่เกี่ยวข้อง เพื่อวิเคราะห์การตอบสนองและดัชนีระดับความตึงเครียด (Stress Index)
                        </li>
                        <li>
                          สรุปผลและรายงานความเห็นเชิงลึกในแท็บ <strong>&ldquo;5. ยื่นรายงานตัดสิน&rdquo;</strong> เพื่อรับการประเมินคะแนนวิเคราะห์ตรงตามจริงจาก ALec
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-indigo-950/25 border border-indigo-900/40 p-4 rounded-xl text-xs text-indigo-300 font-sans leading-relaxed">
                    <p className="font-bold mb-1 flex items-center gap-1 text-[13px]">
                      <Info className="w-4 h-4 text-indigo-400" />
                      <span>บันทึกความช่วยเหลือพิเศษจาก ALec:</span>
                    </p>
                    <p>
                      &ldquo;การสอบบัญชีนิติวิทยาศาสตร์ไม่ใช่แค่การตรวจสอบเครื่องคิดเลขธรรมดา แต่เป็นการหาความย้อนแย้งระหว่าง <strong>บันทึกความจริงในเอกสารกระดาษ (Excel)</strong> กับ <strong>รอยเท้าเงินจริงในระบบสารสนเทศธนาคาร (Bank Statement)</strong>... ตรวจสอบและประมวลผลอย่างรอบคอบนะเจ้าพวกนักศึกษา!&rdquo;
                    </p>
                  </div>

                  <div className="pt-2 flex justify-center">
                    <button
                      onClick={() => setActiveTab("sheets")}
                      className="bg-orange-600 hover:bg-orange-500 text-slate-100 px-6 py-2.5 rounded-lg text-xs font-bold transition-all shadow hover:shadow-orange-950/30 font-sans cursor-pointer"
                    >
                      เริ่มภารกิจเปิดดูสมุดบัญชี Excel 📊
                    </button>
                  </div>
                </motion.div>
              )}

              {activeTab === "sheets" && (
                <motion.div
                  key="sheets"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  <SheetViewer
                    onFormulaDiscovered={handleFormulaDiscovered}
                    hasFoundBrokenSum={unlockedSmokingGuns.includes("mismatch_sum")}
                    caseData={caseData}
                    selectedEpisode={selectedEpisode}
                  />
                </motion.div>
              )}

              {activeTab === "bank" && (
                <motion.div
                  key="bank"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  <BankStatementViewer
                    onTransactionDiscovered={handleTransactionDiscovered}
                    hasFoundMNTransaction={unlockedSmokingGuns.includes("mn_payment")}
                    caseData={caseData}
                  />
                </motion.div>
              )}

              {activeTab === "employee" && (
                <motion.div
                  key="employee"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  <EmployeeProfile
                    onAccountMatched={handleAccountMatched}
                    hasMatchedBankAccount={unlockedSmokingGuns.includes("bank_match")}
                    selectedEpisode={selectedEpisode}
                  />
                </motion.div>
              )}

              {activeTab === "casefile" && (
                <motion.div
                  key="casefile"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  <CaseReport
                    unlockedSmokingGuns={unlockedSmokingGuns}
                    onRestartGame={handleRestartGame}
                    studentId={studentIdWithEp}
                    studentEmail={studentEmail}
                    caseData={caseData}
                    selectedEpisode={selectedEpisode}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </section>

      </main>

      {/* Footer System Credits and Security Lines (Anti-AI-Slop, Literal, Humble) */}
      <footer className="bg-[#0b0f1a] py-3 text-center text-slate-400 text-[11px] border-t border-slate-900/60 leading-relaxed font-sans shrink-0">
        <p className="text-slate-400">
          The Accountant's Veil — ม่านมายา พนักงานบัญชีปริศนา &copy; {new Date().getFullYear()} AC432 | คณะบัญชี มหาวิทยาลัยกรุงเทพ (BU)
        </p>
      </footer>

      {/* Admin Access Modal Overlay */}
      {renderAdminModal()}

    </div>
  );
}
