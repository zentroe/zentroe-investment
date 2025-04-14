// src/utils/emailHandler.ts
import { mailtrapClient, sender } from "../config/mailtrap";
import {
  createConfirmationEmailTemplate
} from "../templates/emailTemplates";

export const sendConfirmationEmail = async (
  email: string,
  name: string,
  confirmationLink: string
): Promise<void> => {
  const recipient = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Confirm Your Zentroe Email Address",
      html: createConfirmationEmailTemplate(name, confirmationLink),
      category: "email_confirmation",
    });

    console.log("✅ Confirmation email sent successfully:", response);
  } catch (error) {
    console.error("❌ Error sending confirmation email:", error);
    throw error;
  }
};

