/** STK logo mark: a shield with a check, on a rounded square. */
export function BrandMark({ size = 28 }: { size?: number }) {
  return (<svg width={size} height={size} viewBox="0 0 32 32" role="img" aria-label="STK" className="brandmark">
    <rect width="32" height="32" rx="9" fill="var(--navy)" />
    <path d="M16 6.5l8 3v6c0 5-3.4 8.7-8 10.5-4.6-1.8-8-5.5-8-10.5v-6z" fill="none" stroke="var(--navy-fg)" strokeWidth="2" strokeLinejoin="round" />
    <path d="M12.3 16.2l2.7 2.7 4.8-5.2" fill="none" stroke="var(--navy-fg)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>);
}
