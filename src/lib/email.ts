import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

interface Resident {
  name: string;
  email: string;
}

interface Complaint {
  id: string;
  category: string;
}

interface Notice {
  title: string;
  body: string;
}

async function getTransporter() {
  if (!process.env.SMTP_HOST) {
    return null;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,

    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },

    tls: {
      rejectUnauthorized: false,
    },
  });

  await transporter.verify();

  return transporter;
}

function emailLayout(title: string, content: string) {
  return `
  <!DOCTYPE html>
  <html>

  <head>
    <meta charset="UTF-8" />
    <style>
      body{
        margin:0;
        padding:0;
        background:#f8fafc;
        font-family:Arial,Helvetica,sans-serif;
      }

      .container{
        max-width:600px;
        margin:30px auto;
        background:white;
        border-radius:12px;
        overflow:hidden;
        border:1px solid #e5e7eb;
      }

      .header{
        background:#2563eb;
        color:white;
        padding:20px;
        text-align:center;
      }

      .content{
        padding:30px;
        color:#374151;
        line-height:1.7;
      }

      .footer{
        background:#f1f5f9;
        padding:15px;
        text-align:center;
        color:#64748b;
        font-size:13px;
      }

      .badge{
        display:inline-block;
        background:#2563eb;
        color:white;
        padding:6px 14px;
        border-radius:30px;
        font-size:13px;
        margin:10px 0;
      }

      .button{
        display:inline-block;
        margin-top:20px;
        padding:12px 22px;
        background:#2563eb;
        color:white !important;
        text-decoration:none;
        border-radius:8px;
      }
    </style>
  </head>

  <body>

    <div class="container">

      <div class="header">
        <h2>🏢 Society Maintenance Tracker</h2>
      </div>

      <div class="content">
        <h3>${title}</h3>

        ${content}
      </div>

      <div class="footer">
        This is an automated email from
        <strong>Society Maintenance Tracker</strong>.
        <br/>
        Please do not reply directly to this email.
      </div>

    </div>

  </body>

  </html>
  `;
}

export async function sendEmail({
  to,
  subject,
  html,
}: EmailOptions) {
  try {
    const transporter = await getTransporter();

    if (!transporter) {
      console.log(
        "----------- EMAIL (SMTP NOT CONFIGURED) -----------"
      );
      console.log("To:", to);
      console.log("Subject:", subject);
      console.log(html);
      console.log("-----------------------------------------------");

      return {
        simulated: true,
      };
    }

    console.log("📧 Sending email...");
    console.log("To:", to);
    console.log("Subject:", subject);

    const info = await transporter.sendMail({
      from:
        process.env.SMTP_FROM ||
        "Society Maintenance Tracker <no-reply@society.com>",
      to,
      subject,
      html,
    });

    console.log("✅ Email sent successfully!");
    console.log("📨 Message ID:", info.messageId);
    console.log("📨 Accepted:", info.accepted);
    console.log("📨 Rejected:", info.rejected);
    console.log("📨 Response:", info.response);

    return info;
  } catch (err) {
    console.error("❌ EMAIL ERROR");
    console.error(err);

    return {
      error:
        err instanceof Error
          ? err.message
          : "Unknown email error",
    };
  }
}
export async function sendStatusChangeEmail(
  resident: Resident,
  complaint: Complaint,
  newStatus: string,
  note?: string
) {
  const html = emailLayout(
    "Complaint Status Updated",
    `
      <p>Hello <strong>${resident.name}</strong>,</p>

      <p>Your complaint has been updated.</p>

      <p>
        <strong>Complaint ID:</strong>
        ${complaint.id.slice(-6)}
      </p>

      <p>
        <strong>Category:</strong>
        ${complaint.category}
      </p>

      <p>
        <strong>Current Status:</strong>
      </p>

      <div class="badge">
        ${newStatus.replace("_", " ")}
      </div>

      ${
        note
          ? `<p><strong>Admin Note:</strong><br/>${note}</p>`
          : ""
      }

      <p>
        Please login to the Society Maintenance Tracker
        for complete details.
      </p>
    `
  );

  return sendEmail({
    to: resident.email,
    subject: `Complaint #${complaint.id.slice(
      -6
    )} Status Updated`,
    html,
  });
}

export async function sendImportantNoticeEmail(
  residents: Resident[],
  notice: Notice
) {
  return Promise.all(
    residents.map((resident) => {
      const html = emailLayout(
        "Important Society Notice",
        `
          <p>Hello <strong>${resident.name}</strong>,</p>

          <div class="badge">
            IMPORTANT NOTICE
          </div>

          <h3>${notice.title}</h3>

          <p>${notice.body}</p>

          <p>
            Please login to the Society Maintenance
            Tracker for more information.
          </p>
        `
      );

      return sendEmail({
        to: resident.email,
        subject: `Important Notice: ${notice.title}`,
        html,
      });
    })
  );
}


export async function sendPasswordResetOTPEmail(
  email: string,
  name: string,
  otp: string
) {
  const html = emailLayout(
    "Password Reset Request",
    `
      <p>Hello <strong>${name}</strong>,</p>

      <p>
        We received a request to reset your password for your
        <strong>Society Maintenance Tracker</strong> account.
      </p>

      <p>Your One-Time Password (OTP) is:</p>

      <div class="badge" style="font-size:24px;letter-spacing:4px;">
        ${otp}
      </div>

      <p>
        This OTP is valid for
        <strong>10 minutes</strong>.
      </p>

      <p>
        If you did not request a password reset,
        you can safely ignore this email.
      </p>
    `
  );

  return sendEmail({
    to: email,
    subject: "Password Reset OTP",
    html,
  });
}