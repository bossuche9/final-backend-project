const puppeteer = require("puppeteer");
require("../app");
const { seed_db, testUserPassword } = require("../utils/seed_db");
const Exercise = require("../models/Exercises");

let testUser = null;
let page = null;
let browser = null;

describe("exercises-ejs puppeteer test", function () {
  before(async function () {
    this.timeout(10000);
    browser = await puppeteer.launch();
    page = await browser.newPage();
    await page.goto("http://localhost:3000");
  });
  after(async function () {
    this.timeout(5000);
    await browser.close();
  });

  describe("got to site", function () {
    it("should have completed a connection", async function () {});
  });

  describe("index page test", function () {
    this.timeout(10000);
    it("finds the index page logon link", async () => {
      this.logonLink = await page.waitForSelector(
        "a ::-p-text(Click this link to logon)",
      );
    });
    it("gets to the logon page", async () => {
      await this.logonLink.click();
      await page.waitForNavigation();
      await page.waitForSelector('input[name="email"]');
    });
  });

  describe("logon page test", function () {
    this.timeout(20000);
    it("resolves all the fields", async () => {
      this.email = await page.waitForSelector('input[name="email"]');
      this.password = await page.waitForSelector('input[name="password"]');
      this.submit = await page.waitForSelector("button ::-p-text(Logon)");
    });
    it("sends the logon", async () => {
      testUser = await seed_db();
      await this.email.type(testUser.email);
      await this.password.type(testUserPassword);
      await this.submit.click();
      await page.waitForNavigation();
      await page.waitForSelector(
        `p ::-p-text(User ${testUser.name} is logged on.)`,
      );
      await page.waitForSelector(
        "a ::-p-text(Click this link to view exercises.)",
      );
      await page.waitForSelector('a[href="/exercises"]');
      const copyr = await page.waitForSelector("p ::-p-text(copyright)");
      const copyrText = await copyr.evaluate((el) => el.textContent);
      console.log("copyright text: ", copyrText);
    });
  });

  describe("puppeteer exercise operations", function () {
    this.timeout(20000);

    it("navigates to the exercise list and finds 20 entries", async function () {
      const { expect } = await import("chai");

      const exercisesLink = await page.waitForSelector('a[href="/exercises"]');
      await exercisesLink.click();
      await page.waitForNavigation();

      await page.waitForSelector("#exercises-table");

      const content = await page.content();

      const rows = content.split("<tr>").length - 1;
      console.log("total <tr> count (including header):", rows);
      expect(rows).to.be.at.least(21);
    });

    it("navigates to the Add Exercise form and resolves fields", async function () {
      const { expect } = await import("chai");

      this.addLink = await page.waitForSelector('a[href="/exercises/new"]');
      await this.addLink.click();
      await page.waitForNavigation();

      this.exerciseNameField = await page.waitForSelector(
        'input[name="exerciseName"]',
      );
      this.bodyPartField = await page.waitForSelector('input[name="bodyPart"]');
      this.submitButton = await page.waitForSelector(
        "button ::-p-text(Create)",
      );

      expect(this.exerciseNameField).to.not.be.null;
      expect(this.bodyPartField).to.not.be.null;
      expect(this.submitButton).to.not.be.null;
    });

    it("adds a new exercise and verifies it was saved to the database", async function () {
      const { expect } = await import("chai");

      const testExerciseName = "Puppeteer Bench Press";
      const testBodyPart = "chest";

      await this.exerciseNameField.type(testExerciseName);
      await this.bodyPartField.type(testBodyPart);

      await this.submitButton.click();
      await page.waitForNavigation();

      await page.waitForSelector("#exercises-table");

      const content = await page.content();
      expect(content).to.include(testExerciseName);

      const saved = await Exercise.findOne({
        exerciseName: testExerciseName,
        createdBy: testUser._id,
      });

      expect(saved).to.not.be.null;
      expect(saved.exerciseName).to.equal(testExerciseName);
      expect(saved.bodyPart).to.equal(testBodyPart);
    });
  });
});
