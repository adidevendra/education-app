import nodemailer from 'nodemailer';

export class EmailAdapter {
  private transporter: nodemailer.Transporter | null = null;
  private from: string;
  constructor(){
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || '587');
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    this.from = process.env.SMTP_FROM || 'no-reply@example.com';
    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: !!process.env.SMTP_SECURE,
        auth: { user, pass },
      });
    }
  }

  async send(to: string, subject: string, body: string){
    if (!this.transporter) {
      console.log(`[email:mock] to=${to} subject=${subject}`);
      return { ok: true, mock: true } as const;
    }
    await this.transporter.sendMail({ from: this.from, to, subject, html: body, text: body.replace(/<[^>]+>/g, '') });
    return { ok: true } as const;
  }
}
