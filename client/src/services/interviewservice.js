import api from "./api";

// Upload resume and analyse it
export const analyseResume = async (resumeFile) => {
  const formData = new FormData();

  formData.append("resume", resumeFile);

  const response = await api.post("/interview/resume", formData);

  return response.data;
};


// Generate interview questions
export const generateQuestion = async (interviewData) => {
  const response = await api.post(
    "/interview/generate-questions",
    interviewData
  );

  return response.data;
};


// Submit an answer
export const submitAnswerService = async (answerData) => {
  const response = await api.post(
    "/interview/submit-answer",
    answerData
  );

  return response.data;
};


// Finish interview
export const finishInterviewService = async (interviewData) => {
  const response = await api.post(
    "/interview/finish",
    interviewData
  );

  return response.data;
};


// Get logged-in user's interviews
export const getMyInterviewsService = async () => {
  const response = await api.get(
    "/interview/get-interview"
  );

  return response.data;
};


// Get a particular interview report
export const getInterviewReport = async (interviewId) => {
  const response = await api.get(
    `/interview/report/${interviewId}`
  );

  return response.data;
};