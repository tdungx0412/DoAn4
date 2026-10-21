import React from 'react';
import { HelpCircle, Sparkles, KeyRound, FileText, CheckCircle2, BookOpen } from 'lucide-react';
import { MathRenderer } from '../components/MathRenderer';

export const GuidePage: React.FC = () => {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px', width: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#fff', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <HelpCircle size={28} color="#8b5cf6" />
          <span>Hướng Dẫn Sử Dụng & Quy Định Nhập Liệu</span>
        </h2>
        <p style={{ fontSize: '15px', color: 'var(--text-muted)' }}>
          Cách tham gia phòng thi, công thức soạn đề và hỗ trợ định dạng KaTeX
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Card 1: Mã PIN */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#38bdf8', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <KeyRound size={20} />
            <span>1. Cách vào phòng thi bằng mã PIN (Join Code)</span>
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '12px' }}>
            Mỗi đề thi trên hệ thống đều được cấp một <strong>mã PIN gồm 6 chữ số duy nhất</strong> (tương tự cơ chế của Wayground / Quizizz). Giáo viên chỉ cần gửi mã này cho học sinh để vào thi ngay mà không cần gửi link phức tạp.
          </p>
          <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', fontSize: '13px', color: '#cbd5e1' }}>
            💡 Ví dụ các mã có sẵn trong cơ sở dữ liệu: <code style={{ color: '#38bdf8' }}>101101</code> (Toán Học), <code style={{ color: '#38bdf8' }}>202202</code> (Tiếng Anh), <code style={{ color: '#38bdf8' }}>303303</code> (Lập trình CNTT).
          </div>
        </div>

        {/* Card 2: Quy tắc soạn đề */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#ec4899', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={20} />
            <span>2. Cú pháp soạn đề tự động bằng Text Parser</span>
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '12px' }}>
            Khi sử dụng tính năng <strong>Creator Studio</strong>, bạn có thể copy trực tiếp từ văn bản Word theo mẫu sau, hệ thống sẽ tự động bóc tách thành câu hỏi:
          </p>
          <pre style={{
            background: 'rgba(0, 0, 0, 0.4)',
            padding: '16px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '13px',
            color: '#a7f3d0',
            fontFamily: 'var(--font-mono)',
            overflowX: 'auto',
            lineHeight: 1.5,
          }}>
{`Câu 1: Thủ đô của Việt Nam là gì?
A. TP. Hồ Chí Minh
B. Hà Nội
C. Đà Nẵng
D. Cần Thơ
*Đáp án: B
*Lời giải: Hà Nội là thủ đô của nước CHXHCN Việt Nam.`}
          </pre>
        </div>

        {/* Card 3: Công thức Toán KaTeX */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#10b981', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} />
            <span>3. Hỗ trợ công thức Toán, Lý, Hóa ($\LaTeX$)</span>
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '14px' }}>
            Hệ thống tích hợp thư viện render KaTeX. Bạn chỉ cần đặt công thức giữa hai dấu <code>$công thức$</code>:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '4px' }}>Bạn gõ:</div>
              <code style={{ fontSize: '13px', color: '#f59e0b' }}>$\int_{0}^{1} x^2 dx$</code>
              <div style={{ fontSize: '12px', color: 'var(--text-dim)', margin: '8px 0 4px' }}>Hiển thị:</div>
              <div style={{ fontSize: '16px', color: '#fff' }}><MathRenderer content="$\int_{0}^{1} x^2 dx$" /></div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '4px' }}>Bạn gõ:</div>
              <code style={{ fontSize: '13px', color: '#f59e0b' }}>$H_2SO_4 + 2NaOH$</code>
              <div style={{ fontSize: '12px', color: 'var(--text-dim)', margin: '8px 0 4px' }}>Hiển thị:</div>
              <div style={{ fontSize: '16px', color: '#fff' }}><MathRenderer content="$H_2SO_4 + 2NaOH$" /></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
