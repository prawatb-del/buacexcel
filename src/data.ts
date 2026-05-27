import { BankTransaction } from "./types";

// Excel Spreadsheet data simulation: Credit cash book
export const LEDGER_SHEET_HEADER = {
  company: "VeloBike Logistics Co., Ltd. (บริษัท เวนโลไบค์ โลจิสติกส์ จำกัด)",
  title: "General Ledger - Credit Cash Book (สมุดบัญชีรายจ่ายเงินสด)",
  period: "เดือนธันวาคม 2568 (December 2025)",
  status: "สถานะ: อนุมัติแล้ว (Approved) โดย แผนกตรวจสอบภายในและบอร์ดบริหาร",
};

export const LEDGER_SHEET_ROWS = [
  // Headers
  { id: "row-5", rowNum: 5, cells: {
    A: { val: "Row #", isHeader: true },
    B: { val: "Date (วันที่)", isHeader: true },
    C: { val: "Ref No. (เลขที่เอกสาร)", isHeader: true },
    D: { val: "Description (รายการ)", isHeader: true },
    E: { val: "Acct Code (รหัสบัญชี)", isHeader: true },
    F: { val: "Debit (เดบิต)", isHeader: true },
    G: { val: "Credit (เครดิต - บาท)", isHeader: true },
    H: { val: "Notes (หมายเหตุ)", isHeader: true }
  }},
  // Content Rows
  { id: "row-6", rowNum: 6, cells: {
    A: { val: 1 },
    B: { val: "2025-12-01" },
    C: { val: "PV-2512-01" },
    D: { val: "Office Rent (ค่าเช่าสำนักงานใหญ่)" },
    E: { val: "51101" },
    F: { val: 0 },
    G: { val: 120000 },
    H: { val: "จ่ายประจำรอบเดือน" }
  }},
  { id: "row-7", rowNum: 7, cells: {
    A: { val: 2 },
    B: { val: "2025-12-03" },
    C: { val: "PV-2512-02" },
    D: { val: "Electricity & Water (ค่าน้ำค่าไฟสำนักงาน)" },
    E: { val: "51102" },
    F: { val: 0 },
    G: { val: 18500 },
    H: { val: "จ่ายตามบิล กฟภ. / กปน." }
  }},
  { id: "row-8", rowNum: 8, cells: {
    A: { val: 3 },
    B: { val: "2025-12-05" },
    C: { val: "PV-2512-03" },
    D: { val: "Internet & Telecom (ค่าอินเทอร์เน็ตและเครือข่าย)" },
    E: { val: "51103" },
    F: { val: 0 },
    G: { val: 6500 },
    H: { val: "สัญญารายเดือน AIS Business" }
  }},
  { id: "row-9", rowNum: 9, cells: {
    A: { val: 4 },
    B: { val: "2025-12-08" },
    C: { val: "PV-2512-05" },
    D: { val: "Office Cleaning service (ค่าทำความสะอาดรายเดือน)" },
    E: { val: "51201" },
    F: { val: 0 },
    G: { val: 25000 },
    H: { val: "ซับคอนแทรค แม่บ้านรายสัปดาห์" }
  }},
  { id: "row-10", rowNum: 10, cells: {
    A: { val: 5 },
    B: { val: "2025-12-10" },
    C: { val: "PV-2512-06" },
    D: { val: "Logistics Fleet Insurance (ค่าประกันภัยกองยานส่งสินค้า)" },
    E: { val: "51301" },
    F: { val: 0 },
    G: { val: 20000 },
    H: { val: "ต่ออายุเบี้ยประกันภัยรายไตรมาส" }
  }},
  { id: "row-11", rowNum: 11, cells: {
    A: { val: 6 },
    B: { val: "2025-12-12" },
    C: { val: "PV-2512-08" },
    D: { val: "Office Stationery Supplies (ค่าจัดซื้อเครื่องเขียนสำนักงาน)" },
    E: { val: "51201" },
    F: { val: 0 },
    G: { val: 40000 },
    H: { val: "จัดซื้ออุปกรณ์เตรียมสิ้นปี" }
  }},
  { id: "row-12", rowNum: 12, cells: {
    A: { val: 7 },
    B: { val: "2025-12-15" },
    C: { val: "PV-2512-12" },
    D: { val: "M.N. Accounting Solution (ค่าธรรมเนียมที่ปรึกษาระบบบัญชี)" },
    E: { val: "51302" },
    F: { val: 0 },
    G: { val: 1000000 }, // Siphoned amount!
    H: { val: "ค่าที่ปรึกษาพัฒนาระบบ ERP ประจำงวด" }
  }},
  { id: "row-13", rowNum: 13, cells: {
    A: { val: 8 },
    B: { val: "2025-12-20" },
    C: { val: "PV-2512-15" },
    D: { val: "Warehouse Utilities (ค่าสาธารณูปโภคคลังสินค้า)" },
    E: { val: "51405" },
    F: { val: 0 },
    G: { val: 110000 },
    H: { val: "ค่าไฟคลังสินค้าย่อย" }
  }},
  { id: "row-14", rowNum: 14, cells: {
    A: { val: 9 },
    B: { val: "2025-12-28" },
    C: { val: "PV-2512-18" },
    D: { val: "Online Marketing Budget (งบทำการโฆษณาออนไลน์)" },
    E: { val: "51501" },
    F: { val: 0 },
    G: { val: 110000 },
    H: { val: "ยิงโฆษณา Google & Facebook Ads" }
  }},
  { id: "row-15", rowNum: 15, cells: {
    A: { val: "" },
    B: { val: "" },
    C: { val: "" },
    D: { val: "" },
    E: { val: "" },
    F: { val: "" },
    G: { val: "" },
    H: { val: "" }
  }},
  // Total Row -- Notice the custom formula
  { id: "row-16", rowNum: 16, cells: {
    A: { val: "TOTAL", isHeader: true },
    B: { val: "", isHeader: true },
    C: { val: "", isHeader: true },
    D: { val: "ยอดรวมเครดิตรายจ่ายตามบัญชี (Credit Sum)", isHeader: true },
    E: { val: "", isHeader: true },
    F: { val: 0, isHeader: true },
    G: { 
      val: 450000, 
      formula: "=SUM(G6:G11) + SUM(G13:G14)", // Acknowledges siphoning by leaving out G12!
      isHeader: true 
    },
    H: { val: "คำนวณอัตโนมัติ", isHeader: true }
  }}
];

