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
            Thank you for joining <strong>Zentroe</strong> — a platform designed to help you grow your wealth through secure investments in Real Estate, Agriculture, and Venture Capital.
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
            Didn’t sign up? You can safely ignore this email.
          </p>
        </div>
        <div style="background-color: #f5eae6; padding: 20px; text-align: center; font-size: 13px; color: #8c766a;">
          © ${new Date().getFullYear()} Zentroe. All rights reserved.
        </div>
      </div>
    </div>
  `;
};