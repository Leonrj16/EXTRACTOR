import type { ConfigService } from '@nestjs/config';
import type { AppConfig } from '../../config/configuration';
import { MailerService } from './mailer.service';

const sendMailMock = jest.fn();

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({ sendMail: sendMailMock })),
}));

describe('MailerService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function makeConfig(mail: {
    host?: string;
    port?: number;
    secure?: boolean;
    user?: string;
    pass?: string;
    from?: string;
  }): ConfigService<AppConfig, true> {
    return {
      get: (key: string) => (key === 'mail' ? mail : mail.from),
    } as unknown as ConfigService<AppConfig, true>;
  }

  it('logs instead of sending when SMTP_HOST is not configured', async () => {
    const mailer = new MailerService(
      makeConfig({ from: 'no-reply@aura.test' }),
    );

    await mailer.send({
      to: 'user@test.com',
      subject: 'Hola',
      html: '<p>Hola</p>',
    });

    expect(sendMailMock).not.toHaveBeenCalled();
  });

  it('sends via nodemailer when SMTP_HOST is configured', async () => {
    const mailer = new MailerService(
      makeConfig({
        host: 'smtp.test.com',
        port: 587,
        secure: false,
        from: 'no-reply@aura.test',
      }),
    );
    sendMailMock.mockResolvedValue(undefined);

    await mailer.send({
      to: 'user@test.com',
      subject: 'Hola',
      html: '<p>Hola</p>',
    });

    expect(sendMailMock).toHaveBeenCalledWith({
      from: 'no-reply@aura.test',
      to: 'user@test.com',
      subject: 'Hola',
      html: '<p>Hola</p>',
    });
  });
});
