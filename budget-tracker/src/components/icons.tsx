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

export function TransactionListIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" fill="none" {...props}>
      <rect x="160" y="140" width="228" height="244" rx="32" stroke="currentColor" strokeWidth="22" fill="none"/>
      <path d="M170 200H342M170 250H342M170 300H342M170 350H260" stroke="currentColor" strokeWidth="22" strokeLinecap="round"/>
    </svg>
  );
}

export function BillRecurringIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" fill="none" {...props}>
      <path d="M180 100H332C352 100 368 116 368 136V412L256 360L144 412V136C144 116 160 100 180 100Z" 
        fill="currentColor" 
      />
      <path d="M200 180H312M200 220H312M200 260H260" stroke="white" strokeWidth="24" strokeLinecap="round"/>
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

export function BudgetPlanIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" fill="none" {...props}>
      <circle cx="256" cy="245" r="105" stroke="currentColor" strokeWidth="28" fill="none"/>
      <path d="M256 180L256 245L320 280" stroke="currentColor" strokeWidth="32" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M256 180C256 180 256 175 256 175C256 165 248 157 238 157C228 157 220 165 220 175" stroke="currentColor" strokeWidth="24" strokeLinecap="round"/>
    </svg>
  );
}

export function CategoryTagsIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" fill="none" {...props}>
      <path d="M340 150L390 200L270 320L170 220L220 170L340 150Z" fill="currentColor"/>
      <circle cx="290" cy="200" r="20" fill="white"/>
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

export function WalletAccountsIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" fill="none" {...props}>
      <rect x="160" y="180" width="228" height="188" rx="32" stroke="currentColor" strokeWidth="24" fill="none"/>
      <circle cx="320" cy="274" r="20" fill="currentColor"/>
    </svg>
  );
}
