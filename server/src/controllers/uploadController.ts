import { Request, Response } from 'express';
import { parseRawTextToQuestions, parseExcelBufferToQuestions } from '../services/parserService.js';

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

export const parseExcelFile = (req: Request, res: Response) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ success: false, message: 'Vui lòng tải lên file Excel (.xlsx / .csv)' });
    }

    const questions = parseExcelBufferToQuestions(req.file.buffer);

    res.json({
      success: true,
      data: {
        totalParsed: questions.length,
        questions,
      },
    });
  } catch (error) {
    console.error('Lỗi khi phân tích file Excel:', error);
    res.status(500).json({ success: false, message: 'Không thể phân tích file Excel' });
  }
};