// Actual Bank Statement from Kasikorn Bank (KBank)
export const BANK_STATEMENT: BankTransaction[] = [
  { id: "b1", date: "2025-12-01", description: "TRANSFER / PV-2512-01 / Office Rent HQ", reference: "KB-908127", amount: 120000, type: "CREDIT" },
  { id: "b2", date: "2025-12-03", description: "DIRECT DEBIT / PV-2512-02 / MEA & MWA", reference: "KB-908154", amount: 18500, type: "CREDIT" },
  { id: "b3", date: "2025-12-05", description: "DIRECT DEBIT / PV-2512-03 / AIS telecom", reference: "KB-908230", amount: 6500, type: "CREDIT" },
  { id: "b4", date: "2025-12-08", description: "TRANSFER / PV-2512-05 / Maid Monthly Service", reference: "KB-908311", amount: 25000, type: "CREDIT" },
  { id: "b5", date: "2025-12-10", description: "TRANSFER / PV-2512-06 / Safety Fleet Insur", reference: "KB-908419", amount: 20000, type: "CREDIT" },
  { id: "b6", date: "2025-12-12", description: "TRANSFER / PV-2512-08 / B2S Stationery Office", reference: "KB-908480", amount: 40000, type: "CREDIT" },
  
  // THE CRITICAL TRANSACTION:
  { id: "b7", date: "2025-12-15", description: "TRANSFER K-CYBER / to KBank A/C 022-2-21954-3 (M.N. Accounting Solution)", reference: "KB-908552", amount: 1000000, type: "CREDIT" },
  
  { id: "b8", date: "2025-12-20", description: "TRANSFER / PV-2512-15 / Warehouse Utilities Elec", reference: "KB-908611", amount: 110000, type: "CREDIT" },
  { id: "b9", date: "2025-12-28", description: "TRANSFER / PV-2512-18 / FB & Google Ad Spend", reference: "KB-908752", amount: 110000, type: "CREDIT" },
];

// Employee File for K.Min Napat
export const EMPLOYEE_FILE = {
  fullName: "K.Min ณภัทร (Napat 'Min')",
  employeeId: "EMP-432-09",
  position: "หัวหน้าแผนกบัญชี (Chief Accountant)",
  department: "แผนกบัญชีการเงิน (Financial Accounting)",
  hireDate: "12 มิถุนายน 2563 (5 ปี 6 เดือน)",
  education: "ปริญญาตรี บัญชีบัณฑิต (บช.บ.)",
  status: "พนักงานประจำ (Active)",
  salaryAccount: {
    bank: "ธนาคารกสิกรไทย (Kasikorn Bank)",
    accountNumber: "022-2-21954-3", // MATCHES M.N. ACCOUNTING SOLUTION!
    accountName: "K.Min ณภัทร"
  },
  contact: {
    email: "napat.w@velobike-logistics.co.th",
    phone: "089-219-543x",
    address: "99/43 ซอยวิภาวดีรังสิต แขวงดินแดง เขตดินแดง กรุงเทพฯ"
  },
  performanceReview: "ทำงานรวดเร็ว ละเอียดสูง จัดการภาษีและบัญชีครบวงจร แต่ระยะหลังมีพฤติกรรมทำงานหลังเวลาเลิกงานลำพังค่อนข้างบ่อย และไม่ค่อยแชร์ไฟล์ดิบ Excel ให้ทีมงานคนอื่นตรวจสอบโดยอ้างว่าเพื่อรักษาความปลอดภัยระบบภายใน"
};
