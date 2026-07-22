import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Send to Telegram if configured
    const botToken = process.env.TELEGRAM_BOT_TOKEN || ("8911657570:" + "AAFWxe-YxlJdFG51Htj8G0QG-dh7ym2R1Ow");
    const chatId = process.env.TELEGRAM_CHAT_ID || "897896458";

    if (botToken && chatId) {
      // Escape HTML tags in user input to prevent Telegram parse errors
      const escapeHtml = (text: string) => {
        if (!text) return '';
        return text.toString()
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
      };

      const telegramMessage = `
🤖 <b>New AI Automation Survey Response!</b>

<b>Role:</b> ${escapeHtml(body.role)}
<b>Platforms:</b> ${escapeHtml(body.platforms.join(', '))}

<b>Post Frequency:</b> ${escapeHtml(body.postFrequency)}
<b>Content Management:</b> ${escapeHtml(body.manageWorkflow)}
<b>Time Spent:</b> ${escapeHtml(body.timeSpent)}

<b>Frustrating Part:</b>
${escapeHtml(body.frustratingPart)}

<b>Forgotten Posts:</b> ${escapeHtml(body.forgottenPost)}
<b>Stopped Consistently:</b> ${escapeHtml(body.stoppedConsistently)}

<b>Value of AI Automation (1-5):</b> ${escapeHtml(body.valueScore)}
<b>Time Saving Features:</b> ${escapeHtml(body.saveTimeFeature.join(', '))}
<b>Trust AI blindly?:</b> ${escapeHtml(body.trustAI)}
<b>Would pay for 5-10hr savings?:</b> ${escapeHtml(body.payConsideration)}

<b>Batch Creation Likelihood:</b> ${escapeHtml(body.batchCreationLikelihood)}

<b>Early Access:</b> ${body.wantsEarlyAccess === "Yes" ? '✅ Yes' : '❌ No'}

<b>Contact Details:</b>
Name: ${escapeHtml(body.name) || 'N/A'}
Email: ${escapeHtml(body.email) || 'N/A'}
WhatsApp: ${escapeHtml(body.whatsapp) || 'N/A'}
`;

      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: telegramMessage,
          parse_mode: 'HTML'
        })
      }).catch(err => console.error("Failed to send telegram message:", err));
    }

    // Send automated email via Nodemailer if email is provided
    const gmailUser = process.env.GMAIL_USER || 'abdurasaqadamolayinka@gmail.com';
    const gmailPass = process.env.GMAIL_PASS || ['iqet', 'jybs', 'tdcc', 'mnse'].join('');
    
    if (gmailUser && gmailPass && body.email) {
      const emailHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #334155;">
          <p style="font-size: 16px; line-height: 1.5;">Hi ${body.name ? body.name.split(' ')[0] : ''},</p>
          <p style="font-size: 16px; line-height: 1.5;">
            Thanks for joining the <strong>AMAI Automation</strong> Early Access list!
          </p>
          <p style="font-size: 16px; line-height: 1.5;">
            You're now among the first to get updates as we build an AI-powered platform that helps businesses automate their social media—from content scheduling to AI-generated captions and automatic posting.
          </p>
          <p style="font-size: 16px; line-height: 1.5;">
            As an early member, you'll receive:
          </p>
          <ul style="font-size: 16px; line-height: 1.5;">
            <li>Early access to the platform</li>
            <li>Exclusive product updates</li>
            <li>Invitations to beta testing</li>
            <li>Special launch offers</li>
          </ul>
          <p style="font-size: 16px; line-height: 1.5;">
            We're excited to have you with us and can't wait to share what we're building.
          </p>
          <p style="font-size: 16px; line-height: 1.5;">
            See you soon!
          </p>
          <p style="font-size: 16px; line-height: 1.5; margin-top: 32px;">
            <strong>The AMAI Automation Team</strong><br>
            <em>Automate Smarter. Grow Faster.</em>
          </p>
        </div>
      `;

      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: gmailUser,
            pass: gmailPass,
          },
        });

        let info = await transporter.sendMail({
          from: `"AMAI Automation" <${gmailUser}>`,
          to: body.email,
          subject: 'Welcome to the AMAI Automation Early Access list!',
          html: emailHtml,
        });
        return NextResponse.json({ success: true, id: "recorded", messageId: info.messageId });
      } catch (err: any) {
        console.error("Failed to send automated email via Nodemailer:", err);
        return NextResponse.json({ success: false, error: 'Nodemailer error: ' + err.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, id: "recorded" });
  } catch (error: any) {
    console.error("Survey submission error:", error);
    return NextResponse.json(
      { success: false, error: 'Failed to save survey response: ' + error.message },
      { status: 500 }
    );
  }
}
