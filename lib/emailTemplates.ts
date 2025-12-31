export function periodReminderEmail({
  name,
  daysLeft,
}: {
  name: string;
  daysLeft: number;
}) {

  const appName = "Terriva";
  return `
  

         <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${appName} · Period Reminder</title>
    <style>
      body { margin:0; padding:0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; background:#f4f6f8; color:#1a202c; }
      .container { max-width:680px; margin:0 auto; padding:24px; text-align:center}
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
  <span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;">
  Your period may start in ${daysLeft} day${daysLeft > 1 ? "s" : ""}. A gentle reminder from ${appName}.
</span>

    <div class="container flex justify-content-center">
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
          <p class="greeting">Hi ${name?.split(" ")[0] || "there"},</p>

          <p class="message">
        Your next period is expected in 
        <strong>${daysLeft} day${daysLeft > 1 ? "s" : ""}</strong>.
      </p>

      <p class="message" style="font-size: 12px; color: #374151; margin-bottom: 24px;">
        Take care, stay hydrated, and listen to your body <span role="img" aria-label="heart">🤍</span>

      </p>

      <div class="cta-wrap">
  <a class="cta" href="https://terriva.vercel.app">
    Open ${appName}
  </a>
</div>

<p class="note ">
  Log your cycles to keep insights accurate.
</p>

      <p style="font-size: 12px; color: #666">
        This is a gentle reminder, not medical advice.
      </p>
        </div>
        <div class="footer">
        <div style="margin:4px;">
  <a href="https://terriva.vercel.app/dashboard">
    Manage email preferences
  </a>
</div>

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
}