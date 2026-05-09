import { Resend } from 'resend';
import logger from './logger';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
/**
 * Use a verified Resend domain for production.
 * The default `onboarding@resend.dev` only works in test mode and only sends
 * to the address that owns the Resend account.
 */
const RESEND_FROM_EMAIL =
    process.env.RESEND_FROM_EMAIL || 'Aura Farm <onboarding@resend.dev>';

/**
 * Inbox that receives moderation notifications (block / flag events).
 * Falls back to MODERATION_EMAIL or DEV_NOTIFICATION_EMAIL, then to the from
 * address so the developer still gets a copy in test mode.
 */
const MODERATION_EMAIL =
    process.env.MODERATION_EMAIL ||
    process.env.DEV_NOTIFICATION_EMAIL ||
    process.env.RESEND_FROM_EMAIL ||
    'aurafarmapp@gmail.com';

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

export function isEmailConfigured(): boolean {
    return resend !== null;
}

function renderTemplate(code: string): { html: string; text: string } {
    const text = [
        'Your Aura Farm verification code is:',
        '',
        code,
        '',
        'This code expires in 10 minutes. If you did not request it, ignore this email.',
        '',
        '— Aura Farm',
    ].join('\n');

    const html = `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#fafaf9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0f0f0f;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:18px;border:1px solid rgba(0,0,0,0.06);box-shadow:0 10px 40px rgba(0,0,0,0.06);overflow:hidden;">
          <tr><td style="padding:32px 32px 16px 32px;">
            <p style="margin:0 0 4px 0;font-size:12px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#4fb948;">Aura Farm</p>
            <h1 style="margin:0;font-size:24px;line-height:1.25;font-weight:800;color:#0f0f0f;">Confirm your email</h1>
            <p style="margin:12px 0 24px 0;font-size:15px;line-height:1.5;color:rgba(15,15,15,0.7);">
              Use the code below to finish creating your account. It expires in <b>10 minutes</b>.
            </p>
            <div style="text-align:center;margin:8px 0 24px 0;">
              <div style="display:inline-block;padding:18px 28px;border-radius:14px;background:#0f0f0f;color:#ffffff;font-family:'SFMono-Regular',Consolas,monospace;font-size:30px;letter-spacing:0.5em;font-weight:800;">
                ${code}
              </div>
            </div>
            <p style="margin:0;font-size:13px;line-height:1.5;color:rgba(15,15,15,0.55);">
              Didn't try to sign up? You can safely ignore this email.
            </p>
          </td></tr>
          <tr><td style="padding:18px 32px;background:#fafaf9;border-top:1px solid rgba(0,0,0,0.06);">
            <p style="margin:0;font-size:12px;color:rgba(15,15,15,0.5);">Aura Farm · Cal Poly SLO</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;

    return { html, text };
}

export async function sendVerificationEmail(
    toEmail: string,
    code: string,
): Promise<void> {
    if (!resend) {
        logger.warn('RESEND_API_KEY not set; logging OTP instead of sending email', {
            toEmail,
            code,
        });
        return;
    }

    const { html, text } = renderTemplate(code);

    const { error } = await resend.emails.send({
        from: RESEND_FROM_EMAIL,
        to: toEmail,
        subject: `${code} is your Aura Farm verification code`,
        html,
        text,
    });

    if (error) {
        logger.error('Resend send failed', { error, toEmail });
        throw new Error(error.message || 'Failed to send verification email');
    }
}

export interface ModerationNotificationInput {
    /** 'block' when the actor blocked another user; 'flag' when content was reported. */
    kind: 'block' | 'flag';
    actor: { id: number; email: string; name: string };
    /** The user being blocked (for kind='block') or who authored the flagged content (for 'flag'). */
    target: { id: number; email: string | null; name: string };
    reason?: string | null;
    completion?: {
        id: number;
        challengeTitle?: string | null;
        caption?: string | null;
        imageUrl?: string | null;
    } | null;
}

/**
 * Best-effort send of a moderation-team notification. Failures are logged but
 * never thrown — moderation notifications must not break user-facing flows.
 */
export async function sendModerationNotification(
    input: ModerationNotificationInput,
): Promise<void> {
    const subject =
        input.kind === 'block'
            ? `[Aura Farm] User block reported: ${input.target.name} (#${input.target.id})`
            : `[Aura Farm] Content flagged on completion #${input.completion?.id ?? 'unknown'}`;

    const lines: string[] = [];
    lines.push(`A user just submitted a ${input.kind === 'block' ? 'block' : 'content flag'}.`);
    lines.push('');
    lines.push(`Reporter: ${input.actor.name} <${input.actor.email}> (id ${input.actor.id})`);
    lines.push(
        input.kind === 'block'
            ? `Blocked user: ${input.target.name}${input.target.email ? ` <${input.target.email}>` : ''} (id ${input.target.id})`
            : `Author: ${input.target.name}${input.target.email ? ` <${input.target.email}>` : ''} (id ${input.target.id})`,
    );
    if (input.reason && input.reason.trim().length > 0) {
        lines.push('');
        lines.push('Reason:');
        lines.push(input.reason.trim());
    }
    if (input.completion) {
        lines.push('');
        lines.push(`Completion: #${input.completion.id}`);
        if (input.completion.challengeTitle) {
            lines.push(`Challenge: ${input.completion.challengeTitle}`);
        }
        if (input.completion.caption) {
            lines.push(`Caption: ${input.completion.caption}`);
        }
        if (input.completion.imageUrl) {
            lines.push(`Photo: ${input.completion.imageUrl}`);
        }
    }
    lines.push('');
    lines.push('Please review in the admin moderation queue.');
    lines.push('— Aura Farm safety system');

    const text = lines.join('\n');
    const html = `<pre style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:14px;line-height:1.5;color:#0f0f0f;white-space:pre-wrap;">${escapeHtml(text)}</pre>`;

    if (!resend) {
        logger.warn('Moderation notification not sent (RESEND_API_KEY missing)', {
            kind: input.kind,
            actorId: input.actor.id,
            targetId: input.target.id,
            completionId: input.completion?.id,
        });
        return;
    }

    try {
        const { error } = await resend.emails.send({
            from: RESEND_FROM_EMAIL,
            to: MODERATION_EMAIL,
            subject,
            html,
            text,
        });
        if (error) {
            logger.error('Failed to send moderation notification', {
                error,
                kind: input.kind,
                actorId: input.actor.id,
                targetId: input.target.id,
            });
        }
    } catch (err) {
        logger.error('Unexpected error sending moderation notification', { error: err });
    }
}

function escapeHtml(s: string): string {
    return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
