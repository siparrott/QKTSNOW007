import sgMail from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  console.warn("SENDGRID_API_KEY environment variable not set - emails will be logged to console only");
} else {
  console.log("✅ SendGrid API key configured");
}

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.log('📧 EMAIL (Development Mode - No SendGrid API Key)');
    console.log(`To: ${params.to}`);
    console.log(`From: ${params.from}`);
    console.log(`Subject: ${params.subject}`);
    console.log(`HTML: ${params.html || params.text}`);
    console.log('---');
    return true;
  }

  try {
    await sgMail.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
    console.log(`✅ Email sent successfully to ${params.to}`);
    return true;
  } catch (error) {
    console.error('❌ SendGrid email error:', error);
    return false;
  }
}

// Quote email template
export function generateQuoteEmailHTML(
  customerName: string,
  quoteDetails: any,
  businessName = "Portrait Photography Studio"
): string {
  // Safely handle breakdown array
  const breakdownItems = Array.isArray(quoteDetails.breakdown) 
    ? quoteDetails.breakdown.map((item: string) => {
        const parts = item.split(': ');
        if (parts.length >= 2) {
          return `
            <div class="breakdown-item">
              <span>${parts[0]}</span>
              <span><strong>${parts.slice(1).join(': ')}</strong></span>
            </div>
          `;
        }
        return `
          <div class="breakdown-item">
            <span>${item}</span>
            <span></span>
          </div>
        `;
      }).join('')
    : `<div class="breakdown-item"><span>Base Quote</span><span><strong>${quoteDetails.currencySymbol || '€'}${quoteDetails.total || 'N/A'}</strong></span></div>`;

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Quote from ${businessName}</title>
        <style>
            body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc; }
            .email-container { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .header { background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 40px 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
            .header p { margin: 10px 0 0 0; font-size: 16px; opacity: 0.9; }
            .content { padding: 40px 30px; }
            .greeting { font-size: 18px; margin-bottom: 20px; }
            .quote-summary { background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 12px; padding: 25px; margin: 25px 0; }
            .quote-summary h3 { margin: 0 0 20px 0; color: #10B981; font-size: 20px; display: flex; align-items: center; }
            .quote-summary h3::before { content: "💰"; margin-right: 8px; }
            .breakdown { margin: 20px 0; }
            .breakdown-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #e2e8f0; }
            .breakdown-item:last-child { border-bottom: none; font-weight: 600; font-size: 16px; background: #f0fdf4; margin: 15px -10px -10px -10px; padding: 15px 10px; border-radius: 8px; }
            .price-total { font-size: 28px; font-weight: 700; color: #10B981; text-align: center; margin: 25px 0; padding: 20px; background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 12px; }
            .cta-section { text-align: center; margin: 30px 0; }
            .cta-button { display: inline-block; background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3); transition: all 0.3s ease; }
            .cta-button:hover { background: linear-gradient(135deg, #059669 0%, #047857 100%); }
            .features { background: #f8fafc; border-radius: 12px; padding: 25px; margin: 25px 0; }
            .features h3 { margin: 0 0 15px 0; color: #374151; display: flex; align-items: center; }
            .features h3::before { content: "✨"; margin-right: 8px; }
            .features ul { margin: 0; padding-left: 20px; }
            .features li { margin: 8px 0; color: #4b5563; }
            .next-steps { background: #fffbeb; border: 2px solid #fbbf24; border-radius: 12px; padding: 25px; margin: 25px 0; }
            .next-steps h3 { margin: 0 0 15px 0; color: #d97706; display: flex; align-items: center; }
            .next-steps h3::before { content: "🚀"; margin-right: 8px; }
            .next-steps ol { margin: 0; padding-left: 20px; }
            .next-steps li { margin: 8px 0; color: #78350f; font-weight: 500; }
            .signature { margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb; }
            .footer { background: #f9fafb; padding: 25px 30px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; }
            .footer a { color: #10B981; text-decoration: none; }
            @media (max-width: 600px) {
              body { padding: 10px; }
              .header, .content { padding: 25px 20px; }
              .header h1 { font-size: 24px; }
              .price-total { font-size: 24px; }
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <h1>Your Personal Quote</h1>
                <p>Thank you for choosing ${businessName}</p>
            </div>
            
            <div class="content">
                <div class="greeting">Dear ${customerName},</div>
                
                <p>Thank you for your interest in our services! We're excited to work with you and provide exactly what you're looking for.</p>
                
                <div class="quote-summary">
                    <h3>Quote Breakdown</h3>
                    <div class="breakdown">
                        ${breakdownItems}
                        <div class="breakdown-item">
                            <span><strong>Total Amount</strong></span>
                            <span><strong>${quoteDetails.currencySymbol || '€'}${quoteDetails.total || 'N/A'}</strong></span>
                        </div>
                    </div>
                </div>
                
                <div class="price-total">
                    Final Total: ${quoteDetails.currencySymbol || '€'}${quoteDetails.total || 'N/A'}
                </div>
                
                <div class="cta-section">
                    <a href="mailto:quotes@quotekit.ai?subject=Quote%20Confirmation%20-%20${encodeURIComponent(customerName)}" class="cta-button">
                        Accept This Quote
                    </a>
                </div>
                
                <div class="features">
                    <h3>What's Included</h3>
                    <ul>
                        <li>Professional service delivery</li>
                        <li>Quality guarantee</li>
                        <li>Dedicated support throughout the process</li>
                        <li>Satisfaction guarantee</li>
                    </ul>
                </div>
                
                <div class="next-steps">
                    <h3>Next Steps</h3>
                    <ol>
                        <li>Reply to this email to confirm your booking</li>
                        <li>We'll schedule a consultation call</li>
                        <li>Get started on your project!</li>
                    </ol>
                </div>
                
                <p>Questions? Simply reply to this email and we'll get back to you within 24 hours.</p>
                
                <div class="signature">
                    <p>Best regards,<br>
                    <strong>${businessName}</strong><br>
                    <em>Powered by QuoteKit.ai</em></p>
                </div>
            </div>
            
            <div class="footer">
                <p>This quote is valid for 30 days from the date of generation.</p>
                <p>Generated by <a href="https://quotekit.ai">QuoteKit.ai</a> - Professional Quote Management Platform</p>
            </div>
        </div>
    </body>
    </html>
  `;
}