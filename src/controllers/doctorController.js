import doctorService from "../services/doctorService";


let sendRemedy = async (req, res) => {
    try {
      let infor = await doctorService.sendRemedy(req.body);
      return res.status(200).json(infor);
    } catch (e) {
      console.log(e);
      return res.status(200).json({
        errCode: -1,
        errMessage: "Error from server",
      });
    }
  };
  
  let sendRefuse = async (req, res) => {
    try {
      let infor = await doctorService.sendRefuse(req.body);
      return res.status(200).json(infor);
    } catch (e) {
      console.log(e);
      return res.status(200).json({
        errCode: -1,
        errMessage: "Error from server",
      });
    }
  };
  
  let getConfirm = async (req, res) => {
    try {
      let infor = await doctorService.getConfirm(req.body);
      return res.status(200).json(infor);
    } catch (e) {
      console.log(e);
      return res.status(200).json({
        errCode: -1,
        errMessage: "Error from server",
      });
    }
  };

  module.exports = {
    sendRemedy: sendRemedy,
    sendRefuse: sendRefuse,
    getConfirm: getConfirm,
  };
