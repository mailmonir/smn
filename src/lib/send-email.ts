import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface Props {
  to: string;
  subject: string;
  text: string;
}

export async function sendEmail({ to, subject, text }: Props) {
  try {
    await resend.emails.send({
      from: "Smart School <info@loopdotbag.com>", // Must be a verified sender
      to: [to],
      subject,
      html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>${subject}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #ffffff';
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 30px auto;
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }
          .header {
            background: #efb100;
            color: #ffffff;
            padding: 20px;
            text-align: center;
            font-size: 24px;
          }
          .content {
            padding: 20px;
            color: #333333;
            line-height: 1.5;
          }
          .footer {
            text-align: center;
            font-size: 12px;
            color: #777777;
            padding: 15px;
            background: #f9f9f9;
          }
          a.button {
            display: inline-block;
            margin-top: 15px;
            padding: 10px 20px;
            background: #efb100;
            color: #ffffff;
            text-decoration: none;
            border-radius: 4px;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            Smart School
          </div>
          <div class="content">
            <h2>${subject}</h2>
            <p>${text}</p>
            <a href="${
              process.env.NEXT_PUBLIC_SITE_URL
            }" class="button">Visit Website</a>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Smart School. All rights reserved.
          </div>
        </div>
      </body>
      </html>
      `,
    });
  } catch (error) {
    console.error("Email send error:", error);
  }
}
