export function Logo({ className = '' }: { className?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }} className={className}>
      <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* The three horizontal curved lines (Vibhuti / Tripundra) */}
        <path d="M 20 40 Q 50 30 80 40" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
        <path d="M 20 50 Q 50 40 80 50" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
        <path d="M 20 60 Q 50 50 80 60" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
        
        {/* The central blue eye (Third Eye) */}
        <path d="M 50 15 C 65 40 70 65 50 85 C 30 65 35 40 50 15 Z" fill="#0ea5e9" stroke="#0284c7" strokeWidth="2" />
        
        {/* Pupil */}
        <circle cx="50" cy="55" r="12" fill="#000000" />
        
        {/* Highlight */}
        <circle cx="46" cy="51" r="4" fill="#ffffff" />
      </svg>
      <span style={{ 
        fontFamily: 'Outfit, sans-serif', 
        fontWeight: 800, 
        fontSize: '18px',
        letterSpacing: '0.05em',
        textTransform: 'uppercase'
      }}>
        Netre
      </span>
    </div>
  );
}
