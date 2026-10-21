import * as xlsx from 'xlsx';

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
 * Phân tích cú pháp văn bản thô (Copy-paste từ Word/PDF) thành danh sách câu hỏi trắc nghiệm
 */
export function parseRawTextToQuestions(rawText: string): ParsedQuestion[] {
  if (!rawText || !rawText.trim()) return [];

  const questions: ParsedQuestion[] = [];
  // Tách câu hỏi dựa theo mẫu: "Câu 1:", "Câu 2.", "1.", "Question 1:", v.v.
  const questionBlocks = rawText.split(/(?=(?:(?:Câu|Question)\s*\d+[\.:]|^\s*\d+[\.:]\s))/gim);

  for (let block of questionBlocks) {
    block = block.trim();
    if (!block) continue;

    // Lấy nội dung câu hỏi (trước các phương án A., B., C., D.)
    const optionMatches = [...block.matchAll(/(?:^|\n)\s*([A-Fa-f])[\.\)]\s*([^\n\r]+)/g)];
    if (optionMatches.length < 2) continue; // Phải có ít nhất 2 phương án

    // Tìm vị trí bắt đầu của phương án đầu tiên
    const firstOptionIndex = optionMatches[0].index ?? block.length;
    let questionContent = block.substring(0, firstOptionIndex).trim();

    // Loại bỏ tiền tố "Câu 1:", "1.", v.v.
    questionContent = questionContent.replace(/^(?:(?:Câu|Question)\s*\d+[\.:]|\d+[\.:])\s*/i, '').trim();

    // Tìm đáp án đúng (ví dụ: "*Đáp án: A" hoặc "Đáp án: A" hoặc "Answer: A")
    const answerMatch = block.match(/(?:\*?(?:Đáp án|ĐA|Answer|Key)[\s:]+)([A-Fa-f])/i);
    const correctLetter = answerMatch ? answerMatch[1].toUpperCase() : 'A';

    // Tìm giải thích (ví dụ: "*Giải thích: ..." hoặc "*Lời giải: ...")
    const explanationMatch = block.match(/(?:\*?(?:Giải thích|Lời giải|Explanation)[\s:]+)([^\n\r]+(?:\n[^\n\r]+)*)/i);
    const explanation = explanationMatch ? explanationMatch[1].trim() : undefined;

    const options: ParsedOption[] = optionMatches.map((m, idx) => {
      const letter = m[1].toUpperCase();
      let optText = m[2].trim();
      // Loại bỏ nếu dính phần đáp án hoặc giải thích ở cuối dòng
      optText = optText.replace(/(?:\*?(?:Đáp án|ĐA|Answer|Key|Giải thích)[\s:].*)$/i, '').trim();

      return {
        content: optText,
        isCorrect: letter === correctLetter,
        orderIndex: idx,
      };
    });

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

/**
 * Phân tích file Excel (.xlsx / .csv) thành danh sách câu hỏi
 * Định dạng cột mong đợi:
 * Cột 1: Nội dung câu hỏi
 * Cột 2: Phương án A
 * Cột 3: Phương án B
 * Cột 4: Phương án C
 * Cột 5: Phương án D
 * Cột 6: Đáp án đúng (A, B, C, hoặc D)
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
  const startRow = typeof rows[0][0] === 'string' && rows[0][0].toLowerCase().includes('câu') ? 1 : 0;

  for (let i = startRow; i < rows.length; i++) {
    const row = rows[i];
    if (!row || !row[0]) continue;

    const questionContent = String(row[0]).trim();
    const optA = row[1] ? String(row[1]).trim() : '';
    const optB = row[2] ? String(row[2]).trim() : '';
    const optC = row[3] ? String(row[3]).trim() : '';
    const optD = row[4] ? String(row[4]).trim() : '';
    const correctLetter = row[5] ? String(row[5]).trim().toUpperCase() : 'A';
    const explanation = row[6] ? String(row[6]).trim() : undefined;

    const rawOptions = [optA, optB, optC, optD].filter(Boolean);
    if (rawOptions.length < 2) continue;

    const letters = ['A', 'B', 'C', 'D'];
    const options: ParsedOption[] = rawOptions.map((opt, idx) => ({
      content: opt,
      isCorrect: letters[idx] === correctLetter,
      orderIndex: idx,
    }));

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
