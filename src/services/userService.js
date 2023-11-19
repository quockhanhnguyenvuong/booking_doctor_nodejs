import db from "../models/index";
import bcrypt from "bcryptjs";
import emailServices from "./emailServices";
import nodemailer from "nodemailer";
import { trim } from "lodash";

const salt = bcrypt.genSaltSync(10);

let hashUserPassword = (password) => {
  return new Promise(async (resolve, reject) => {
    try {
      var hashPassword = await bcrypt.hashSync(password, salt);
      resolve(hashPassword);
    } catch (e) {
      reject(e);
    }
  });
};

let handleUserLogin = (email, password) => {
  return new Promise(async (resolve, reject) => {
    try {
      let userData = {};
      let isExist = await checkUserEmail(email);
      if (isExist) {
        // user already exist
        let user = await db.User.findOne({
          attributes: [
            "id",
            "email",
            "roleId",
            "password",
            "firstName",
            "lastName",
            "gender",
            "phonenumber",
            "address",
          ],
          where: { email: email },
          raw: true,
        });
        if (user) {
          //compare password
          let check = await bcrypt.compareSync(password, user.password);
          if (check) {
            userData.errCode = 0;
            userData.errMessage = "OK";
            delete user.password;
            userData.user = user;
          } else {
            userData.errCode = 3;
            userData.errMessage = "Wrong password!";
          }
        } else {
          userData.errCode = 2;
          userData.errMessage = `User's not found `;
        }
      } else {
        //return error
        userData.errCode = 1;
        userData.errMessage = `Your's Email isn't exist in your system`;
      }
      resolve(userData);
    } catch (e) {
      reject(e);
    }
  });
};

let checkUserEmail = (userEmail) => {
  return new Promise(async (resolve, reject) => {
    try {
      let user = await db.User.findOne({
        where: { email: userEmail },
      });
      if (user) {
        resolve(true);
      } else {
        resolve(false);
      }
    } catch (e) {
      reject(e);
    }
  });
};

//check code OTP 
let checkUserCode = (OTP, userEmail) => {
  return new Promise(async (resolve, reject) => {
    try {
      let user = await db.User.findOne({
        where: { code: OTP, email: userEmail },
      });
      if (user) {
        resolve(true);
      } else {
        resolve(false);
      }
    } catch (e) {
      reject(e);
    }
  });
};

let getAllUsers = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let users = "";
      if (userId === "ALL") {
        users = await db.User.findAll({
          attributes: {
            exclude: ["password"],
          },
        });
      } else if (userId && userId !== "ALL") {
        users = await db.User.findOne({
          where: { id: userId },
          attributes: {
            exclude: ["password"],
          },
        });
      }
      if (users && users.image) {
        users.image = new Buffer(users.image, "base64").toString("binary");
      }
      resolve(users);
    } catch (e) {
      reject(e);
    }
  });
};

let createNewUser = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let check = await checkUserEmail(data.email);
      if (check === true) {
        resolve({
          errCode: 1,
          message: "Your email is already in use, please try another email!",
        });
      } else {
        let hashPasswordFromBcrypt = await hashUserPassword(data.password);
        await db.User.create({
          email: data.email,
          password: hashPasswordFromBcrypt,
          firstName: data.firstName,
          lastName: data.lastName,
          address: data.address,
          phonenumber: data.phonenumber,
          gender: data.gender,
          roleID: data.roleID,
          positionID: data.positionID,
          image: data.image,
        });
        resolve({
          errCode: 0,
          message: "OK",
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let createNewPasswordService = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let hashPasswordFromBcrypt = await hashUserPassword(data.password);
      let user = await db.User.findOne({
        where: { email: data.email },
        raw: false,
      });
      if (user) {
        user.password = hashPasswordFromBcrypt;
        await user.save();

        resolve({
          errCode: 0,
          message: "Cập nhật mật khẩu thành công!",
        });
      }
      resolve({
        errCode: 0,
        message: "OK",
      });
    } catch (e) {
      reject(e);
    }
  });
};

let deleteUser = (userId) => {
  return new Promise(async (resolve, reject) => {
    let user = await db.User.findOne({
      where: { id: userId },
    });
    if (!user) {
      resolve({
        errCode: 2,
        errMessage: "The user is not exist!",
      });
    }
    await db.User.destroy({
      where: { id: userId },
    });

    resolve({
      errCode: 0,
      message: "The user is deleted!",
    });
  });
};

