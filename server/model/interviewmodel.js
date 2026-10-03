const mongo = require("mongoose");

const questionSchema = new mongo.Schema({
  question: String,
  difficulty: String,
  timeLimit: Number,
  answer: String,
  feedback: String,
  score: { type: Number, default: 0 },
  confidence: { type: Number, default: 0 },
  communication: { type: Number, default: 0 },
  correctness: { type: Number, default: 0 },
});


const interviewSchema = new mongo.Schema(
  {
    userId: {
      type: mongo.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    experience: {
      type: String,
      required: true,
    },
    mode: {
      type: String,
      enum: ["HR", "Technical"],
      required: true,
    },
    resumeText: {
      type: String,
    },
    questions: [questionSchema],
    finalScore: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Incompleted", "completed"],
      default: "Incompleted",
    },
  },
  { timestamps: true },
);

const interviewModel = mongo.model("Interview", interviewSchema);
module.exports = interviewModel;
