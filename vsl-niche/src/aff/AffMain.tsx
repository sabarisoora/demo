import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/700.css";
import "@fontsource/unbounded/700.css";
import "@fontsource/unbounded/900.css";
import "@fontsource/jetbrains-mono/700.css";
import "@fontsource/anton/400.css";
import React, { useEffect, useState } from "react";
import { AbsoluteFill, Audio, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import { lio, LINES, sceneEnd, sceneStart, SCENES } from "../home/lib";
import { Bg, Cam, Captions, MARK, Wipes } from "../home/ui";
import { ChapterCards, Open, Problem, Rail, What, Why } from "./A1";
import { Cta, Email, Faq, How, Kit, Launch, Master, Money, Rules } from "./A2";

const ACC: [string, string][] = [
  ["If you've ever", "problem"], ["Half the offers", "hype"], ["This is the opposite", "opposite"], ["A real product", "real|kit"], ["Let me open", "box"],
  ["ProfitIQS makes", "excel|industry"], ["Every product is", "built"], ["The owner enters", "rest"], ["It ships with", "works"], ["And every edition", "quick|field"],
  ["Essential is", "ninety-seven|forty-nine"], ["One payment", "subscription"], ["Here's why owners", "want"], ["Small-business owners", "kept"], ["The data exists", "one|place"],
  ["That's the pattern", "twenty-one|real"], ["Which matters to you", "scrolling"], ["Four things make", "four"], ["One: every product", "one"], ["Two: three price", "honestly"],
  ["Three: it's a one-time", "easy"], ["And four: the sample", "day"], ["And every kit tells", "who"], ["Now, the commission", "commission"], ["From the seventeenth of October", "ninety"],
  ["From the seventeenth of January", "eighty-five"], ["And from the seventeenth of April", "eighty"], ["These rates are set", "manually"], ["To put that in", "illustration"],
  ["At ninety percent", "eighty-seven|seventy-seven|twenty-four"], ["But that's an illustration", "not"], ["No earnings are promised", "no"], ["How it works is simple", "simple"],
  ["You promote", "own"], ["A customer buys", "buys"], ["Digistore24 records", "credits"], ["And you see clicks", "see"], ["And here's the good news", "approved"],
  ["Now the part most", "complete"], ["Every fact in it", "verified"], ["Each kit has the product", "real"], ["A tier comparison", "honestly"], ["Thirty short-form", "thirty"],
  ["Ten full video", "ten"], ["A full social-media", "five"], ["Five email swipes", "five"], ["An eight-email", "eight-email"], ["Ready-to-paste", "meta"],
  ["Ten ready-made", "ten"], ["An audience and", "honest"], ["And a publishing", "checklist"], ["On top of that", "master"], ["The commission guide", "every"],
  ["Here's how to launch", "launch"], ["Pick the niche your", "honest"], ["There are twenty-one", "twenty-one"], ["Read that niche", "tier"], ["Pick your hooks", "graphics"],
  ["Sign in to Digistore24", "link"], ["Check the page", "match"], ["Test your link", "once"], ["Then publish", "disclosure"], ["And check your clicks", "weekly"],
  ["If you use email", "two"], ["Your own list gets", "opted"], ["Cold outreach to", "own"], ["Plus the legal", "opt-out"], ["And the rules that", "rules"],
  ["Disclose clearly", "disclose"], ["Describe the product", "honestly"], ["No fake reviews", "no"], ["No spam", "no"], ["No discounts", "approved"], ["And no claims", "fine"],
  ["If you're ever unsure", "ask"], ["A few honest answers", "honest"], ["Is the ninety percent", "no"], ["Is it approved", "yes"], ["Can I offer", "only"],
  ["And who looks after", "support"], ["So here's your next", "next"], ["Ask the ProfitIQS team", "affiliate"], ["Pick your niche", "stand"], ["ProfitIQS. Real products", "honest"],
];
ACC.forEach(([p, m]) => { const i = lio(p); if (i >= 0) MARK[i] = m; });
const CAP = new Set(["So a plumber", "ProfitIQS gives him a Callback", "A restaurant owner", "ProfitIQS gives her", "A landlord", "ProfitIQS gives him cap", "A dental practice", "ProfitIQS gives it", "And an owner-operator", "ProfitIQS gives him profit", "Twenty-one industries"].map(lio).filter((i) => i >= 0));

const useFonts = () => {
  const [h] = useState(() => delayRender("fonts"));
  useEffect(() => { Promise.all(["700 40px 'Space Grotesk'", "500 40px 'Space Grotesk'", "900 40px Unbounded", "700 40px Unbounded", "700 40px 'JetBrains Mono'", "400 40px Anton"].map((x) => document.fonts.load(x))).then(() => continueRender(h)); }, [h]);
};
const Only: React.FC<{ s: string; children: React.ReactNode }> = ({ s, children }) => {
  const fr = useCurrentFrame();
  if (!SCENES.includes(s)) return null;
  if (fr < sceneStart(s) - 30 || fr > sceneEnd(s) + 30) return null;
  return <>{children}</>;
};
export const Aff: React.FC<{ audio?: boolean }> = ({ audio = true }) => {
  useFonts();
  const fr = useCurrentFrame();
  const li_ = LINES.findIndex((l) => fr >= Math.round(l.start * 30) - 3 && fr <= Math.round(l.end * 30) + 8);
  return (
    <AbsoluteFill style={{ background: "#FFFFFF" }}>
      <Bg />
      <Cam>
      <Only s="open"><Open /></Only>
      <Only s="what"><What /></Only>
      <Only s="problem"><Problem /></Only>
      <Only s="why"><Why /></Only>
      <Only s="money"><Money /></Only>
      <Only s="how"><How /></Only>
      <Only s="kit"><Kit /></Only>
      <Only s="master"><Master /></Only>
      <Only s="launch"><Launch /></Only>
      <Only s="email"><Email /></Only>
      <Only s="rules"><Rules /></Only>
      <Only s="faq"><Faq /></Only>
      <Only s="cta"><Cta /></Only>
      <Rail />
      <ChapterCards />
      </Cam>
      <Wipes />
      {li_ >= 0 && CAP.has(li_) && <Captions />}
      {audio && <Audio src={staticFile("mix.wav")} />}
    </AbsoluteFill>
  );
};
