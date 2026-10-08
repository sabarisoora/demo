import "server-only";
import { actionEmail, requestOrigin, sendEmail } from "./email";
import { createToken } from "./tokens";
import { site } from "./site";

export async function sendVerificationEmail(user: { id: string; email: string; name: string }) {
  const token = await createToken(user.id, "verify", 60 * 24 * 7);
  const url = `${await requestOrigin()}/verify-email?token=${token}`;
  const first = user.name.split(" ")[0] || "there";
  return sendEmail({
    to: user.email,
    subject: `Confirm your email for ${site.name}`,
    ...actionEmail({
      greeting: `Hi ${first},`,
      body: `Welcome to ${site.name}! Confirm your email so you can reset your password if you ever need to, and so Elite purchases link to your account.`,
      action: "Confirm my email",
      url,
      footer: "This link works for 7 days. If you didn't create an account, you can ignore this email.",
    }),
  });
}

export async function sendPasswordResetEmail(user: { id: string; email: string; name: string }) {
  const token = await createToken(user.id, "reset", 60);
  const url = `${await requestOrigin()}/reset-password?token=${token}`;
  const first = user.name.split(" ")[0] || "there";
  return sendEmail({
    to: user.email,
    subject: `Reset your ${site.name} password`,
    ...actionEmail({
      greeting: `Hi ${first},`,
      body: "Someone (hopefully you) asked to reset your password. Click below to choose a new one.",
      action: "Choose a new password",
      url,
      footer: "This link works for 1 hour and can be used once. If you didn't ask for this, ignore this email; your password won't change.",
    }),
  });
}
