const nodeMailer = require("nodemailer")

const sendEmail = async(sendto, subject, text) => {
    try {
        const transporter = nodeMailer.createTransport({
            host: process.env.HOST,
            port: Number(process.env.EMAIL_PORT),
            service: process.env.SERVICE,
            secure: Boolean(process.env.SECURE),
            auth: {
                user: process.env.USER, // generated ethereal user
                pass: process.env.PASSWORD, // generated ethereal password
            },
        })
        const info = await transporter.sendMail({
            from: process.env.USER,
            to: sendto,
            subject: subject,
            text: text

        })
        // console.log(`Email sent ${info}`)
    } catch (error) {
        console.log(`Email not sent: ${error}`);
    }
}


module.exports = sendEmail