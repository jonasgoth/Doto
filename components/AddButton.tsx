'use client';

interface AddButtonProps {
  onClick: () => void;
  label?: string;
}

export function AddButton({ onClick, label = '+ Add' }: AddButtonProps) {
  return (
    <div className="flex justify-end">
      <button
        onClick={onClick}
        className="text-sm transition-colors"
        style={{
          color: '#B5B5B0',
          padding: '6px 12px',
          borderRadius: '8px',
          backgroundColor: 'transparent',
          transitionDuration: '0.15s',
          transitionTimingFunction: 'ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.04)')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
      >
        {label}
      </button>
    </div>
  );
}
