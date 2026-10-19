import React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export function DashboardIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" fill="none" {...props}>
      <path d="M140 140H240C250 140 258 148 258 158V258C258 268 250 276 240 276H140C130 276 122 268 122 258V158C122 148 130 140 140 140ZM272 140H372C382 140 390 148 390 158V258C390 268 382 276 372 276H272C262 276 254 268 254 258V158C254 148 262 140 272 140ZM140 290H240C250 290 258 298 258 308V408C258 418 250 426 240 426H140C130 426 122 418 122 408V308C122 298 130 290 140 290ZM272 290H372C382 290 390 298 390 308V408C390 418 382 426 372 426H272C262 426 254 418 254 408V308C254 298 262 290 272 290Z" 
        fill="currentColor" 
      />
    </svg>
  );
}

export function ChartLineIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" fill="none" {...props}>
      <path d="M160 340L220 260L280 300L350 200L330 200L330 220" stroke="currentColor" strokeWidth="32" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  );
}

export function PenTradeIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" fill="none" {...props}>
      <rect x="180" y="140" width="152" height="244" rx="32" stroke="currentColor" strokeWidth="26" fill="none"/>
      <path d="M200 200H312M200 240H312M200 280H260" stroke="currentColor" strokeWidth="26" strokeLinecap="round"/>
    </svg>
  );
}

export function BookPlaybookIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" fill="none" {...props}>
      <rect x="160" y="120" width="196" height="294" rx="20" fill="currentColor" opacity="0.2"/>
      <path d="M200 200H312M200 240H312M200 280H312" stroke="currentColor" strokeWidth="24" strokeLinecap="round"/>
    </svg>
  );
}

export function LibraryJournalIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" fill="none" {...props}>
      <rect x="140" y="130" width="167" height="282" rx="20" fill="currentColor" opacity="0.3"/>
      <rect x="320" y="150" width="58" height="272" rx="10" fill="currentColor" opacity="0.5"/>
    </svg>
  );
}

export function FlameStreakIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" fill="none" {...props}>
      <path d="M256 100C280 100 310 130 320 170C330 210 320 250 300 280C280 310 256 330 256 330C256 330 232 310 212 280C192 250 182 210 192 170C202 130 232 100 256 100Z" 
        fill="currentColor" 
      />
    </svg>
  );
}

export function CalendarReviewIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" fill="none" {...props}>
      <rect x="120" y="160" width="272" height="224" rx="20" fill="currentColor" opacity="0.2"/>
      <path d="M180 140V180M332 140V180" stroke="currentColor" strokeWidth="24" strokeLinecap="round"/>
      <line x1="120" y1="220" x2="392" y2="220" stroke="currentColor" strokeWidth="20"/>
    </svg>
  );
}

export function TrophyAwardsIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" fill="none" {...props}>
      <path d="M190 160L256 120L322 160V230C322 275 293 312 256 330C219 312 190 275 190 230V160Z" 
        fill="currentColor" 
      />
      <path d="M230 250L250 270L290 220" stroke="white" strokeWidth="28" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  );
}

export function WalletAccountsIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" fill="none" {...props}>
      <rect x="160" y="180" width="228" height="188" rx="32" stroke="currentColor" strokeWidth="24" fill="none"/>
      <circle cx="320" cy="274" r="20" fill="currentColor"/>
    </svg>
  );
}

export function ReceiptExpensesIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" fill="none" {...props}>
      <path d="M180 100L256 140L332 100V400L256 360L180 400V100Z" fill="currentColor" opacity="0.2"/>
      <path d="M220 200H292M220 240H292M220 280H260" stroke="currentColor" strokeWidth="22" strokeLinecap="round"/>
    </svg>
  );
}

export function CreditPayoutsIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" fill="none" {...props}>
      <rect x="140" y="200" width="250" height="124" rx="12" stroke="currentColor" strokeWidth="26" fill="none"/>
      <line x1="122" y1="240" x2="390" y2="240" stroke="currentColor" strokeWidth="26"/>
      <line x1="280" y1="280" x2="340" y2="280" stroke="currentColor" strokeWidth="20" strokeLinecap="round"/>
    </svg>
  );
}

export function TargetGoalsIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" fill="none" {...props}>
      <circle cx="256" cy="235" r="105" stroke="currentColor" strokeWidth="28" fill="none"/>
      <circle cx="256" cy="236" r="56" fill="currentColor" opacity="0.3"/>
      <circle cx="256" cy="260" r="40" stroke="currentColor" strokeWidth="28" fill="none"/>
    </svg>
  );
}

export function HeatmapIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" fill="none" {...props}>
      <rect x="140" y="140" width="70" height="70" fill="currentColor" opacity="0.9"/>
      <rect x="230" y="140" width="70" height="70" fill="currentColor" opacity="0.6"/>
      <rect x="320" y="140" width="70" height="70" fill="currentColor" opacity="0.3"/>
      <rect x="140" y="230" width="70" height="70" fill="currentColor" opacity="0.7"/>
      <rect x="230" y="230" width="70" height="70" fill="currentColor" opacity="0.9"/>
      <rect x="320" y="230" width="70" height="70" fill="currentColor" opacity="0.5"/>
      <rect x="140" y="320" width="70" height="70" fill="currentColor" opacity="0.4"/>
      <rect x="230" y="320" width="70" height="70" fill="currentColor" opacity="0.6"/>
      <rect x="320" y="320" width="70" height="70" fill="currentColor" opacity="0.8"/>
    </svg>
  );
}

export function SettingsGearIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" fill="none" {...props}>
      <circle cx="256" cy="184" r="44" fill="currentColor"/>
      <circle cx="256" cy="328" r="44" fill="currentColor"/>
      <circle cx="340" cy="256" r="44" fill="currentColor"/>
      <circle cx="172" cy="256" r="44" fill="currentColor"/>
    </svg>
  );
}
