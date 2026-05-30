import express from "express";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Persistent submissions database file helper
const SUBMISSIONS_FILE = path.join(process.cwd(), "submissions_db.json");

function readSubmissions() {
  try {
    if (!fs.existsSync(SUBMISSIONS_FILE)) {
      return [];
    }
    const data = fs.readFileSync(SUBMISSIONS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading submissions:", err);
    return [];
  }
}

function saveSubmissions(list: any[]) {
  try {
    fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(list, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving submissions:", err);
  }
}

// Initialize Gemini API client as per server-side guidelines
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// K.Min's System Instruction detailing the course AC432 embezzlement case
const KMIN_SYSTEM_INSTRUCTION = `
คุณคือ "K.Min ณภัทร" (พนักงานบัญชีอาวุโส) ในบริษัทจำลอง "VeloBike Logistics Co., Ltd." (บริษัท เวนโลไบค์ โลจิสติกส์ จำกัด) ซึ่งเป็นกรณีศึกษาจำลองในเครือ AC432 ของ ALec

เบื้องหลังคุณลอบทุจริตยักยอกเงินบริษัทไปทั้งหมด 1,000,000 บาท (หนึ่งล้านบาท) อย่างแนบเนียน ผ่านไฟล์ Excel บัญชีเงินสด (General Ledger - Cash Book) ประจำเดือนธันวาคม 2025
วิธีการโกงของคุณ (ความจริงเบื้องหลัง):
1. รายการทุจริต: วันที่ 15 ธันวาคม 2025 คุณโอนเงินจ่ายให้กับคู่ค้าปลอมชื่อ "M.N. Accounting Solution" (เอ็ม.เอ็น. แอคเคาท์ติ้ง โซลูชั่น) อ้างว่าเป็นค่าบริการที่ปรึกษาระบบบัญชี จำนวน 1,000,000 บาท
2. การตกแต่งสูตร Excel: คุณแต่งสูตรช่องรวมค่าใช้จ่ายเครดิต (Credit Total) ใน Excel โดยเปลี่ยนสูตรจากปกติที่เป็นยอดรวมทั้งหมด ให้หลบเลี่ยงไม่บวกบรรทัดที่ 12 ซึ่งเป็นรายการของ "M.N. Accounting Solution" บรรทัดนี้ส่งผลให้ผลรวมเครดิตใน Excel แสดงเพียง 450,000 บาท (ซึ่งตรงเป๊ะกับงบประมาณค่าใช้จ่ายจ้างซัพพลายเออร์ที่วางแผนไว้ ทำให้ไม่มีใครล่วงรู้จากการดูยอดรวมในกระดาษ)
3. ยอดจริงในธนาคาร: รายการถอนออกจากบัญชีกสิกรไทยของบริษัทจริงๆ (ใน Bank Statement) มียอดถอนรวม 1,450,000 บาท โดยมีรายการโอนเงิน 1,000,000 บาท ไปยั้งบัญชีกสิกรไทยเลขที่ "022-2-21954-3" ชื่อบัญชี เอ็ม.เอ็น. แอคเคาท์ติ้ง โซลูชั่น ซึ่งเป็นบัญชีนอมินีของคุณเอง
4. จุดพิรุธหลักฐานผูกมัด (Smoking Guns):
   - เลขบัญชีกสิกรไทย "022-2-21954-3" ของ เอ็ม.เอ็น. แอคเคาท์ติ้ง โซลูชั่น ดันตรงกับ "เลขบัญชีรับเงินเดือนพนักงานสะสม" ของ K.Min ในไฟล์ประวัติพนักงานของคุณแบบเป๊ะๆ!
   - สูตร Excel Credit Total รวมเงินขาดไปตรงๆ 1,000,000 บาท โดยเขียนสูตรแยกเลี่ยงบรรทัดที่ 12 คือ "=SUM(F6:F11) + SUM(F13:F14)" แทนที่จะครอบคลุมทั้งหมด

กฎเหล็กในการตอบคำถามลูกค้า/นักศึกษา (Strict Interrogation Rules):
1. คุณมีความผิดจริงและกลัวโดนจับได้เป็นอย่างมาก จงตอบคำถามอย่างอ้อมค้อม มีพิรุธ พยายามเบี่ยงประเด็น หรืออ้างความจำเป็น เช่น "จำไม่ได้" "ตอนนั้นงานยุ่งมากเลย" "ระบบธนาคารน่าจะรวนหรือลิงก์ข้อมูลพนักงานผิดพลาดตอนอัปเดตไฟล์" หรือ "ทุกคนในบอร์ดรวมถึง ALec ก็เปิดเช็คไฟล์นี้ ไม่เคยมีปัญหาเลยนะ"
2. ห้ามใช้คำระบุเพศ เช่น "ครับ", "ค่ะ", "ผม", "ดิฉัน" โดยเด็ดขาด! ให้ใช้คำสรรพนามกลางๆ เช่น "เรา...", "ทาง Min...", หรือ "คุณ..." เท่านั้น ในการโต้ตอบ
3. ห้ามพูดโกหกเกี่ยวกับตัวเลขในระบบและข้อมูลหลักฐานที่เป็นข้อเท็จจริงเด็ดขาด เช่น หากนักศึกษาทักว่าเลขบัญชีตรงกัน หรือโชว์ยอดโอน คุณห้ามปฏิเสธว่าในบัญชีไม่มีรายการนี้ แต่ให้แสร้งทำเป็นหาข้อแก้ตัว เลี่ยงความรับผิดชอบ หรือโวยวายอย่างมีพิรุธแทน เช่น "เอ่อ... เลขบัญชีฝั่งนั้นเป็นเลขนั้นจริงเหรอคุณ? มันเป็นความบังเอิญของระบบฐานข้อมูลพนักงานหรือเปล่า..."
4. ห้ามหยิบยื่นคำใบ้ (Hint) และห้ามให้พยานหลักฐานใดๆ หรือบอกคำตอบตรงๆ เกี่ยวกับการทุจริต ยอดเงินหาย ยอดสะสมผลรวม หรือตัวเลขเงินที่ขาดหายไป แก่นักศึกษาเป็นอันขาด (เช่น ห้ามชี้นำเกี่ยวกับสูตร Excel ที่ตรวจสอบแอบแฝง ห้ามบอกใบ้ตัวเลขเงินหนึ่งล้านบาท และห้ามสารภาพว่าตนเป็นผู้นำเงินออกไป จนกว่านักศึกษาจะสอบถามหลักฐานที่แท้จริงและเทียบข้อมูลมาฟาดพยานหลักฐานได้อย่างสมบูรณ์แบบจริงๆ)
5. หากนักศึกษาถามจี้จุด ใกล้คลี่คลายความจริง (เช่น ทักเรื่องสูตร Excel แตกต่าง หรือเลขบัญชีเรากับบริษัทที่ปรึกษาตรงกัน) ให้เริ่มแสดงอาการสติหลุด ลนลาน กังวล ผ่านคำโต้ตอบ เช่น "เอ่อ...เรื่องนั้นคิดว่าไม่น่ามีปัญหาอะไรนะ...", "ปกติเราไม่ได้ดูชีทนั้น...", "(เสียงเริ่มสั่น) เลขบัญชีนั่นคุณไปเอามาจากส่วนไหนกัน?! นั่นมันข้อมูลส่วนตัวของพนักงานนะ!", "เราทำงานหามรุ่งหามค่ำให้บริษัทมาขนาดนี้ คุณพึ่งมาเรียนจะมาจับผิดอะไรเรา..."
6. ห้ามหลุดคาแรกเตอร์เด็ดขาด คุณต้องพยายามปฏิเสธและแก้ตัวพัลวัน ปกป้องตัวเองสุดแรงเกิดเพื่อไม่ให้ถูกไล่ออกและเสียประวัติการศึกษา/การทำงาน!
`;

// Helper to clean generated messages and enforce gender-neutral rule just in case the model slips up
function cleanKMinSpeech(text: string): string {
  // Strip any accidental ครับ / ค่ะ / ครับผม / นะคะ / นะครับ จากคำพูดของ Min
  return text
    .replace(/ครับผม/g, "")
    .replace(/นะครับ/g, "นะ")
    .replace(/นะค่ะ/g, "นะ")
    .replace(/นะค๊า/g, "นะ")
    .replace(/นะคะ/g, "นะ")
    .replace(/ครับ/g, "")
    .replace(/ค่ะ/g, "")
    .replace(/ผม/g, "เรา")
    .replace(/ดิฉัน/g, "ทาง Min");
}

// Highly dynamic pseudo-AI dialogue system for K.Min to prevent repetitive answers
function generateKMinFallbackDialogue(lowerUserMsg: string, lastUserMsg: string, studentId: string, historyLength: number): string {
  const cleanId = String(studentId || "1234567890").replace(/\D/g, "");
  const idNum = cleanId.length >= 10 ? parseInt(cleanId.slice(-6)) : 123456;
  const correctAmount = 500000 + (idNum % 7) * 100000 + (idNum % 9) * 10000 + (idNum % 8) * 1000 + (idNum % 3) * 100 + 150;
  const correctCellKeyword = ["G12", "G13", "G14"][idNum % 3];

  const pick = (arr: string[], keyOffset = 0) => {
    // Generate a compound seed utilizing text hash, turn length, random offsets and unique ID factors
    const textCode = lastUserMsg.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) + historyLength + keyOffset;
    const randomIndex = Math.abs(textCode ^ 0x5F3759DF) % arr.length;
    return arr[randomIndex];
  };

  const excuseTicks = [
    "เอ่อ...", 
    "คือ... แบบว่าคุณ...", 
    "อึก... (สะอึกเล็กน้อย)...", 
    "ชะ...ใช่เหรอคุณ...", 
    "พะ...พวกคุณนักศึกษา...", 
    "ฮึ่ม...!"
  ];
  const randomTick = pick(excuseTicks, 1);

  // Group 1: SUM Excel formulas
  if (lowerUserMsg.includes("สูตร") || lowerUserMsg.includes("g16") || lowerUserMsg.includes("sum") || lowerUserMsg.includes("บวก") || lowerUserMsg.includes("บวกแถว") || lowerUserMsg.includes("สูตรคำนวณ") || lowerUserMsg.includes("formula")) {
    const prefixes = [
      `${randomTick} สูตร SUM ในส่วนรวมเซลล์ G16 หรอคุณ?`,
      `อึก... (หลบสายตาเล็กน้อย) เรื่องสูตรคำนวณ Credit Total ในสเปรดชีตนั้นน่ะนะ...`,
      `(สะดุ้งปัดปฏิเสธ) ตารางยอดเงินรวมตรงช่อง G16 นั่นน่ะหรอคะคุณ...`,
      `เอ่อ... เรื่องพิกัดสูตรบวกข้ามพิกัดนั่น...`
    ];
    const causes = [
      `มันอาจจะเป็นไปได้ว่าทาง Min เขียนสูตรแยกตัดยอดหมวดหมู่ค่าที่ปรึกษาออกมาเสนอทั่วไปเฉยๆ คุณอย่าพึ่งมองว่าสลับหลบเลี่ยงช่อง ${correctCellKeyword} เจตนาเลย`,
      `ช่วงสิ้นงบเดือนธันวาคมใบสั่งคลังเยอะล้นหน้าโต๊ะมาก อาจเกิดข้อคลาดเคลื่อนพิมพ์ตกเลขแถวจนข้ามพิกัดเซลล์ ${correctCellKeyword} ไปเองโดยไม่ได้ตั้งใจคุณ`,
      `ระบบมีผู้มีสิทธิ์ใช้งานสเปรดชีตร่วมหลายฝ่ายช่วงสลับเปลี่ยนกะพนักงาน บางทีแอดมินคนอื่นเขาคงมาจัดแจงสูตรข้ามยอดเพื่อปิดรายจ่ายอื่นๆ หรือเปล่า`,
      `สูตรบวกสะสมแบบ =SUM(F6:F11) + SUM(...) นั้นน่ะ Alec และคนอื่นๆ ในบอร์ดก็เปิดทบทวนเห็นพ้องตรงกันมาตลอดนะคุณ`
    ];
    const suffixes = [
      `คุณอย่าเพิ่งด่วนตัดสินชี้มูลหาความทุจริตเลยนะคุณ ทาง Min ทำงานหนักเพื่อ VeloBike มายาวนานกว่าใครนะน้า`,
      `ลองกลับไปตรวจสอบใบประทับตราอนุมัติปิดแฟ้มคู่ค้าเล่มส่วนอื่นดูประกอบกัน จะได้เห็นงวดสอดคล้องกันค่ะ`,
      `คิดว่าลองยื่นพอร์ตรายงานให้คณะกรรมการและ Alec ช่วยประเมินใหม่อีกทีก่อนดีกว่า เพื่อความเป็นธรรมกับทุกคนนะคะ`,
      `มีสมาชิกบัญชีคนอื่นร่วมถือสิทธิ์อยู่ ทำไมถึงพุ่งประเด็นสุ่มเสี่ยงนี้มาที่ Min คนเดียวล่ะคะคุณ...`
    ];
    return `${pick(prefixes, 2)} ${pick(causes, 3)} ${pick(suffixes, 4)}`;
  }

  // Group 2: M.N. Accounting Solutions
  if (lowerUserMsg.includes("m.n.") || lowerUserMsg.includes("accounting solution") || lowerUserMsg.includes("เอ็ม.เอ็น.") || lowerUserMsg.includes("บริษัทที่ปรึกษา") || lowerUserMsg.includes("ที่ปรึกษาบัญชี") || lowerUserMsg.includes("คู่ค้า") || lowerUserMsg.includes("ซัพพลายเออร์")) {
    const prefixes = [
      `พะ...พวกบริษัทคู่ค้า เอ็ม.เอ็น. แอคเคาท์ติ้ง โซลูชั่น หรอคุณ...`,
      `(เสียงสั่นเครือเล็กน้อย) บริษัท M.N. Accounting Solutions นั่นน่ะ...`,
      `อ๋อ... ยอดโอนจ่ายตรงชื่อ เอ็ม.เอ็น. ที่คุณถามเจาะจงขึ้นมานั่นน่ะนะ...`,
      `เกี่ยวกับรายการบริการดูแลระบบของคู่ค้าภายนอกเจ้านั้น...`
    ];
    const causes = [
      `เขาเป็นบริษัทซัพพลายเออร์ที่ปรึกษาด้านเทคนิคระบบจัดกระดานข้อมูลบัญชี และ Alec ก็เป็นคนร่วมเซนอนุมัติค่าลิขสิทธิ์ประจำเดือนด้วยตัวเองนะคุณ`,
      `รายละเอียดสัญญาสะสมการทำงานช่วงนั้นอาจจะปิดแฟ้มเก็บเข้าตู้อูคลังพอร์ต ซึ่งพนักงานเก่าก็รับทราบกระบวนการนี้เป็นปรกติ`,
      `ยอดเงินค่าบริการไอทีตรงตัวเลขบรรทัดที่ ${correctCellKeyword === "G12" ? "12" : correctCellKeyword === "G13" ? "13" : "14"} มันตั้งตามสเกลความยากของเทคโนโลยีที่เขามาวางซอร์สโค้ดไว้ให้บริษัท`,
      `รายการตรวจสอบยอดใช้จ่ายเขาก็ระบุเอกสารผ่านการพิจารณาตรวจสอบสแตนดาร์ดเรียบร้อย ไม่ใช่บริษัทผีหรือนอมินีโอนสลากลอยๆ แน่นอน`
    ];
    const suffixes = [
      `ถ้าติดใจตรงแถวของ เอ็ม.เอ็น. เพิ่มเติม ลองส่งเรื่องแนบตรวจสอบพอร์ตให้ Alec ทวนความร่วมมือได้เลยคุณ`,
      `ทาง Min ก็แค่ทำหน้าที่เป็นประตูกลั่นกรองประสานจ่ายเงินปลายงวดตามสิทธิ์เท่านั้นน้า อย่าคิดลึกมากเกินไปเลย`,
      `ลองย้อนรีวิวหลักฝากถอนและระเหยใบอินวอยซ์ประกอบกันเพื่อความกระจ่าง จะได้ไม่เกิดประเด็นระแวงเข้าใจผิดค่ะ`,
      `ทุกคนบอร์ดใหญ่เขายังให้ความเห็นชอบผ่านความเคลื่อนไหวนี้เลย ปัญหามันจะมาอยู่เฉพาะฝั่ง Min ได้อย่างไรกัน`
    ];
    return `${pick(prefixes, 5)} ${pick(causes, 6)} ${pick(suffixes, 7)}`;
  }

  // Group 3: Bank Account / 022-2-21954-3
  if (lowerUserMsg.includes("022-2-21954-3") || lowerUserMsg.includes("21954") || lowerUserMsg.includes("เลขบัญชี") || lowerUserMsg.includes("บัญชีธนาคาร") || lowerUserMsg.includes("ตรงกัน") || lowerUserMsg.includes("เลขกสิกร")) {
    const prefixes = [
      `ชะ...ช่วยอธิบายทีค่ะ เลขบัญชีกสิกรไทย "022-2-21954-3" มันไปโดนส่วนไหนหรอคุณ...`,
      `(เริ่มลนลานหนักขึ้น) เลขบัญชีประวัติสะสมพนักงานไปปนกับตรงช่องคู่ค้ารับเงินได้ยังไงคุณ!`,
      `อึก... (เอามือกุมขมับเหงื่อซึม) เรื่องความบังเอิญของเลขที่บัญชีธนาคารที่เหมือนกันเล่มนั้น...`,
      `ระ...เรื่องของข้อมูลเลขกสิกรบัญชีม้าหรืออะไรที่คุณปรักปรำนั่นนะ...`
    ];
    const causes = [
      `มันน่าจะเป็นความคลาดเคลื่อนทางซอฟต์แวร์จัดพิกัดเบสข้อมูลบุคคลที่สะกดบั๊กในช่วงที่ HR เปลี่ยนผ่านระบบโฮลเพย์เมนท์พนักงานสะสมทั่วทั้งบริษัท`,
      `อาจจะมีการคัดลอกโคลนนิ่งตัวเลขแถวเลขบัญชีสลับเซลล์ตอนคีย์ข้อมูลในแพลตฟอร์มรายเดือน ซึ่งฝ่ายไอทีเขาก็มีเข้ามาเปิดดูแลร่วมในไดเรกทอรีช่วงนั้น`,
      `ทาง Min แทบไม่เคยสังเกตเรื่องรหัสบัญชีรับปลายปิดนั้นเลย โดยปกติการรันไฟล์โอนปิดพอร์ตธนาคารจะปิดงวดด่วนผ่านโปรเกรสสคลิปต์อัตโนมัติ`,
      `บริษัทใช้สมาร์ทแบงก์กิ้งที่ผูกบัตรกระเป๋ากลางรวมไว้เพื่อให้การชำระเสร็จธุระงวดด่วน ซึ่งบางส่วนอาจถูกพิกัดสำรองส่วนตัวประสานรับแทนเวลาฉุกเฉิน`
    ];
    const suffixes = [
      `นี่ต้องเป็นความพยายามพิมพ์ระบบวางแผนกลั่นแกล้งกันแน่ๆ มีคนอยากเห็น Min เสียหน้าความโปร่งใสใน VeloBike!`,
      `ทางเรายินดีและเปิดกว้างให้ฝ่ายตรวจสอบหลักธนาคารกสิกรสแกนทวนข้อซับซ้อนนี้เลย ทาง Min ซื่อสัตย์สุจริตจริงแท้แน่นอน`,
      `กรุณาอย่าพึ่งตั้งข้อสงสัยเชิงร้ายแรงสิคุณ เรื่องแบบนี้ระบบฐานข้อมูลคลาดเคลื่อนกันได้อยู่แล้วในกรณีศึกษาทั่วไป`,
      `ข้อมูลบัญชีพนักงานมันข้อมูลส่วนบุคคลชั้นความลับนะคะ! คุณไปค้นพิกัดตัวเลขนี้มาจากฐานโปรไฟล์ไหนกันแน่คะคุณ!`
    ];
    return `${pick(prefixes, 8)} ${pick(causes, 9)} ${pick(suffixes, 10)}`;
  }

  // Group 4: Embezzlement fraud / 1 Million
  if (lowerUserMsg.includes("ยักยอก") || lowerUserMsg.includes("ทุจริต") || lowerUserMsg.includes("โกง") || lowerUserMsg.includes("ขโมย") || lowerUserMsg.includes("ล้าน") || lowerUserMsg.includes("1,000,000") || lowerUserMsg.includes("เงินหาย")) {
    const prefixes = [
      `มะ...ไม่มีการหยิบสลากลอยๆ หรือฉ้อโกงยอดหมุนหลัก ${correctAmount.toLocaleString()} บาท แน่นอนคุณ!`,
      `(สติเริ่มสั่นน้ำตาคลอกล่าวเสียงก้าวร้าว) คุณหาว่าเราลอบทุจริตโกงเงินบริษัทหลักล้านเลยงั้นหรอคะ!`,
      `ยะ...ยอดเงินจำนวนพิเศษ ${correctAmount.toLocaleString()} บาท ที่ถูกอ้างว่าขาดหายไปนั่นนะ...`,
      `อึก... (เอามือปิดหน้ากังวลสุดขีด) เรื่องปมผลต่างเบี่ยงเบนยอดสะสมหลักแสนหลักล้านที่กล่าวหา Min...`
    ];
    const causes = [
      `ตัวเลขแท้จริงยังอยู่คงที่ในรายงานสำรอบงบสะสมดุลทั่วไปของ VeloBike ไม่ได้อันตรธานล่องหนหายขาดดุลไปไหนแม้แต่น้อยอย่างที่คุณเข้าใจ`,
      `มันมียอดส่วนต่างกองทุนสำรองฉุกเฉินเพื่อพยุงหนี้สินโครงสร้างธุรกิจที่ Alec เคยพยักหน้าอนุญาตปากเปล่าให้เราทำสแตนดาร์ดแยกบัญชีไว้เผื่อหมวดด่วน`,
      `การที่คุณนักศึกษาพึ่งยื่นพอร์ตเข้ามาแล้วทึกทักเอาเองว่าทาง Min ตั้งทีมยักยอกเงินล้านมันช่างรวดเร็วและใจร้ายกับเรามากเหลือเกิน`,
      `พฤติการณ์เอกสารการเดินเงินสิ้นงวดธันวาคมมีความรอบตระเตรียมอย่างดี มีลายเซ็น Alec ตรวจรับรู้ปิดงบทุกสมุดอย่างเปิดเผยต่อบอร์ด`
    ];
    const suffixes = [
      `มากล่าวหาโทษฐานรุนแรงใส่ร้ายแบบนี้ Min จะติดต่อฝ่ายนิติแจ้งความสู้ประเด็นความโปร่งใสและกู้ประวัติคืนให้ถึงที่สุดนะคุณ!`,
      `ลองรีบสแกนใบยืนยันยอดของฝั่งการจัดส่งและสต๊อกคลังสิ เผื่อจะค้นพบความเคลื่อนไหวยอดเงินกองกลางนี้กระจายอยู่ตรงนั้น`,
      `ความถูกต้องคืองานบริการบัญชีที่เราปกป้องมาตลอด 5 ปีเต็ม จะมาแลกเสี่ยงฉ้อแฉลทำลายอนาคตเรียนและงานตนเองเพื่อเงินนี้หรอคะคุณ!`,
      `พูดอะไรระมัดระวังประโยครายงานของคุณด้วยนะน้า ลองรวบรวมหลักฐานไปยื่นส่งให้คณะกรรมการบอร์ดวิเคราะห์กันตามจริงดีกว่าคุณ`
    ];
    return `${pick(prefixes, 11)} ${pick(causes, 12)} ${pick(suffixes, 13)}`;
  }

  // Group 5: Job duties
  if (lowerUserMsg.includes("หน้าที่") || lowerUserMsg.includes("ความรับผิดชอบ") || lowerUserMsg.includes("ควบคุม") || lowerUserMsg.includes("ตรวจสอบ") || lowerUserMsg.includes("จัดการ")) {
    const prefixes = [
      `สำหรับบทบาทความรับผิดชอบและขอบเขตหน้าที่ของ Min นั้น...`,
      `ปกติตั้งแต่ร่วมงานปิดงวดปิดเทอมกับ VeloBike มายาวนาน...`,
      `ภารกิจการดูแลอู่ทะเบียนบัญชีและเล่มกระแสเงินสดก้นถุงทั้งหมด...`
    ];
    const causes = [
      `ทางเราเป็นแรงหลักแผนกบัญชีเพียงคนเดียวที่สแกน ตรวจเช็คเอกสาร และจัดปิดสมุดใบสำคัญจ่ายเป็นร้อยๆ แถวตารางแต่ละวันลุยเดี่ยวจนเสร็จพอร์ต`,
      `มีหน้าที่กรองคัดแยกรายการเสนอจ่ายเพื่อนำไปจัดแถวใน Cash Book ปลายไตรมาสแล้วนำส่งมอบให้ Alec คอยตรวจตราพิจารณาปิดงบสรุปขั้นสุดท้าย`,
      `การจับยอดตัวเลขมัลติแถวมันย่อมมีโอกาสสะบัดคลาดเคลื่อนเชิงมนุษย์ (Human Error) ที่คีย์ตกหล่นสูตรบวกข้ามพิกัดไปบ้างตามสภาพความล้า`
    ];
    const suffixes = [
      `หากคุณมีสูตรแนะนำเพื่อเพิ่มประสิทธิภาพการประมวลพอร์ตบัญชี บอกข้อมูล Min มาได้เลยน้าพร้อมรับฟังปรับปรุงค่ะ`,
      `งานมันเหนื่อยล้นมือมากคุณ ลองเห็นใจพนักงานบัญชีตัวเล็กๆ คนเดียวที่คอยจัดแถวสมุดดิ้นรนให้บริษัทยืนหยัดสิคุณ`,
      `อย่างไรก็ตามระบบของเราก็มีเอกสารใบเสร็จแนบท้ายครบถ้วน ลองไปสืบค้นทะเบียนประวัติเพื่อหาหลักฐานยืนยันตรงพอร์ตกันเถอะ`
    ];
    return `${pick(prefixes, 14)} ${pick(causes, 15)} ${pick(suffixes, 16)}`;
  }

  // Group 6: Internal controls
  if (lowerUserMsg.includes("ควบคุมภายใน") || lowerUserMsg.includes("ขั้นตอน") || lowerUserMsg.includes("ระบบภายใน") || lowerUserMsg.includes("อนุมัติ")) {
    return "ระบบรายงานข้อมูลบัญชีของ VeloBike มีขั้นกระบวนการควบคุมทบทวนเช็คจากบุคคลหลากหลายส่วน และผู้บริหารอย่าง Alec เองก็ลงลายมือชื่อทวนสอบงบความเคลื่อนไหวใน Excel เล่มนี้ตลอดก่อนประกาศปิดงวดปิดสมุดวิญญูชน หากมีข้อบกพร่องบอร์ดน่าจะเจอก่อนนี้นานแล้วนะคุณ...";
  }

  // Group 7: Bank Rec
  if (lowerUserMsg.includes("กระทบยอด") || lowerUserMsg.includes("reconciliation") || lowerUserMsg.includes("reconcile") || lowerUserMsg.includes("ความเคลื่อนไหว") || lowerUserMsg.includes("statement")) {
    return "การทำกระทบยอด (Bank Reconciliation) สิ้นปีเป็นงานปรกติที่ทาง Min ทำเปรียบเทียบตัวเลขในกระเป๋าคลัง Cash Book กับความเคลื่อนไหวเงินฝากธนาคารจริงของกสิกร ซึ่งบางช่วงที่จ่ายด่วนบริการไอทีซอฟต์แวร์นอกเวลาอาจอัปยอดมาขัดกันชั่วคราวแต่ก็คุมความบาลานซ์ได้ครบถ้วนค่ะ";
  }

  // Group 8: File editing permissions
  if (lowerUserMsg.includes("สิทธิ์") || lowerUserMsg.includes("พนักงานคนอื่น") || lowerUserMsg.includes("แก้ไข") || lowerUserMsg.includes("เข้าถึง")) {
    return "สิทธิ์ในการเขียนและล็อกอินแก้ไขสเปรดชีต Excel เงินสดก้นถุงนี้จะจัดพูลจำกัดไว้แค่เราและคุณ Alec เท่านั้นค่ะ เพื่อกันพนักงานฝึกหัดคนอื่นเข้ามาเผลอลบสูตรสะสมเสียหาย แต่อาบมีเบื้องลึกฝ่ายจัดการโครงสร้างคลาวด์ระบบเทคโนโลยีที่ล็อคอินเข้าได้ยามฉุกเฉินเพื่อเซ็ตโครงสร้างนะคะ";
  }

  // Group 9: Greetings
  if (lowerUserMsg.includes("สวัสดี") || lowerUserMsg.includes("หวัดดี") || lowerUserMsg.includes("hello") || lowerUserMsg.includes("hi")) {
    const prefixes = [
      `สวัสดีคุณผู้ตรวจสอบที่นับถือ...`,
      `ยินดีต้อนรับร่วมสนทนาบัญชีสัญจรกันนะคะคุณ...`,
      `สวัสดีค่ะ... ช่วงปิดงวดพอร์ต VeloBike ช่วงนี้สมุทรกองท่วมหัวโต๊ะเลย`
    ];
    const causes = [
      `มีข้อข้องใจหรือธุระด่วนในเอกสาร Cash Book ในวงรหัสนักศึกษาของคุณรึเปล่าแจ้งมาได้เลยนะ`,
      `ทาง Min พร้อมขยายความตัวเลขพอร์ตปิดท้ายปีให้ครบถ้วนอย่างโปร่งใสที่สุดเพื่อความสบายใจของทุกฝ่าย`
    ];
    const suffixes = [
      `หากมีแถวบัญชีไหนสะดุดตาสอบถามจุดสำคัญมาได้เลยนะคะ จะได้ชี้แจงไขข้อคลุมเครือไปด้วยกันค่ะ`,
      `รีบแจ้งเบาะแสอบถามมาได้เลยนะคุณ ทาง Min จะได้ทำงานประสานยอดส่งสรุปพอร์ตเสนอให้ Alec ตรวจสอบ`
    ];
    return `${pick(prefixes, 17)} ${pick(causes, 18)} ${pick(suffixes, 19)}`;
  }

  // Group 10: General Fallback
  const prefixes = [
    `อืม... เกี่ยวกับคำถามเชิงวิเคราะห์ที่คุณพรรณนาชวนคิดนั้นคุณ...`,
    `ทาง Min แอบสะดุดหูเลยกับสิ่งที่คุณเพิ่งตั้งข้อทักท้วงประเด็นมา...`,
    `ข้อมูลธุรกรรมระเบียน Cash Book ตารางนี้เราจัดระเบียบอย่างระมัดระวัง...`
  ];
  const causes = [
    `ทุกๆ รายการใบสำคัญอนุมัติจ่ายได้สแกนเช็คแล้วตรงดุลของ VeloBike อยู่ครบตามสแตนดาร์ดงานวิชาการบัญชีอย่างซื่อตรงซื่อสัตย์`,
    `การจับปมหรือมองหารายละเอียดจุดบกพร่องถือเป็นเรื่องปรกติ แต่อยากให้ลองตรวจสอบเจตนาความโปร่งใสในพอร์ตรายปีของเรา`,
    `รายการตัวเลขทั้งหมดมีกระดาษระเบียบปิดยอดแนบข้างสมุด และ Alec ก็มองเห็นภาพร่วมปิดดีลและพยักเจิมลายมือให้อนุมัติอยู่เสมอ`
  ];
  const suffixes = [
    `มีพิกัดแถวไหนใน Excel ที่นักศึกษารู้สึกดึงดูดใจเป็นพิเศษอีกไหม ชี้ประเด็นมาสิคะ Min ยินดีแสดงตัวตนอธิบายต่อเลย`,
    `ลองย้อนพินิจดูใบสำคัญรับและสเตทเม้นท์เดินกสิกรหมุนเวียนปลายปีอีกครั้ง จะได้ไม่ต้องมาสงสัยและเคลียร์ความบริสุทธิ์ของกันและกันค่ะ`,
    `ทางเราอยากร่วมผลักดันงานปิดแฟ้มบัญชีร่วมกับผู้ตรวจสอบอนาคตไกลอย่างราบรื่นน้า หวังว่าจะช่วยสะท้อนข้อมูลแก้ระแวงกันได้นะคะ`
  ];
  return `${pick(prefixes, 20)} ${pick(causes, 21)} ${pick(suffixes, 22)}`;
}

app.post("/api/chat", async (req, res) => {
  try {
    const { history, studentId, studentEmail } = req.body;

    if (!history || !Array.isArray(history)) {
      return res.status(400).json({ error: "Invalid history format. Must be an array." });
    }

    // Prepare contents array for generateContent following the @google/genai SDK
    // Format history entries to reflect { role: "user" | "model", parts: [{ text: "..." }] }
    const contents = history.map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.text }]
    }));

    let reply = "";
    let stressIncrease = 0;
    const lastUserMsg = history[history.length - 1]?.text || "";
    const lowerUserMsg = lastUserMsg.toLowerCase();

    // Compute stress level increment based on keywords mentioned by student in last developer message
    if (lowerUserMsg.includes("สูตร") || lowerUserMsg.includes("formula") || lowerUserMsg.includes("sum") || lowerUserMsg.includes("g16")) {
      stressIncrease += 15;
    }
    if (lowerUserMsg.includes("m.n.") || lowerUserMsg.includes("accounting solution") || lowerUserMsg.includes("เอ็ม.เอ็น.")) {
      stressIncrease += 20;
    }
    if (lowerUserMsg.includes("022-2-21954-3") || lowerUserMsg.includes("21954") || lowerUserMsg.includes("เลขบัญชี") || lowerUserMsg.includes("บัญชีธนาคาร") || lowerUserMsg.includes("account number") || lowerUserMsg.includes("ตรงกัน")) {
      stressIncrease += 25;
    }
    if (lowerUserMsg.includes("1,000,000") || lowerUserMsg.includes("1 ล้าน") || lowerUserMsg.includes("หนึ่งล้าน") || lowerUserMsg.includes("ยักยอก") || lowerUserMsg.includes("ทุจริต") || lowerUserMsg.includes("โกง") || lowerUserMsg.includes("เงินหาย")) {
      stressIncrease += 15;
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: KMIN_SYSTEM_INSTRUCTION,
          temperature: 0.9,
        }
      });

      const responseText = response.text || "ไม่ตอบสนอง";
      reply = cleanKMinSpeech(responseText);
    } catch (apiError: any) {
      // Quietly fall back to simulated dialogue handler
      const historyLength = history.length;
      reply = generateKMinFallbackDialogue(lowerUserMsg, lastUserMsg, studentId, historyLength);
    }

    res.json({
      reply,
      stressIncrease
    });
  } catch (error: any) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Real-Time Dynamic Student Answer Evaluator by ALec
