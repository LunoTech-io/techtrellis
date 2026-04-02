const Icon = ({ size = 24, color = "currentColor", strokeWidth = 2.5, className = "", style = {}, children, viewBox = "0 0 64 64", ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox={viewBox}
    width={size}
    height={size}
    fill="none"
    stroke={color}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
    {...props}
  >
    {children}
  </svg>
);

export const AttractIcon = (props) => (
  <Icon {...props}>
    <path d="M22,10 L22,34 Q22,50 32,50 Q42,50 42,34 L42,10" strokeWidth="3" />
    <rect x="16" y="4" width="12" height="12" rx="2.5" strokeWidth="2.5" />
    <rect x="36" y="4" width="12" height="12" rx="2.5" strokeWidth="2.5" />
    <line x1="32" y1="54" x2="32" y2="60" strokeWidth="1.5" opacity=".4" />
    <line x1="24" y1="55" x2="22" y2="60" strokeWidth="1.5" opacity=".3" />
    <line x1="40" y1="55" x2="42" y2="60" strokeWidth="1.5" opacity=".3" />
  </Icon>
);

export const SelectIcon = (props) => (
  <Icon {...props}>
    <circle cx="28" cy="26" r="18" strokeWidth="2.5" />
    <line x1="40" y1="38" x2="56" y2="54" strokeWidth="3.5" />
    <path d="M21,26 L28,17 L35,26 L28,35Z" strokeWidth="2" />
  </Icon>
);

export const LaunchIcon = (props) => (
  <Icon {...props}>
    <path d="M32,4 Q32,18 24,36 L40,36 Q32,18 32,4Z" strokeWidth="2.5" />
    <path d="M16,30 L24,25 L24,36Z" strokeWidth="2" />
    <path d="M48,30 L40,25 L40,36Z" strokeWidth="2" />
    <circle cx="32" cy="22" r="3" strokeWidth="1.5" />
    <line x1="32" y1="40" x2="32" y2="52" strokeWidth="2.5" opacity=".4" />
    <line x1="26" y1="42" x2="26" y2="48" strokeWidth="1.5" opacity=".25" />
    <line x1="38" y1="42" x2="38" y2="48" strokeWidth="1.5" opacity=".25" />
  </Icon>
);

export const EquipIcon = (props) => (
  <Icon {...props}>
    <rect x="8" y="22" width="48" height="34" rx="4" strokeWidth="2.5" />
    <path d="M22,22 L22,14 Q22,8 28,8 L36,8 Q42,8 42,14 L42,22" strokeWidth="2.5" />
    <line x1="8" y1="36" x2="56" y2="36" strokeWidth="1.5" />
    <rect x="26" y="30" width="12" height="12" rx="3" strokeWidth="1.5" />
  </Icon>
);

export const GrowIcon = (props) => (
  <Icon {...props}>
    <path d="M32,58 L32,26" strokeWidth="2.5" />
    <path d="M32,34 Q20,28 14,14 Q26,18 32,30" strokeWidth="2.5" />
    <path d="M32,24 Q44,16 50,4 Q40,10 32,22" strokeWidth="2.5" />
  </Icon>
);

export const ShipIcon = (props) => (
  <Icon {...props}>
    <rect x="8" y="12" width="48" height="44" rx="4" strokeWidth="2.5" />
    <line x1="8" y1="24" x2="56" y2="24" strokeWidth="2" />
    <path d="M32,12 L32,38" strokeWidth="2" />
    <path d="M24,32 L32,22 L40,32" strokeWidth="2" />
  </Icon>
);

export const ThriveIcon = (props) => (
  <Icon {...props}>
    <circle cx="32" cy="32" r="12" strokeWidth="2.5" />
    <line x1="32" y1="8" x2="32" y2="16" strokeWidth="2.5" />
    <line x1="32" y1="48" x2="32" y2="56" strokeWidth="2.5" />
    <line x1="8" y1="32" x2="16" y2="32" strokeWidth="2.5" />
    <line x1="48" y1="32" x2="56" y2="32" strokeWidth="2.5" />
    <line x1="15" y1="15" x2="21" y2="21" strokeWidth="2" />
    <line x1="43" y1="15" x2="49" y2="9" strokeWidth="2" />
    <line x1="15" y1="49" x2="21" y2="43" strokeWidth="2" />
    <line x1="43" y1="43" x2="49" y2="49" strokeWidth="2" />
  </Icon>
);

export const EvolveIcon = (props) => (
  <Icon {...props}>
    <path d="M16,4 Q48,16 48,32 Q48,48 16,60" strokeWidth="2.5" />
    <path d="M48,4 Q16,16 16,32 Q16,48 48,60" strokeWidth="2.5" />
    <line x1="22" y1="12" x2="42" y2="12" strokeWidth="1.5" opacity=".4" />
    <line x1="18" y1="22" x2="46" y2="22" strokeWidth="1.5" opacity=".4" />
    <line x1="18" y1="42" x2="46" y2="42" strokeWidth="1.5" opacity=".4" />
    <line x1="22" y1="52" x2="42" y2="52" strokeWidth="1.5" opacity=".4" />
  </Icon>
);

/** All icons keyed by stage name */
export const stageIcons = {
  attract: AttractIcon,
  select: SelectIcon,
  launch: LaunchIcon,
  equip: EquipIcon,
  grow: GrowIcon,
  ship: ShipIcon,
  thrive: ThriveIcon,
  evolve: EvolveIcon,
};

/** Convenience component: <StageIcon stage="attract" size={32} /> */
export const StageIcon = ({ stage, ...props }) => {
  const Comp = stageIcons[stage?.toLowerCase()];
  if (!Comp) return null;
  return <Comp {...props} />;
};

export default StageIcon;
