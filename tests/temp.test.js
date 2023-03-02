const supertest = require("supertest");
const bcrypt = require("bcrypt");
const db = require("../src/config/database");
const http = require("http")
const app = require("../src/server");
// const server = http.createServer(app);
const PORT = 3000;



describe("database stuff", () => {
    let user
    afterAll(async() => {
        await db.UserTesting.deleteMany({});
        await db.$disconnect()
    });
    beforeAll(async () => {
        user = await db.UserTesting.create({
          data: {
            email: 'john.doe@example.com',
            password: 'testingPassword',
            firstName: 'John',
            lastName: 'Doe'
          }
        })
      })
   

    it("user added to database", async () => {
        expect(user.id).toBeDefined()

        
    })






})