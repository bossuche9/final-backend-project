const mongoose = require("mongoose");
const ExerciseSchema = new mongoose.Schema(
  {
    exerciseName: {
      type: String,
      required: [true, "Please provide exercise name"],
      maxlength: 50,
    },
    bodyPart: {
      type: String,
      required: [
        true,
        "Please provide what part of the body the exercise targets",
      ],
      maxlength: 50,
    },
    personalBestStatus: {
      type: String,
      enum: [
        "New personal record",
        "No personal record",
        "Bad sessions regressed",
      ],
      default: "No personal record",
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide user"],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Exercise", ExerciseSchema);
