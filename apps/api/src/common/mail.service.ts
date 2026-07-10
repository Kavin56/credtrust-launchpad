import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  async sendAgentOtpEmail(to: string, otp: string, agentCode: string) {
    const subject = 'Sharanam Agent Portal — Email Verification OTP';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #1a1f36;">Agent Login Verification</h2>
        <p>Your one-time verification code for the Pigmy Agent Portal:</p>
        <p style="font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #4a148c;">${otp}</p>
        <p style="color: #666; font-size: 13px;">Enter this code in the <strong>Unique Agent ID</strong> field on the login page. Valid for 10 minutes.</p>
        <p style="color: #999; font-size: 12px;">Registered Agent ID: ${agentCode}</p>
        <hr />
        <p style="color: #999; font-size: 11px;">Sharanam Multi State Cooperative Credit Society</p>
      </div>
    `;

    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpFrom = process.env.SMTP_FROM || smtpUser || 'noreply@sharanam.local';

    if (smtpHost && smtpUser && smtpPass) {
      try {
        const nodemailer = await import('nodemailer');
        const transport = nodemailer.createTransport({
          host: smtpHost,
          port: Number(process.env.SMTP_PORT || 587),
          secure: process.env.SMTP_SECURE === 'true',
          auth: { user: smtpUser, pass: smtpPass },
        });
        await transport.sendMail({ from: smtpFrom, to, subject, html });
        this.logger.log(`Agent OTP email sent to ${to}`);
        return;
      } catch (err) {
        this.logger.error(`SMTP send failed: ${err}`);
        throw err;
      }
    }

    this.logger.warn(`[DEV] Agent OTP for ${to}: ${otp} (configure SMTP_HOST, SMTP_USER, SMTP_PASS to send email)`);
  }
}
