const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

// === DOMAIN UPDATE ===
const FROM_EMAIL = "Bid Versus <notifications@bidversus.com>";

// 1. Send Verification / Welcome Email
const sendVerificationEmail = async (
  email,
  name,
  token,
  linkType = "standard",
) => {
  try {
    console.log(`[RESEND] Attempting to send verification email to: ${email}`);
    const verifyUrl = `https://bidversus.com/verify-email?token=${token}&type=${linkType}`;

    // Create a dynamic subject line so Gmail doesn't hide it in an old thread
    const timeSent = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const dynamicSubject = `Action Required: Verify your Bid Versus account (${timeSent})`;

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [email],
      subject: dynamicSubject,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1e3a8a;">Welcome, ${name}!</h1>
          <p>Your account has been created successfully on <strong>Bid Versus</strong>.</p>
          <p>Click the button below to verify your email ${linkType === "guest" ? "and create your password" : ""}:</p>
          <div style="margin: 25px 0;">
            <a href="${verifyUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              ${linkType === "guest" ? "Create Password & Verify" : "Verify Email"}
            </a>
          </div>
          <p style="font-size: 14px; color: #6b7280;">If you didn't sign up for Bid Versus, you can safely ignore this email.</p>
        </div>
      `,
    });

    if (error) {
      console.error("[RESEND ERROR] Failed to send:", error);
      return false;
    }

    // Log the success ID so we know Resend officially accepted it
    console.log(`[RESEND SUCCESS] Email queued! Tracking ID: ${data.id}`);
    return true;
  } catch (err) {
    console.error("[RESEND CATCH ERROR] Email Sending Failed:", err);
    return false;
  }
};

// 2. Send "Bid Accepted" Notification
const sendBidAcceptedEmail = async (email, providerName, jobTitle, amount) => {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [email],
      subject: "Good news! Your bid was accepted",
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #059669;">Congratulations, ${providerName}!</h1>
          <p>Your bid of <strong>$${amount}</strong> for the job <strong>"${jobTitle}"</strong> has been accepted by the customer.</p>
          <p>You can now log in to your dashboard to see the customer's contact information and coordinate the service.</p>
          <div style="margin: 25px 0;">
            <a href="https://bidversus.com" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Dashboard</a>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("[RESEND ERROR] Failed to send:", error);
    } else {
      console.log(
        `[RESEND SUCCESS] Bid Accepted Email sent! Tracking ID: ${data.id}`,
      );
    }
  } catch (err) {
    console.error("[RESEND CATCH ERROR] Email Sending Failed:", err);
  }
};

module.exports = { sendVerificationEmail, sendBidAcceptedEmail };
