import { Resend } from 'resend';

// Lazy initialization to avoid errors during build
let resend: Resend | null = null;

function getResendClient(): Resend {
  if (!resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY environment variable is not set');
    }
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

interface SendSignatureRequestEmailParams {
  to: string;
  recipientName?: string;
  senderName: string;
  senderEmail: string;
  documentName: string;
  message?: string;
  signingUrl: string;
  expiresAt: Date;
}

export async function sendSignatureRequestEmail(params: SendSignatureRequestEmailParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const { to, recipientName, senderName, senderEmail, documentName, message, signingUrl, expiresAt } = params;

  const greeting = recipientName ? `Hi ${recipientName},` : 'Hello,';
  const expiresFormatted = expiresAt.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  try {
    const { data, error } = await getResendClient().emails.send({
      from: 'PDF Doc Sign <noreply@pdfdocsign.com>',
      to: [to],
      replyTo: senderEmail,
      subject: `${senderName} has requested your signature on "${documentName}"`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Signature Request</h1>
          </div>

          <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="font-size: 16px; margin-bottom: 20px;">${greeting}</p>

            <p style="font-size: 16px; margin-bottom: 20px;">
              <strong>${senderName}</strong> (${senderEmail}) has sent you a document to sign:
            </p>

            <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
              <p style="margin: 0; font-size: 14px; color: #6b7280;">Document</p>
              <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: 600; color: #111827;">${documentName}</p>
            </div>

            ${message ? `
            <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px; margin-bottom: 20px;">
              <p style="margin: 0; font-size: 14px; color: #166534; font-style: italic;">"${message}"</p>
            </div>
            ` : ''}

            <div style="text-align: center; margin: 30px 0;">
              <a href="${signingUrl}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Review & Sign Document
              </a>
            </div>

            <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin-top: 20px;">
              <p style="margin: 0; font-size: 14px; color: #92400e;">
                <strong>Expires:</strong> ${expiresFormatted}
              </p>
            </div>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

            <p style="font-size: 12px; color: #9ca3af; margin-bottom: 10px;">
              This is a secure document signing request from PDF Doc Sign. Your signature will be legally binding and timestamped.
            </p>

            <p style="font-size: 12px; color: #9ca3af;">
              If you didn't expect this email, you can safely ignore it. If you have concerns, please contact ${senderEmail}.
            </p>
          </div>

          <div style="text-align: center; padding: 20px;">
            <p style="font-size: 12px; color: #9ca3af; margin: 0;">
              Powered by <a href="https://pdfdocsign.com" style="color: #7c3aed; text-decoration: none;">PDF Doc Sign</a>
            </p>
          </div>
        </body>
        </html>
      `,
      text: `
${greeting}

${senderName} (${senderEmail}) has sent you a document to sign:

Document: ${documentName}
${message ? `\nMessage: "${message}"\n` : ''}

To review and sign this document, visit:
${signingUrl}

This link expires on ${expiresFormatted}.

---
This is a secure document signing request from PDF Doc Sign.
Your signature will be legally binding and timestamped.
      `.trim(),
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (err) {
    console.error('Email send error:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Failed to send email' };
  }
}

export async function sendSignatureCompletedEmail(params: {
  to: string;
  senderName: string;
  documentName: string;
  signerName: string;
  signerEmail: string;
  signedAt: Date;
  downloadUrl: string;
}): Promise<{ success: boolean; error?: string }> {
  const { to, senderName, documentName, signerName, signerEmail, signedAt, downloadUrl } = params;

  const signedAtFormatted = signedAt.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  });

  try {
    const { error } = await getResendClient().emails.send({
      from: 'PDF Doc Sign <noreply@pdfdocsign.com>',
      to: [to],
      subject: `${signerName} has signed "${documentName}"`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Document Signed</h1>
          </div>

          <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hi ${senderName},</p>

            <p style="font-size: 16px; margin-bottom: 20px;">
              Great news! <strong>${signerName}</strong> (${signerEmail}) has signed your document.
            </p>

            <div style="background: #f0fdf4; border: 1px solid #22c55e; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
              <p style="margin: 0 0 10px 0; font-size: 14px; color: #166534;">
                <strong>Document:</strong> ${documentName}
              </p>
              <p style="margin: 0; font-size: 14px; color: #166534;">
                <strong>Signed at:</strong> ${signedAtFormatted}
              </p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${downloadUrl}" style="display: inline-block; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Download Signed Document
              </a>
            </div>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

            <p style="font-size: 12px; color: #9ca3af;">
              The signed document includes a complete audit trail with timestamps and verification details.
            </p>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to send email' };
  }
}
