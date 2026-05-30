import React, { useState, useEffect } from "react";
import { LEDGER_SHEET_HEADER, LEDGER_SHEET_ROWS } from "../data";
import { AlertTriangle, FileSpreadsheet, Info } from "lucide-react";

interface SheetViewerProps {
  onFormulaDiscovered: () => void;
  hasFoundBrokenSum: boolean;
  caseData: {
    embezzledAmount: number;
    correctCellKeyword: string;
    ep2DjungSalary: number;
    ep2DjungAccount: string;
    ep2CorrectBehavior: string;
    ep2CorrectCell: string;
  };
  selectedEpisode?: number | null;
}

export default function SheetViewer({ onFormulaDiscovered, hasFoundBrokenSum, caseData, selectedEpisode }: SheetViewerProps) {
  const isEp2 = selectedEpisode === 2;

  const getDynamicFormula = () => {
    const omitted = caseData.correctCellKeyword;
    if (omitted === "G13") return "=SUM(G6:G12) + G14";
    if (omitted === "G14") return "=SUM(G6:G13)";
    return "=SUM(G6:G11) + SUM(G13:G14)";
  };

  const [selectedCell, setSelectedCell] = useState<{ row: number; col: string; val: any; formula?: string } | null>(null);

  // Sync selected cell (Total row) on mount or case change
  useEffect(() => {
    if (isEp2) {
      setSelectedCell({
        row: 10,
        col: "I",
        val: "🚨 FRAUD_WARNING!",
        formula: `=IF(AND(G10="⚠️ GHOST_SUSPECT", H10<>"CLEAN"), "🚨 ALARM: GHOST PAYROLL MULE_ACCOUNT_FRAUD!", "VERIFIED")`,
      });
    } else {
      setSelectedCell({
        row: 16,
        col: "G",
        val: 450000,
        formula: getDynamicFormula(),
      });
    }
  }, [caseData, selectedEpisode, isEp2]);

  const cols = isEp2
    ? ["A", "B", "C", "D", "E", "F", "G", "H", "I"]
    : ["A", "B", "C", "D", "E", "F", "G", "H"];

  // Generate dynamic rows based on student's case parameters
  const getEp1Rows = () => {
    return LEDGER_SHEET_ROWS.map((row) => {
      const rowNum = row.rowNum;
      const omittedCell = caseData.correctCellKeyword; // e.g., "G12", "G13", "G14"
      const targetRowNum = parseInt(omittedCell.replace(/\D/g, "")) || 12;

      if (rowNum === targetRowNum) {
        // This row is hijacked by the embezzler
        return {
          ...row,
          cells: {
            ...row.cells,
            D: { ...row.cells.D, val: "M.N. Accounting Solution (ค่าธรรมเนียมที่ปรึกษาระบบบัญชี)" },
            G: { ...row.cells.G, val: caseData.embezzledAmount },
            H: { ...row.cells.H, val: "ค่าที่ปรึกษาพัฒนาระบบ ERP ประจำงวด" }
          }
        };
      } else if (rowNum === 12 && targetRowNum !== 12) {
        // Row 12 is restored to normal utilities if target is elsewhere
        return {
          ...row,
          cells: {
            ...row.cells,
            D: { ...row.cells.D, val: "Logistics Software Support (ค่าบำรุงรักษาระบบส่งกำลัง)" },
            G: { ...row.cells.G, val: 35000 },
            H: { ...row.cells.H, val: "ต่อสัญญาลิขสิทธิ์ประจำเดือน" }
          }
        };
      }

      if (rowNum === 16) {
        // Update the formula row to display the student-specific tampered formula
        return {
          ...row,
          cells: {
            ...row.cells,
            G: { 
              ...row.cells.G, 
              formula: getDynamicFormula() 
            }
          }
        };
      }
      return row;
    });
  };

  const EP2_SHEET_ROWS = [
    { id: "row-5", rowNum: 5, cells: {
      A: { val: "Row #", isHeader: true },
      B: { val: "Emp ID (รหัสพนักงาน)", isHeader: true },
      C: { val: "Name (ชื่อ-สกุล)", isHeader: true },
      D: { val: "Position (ตำแหน่ง)", isHeader: true },
      E: { val: "Net Paid (ยอดโอน - บาท)", isHeader: true },
      F: { val: "Account No (เลขบัญชี)", isHeader: true },
      G: { val: "HR Lookup (ตรวจสอบกำลังพล)", isHeader: true },
      H: { val: "Supplier Match (เทียบเลขบัญชีคู่ค้า)", isHeader: true },
      I: { val: "Forensic Status (ผลการชันสูตร)", isHeader: true }
    }},
    { id: "row-6", rowNum: 6, cells: {
      A: { val: 1 },
      B: { val: "E-101" },
      C: { val: "Somchai Jaidee (สมชาย ใจดี)" },
      D: { val: "Logistics Driver" },
      E: { val: 29500 },
      F: { val: "912-1-24512-1" },
      G: { val: "VERIFIED_ACTIVE" },
      H: { val: "CLEAN" },
      I: { val: "OK", isHeader: true }
    }},
    { id: "row-7", rowNum: 7, cells: {
      A: { val: 2 },
      B: { val: "E-102" },
      C: { val: "Somsri Rakdee (สมศรี รักดี)" },
      D: { val: "Admin Coordinator" },
      E: { val: 26200 },
      F: { val: "045-2-12458-2" },
      G: { val: "VERIFIED_ACTIVE" },
      H: { val: "CLEAN" },
      I: { val: "OK", isHeader: true }
    }},
    { id: "row-8", rowNum: 8, cells: {
      A: { val: 3 },
      B: { val: "E-105" },
      C: { val: "J.Jin จิรเสกข์" },
      D: { val: "Procurement Officer" },
      E: { val: 34500 },
      F: { val: "122-2-55611-3" },
      G: { val: "VERIFIED_ACTIVE" },
      H: { val: "CLEAN" },
      I: { val: "OK", isHeader: true }
    }},
    { id: "row-9", rowNum: 9, cells: {
      A: { val: 4 },
      B: { val: "E-109" },
      C: { val: "K.Min ณภัทร" },
      D: { val: "Chief Accountant" },
      E: { val: 55000 },
      F: { val: "022-2-21954-3" },
      G: { val: "VERIFIED_ACTIVE" },
      H: { val: "CLEAN" },
      I: { val: "OK", isHeader: true }
    }},
    { id: "row-10", rowNum: 10, cells: {
      A: { val: 5 },
      B: { val: "E-999" },
      C: { val: "D.Jung (ดนัย จัง)" },
      D: { val: "Temp Procurement Liaison" },
      E: { val: caseData.ep2DjungSalary },
      F: { val: caseData.ep2DjungAccount },
      G: { 
        val: "⚠️ GHOST_SUSPECT", 
        formula: `=XLOOKUP(B10, HR_Master!$A$2:$A$15, HR_Master!$C$2:$C$15, "⚠️ GHOST_SUSPECT")`
      },
      H: { 
        val: "⚠️ COLLUSION_DETECTED", 
        formula: `=IFERROR(XLOOKUP(F10, Vendor_Registry!$D$2:$D$50, Vendor_Registry!$B$2:$B$50), "CLEAN")`
      },
      I: { 
        val: "🚨 FRAUD_WARNING!", 
        formula: `=IF(AND(G10="⚠️ GHOST_SUSPECT", H10<>"CLEAN"), "🚨 ALARM: GHOST PAYROLL MULE_ACCOUNT_FRAUD!", "VERIFIED")`,
        isHeader: true
      }
    }}
  ];

  const dynamicRows = selectedEpisode === 2 ? EP2_SHEET_ROWS : getEp1Rows();

  const handleCellClick = (rowNum: number, colKey: string, cellData: any) => {
    setSelectedCell({
      row: rowNum,
      col: colKey,
      val: cellData.val,
      formula: cellData.formula,
    });

    if (!isEp2) {
      if (rowNum === 16 && colKey === "G") {
        onFormulaDiscovered();
      }
    } else {
      // For Episode 2, clicking any forensic indicators in Row 10 unlocks the clue!
      if (rowNum === 10 && (colKey === "G" || colKey === "H" || colKey === "I")) {
        onFormulaDiscovered();
      }
    }
  };

  const getHeaderInfo = () => {
    switch (selectedEpisode) {
      case 2:
        return {
          company: "VeloBike Logistics Co., Ltd. (บริษัท เวนโลไบค์ โลจิสติกส์ จำกัด)",
          title: "Monthly Payroll Summary & Internal Audit Tracker (ทะเบียนเงินเดือนและการวางสูตรตรวจสอบกำลังพล)",
          period: "เดือนธันวาคม 2568 (December 2025)",
          status: "สถานะการกระทบยอด: ตรวจสอบพบพฤติการณ์สวมสิทธิ์เงินโอนชำระพนักงานชั่วคราวซ้อนบัญชีคู่ค้าซัพพลายเออร์",
        };
      case 3:
        return {
          company: "VeloBike Logistics Co., Ltd. (บริษัท เวนโลไบค์ โลจิสติกส์ จำกัด)",
          title: "Supplier Invoice Verification Tracker (ทะเบียนตรวจรับใบเสร็จคู่ค้าสลับรายการ) [Ep. 3 โครงสร้าง]",
          period: "เดือนมกราคม 2569 (January 2026)",
          status: "สถานะการกระทบยอด: พบเอกสารใบกำกับภาษีมีความผิดเพี้ยนในการจัดหมวดหมู่ยอดชำระ",
        };
      case 4:
        return {
          company: "VeloBike Logistics Co., Ltd. (บริษัท เวนโลไบค์ โลจิสติกส์ จำกัด)",
          title: "Mule Account Fund Transfer logs (บัญชีเงินหมุนนอมินีเงินสำรองเลี้ยงชีพ) [Ep. 4 โครงสร้าง]",
          period: "เดือนกุมภาพันธ์ 2569 (February 2026)",
          status: "สถานะการกระทบยอด: พบคู่บัญชีบุคคลที่สามถือครองผลประโยชน์ผิดวิสัยทะเบียนบริษัท",
        };
      case 5:
        return {
          company: "VeloBike Logistics Co., Ltd. (บริษัท เวนโลไบค์ โลจิสติกส์ จำกัด)",
          title: "Final Court Case Proof Folder (สารบาญรวมพยานหลักฐานมัดตัว K.Min) [Ep. 5 โครงสร้าง]",
          period: "เดือนมีนาคม 2569 (March 2026)",
          status: "สถานะการกระทบยอด: รอเปิดคำสารภาพเค้นความจริงครั้งสุดท้าย",
        };
      default:
        return LEDGER_SHEET_HEADER;
    }
  };

  const headerInfo = getHeaderInfo();

  return (
    <div id="excel-viewer" className="flex flex-col h-full bg-[#1e293b] text-slate-100 rounded-xl overflow-hidden border border-slate-700 shadow-2xl">
      {/* Excel Title Bar */}
      <div className="bg-[#0f172a] px-4 py-3 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
          <span className="font-semibold text-sm truncate max-w-xs sm:max-w-md md:max-w-lg text-emerald-200">
            {headerInfo.company}
          </span>
        </div>
        <span className="text-xs font-mono bg-emerald-950/80 border border-emerald-900 text-emerald-400 px-2.5 py-1 rounded-full shrink-0">
          Excel Online v4.2
        </span>
      </div>

      {/* Spreadsheet Metadata Area */}
      <div className="bg-[#1e293b] p-4 border-b border-slate-700 text-xs text-slate-300">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div>
            <p className="text-slate-400">ชื่องานดึงข้อมูล:</p>
            <p className="font-medium text-slate-100 text-[13px]">{headerInfo.title}</p>
          </div>
          <div>
            <p className="text-slate-400">รอบระยะเกณฑ์บัญชี:</p>
            <p className="font-medium text-slate-100 text-[13px]">{headerInfo.period}</p>
          </div>
        </div>
        <p className="mt-2 text-rose-300 font-mono flex items-center gap-1.5 bg-rose-950/40 border border-rose-900/60 p-2 rounded-lg">
          <Info className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <span>{headerInfo.status}</span>
        </p>
      </div>

      {/* Dynamic Formula Bar */}
      <div className="bg-[#0f172a] px-3 py-2 border-b border-slate-700 flex items-center gap-2 font-mono text-xs">
        <div className="bg-slate-800 text-slate-300 px-2 py-1 rounded select-none border border-slate-700 min-w-[50px] text-center font-bold">
          {selectedCell ? `${selectedCell.col}${selectedCell.row}` : "None"}
        </div>
        <div className="text-slate-500 font-serif select-none font-bold text-sm">fx</div>
        <div className="flex-1 bg-slate-900/80 px-3 py-1.5 rounded border border-slate-800 text-slate-100 font-semibold overflow-x-auto whitespace-nowrap min-h-[28px]">
          {selectedCell?.formula ? (
            <span className="text-amber-300">{selectedCell.formula}</span>
          ) : selectedCell ? (
            <span className="text-slate-300">{typeof selectedCell.val === "number" ? selectedCell.val.toLocaleString() : selectedCell.val}</span>
          ) : (
            <span className="text-slate-600">คลิกที่ช่องใดช่องหนึ่งเพื่อนึกคิดสูตร...</span>
          )}
        </div>
      </div>

      {/* Grid Layout Container */}
      <div className="flex-1 overflow-auto bg-[#0f172a]/40">
        <table className="w-full border-collapse text-left font-sans text-xs">
          <thead>
            <tr className="bg-slate-800 select-none">
              <th className="p-1.5 border border-slate-700 w-8 min-w-[32px] text-center text-slate-400 font-mono"></th>
              {cols.map((col) => (
                <th key={col} className="p-1 px-3 border border-slate-700 text-center font-mono text-slate-300 font-bold min-w-[90px]">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dynamicRows.map((row) => {
              const rowNum = row.rowNum;
              const targetRowNum = isEp2 ? 10 : (parseInt(caseData.correctCellKeyword.replace(/\D/g, "")) || 12);
              const isHighlightRow = isEp2 ? rowNum === 10 : rowNum === 16;
              return (
                <tr 
                  key={row.id} 
                  className={`
                    ${isHighlightRow 
                      ? "bg-emerald-950/30 border-t border-[#10b981]/25 border-b border-[#10b981]/25" 
                      : rowNum === targetRowNum && !isEp2
                        ? "bg-rose-950/20 hover:bg-rose-950/30" 
                        : "hover:bg-slate-800/40"
                    }
                  `}
                >
                  {/* Row Number Header */}
                  <td className="p-1.5 bg-slate-800 border border-slate-700 text-center font-mono text-slate-400 select-none font-bold">
                    {rowNum}
                  </td>
                  {/* Row Cells */}
                  {cols.map((col) => {
                    const cellKey = col as keyof typeof row.cells;
                    const cell = row.cells[cellKey];
                    const isSelected = selectedCell?.row === rowNum && selectedCell?.col === col;

                    if (!cell) {
                      return (
                        <td
                          key={col}
                          onClick={() => handleCellClick(rowNum, col, { val: "" })}
                          className={`p-2 border border-slate-700/60 min-h-[36px] transition-colors ${isSelected ? "ring-2 ring-emerald-500 bg-emerald-900/40" : ""}`}
                        />
                      );
                    }

                    const isHeader = cell.isHeader || rowNum === 5;
                    const valStr = typeof cell.val === "number" ? cell.val.toLocaleString() : cell.val;

                    return (
                      <td
                        key={col}
                        onClick={() => handleCellClick(rowNum, col, cell)}
                        className={`p-2 border border-slate-700 transition-all cursor-pointer min-w-[100px] h-9 truncate 
                          ${isHeader ? "bg-slate-800/85 text-slate-200 font-bold text-center" : "text-slate-300 font-mono"}
                          ${isSelected ? "bg-emerald-900/50 text-slate-100 ring-2 ring-emerald-400 font-bold z-10 scale-[1.01]" : ""}
                          ${col === "E" && isEp2 && rowNum === 10 ? "text-amber-400 font-bold" : col === "G" && !isEp2 && typeof cell.val === "number" && cell.val > 500000 ? "text-amber-400 font-bold" : ""}
                        `}
                      >
                        {valStr}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Auditing Warning Inspector Panel at Bottom */}
      <div id="inspector-panel" className="bg-[#0f172a] p-4 border-t border-slate-700 text-slate-300">
        <h4 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-2 font-mono flex items-center gap-2">
          <span>🔎 Excel Cell Inspector & Auditor</span>
        </h4>

        {selectedCell ? (
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-3 text-xs space-y-2">
            <div className="flex justify-between items-center text-[13px]">
              <span className="text-slate-400">เซลล์ที่เลือก: <strong className="text-emerald-400 font-mono">{selectedCell.col}{selectedCell.row}</strong></span>
              <span>ค่าปัจจุบัน: <strong className="text-slate-100 font-mono">{selectedCell.val ? selectedCell.val.toLocaleString() : "ว่างเปล่า"}</strong></span>
            </div>
            
            {/* Show Formula Breakdown */}
            {isEp2 ? (
              selectedCell.row === 10 ? (
                selectedCell.col === "G" ? (
                  <div className="text-slate-300 bg-slate-900/50 border border-slate-800 p-2.5 rounded-lg space-y-1 animate-fadeIn">
                    <p className="font-bold text-slate-200">สูตรเช็คฐานข้อมูล HR (XLOOKUP Employee Master)</p>
                    <p className="leading-relaxed text-slate-300 text-xs mt-1">
                      สูตร: <code className="bg-slate-950 px-1 py-0.5 rounded text-amber-300 font-mono font-bold">{`=XLOOKUP(B10, HR_Master!$A$2:$A$15, HR_Master!$C$2:$C$15, "⚠️ GHOST_SUSPECT")`}</code>
                    </p>
                    <p className="text-slate-400 mt-1.5 leading-relaxed">
                      <strong>วิเคราะห์ทางนิติวิทยาศาสตร์</strong>: แผนกสืบสวนระบุข้อสังเกตการค้นหาพนักงาน <code className="text-sky-300 font-mono">E-999</code> ปรากฏว่าสืบค้นประวัติจาก HR Master แล้วไม่พบชื่อทะเบียนจริง ขึ้นพิกัดเป็น <code className="text-rose-450 font-bold">⚠️ GHOST_SUSPECT</code> (พนักงานตรวจสอบไม่พบกำลังพล)!
                    </p>
                  </div>
                ) : selectedCell.col === "H" ? (
                  <div className="text-slate-300 bg-slate-900/50 border border-slate-800 p-2.5 rounded-lg space-y-1 animate-fadeIn">
                    <p className="font-bold text-slate-200">สูตรค้นพิกัดเลขบัญชีม้าในทะเบียนจัดซื้อ (Vendor Registry Crossmatch)</p>
                    <p className="leading-relaxed text-slate-300 text-xs mt-1">
                      สูตร: <code className="bg-slate-950 px-1 py-0.5 rounded text-amber-300 font-mono font-bold">{`=IFERROR(XLOOKUP(F10, Vendor_Registry!$D$2:$D$50, Vendor_Registry!$B$2:$B$50), "CLEAN")`}</code>
                    </p>
                    <p className="text-slate-400 mt-1.5 leading-relaxed">
                      <strong>วิเคราะห์ทางนิติวิทยาศาสตร์</strong>: ตรวจสอบความสอดคล้องของเลขบัญชี <code className="text-sky-300 font-mono">{caseData.ep2DjungAccount}</code> กับฝ่ายตรวจสอบคู่ค้า ปรากฏว่าเลขนี้ตรงกับซัพพลายเออร์นอมินี <code className="text-rose-405 font-bold">⚠️ COLLUSION_DETECTED (M.N. Accounting)</code> ซึ่งอยู่ในสิทธิ์จัดซื้อของ J.Jin!
                    </p>
                  </div>
                ) : selectedCell.col === "I" ? (
                  <div className="text-slate-300 bg-slate-900/50 border border-slate-800 p-2.5 rounded-lg space-y-1 animate-fadeIn">
                    <p className="font-bold text-slate-200">สูตรรวมเงื่อนหาร่วมตรวจกลลวงจ่ายผี (Intermittent Multi-Logic Verification)</p>
                    <p className="leading-relaxed text-slate-300 text-xs mt-1">
                      สูตร: <code className="bg-slate-950 px-1 py-0.5 rounded text-amber-300 font-mono font-bold">{`=IF(AND(G10="⚠️ GHOST_SUSPECT", H10<>"CLEAN"), "🚨 ALARM: GHOST PAYROLL MULE_ACCOUNT_FRAUD!", "VERIFIED")`}</code>
                    </p>
                    <p className="text-slate-400 mt-1.5 leading-relaxed">
                      <strong>วิเคราะห์ทางนิติวิทยาศาสตร์</strong>: ดึงฟังก์ชันสอดคล้อง ตรวจสอบคู่หากตำแหน่งพนักงานสะสมไม่มีตัวจริง แต่ชื่อและเลขบัญชีดันลิงก์รับส่งถ่ายตรงเข้ากับบริษัทคู่ค้าปลอมของซิวส์! แจ้งเตือนภัยระดับสูงสุด <code className="text-rose-400 font-bold">🚨 FRAUD_WARNING: MULE ACCOUNT CO-CONSPIRATORS!</code> พิสูจน์ได้ว่า J.Jin และ K.Min จงใจผันสัญญางวดเปล่าเฉลี่ยแบ่งรายได้ลวง!
                    </p>
                  </div>
                ) : (
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    ข้อมูลทะเบียนสรุปจ่ายสุทธิของแถวม้ามีผลทางบัญชี สรุปยอดคือ {caseData.ep2DjungSalary.toLocaleString()} บาท เลขบัญชี {caseData.ep2DjungAccount} ชื่อพิกัดสวมสิทธิ์คือ ดนัย จัง (D.Jung)
                  </p>
                )
              ) : (
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  พนักงานระดับปกติทุกคนในบริษัทมีกำลังพลตรวจพบตัวตนจริงใน HR_Master บัญชีสมบูรณ์แบบ แผนกตรวจสอบได้ยืนยันความปลอดภัยดี ยกเว้นแถวผู้ต้องสงสัยที่ 10
                </p>
              )
            ) : selectedCell.row === 16 && selectedCell.col === "G" ? (
              <div className="text-slate-300 bg-slate-900/50 border border-slate-800 p-2.5 rounded-lg space-y-1.5 animate-fadeIn">
                <p className="flex items-center gap-1.5 font-bold text-slate-200 font-sans">
                  <span>ข้อมูลสูตรการคำนวณ (Formula Info)</span>
                </p>
                <p className="leading-relaxed">
                  สูตรคำนวณในเซลล์นี้ระบุเป็น <code className="bg-slate-950 px-1 py-0.5 rounded text-amber-300 font-mono font-bold">{getDynamicFormula()}</code> ซึ่งใช้สำหรับหาองค์ประกอบผลรวมสะสมในพื้นที่เลือก
                </p>
              </div>
            ) : selectedCell.row === (parseInt(caseData.correctCellKeyword.replace(/\D/g, "")) || 12) ? (
              <div className="text-slate-300 bg-slate-900/50 border border-slate-800 p-2.5 rounded-lg space-y-1">
                <p className="font-bold text-slate-200 font-sans">รายละเอียดรายการ (Acct Row Details)</p>
                <p className="">
                  รายการเงินสดจ่ายให้กับหน่วยงานภายนอก (M.N. Accounting Solution) บันทึกในหมวดหมู่ที่ปรึกษาระบบบัญชี
                </p>
              </div>
            ) : (
              <p className="text-slate-400 leading-relaxed text-[11px]">
                ค่าในเซลล์นี้เป็นข้อมูลบัญชีรายจ่ายทั่วไปตามที่บันทึกไว้ในสมุดบัญชีเงินสด
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-4 text-slate-500 text-xs">
            คลิกเลือกเซลล์ในตาราง Excel ด้านบน เพื่อวิเคราะห์โครงสร้างสูตรแอบแฝง
          </div>
        )}
      </div>
    </div>
  );
}
