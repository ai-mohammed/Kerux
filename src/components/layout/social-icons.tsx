import type { SVGProps } from "react";
import { Link2 } from "lucide-react";

/** Brand glyphs drawn in the Lucide grammar (24px grid, 2px round stroke); Lucide ships no brand icons. */
const Glyph = ({ children, ...props }: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
    {children}
  </svg>
);

const Instagram = (props: SVGProps<SVGSVGElement>) => (
  <Glyph {...props}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="3.5" />
    <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" />
  </Glyph>
);

const TikTok = (props: SVGProps<SVGSVGElement>) => (
  <Glyph {...props}>
    <path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5" />
    <path d="M14 3c0 3 2.5 5.5 5.5 5.5" />
  </Glyph>
);

const Facebook = (props: SVGProps<SVGSVGElement>) => (
  <Glyph {...props}>
    <path d="M14 21v-8h3l.5-3.5H14V7.5c0-1 .4-1.5 1.5-1.5H18V3h-3c-3 0-4.5 1.7-4.5 4.5V9.5H8V13h2.5v8" />
  </Glyph>
);

export const SOCIAL_ICONS = { Instagram, TikTok, Facebook, Linktree: Link2 } as const;
