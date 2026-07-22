import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Send to Telegram if configured
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (botToken && chatId) {
      const telegramMessage = `
🤖 *New AI Automation Survey Response!*

*Role:* ${body.role}
*Platforms:* ${body.platforms.join(', ')}

*Post Frequency:* ${body.postFrequency}
*Content Management:* ${body.manageWorkflow}
*Time Spent:* ${body.timeSpent}

*Frustrating Part:*
${body.frustratingPart}

*Forgotten Posts:* ${body.forgottenPost}
*Stopped Consistently:* ${body.stoppedConsistently}

*Value of AI Automation (1-5):* ${body.valueScore}
*Time Saving Features:* ${body.saveTimeFeature.join(', ')}
*Trust AI blindly?:* ${body.trustAI}
*Would pay for 5-10hr savings?:* ${body.payConsideration}

*Reason not to use:*
${body.stopUsing}

*Batch Creation Likelihood:* ${body.batchCreationLikelihood}

*Early Access:* ${body.wantsEarlyAccess === "Yes" ? '✅ Yes' : '❌ No'}

*Contact Details:*
Name: ${body.name || 'N/A'}
Email: ${body.email || 'N/A'}
WhatsApp: ${body.whatsapp || 'N/A'}
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
