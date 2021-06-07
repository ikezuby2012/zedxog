const nodemailer = require("nodemailer");

module.exports = class Email {
    constructor(user) {
        this.to = process.env.EMAIL,
        this.firstName = user.name.split(" ")[0],
        this.message = user.message,
        this.from = user.email
    }

    newTransport() {
        if(process.env.NODE_ENV === "production"){
            // do something
            return nodemailer.createTransport({
                service: "gmail",
                auth: {
                    type: "OAuth2",
                    user: process.env.EMAIL,
                    pass: process.env.WORD,
                    clientId: process.env.OAUTH_CLIENTID,
                    clientSecret: process.env.OAUTH_CLIENT_SECRET,
                    refreshToken: process.env.OAUTH_REFRESH_TOKEN
                }
            })
        }

        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            },
        })
    }

    async send() {

        //define mail options
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject: `hello zedxog! i'm ${this.firstName} from your webpage`,
            text: this.message
        }
        
        //create transport
        await this.newTransport().sendMail(mailOptions);
    }

    async sendMessage() {
        await this.send();
    }
}