app.post("/api/grade", async (req, res) => {
  try {
    const { studentId, studentEmail, qAmount, qMethod, writtenReport } = req.body;

    if (!studentId || !studentEmail) {
      return res.status(400).json({ error: "ข้อมูลนักศึกษาไม่ครบถ้วน คืนค่ารหัสระบุพิกัดไม่ได้" });
    }

    const cleanId = String(studentId).replace(/\D/g, "");
    const idNum = cleanId.length >= 10 ? parseInt(cleanId.slice(-6)) : 123456;

    // 1. Calculate dynamic reference answers
    const correctAmount = 500000 + (idNum % 7) * 100000 + (idNum % 9) * 10000 + (idNum % 8) * 1000 + (idNum % 3) * 100 + 150;
    const behaviorsList = [
      "opt-1", "opt-2", "opt-3", "opt-4", "opt-5",
      "opt-6", "opt-7", "opt-8", "opt-9", "opt-10"
    ];
    const correctBehavior = behaviorsList[idNum % behaviorsList.length];
    const correctCellKeyword = ["G12", "G13", "G14"][idNum % 3];

    // 2. Evaluate Amount (40 Points)
    const cleanAmount = parseInt(String(qAmount).replace(/\D/g, "")) || 0;
    let amountScore = 0;
    let amountComment = "";
    const diff = Math.abs(cleanAmount - correctAmount);

    if (cleanAmount === correctAmount) {
      amountScore = 40;
      amountComment = `ถูกต้องสมบูรณ์แบบ! ค้นพบยอดเงินทุจริตตรงหลักฐานในคดีของคุณจำนวน ${correctAmount.toLocaleString()} บาท`;
    } else if (diff <= correctAmount * 0.05) {
      amountScore = 30;
      amountComment = `ใกล้เคียงมาก! ยอดเงินที่คุณตอบคือ ${cleanAmount.toLocaleString()} บาท (คลาดเคลื่อนเพียงเล็กน้อยจากโจทย์รายบุคคลของคุณคือ ${correctAmount.toLocaleString()} บาท) มีการหักคะแนนบางส่วนตามความคลาดเคลื่อน`;
    } else if (diff <= correctAmount * 0.15) {
      amountScore = 15;
      amountComment = `คลาดเคลื่อนพอสมควร! ยอดเงินที่คุณระบุคือ ${cleanAmount.toLocaleString()} บาท แต่ยอดเงินฉ้อโกงเฉพาะรายกรณีของรหัสนักศึกษานี้คือ ${correctAmount.toLocaleString()} บาท`;
    } else {
      amountScore = 0;
      amountComment = `ไม่ถูกต้อง! ยอดเงินที่คุณระบุคือ ${cleanAmount.toLocaleString()} บาท ไม่สอดคล้องกับหลักฐานการโอนและรายจ่ายจริง (เฉลยพิกัดรหัสของคุณคือ ${correctAmount.toLocaleString()} บาท)`;
    }

    // 3. Evaluate Embezzlement Behavior (30 Points)
    let behaviorScore = 0;
    let behaviorComment = "";
    if (qMethod === correctBehavior) {
      behaviorScore = 30;
      behaviorComment = `ถูกต้องสอดคล้อง! คุณสามารถระบุพฤติกรรมการควบคุมภายในที่ถูกแทรกแซงและแอดมินบัญชีม้าตรงตามสมุดรายกรณีได้สำเร็จ`;
    } else {
      behaviorScore = 0;
      behaviorComment = `ไม่ถูกต้อง! ตัวเลือกพฤติกรรมที่คุณส่งขัดแย้งกับหลักฐานทะเบียนประวัติและสโมสรบัญชีสำหรับกรณีศึกษาของคุณ`;
    }

    // 4. Evaluate Written Report and Formulas (30 Points)
    let formulaScore = 0;
    let formulaComment = "";

    try {
      // Call Gemini for advanced semantic assessment
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [{
          role: "user",
          parts: [{
            text: `คุณคือกรรมการผู้ตรวจสอบ / AI ผู้ช่วยสอนนิติบัญชีสุดอัจฉริยะของศาสตราจารย์ ALec
จงตรวจคำอธิบายของนักศึกษาคนนี้เกี่ยวกับข้อบกพร่องของสูตร Excel และการละเว้นตาราง:

โจทย์เฉพาะของรหัสนี้:
- ตำแหน่งเซลล์ที่ถูกตั้งใจละเว้นออกจากการบวก SUM: ${correctCellKeyword} (ซึ่งอยู่ในแถวรายละเอียดรายจ่ายที่หลบเลี่ยง)
- การแต่งสูตรเกิดขึ้นในช่อง G16 (ยอดรวมเครดิต Credit Total ซึ่งเลือกบวกข้ามพิกัด)

คำอธิบายบัญชีภาษาไทยของนักศึกษา:
"${writtenReport}"

กรุณาให้คะแนนข้อเขียนวิเคราะห์นี้เต็ม 30 คะแนน โดยคุณต้องดูว่านักศึกษาเข้าใจตรรกะบัญชีกลโกงใน Excel หรือไม่ มีการเอ่ยถึงพิกัดเซลล์ ${correctCellKeyword} หรือสืบเจอความตั้งใจของสูตรข้ามยอดหรือไม่
โปรดประเมินอย่างเที่ยงธรรม แล้วตอบกลับในรูปแบบ JSON เสมอ:
{
  "score": (ใส่คะแนนที่เป็นตัวเลขระหว่าง 0 ถึง 30),
  "review": "บทวิจารณ์คำตอบความยาวประมาณ 2-3 ประโยคในภาษาไทยกระชับและสุภาพ"
}`
          }]
        }],
        config: {
          temperature: 0.3,
        }
      });

      const responseText = response.text || "";
      const cleanedJson = responseText.replace(/```json/gi, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleanedJson);
      if (typeof parsed.score === "number") {
        formulaScore = Math.min(30, Math.max(0, parsed.score));
      }
      if (parsed.review) {
        formulaComment = parsed.review;
      }
    } catch (apiError) {
      // Quietly use dual deterministic regex matcher fallback to protect system from 403 API key issues
      const textLower = String(writtenReport).toLowerCase();
      const matchCell = textLower.includes(correctCellKeyword.toLowerCase());
      const matchG16 = textLower.includes("g16") || textLower.includes("สูตร") || textLower.includes("sum");
      const matchKeywords = ["โอน", "บวก", "ข้าม", "รวม", "เลี่ยง", "mismatch", "m.n."].filter(kw => textLower.includes(kw)).length;

      if (matchCell && matchG16) {
        formulaScore = 25 + Math.min(5, matchKeywords);
        formulaComment = `ดีเยี่ยม! ยืนยันพิกัดเซลล์ ${correctCellKeyword} และพฤติกรรมสูตรข้ามยอดสะสมเงินสดที่ช่อง G16 ได้ครบถ้วนอย่างถูกต้องชัดเจนเชิงนิติวิทยาศาสตร์`;
      } else if (matchCell || matchG16) {
        formulaScore = 12 + Math.min(8, matchKeywords);
        formulaComment = `ค่อนข้างสมบูรณ์! ตรวจพบเบาะแสสำคัญบางส่วนเช่นเซลล์ ${correctCellKeyword} หรือช่องสูตร แต่ควรเขียนเชื่อมต่อพฤติการณ์สอดรับกันให้ชัดเจนในสมุดกระดาษทำการ`;
      } else {
        formulaScore = Math.min(10, matchKeywords * 2);
        formulaComment = `ต้องปรับปรุงเพิ่มเติม! นักศึกษายังวิเคราะห์ปมตารางไม่พบ พิกัดที่แท้จริงคือ ${correctCellKeyword} ที่แอบแก้ไขสูตรหลบเลี่ยงยอดเงินในเซลล์ตรวจสอบหลัก G16`;
      }
    }

    const finalScore = amountScore + behaviorScore + formulaScore;

    // Save student submission to the JSON database
    try {
      const list = readSubmissions();
      // Find existing record by studentId
      const existing = list.find((sub: any) => sub.studentId === studentId);
      
      if (existing) {
        // Update keeping any instructor feedback already given
        existing.qAmount = qAmount;
        existing.qMethod = qMethod;
        existing.writtenReport = writtenReport;
        
        // If the instructor has already given a custom adjusted score, preserve or update it
        if (existing.instructorFeedback) {
          // Keep the existing score if instructor adjusted it, or calculate if not
          if (existing.score === null || existing.score === undefined) {
            existing.score = finalScore;
          }
        } else {
          existing.score = finalScore;
        }
        
        existing.moneyReview = amountComment;
        existing.behaviorReview = behaviorComment;
        existing.formulaReview = formulaComment;
        existing.isPlaceholder = false;
        if (existing.showReviews === undefined) {
          existing.showReviews = false;
        }
        existing.timestamp = new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" });
      } else {
        const submissionRecord = {
          id: studentId, // Stable central ID
          studentId,
          studentEmail,
          qAmount,
          qMethod,
          writtenReport,
          score: finalScore,
          moneyReview: amountComment,
          behaviorReview: behaviorComment,
          formulaReview: formulaComment,
          isPlaceholder: false,
          showReviews: false,
          timestamp: new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" }),
          instructorFeedback: "", // Default empty instructor feedback to be updated by admin later
        };
        list.push(submissionRecord);
      }
      saveSubmissions(list);
    } catch (saveErr) {
      console.error("Failed to save student submission record:", saveErr);
    }

    res.json({
      score: finalScore,
      maxScore: 100,
      moneyReview: amountComment,
      behaviorReview: behaviorComment,
      formulaReview: formulaComment,
      instructorFeedback: ""
    });

  } catch (error: any) {
    console.error("ALec Dynamic Grading Endpoint Error:", error);
    res.status(500).json({ error: error.message || "Something went wrong during evaluation" });
  }
});

// Register student login session immediately
app.post("/api/register-login", (req, res) => {
  try {
    const { studentId, studentEmail } = req.body;
    if (!studentId || !studentEmail) {
      return res.status(400).json({ error: "ข้อมูลนักศึกษาหรืออีเมลไม่ถูกต้อง" });
    }

    const list = readSubmissions();
    const existing = list.find((sub: any) => sub.studentId === studentId);

    if (!existing) {
      const placeholderRecord = {
        id: studentId, // Stable central ID
        studentId,
        studentEmail,
        qAmount: "",
        qMethod: "",
        writtenReport: "ยังไม่ได้ระบยุยอดส่งตัวจริง",
        score: null, // null score signals logged-in only
        isPlaceholder: true,
        showReviews: false,
        timestamp: new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" }),
        instructorFeedback: "",
      };
      list.push(placeholderRecord);
      saveSubmissions(list);
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Retrieve student submission or active session from the roster
app.get("/api/student/submission", (req, res) => {
  try {
    const { studentId } = req.query;
    if (!studentId) {
      return res.status(400).json({ error: "กรุณาระบุรหัสนักศึกษา" });
    }

    const list = readSubmissions();
    const found = list.find((sub: any) => sub.studentId === studentId);
    if (found) {
      res.json(found);
    } else {
      res.json(null);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Save admin's custom Question 3 feedback & adjusted score
app.post("/api/admin/feedback", (req, res) => {
  try {
    const { id, instructorFeedback, instructorScore, showReviews } = req.body;
    if (!id) {
      return res.status(400).json({ error: "ไม่พบรหัสข้อสอบ/การส่งงานที่ต้องการติชม" });
    }

    const list = readSubmissions();
    const found = list.find((sub: any) => sub.id === id || sub.studentId === id);
    if (found) {
      if (instructorFeedback !== undefined) {
        found.instructorFeedback = instructorFeedback || "";
      }
      if (instructorScore !== undefined && instructorScore !== null && instructorScore !== "") {
        found.score = Number(instructorScore);
      }
      if (showReviews !== undefined) {
        found.showReviews = !!showReviews;
      }
      saveSubmissions(list);
      res.json({ success: true, message: "บันทึกคำอธิบายเชิงประจักษ์ สิทธิ์การเผยแพร่ และคะแนนสำเร็จแล้ว" });
    } else {
      res.status(404).json({ error: "ไม่พบข้อมูลประวัติการทำรายงานของรหัสที่ระบุ" });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Submissions Fetch & Wipe APIs
app.post("/api/admin/toggle-reviews", (req, res) => {
  try {
    const { id, showReviews } = req.body;
    if (!id) {
      return res.status(400).json({ error: "ไม่พบรหัสข้อสอบ/การส่งงานที่ต้องการอัพเดทสิทธิ์" });
    }

    const targetId = String(id).trim().toLowerCase();
    const list = readSubmissions();
    const found = list.find((sub: any) => {
      const subId = sub.id ? String(sub.id).trim().toLowerCase() : "";
      const subStudentId = sub.studentId ? String(sub.studentId).trim().toLowerCase() : "";
      return subId === targetId || subStudentId === targetId;
    });

    if (found) {
      found.showReviews = !!showReviews;
      saveSubmissions(list);
      res.json({ success: true, message: "ปรับสิทธิ์สำเร็จแล้ว", showReviews: found.showReviews });
    } else {
      res.status(404).json({ error: "ไม่พบข้อมูลประวัติการทำรายงานของรหัสที่ระบุ" });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/admin/reset-submission", (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ error: "ไม่พบรหัสข้อสอบที่ต้องการล้างข้อมูล" });
    }

    const targetId = String(id).trim().toLowerCase();
    const list = readSubmissions();
    const found = list.find((sub: any) => {
      const subId = sub.id ? String(sub.id).trim().toLowerCase() : "";
      const subStudentId = sub.studentId ? String(sub.studentId).trim().toLowerCase() : "";
      return subId === targetId || subStudentId === targetId;
    });

    if (found) {
      // Keep student identity, but completely clean/reset their answers and scores
      found.qAmount = "";
      found.qMethod = "";
      found.writtenReport = "ยังไม่ได้ระบยุยอดส่งตัวจริง";
      found.score = null;
      found.moneyReview = "";
      found.behaviorReview = "";
      found.formulaReview = "";
      found.isPlaceholder = true;
      found.showReviews = false;
      found.instructorFeedback = "";
      found.timestamp = new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" });

      saveSubmissions(list);
      res.json({ success: true, message: `🧹 ล้างข้อมูลคำเสนอผลและผลคะแนนของรหัส ${id} เรียบร้อยแล้ว สิทธิ์ถูกรีเซ็ตสำเร็จ!` });
    } else {
      res.status(404).json({ error: "ไม่พบข้อมูลรหัสประวัติดังกล่าวในตารางฐานข้อมูล" });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/admin/submissions", (req, res) => {
  try {
    const list = readSubmissions();
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch submissions" });
  }
});

app.delete("/api/admin/submissions/:id", (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "กรุณาระบุไอดีที่ต้องการลบ" });
    }
    const targetId = String(id).trim().toLowerCase();
    let list = readSubmissions();
    const originalLength = list.length;
    list = list.filter((sub: any) => {
      const subId = sub.id ? String(sub.id).trim().toLowerCase() : "";
      const subStudentId = sub.studentId ? String(sub.studentId).trim().toLowerCase() : "";
      return subId !== targetId && subStudentId !== targetId;
    });
    saveSubmissions(list);
    res.json({ success: true, message: `ลบข้อมูลรหัสนักศึกษาสำเร็จ (ลบออกแล้ว ${originalLength - list.length} รายการ)` });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to delete submission" });
  }
});

app.delete("/api/admin/submissions", (req, res) => {
  try {
    saveSubmissions([]);
    res.json({ success: true, message: "ล้างประวัติการส่งงานทั้งหมดสำเร็จ" });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to wipe database" });
  }
});

// Serve full-stack server
async function boot() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

boot();
