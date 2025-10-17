// src/utils/emailHandler.ts
import { mailtrapClient, sender } from "../config/mailtrap";
import {
  createConfirmationEmailTemplate,
  createDepositApprovedEmailTemplate,
  createInvestmentStartedEmailTemplate,
  createKycApprovedEmailTemplate,
  createKycRejectedEmailTemplate,
  createWithdrawalRequestedEmailTemplate,
  createWithdrawalProcessedEmailTemplate
} from "../templates/emailTemplates";

export const sendConfirmationEmail = async (
  email: string,
  confirmationLink: string
): Promise<void> => {
  const recipient = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Confirm Your Zentroe Email Address",
      html: createConfirmationEmailTemplate(confirmationLink),
      category: "email_confirmation",
    });

    console.log("✅ Confirmation email sent successfully:", response);
  } catch (error) {
    console.error("❌ Error sending confirmation email:", error);
    throw error;
  }
};

export const sendDepositApprovedEmail = async (
  email: string,
  userName: string,
  amount: number
): Promise<void> => {
  const recipient = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Deposit Approved - Zentroe",
      html: createDepositApprovedEmailTemplate(userName, amount),
      category: "deposit_approved",
    });

    console.log("✅ Deposit approved email sent successfully:", response);
  } catch (error) {
    console.error("❌ Error sending deposit approved email:", error);
    throw error;
  }
};

export const sendInvestmentStartedEmail = async (
  email: string,
  userName: string,
  amount: number,
  planName: string,
  duration: number,
  profitPercentage: number
): Promise<void> => {
  const recipient = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Investment Started - Zentroe",
      html: createInvestmentStartedEmailTemplate(userName, amount, planName, duration, profitPercentage),
      category: "investment_started",
    });

    console.log("✅ Investment started email sent successfully:", response);
  } catch (error) {
    console.error("❌ Error sending investment started email:", error);
    throw error;
  }
};

export const sendKycStatusEmail = async (
  email: string,
  userName: string,
  status: 'approved' | 'rejected',
  reason?: string
): Promise<void> => {
  const recipient = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: status === 'approved'
        ? "KYC Verification Approved - Zentroe"
        : "KYC Verification Update - Zentroe",
      html: status === 'approved'
        ? createKycApprovedEmailTemplate(userName)
        : createKycRejectedEmailTemplate(userName, reason),
      category: `kyc_${status}`,
    });

    console.log(`✅ KYC ${status} email sent successfully:`, response);
  } catch (error) {
    console.error(`❌ Error sending KYC ${status} email:`, error);
    throw error;
  }
};

export const sendWithdrawalRequestedEmail = async (
  email: string,
  userName: string,
  amount: number
): Promise<void> => {
  const recipient = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Withdrawal Request Received - Zentroe",
      html: createWithdrawalRequestedEmailTemplate(userName, amount),
      category: "withdrawal_requested",
    });

    console.log("✅ Withdrawal requested email sent successfully:", response);
  } catch (error) {
    console.error("❌ Error sending withdrawal requested email:", error);
    throw error;
  }
};

export const sendWithdrawalProcessedEmail = async (
  email: string,
  userName: string,
  amount: number,
  transactionId: string
): Promise<void> => {
  const recipient = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Withdrawal Completed - Zentroe",
      html: createWithdrawalProcessedEmailTemplate(userName, amount, transactionId),
      category: "withdrawal_processed",
    });

    console.log("✅ Withdrawal processed email sent successfully:", response);
  } catch (error) {
    console.error("❌ Error sending withdrawal processed email:", error);
    throw error;
  }
};

