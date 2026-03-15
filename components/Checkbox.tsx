'use client';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function Checkbox({ checked, onChange }: CheckboxProps) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex-shrink-0 flex items-center justify-center transition-all"
      style={{
        width: '22px',
        height: '22px',
        borderRadius: '50%',
        border: checked ? 'none' : '1.5px solid #E5E5E0',
        backgroundColor: checked ? '#49EA8B' : 'transparent',
        transitionDuration: '0.2s',
        transitionTimingFunction: 'ease',
      }}
    >
      {checked && (
        <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
          <path
            d="M1 4L4.5 7.5L11 1"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
