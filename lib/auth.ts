
import { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import nodemailer from "nodemailer";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma as any),
  providers: [

    // 1) Email magic link
    EmailProvider({
      maxAge: 10 * 60, // 10 minutes
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),

        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASS,
        },
        tls: {
          rejectUnauthorized: false,
        },
      },
      from: process.env.EMAIL_FROM,

      async sendVerificationRequest({ identifier, url, provider }) {
        const { host } = new URL(url);
        const transportOptions =
          typeof provider.server === "string" ? provider.server : provider.server;
        const transporter = nodemailer.createTransport(transportOptions);

        const appName = "Terriva";
        const from = provider.from || `Terriva <${process.env.EMAIL_FROM}>`;

        const emailHtml = `
         <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${appName} Login</title>
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
      .cta { display:inline-block; background:#00adb5; color:#ffffff; text-decoration:none; padding:14px 26px; border-radius:10px; font-weight:700; font-size:16px; box-shadow:0 6px 18px rgba(0,173,181,0.18); }
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
            <div>
              <div class="brand-name">${appName} by SkyBee</div>
              <div class="tagline">Your Insights, Only Yours</div>
            </div>
          </div>
        </div>

        <div class="content">
          <p class="greeting">Dear User,</p>

          <p class="message">
            Click the button below to easily login to <strong>${appName}</strong>.
            <br></br>
            This link will automatically log you in and it expires in 10 minutes.
          </p>

          <div class="cta-wrap">
            <a class="cta" href="${url}">Login to ${appName}</a>
          </div>

          <p class="note">If the button doesn't work,just copy and paste the following link into your browser:</p>

          <div class="fallback">${url}</div>

          <p style="margin-top:20px;" class="muted">
            If you didn’t request this link, you can safely ignore this email.
          </p>
        </div>

        <div class="footer">
          <div>Automatically sent by Team ${appName}</div>
          <div style="margin-top:8px;">
            <a href="https://www.instagram.com/weareskybee/" target="_blank">Follow us @weareskybee</a>
          </div>
          <div style="margin-top:8px;" class="muted">© ${new Date().getFullYear()} ${appName}, A SkyBee Product</div>
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
          subject: `${appName}'s Login Link`,
          text: emailText,
          html: emailHtml,
        });
        try {
          await prisma.verificationToken.deleteMany({
            where: {
              expires: { lt: new Date() },
            },
          });
        } catch (err) {
          console.error("Failed to delete expired verification tokens:", err);
        }
      },
    }),


    // 2) Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  pages: {
    signIn: "/login",
    verifyRequest: "/check-email",
  },

  session: {
    strategy: "jwt",
  },

  cookies: {
    state: {
      name: `next-auth.state`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
    callbacks: {
      async session({ session, token }) {
        if (session.user && token.sub) {
          session.user.id = token.sub // ✅ ALWAYS EXISTS
        }
        return session
      },
    },

  };