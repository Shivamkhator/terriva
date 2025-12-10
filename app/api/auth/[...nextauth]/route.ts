import NextAuth, { type NextAuthOptions } from "next-auth";
import Google from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import nodemailer from "nodemailer";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";


export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [

    // 1) Email magic link
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),

        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASS,
        },
      },
      from: process.env.EMAIL_FROM,

      async sendVerificationRequest({ identifier, url, provider }) {
        const { host } = new URL(url);
        const transportOptions =
          typeof provider.server === "string" ? provider.server : provider.server;
        const transporter = nodemailer.createTransport(transportOptions);

        // Branding
        const logoUrl = `https://skybee.vercel.app/SkyBee.png?v=${Date.now()}`;
        const appName = "Terriva";
        const from = provider.from || `Terriva <${process.env.EMAIL_FROM}>`;

        const emailHtml = `
         <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${appName} Sign-in</title>
    <style>
      body { margin:0; padding:0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; background:#f4f6f8; color:#1a202c; }
      .container { max-width:680px; margin:0 auto; padding:24px; }
      .card { background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 6px 24px rgba(11,22,39,0.06); }
      .header { background:#052b33; padding:28px 24px; text-align:center; color:#fff; }
      .brand { display:inline-flex; align-items:center; gap:12px; }
      .brand-name { font-size:22px; font-weight:700; letter-spacing:-0.4px; color:#ffffff; }
      .logo { width:56px; height:auto; border-radius:8px; object-fit:contain; filter: none; }
      .tagline { color:#cfecec; margin-top:6px; font-size:13px; font-weight:500; font-style:italic; }
      .content { padding:28px; }
      .greeting { font-size:18px; font-weight:600; margin:0 0 8px 0; color:#0f1724; }
      .message { font-size:15px; color:#374151; margin:0 0 20px 0; line-height:1.5; }
      .cta-wrap { text-align:center; margin:24px 0; }
      .cta { display:inline-block; background:#00adb5; color:#fff; text-decoration:none; padding:14px 26px; border-radius:10px; font-weight:700; font-size:16px; box-shadow:0 6px 18px rgba(0,173,181,0.18); }
      .note { font-size:13px; color:#6b7280; margin-top:12px; text-align:center; }
      .fallback { margin-top:18px; font-size:13px; color:#6b7280; word-break:break-all; }
      .footer { background:#041718; padding:20px; text-align:center; color:#94a3b8; font-size:12px; }
      .footer a { color:#ffd966; text-decoration:none; font-weight:600; }
      .muted { color:#94a3b8; font-size:12px; }
      @media (max-width:480px) {
        .container { padding:12px; }
        .content { padding:20px; }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="card">
        <div class="header">
          <div class="brand">
            <img src="${logoUrl}" alt="${appName}" class="logo" />
            <div>
              <div class="brand-name">${appName}</div>
              <div class="tagline">Private, simple menstrual tracking</div>
            </div>
          </div>
        </div>

        <div class="content">
          <p class="greeting">Hi,</p>

          <p class="message">
            Click the button below to sign in to <strong>${appName}</strong>. This link will automatically sign you in and expires in 10 minutes.
          </p>

          <div class="cta-wrap">
            <a class="cta" href="${url}">Sign in to ${appName}</a>
          </div>

          <p class="note">If the button doesn't work, copy and paste the following link into your browser:</p>

          <div class="fallback">${url}</div>

          <p style="margin-top:20px;" class="muted">
            If you didn’t request this link, you can safely ignore this email — no account was created.
          </p>
        </div>

        <div class="footer">
          <div>Automatically sent by ${appName}</div>
          <div style="margin-top:8px;">
            <a href="https://your-terriva-domain.com" target="_blank">Visit ${appName}</a>
          </div>
          <div style="margin-top:8px;" class="muted">© ${new Date().getFullYear()} ${appName}. All rights reserved.</div>
        </div>
      </div>
    </div>
  </body>
  </html>
  `;

        const emailText = `Sign in to ${appName}: ${url}\n\nIf you didn't request this, please ignore this email.`;

        // Send the mail
        await transporter.sendMail({
          to: identifier,
          from,
          subject: `Sign in to ${appName}`,
          text: emailText,
          html: emailHtml,
        });
      },
    }),

    // 2) Google OAuth
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  pages: {
    signIn: "/auth/login",
    verifyRequest: "/auth/check-email",
  },

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async session({ session, token }) {
      if (token?.sub) {
        (session as any).userId = token.sub;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
