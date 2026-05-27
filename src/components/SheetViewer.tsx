import React, { useState, useEffect } from "react";
import { LEDGER_SHEET_HEADER, LEDGER_SHEET_ROWS } from "../data";
import { AlertTriangle, FileSpreadsheet, Info } from "lucide-react";

interface SheetViewerProps {
  onFormulaDiscovered: () => void;
  hasFoundBrokenSum: boolean;
  caseData: {
    embezzledAmount: number;
    correctCellKeyword: string;
  };
}

export default function SheetViewer({ onFormulaDiscovered, hasFoundBrokenSum, caseData }: SheetViewerProps) {
  const getDynamicFormula = () => {
    const omitted = caseData.correctCellKeyword;
    if (omitted === "G13") return "=SUM(G6:G12) + G14";
    if (omitted === "G14") return "=SUM(G6:G13)";
    return "=SUM(G6:G11) + SUM(G13:G14)";
  };

  const [selectedCell, setSelectedCell] = useState<{ row: number; col: string; val: any; formula?: string } | null>(null);

  // Sync selected cell (Total row) on mount or case change
  useEffect(() => {
    setSelectedCell({
      row: 16,
      col: "G",
      val: 450000,
      formula: getDynamicFormula(),
    });
  }, [caseData]);

  const cols = ["A", "B", "C", "D", "E", "F", "G", "H"];

  // Generate dynamic rows based on student's case parameters
  const dynamicRows = LEDGER_SHEET_ROWS.map((row) => {
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

  const handleCellClick = (rowNum: number, colKey: string, cellData: any) => {
    setSelectedCell({
      row: rowNum,
      col: colKey,
      val: cellData.val,
      formula: cellData.formula,
    });

    if (rowNum === 16 && colKey === "G") {
      onFormulaDiscovered();
    }
  };

  return (
    <div id="excel-viewer" className="flex flex-col h-full bg-[#1e293b] text-slate-100 rounded-xl overflow-hidden border border-slate-700 shadow-2xl">
      {/* Excel Title Bar */}
      <div className="bg-[#0f172a] px-4 py-3 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
          <span className="font-semibold text-sm truncate max-w-xs sm:max-w-md md:max-w-lg text-emerald-200">
            {LEDGER_SHEET_HEADER.company}
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
            <p className="font-medium text-slate-100 text-[13px]">{LEDGER_SHEET_HEADER.title}</p>
          </div>
          <div>
            <p className="text-slate-400">รอบระยะเกณฑ์บัญชี:</p>
            <p className="font-medium text-slate-100 text-[13px]">{LEDGER_SHEET_HEADER.period}</p>
          </div>
        </div>
        <p className="mt-2 text-rose-300 font-mono flex items-center gap-1.5 bg-rose-950/40 border border-rose-900/60 p-2 rounded-lg">
          <Info className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <span>{LEDGER_SHEET_HEADER.status}</span>
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
              const targetRowNum = parseInt(caseData.correctCellKeyword.replace(/\D/g, "")) || 12;
              return (
                <tr key={row.id} className={`${rowNum === 16 ? "bg-emerald-950/35 border-t-2 border-emerald-500" : rowNum === targetRowNum ? "bg-rose-950/20 hover:bg-rose-950/30" : "hover:bg-slate-800/40"}`}>
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
                          ${col === "G" && typeof cell.val === "number" && cell.val > 500000 ? "text-amber-400 font-bold" : ""}
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
              <span>ค่าปัจจุบัน: <strong className="text-slate-100 font-mono">{selectedCell.val.toLocaleString()}</strong></span>
            </div>
            
            {/* Show Formula Breakdown if selected cell is G16 */}
            {selectedCell.row === 16 && selectedCell.col === "G" ? (
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
