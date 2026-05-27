/**
 * Utility functions for dynamic case generation based on Student ID
 */

export interface EmbezzlementBehavior {
  value: string;
  label: string;
  description: string;
}

export const EMBEZZLEMENT_BEHAVIORS: EmbezzlementBehavior[] = [
  { 
    value: "opt-1", 
    label: "A) ลอบโอนเงินเข้าบริษัทที่ปรึกษาปลอม (M.N. Accounting Solution) และแต่งสูตร SUM เลี่ยงบวกแถวที่ 12",
    description: "โอนเงินออกไปบัญชีส่วนตัว (022-2-21954-3) โดยแอบแต่งเลี่ยงสูตรบวกในตารางปั่นยอดสรุปตรงงบพอดี" 
  },
  { 
    value: "opt-2", 
    label: "B) สร้างระเบียบพนักงานผี (Ghost Employees) และแฝงป้อนเงินเดือนโอนเบิ้ลเข้าที่ปรึกษาหลบมุม",
    description: "ใช้สิทธิ์แอดมินแก้ไขข้อมูลใบเสร็จสอดไส้ยอดผ่านระบบ payroll เจ้าหน้าที่ที่ไม่ได้ทำงานจริง" 
  },
  { 
    value: "opt-3", 
    label: "C) เบิกสอยเบี้ยเลี้ยงค่าระบบงานเทคโนโลยีเครือข่ายอินเทอร์เน็ตซ้ำซ้อนสลับปลายทาง",
    description: "สร้างเอกสาร PV-2512 เทียมทำรายจ่ายคู่ค้าสลับชื่อระบบคาร์เปย์โฮสต์เทนเดอร์ไปที่ส่วนตัว" 
  },
  { 
    value: "opt-4", 
    label: "D) ดัดแปลงค่าใช้จ่ายส่วนต่างประกันภัยกองยานพาหนะไปพักพิงไว้ในบัญชีม้าภายนอก",
    description: "จ่ายเบี้ยขยายสัดส่วนประกันภัยเกินสัญญานอกงวดเพื่อนำส่งสลับรหัสไปพักผ่อนบัญชีนอมินี" 
  },
  { 
    value: "opt-5", 
    label: "E) ทำรายการจ่ายค่าเช่าสำนักงานเบิ้ลสองรอบโดยขัดแย้งกับหลักฐานใบจัดส่งสินเชื่อ",
    description: "ลงบันทึกใน Excel รายการซ้ำแต่ตัดยอดเดบิตออกจากบัญชีธนาคารเข้าสู่ชื่อบุคคลอื่นเพื่อฉ้อโกง" 
  },
  { 
    value: "opt-6", 
    label: "F) สอดไส้เบลอรายการค่าทำความสะอาดแม่บ้านสำนักงานให้ดูยอดใหญ่เทียมเกินปกติ",
    description: "บวกพิกัดแถวตารางให้ดึงเงินเกินเป้าและโยกส่วนต่างออกเข้าหาเบอร์รับส่วนตัว" 
  },
  { 
    value: "opt-7", 
    label: "G) แสร้งลงทะเบียนเบิกจ่ายงบบำรุงคลังสินค้าทิพย์เพื่อหลบเลี่ยงฝ่ายตรวจสอบบัญชี",
    description: "คีย์ยอดปลอมทุจริตในไฟล์เงินสดพร้อมเบี่ยงประเด็นให้เป็นข้อผิดพลาดจังหวะลิงก์ของระบบ" 
  },
  { 
    value: "opt-8", 
    label: "H) แปลงสัดส่วนเปอร์เซ็นต์ค่าซ่อมบำรุงเป็นช่องทางตัดโอนกำไรสะสมไปนอกองค์กร",
    description: "เปลี่ยนวิถีสูตรผลรวมสะสมย่อส่วนตัวเลขขาดเงินในตารางเทียบเคียงกับธนาคารกสิกร" 
  },
  { 
    value: "opt-9", 
    label: "I) ออกใบแจ้งหนี้ปลอมเป็นค่าธรรมเนียมจัดซื้อกองกระดาษสำนักงานแสนแพง",
    description: "ทำรายการโอนฉีกตรงเปรียบเทียบใบสเตทเม้นท์กับสมุดบัญชีเงินเดินระบบขัดแย้งอย่างแนบเนียน" 
  },
  { 
    value: "opt-10", 
    label: "J) กู้เงินสัญญาสมรองงบการจ่ายทำการตลาดออนไลน์ปลอมแปลงคู่ค้าแฝง",
    description: "สร้างสถานการณ์คีคลาดรายจ่ายโฆษณาโซเชียลตรงกันกับเลข payroll ส่วนบุคคลเพื่อยักยอกเงิน" 
  }
];

export interface DynamicCase {
  studentId: string;
  studentEmail: string;
  embezzledAmount: number;
  correctBehavior: EmbezzlementBehavior;
  correctCellKeyword: string; // e.g. "G12", "G13" etc.
  unlockedSmokingGuns: string[];
}

export function generateCaseFromId(studentId: string, studentEmail: string): DynamicCase {
  const cleanId = studentId.replace(/\D/g, "");
  // Default fallback if cleanId is not a valid 10-digit
  const idNum = cleanId.length >= 10 ? parseInt(cleanId.slice(-6)) : 123456;

  // Deterministically calculate embezzled amount (e.g., between 500,000 and 1,500,000)
  // Let's create an elegant odd-ended dynamic number such as 506,150
  const baseValue = 500000;
  const hundredThousands = (idNum % 7) * 100000;
  const tenThousands = (idNum % 9) * 10000;
  const thousands = (idNum % 8) * 1000;
  const hundreds = (idNum % 3) * 100 + 150; // Always ends with a recognizable pattern but unique sums
  const embezzledAmount = baseValue + hundredThousands + tenThousands + thousands + hundreds;

  // Choose behavior (out of 10) deterministically
  const bIndex = idNum % EMBEZZLEMENT_BEHAVIORS.length;
  const correctBehavior = EMBEZZLEMENT_BEHAVIORS[bIndex];

  // Choose dynamic cell coordinate (either G12, G13, or G14 depending on ID)
  const cellOptions = ["G12", "G13", "G14"];
  const correctCellKeyword = cellOptions[idNum % cellOptions.length];

  return {
    studentId,
    studentEmail,
    embezzledAmount,
    correctBehavior,
    correctCellKeyword,
    unlockedSmokingGuns: []
  };
}
