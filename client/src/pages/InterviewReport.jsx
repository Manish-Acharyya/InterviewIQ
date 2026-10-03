import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Step3Report from "../components/Step3Report";
import { getInterviewReport } from "../services/interviewservice";
function InterviewReport() {
  const [report, setReport] = useState(null);
  const { interviewId } = useParams();
  useEffect(() => {
    const fetchReport = async () => {
      try {
        console.log("Interview ID:", interviewId);
        const result = await getInterviewReport(interviewId);
        console.log("Interview Reports: ", result);
        setReport(result);
      } catch (error) {
        console.log("Get report error:", error);
        console.log("Response:", error.response?.data);
      }
    };
    if (interviewId) {
      fetchReport();
    }
  }, [interviewId]);

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Loading Report...</p>
      </div>
    );
  }

  return <Step3Report report={report} />;
}

export default InterviewReport;
