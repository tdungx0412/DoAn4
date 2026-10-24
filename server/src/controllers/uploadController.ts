import { Request, Response } from 'express';
import {
  parseRawTextToQuestions,
  parseExcelBufferToQuestions,
  parseWordBufferToQuestions,
  ParsedQuestion,
} from '../services/parserService.js';

export const parseRawText = (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ success: false, message: 'Nội dung văn bản không hợp lệ' });
    }

    const questions = parseRawTextToQuestions(text);

    res.json({
      success: true,
      data: {
        totalParsed: questions.length,
        questions,
      },
    });
  } catch (error) {
    console.error('Lỗi khi phân tích văn bản:', error);
    res.status(500).json({ success: false, message: 'Không thể phân tích cú pháp văn bản' });
  }
};

export const parseDocumentFile = async (req: Request, res: Response) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ success: false, message: 'Vui lòng tải lên file tài liệu (Word .docx, Excel .xlsx / .csv, hoặc Text)' });
    }

    const filename = req.file.originalname.toLowerCase();
    let questions: ParsedQuestion[] = [];

    if (filename.endsWith('.xlsx') || filename.endsWith('.xls') || filename.endsWith('.csv')) {
      questions = parseExcelBufferToQuestions(req.file.buffer);
    } else if (filename.endsWith('.docx') || filename.endsWith('.doc')) {
      questions = await parseWordBufferToQuestions(req.file.buffer);
    } else if (filename.endsWith('.txt')) {
      questions = parseRawTextToQuestions(req.file.buffer.toString('utf-8'));
    } else {
      try {
        questions = await parseWordBufferToQuestions(req.file.buffer);
      } catch {
        questions = parseExcelBufferToQuestions(req.file.buffer);
      }
    }

    res.json({
      success: true,
      data: {
        filename: req.file.originalname,
        totalParsed: questions.length,
        questions,
      },
    });
  } catch (error: any) {
    console.error('Lỗi khi phân tích file tài liệu:', error);
    res.status(500).json({ success: false, message: error?.message || 'Không thể đọc tệp tài liệu' });
  }
};

export const parseExcelFile = parseDocumentFile;

