import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
}

const base = (size: number, className?: string) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  className,
  'aria-hidden': true as const,
});

export function IconMenu({ size = 20, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

export function IconClose({ size = 18, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export function IconSearch({ size = 17, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export function IconUser({ size = 18, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20a8 8 0 0 1 16 0" />
    </svg>
  );
}

export function IconBag({ size = 19, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M6 7h12l1 13H5L6 7Z" />
      <path d="M9 7V5a3 3 0 0 1 6 0v2" />
    </svg>
  );
}

export function IconLoom({ size = 22, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M4 7h16M4 12h16M4 17h16" />
      <path d="M8 4v16M16 4v16" />
    </svg>
  );
}

export function IconTruck({ size = 22, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M3 6h11v10H3zM14 9h4l3 3v4h-7V9z" />
      <circle cx="7.5" cy="17.5" r="1.5" />
      <circle cx="17.5" cy="17.5" r="1.5" />
    </svg>
  );
}

export function IconWallet({ size = 22, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <rect x="3" y="6" width="18" height="13" rx="2" />
      <path d="M16 12h5v3h-5a1.5 1.5 0 0 1 0-3Z" />
      <path d="M6 6V5a2 2 0 0 1 2-2h9" />
    </svg>
  );
}

export function IconMail({ size = 20, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

export function IconCheck({ size = 20, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="m5 13 4 4L19 7" />
    </svg>
  );
}

export function IconSparkle({ size = 15, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="m12 3 1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3Z" />
    </svg>
  );
}

export function IconChart({ size = 18, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M4 19h16M7 16v-5M12 16V7M17 16v-8" />
    </svg>
  );
}

export function IconBox({ size = 18, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M12 3 3 7.5v9L12 21l9-4.5v-9L12 3Z" />
      <path d="M3 7.5 12 12l9-4.5M12 12v9" />
    </svg>
  );
}

export function IconTag({ size = 18, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M12 3H5a2 2 0 0 0-2 2v7l8.5 8.5a2 2 0 0 0 2.8 0l5.2-5.2a2 2 0 0 0 0-2.8L12 3Z" />
      <circle cx="7.5" cy="7.5" r="1" fill="currentColor" />
    </svg>
  );
}

export function IconUsers({ size = 18, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 19a6.5 6.5 0 0 1 13 0" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M17.5 13.5A5 5 0 0 1 22 19" />
    </svg>
  );
}

export function IconSettings({ size = 18, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.4 1Z" />
    </svg>
  );
}

export function IconGlobe({ size = 18, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </svg>
  );
}

export function IconLogout({ size = 18, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5M21 12H9" />
    </svg>
  );
}

export function IconAlert({ size = 17, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4M12 17h.01" />
    </svg>
  );
}

export function IconAward({ size = 17, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <circle cx="12" cy="9" r="6" />
      <path d="M8.5 14.5 7 21l5-2.5L17 21l-1.5-6.5" />
    </svg>
  );
}

export function IconStar({ size = 13, className }: IconProps) {
  return (
    <svg {...base(size, className)} fill="currentColor">
      <path d="m12 2.5 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.3l-5.8 3.1 1.1-6.5L2.6 9.3l6.5-.9L12 2.5Z" />
    </svg>
  );
}

export function IconChevronDown({ size = 16, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
