import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Send to Telegram if configured
    const botToken = process.env.TELEGRAM_BOT_TOKEN || '8911657570:AAFWxe-YxlJdFG51Htj8G0QG-dh7ym2R1Ow';
    const chatId = process.env.TELEGRAM_CHAT_ID || '897896458';

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

    // Send automated email via Resend if email is provided
    const resendApiKey = process.env.RESEND_API_KEY || 're_7DMgvNYt_8HsX8iSDcYW7Qb39Z97p2w8w';
    const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';
    
    if (resendApiKey && body.email) {
      const emailHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4f46e5;">Welcome to the Future of Content Creation! 🤖</h2>
          <p style="color: #334155; font-size: 16px; line-height: 1.5;">
            Hi ${body.name ? body.name.split(' ')[0] : 'there'},
          </p>
          <p style="color: #334155; font-size: 16px; line-height: 1.5;">
            Thank you so much for taking the time to share your workflow with us. Your insights on social media management are incredibly valuable and will directly shape the AI automation tools we are building.
          </p>
          ${body.wantsEarlyAccess === "Yes" ? `
          <p style="color: #334155; font-size: 16px; line-height: 1.5;">
            Since you requested early access, we've officially added you to our priority waitlist! You'll be one of the very first to test the platform when we launch.
          </p>` : ''}
          <p style="color: #334155; font-size: 16px; line-height: 1.5; margin-top: 32px;">
            Best regards,<br>
            <strong>The AI Social Media Team</strong>
          </p>
        </div>
      `;

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: `AI Content Platform <${fromEmail}>`,
          to: body.email,
          subject: 'Thank you for shaping the future of AI social media!',
          html: emailHtml
        })
      }).catch(err => console.error("Failed to send automated email:", err));
    }

    return NextResponse.json({ success: true, id: "recorded" });
  } catch (error: any) {
    console.error("Survey submission error:", error);
    return NextResponse.json(
      { success: false, error: 'Failed to save survey response' },
      { status: 500 }
    );
  }
}
