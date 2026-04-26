import nodemailer from "nodemailer";

function readBool(value: string | undefined, fallback: boolean): boolean {
  if (!value) return fallback;
  const normalized = value.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes";
}

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required SMTP environment variable: ${name}`);
  }
  return value;
}

function createTransport() {
  const host = requiredEnv("SMTP_HOST");
  const port = Number(process.env.SMTP_PORT ?? "587");
  if (!Number.isFinite(port) || port <= 0) {
    throw new Error("SMTP_PORT must be a valid positive number");
  }
  const secure = readBool(process.env.SMTP_SECURE, port === 465);
  const user = requiredEnv("SMTP_USER");
  const pass = requiredEnv("SMTP_PASS");
  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

function fromAddress(): string {
  const senderEmail =
    process.env.SMTP_FROM?.trim() ||
    process.env.SENDER_EMAIL?.trim() ||
    process.env.SMTP_USER?.trim() ||
    "no-reply@nepalix.vercel.app";
  const senderName = process.env.SENDER_NAME?.trim();
  return senderName ? `${senderName} <${senderEmail}>` : senderEmail;
}

export async function sendVerificationCodeEmail(input: {
  to: string;
  firstName: string;
  code: string;
}) {
  const transport = createTransport();
  const from = fromAddress();
  const subject = "Your Nepalix verification code";
  const text = [
    `Hi ${input.firstName},`,
    "",
    `Your Nepalix verification code is: ${input.code}`,
    "",
    "This code expires in 10 minutes.",
    "If you did not request this, you can ignore this email.",
  ].join("\n");

  const html = `
    <div style="font-family: Inter, Arial, sans-serif; line-height: 1.5; color: #111827;">
      <p>Hi ${input.firstName},</p>
      <p>Your Nepalix verification code is:</p>
      <p style="font-size: 28px; font-weight: 700; letter-spacing: 4px; margin: 12px 0;">${input.code}</p>
      <p>This code expires in <strong>10 minutes</strong>.</p>
      <p>If you did not request this, you can ignore this email.</p>
    </div>
  `;

  await transport.sendMail({
    from,
    to: input.to,
    subject,
    text,
    html,
  });
}

