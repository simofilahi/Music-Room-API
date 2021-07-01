const request = require("supertest");
const app = require("../index");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// LOAD ENV VARS
dotenv.config({ path: ".env" });

// DB URI
const DB_URI = process.env.DB_URI;

jest.setTimeout(50000);

describe("Registration test /api/auth/register", () => {
  beforeAll(async () => {
    await mongoose.connect(DB_URI);
  });

  afterAll(async () => {
    await mongoose.connection.db.dropCollection("users");
  });

  it("given just an email", async () => {
    const response = await request(app).post("/api/auth/register").send({
      email: "test@test.com",
      password: "",
    });
    expect(response.status).toBe(400);
  });

  it("given just a password", async () => {
    const response = await request(app).post("/api/auth/register").send({
      email: "",
      password: "1-atesttest",
    });
    expect(response.status).toBe(400);
  });

  it("given no data", async () => {
    const response = await request(app).post("/api/auth/register").send({
      email: "",
      password: "",
    });
    expect(response.status).toBe(400);
  });

  it("given invalid password", async () => {
    const response = await request(app).post("/api/auth/register").send({
      email: "test@test.com",
      password: "12345",
    });
    expect(response.status).toBe(400);
  });

  it("given invalid email", async () => {
    const response = await request(app).post("/api/auth/register").send({
      email: "test@testcom",
      password: "12*@Atbnmv",
    });
    expect(response.status).toBe(400);
  });

  it("given invalid email and password", async () => {
    const response = await request(app).post("/api/auth/register").send({
      email: "test@testcom",
      password: "12*@atbnmv",
    });
    expect(response.status).toBe(400);
  });

  it("given correct email and password", async () => {
    const response = await request(app).post("/api/auth/register").send({
      email: "test@test.com",
      password: "12*@Atbnmv",
    });
    expect(response.status).toBe(201);
    expect(response.body.data).toBeDefined();
    expect(response.body.data).not.toEqual([]);
  });

  it("given email and password alerday in db", async () => {
    const response = await request(app).post("/api/auth/register").send({
      email: "test@test.com",
      password: "12*@Atbnmv",
    });
    expect(response.status).toBe(400);
  });
});
