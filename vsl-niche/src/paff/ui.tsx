import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { F, inn, li, ls, MX, out, P, SCENES, sceneStart, SH } from "../pure/lib";
import { Logo } from "../pure/ui";
export * from "../pure/ui";

const SECTION: Record<string, string> = {
  open: "Affiliate program", what: "The product", problem: "The problem it solves", why: "Why it's easy to promote", money: "The commission",
  how: "How it works", kit: "The niche kits", master: "The Master Kit", launch: "Your first week", rules: "The rules", faq: "Honest answers", cta: "Next step",
};
/** wordmark top-left, chapter name top-right; fades out for the closing card */
export const AChrome: React.FC = () => {
  const fr = useCurrentFrame();
  const cur = SCENES.reduce((a, s, k) => (fr >= sceneStart(s) ? k : a), 0);
  const sc = SCENES[cur];
  const sw = inn(fr, sceneStart(sc) + 4, 16);
  const vis = inn(fr, 4, 20) * (1 - out(fr, ls(li("ProfitIQS. Real products")) - 20, 12));
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <div style={{ position: "absolute", left: MX, top: 60, display: "flex", alignItems: "center", gap: 12 }}>
        <Logo size={32} />
        <div style={{ fontFamily: F.sans, fontWeight: 600, fontSize: 26, letterSpacing: "-0.04em", color: P.ink }}>ProfitIQS</div>
        <div style={{ fontFamily: F.sans, fontWeight: 500, fontSize: 22, color: P.grey, marginLeft: 6 }}>Affiliates</div>
      </div>
      <div style={{ position: "absolute", right: MX, top: 64, fontFamily: F.sans, fontWeight: 500, fontSize: 24, color: P.grey, opacity: sw, filter: sw < 1 ? `blur(${(1 - sw) * 8}px)` : undefined }}>
        {String(cur + 1).padStart(2, "0")} · {SECTION[sc]}
      </div>
    </AbsoluteFill>
  );
};

/** a real kit graphic, with a soft shadow */
export const KitImg: React.FC<{ src: string; width: number; ratio: number; style?: React.CSSProperties; radius?: number }> = ({ src, width, ratio, style, radius = 14 }) => (
  <Img src={staticFile(`kit/${src}`)} style={{ width, height: Math.round(width * ratio), display: "block", borderRadius: radius, boxShadow: SH.card, ...style }} />
);

/** a rounded tile; dark when active */
export const Tile: React.FC<{ w: number; h: number; dark?: boolean; children: React.ReactNode; style?: React.CSSProperties; pad?: number }> = ({ w, h, dark, children, style, pad = 40 }) => (
  <div style={{ position: "relative", width: w, height: h, borderRadius: 36, background: dark ? P.ink : P.tile, boxShadow: dark ? SH.deep : "none", padding: pad, boxSizing: "border-box", overflow: "hidden", color: dark ? "#FFFFFF" : P.ink, ...style }}>{children}</div>
);
export const TTitle: React.FC<{ children: React.ReactNode; size?: number; dark?: boolean }> = ({ children, size = 40, dark }) => (
  <div style={{ fontFamily: F.sans, fontWeight: 600, fontSize: size, letterSpacing: "-0.035em", lineHeight: 1.06, color: dark ? "#FFFFFF" : P.ink }}>{children}</div>
);
export const TSub: React.FC<{ children: React.ReactNode; dark?: boolean; size?: number }> = ({ children, dark, size = 25 }) => (
  <div style={{ fontFamily: F.sans, fontWeight: 500, fontSize: size, color: dark ? "#A1A1A6" : P.grey, marginTop: 10, lineHeight: 1.25 }}>{children}</div>
);
/** white card with a hairline ring */
export const Card: React.FC<{ w: number; h: number; children: React.ReactNode; style?: React.CSSProperties; pad?: number }> = ({ w, h, children, style, pad = 44 }) => (
  <div style={{ width: w, height: h, borderRadius: 40, background: "#FFFFFF", boxShadow: `${SH.card}, 0 0 0 1px rgba(0,0,0,0.05)`, padding: pad, boxSizing: "border-box", position: "relative", ...style }}>{children}</div>
);
