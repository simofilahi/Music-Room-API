const request = require("supertest");
const app = require("../index");
const mongoose  = require("mongoose");
const dotenv = require("dotenv");

// LOAD ENV VARS
dotenv.config({ path: ".env" });

// DB URI
const DB_URI = process.env.DB_URI;

jest.setTimeout(50000);

describe("Registration test /api/auth/register", () => {
    beforeAll(async () =>{
        await mongoose.connect(DB_URI);
    });

    afterAll(async() => {
       await mongoose.connection.db.dropCollection("users");
    })

    it("given correct email and password",  async() => {
        const response = await request(app).post("/api/auth/register").send({
            email: "test@test.com",
            password: "123456"
        });
        expect(response.status).toBe(201);
      
    });

    it("given email and password alerday in db", async() => {
        const response = await request(app).post("/api/auth/register").send({
            email: "test@test.com",
            password: "123456"
        });
        expect(response.status).toBe(400); 
    })

    it("given just an email", async() => {
        const response = await request(app).post("/api/auth/register").send({
            email: "test@test.com",
            password: ""
        });
        expect(response.status).toBe(400); 
    });

    it("given an email alerday exist in db", async() => {
        const response = await request(app).post("/api/auth/register").send({
            email: "test@test.com",
            password: "3445500666"
        });
        expect(response.status).toBe(400); 
    });

});

