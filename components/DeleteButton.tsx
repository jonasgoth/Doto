'use client';

interface DeleteButtonProps {
  onClick: () => void;
}

export function DeleteButton({ onClick }: DeleteButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center rounded-full transition-colors"
      style={{
        width: '22px',
        height: '22px',
        color: '#B5B5B0',
        backgroundColor: 'transparent',
        transitionDuration: '0.15s',
        transitionTimingFunction: 'ease',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F0EDED')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path
          d="M1 1L9 9M9 1L1 9"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}
