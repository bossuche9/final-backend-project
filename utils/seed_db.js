const Exercise = require("../models/Exercises");
const User = require("../models/User");
const { faker } = require("@faker-js/faker");
const FactoryBot = require("factory-bot");
const mongoose = require("mongoose");
require("dotenv").config();

const testUserPassword = faker.internet.password();
const factory = FactoryBot.factory;
const factoryAdapter = new FactoryBot.MongooseAdapter();
factory.setAdapter(factoryAdapter);

factory.define("exercise", Exercise, {
  exerciseName: () =>
    [
      "Bench Press",
      "T-bar Row",
      "Leg Extension",
      "Shoulder press",
      "Bicep curl",
      "RDL",
    ][Math.floor(6 * Math.random())],
  bodyPart: () =>
    ["chest", "back", "legs", "shoulders", "arms", "core"][
      Math.floor(6 * Math.random())
    ],
  personalBestStatus: () =>
    ["New personal record", "No personal record", "Bad sessions regressed"][
      Math.floor(3 * Math.random())
    ],
  sets: () => [
    {
      setNumber: 1,
      weight: Math.floor(Math.random() * 200),
      reps: Math.floor(Math.random() * 15) + 1,
      isCompleted: false,
    },
  ],
});

factory.define("user", User, {
  name: () => faker.person.fullName(),
  email: () => faker.internet.email(),
  password: () => faker.internet.password(),
});

const seed_db = async () => {
  let testUser = null;
  try {
    const mongoURL = process.env.MONGO_URI_TEST;
    await mongoose.connect(mongoURL);
    await Exercise.deleteMany({});
    await User.deleteMany({});
    testUser = await factory.create("user", { password: testUserPassword });
    await factory.createMany("exercise", 20, { createdBy: testUser._id });
  } catch (e) {
    console.log("database error");
    console.log(e.message);
    throw e;
  }
  return testUser;
};

module.exports = { testUserPassword, factory, seed_db };
