const Exercise = require("../models/Exercises");

function parseSets(body) {
  // extended:true parses sets[weight][] as body.sets.weight (nested object)
  const setsData = body.sets || {};
  const weights = [].concat(setsData.weight || []);
  const reps = [].concat(setsData.reps || []);
  const completed = [].concat(setsData.isCompleted || []);

  return weights.map((w, i) => ({
    setNumber: i + 1,
    weight: parseFloat(w) || 0,
    reps: parseInt(reps[i]) || 0,
    isCompleted: completed.includes(String(i)),
  }));
}

const getAllExercises = async (req, res) => {
  const exercises = await Exercise.find({ createdBy: req.user._id });
  res.render("exercises", { exercises });
};

const createExercise = async (req, res) => {
  try {
    const { exerciseName, bodyPart, personalBestStatus, day } = req.body;
    console.log("BODY:", req.body); // add this temporarily
    const sets = parseSets(req.body);
    console.log("PARSED SETS:", sets); // and this

    await Exercise.create({
      exerciseName,
      bodyPart,
      personalBestStatus,
      sets,
      day: day || undefined,
      createdBy: req.user._id,
    });

    req.flash("info", "Exercise created successfully.");
    res.redirect("/exercises");
  } catch (e) {
    const errors = e.errors
      ? Object.values(e.errors).map((err) => err.message)
      : [e.message];
    res.render("exercise", { exercise: null, errors });
  }
};

const PutnewExercise = async (req, res) => {
  res.render("exercise", { exercise: null, errors: [] });
};

const editExercise = async (req, res) => {
  const exercise = await Exercise.findOne({
    _id: req.params.id,
    createdBy: req.user._id,
  });
  if (!exercise) {
    req.flash("error", "Exercise not found.");
    return res.redirect("/exercises");
  }
  res.render("exercise", { exercise, errors: [] });
};

const updateExercise = async (req, res) => {
  try {
    const { exerciseName, bodyPart, personalBestStatus, day } = req.body;
    const sets = parseSets(req.body);

    const exercise = await Exercise.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      {
        exerciseName,
        bodyPart,
        personalBestStatus,
        sets,
        day: day || undefined,
      },
      { new: true, runValidators: true },
    );
    if (!exercise) {
      req.flash("error", "Exercise not found.");
      return res.redirect("/exercises");
    }
    req.flash("info", "Exercise updated.");
    res.redirect("/exercises");
  } catch (e) {
    const errors = e.errors
      ? Object.values(e.errors).map((err) => err.message)
      : [e.message];
    const exercise = await Exercise.findOne({ _id: req.params.id });
    res.render("exercise", { exercise, errors });
  }
};

const deleteExercise = async (req, res) => {
  await Exercise.findOneAndDelete({
    _id: req.params.id,
    createdBy: req.user._id,
  });
  req.flash("info", "Exercise deleted.");
  res.redirect("/exercises");
};

module.exports = {
  getAllExercises,
  createExercise,
  PutnewExercise,
  editExercise,
  updateExercise,
  deleteExercise,
};
