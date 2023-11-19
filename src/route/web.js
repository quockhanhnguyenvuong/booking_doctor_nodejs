import express from "express";
import homeController from "../controllers/homeController";
import userController from "../controllers/userController";

let router = express.Router();

let initWebRoutes = (app) => {
  router.get("/", homeController.getHomePage);
  router.get("/about", homeController.getAboutPage);
  router.get("/crud", homeController.getCRUD);
  router.post("/post-crud", homeController.postCRUD);
  router.get("/get-crud", homeController.displayGetCRUD);
  router.get("/edit-crud", homeController.getEditCRUD);
  router.post("/put-crud", homeController.putCRUD);
  router.get("/delete-crud", homeController.deleteCRUD);

  router.get("/api/get-all-users", userController.handleGetAllUsers);
  router.post("/api/login", userController.handleLogin);
  router.post("/api/create-new-user", userController.handleCreateNewUser);
  router.put("/api/edit-user", userController.handleEditUser);
  router.delete("/api/delete-user", userController.handleDeleteUser);
  router.get("/api/allcode", userController.getAllcode);
  router.post("/api/create-new-password", userController.createNewPassword);
  router.get('/api/get-schedule-doctor-by-date', doctorController.getScheduleByDate);
  router.get('/api/get-profile-doctor-by-id', doctorController.getProfileDoctorById);
  router.post('/api/patient-book-appointment', patientController.postBookAppointment)
  router.post('/api/verify-book-appointment', patientController.postVerifyBookAppointment);
  router.post("/api/send-remedy", doctorController.sendRemedy);
  router.post("/api/send-refuse", doctorController.sendRefuse);
  router.post("/api/get-confirm", doctorController.getConfirm);

  router.post("/api/check-email", userController.handleCheckAccount);
  router.post("/api/check-OTP-reset-Password", userController.handleResetPassword);

};

module.exports = initWebRoutes;
