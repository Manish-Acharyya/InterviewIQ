import axios from "axios";

const api = axios.create({
  baseURL: "https://interviewiq-7ysv.onrender.com/api",
  withCredentials: true,
});
export default api;
