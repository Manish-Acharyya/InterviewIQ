const express = require("express");
const isAuth = require("../middlewares/isAuth");
const upload = require("../middlewares/multer");
const {
  analyseResume,
  generateQuestion,
  submitAnswer,
  finishInterview,
  getMyInterviews,
  getInterviewReport,
} = require("../controller/interviewcontroller");

const interviewRouter = express.Router();

interviewRouter.post("/resume", isAuth, upload.single("resume"), analyseResume);
interviewRouter.post("/generate-questions", isAuth, generateQuestion);
interviewRouter.post("/submit-answer", isAuth, submitAnswer);
interviewRouter.post("/finish", isAuth, finishInterview);

interviewRouter.get("/get-interview", isAuth, getMyInterviews);
interviewRouter.get("/report/:id", isAuth, getInterviewReport);



module.exports = interviewRouter;
