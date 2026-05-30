import React, { useState } from "react";
import { EMPLOYEE_FILE } from "../data";
import { Award, Briefcase, Eye, Link, Lock, ShieldCheck, User, Users } from "lucide-react";

interface EmployeeProfileProps {
  onAccountMatched: () => void;
  hasMatchedBankAccount: boolean;
  selectedEpisode?: number | null;
}

const JJIN_EMPLOYEE_FILE = {
  fullName: "J.Jin เจนจิรา (Jenjira 'Jin')",
  employeeId: "EMP-432-05",
  position: "เจ้าหน้าที่จัดซื้ออาวุโส (Senior Procurement Officer)",
  department: "แผนกจัดซื้อและคู่ค้า (Procurement & Supplier Management)",
  hireDate: "18 ตุลาคม 2564 (4 ปี 7 เดือน)",
  education: "ปริญญาตรีบริหารธุรกิจบัณฑิต (บธ.บ. สาขาการจัดการการซื้อกุมฝั่งและโซ่อุปทาน)",
  status: "พนักงานประจำ (Active)",
  salaryAccount: {
    bank: "ธนาคารกสิกรไทย (Kasikorn Bank)",
    accountNumber: "122-2-55611-3",
    accountName: "J.Jin เจนจิรา"
  },
  contact: {
    email: "jenjira.j@velobike-logistics.co.th",
    phone: "081-556-113x",
    address: "45/12 หมู่บ้านศุภาลัย แขวงคลองกุ่ม เขตบึงกุ่ม กรุงเทพฯ"
  },
  performanceReview: "ประสานงานดีเยี่ยม จัดหาซัพพลายเออร์ที่รวดเร็ว แต่ช่วงระยะหลังมีรายการจัดส่งสัญญาบริการพาร์ทไทม์ และแอดคู่ค้าริเริ่มอย่างบริษัทโฮมเฮ้าส์หรือ M.N. Accounting ถี่เป็นกรณีพิเศษ และมักอ้างว่าทำเพื่อความจำเป็นในขั้นตอนฝ่ายปฏิบัติการขวามือ"
};

