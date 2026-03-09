const mongoose = require("mongoose");

const SetSchema = new mongoose.Schema(
  {
    setNumber: {
      type: Number,
      //required:
    },
    weight: {
      type: Number,
      default: 0,
    },
    reps: {
      type: Number,
      default: 0,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false },
);

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
    sets: {
      type: [SetSchema],
      default: [],
    },
    day: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Exercise", ExerciseSchema);
