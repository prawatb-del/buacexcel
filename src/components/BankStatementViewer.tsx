import React, { useState, useEffect } from "react";
import { BANK_STATEMENT } from "../data";
import { BankTransaction } from "../types";
import { AlertCircle, Landmark, Search, ShieldAlert } from "lucide-react";

interface BankStatementViewerProps {
  onTransactionDiscovered: () => void;
  hasFoundMNTransaction: boolean;
  caseData: {
    embezzledAmount: number;
  };
}

export default function BankStatementViewer({ onTransactionDiscovered, hasFoundMNTransaction, caseData }: BankStatementViewerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTx, setSelectedTx] = useState<BankTransaction | null>(null);

  const dynamicBankStatement = BANK_STATEMENT.map((tx) => {
    if (tx.id === "b7") {
      return {
        ...tx,
        amount: caseData.embezzledAmount,
      };
    }
    return tx;
  });

  // Sync selected transaction on mount and case change
  useEffect(() => {
    setSelectedTx(dynamicBankStatement.find(t => t.id === "b7") || null);
  }, [caseData]);

  const filteredTransactions = dynamicBankStatement.filter((tx) =>
    tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.reference.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRowClick = (tx: BankTransaction) => {
    setSelectedTx(tx);
    if (tx.id === "b7") {
      onTransactionDiscovered();
    }
  };

  return (
    <div id="bank-statement-viewer" className="flex flex-col h-full bg-[#182235] text-slate-100 rounded-xl overflow-hidden border border-slate-700 shadow-2xl">
      {/* Title Bar */}
      <div className="bg-[#0f172a] px-4 py-3 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Landmark className="w-5 h-5 text-amber-500" />
          <span className="font-semibold text-sm text-slate-200">
            K-Biz Corporate Portal (ธนาคารกสิกรไทย - บัญชีบริษัทเงินฝากกระแสรายวัน)
          </span>
        </div>
        <span className="text-xs text-amber-400 bg-amber-950/70 border border-amber-900 px-2 rounded font-mono">
          A/C: 095-1-08122-0
        </span>
      </div>

      {/* Search Bar section */}
      <div className="bg-[#1e293b] p-3 border-b border-slate-700 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="ค้นหารายการ, เลขอ้างอิง, คู่ค้า..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/60 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
        <div className="text-[11px] text-slate-400 shrink-0 font-mono">
          แสดง {filteredTransactions.length} รายการ
        </div>
      </div>

      {/* Transaction Table list */}
      <div className="flex-1 overflow-auto bg-[#0a1120]">
        <table className="w-full border-collapse text-left text-xs font-mono">
          <thead>
            <tr className="bg-slate-800/80 border-b border-slate-700 text-slate-300 font-bold">
              <th className="p-3 w-28">วันที่ (Date)</th>
              <th className="p-3">รายละเอียด (Description)</th>
              <th className="p-3 w-24">เลขที่อ้างอิง (Ref)</th>
              <th className="p-3 w-28 text-right text-rose-400">เงินออก (Debit Out บัตร)</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((tx) => {
              const isSelected = selectedTx?.id === tx.id;

              return (
                <tr
                  key={tx.id}
                  onClick={() => handleRowClick(tx)}
                  className={`border-b border-slate-800/60 cursor-pointer transition-colors
                    ${isSelected ? "bg-amber-950/40 text-slate-100 font-bold border-l-4 border-l-amber-500" : "hover:bg-slate-800/35"}
                    text-slate-300
                  `}
                >
                  <td className="p-3 whitespace-nowrap">{tx.date}</td>
                  <td className="p-3 max-w-xs truncate font-sans">
                    <div className="flex items-center gap-1.5">
                      <span>{tx.description}</span>
                    </div>
                  </td>
                  <td className="p-3">{tx.reference}</td>
                  <td className="p-3 text-right font-bold text-rose-400">-{tx.amount.toLocaleString()}</td>
                </tr>
              );
            })}

            {filteredTransactions.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-8 text-slate-500 font-sans">
                  ไม่พบราการทำธุรกรรมที่ค้นหา
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Transaction Detail Inspector Panel */}
      <div className="bg-[#0f172a] p-4 border-t border-slate-700">
        <h4 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-2 font-mono">
          ℹ️ รายละเอียดธุรกรรม (Transaction Details)
        </h4>

        {selectedTx ? (
          <div className="bg-slate-900 border border-slate-800/60 rounded-lg p-3 text-xs space-y-2">
            <div className="grid grid-cols-2 gap-y-2 text-slate-300">
              <div>
                <span className="text-slate-400 font-sans block">วันที่ทำรายการ:</span>
                <span className="font-bold">{selectedTx.date}</span>
              </div>
              <div>
                <span className="text-slate-400 font-sans block">ประเภทธุรกรรม:</span>
                <span className="font-bold text-amber-400">{selectedTx.type} (K-Cyber)</span>
              </div>
              <div className="col-span-2 border-t border-slate-800 pt-1.5 mt-0.5">
                <span className="text-slate-400 font-sans block">คำอธิบายรายการ:</span>
                <span className="font-bold font-sans text-slate-100">{selectedTx.description}</span>
              </div>
              <div className="border-t border-slate-800 pt-1.5 mt-0.5">
                <span className="text-slate-400 font-sans block">รหัสอ้างอิงของธนาคาร (Reference No):</span>
                <span className="font-bold font-mono">{selectedTx.reference}</span>
              </div>
              <div className="border-t border-slate-800 pt-1.5 mt-0.5">
                <span className="text-slate-400 font-sans block">ยอดโอนสุทธิ (Amount):</span>
                <span className="font-bold text-rose-400">{selectedTx.amount.toLocaleString()} บาท</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-slate-500 text-xs font-sans">
            คลิกเลือกรายการเดินบัญชีด้านบนเพื่อเรียกสืบค้นข้อมูลรหัสปลายทางอย่างละเอียด
          </div>
        )}
      </div>
    </div>
  );
}
