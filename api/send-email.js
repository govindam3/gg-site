const nodemailer = require('nodemailer');

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { studentName, parentName, email, phone, message } = req.body;

    if (!studentName || !email || !phone) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        let transporterConfig = {
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 465,
            secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT == 465, 
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        };

        // Use NodeMailer's built-in Gmail service to automatically handle all SSL/TLS quirks
        if (process.env.SMTP_HOST && process.env.SMTP_HOST.includes('gmail')) {
            transporterConfig = {
                service: 'gmail',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                }
            };
        }

        const transporter = nodemailer.createTransport(transporterConfig);

        // Email Options
        const mailOptions = {
            from: `"Website Form" <${process.env.SMTP_USER}>`,
            to: 'chaitanyaenglishclasses08@gmail.com', // Recipient email
            replyTo: email,
            subject: `New Demo Booking Request from ${studentName}`,
            text: `
You have a new Demo Booking request!

Student's Name: ${studentName}
Parent's Name: ${parentName || 'N/A'}
Email: ${email}
Phone: ${phone}
Message: ${message || 'N/A'}
            `,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #0A192F;">New Demo Booking Request</h2>
                    <p>You have received a new booking request from your website.</p>
                    <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                        <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Student's Name:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${studentName}</td></tr>
                        <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Parent's Name:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${parentName || 'N/A'}</td></tr>
                        <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Email:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><a href="mailto:${email}">${email}</a></td></tr>
                        <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Phone:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${phone}</td></tr>
                        <tr><td style="padding: 8px 0;"><strong>Message:</strong></td><td style="padding: 8px 0;">${message || 'N/A'}</td></tr>
                    </table>
                </div>
            `,
        };

        // Send Email
        await transporter.sendMail(mailOptions);

        return res.status(200).json({ success: true, message: 'Email sent successfully!' });
    } catch (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ success: false, message: 'Failed to send email.', error: error.message });
    }
}
