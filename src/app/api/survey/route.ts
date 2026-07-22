import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Send to Telegram if configured
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (botToken && chatId) {
      const telegramMessage = `
🎉 *New Survey Response!*

*Years in Biz:* ${body.yearsInBusiness}
*Accepts Interns:* ${body.acceptsInterns}
*Finding Methods:* ${body.findingMethods.join(', ')}

*Biggest Challenge:*
${body.biggestChallenge}

*Struggled w/ Reliability:* ${body.struggledReliability}
*Would Use Platform:* ${body.wouldUsePlatform}
*Would Pay:* ${body.wouldPay}

*Valuable Features:*
${body.valuableFeatures.join(', ')}

*Improvement Wanted:*
${body.improvement}

*Early Access:* ${body.wantsEarlyAccess ? '✅ Yes' : '❌ No'}
${body.wantsEarlyAccess ? `
*Contact Details:*
Name: ${body.name || 'N/A'}
Email: ${body.email || 'N/A'}
WhatsApp: ${body.whatsapp || 'N/A'}` : ''}
`;

      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: telegramMessage,
          parse_mode: 'Markdown'
        })
      }).catch(err => console.error("Failed to send telegram message:", err));
    }

    // Send automated email via Resend if email is provided
    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';
    
    if (resendApiKey && body.email) {
      const emailHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0f172a;">Thank you for your feedback! 🎉</h2>
          <p style="color: #334155; font-size: 16px; line-height: 1.5;">
            Hi ${body.name ? body.name.split(' ')[0] : 'there'},
          </p>
          <p style="color: #334155; font-size: 16px; line-height: 1.5;">
            We've received your responses to the Fashion Business Internship Survey. Your insights are incredibly valuable and will help us shape a platform that genuinely supports established designers like you.
          </p>
          ${body.wantsEarlyAccess ? `
          <p style="color: #334155; font-size: 16px; line-height: 1.5;">
            Since you requested early access, we've added you to our priority list. We'll reach out to you as soon as we're ready for our beta launch!
          </p>` : ''}
          <p style="color: #334155; font-size: 16px; line-height: 1.5; margin-top: 32px;">
            Best regards,<br>
            <strong>The Fashion Platform Team</strong>
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
          from: `Fashion Platform <${fromEmail}>`,
          to: body.email,
          subject: 'Thank you for shaping the future of fashion internships!',
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
