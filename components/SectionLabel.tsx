interface SectionLabelProps {
  children: React.ReactNode;
}

export function SectionLabel({ children }: SectionLabelProps) {
  return (
    <p
      style={{
        fontSize: '14px',
        fontWeight: 400,
        color: '#B5B5B0',
        marginBottom: '12px',
      }}
    >
      {children}
    </p>
  );
}
