const SibApiV3Sdk = require("sib-api-v3-sdk");

const client = SibApiV3Sdk.ApiClient.instance;

const apiKey = client.authentications["api-key"];
apiKey.apiKey = process.env.BREVO_API_KEY;

const emailApi = new SibApiV3Sdk.TransactionalEmailsApi();

const sendEmail = async ({ to, subject, text, html }) => {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.to = [{ email: to }];
    sendSmtpEmail.sender = {
        email: process.env.SENDER_EMAIL,
        name: "Fediverse Team",
    };
    sendSmtpEmail.subject = subject;

    if (html) {
        sendSmtpEmail.htmlContent = html;
    } else {
        sendSmtpEmail.textContent = text;
    }

    try {
        const data = await emailApi.sendTransacEmail(sendSmtpEmail);
        console.log("Email sent successfully using Brevo API:", data);
        return data;
    } catch (error) {
        console.error("Error creating transactional email:", error);
        throw error;
    }
};

module.exports = sendEmail;
