const nodemailer = require("nodemailer")
const fs = require("fs")
const ejs = require("ejs")
//const path = require("path");

const sendEmail = async (receivingEmailAddress, emailSubject, payload, ejsTemplateLocation) => {
    

    const temp = fs.readFileSync(ejsTemplateLocation, "utf-8") //todo: incoporate dynamic path files via path package
    const ejsFile = ejs.compile(temp)
    

    const  transporter = nodemailer.createTransport({
        //service: "gmail", //this method works too, have to comment out host and port though to use
        host: "smtp.gmail.com",
        port: 587, //or port 465 for SSL, see here https://kinsta.com/blog/gmail-smtp-server/
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD
        }
    })

    const mailOptions = {
        from: process.env.EMAIL,
        to: receivingEmailAddress, 
        subject: emailSubject,
        html: ejsFile(payload) // this will throw an error if you dont supply every var declared in the .ejs file
    }

    
    transporter.sendMail(mailOptions, (err, info) => {
        if(err){
            console.log(err)
        }else{
            console.log("email was sent!")
        }
    })
}


module.exports = sendEmail;