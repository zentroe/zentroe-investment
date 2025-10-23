export const createConfirmationEmailTemplate = (
  confirmationLink: string
): string => {
  return `
    <div style="font-family: 'Arial', sans-serif; padding: 20px; background-color: #fdf8f6;">
      <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
        <div style="background-color: #a9462d; padding: 20px; color: #ffffff; text-align: center;">
          <h1 style="margin: 0;">Welcome to Zentroe</h1>
        </div>
        <div style="padding: 30px; color: #251c15;">
          <p style="font-size: 15px; color: #4b3a32;">
            Thank you for joining <strong>Zentroe</strong>, a platform designed to help you grow your wealth through secure investments in Real Estate, Agriculture, and Venture Capital.
          </p>
          <p style="font-size: 15px; color: #4b3a32;">
            Please confirm your email address to activate your account and start investing in vetted opportunities curated just for you.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmationLink}" style="background-color: #a9462d; color: white; padding: 12px 20px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Confirm Email Address
            </a>
          </div>
          <p style="font-size: 14px; color: #8c766a;">
            Didn't sign up? You can safely ignore this email.
          </p>
        </div>
        <div style="background-color: #f5eae6; padding: 20px; text-align: center; font-size: 13px; color: #8c766a;">
          © ${new Date().getFullYear()} Zentroe. All rights reserved.
        </div>
      </div>
    </div>
  `;
};

export const createDepositApprovedEmailTemplate = (
  userName: string,
  amount: number
): string => {
  return `
    <div style="font-family: 'Arial', sans-serif; padding: 20px; background-color: #fdf8f6;">
      <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
        <div style="background-color: #a9462d; padding: 20px; color: #ffffff; text-align: center;">
          <h1 style="margin: 0;">Deposit Approved ✓</h1>
        </div>
        <div style="padding: 30px; color: #251c15;">
          <p style="font-size: 15px; color: #4b3a32;">
            Hi <strong>${userName}</strong>,
          </p>
          <p style="font-size: 15px; color: #4b3a32;">
            Great news! Your deposit of <strong>$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong> has been approved and your investment is now active.
          </p>
          <p style="font-size: 15px; color: #4b3a32;">
            You can track your investment performance and earnings in your dashboard.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL || 'https://zentroe.com'}/dashboard" style="background-color: #a9462d; color: white; padding: 12px 20px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              View Dashboard
            </a>
          </div>
          <p style="font-size: 14px; color: #8c766a;">
            Thank you for investing with Zentroe!
          </p>
        </div>
        <div style="background-color: #f5eae6; padding: 20px; text-align: center; font-size: 13px; color: #8c766a;">
          © ${new Date().getFullYear()} Zentroe. All rights reserved.
        </div>
      </div>
    </div>
  `;
};

export const createInvestmentStartedEmailTemplate = (
  userName: string,
  amount: number,
  planName: string,
  duration: number,
  profitPercentage: number
): string => {
  return `
    <div style="font-family: 'Arial', sans-serif; padding: 20px; background-color: #fdf8f6;">
      <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
        <div style="background-color: #a9462d; padding: 20px; color: #ffffff; text-align: center;">
          <h1 style="margin: 0;">Investment Started 🚀</h1>
        </div>
        <div style="padding: 30px; color: #251c15;">
          <p style="font-size: 15px; color: #4b3a32;">
            Hi <strong>${userName}</strong>,
          </p>
          <p style="font-size: 15px; color: #4b3a32;">
            Your investment has been successfully activated! Here are the details:
          </p>
          <div style="background-color: #f5eae6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-size: 14px; color: #8c766a;">Plan:</td>
                <td style="padding: 8px 0; font-size: 14px; color: #251c15; font-weight: bold; text-align: right;">${planName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-size: 14px; color: #8c766a;">Amount:</td>
                <td style="padding: 8px 0; font-size: 14px; color: #251c15; font-weight: bold; text-align: right;">$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-size: 14px; color: #8c766a;">Duration:</td>
                <td style="padding: 8px 0; font-size: 14px; color: #251c15; font-weight: bold; text-align: right;">${duration} days</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-size: 14px; color: #8c766a;">Total Profit:</td>
                <td style="padding: 8px 0; font-size: 14px; color: #a9462d; font-weight: bold; text-align: right;">${profitPercentage}%</td>
              </tr>
            </table>
          </div>
          <p style="font-size: 15px; color: #4b3a32;">
            Your investment is now generating returns. Track your earnings in real-time through your dashboard.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL || 'https://zentroe.com'}/dashboard" style="background-color: #a9462d; color: white; padding: 12px 20px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              View Investment
            </a>
          </div>
        </div>
        <div style="background-color: #f5eae6; padding: 20px; text-align: center; font-size: 13px; color: #8c766a;">
          © ${new Date().getFullYear()} Zentroe. All rights reserved.
        </div>
      </div>
    </div>
  `;
};