export default function EmployeeProfile({ onAccountMatched, hasMatchedBankAccount, selectedEpisode }: EmployeeProfileProps) {
  const [showSensitive, setShowSensitive] = useState(false);
  const [activeProfileTab, setActiveProfileTab] = useState<"min" | "jin">("min");

  const isEp2 = selectedEpisode === 2;

  const currentFile = isEp2 && activeProfileTab === "jin" ? JJIN_EMPLOYEE_FILE : EMPLOYEE_FILE;

  const handleRevealClick = () => {
    setShowSensitive(true);
    onAccountMatched();
  };

  return (
    <div id="employee-profile" className="flex flex-col h-full bg-[#1e293b] text-slate-100 rounded-xl overflow-hidden border border-slate-700 shadow-2xl">
      {/* Title Bar */}
      <div className="bg-[#0f172a] px-4 py-3 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isEp2 ? <Users className="w-5 h-5 text-indigo-400" /> : <User className="w-5 h-5 text-indigo-400" />}
          <span className="font-semibold text-sm text-indigo-200">
            {isEp2 
              ? "ระบบแฟ้มทะเบียนประวัติพยาบาลพยานและพนักงาน (Interrogation Personnel Profiles)"
              : "ระบบแฟ้มทะเบียนประวัติพนักงานสำนักงานใหญ่ (Human Resources Profile)"
            }
          </span>
        </div>
        <span className="text-xs bg-indigo-950/80 border border-indigo-900 text-indigo-300 px-2.5 py-1 rounded font-mono">
          CONFIDENTIAL
        </span>
      </div>

      {/* Characters Switch Tabs for EP 2 */}
      {isEp2 && (
        <div className="bg-[#0f172a]/60 px-4 py-2 border-b border-slate-700/60 flex gap-2">
          <button
            onClick={() => {
              setActiveProfileTab("min");
              setShowSensitive(false);
            }}
            className={`px-3 py-1 text-xs font-semibold rounded transition-all cursor-pointer ${
              activeProfileTab === "min"
                ? "bg-indigo-600 text-white"
                : "bg-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            ณภัทร Napat (K.Min) - บัญชี
          </button>
          <button
            onClick={() => {
              setActiveProfileTab("jin");
              setShowSensitive(false);
            }}
            className={`px-3 py-1 text-xs font-semibold rounded transition-all cursor-pointer ${
              activeProfileTab === "jin"
                ? "bg-indigo-600 text-white"
                : "bg-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            เจนจิรา Jenjira (J.Jin) - จัดซื้อ
          </button>
        </div>
      )}

      {/* Main Profile Area */}
      <div className="flex-1 p-5 overflow-auto space-y-5 bg-gradient-to-b from-[#1e293b] to-[#121b2a]">
        
        {/* Header Avatar and Basic Title */}
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
          <div className="w-16 h-16 rounded-full bg-indigo-900/50 border-2 border-indigo-500/30 flex items-center justify-between text-indigo-400 text-xl font-bold select-none text-center">
            <span className="w-full">
              {activeProfileTab === "jin" ? "จิน" : "มิน"}
            </span>
          </div>
          <div className="text-center sm:text-left space-y-1">
            <h3 className="text-base font-bold text-slate-100">{currentFile.fullName}</h3>
            <p className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-1">
              <Briefcase className="w-3.5 h-3.5" />
              <span>{currentFile.position} | {currentFile.department}</span>
            </p>
            <div className="flex items-center justify-center sm:justify-start gap-2 pt-1 font-mono text-[10px]">
              <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">ID: {currentFile.employeeId}</span>
              <span className="bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-900">สถานะ: {currentFile.status}</span>
            </div>
          </div>
        </div>

        {/* Detailed Employment Attributes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900/30 border border-slate-800 p-3 rounded-lg space-y-1 text-xs">
            <span className="text-slate-400 block font-semibold text-[11px]">วันที่เข้าทำงาน (Hire Date):</span>
            <span className="text-slate-200">{currentFile.hireDate}</span>
          </div>
          <div className="bg-slate-900/30 border border-slate-800 p-3 rounded-lg space-y-1 text-xs">
            <span className="text-slate-400 block font-semibold text-[11px]">ประวัติการศึกษา (Education):</span>
            <span className="text-slate-200 truncate block">{currentFile.education}</span>
          </div>
          <div className="col-span-1 md:col-span-2 bg-slate-900/30 border border-slate-800 p-3 rounded-lg space-y-1 text-xs">
            <span className="text-slate-400 block font-semibold text-[11px]">ข้อมูลการติดต่อพนักงานยี่ห้อ:</span>
            <span className="text-slate-200 block">อีเมล: {currentFile.contact.email} | เบอร์โทรศัพท์: {currentFile.contact.phone}</span>
            <span className="text-slate-400 block mt-1">ที่อยู่จดทะเบียน: {currentFile.contact.address}</span>
          </div>
        </div>

        {/* Sensitive Bank / Payroll Account Details Section */}
        <div className="bg-indigo-950/20 border border-indigo-900/50 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>ข้อมูลทางการเงินส่วนบุคคล (Financial & Payroll Account)</span>
            </h4>
            {!showSensitive && (
              <button
                onClick={handleRevealClick}
                className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-slate-100 rounded-lg transition-colors shadow"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>คลิกถอดรหัสตรวจสอบเลขบัญชี</span>
              </button>
            )}
          </div>

          {showSensitive ? (
            <div className="bg-slate-950/80 border border-indigo-900 rounded-lg p-3 text-xs space-y-2.5 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300 font-mono">
                <div>
                   <span className="text-slate-500 font-sans block text-[11px]">สถาบันทางการเงิน:</span>
                  <span className="font-bold text-slate-200">{currentFile.salaryAccount.bank}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-sans block text-[11px]">ชื่อเจ้าของบัญชี:</span>
                  <span className="font-bold text-slate-200">{currentFile.salaryAccount.accountName}</span>
                </div>
                <div className="col-span-1 sm:col-span-2 pt-2 border-t border-indigo-950">
                  <span className="text-slate-500 font-sans block text-[11px]">เลขบัญชีธนาคารรับเงินเดือน (Payroll Bank A/C):</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-bold text-indigo-300 text-sm bg-indigo-950 py-1 px-2.5 rounded border border-indigo-900/80 font-mono">
                      {currentFile.salaryAccount.accountNumber}
                    </span>
                    <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded font-sans text-[11px] font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>ตรวจสอบกับทะเบียนประวัติเรียบร้อย</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 bg-slate-900/40 border border-dashed border-slate-700/60 rounded-lg text-slate-500 text-xs text-slate-400 font-sans">
              🔒 บัญชีธนาคารพนักงานจะถูกซ่อนไว้เพื่อป้องกันข้อมูลส่วนบุคคล จนกว่านักสืบบัญชีจะกดขอตรวจสอบความเชื่อมโยงทางการเงิน
            </div>
          )}
        </div>

        {/* HR Notes / Performance evaluation comments */}
        <div className="bg-slate-900/30 border border-slate-800 p-4 rounded-xl text-xs space-y-2">
          <h4 className="font-bold text-slate-400 flex items-center gap-1.5 uppercase font-mono text-[11px]">
            <Award className="w-3.5 h-3.5 text-slate-400" />
            <span>หมายเหตุฝ่ายทรัพยากรบุคคลและรายงานพฤติกรรม (HR Investigation Logs)</span>
          </h4>
          <p className="text-slate-300 leading-relaxed font-sans text-[11.5px]">
            {currentFile.performanceReview}
          </p>
          <div className="text-[10px] text-yellow-500/80 bg-yellow-500/5 border border-yellow-500/10 p-2 rounded-lg leading-relaxed font-sans">
            {activeProfileTab === "jin" ? (
              <span>
                📢 <strong>บันทึกจริยธรรมจัดซื้อ</strong>: J.Jin มีอำนาจคัดเลือกและขึ้นบัญชีซัพพลายเออร์แต่เพียงผู้เดียวในบริษัท แฟ้มจัดซื้อพบว่าเธอเสนอรับรองบริษัท M.N. Accounting Solution เจ้าของเดียวกับทะเบียนเงินเดือนโดยบอกว่าเป็นผู้เชี่ยวชาญพิเศษพ่วงตรวจส่งพอร์ตกุญแจ
              </span>
            ) : (
              <span>
                📢 <strong>พฤติกรรมหน้าต่างบานหลัก</strong>: K.Min มักจะไม่ยอมส่งไฟล์ Excel ดิบให้พนักงานคนอื่นแก้ไข หรือจะส่งเฉพาะชีทที่แปลงเป็นฟอร์มกระดาษ PDF ไปแล้วเท่านั้น โดยส่วนรวมเป็นคนถืองาน Excel บัญชีทั้งหมดของรอบ AC432
              </span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
