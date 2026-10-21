import React from 'react';
import { Subject } from '../types';
import { Sparkles, Calculator, Languages, Code, Atom, BookOpen } from 'lucide-react';

interface CategoryChipsProps {
  subjects: Subject[];
  selectedSubjectId: string;
  onSelectSubject: (id: string) => void;
}

export const CategoryChips: React.FC<CategoryChipsProps> = ({
  subjects,
  selectedSubjectId,
  onSelectSubject,
}) => {
  const getSubjectIcon = (iconName: string, name: string) => {
    if (iconName === 'Calculator' || name.includes('Toán')) return <Calculator size={15} />;
    if (iconName === 'Languages' || name.includes('Anh')) return <Languages size={15} />;
    if (iconName === 'Code' || name.includes('Tin') || name.includes('CNTT')) return <Code size={15} />;
    if (iconName === 'Atom' || name.includes('Lý') || name.includes('Hóa')) return <Atom size={15} />;
    return <BookOpen size={15} />;
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      overflowX: 'auto',
      paddingBottom: '6px',
    }}>
      {/* "Tất cả môn" button */}
      <button
        onClick={() => onSelectSubject('all')}
        className={`category-pill ${selectedSubjectId === 'all' ? 'active' : ''}`}
      >
        <Sparkles size={15} />
        <span>Tất cả môn học</span>
      </button>

      {/* Dynamic Subjects from database */}
      {subjects.map((sub) => {
        const isActive = selectedSubjectId === sub.id;
        return (
          <button
            key={sub.id}
            onClick={() => onSelectSubject(sub.id)}
            className={`category-pill ${isActive ? 'active' : ''}`}
            style={{
              borderColor: isActive ? sub.color : 'var(--border-subtle)',
              backgroundColor: isActive ? sub.color : 'rgba(255, 255, 255, 0.04)',
            }}
          >
            {getSubjectIcon(sub.icon, sub.name)}
            <span>{sub.name}</span>
            {sub.examCount !== undefined && (
              <span style={{
                fontSize: '11px',
                padding: '1px 6px',
                borderRadius: '999px',
                background: isActive ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                color: '#fff',
                marginLeft: '2px',
              }}>
                {sub.examCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
