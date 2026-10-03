import React from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function Step3Report({ report }) {
  const navigate = useNavigate();

  if (!report) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-emerald-50 flex items-center justify-center">
        <p className="text-gray-500 text-lg">Report Loading...</p>
      </div>
    );
  }

  const {
    finalScore = 0,
    confidence = 0,
    communication = 0,
    correctness = 0,
    questionWiseScore = [],
  } = report;

  // ================= QUESTION CHART DATA =================

  const questionScoreData = questionWiseScore.map((score, index) => ({
    name: `Q${index + 1}`,
    score: score.score || 0,
  }));

  // ================= SKILLS =================

  const skills = [
    {
      label: "Confidence",
      value: confidence,
    },
    {
      label: "Communication",
      value: communication,
    },
    {
      label: "Correctness",
      value: correctness,
    },
  ];

  // ================= PERFORMANCE TEXT =================

  let performanceText = "";
  let shortTagline = "";

  if (finalScore >= 8) {
    performanceText = "Ready for job opportunities.";
    shortTagline = "Excellent clarity and structured responses.";
  } else if (finalScore >= 5) {
    performanceText = "Needs minor improvement before interviews.";
    shortTagline = "Good foundation, refine articulation.";
  } else {
    performanceText = "Significant improvement required.";
    shortTagline = "Work on clarity and confidence.";
  }

  const score = finalScore;
  const percentage = (score / 10) * 100;

  // ================= DOWNLOAD PDF =================

  const downloadPDF = () => {
    const doc = new jsPDF("p", "mm", "a4");

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;

    let currentY = 25;

    // TITLE
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);

    doc.setTextColor(34, 197, 94);

    doc.text("AI Interview Performance Report", pageWidth / 2, currentY, {
      align: "center",
    });

    currentY += 5;

    // UNDERLINE

    doc.setDrawColor(34, 197, 94);

    doc.line(margin, currentY + 2, pageWidth - margin, currentY + 2);

    currentY += 15;

    // FINAL SCORE BOX

    doc.setFillColor(240, 253, 244);

    doc.roundedRect(margin, currentY, contentWidth, 20, 4, 4, "F");

    doc.setFontSize(14);

    doc.setTextColor(0, 0, 0);

    doc.text(`Final Score: ${finalScore}/10`, pageWidth / 2, currentY + 12, {
      align: "center",
    });

    currentY += 30;

    // SKILLS BOX

    doc.setFillColor(249, 250, 251);

    doc.roundedRect(margin, currentY, contentWidth, 30, 4, 4, "F");

    doc.setFontSize(12);

    doc.text(`Confidence: ${confidence}`, margin + 10, currentY + 10);

    doc.text(`Communication: ${communication}`, margin + 10, currentY + 18);

    doc.text(`Correctness: ${correctness}`, margin + 10, currentY + 26);

    currentY += 45;

    // ADVICE

    let advice = "";

    if (finalScore >= 8) {
      advice =
        "Excellent performance. Maintain confidence and structure. Continue refining clarity and supporting answers with strong real-world examples.";
    } else if (finalScore >= 5) {
      advice =
        "Good foundation shown. Improve clarity and structure. Practice delivering concise, confident answers with stronger supporting examples.";
    } else {
      advice =
        "Focus on fundamentals and practice regularly. Work on communication, confidence, and structuring answers more clearly.";
    }

    doc.setFillColor(255, 255, 255);

    doc.setDrawColor(220);

    doc.roundedRect(margin, currentY, contentWidth, 35, 4, 4);

    doc.setFont("helvetica", "bold");

    doc.text("Professional Advice", margin + 10, currentY + 10);

    doc.setFont("helvetica", "normal");

    doc.setFontSize(11);

    const splitAdvice = doc.splitTextToSize(advice, contentWidth - 20);

    doc.text(splitAdvice, margin + 10, currentY + 20);

    currentY += 50;

    // QUESTION TABLE

    autoTable(doc, {
      startY: currentY,

      margin: {
        left: margin,
        right: margin,
      },

      head: [["#", "Question", "Score", "Feedback"]],

      body: questionWiseScore.map((q, i) => [
        `${i + 1}`,
        q.question || "N/A",
        `${q.score || 0}/10`,
        q.feedback || "No feedback available",
      ]),

      styles: {
        fontSize: 9,
        cellPadding: 5,
        valign: "top",
      },

      headStyles: {
        fillColor: [34, 197, 94],
        textColor: 255,
        halign: "center",
      },

      columnStyles: {
        0: {
          cellWidth: 10,
          halign: "center",
        },

        1: {
          cellWidth: 55,
        },

        2: {
          cellWidth: 20,
          halign: "center",
        },

        3: {
          cellWidth: "auto",
        },
      },

      alternateRowStyles: {
        fillColor: [249, 250, 251],
      },
    });

    doc.save("AI_Interview_Report.pdf");
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-emerald-50 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* ================= PAGE CONTAINER ================= */}

      <div className="max-w-7xl mx-auto">
        {/* ================= HEADER ================= */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 mb-8">
          {/* LEFT HEADER */}

          <div className="flex items-start gap-4">
            <button
              onClick={() => navigate("/history")}
              className="mt-1 w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm hover:shadow-md transition-all duration-200"
            >
              <FaArrowLeft className="text-gray-600 text-sm" />
            </button>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                Interview Analytics Dashboard
              </h1>

              <p className="text-gray-500 text-sm mt-1">
                AI-powered performance insights
              </p>
            </div>
          </div>

          {/* DOWNLOAD BUTTON */}

          <button
            onClick={downloadPDF}
            className="self-start sm:self-auto bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 font-semibold text-sm"
          >
            Download PDF
          </button>
        </div>

        {/* ================= MAIN GRID ================= */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ================================================= */}
          {/* LEFT SECTION */}
          {/* ================================================= */}

          <div className="space-y-6">
            {/* ================= OVERALL PERFORMANCE ================= */}

            <motion.div
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 sm:p-7"
            >
              <h3 className="text-sm font-medium text-gray-500 text-center mb-6">
                Overall Performance
              </h3>

              {/* SCORE */}

              <div className="w-24 h-24 mx-auto">
                <CircularProgressbar
                  value={percentage}
                  text={`${score}/10`}
                  styles={buildStyles({
                    textSize: "20px",
                    pathColor: "#10b981",
                    textColor: "#ef4444",
                    trailColor: "#e5e7eb",
                  })}
                />
              </div>

              {/* OUT OF 10 */}

              <p className="text-center text-xs text-gray-400 mt-3">
                Out of 10
              </p>

              {/* PERFORMANCE */}

              <div className="text-center mt-4">
                <p className="font-semibold text-gray-800 text-sm">
                  {performanceText}
                </p>

                <p className="text-gray-400 text-xs mt-1">{shortTagline}</p>
              </div>
            </motion.div>

            {/* ================= SKILL EVALUATION ================= */}

            <motion.div
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.1,
              }}
              className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 sm:p-7"
            >
              <h3 className="text-base font-semibold text-gray-700 mb-6">
                Skill Evaluation
              </h3>

              <div className="space-y-5">
                {skills.map((skill, index) => (
                  <div key={index}>
                    {/* LABEL + VALUE */}

                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-700">
                        {skill.label}
                      </span>

                      <span className="text-sm font-semibold text-emerald-500">
                        {skill.value}
                      </span>
                    </div>

                    {/* PROGRESS BAR */}

                    <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                        style={{
                          width: `${Math.min(skill.value * 10, 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ================================================= */}
          {/* RIGHT SECTION */}
          {/* ================================================= */}

          <div className="lg:col-span-2 space-y-6">
            {/* ================= PERFORMANCE TREND ================= */}

            <motion.div
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 p-5 sm:p-7"
            >
              <h3 className="text-base font-semibold text-gray-700 mb-5">
                Performance Trend
              </h3>

              <div className="h-56 sm:h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={questionScoreData}
                    margin={{
                      top: 5,
                      right: 5,
                      left: -20,
                      bottom: 0,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={true} />

                    <XAxis
                      dataKey="name"
                      tick={{
                        fontSize: 12,
                      }}
                    />

                    <YAxis
                      domain={[0, 10]}
                      ticks={[0, 3, 6, 10]}
                      tick={{
                        fontSize: 12,
                      }}
                    />

                    <Tooltip />

                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#22c55e"
                      fill="#bbf7d0"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* ================= QUESTION BREAKDOWN ================= */}

            <motion.div
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.15,
              }}
              className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 p-5 sm:p-7"
            >
              <h3 className="text-base font-semibold text-gray-700 mb-6">
                Question Breakdown
              </h3>

              <div className="space-y-5">
                {questionWiseScore.map((q, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-xl border border-gray-100 p-4 sm:p-5"
                  >
                    {/* QUESTION HEADER */}

                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                      <div className="flex-1">
                        <p className="text-xs text-gray-400 mb-1">
                          Question {index + 1}
                        </p>

                        <p className="font-semibold text-gray-800 text-sm leading-relaxed">
                          {q.question || "Question not available"}
                        </p>
                      </div>

                      {/* SCORE */}

                      <div className="bg-emerald-100 text-emerald-600 rounded-full font-bold text-xs px-3 py-1 whitespace-nowrap self-start">
                        {q.score ?? 0}/10
                      </div>
                    </div>

                    {/* AI FEEDBACK */}

                    <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-lg">
                      <p className="text-xs text-emerald-600 font-semibold mb-1">
                        AI Feedback
                      </p>

                      <p className="text-sm text-gray-600 leading-relaxed">
                        {q.feedback && q.feedback.trim() !== ""
                          ? q.feedback
                          : "No feedback available for this question."}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Step3Report;
