const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../index");
const dotenv = require("dotenv");

// LOAD ENV VARS
dotenv.config({ path: ".env" });

// DB URI
const DB_URI = process.env.DB_URI;

jest.setTimeout(50000);

describe("Test login and mail verification (/api/auth/login And /api/email/confirm)", () => {
  let mailConfCode = "";
  let mailConfToken = "Bearer ";

  beforeAll(async () => {
    await mongoose.connect(DB_URI);
  });

  afterAll(async () => {
    await mongoose.connection.db.dropCollection("users");
  });

  it("given correct email and password for registration", async () => {
    const response = await request(app).post("/api/auth/register").send({
      email: "test@test.com",
      password: "12*@Atbnmv",
    });
    expect(response.status).toBe(201);
  });

  it("given incorrect email and password for login", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "test1@test.com",
      password: "12*@atbnmv",
    });
    expect(response.status).toBe(400);
  });

  it("given incorrect email for login", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "test1@test.com",
      password: "12*@Atbnmv",
    });
    expect(response.status).toBe(400);
  });

  it("given incorrect password for login", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "test@test.com",
      password: "12*@atbnmv",
    });
    expect(response.status).toBe(400);
  });

  it("given account not verified", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "test@test.com",
      password: "12*@Atbnmv",
    });
    expect(response.status).toBe(200);
    expect(response.body.data.isVerified).toBe(false);
    mailConfCode = response.body.data.mailConfCode;
    mailConfToken += response.body.data.mailConfToken;
  });

  it("verify an account", async () => {
    const response = await request(app)
      .post("/api/email/confirm")
      .send({
        code: mailConfCode,
      })
      .set({ Authorization: mailConfToken });
    expect(response.status).toBe(200);
    expect(response.body.data.isVerified).toBe(true);
  });

  it("given a verified account", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "test@test.com",
      password: "12*@Atbnmv",
    });
    expect(response.status).toBe(200);
    expect(response.body.data.isVerified).toBe(true);
  });
});
