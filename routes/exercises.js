const express = require("express");
const router = express.Router();

const {
  getAllExercises,
  createExercise,
  PutnewExercise,
  editExercise,
  updateExercise,
  deleteExercise,
} = require("../controllers/exercises");

router.route("/").get(getAllExercises).post(createExercise);
router.get("/new", PutnewExercise);
router.get("/edit/:id", editExercise);
router.post("/update/:id", updateExercise);
router.post("/delete/:id", deleteExercise);

module.exports = router;
