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
  Info
} from "lucide-react";
import { ChatMessage, ActiveTab } from "./types";
import SheetViewer from "./components/SheetViewer";
import BankStatementViewer from "./components/BankStatementViewer";
import EmployeeProfile from "./components/EmployeeProfile";
import CaseReport from "./components/CaseReport";
import { generateCaseFromId } from "./utils";

export default function App() {
  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<ActiveTab>("instructions");
  
  // Student Login States (Mandatory 10-digit Student ID and Email)
  const [studentId, setStudentId] = useState(() => localStorage.getItem("bu_student_id") || "");
  const [studentEmail, setStudentEmail] = useState(() => localStorage.getItem("bu_student_email") || "");
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem("bu_student_id"));
  const [loginIdInput, setLoginIdInput] = useState("");
  const [loginEmailInput, setLoginEmailInput] = useState("");
  const [loginError, setLoginError] = useState("");

  const caseData = isLoggedIn ? generateCaseFromId(studentId, studentEmail) : generateCaseFromId("1234567890", "test@bu.ac.th");

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

  const handleStudentLogout = () => {
    localStorage.removeItem("bu_student_id");
    localStorage.removeItem("bu_student_email");
    localStorage.removeItem("bu_questions_count");
    setStudentId("");
    setStudentEmail("");
    setIsLoggedIn(false);
    setLoginIdInput("");
    setLoginEmailInput("");
    setUnlockedSmokingGuns([]);
    setQuestionsCount(0);
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
        body: JSON.stringify({ studentId, studentEmail }),
      })
        .then(() => {
          if (isAdminAuthenticated) {
            fetchAdminSubmissions();
          }
        })
        .catch((err) => console.error("Session registry error:", err));
    }
  }, [isLoggedIn, studentId, studentEmail, isAdminAuthenticated]);

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

  useEffect(() => {
    if (adminSubmissions && adminSubmissions.length > 0) {
      const initFeedback: { [subId: string]: string } = {};
      adminSubmissions.forEach((sub) => {
        initFeedback[sub.id] = sub.instructorFeedback || "";
      });
      setEditingFeedback((prev) => ({ ...initFeedback, ...prev }));
    }
  }, [adminSubmissions]);

  const handleSendFeedback = async (id: string) => {
    const feedbackText = editingFeedback[id] || "";
    try {
      const res = await fetch("/api/admin/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, instructorFeedback: feedbackText }),
      });
      if (res.ok) {
        alert("บันทึกคำแนะนำ (Feedback) และนำส่งต่อไปยังนักศึกษาสำเร็จเรียบร้อยแล้ว!");
        fetchAdminSubmissions();
      } else {
        const errData = await res.json();
        alert("ไม่สามารถนำส่งข้อความติชมยื่นกลับ: " + (errData.error || ""));
      }
    } catch (err) {
      console.error(err);
      alert("ไม่สามารถสถาปนาลิงก์ไปติชมได้");
    }
  };

  const handleDeleteSubmission = async (id: string) => {
    if (!confirm("คุณต้องการลบระเบียนประวัติการส่งงานของนักศึกษาท่านนี้อย่างถาวรใช่ไหม?")) return;
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
    if (!confirm("🚨 คำเตือนรุนแรง! คุณต้องการล้างพอร์ตประวัติและทำลายฐานข้อมูลส่งการบ้านทั้งหมดจากเซิร์ฟเวอร์ใช่หรือไม่? ข้อมูลทั้งหมดจะสูญหายอย่างถาวร!")) return;
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

  const downloadCSV = () => {
    if (adminSubmissions.length === 0) {
      alert("ไม่มีวิทยานิพจน์บันทึกรายการตรวจสอบของนักศึกษาอยู่ในระบบให้ดาวน์โหลดขณะนี้");
      return;
    }
    
    // MS Excel Thai language support UTF-8 BOM
    let csvContent = "\uFEFF";
    csvContent += "ลำดับ,รหัสนักศึกษา,อีเมลนักศึกษา,ยอดเงินตอบฟ้องทุจริต,สมมติฐานพฤติกรรม,วิเคราะห์สูตรวิชาการ,คะแนนรวม,วันเวลาจัดส่งรายงาน\n";
    
    adminSubmissions.forEach((sub, idx) => {
      const cleanReport = `"${(sub.writtenReport || "").replace(/"/g, '""').replace(/\n/g, " ")}"`;
      const row = [
        idx + 1,
        sub.studentId,
        sub.studentEmail,
        sub.qAmount,
        sub.qMethod,
        cleanReport,
        sub.score,
        sub.timestamp
      ].join(",");
      csvContent += row + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `AC432_Forensic_Grading_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleInstructorClick = () => {
    setInstructorClicks(prev => {
      const next = prev + 1;
      if (next >= 5) {
        setShowAdminLogin(true);
        return 0; // Reset count
      }
      return next;
    });
  };

  // Game Interrogation & Auditing States
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: "init",
      role: "model",
      text: "ยินดีต้อนรับคุณนักสืบบัญชี... เอ่อ มีเรื่องอะไรด่วนเหรอ? ทาง Min งานยุ่งมากๆ เลยนะช่วงนี้ บันทึกบัญชีเงินสดของบริษัท VeloBike Logistics ประจำรอบ AC432 นี้เราก็ส่งสรุปให้ Alec และคณะตรวจบอร์ดบริหารเรียบร้อยหมดแล้ว... มีอะไรผิดปกติในไฟล์หรือเปล่าคุณ?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [stressLevel, setStressLevel] = useState(15); // Starts at 15% stress
  const [unlockedSmokingGuns, setUnlockedSmokingGuns] = useState<string[]>([]);
  
  // Ref for auto scrolling chat
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  // Unlock Smoking Guns helpers
  const handleFormulaDiscovered = () => {
    if (!unlockedSmokingGuns.includes("mismatch_sum")) {
      setUnlockedSmokingGuns(prev => [...prev, "mismatch_sum"]);
      setStressLevel(prev => Math.min(100, prev + 25));
      
      // Inject alert from board inside chat as simulated forensic notification
      setChatHistory(prev => [
        ...prev,
        {
          id: `sys-${Date.now()}`,
          role: "model",
          text: "[📊 บันทึกความเชื่อมโยง]: ตรวจสอบและรายงานโครงสร้างสูตรคำนวณเซลล์ G16 (สมุดรายจ่าย Excel) เรียบร้อย",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    }
  };

  const handleTransactionDiscovered = () => {
    if (!unlockedSmokingGuns.includes("mn_payment")) {
      setUnlockedSmokingGuns(prev => [...prev, "mn_payment"]);
      setStressLevel(prev => Math.min(100, prev + 20));
      
      setChatHistory(prev => [
        ...prev,
        {
          id: `sys-${Date.now()}`,
          role: "model",
          text: "[💳 บันทึกความเชื่อมโยง]: ตรวจสอบและบันทึกรายละเอียดรายการเคลื่อนไหวสเตทเม้นท์ธนาคาร วันที่ 15 ธันวาคม 2025 เรียบร้อย",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    }
  };

  const handleAccountMatched = () => {
    if (!unlockedSmokingGuns.includes("bank_match")) {
      setUnlockedSmokingGuns(prev => [...prev, "bank_match"]);
      setStressLevel(prev => Math.min(100, prev + 30));
      
      setChatHistory(prev => [
        ...prev,
        {
          id: `sys-${Date.now()}`,
          role: "model",
          text: "[📋 บันทึกความเชื่อมโยง]: ตรวจสอบข้อมูลบัญชีธนาคารในทะเบียนประวัติพนักงานเทียบกับสารบบเสร็จสิ้น",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    }
  };

  // Re-start / Reset simulation
  const handleRestartGame = () => {
    setChatHistory([
      {
        id: "init",
        role: "model",
        text: "ยินดีต้อนรับคุณนักสืบบัญชี... มีเรื่องอะไรเร่งด่วนรึเปล่า? บัญชีเงินสดรอบนี้เราส่งสรุปให้ Alec ตรวจเรียบร้อยแล้วนะ มีปัญหาบิลอะไรรวดเร็วหรือเปล่า?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ]);
    setStressLevel(15);
    setUnlockedSmokingGuns([]);
    setActiveTab("instructions");
    setQuestionsCount(0);
    localStorage.removeItem("bu_questions_count");
  };

  // Chat Submission to server.ts Route
  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    if (questionsCount >= 5) {
      alert("⚠️ คุณใช้สิทธิ์แชทสอบถาม K.Min ครบเกณฑ์โควตา 5 คำถามเรียบร้อยแล้ว! กรุณายื่นผลชันสูตรคดีด้านขวาเพื่อรับคะแนนวิเคราะห์สรุป");
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

    const updatedHistory = [...chatHistory, userMsg];
    setChatHistory(updatedHistory);
    setUserInput("");
    setLoading(true);

    try {
      // Keep only normal user/model dialogs to send to server, filtering out system alerts
      const apiHistory = updatedHistory.filter(msg => !msg.id.startsWith("sys-"));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          history: apiHistory,
          studentId,
          studentEmail
        }),
      });

      if (!response.ok) {
        throw new Error("ระบบเชื่อมเคอร์เนล K.Min ขัดข้อง");
      }

      const data = await response.json();
      
      // Update dynamic stress level
      if (data.stressIncrease) {
        setStressLevel(prev => Math.min(100, prev + data.stressIncrease));
      }

      const kMinResponseText = stressLevel >= 95 
        ? "พอแล้ว! หยุดต้อนทาง Min เถอะ!!... ใช่ เราแก้ไขสูตร SUM บัญชีเงินสดนั่นเองแหละ... ฮือๆ... ทาง Min มีงวดต้องผ่อนชำระหนี้สินสินเชื่อกองทุนหลังโควิดจนจะล้มละลายแล้ว... แต่อย่าเอาเรื่องส่ง Alec หรือตำรวจเลยนะ... ฮือออ"
        : data.reply;

      setChatHistory(prev => [
        ...prev,
        {
          id: `min-${Date.now()}`,
          role: "model",
          text: kMinResponseText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);

    } catch (err: any) {
      console.error(err);
      setChatHistory(prev => [
        ...prev,
        {
          id: `sys-err-${Date.now()}`,
          role: "model",
          text: `[⚠️ ข้อผิดพลาดทางระบบ]: การตอบรับของ K.Min ถูกขัดจังหวะ กรุณาลองใหม่อีกครั้ง (${err.message})`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Predefined Interactive Questions
  const PRESET_PROMPTS = [
    {
      label: "❓ สอบถามหน้าที่หลักด้านการเงิน",
      text: "สวัสดีครับ K.Min อยากทราบว่าในฐานะหัวหน้าแผนกบัญชี คุณมีหน้าที่รับผิดชอบในส่วนการควบคุมและตรวจสอบสมุดรายจ่ายเงินสดอย่างไรบ้างครับ?"
    },
    {
      label: "🧐 สอบถามการควบคุมภายใน",
      text: "ระบบการควบคุมภายในของบริษัท VeloBike Logistics มีขั้นตอนการจัดทำและอนุมัติสรุปข้อมูลในสมุดรายจ่าย Excel ก่อนส่งผู้บริหารอย่างไรครับ?"
    },
    {
      label: "📂 สอบถามกระบวนการกระทบยอด",
      text: "สมุดรายจ่ายกระแสเงินสดประจำงวดเดือนธันวาคม ได้มีการทำกระทบยอด (Bank Reconciliation) กับเอกสาร Bank Statement เรียบร้อยดีหรือไม่ครับ?"
    },
    {
      label: "👩‍🏫 ขอคำชี้แจงสิทธิ์การแก้ไขไฟล์",
      text: "นอกจากตัวคุณเองแล้ว มีพนักงานคนอื่นในแผนกบัญชีหรือหน่วยงานอื่นที่มีสิทธิ์เข้าถึงหรือแก้ไขสูตรในไฟล์สรุปยอดจ่ายของบริษัทบ้างหรือไม่ครับ?"
    }
  ];

  // Dynamically calculate heart rate (BPM) based on stress levels
  const heartRate = Math.round(72 + (stressLevel * 0.88) + (Math.sin(Date.now() / 1000) * 2));

  // Determine stress level color and text status representation
  const getStressDetails = (pct: number) => {
    if (pct < 35) return { color: "from-emerald-500 to-green-400 font-bold text-emerald-400", bg: "bg-emerald-950/60 border-emerald-920", label: "ปกติ / นิ่งเฉย (Cold Calm)" };
    if (pct < 65) return { color: "from-yellow-500 to-amber-400 font-bold text-amber-400", bg: "bg-amber-950/60 border-amber-920", label: "เริ่มมีพิรุธ / กังวล (Slightly Nervous)" };
    if (pct < 88) return { color: "from-orange-500 to-red-400 font-bold text-orange-400", bg: "bg-orange-950/60 border-orange-920", label: "ลนลาน / หาข้ออ้าง (Panicky)" };
    return { color: "from-red-600 to-rose-500 font-extrabold text-rose-500 animate-pulse", bg: "bg-rose-950/80 border-rose-920", label: "สติหลุดขาดสะบั้น (Breakdown Point!)" };
  };

  const stressInfo = getStressDetails(stressLevel);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-slate-200 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
        {/* BU Decorative background ambient accents */}
        <div className="absolute top-10 right-10 w-96 h-96 bg-indigo-900/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-rose-950/10 rounded-full blur-3xl pointer-events-none" />

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
                <span className="text-[10px] bg-sky-950 text-[#38bdf8] font-extrabold px-2 py-0.5 rounded border border-[#38bdf8]/40 uppercase tracking-widest">
                  Exam Portal
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-300 font-bold px-2 py-0.5 rounded border border-slate-700/60 uppercase">
                  AC432 Forensic Audit
                </span>
              </div>
              <h1 className="text-lg font-bold text-white tracking-tight">
                ม่านมายา พนักงานบัญชีปริศนา
              </h1>
              <p className="text-xs text-slate-400 max-w-xs mx-auto font-sans leading-relaxed">
                ระบบชันสูตรทุจริตนิติวิทยาศาสตร์ (The Accountant&apos;s Veil) ประเมินชุดทดสอบประจำสิทธิ์รายบุคคล
              </p>
            </div>
          </div>

          <div className="border-t border-slate-800/80 my-2" />

          {/* Login Form */}
          <form onSubmit={handleStudentLogin} className="space-y-4">
            {loginError && (
              <div className="bg-rose-950/70 border border-rose-900/60 p-3 rounded-lg text-xs text-rose-300 font-sans flex items-start gap-2">
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
                className="w-full bg-[#0b0f1a] border border-slate-750 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-sky-500 placeholder-slate-600 shadow-inner"
                required
              />
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                <span>อีเมลนักศึกษา (Student Email) *</span>
              </label>
              <input
                type="email"
                placeholder="ป้อนอีเมล (เช่น student@bu.ac.th)"
                value={loginEmailInput}
                onChange={(e) => setLoginEmailInput(e.target.value)}
                className="w-full bg-[#0b0f1a] border border-slate-750 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-sky-500 placeholder-slate-600 shadow-inner"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#4f46e5] hover:bg-[#4338ca] text-slate-100 font-sans font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-950/30 cursor-pointer"
            >
              <GraduationCap className="w-4 h-4 text-white" />
              <span>เข้าสู่กระบวนการสอบสวน (Access Case Files)</span>
            </button>
          </form>

          {/* Educational Note */}
          <div className="bg-slate-900/50 border border-slate-800 p-3.5 rounded-lg text-[11px] leading-relaxed text-slate-400 font-sans text-left">
            <span className="font-bold text-slate-300 block mb-0.5 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-[#38bdf8] shrink-0" />
              <span>คำอธิบายสิทธิ์รายข้อคำถาม (Note):</span>
            </span>
            หลังจากเข้าสู่คดีแล้ว ยอดเงินกระแสทุจริต พิกัดสูตรแก้ และพฤติกรรมในงบลานซ์คดีจะถูกสลับใหม่สุ่มตามรายกรณีรหัสนักศึกษา เพื่อให้ได้ความตรงโปร่งใสสอดคล้องการฝึกชันสูตร
          </div>

          <div className="text-center pt-2 text-[10px] text-slate-600 font-sans animate-pulse">
            คณะบัญชี มหาวิทยาลัยกรุงเทพ (BU) | AC432 Forensic Series
          </div>
        </motion.div>

        {/* Admin Access Modal Overlay inside Login Screen */}
        {showAdminLogin && (
          <div id="admin-modal-login" className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-fadeIn overflow-y-auto">
            <div className={`bg-[#1e293b] border border-slate-750 p-6 rounded-2xl w-full transition-all duration-300 shadow-2xl ${isAdminAuthenticated ? "max-w-[95%] lg:max-w-[1350px]" : "max-w-sm"} space-y-4`}>
              <div className="flex items-center justify-between border-b border-slate-700/85 pb-3">
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
                    className="bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white px-2.5 py-1 rounded text-xs transition font-mono border border-slate-700 cursor-pointer"
                  >
                    LOGOUT ADMIN
                  </button>
                )}
              </div>
              
              {!isAdminAuthenticated ? (
                <div className="space-y-3.5 text-left">
                  <p className="text-xs text-slate-300 leading-relaxed font-sans text-left">
                    กรุณากรอกรหัสผ่านบอร์ดผู้ฝึกสอนจำลอง เพื่อเข้าทบทวนผลคะแนนและประวัติการส่งงานของนักศึกษา (BU ADMIN):
                  </p>
                  <input
                    type="password"
                    placeholder="ป้อนรหัสผ่าน (BUADMIN2024)"
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
                      className="flex-grow bg-slate-800 hover:bg-slate-700 text-slate-400 py-2.5 rounded-lg text-xs transition duration-200 cursor-pointer text-center font-sans border border-slate-700"
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
                <div className="space-y-4 text-left">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-sky-950/20 border border-sky-900/40 p-4 rounded-xl text-xs text-sky-200 font-sans leading-relaxed">
                    <div>
                      🔓 ยินดีต้อนรับบอร์ดบริหาร! แผงควบคุมแสดงประวัติส่งผลชันสูตรคดีวิทยานิพจน์เรียงตามรหัสนักศึกษาและคะแนนแบบ Real-time
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={downloadCSV}
                        className="bg-[#059669] hover:bg-[#047857] text-slate-100 px-3 py-1.5 rounded-lg font-bold font-sans transition-all text-[11px] flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95"
                      >
                        <span>📥 ดาวน์โหลดผล (All CSV)</span>
                      </button>
                      <button
                        onClick={handleWipeAllSubmissions}
                        className="bg-rose-900 hover:bg-rose-850 border border-rose-950/40 text-rose-300 hover:text-white px-3 py-1.5 rounded-lg font-bold font-sans transition-all text-[11px] flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95"
                      >
                        <span>🚨 ล้างสารบบทั้งหมด</span>
                      </button>
                    </div>
                  </div>

                  {/* Submissions Spreadsheet Table Grid */}
                  <div className="border border-slate-750 rounded-xl overflow-hidden bg-slate-900">
                    <div className="overflow-x-auto max-h-[420px]">
                      <table className="w-full text-left border-collapse font-sans text-xs">
                        <thead className="bg-[#0f172a] text-slate-300 font-bold sticky top-0 border-b border-slate-700">
                          <tr>
                            <th className="p-3">ลำดับ</th>
                            <th className="p-3">ข้อมูลนักศึกษา</th>
                            <th className="p-3">สถานะส่งงาน</th>
                            <th className="p-3">คำตอบของนักศึกษา (ข้อ 1 & 2)</th>
                            <th className="p-3 text-emerald-400">เฉลยตัวจริงของกรณีนี้</th>
                            <th className="p-3 text-sky-400">คำอธิบายวิธีคำนวณเบื้องหลัง</th>
                            <th className="p-3 text-center">คะแนนรวม</th>
                            <th className="p-3">คำตอบข้อ 3 (เชิงประจักษ์)</th>
                            <th className="p-3">ให้คำติชม / ส่งกลับ Feedback (ข้อ 3)</th>
                            <th className="p-3 text-center">สิทธิ์ควบคุม</th>
                          </tr>
                        </thead>
                        <tbody>
                          {isAdminLoading ? (
                            <tr>
                              <td colSpan={10} className="p-8 text-center text-slate-500 font-mono">
                                กำลังเรียกข้อมูลดึงประวัติงานจากเซิร์ฟเวอร์...
                              </td>
                            </tr>
                          ) : adminSubmissions.length === 0 ? (
                            <tr>
                              <td colSpan={10} className="p-8 text-center text-slate-500 italic">
                                ไม่พบบันทึกรหัสการยื่นรายงานในสารบบปัจจุบัน
                              </td>
                            </tr>
                          ) : (
                            adminSubmissions.map((sub, idx) => {
                              const correct = getCorrectAnswersForId(sub.studentId);
                              const isUnsubmitted = sub.isPlaceholder || sub.score === null || sub.score === undefined;
                              return (
                                <tr key={sub.id || idx} className="border-b border-slate-800 hover:bg-slate-800/40 transition-colors">
                                  <td className="p-3 font-mono text-slate-500">{idx + 1}</td>
                                  <td className="p-3 font-mono text-xs">
                                    <div className="font-bold text-[#38bdf8] font-sans">{sub.studentId}</div>
                                    <div className="text-[10px] text-slate-400">{sub.studentEmail}</div>
                                    <div className="text-[9px] text-slate-500 font-sans mt-0.5">{sub.timestamp}</div>
                                  </td>
                                  <td className="p-3">
                                    {isUnsubmitted ? (
                                      <span className="px-2 py-0.5 bg-amber-950/70 text-amber-500 text-[10px] rounded border border-amber-900/30">
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
                                      <span className="text-slate-500 italic text-[11px]">รอการทบทวนแก้ไข...</span>
                                    ) : (
                                      <div className="space-y-0.5 max-w-[180px]">
                                        <div>
                                          <span className="text-slate-505 text-[10px]">เงินตอบ: </span>
                                          <span className="font-mono text-amber-400 font-bold">{parseInt(sub.qAmount || "0").toLocaleString()} บาท</span>
                                        </div>
                                        <div>
                                          <span className="text-slate-505 text-[10px]">พฤติกรรม: </span>
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
                                      <span className="text-slate-500 italic text-[10px]">รอส่ง</span>
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
                                        placeholder="พิมพ์คำอธิบายเชิงประจักษ์ (ติชมข้อคำถามที่ 3)..."
                                        value={editingFeedback[sub.id] || ""}
                                        onChange={(e) => setEditingFeedback(prev => ({ ...prev, [sub.id]: e.target.value }))}
                                      />
                                      <button
                                        onClick={() => handleSendFeedback(sub.id)}
                                        className="bg-[#059669] hover:bg-[#047857] text-slate-100 font-sans text-[10px] py-1 px-2 rounded font-bold transition-all border border-emerald-600 active:scale-95 cursor-pointer text-center"
                                      >
                                        ✔ บันทึกคำติชม & ส่งกลับนักศึกษา
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
                                      className="bg-rose-950/80 hover:bg-rose-900 text-rose-300 hover:text-white px-2 py-1 rounded text-[10px] font-bold border border-rose-900/40 cursor-pointer transition"
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
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAdminAuthenticated(false);
                        setShowAdminLogin(false);
                        setAdminPasswordInput("");
                      }}
                      className="bg-slate-800 hover:bg-slate-750 text-slate-300 py-2.5 px-6 rounded-lg text-xs transition duration-200 cursor-pointer font-sans font-bold"
                    >
                      ปิดหน้าต่างควบคุม
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
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
              <span className="text-slate-400 font-sans font-normal border-r border-slate-700/80 pr-2 hidden sm:inline text-sm">ม่านมายา พนักงานบัญชีปริศนา</span>
              <span className="font-serif italic font-semibold text-white">The Accountant&apos;s Veil</span>
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
            title="เคาะ 5 ครั้งเพื่อสิทธิ์ระบบ Admin"
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
                  <span>ดัชนีความเครียดผู้ต้องหา (Stress Index)</span>
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

            {/* 5-Questions Countdown Alert Indicator Banner */}
            <div className="mt-3 flex items-center justify-between bg-[#0a1220] p-2.5 border border-slate-800 rounded-lg text-xs font-sans leading-none shadow-inner">
              <span className="text-slate-400 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-sky-400" />
                <span>โควตาคำถาม K.Min ของคุณ:</span>
              </span>
              <span className={`font-mono font-black text-xs px-2.5 py-1 rounded-md border ${
                questionsCount >= 5 
                  ? "bg-red-950/80 text-red-400 border-red-900/60 animate-pulse" 
                  : questionsCount >= 4
                    ? "bg-orange-950/80 text-orange-400 border-orange-900/60 animate-pulse"
                    : "bg-sky-950/80 text-sky-400 border-sky-900/60"
              }`}>
                {5 - questionsCount} / 5 คำถามคงเหลือ
              </span>
            </div>
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
                        <div className="w-6 h-6 rounded-full bg-[#075985] border border-sky-400/30 flex items-center justify-center text-[10px] font-serif font-black italic text-white shadow-sm">
                          KM
                        </div>
                        <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider font-mono">K. Min</span>
                      </div>
                      <div className="p-3.5 bg-[#094e75] text-sky-100 rounded-tr-xl rounded-b-xl border border-[#0ea5e9]/30 font-medium italic text-xs sm:text-[13px] leading-relaxed break-words font-sans shadow-[0_4px_12px_rgba(14,165,233,0.1)]">
                        {msg.text}
                      </div>
                      <span className="text-[9px] text-sky-600/80 font-mono block pl-1">
                        {msg.timestamp}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
            
            {loading && (
              <div className="flex justify-start items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#075985] border border-sky-400/30 flex items-center justify-center text-[10px] font-serif font-black italic text-white animate-pulse">
                  KM
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
              💡 แนะนำหัวข้อเพื่อเค้นข้อมูล K.Min:
            </div>
            <div className="flex flex-col gap-1 max-h-[140px] overflow-y-auto pr-1">
              {PRESET_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt.text)}
                  disabled={loading || questionsCount >= 5}
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
              disabled={loading || questionsCount >= 5}
              placeholder={questionsCount >= 5 ? "🔴 โควตาเตหักคำถามสิ้นสุดแล้ว กรุณายื่นรายงานฯ ด้านขวา" : "ซักฟอกพยาน/ถามคำถามที่นี่..."}
              className="flex-grow bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 disabled:opacity-60 font-sans"
            />
            <button
              type="submit"
              disabled={loading || !userInput.trim() || questionsCount >= 5}
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
                <span>5. ยื่นรายงานตัดสิน (Submit)</span>
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
                      คู่มือการสอบบัญชีสัจนิยม AC432 (Forensic Auditing Brief)
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
                    studentId={studentId}
                    studentEmail={studentEmail}
                    caseData={caseData}
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
      {showAdminLogin && (
        <div id="admin-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-fadeIn overflow-y-auto">
          <div className={`bg-[#1e293b] border border-slate-750 p-6 rounded-2xl w-full transition-all duration-300 shadow-2xl ${isAdminAuthenticated ? "max-w-5xl" : "max-w-sm"} space-y-4`}>
            <div className="flex items-center justify-between border-b border-slate-700/85 pb-3">
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
                  className="bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white px-2.5 py-1 rounded text-xs transition font-mono border border-slate-700 cursor-pointer"
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
                  placeholder="ป้อนรหัสผ่าน (BUADMIN2024)"
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
                    className="flex-grow bg-slate-800 hover:bg-slate-700 text-slate-400 py-2.5 rounded-lg text-xs transition duration-200 cursor-pointer text-center font-sans border border-slate-700"
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
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-sky-950/20 border border-sky-900/40 p-4 rounded-xl text-xs text-sky-200 font-sans leading-relaxed">
                  <div>
                    🔓 ยินดีต้อนรับบอร์ดบริหาร! แผงควบคุมแสดงประวัติส่งผลชันสูตรคดีวิทยานิพจน์เรียงตามรหัสนักศึกษาและคะแนนแบบ Real-time
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={downloadCSV}
                      className="bg-emerald-600 hover:bg-emerald-500 text-slate-100 px-3 py-1.5 rounded-lg font-bold font-sans transition-all text-[11px] flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95"
                    >
                      <span>📥 ดาวน์โหลดผล (All CSV)</span>
                    </button>
                    <button
                      onClick={handleWipeAllSubmissions}
                      className="bg-rose-900 hover:bg-rose-850 border border-rose-900/50 text-rose-300 hover:text-white px-3 py-1.5 rounded-lg font-bold font-sans transition-all text-[11px] flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95"
                    >
                      <span>🚨 ล้างสารบบทั้งหมด</span>
                    </button>
                  </div>
                </div>

                {/* Submissions Spreadsheet Table Grid */}
                <div className="border border-slate-750 rounded-xl overflow-hidden bg-slate-900">
                  <div className="overflow-x-auto max-h-[350px]">
                    <table className="w-full text-left border-collapse font-sans text-xs">
                      <thead className="bg-[#0f172a] text-slate-300 font-bold sticky top-0 border-b border-slate-700">
                        <tr>
                          <th className="p-3">ลำดับ</th>
                          <th className="p-3">รหัสนักศึกษา</th>
                          <th className="p-3">อีเมลนักศึกษา</th>
                          <th className="p-3 text-right">ยอดเงินตอบ</th>
                          <th className="p-3">ตัวแทนพฤติกรรม</th>
                          <th className="p-3">คะแนนหลักที่ได้ (เต็ม 100)</th>
                          <th className="p-3">วันเวลาจัดส่งรายงาน</th>
                          <th className="p-3 text-center">จัดการ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {isAdminLoading ? (
                          <tr>
                            <td colSpan={8} className="p-8 text-center text-slate-500 font-mono">
                              กำลังเรียกข้อมูลดึงประวัติงานจากเซิร์ฟเวอร์...
                            </td>
                          </tr>
                        ) : adminSubmissions.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="p-8 text-center text-slate-500 italic">
                              ไม่พบบันทึกรหัสการยื่นรายงานในสารบบปัจจุบัน
                            </td>
                          </tr>
                        ) : (
                          adminSubmissions.map((sub, idx) => (
                            <tr key={sub.id || idx} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                              <td className="p-3 font-mono text-slate-505">{idx + 1}</td>
                              <td className="p-3 font-mono font-bold text-[#38bdf8]">{sub.studentId}</td>
                              <td className="p-3 font-mono text-slate-400">{sub.studentEmail}</td>
                              <td className="p-3 text-right font-mono text-amber-400 font-bold">
                                {parseInt(sub.qAmount || "0").toLocaleString()} บาท
                              </td>
                              <td className="p-3 text-slate-300 max-w-[150px] truncate" title={sub.qMethod}>
                                {sub.qMethod}
                              </td>
                              <td className="p-3 font-semibold">
                                <span className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                                  sub.score >= 80 
                                    ? "bg-emerald-950 text-emerald-400 border border-emerald-900" 
                                    : sub.score >= 50
                                      ? "bg-amber-950 text-amber-400 border border-amber-900"
                                      : "bg-rose-950 text-rose-400 border border-rose-900"
                                }`}>
                                  {sub.score} / 100
                                </span>
                              </td>
                              <td className="p-3 font-mono text-slate-500 text-[10px]">{sub.timestamp}</td>
                              <td className="p-3 text-center">
                                <button
                                  onClick={() => handleDeleteSubmission(sub.id)}
                                  className="bg-rose-950/80 hover:bg-rose-900 text-rose-300 hover:text-white px-2 py-1 rounded text-[10px] font-bold border border-rose-900/40 cursor-pointer transition"
                                >
                                  ลบข้อมูล
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAdminAuthenticated(false);
                      setShowAdminLogin(false);
                      setAdminPasswordInput("");
                    }}
                    className="bg-slate-800 hover:bg-slate-750 text-slate-300 py-2.5 px-6 rounded-lg text-xs transition duration-200 cursor-pointer font-sans font-bold"
                  >
                    ปิดหน้าต่างควบคุม
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
