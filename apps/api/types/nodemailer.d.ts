declare namespace nodemailer {
  interface Transporter {
    sendMail: (...args: any[]) => Promise<any>;
  }

  interface CreateTransportOptions {
    [key: string]: any;
  }

  function createTransport(options: CreateTransportOptions, defaults?: any): Transporter;
}

declare const nodemailer: {
  createTransport: typeof nodemailer.createTransport;
};

export = nodemailer;
