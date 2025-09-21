export type EnrollmentTemplateData = { userName: string; courseTitle: string };
export type PaymentSuccessTemplateData = { userName: string; amount: number; invoiceUrl?: string };
export type CertificateIssuedTemplateData = { userName: string; courseTitle: string; certUrl: string };
export type InterventionScheduledTemplateData = { userName: string; when: string; withWhom: string };

export const Templates = {
  enrollment: (d: EnrollmentTemplateData) => ({
    subject: `You're enrolled in ${d.courseTitle}`,
    html: `<p>Hi ${d.userName},</p><p>Welcome to <strong>${d.courseTitle}</strong>! Let's get started.</p>`,
    text: `Hi ${d.userName},\nWelcome to ${d.courseTitle}!`,
  }),
  paymentSuccess: (d: PaymentSuccessTemplateData) => ({
    subject: `Payment received`,
    html: `<p>Hi ${d.userName},</p><p>We've received your payment of <strong>₹${(d.amount/100).toFixed(2)}</strong>.</p>${d.invoiceUrl?`<p>Invoice: <a href="${d.invoiceUrl}">${d.invoiceUrl}</a></p>`:''}`,
    text: `Payment received: ₹${(d.amount/100).toFixed(2)}${d.invoiceUrl?`\nInvoice: ${d.invoiceUrl}`:''}`,
  }),
  certificateIssued: (d: CertificateIssuedTemplateData) => ({
    subject: `Certificate issued: ${d.courseTitle}`,
    html: `<p>Hi ${d.userName},</p><p>Your certificate for <strong>${d.courseTitle}</strong> is ready.</p><p><a href="${d.certUrl}">View certificate</a></p>`,
    text: `Certificate ready: ${d.certUrl}`,
  }),
  interventionScheduled: (d: InterventionScheduledTemplateData) => ({
    subject: `Session scheduled`,
    html: `<p>Hi ${d.userName},</p><p>Your session with ${d.withWhom} is scheduled at ${new Date(d.when).toLocaleString()}.</p>`,
    text: `Session scheduled with ${d.withWhom} at ${new Date(d.when).toLocaleString()}`,
  }),
};

export type TemplateName = keyof typeof Templates;
