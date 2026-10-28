// Fake newsletter API: checks the email address and answers OK. Nothing is stored or sent anywhere.
import { delay, mockError } from "./utils";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function subscribe(email) {
  await delay();
  if (!EMAIL_PATTERN.test(String(email ?? "").trim())) {
    throw mockError(400, "Enter a valid email address.", { email: "Enter a valid email address." });
  }
  return { subscribed: true };
}
