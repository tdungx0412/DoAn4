import * as xlsx from 'xlsx';
import mammoth from 'mammoth';

export interface ParsedOption {
  content: string;
  isCorrect: boolean;
  orderIndex: number;
}

export interface ParsedQuestion {
  content: string;
  explanation?: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  orderIndex: number;
  options: ParsedOption[];
}

/**
 * Phân tích cú pháp văn bản thô (Copy-paste từ Word/PDF hoặc trích xuất từ file .docx/.txt)
 */
export function parseRawTextToQuestions(rawText: string): ParsedQuestion[] {
  if (!rawText || !rawText.trim()) return [];

  const questions: ParsedQuestion[] = [];
  // Chuẩn hóa ngắt dòng
  const normalizedText = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Tách câu hỏi dựa theo: "Câu 1:", "Câu 1.", "Question 1:", "1.", v.v.
  const questionBlocks = normalizedText.split(/(?=(?:(?:Câu|Cau|Question)\s*\d+[\.:]|^\s*\d+[\.:]\s))/gim);

  for (let block of questionBlocks) {
    block = block.trim();
    if (!block) continue;

    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
    const questionLines: string[] = [];
    const rawOptions: { letter: string; content: string }[] = [];
    let correctLetter = 'A';
    let explanation: string | undefined = undefined;

    for (let line of lines) {
      // 1. Kiểm tra dòng đáp án đúng (ví dụ: *Đáp án: A hoặc Đáp án: A hoặc Key: A)
      const ansMatch = line.match(/^\*?(?:Đáp án|ĐA|Dap an|Answer|Key)[\s:]+([A-Da-d1-4])/i);
      if (ansMatch) {
        const raw = ansMatch[1].toUpperCase();
        const map: Record<string, string> = { '1': 'A', '2': 'B', '3': 'C', '4': 'D' };
        correctLetter = map[raw] || raw;
        continue;
      }

      // 2. Kiểm tra dòng giải thích (ví dụ: *Lời giải: ... hoặc *Giải thích: ...)
      const expMatch = line.match(/^\*?(?:Giải thích|Lời giải|Giai thich|Loi giai|Explanation)[\s:]+(.*)/i);
      if (expMatch) {
        explanation = expMatch[1].trim();
        continue;
      }

      // 3. Kiểm tra xem dòng có chứa phương án trả lời dạng A. ... hay không
      if (/^\*?[A-Da-d][\.\)]\s+/.test(line)) {
        // Tách các phương án nếu nằm cùng 1 dòng (ví dụ: A. 8   B. 6   C. 12   D. 24)
        const parts = line.split(/\s{2,}|\t|(?<=[^\s])\s+(?=\*?[B-Db-d][\.\)]\s+)/);
        for (let part of parts) {
          const optMatch = part.trim().match(/^(\*?)([A-Da-d])[\.\)]\s*(.*)$/);
          if (optMatch) {
            const isAsterisk = optMatch[1] === '*';
            const letter = optMatch[2].toUpperCase();
            if (isAsterisk) correctLetter = letter;
            rawOptions.push({
              letter,
              content: optMatch[3].trim(),
            });
          }
        }
        continue;
      }

      // 4. Nếu chưa có phương án nào thì đây là dòng nội dung câu hỏi
      if (rawOptions.length === 0) {
        questionLines.push(line);
      } else if (explanation !== undefined) {
        // Dòng bổ sung cho lời giải thích nhiều dòng
        explanation += '\n' + line;
      }
    }

    if (rawOptions.length >= 2) {
      let qContent = questionLines.join('\n').replace(/^(?:(?:câu|cau|question|\d+)\s*[\d\.:]*|\d+[\.:])\s*/i, '').trim();
      if (!qContent) {
        qContent = 'Câu hỏi trắc nghiệm';
      }

      const options: ParsedOption[] = rawOptions.map((o, idx) => ({
        content: o.content,
        isCorrect: o.letter === correctLetter,
        orderIndex: idx,
      }));

      // Đảm bảo luôn có ít nhất 1 đáp án đúng
      if (!options.some((o) => o.isCorrect)) {
        options[0].isCorrect = true;
      }

      questions.push({
        content: qContent,
        explanation,
        difficulty: 'MEDIUM',
        orderIndex: questions.length,
        options,
      });
    }
  }

  return questions;
}

/**
 * Phân tích file Word (.docx) sang danh sách câu hỏi sử dụng mammoth
 */
export async function parseWordBufferToQuestions(buffer: Buffer): Promise<ParsedQuestion[]> {
  const result = await mammoth.extractRawText({ buffer });
  return parseRawTextToQuestions(result.value);
}

/**
 * Phân tích file Excel (.xlsx / .csv) thành danh sách câu hỏi
 * Hỗ trợ các chuẩn Wayground / Quizizz / EdTech:
 * Cột 1: Câu hỏi (Question Text)
 * Cột 2: Phương án A (Option 1)
 * Cột 3: Phương án B (Option 2)
 * Cột 4: Phương án C (Option 3)
 * Cột 5: Phương án D (Option 4)
 * Cột 6: Đáp án đúng (A, B, C, D hoặc 1, 2, 3, 4)
 * Cột 7: Lời giải thích (tùy chọn)
 */
export function parseExcelBufferToQuestions(buffer: Buffer): ParsedQuestion[] {
  const workbook = xlsx.read(buffer, { type: 'buffer' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const rows: any[][] = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

  if (rows.length < 2) return [];

  const questions: ParsedQuestion[] = [];

  // Bỏ qua dòng tiêu đề nếu dòng 1 chứa chữ "Câu hỏi" hoặc "Question"
  const startRow = typeof rows[0][0] === 'string' && (rows[0][0].toLowerCase().includes('câu') || rows[0][0].toLowerCase().includes('question')) ? 1 : 0;

  for (let i = startRow; i < rows.length; i++) {
    const row = rows[i];
    if (!row || !row[0]) continue;

    const questionContent = String(row[0]).trim();
    const optA = row[1] ? String(row[1]).trim() : '';
    const optB = row[2] ? String(row[2]).trim() : '';
    const optC = row[3] ? String(row[3]).trim() : '';
    const optD = row[4] ? String(row[4]).trim() : '';
    
    // Xử lý đáp án đúng: hỗ trợ 'A'/'B'/'C'/'D' hoặc số '1'/'2'/'3'/'4'
    let rawKey = row[5] ? String(row[5]).trim().toUpperCase() : 'A';
    if (rawKey === '1') rawKey = 'A';
    else if (rawKey === '2') rawKey = 'B';
    else if (rawKey === '3') rawKey = 'C';
    else if (rawKey === '4') rawKey = 'D';

    const explanation = row[6] ? String(row[6]).trim() : undefined;

    const rawOptions = [optA, optB, optC, optD].filter(Boolean);
    if (rawOptions.length < 2) continue;

    const letters = ['A', 'B', 'C', 'D'];
    const options: ParsedOption[] = rawOptions.map((opt, idx) => ({
      content: opt,
      isCorrect: letters[idx] === rawKey,
      orderIndex: idx,
    }));

    // Đảm bảo có ít nhất 1 đáp án đúng
    if (!options.some((o) => o.isCorrect)) {
      options[0].isCorrect = true;
    }

    questions.push({
      content: questionContent,
      explanation,
      difficulty: 'MEDIUM',
      orderIndex: questions.length,
      options,
    });
  }

  return questions;
}
