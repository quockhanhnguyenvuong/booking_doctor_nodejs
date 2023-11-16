require("dotenv").config();
import nodemailer from "nodemailer";

let sendSimpleEmail = async (dataSend) => {
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_APP, // generated ethereal user
      pass: process.env.EMAIL_APP_PASSWORD, // generated ethereal password
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"System Booking A Medical Appointment " <systembookingamedicalappointment@gmail.com>', // sender address
    to: dataSend.reciverEmail, // list of receivers
    subject: "Thông tin đặt lịch khám bệnh", // Subject line
    html: getBodyHTMLEmailSimple(dataSend),
  });
};

let getBodyHTMLEmailSimple = (dataSend) => {
  let result = "";
  result = `
        <h3>Xin chào ${dataSend.patientName}!</h3>
        <p>Bạn nhận được email này vì đã đặt lịch khám bệnh trên System Booking A Medical Appointment/p>
        <p>Thông tin đặt lịch khám bệnh:</p>
        <div><b>Thời gian: ${dataSend.time}</b></div>
        <div><b>Bác sĩ: ${dataSend.doctorName}</b></div>
        <p>Nếu các thông tin trên là đúng sự thật, vui lòng click vào đường link bên dưới để 
            xác nhận đặt lịch khám bệnh.
        </p>
        <div>
            <a href=${dataSend.redirectLink} target="_blank" >Click here</a>
        </div>
        <div>Xin chân thành cảm ơn, ${dataSend.patientName}!</div>
    `; // html body
  return result;
};

let getBodyHTMLEmailRemedy = (dataSend) => {
  let result = "";
  result = `
    <h3>Xin chào ${dataSend.patientName}!</h3>
    <p>Bạn nhận được email này vì đã đặt lịch khám bệnh trên System Booking A Medical Appointment thành công!</p>
    <p>Hẹn gặp ${dataSend.patientName} vào lúc: ${dataSend.timeType} ${dataSend.date} </p>
    <div>Xin chân thành cảm ơn!</div>
  `; // html body
  return result;
};

//send accept
let sendAttachmentRemedy = async (dataSend) => {
  return new Promise(async (resolve, reject) => {
    try {
      // create reusable transporter object using the default SMTP transport
      let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_APP, // generated ethereal user
          pass: process.env.EMAIL_APP_PASSWORD, // generated ethereal password
        },
      });

      // send mail with defined transport object
      let info = await transporter.sendMail({
        from: '"System Booking A Medical Appointment " <systembookingamedicalappointment@gmail.com>', // sender address
        to: dataSend.email, // list of receivers
        subject: "Kết quả đặt lịch khám bệnh", // Subject line
        html: getBodyHTMLEmailRemedy(dataSend),
        // attachments: [
        //   {
        //     filename: `remedy-${dataSend.patientId}-${new Date().getTime()}.png`,
        //     content: dataSend.imgBase64.split("base64,")[1],
        //     encoding: "base64",
        //   }
        // ]
      });
      resolve(true);
    } catch (e) {
      reject(e);
    }
  });
};

let getBodyHTMLEmailRefuse = (dataSend) => {
  let result = "";
  result = `
    <h3>Xin chào ${dataSend.patientName}!</h3>
    <p>Bạn nhận được email này vì đã đặt lịch khám bệnh trên System Booking A Medical Appointment thất bại!</p>
    <p>Vì lý do: ${dataSend.reason}</p>
    <p>Hẹn gặp ${dataSend.patientName} vào lúc: ${dataSend.date} </p>

    <div>Xin chân thành cảm ơn!</div>
  `; // html body
  return result;
};

// send refuse
let sendAttachmentRefuse = async (dataSend) => {
  return new Promise(async (resolve, reject) => {
    try {
      // create reusable transporter object using the default SMTP transport
      let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_APP, // generated ethereal user
          pass: process.env.EMAIL_APP_PASSWORD, // generated ethereal password
        },
      });

      // send mail with defined transport object
      let info = await transporter.sendMail({
        from: '"System Booking A Medical Appointment " <systembookingamedicalappointment@gmail.com>', // sender address
        to: dataSend.email, // list of receivers
        subject: "Kết quả đặt lịch khám bệnh", // Subject line
        html: getBodyHTMLEmailRefuse(dataSend),
      });
      // console.log("check infor send email: ");
      // console.log(info);
      resolve(true);
    } catch (e) {
      reject(e);
    }
  });
};
 


module.exports = {
  sendSimpleEmail: sendSimpleEmail,
  sendAttachmentRemedy: sendAttachmentRemedy,
  sendAttachmentRefuse: sendAttachmentRefuse,
};
