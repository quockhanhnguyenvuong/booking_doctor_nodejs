require("dotenv").config();
import db from "../models/index";
import _, { reject } from "lodash";
const MAX_NUMBER_SCHEDULE = process.env.MAX_NUMBER_SCHEDULE;
import emailServices from "../services/emailServices";

let getTopDoctorHome = (limitInput) => {
  return new Promise(async (resolve, reject) => {
    try {
      let users = await db.User.findAll({
        limit: limitInput,
        where: { roleID: "R2" },
        order: [["createdAt", "DESC"]],
        attributes: {
          exclude: ["password"],
        },
        include: [
          { model: db.Allcode, as: "positionData", attributes: ["valueVI"] },
          { model: db.Allcode, as: "genderData", attributes: ["valueVI"] },
        ],
        raw: true,
        nest: true,
      });
      resolve({
        errCode: 0,
        data: users,
      });
    } catch (e) {
      reject(e);
    }
  });
};

let getAllDoctors = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let doctors = await db.User.findAll({
        where: { roleID: "R2" },
        attributes: {
          exclude: ["password", "image"],
        },
      });

      resolve({
        errCode: 0,
        data: doctors,
      });
    } catch (e) {
      reject(e);
    }
  });
};

let saveDetailInforDoctor = (inputData) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        !inputData.doctorId ||
        !inputData.contentHTML ||
        !inputData.contentMarkdown ||
        !inputData.action ||
        !inputData.selectPayment ||
        !inputData.selectProvince ||
        !inputData.priceOnId ||
        !inputData.priceOffId ||
        !inputData.nameClinic ||
        !inputData.addressClinic ||
        !inputData.note ||
        !inputData.selectFormality
      ) {
        let checkObj = checkRequiredFields(inputData);
        if (checkObj.isValid === false) {
          resolve({
            errCode: 1,
            errMessage: "Missing parameter: ${checkObj.element}",
          });
        }
      } else {
        if (inputData.action === "CREATE") {
          await db.Markdown.create({
            contentHTML: inputData.contentHTML,
            contentMarkdown: inputData.contentMarkdown,
            description: inputData.description,
            doctorId: inputData.doctorId,
          });

          await db.Doctor_Infor.create({
            doctorId: inputData.doctorId,
            priceOnId: inputData.priceOnId,
            priceOffId: inputData.priceOffId,
            paymentId: inputData.selectPayment.label,
            provinceId: inputData.selectProvince.label,
            formality: inputData.selectFormality.label,
            nameClinic: inputData.nameClinic,
            addressClinic: inputData.addressClinic,
            note: inputData.note,
            specialtyId: inputData.specialtyId,
            clinicId: inputData.clinicId,
          });
        } else if (inputData.action === "EDIT") {
          let doctorMarkdown = await db.Markdown.findOne({
            where: { doctorId: inputData.doctorId },
            raw: false,
          });
          if (doctorMarkdown) {
            doctorMarkdown.contentHTML = inputData.contentHTML;
            doctorMarkdown.contentMarkdown = inputData.contentMarkdown;
            doctorMarkdown.description = inputData.description;
            doctorMarkdown.updateAt = new Date();
            await doctorMarkdown.save();
          }
          let doctorInfor = await db.Doctor_Infor.findOne({
            where: { doctorId: inputData.doctorId },
            raw: false,
          });
          if (doctorInfor) {
            doctorInfor.doctorId = inputData.doctorId;
            doctorInfor.priceOnId = inputData.priceOnId;
            doctorInfor.priceOffId = inputData.priceOffId;
            doctorInfor.paymentId = inputData.selectPayment.label;
            doctorInfor.provinceId = inputData.selectProvince.label;
            doctorInfor.formality = inputData.selectFormality.label;
            doctorInfor.nameClinic = inputData.nameClinic;
            doctorInfor.addressClinic = inputData.addressClinic;
            doctorInfor.note = inputData.note;
            doctorInfor.specialtyId = inputData.specialtyId;
            doctorInfor.clinicId = inputData.clinicId;
            await doctorInfor.save();
          }
        }

        resolve({
          errCode: 0,
          errMessage: "Save infor doctor succeed!",
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let bulkCreateScheduleService = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.arrSchedule || !data.doctorId || !data.formatedDate) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameter!",
        });
      } else {
        let schedule = data.arrSchedule;
        if (schedule && schedule.length > 0) {
          schedule = schedule.map((item) => {
            item.maxNumber = MAX_NUMBER_SCHEDULE;
            return item;
          });
        }
        // get all existing data
        let existing = await db.Schedule.findAll({
          where: { doctorId: data.doctorId, date: data.formatedDate },
          attributes: ["timeType", "date", "doctorId", "maxNumber"],
          raw: true,
        });

        // compare different
        let toCreate = _.differenceWith(schedule, existing, (a, b) => {
          return a.timeType === b.timeType && +a.date === +b.date;
        });

        //create data
        if (toCreate && toCreate.length > 0) {
          await db.Schedule.bulkCreate(toCreate);
        }
        resolve({
          errCode: 0,
          errMessage: "Okay",
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

//get detail doctor by id
let getDetailDoctorService = (inpuId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!inpuId) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameter!",
        });
      } else {
        let data = await db.User.findOne({
          where: {
            id: inpuId,
          },
          attributes: {
            exclude: ["password"],
          },
          include: [
            {
              model: db.Markdown,
              attributes: ["description", "contentHTML", "contentMarkdown"],
            },
            { model: db.Allcode, as: "positionData", attributes: ["valueVi"] },
            {
              model: db.Doctor_Infor,
              attributes: {
                exclude: ["id", "doctorId"],
              },
              include: [
                {
                  model: db.Allcode,
                  as: "priceOnTypeData",
                  attributes: ["valueVI"],
                },
                {
                  model: db.Allcode,
                  as: "priceOffTypeData",
                  attributes: ["valueVi"],
                },
                {
                  model: db.Allcode,
                  as: "provinceTypeData",
                  attributes: ["valueVi"],
                },
                {
                  model: db.Allcode,
                  as: "paymentTypeData",
                  attributes: ["valueVi"],
                },
              ],
            },
          ],
          raw: false,
          nest: true,
        });
        if (data && data.image) {
          data.image = new Buffer(data.image, "base64").toString("binary");
        }
        if (!data) {
          data = {};
        }
        resolve({
          errCode: 0,
          data: data,
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};



let getScheduleByDate = (doctorId, date) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!doctorId || !date) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parrameter",
        });
      } else {
        let dataSchedule = await db.Schedule.findAll({
          where: {
            doctorId: doctorId,
            date: date,
          },

          include: [
            {
              model: db.Allcode,
              as: "timeTypeData",
              attributes: ["valueVI"],
            },
            {
              model: db.User,
              as: "doctorData",
              attributes: ["firstName", "lastName"],
            },
          ],
          raw: false,
          nest: true,
        });
        if (!dataSchedule) dataSchedule = [];
        resolve({
          errCode: 0,
          data: dataSchedule,
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let getProfileDoctorByIdService = (inputId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!inputId) {
        resolve({
          errCode: 1,
          errMessage: "Missing parameters",
        });
      } else {
        let data = await db.User.findOne({
          where: {
            id: inputId,
          },
          attributes: {
            exclude: ["id", "doctorId"],
          },
          include: [
            {
              model: db.Markdown,
              attributes: ["description", "contentHTML", "contentMarkdown"],
            },
            {
              model: db.Allcode,
              as: "positionData",
              attributes: ["valueVi"],
            },
            {
              model: db.Doctor_Infor,
              attributes: {
                exclude: ["id", "doctorId"],
              },
              include: [
                {
                  model: db.Allcode,
                  as: "priceOnTypeData",
                  attributes: ["valueVi"],
                },
                {
                  model: db.Allcode,
                  as: "priceOffTypeData",
                  attributes: ["valueVi"],
                },
                {
                  model: db.Allcode,
                  as: "provinceTypeData",
                  attributes: ["valueVi"],
                },
                {
                  model: db.Allcode,
                  as: "paymentTypeData",
                  attributes: ["valueVi"],
                },
              ],
            },
          ],
          raw: false,
          nest: true,
        });
        if (data && data.image) {
          data.image = new Buffer(data.image, "base64").toString("binary");
        }
        if (!data) data = {};
        resolve({
          errCode: 0,
          data: data,
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let getExtraInforDoctorByIdService = (inputId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!inputId) {
        resolve({
          errCode: 1,
          errMessage: "Missing parameters",
        });
      } else {
        let data = await db.Doctor_Infor.findOne({
          where: {
            doctorId: inputId,
          },
          attributes: {
            exclude: ["id"],
          },
          include: [
            {
              model: db.User,
              attributes: ["firstName", "lastName"],
            },
            {
              model: db.Allcode,
              as: "priceOnTypeData",
              attributes: ["valueVi"],
            },
            {
              model: db.Allcode,
              as: "priceOffTypeData",
              attributes: ["valueVi"],
            },
            {
              model: db.Allcode,
              as: "provinceTypeData",
              attributes: ["valueVi"],
            },
            {
              model: db.Allcode,
              as: "paymentTypeData",
              attributes: ["valueVi"],
            },
          ],
          raw: false,
          nest: true,
        });
        if (!data) data = {};
        resolve({
          errCode: 0,
          data: data,
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let getListPatientForDoctor = (doctorId, date) => {
  return new Promise(async (resolve, reject) => {
    // console.log(date);
    try {
      if (!doctorId || !date) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parrameter",
        });
      } else {
        let data = await db.Booking.findAll({
          where: {
            // statusId: "S2",
            doctorId: doctorId,
            date: date,
          },
          attributes: [
            "statusId",
            "doctorId",
            "patientId",
            "bookingType",
            "reason",
            "timeType",
          ],
          include: [
            {
              model: db.User,
              as: "patientData",
              attributes: [
                "email",
                "firstName",
                "lastName",
                "address",
                "gender",
              ],
              include: [
                {
                  model: db.Allcode,
                  as: "genderData",
                  attributes: ["valueVI"],
                },
              ],
            },
            {
              model: db.Allcode,
              as: "timeTypeDataPatient",
              attributes: ["valueVI"],
            },
          ],
          raw: false,
          nest: true,
        });
        resolve({
          errCode: 0,
          data: data,
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

// let sendRemedy = (data) => {
//   return new Promise(async (resolve, reject) => {
//     // console.log("send remedy", data);
//     try {
//       if (!data.email || !data.doctorId || !data.patientId) {
//         resolve({
//           errCode: 1,
//           errMessage: "Missing required parrameter",
//         });
//       } else {
//         //Update patient status
//         let appointment = await db.Booking.findOne({
//           where: {
//             doctorId: data.doctorId,
//             patientId: data.patientId,
//             // timeType: data.timeType,
//             statusId: "S2",
//           },
//           raw: false,
//         });

//         if (appointment) {
//           appointment.statusId = "S3";
//           await appointment.save();
//         }
//         //send email remedy
//         await emailServices.sendAttachmentRemedy(data);

//         resolve({
//           errCode: 0,
//           errMessage: "OK",
//         });
//       }
//     } catch (e) {
//       reject(e);
//     }
//   });
// };

let getConfirm = (data) => {
  return new Promise(async (resolve, reject) => {
    console.log(data);
    try {
      if (!data.doctorId || !data.patientId) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parrameter",
        });
      } else {
        let appointment = await db.Booking.findOne({
          where: {
            doctorId: data.doctorId,
            patientId: data.patientId,
            statusId: "S3",
          },
          raw: false,
        });
        if (appointment) {
          appointment.statusId = "S5";
          await appointment.save();
        }
        resolve({
          errCode: 0,
          errMessage: "OK",
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let sendRemedy = (data) => {
  return new Promise(async (resolve, reject) => {
    // console.log("send remedy", data);
    try {
      if (!data.email || !data.doctorId || !data.patientId) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parrameter",
        });
      } else {
        //Update patient status
        let appointment = await db.Booking.findOne({
          where: {
            doctorId: data.doctorId,
            patientId: data.patientId,
            // timeType: data.timeType,
            statusId: "S2",
          },
          raw: false,
        });

        if (appointment) {
          appointment.statusId = "S3";
          await appointment.save();
        }
        //send email remedy
        await emailServices.sendAttachmentRemedy(data);

        resolve({
          errCode: 0,
          errMessage: "OK",
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let sendRefuse = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.email || !data.doctorId || !data.patientId || !data.reason) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parrameter",
        });
      } else {
        //Update patient status
        let appointment = await db.Booking.findOne({
          where: {
            doctorId: data.doctorId,
            patientId: data.patientId,
            // timeType: data.timeType,
            statusId: "S2",
          },
          raw: false,
        });

        if (appointment) {
          (appointment.statusId = "S4"), await appointment.save();
        }
        //send email remedy
        await emailServices.sendAttachmentRefuse(data);

        resolve({
          errCode: 0,
          errMessage: "OK",
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let checkRequiredFields = (inputData) => {
  let arrFields = [
    "doctorId",
    "contentHTML",
    "contentMarkdown",
    "action",
    "selectPayment",
    "selectProvince",
    "priceOnId",
    "priceOffId",
    "nameClinic",
    "addressClinic",
    "note",
    "selectFormality",
    "specialtyId",
    "clinicId",
  ];
  let isValid = true;
  let element = "";
  for (let i = 0; i < arrFields.length; i++) {
    if (!inputData[arrFields[i]]) {
      isValid = false;
      element = arrFields[i];
      break;
    }
  }
  return {
    isValid: isValid,
    element: element,
  };
};

module.exports = {
  getTopDoctorHome: getTopDoctorHome,
  getAllDoctors: getAllDoctors,
  saveDetailInforDoctor: saveDetailInforDoctor,
  getDetailDoctorService: getDetailDoctorService,
  bulkCreateScheduleService: bulkCreateScheduleService,
  getScheduleByDate: getScheduleByDate,
  getProfileDoctorByIdService: getProfileDoctorByIdService,
  getExtraInforDoctorByIdService: getExtraInforDoctorByIdService,
  getListPatientForDoctor: getListPatientForDoctor,
  sendRemedy: sendRemedy,
  sendRefuse: sendRefuse,
  checkRequiredFields: checkRequiredFields,
  getConfirm: getConfirm,
};
