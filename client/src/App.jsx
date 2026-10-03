import React from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import InterviewPage from "./pages/InterviewPage";
import InterviewHistory from "./pages/InterviewHistory";
import Pricing from "./pages/Pricing";
import InterviewReport from "./pages/InterviewReport";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <div>
      <GoogleOAuthProvider clientId="433851180836-qv26i5aesajbbh9s301fp9uso85ug6pe.apps.googleusercontent.com">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/interview" element={<InterviewPage />} />
              <Route path="/history" element={<InterviewHistory />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route
                path="/report/:interviewId"
                element={<InterviewReport />}
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </GoogleOAuthProvider>
    </div>
  );
}

export default App;

// client_id:433851180836-magdm55jjcukpfivog8dgh9pk0pas30g.apps.googleusercontent.com