export const createKycApprovedEmailTemplate = (userName: string): string => {
  return `
    <div style="font-family: 'Arial', sans-serif; padding: 20px; background-color: #fdf8f6;">
      <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
        <div style="background-color: #a9462d; padding: 20px; color: #ffffff; text-align: center;">
          <h1 style="margin: 0;">KYC Verification Approved ✓</h1>
        </div>
        <div style="padding: 30px; color: #251c15;">
          <p style="font-size: 15px; color: #4b3a32;">
            Hi <strong>${userName}</strong>,
          </p>
          <p style="font-size: 15px; color: #4b3a32;">
            Congratulations! Your KYC verification has been approved. Your account is now fully activated.
          </p>
          <p style="font-size: 15px; color: #4b3a32;">
            You can now:
          </p>
          <ul style="font-size: 15px; color: #4b3a32; line-height: 1.8;">
            <li>Make deposits and start investing</li>
            <li>Access all investment plans</li>
            <li>Request withdrawals</li>
            <li>Enjoy full platform features</li>
          </ul>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL || 'https://zentroe.com'}/dashboard" style="background-color: #a9462d; color: white; padding: 12px 20px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Start Investing
            </a>
          </div>
        </div>
        <div style="background-color: #f5eae6; padding: 20px; text-align: center; font-size: 13px; color: #8c766a;">
          © ${new Date().getFullYear()} Zentroe. All rights reserved.
        </div>
      </div>
    </div>
  `;
};

export const createKycRejectedEmailTemplate = (
  userName: string,
  reason?: string
): string => {
  return `
    <div style="font-family: 'Arial', sans-serif; padding: 20px; background-color: #fdf8f6;">
      <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
        <div style="background-color: #a9462d; padding: 20px; color: #ffffff; text-align: center;">
          <h1 style="margin: 0;">KYC Verification Update</h1>
        </div>
        <div style="padding: 30px; color: #251c15;">
          <p style="font-size: 15px; color: #4b3a32;">
            Hi <strong>${userName}</strong>,
          </p>
          <p style="font-size: 15px; color: #4b3a32;">
            Thank you for submitting your KYC verification. Unfortunately, we were unable to approve your verification at this time.
          </p>
          ${reason ? `
          <div style="background-color: #fff5f5; padding: 15px; border-left: 4px solid #a9462d; margin: 20px 0;">
            <p style="font-size: 14px; color: #4b3a32; margin: 0;">
              <strong>Reason:</strong> ${reason}
            </p>
          </div>
          ` : ''}
          <p style="font-size: 15px; color: #4b3a32;">
            Please review your information and submit updated documents. If you have any questions, our support team is here to help.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL || 'https://zentroe.com'}/dashboard" style="background-color: #a9462d; color: white; padding: 12px 20px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Update KYC Information
            </a>
          </div>
        </div>
        <div style="background-color: #f5eae6; padding: 20px; text-align: center; font-size: 13px; color: #8c766a;">
          © ${new Date().getFullYear()} Zentroe. All rights reserved.
        </div>
      </div>
    </div>
  `;
};

export const createWithdrawalRequestedEmailTemplate = (
  userName: string,
  amount: number
): string => {
  return `
    <div style="font-family: 'Arial', sans-serif; padding: 20px; background-color: #fdf8f6;">
      <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
        <div style="background-color: #a9462d; padding: 20px; color: #ffffff; text-align: center;">
          <h1 style="margin: 0;">Withdrawal Request Received</h1>
        </div>
        <div style="padding: 30px; color: #251c15;">
          <p style="font-size: 15px; color: #4b3a32;">
            Hi <strong>${userName}</strong>,
          </p>
          <p style="font-size: 15px; color: #4b3a32;">
            We have received your withdrawal request for <strong>$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>.
          </p>
          <p style="font-size: 15px; color: #4b3a32;">
            Your request is currently under review. We typically process withdrawal requests within 1-3 business days.
          </p>
          <p style="font-size: 15px; color: #4b3a32;">
            You will receive another email once your withdrawal has been processed.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL || 'https://zentroe.com'}/dashboard/withdrawals" style="background-color: #a9462d; color: white; padding: 12px 20px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              View Withdrawal Status
            </a>
          </div>
        </div>
        <div style="background-color: #f5eae6; padding: 20px; text-align: center; font-size: 13px; color: #8c766a;">
          © ${new Date().getFullYear()} Zentroe. All rights reserved.
        </div>
      </div>
    </div>
  `;
};

export const createWithdrawalProcessedEmailTemplate = (
  userName: string,
  amount: number,
  transactionId: string
): string => {
  return `
    <div style="font-family: 'Arial', sans-serif; padding: 20px; background-color: #fdf8f6;">
      <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
        <div style="background-color: #a9462d; padding: 20px; color: #ffffff; text-align: center;">
          <h1 style="margin: 0;">Withdrawal Completed ✓</h1>
        </div>
        <div style="padding: 30px; color: #251c15;">
          <p style="font-size: 15px; color: #4b3a32;">
            Hi <strong>${userName}</strong>,
          </p>
          <p style="font-size: 15px; color: #4b3a32;">
            Great news! Your withdrawal of <strong>$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong> has been processed successfully.
          </p>
          <div style="background-color: #f5eae6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="font-size: 14px; color: #8c766a; margin: 0;">
              <strong>Transaction ID:</strong><br/>
              <span style="color: #251c15; font-family: monospace;">${transactionId}</span>
            </p>
          </div>
          <p style="font-size: 15px; color: #4b3a32;">
            The funds should arrive in your account within 1-5 business days, depending on your payment method.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL || 'https://zentroe.com'}/dashboard/withdrawals" style="background-color: #a9462d; color: white; padding: 12px 20px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              View Transaction History
            </a>
          </div>
        </div>
        <div style="background-color: #f5eae6; padding: 20px; text-align: center; font-size: 13px; color: #8c766a;">
          © ${new Date().getFullYear()} Zentroe. All rights reserved.
        </div>
      </div>
    </div>
  `;
};