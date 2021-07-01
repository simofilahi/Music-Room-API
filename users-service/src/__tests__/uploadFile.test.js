const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../index");
const dotenv = require("dotenv");
const regAndLogin = require("../__mocks__/regAndLogin");
const shuffleToken = require("../__mocks__/shuffleToken");
const fs = require("fs");
const path = require("path");
// LOAD ENV VARS
dotenv.config({ path: ".env" });

// DB URI
const DB_URI = process.env.DB_URI;

jest.setTimeout(50000);

describe("Change password", () => {
  let token = "";
  let fileUrl = "";

  beforeAll(async () => {
    await mongoose.connect(DB_URI);
    const data = await regAndLogin("test@test.com", "A*@a123456");
    token = data.token;
  });

  afterAll(async () => {
    await mongoose.connection.db.dropCollection("users");
  });

  it("given correct file", async () => {
    const rootPath = __dirname.split("_")[0];

    const filePath = path.join(
      rootPath,
      "__mocks__",
      "assets",
      "images",
      "profile.jpeg"
    );

    const response = await request(app)
      .post("/api/profile/upload")
      .set({ Authorization: `Bearer ${token}` })
      .attach("file", filePath);

    expect(response.status).toBe(200);
    expect(response.body.data).toBeDefined();
    expect(response.body.data).not.toEqual([]);
    fileUrl = response.body.data.picture;
  });

  it("given incorrect file", async () => {
    const rootPath = __dirname.split("_")[0];

    const filePath = path.join(
      rootPath,
      "__mocks__",
      "assets",
      "images",
      "test.json"
    );

    const response = await request(app)
      .post("/api/profile/upload")
      .set({ Authorization: `Bearer ${token}` })
      .attach("file", filePath);

    expect(response.status).toBe(400);
  });

  it("given incorrect token", async () => {
    const incorrectToken = shuffleToken(token);
    const rootPath = __dirname.split("_")[0];

    const filePath = path.join(
      rootPath,
      "__mocks__",
      "assets",
      "images",
      "profile.jpeg"
    );

    const response = await request(app)
      .post("/api/profile/upload")
      .set({ Authorization: `Bearer ${incorrectToken}` })
      .attach("file", filePath);

    expect(response.status).toBe(401);
  });

  // it("given correct file", async () => {
  //   const re = /\\|\//;
  //   const arr = fileUrl.split(re);
  //   console.log(arr);
  //   const fileName = arr[arr.length - 1];
  //   console.log(fileName);
  //   const response = await request(app).get(`/api/profile/${fileName}}`);
  //   expect(response.status).toBe(200);
  // });
});
