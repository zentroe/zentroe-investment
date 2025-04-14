import { MailtrapClient } from "mailtrap";
import dotenv from "dotenv";

dotenv.config();

const TOKEN: string = process.env.MAILTRAP_TOKEN!;
const EMAIL_FROM: string = process.env.EMAIL_FROM!;
const EMAIL_FROM_NAME: string = process.env.EMAIL_FROM_NAME!;

export const mailtrapClient = new MailtrapClient({
  token: TOKEN,
});

export const sender = {
  email: EMAIL_FROM,
  name: EMAIL_FROM_NAME,
};
