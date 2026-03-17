const { app } = require("../app");
const { factory, seed_db, testUserPassword } = require("../utils/seed_db");
const get_chai = require("../utils/get_chai");
const Exercise = require("../models/Exercises");

describe("testing CRUD operations", function () {
  before(async function () {
    const { expect, request } = await get_chai();

    this.test_user = await seed_db();

    const firstExercise = await Exercise.findOne({
      createdBy: this.test_user._id,
    });
    this.exerciseId = firstExercise._id;

    let res = await request(app).get("/sessions/logon").send();
    const textNoLineEnd = res.text.replaceAll("\n", "");
    this.csrfToken = /_csrf\" value=\"(.*?)\"/.exec(textNoLineEnd)[1];

    let cookies = res.headers["set-cookie"];
    this.csrfCookie = cookies.find((c) => c.startsWith("__Host-csrfToken"));

    const dataToPost = {
      email: this.test_user.email,
      password: testUserPassword,
      _csrf: this.csrfToken,
    };

    res = await request(app)
      .post("/sessions/logon")
      .set("Cookie", this.csrfCookie)
      .set("content-type", "application/x-www-form-urlencoded")
      .redirects(0)
      .send(dataToPost);

    cookies = res.headers["set-cookie"];
    this.sessionCookie = cookies.find((c) => c.startsWith("connect.sid"));

    expect(this.csrfToken).to.not.be.undefined;
    expect(this.csrfCookie).to.not.be.undefined;
    expect(this.sessionCookie).to.not.be.undefined;
  });

  it("should get the exercise list with 20 seeded entries", async function () {
    const { expect, request } = await get_chai();

    const res = await request(app)
      .get("/exercises")
      .set("Cookie", `${this.csrfCookie}; ${this.sessionCookie}`)
      .send();

    expect(res).to.have.status(200);
    const pageParts = res.text.split("<tr>");
    expect(pageParts.length).to.equal(22);
  });

  it("should add a new exercise entry", async function () {
    const { expect, request } = await get_chai();

    const newExercise = await factory.build("exercise");

    const res = await request(app)
      .post("/exercises")
      .set("Cookie", `${this.csrfCookie}; ${this.sessionCookie}`)
      .type("form")
      .send({
        exerciseName: newExercise.exerciseName,
        bodyPart: newExercise.bodyPart,
        personalBestStatus: newExercise.personalBestStatus,
        _csrf: this.csrfToken,
      });

    expect(res).to.have.status(200);

    const exercises = await Exercise.find({ createdBy: this.test_user._id });
    expect(exercises.length).to.equal(21);
  });

  // "show" = the edit form page, since there's no dedicated show route
  it("should show a single exercise entry", async function () {
    const { expect, request } = await get_chai();

    const res = await request(app)
      .get(`/exercises/edit/${this.exerciseId}`)
      .set("Cookie", `${this.csrfCookie}; ${this.sessionCookie}`)
      .send();

    expect(res).to.have.status(200);
  });

  it("should update an exercise entry", async function () {
    const { expect, request } = await get_chai();

    const updatedExercise = await factory.build("exercise");

    const res = await request(app)
      .post(`/exercises/update/${this.exerciseId}`)
      .set("Cookie", `${this.csrfCookie}; ${this.sessionCookie}`)
      .type("form")
      .send({
        exerciseName: updatedExercise.exerciseName,
        bodyPart: updatedExercise.bodyPart,
        personalBestStatus: updatedExercise.personalBestStatus,
        _csrf: this.csrfToken,
      });

    expect(res).to.have.status(200);

    const updated = await Exercise.findById(this.exerciseId);
    expect(updated.exerciseName).to.equal(updatedExercise.exerciseName);
  });

  it("should delete an exercise entry", async function () {
    const { expect, request } = await get_chai();

    const res = await request(app)
      .post(`/exercises/delete/${this.exerciseId}`)
      .set("Cookie", `${this.csrfCookie}; ${this.sessionCookie}`)
      .type("form")
      .send({ _csrf: this.csrfToken });

    expect(res).to.have.status(200);

    const exercises = await Exercise.find({ createdBy: this.test_user._id });
    // 20 seeded + 1 added - 1 deleted = 20
    expect(exercises.length).to.equal(20);
  });
});
