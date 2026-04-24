
// Nepalix Admin — Shared Icons + UI Primitives
// Exported to window.* for cross-script access

const cn = (...classes) => classes.filter(Boolean).join(' ');
const fmtNPR = (n) => `रू ${Number(n || 0).toLocaleString('en-NP')}`;
const fmtDate = (d) => new Date(d).toLocaleDateString('en-NP', { day:'2-digit', month:'short', year:'numeric' });

// ── SVG Icon engine ──────────────────────────────────────────────────────────
const Ic = ({ d, size=16, sw=2, fill='none', className='', style={} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor"
    strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
    {Array.isArray(d) ? d : <path d={d}/>}
  </svg>
);

const I = {
  Grid:     p=><Ic {...p} d={[<rect key="a" width="7" height="7" x="3" y="3" rx="1"/>,<rect key="b" width="7" height="7" x="14" y="3" rx="1"/>,<rect key="c" width="7" height="7" x="14" y="14" rx="1"/>,<rect key="d" width="7" height="7" x="3" y="14" rx="1"/>]}/>,
  Bag:      p=><Ic {...p} d={[<path key="a" d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>,<line key="b" x1="3" y1="6" x2="21" y2="6"/>,<path key="c" d="M16 10a4 4 0 0 1-8 0"/>]}/>,
  Card:     p=><Ic {...p} d={[<rect key="a" width="20" height="14" x="2" y="5" rx="2"/>,<line key="b" x1="2" y1="10" x2="22" y2="10"/>]}/>,
  Box:      p=><Ic {...p} d={[<path key="a" d="m7.5 4.27 9 5.15"/>,<path key="b" d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>,<path key="c" d="m3.3 7 8.7 5 8.7-5"/>,<path key="d" d="M12 22V12"/>]}/>,
  Users:    p=><Ic {...p} d={[<path key="a" d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>,<circle key="b" cx="9" cy="7" r="4"/>,<path key="c" d="M22 21v-2a4 4 0 0 0-3-3.87"/>,<path key="d" d="M16 3.13a4 4 0 0 1 0 7.75"/>]}/>,
  User:     p=><Ic {...p} d={[<path key="a" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>,<circle key="b" cx="12" cy="7" r="4"/>]}/>,
  Chart:    p=><Ic {...p} d={[<line key="a" x1="12" y1="20" x2="12" y2="10"/>,<line key="b" x1="18" y1="20" x2="18" y2="4"/>,<line key="c" x1="6" y1="20" x2="6" y2="16"/>]}/>,
  Cog:      p=><Ic {...p} d={[<path key="a" d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>,<circle key="b" cx="12" cy="12" r="3"/>]}/>,
  Bell:     p=><Ic {...p} d={[<path key="a" d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>,<path key="b" d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>]}/>,
  Out:      p=><Ic {...p} d={[<path key="a" d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>,<polyline key="b" points="16 17 21 12 16 7"/>,<line key="c" x1="21" y1="12" x2="9" y2="12"/>]}/>,
  Search:   p=><Ic {...p} d={[<circle key="a" cx="11" cy="11" r="8"/>,<path key="b" d="m21 21-4.3-4.3"/>]}/>,
  Plus:     p=><Ic {...p} d={[<path key="a" d="M5 12h14"/>,<path key="b" d="M12 5v14"/>]}/>,
  CRight:   p=><Ic {...p} d="m9 18 6-6-6-6"/>,
  CDown:    p=><Ic {...p} d="m6 9 6 6 6-6"/>,
  CLeft:    p=><Ic {...p} d="m15 18-6-6 6-6"/>,
  Check:    p=><Ic {...p} d="M20 6 9 17l-5-5"/>,
  X:        p=><Ic {...p} d={[<path key="a" d="M18 6 6 18"/>,<path key="b" d="m6 6 12 12"/>]}/>,
  Alert:    p=><Ic {...p} d={[<path key="a" d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>,<path key="b" d="M12 9v4"/>,<path key="c" d="M12 17h.01"/>]}/>,
  CheckC:   p=><Ic {...p} d={[<path key="a" d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>,<path key="b" d="m9 11 3 3L22 4"/>]}/>,
  Globe:    p=><Ic {...p} d={[<circle key="a" cx="12" cy="12" r="10"/>,<path key="b" d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>,<path key="c" d="M2 12h20"/>]}/>,
  Building: p=><Ic {...p} d={[<rect key="a" width="16" height="20" x="4" y="2" rx="2"/>,<path key="b" d="M9 22v-4h6v4"/>,<path key="c" d="M8 6h.01"/>,<path key="d" d="M16 6h.01"/>,<path key="e" d="M12 6h.01"/>,<path key="f" d="M12 10h.01"/>,<path key="g" d="M12 14h.01"/>]}/>,
  Shield:   p=><Ic {...p} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>,
  Ticket:   p=><Ic {...p} d={[<path key="a" d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>,<path key="b" d="M13 5v2"/>,<path key="c" d="M13 17v2"/>,<path key="d" d="M13 11v2"/>]}/>,
  Zap:      p=><Ic {...p} d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>,
  Tags:     p=><Ic {...p} d={[<path key="a" d="m15 5 6.3 6.3a2.4 2.4 0 0 1 0 3.4L17 19"/>,<path key="b" d="M9.586 5.586A2 2 0 0 0 8.172 5H3a1 1 0 0 0-1 1v5.172a2 2 0 0 0 .586 1.414L8.29 18.29a2.426 2.426 0 0 0 3.42 0l4.58-4.58a2.426 2.426 0 0 0 0-3.42z"/>,<circle key="c" cx="6.5" cy="9.5" r=".5" fill="currentColor" stroke="none"/>]}/>,
  Mega:     p=><Ic {...p} d={[<path key="a" d="m3 11 19-9-9 19-2-8-8-2z"/>,<path key="b" d="m12 12 7-3-3 7"/>]}/>,
  Rcpt:     p=><Ic {...p} d={[<path key="a" d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/>,<path key="b" d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/>]}/>,
  DL:       p=><Ic {...p} d={[<path key="a" d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>,<polyline key="b" points="7 10 12 15 17 10"/>,<line key="c" x1="12" y1="15" x2="12" y2="3"/>]}/>,
  TUp:      p=><Ic {...p} d={[<polyline key="a" points="22 7 13.5 15.5 8.5 10.5 2 17"/>,<polyline key="b" points="16 7 22 7 22 13"/>]}/>,
  TDown:    p=><Ic {...p} d={[<polyline key="a" points="22 17 13.5 8.5 8.5 13.5 2 7"/>,<polyline key="b" points="16 17 22 17 22 11"/>]}/>,
  Cal:      p=><Ic {...p} d={[<path key="a" d="M8 2v4"/>,<path key="b" d="M16 2v4"/>,<rect key="c" width="18" height="18" x="3" y="4" rx="2"/>,<path key="d" d="M3 10h18"/>]}/>,
  Menu:     p=><Ic {...p} d={[<line key="a" x1="4" x2="20" y1="12" y2="12"/>,<line key="b" x1="4" x2="20" y1="6" y2="6"/>,<line key="c" x1="4" x2="20" y1="18" y2="18"/>]}/>,
  Store:    p=><Ic {...p} d={[<path key="a" d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/>,<path key="b" d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>,<path key="c" d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/>,<path key="d" d="M2 7h20"/>]}/>,
  Sparkles: p=><Ic {...p} d={[<path key="a" d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>,<path key="b" d="M5 3v4"/>,<path key="c" d="M19 17v4"/>,<path key="d" d="M3 5h4"/>,<path key="e" d="M17 19h4"/>]}/>,
  MV:       p=><Ic {...p} d={[<circle key="a" cx="12" cy="5" r="1" fill="currentColor" stroke="none"/>,<circle key="b" cx="12" cy="12" r="1" fill="currentColor" stroke="none"/>,<circle key="c" cx="12" cy="19" r="1" fill="currentColor" stroke="none"/>]}/>,
  Info:     p=><Ic {...p} d={[<circle key="a" cx="12" cy="12" r="10"/>,<path key="b" d="M12 16v-4"/>,<path key="c" d="M12 8h.01"/>]}/>,
  Phone:    p=><Ic {...p} d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.92 9.1 19.79 19.79 0 0 1 1.88 .45 2 2 0 0 1 3.88 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>,
  Mail:     p=><Ic {...p} d={[<rect key="a" width="20" height="16" x="2" y="4" rx="2"/>,<path key="b" d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>]}/>,
  ELink:    p=><Ic {...p} d={[<path key="a" d="M15 3h6v6"/>,<path key="b" d="M10 14 21 3"/>,<path key="c" d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>]}/>,
  Eye:      p=><Ic {...p} d={[<path key="a" d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/>,<circle key="b" cx="12" cy="12" r="3"/>]}/>,
  Layers:   p=><Ic {...p} d={[<path key="a" d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/>,<path key="b" d="m6.08 9.5-3.5 1.6a1 1 0 0 0 0 1.81l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9a1 1 0 0 0 0-1.83l-3.5-1.59"/>,<path key="c" d="m6.08 14.5-3.5 1.6a1 1 0 0 0 0 1.81l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9a1 1 0 0 0 0-1.83l-3.5-1.59"/>]}/>,
  Palette:  p=><Ic {...p} d={[<circle key="a" cx="13.5" cy="6.5" r=".5" fill="currentColor"/>,<circle key="b" cx="17.5" cy="10.5" r=".5" fill="currentColor"/>,<circle key="c" cx="8.5" cy="7.5" r=".5" fill="currentColor"/>,<circle key="d" cx="6.5" cy="12.5" r=".5" fill="currentColor"/>,<path key="e" d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>]}/>,
  Trash:    p=><Ic {...p} d={[<path key="a" d="M3 6h18"/>,<path key="b" d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>,<path key="c" d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>]}/>,
  Edit:     p=><Ic {...p} d={[<path key="a" d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>,<path key="b" d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>]}/>,
  Copy:     p=><Ic {...p} d={[<rect key="a" width="14" height="14" x="8" y="8" rx="2"/>,<path key="b" d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>]}/>,
  Star:     p=><Ic {...p} d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>,
  Flag:     p=><Ic {...p} d={[<path key="a" d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>,<line key="b" x1="4" x2="4" y1="22" y2="15"/>]}/>,
  Filter:   p=><Ic {...p} d={[<polygon key="a" points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>]}/>,
  Minus:    p=><Ic {...p} d="M5 12h14"/>,
  List:     p=><Ic {...p} d={[<line key="a" x1="8" x2="21" y1="6" y2="6"/>,<line key="b" x1="8" x2="21" y1="12" y2="12"/>,<line key="c" x1="8" x2="21" y1="18" y2="18"/>,<line key="d" x1="3" x2="3.01" y1="6" y2="6"/>,<line key="e" x1="3" x2="3.01" y1="12" y2="12"/>,<line key="f" x1="3" x2="3.01" y1="18" y2="18"/>]}/>,
  Percent:  p=><Ic {...p} d={[<line key="a" x1="19" x2="5" y1="5" y2="19"/>,<circle key="b" cx="6.5" cy="6.5" r="2.5"/>,<circle key="c" cx="17.5" cy="17.5" r="2.5"/>]}/>,
  MapPin:   p=><Ic {...p} d={[<path key="a" d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>,<circle key="b" cx="12" cy="10" r="3"/>]}/>,
  Scan:     p=><Ic {...p} d={[<path key="a" d="M3 7V5a2 2 0 0 1 2-2h2"/>,<path key="b" d="M17 3h2a2 2 0 0 1 2 2v2"/>,<path key="c" d="M21 17v2a2 2 0 0 1-2 2h-2"/>,<path key="d" d="M7 21H5a2 2 0 0 1-2-2v-2"/>,<line key="e" x1="7" x2="7" y1="12" y2="12.01"/>,<line key="f" x1="17" x2="17" y1="12" y2="12.01"/>]}/>,
  Wallet:   p=><Ic {...p} d={[<path key="a" d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/>,<path key="b" d="M3 5v14a2 2 0 0 0 2 2h16v-5"/>,<path key="c" d="M18 12a2 2 0 0 0 0 4h4v-4Z"/>]}/>,
  PieChart: p=><Ic {...p} d={[<path key="a" d="M21.21 15.89A10 10 0 1 1 8 2.83"/>,<path key="b" d="M22 12A10 10 0 0 0 12 2v10z"/>]}/>,
  Clock:    p=><Ic {...p} d={[<circle key="a" cx="12" cy="12" r="10"/>,<polyline key="b" points="12 6 12 12 16 14"/>]}/>,
  Refresh:  p=><Ic {...p} d={[<path key="a" d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>,<path key="b" d="M21 3v5h-5"/>,<path key="c" d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>,<path key="d" d="M8 16H3v5"/>]}/>,
};

// ── Button ───────────────────────────────────────────────────────────────────
const Btn = ({ children, variant='primary', size='md', className='', disabled, onClick, type='button' }) => {
  const base = 'inline-flex items-center justify-center gap-1.5 font-semibold rounded-lg transition-all duration-150 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed select-none';
  const v = {
    primary:  'bg-[#5B4FF9] text-white hover:bg-[#4338CA] active:scale-[0.98] shadow-sm',
    secondary:'bg-white text-[#111827] border border-[#E5E7EB] hover:bg-[#F9FAFB] active:scale-[0.98]',
    ghost:    'text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827]',
    danger:   'bg-[#DC2626] text-white hover:bg-[#B91C1C] active:scale-[0.98]',
    outline:  'border border-[#5B4FF9] text-[#5B4FF9] hover:bg-[#EEF2FF]',
    success:  'bg-[#16A34A] text-white hover:bg-[#15803D] active:scale-[0.98]',
    dark:     'bg-[#111827] text-white hover:bg-[#1F2937] active:scale-[0.98]',
  };
  const s = { xs:'px-2.5 py-1 text-[11px]', sm:'px-3 py-1.5 text-xs', md:'px-4 py-2 text-sm', lg:'px-5 py-2.5 text-sm' };
  return <button type={type} disabled={disabled} onClick={onClick} className={`${base} ${v[variant]} ${s[size]} ${className}`}>{children}</button>;
};

// ── Badge ────────────────────────────────────────────────────────────────────
const Badge = ({ children, variant='default', className='' }) => {
  const v = {
    default:  'bg-[#F3F4F6] text-[#374151]',
    primary:  'bg-[#EEF2FF] text-[#4338CA]',
    success:  'bg-[#DCFCE7] text-[#16A34A]',
    warning:  'bg-[#FEF3C7] text-[#D97706]',
    danger:   'bg-[#FEE2E2] text-[#DC2626]',
    info:     'bg-[#DBEAFE] text-[#2563EB]',
    gold:     'bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]',
    dark:     'bg-[#111827] text-white',
    outline:  'bg-transparent border border-[#E5E7EB] text-[#374151]',
    purple:   'bg-[#F3F0FF] text-[#5B4FF9]',
  };
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${v[variant]||v.default} ${className}`}>{children}</span>;
};

// ── Card ─────────────────────────────────────────────────────────────────────
const Card = ({ children, className='', onClick, style={} }) => (
  <div onClick={onClick} style={style} className={`bg-white rounded-xl border border-[#E5E7EB] shadow-sm ${onClick?'cursor-pointer':''} ${className}`}>{children}</div>
);

// ── Input ────────────────────────────────────────────────────────────────────
const Input = ({ label, icon, className='', ...props }) => (
  <div className="flex flex-col gap-1.5 w-full">
    {label && <label className="text-[11px] font-semibold text-[#374151] uppercase tracking-wide">{label}</label>}
    <div className="relative">
      {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none">{icon}</span>}
      <input className={`w-full h-9 rounded-lg border border-[#E5E7EB] bg-white text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#5B4FF9]/30 focus:border-[#5B4FF9] transition-all ${icon?'pl-9 pr-3':'px-3'} ${className}`} {...props}/>
    </div>
  </div>
);

// ── Select ───────────────────────────────────────────────────────────────────
const Select = ({ label, children, ...props }) => (
  <div className="flex flex-col gap-1.5 w-full">
    {label && <label className="text-[11px] font-semibold text-[#374151] uppercase tracking-wide">{label}</label>}
    <select className="w-full h-9 rounded-lg border border-[#E5E7EB] bg-white text-sm text-[#111827] px-3 focus:outline-none focus:ring-2 focus:ring-[#5B4FF9]/30 focus:border-[#5B4FF9] transition-all appearance-none" {...props}>{children}</select>
  </div>
);

// ── Progress bar ─────────────────────────────────────────────────────────────
const ProgressBar = ({ value, max=100, color='#5B4FF9', size='sm' }) => {
  const pct = Math.min(100, (value/max)*100);
  const h = size==='sm' ? 'h-1.5' : 'h-2';
  const bg = pct>85 ? '#DC2626' : pct>65 ? '#D97706' : color;
  return (
    <div className={`${h} rounded-full bg-[#F3F4F6] overflow-hidden`}>
      <div className={`h-full rounded-full transition-all duration-700`} style={{width:`${pct}%`,background:bg}}/>
    </div>
  );
};

// ── Stat card ────────────────────────────────────────────────────────────────
const Stat = ({ label, value, change, icon: IconComp, color='#5B4FF9', sub }) => (
  <Card>
    <div className="p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{background:`${color}18`}}>
          <IconComp size={17} style={{color}}/>
        </div>
        {change !== undefined && (
          <span className={`text-[11px] font-bold flex items-center gap-0.5 ${change>=0?'text-[#16A34A]':'text-[#DC2626]'}`}>
            {change>=0 ? <I.TUp size={12}/> : <I.TDown size={12}/>}
            {Math.abs(change)}%
          </span>
        )}
      </div>
      <div className="text-[22px] font-bold text-[#111827] tracking-tight leading-tight">{value}</div>
      <div className="text-xs text-[#9CA3AF] mt-0.5 font-medium">{label}</div>
      {sub && <div className="text-[11px] text-[#6B7280] mt-1">{sub}</div>}
    </div>
  </Card>
);

// ── Table ────────────────────────────────────────────────────────────────────
const Table = ({ headers, rows, onRowClick }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-[#F3F4F6]">
          {headers.map((h,i)=>(
            <th key={i} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row,i)=>(
          <tr key={i} onClick={()=>onRowClick&&onRowClick(i)} className={`border-b border-[#F9FAFB] transition-colors ${onRowClick?'cursor-pointer hover:bg-[#FAFBFF]':'hover:bg-[#FAFAFA]'}`}>
            {row.map((cell,j)=>(
              <td key={j} className="px-4 py-3 text-[#374151]">{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ── Section header ───────────────────────────────────────────────────────────
const SectionHeader = ({ title, subtitle, actions }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
    <div>
      <h1 className="text-xl font-bold text-[#111827] tracking-tight">{title}</h1>
      {subtitle && <p className="text-sm text-[#6B7280] mt-0.5">{subtitle}</p>}
    </div>
    {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
  </div>
);

// ── Avatar ───────────────────────────────────────────────────────────────────
const Avatar = ({ name='?', src, size=32, color='#5B4FF9' }) => {
  const initials = name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2);
  return (
    <div className="rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center font-bold text-white text-xs" style={{width:size,height:size,background:src?'transparent':color}}>
      {src ? <img src={src} alt={name} className="w-full h-full object-cover"/> : initials}
    </div>
  );
};

// ── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ message, type='success', onClose }) => (
  <div className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-medium border animate-[slideUp_0.3s_ease] ${type==='success'?'bg-white border-[#DCFCE7] text-[#16A34A]':type==='error'?'bg-white border-[#FEE2E2] text-[#DC2626]':'bg-white border-[#E5E7EB] text-[#374151]'}`}>
    {type==='success'?<I.CheckC size={16}/>:type==='error'?<I.X size={16}/>:<I.Info size={16}/>}
    {message}
    <button onClick={onClose} className="ml-2 text-[#9CA3AF] hover:text-[#374151]"><I.X size={14}/></button>
  </div>
);

// ── Modal ────────────────────────────────────────────────────────────────────
const Modal = ({ open, onClose, title, children, width='max-w-lg' }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}/>
      <div className={`relative w-full ${width} bg-white rounded-2xl shadow-2xl border border-[#E5E7EB] overflow-hidden`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F3F4F6]">
          <h2 className="text-base font-bold text-[#111827]">{title}</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#374151]"><I.X size={14}/></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

// ── Sidebar item ─────────────────────────────────────────────────────────────
const SidebarItem = ({ icon: Icon, label, active, onClick, badge, collapsed }) => (
  <button onClick={onClick} title={collapsed?label:undefined}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[12px] font-semibold tracking-wide transition-all duration-150 group relative
      ${active ? 'bg-[#5B4FF9] text-white' : 'text-[rgba(255,255,255,0.6)] hover:bg-[rgba(255,255,255,0.08)] hover:text-white'}`}>
    <span className="flex-shrink-0"><Icon size={15}/></span>
    {!collapsed && <span className="flex-1 text-left truncate">{label}</span>}
    {!collapsed && badge && <span className={`text-[9px] font-black tracking-wider px-1.5 py-0.5 rounded-full ${active?'bg-white/20 text-white':'bg-[#5B4FF9]/80 text-white'}`}>{badge}</span>}
    {collapsed && active && <span className="absolute left-full ml-2 px-2 py-1 bg-[#1F2937] text-white text-[11px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">{label}</span>}
  </button>
);

Object.assign(window, { I, Btn, Badge, Card, Input, Select, ProgressBar, Stat, Table, SectionHeader, Avatar, Toast, Modal, SidebarItem, cn, fmtNPR, fmtDate });