let updateUserData = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.id) {
        resolve({
          errCode: 2,
          message: "Missing requied parameters!",
        });
      }
      let user = await db.User.findOne({
        where: { id: data.id },
        raw: false,
      });
      if (user) {
        user.firstName = data.firstName;
        user.lastName = data.lastName;
        user.address = data.address;
        user.phonenumber = data.phonenumber;
        user.roleID = data.roleID;
        user.gender = data.gender;
        user.positionID = data.positionID;
        if (data.image) {
          user.image = data.image;
        } else {
          user.image = null;
        }
        // if (data && data.image) {
        //   data.image = new Buffer(data.image, "base64").toString("binary");
        // }
        await user.save();

        resolve({
          errCode: 0,
          message: "Update the user succeeds!",
        });
      } else {
        resolve({
          errCode: 1,
          errMessage: "User is not found!",
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let getAllCodeService = (typeInput) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!typeInput) {
        resolve({
          errCode: 1,
          errMessage: "Missing requied parameters",
        });
      } else {
        let res = {};
        let allcode = await db.Allcode.findAll({
          where: { type: typeInput },
        });
        res.errCode = 0;
        res.data = allcode;
        resolve(res);
      }
    } catch (e) {
      reject(e);
    }
  });
};

 //mã OTP ramdom
 const OTP = Math.floor(100000 + Math.random() * 900000);

let checkAccountUser = (data) => {
  return new Promise(async (resolve, reject) => {
    console.log("data email",data.email); 
    try {
      let check = await checkUserEmail(data.email);
      if (check === true) {
        //send email remedy
        await sendEmailGetPassword(data);

        //update mã OTP lên data
        await updateUserCode(OTP, data.email);
        resolve({
          errCode: 0,
          message: "OK",
        });
      } else {
        resolve({
          errCode: 1,
          message: "The email you entered dosen't exist in the system!!!",
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

//Gửi email lấy code để đổi mk
let sendEmailGetPassword = async (dataSend) => {
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
        from: '"System Booking A Medical Appointment " <bookingdoctor3@gmail.com>', // sender address
        to: dataSend.email, // list of receivers
        subject: "Reset Password System Booking A Medical Appointment", // Subject line
        html: getBodyHTMLEmailCode(dataSend),
      });
      console.log("Sending email end....");
      console.log("email: ", dataSend.email)
      console.log("OTP (email): ", OTP);
      resolve(true);
    } catch (e) {
      reject(e);
    }
  });
};


//body mail gửi code reset password
let getBodyHTMLEmailCode = (dataSend) => {
  let result = "";
  result = `
    <h3>Xin chào! </h3>
    <p>Bạn đang thực hiện xin cấp lại mật khẩu đăng nhập cổng giao dịch điện tử System Booking A Medical Appointment cho tài khoản ${dataSend.email}</p>
    <p>Đây là mã phê duyệt cho tài khoản của bạn: OTP - <b style="color:green">${OTP}</b> </p>
    <p> <small> (<b style="color:red">*</b>) Lưu ý: Mã OTP chỉ có giá trị trong vòng 5 phút.</small> </p>
    <div>Nếu bạn không phải là người gửi yêu cầu này, hãy đổi mật khẩu tài khoản ngay lập tức để tránh việc bị truy cập trái phép.</div>

    <div>Xin chân thành cảm ơn!</div>
  `; // html body
  return result;
};

//update mã OTP lên data
const updateUserCode = async (code,email) =>{
  try{
      await db.User.update(
        {code: code,
          // createdAt:Date.now(),
          // expiryAt:Date.now() + 12000,
        }, 
        {
          where: {email: email.trim() }
        }
      )
  }catch (error){
      console.log("error: ", error)
  }
}

let handleResetPassword = (data) => {
  return new Promise(async (resolve, reject) => {
    console.log("data OTP",data.code); 
    try {
      let check = await checkUserCode(data.code, data.email);
      
      if (check === true) {
        console.log("mã OTP đúng: ", data.code);
        console.log("email đúng: ", data.email);

        //update password
        await resetUserPassword(data);

        resolve({
          errCode: 0,
          message: "Mã OTP đúng",
        });
      } else {
        resolve({
          errCode: 1,
          message: "Code OTP Wrong!!!",
          
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

//update password
let resetUserPassword = (data) => {
  return new Promise(async (resolve, reject) => {
    let newPassword = await hashUserPassword(data.newPassword);
    try {
      if (!data.email) {
        resolve({
          errCode: 2,
          message: "Missing requied parameters!",
        });
      }
      let user = await db.User.findOne({
        where: { email: data.email },
        raw: false,
      });
      if (user) {
        user.password = newPassword;
        console.log("hash password: ",newPassword)
        await user.save();
        resolve({
          errCode: 0,
          message: "Update the user succeeds!",
        });
      } else {
        resolve({
          errCode: 1,
          errMessage: "User is not found!",
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = {
  handleUserLogin: handleUserLogin,
  getAllUsers: getAllUsers,
  createNewUser: createNewUser,
  deleteUser: deleteUser,
  updateUserData: updateUserData,
  getAllCodeService: getAllCodeService,
  createNewPasswordService: createNewPasswordService,
  checkAccountUser: checkAccountUser,
  updateUserCode: updateUserCode,
  handleResetPassword: handleResetPassword,
  resetUserPassword: resetUserPassword,
};
