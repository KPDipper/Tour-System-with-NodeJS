const nodemailer=require("nodemailer")


const sendEmail= async options=>{

    //1.)create a transporder:service that will actually send the email
    // var transport=nodemailer.createTransport({
    //     host:process.env.SMTP_HOST,
    //     port:process.env.SMTP_PORT,
    //     auth:{
    //       user:process.env.SMTP_USER,
    //       pass:process.env.SMTP_PASS
    //       }
    // })

    var transport = nodemailer.createTransport({
        host: "smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "794004a695ebe0",
          pass: "3effb1188bba01"
        }
      });

  

    const mailOptions={
        from:"pokhare2468@gmail.com",
        to:options.email,
        subject:options.subject,
        text:options.message,
        // html:options.email,
    }
    

    //Actually send the email 
   await transport.sendMail(mailOptions)
}

console.log(sendEmail)


module.exports=sendEmail