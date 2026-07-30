import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { AppConfig } from '../../config/configuration';

interface SendMailInput {
  to: string;
  subject: string;
  html: string;
}

/**
 * Thin wrapper so the rest of the app never touches nodemailer directly.
 * Without SMTP_HOST configured, it logs the email instead of sending it —
 * this keeps password-reset/verification flows fully testable locally
 * without a real mail provider, and fails loud (in the log) instead of
 * silently swallowing the email if SMTP is misconfigured in production.
 */
@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly config: ConfigService<AppConfig, true>) {
    const mail = this.config.get('mail', { infer: true });
    if (mail.host) {
      this.transporter = nodemailer.createTransport({
        host: mail.host,
        port: mail.port,
        secure: mail.secure,
        auth: mail.user ? { user: mail.user, pass: mail.pass } : undefined,
      });
    }
  }

  async send({ to, subject, html }: SendMailInput): Promise<void> {
    const from = this.config.get('mail.from', { infer: true });

    if (!this.transporter) {
      this.logger.warn(
        `SMTP_HOST no configurado — email no enviado de verdad. Para: ${to} | Asunto: ${subject}\n${html}`,
      );
      return;
    }

    await this.transporter.sendMail({ from, to, subject, html });
  }
}
