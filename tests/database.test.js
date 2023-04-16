const supertest = require("supertest");
const bcrypt = require("bcrypt");
const db = require("../src/config/database");
const http = require("http")
const app = require("../src/server");
const server = http.createServer(app);
const PORT = 3000;

const testServer = supertest.agent(server)

describe("database stuff", () => {
    let user
    afterAll(async() => {
        await db.UserTesting.deleteMany({});
        await db.$disconnect()
        server.close()
    });
    beforeAll(async () => {
      server.listen(PORT)
        user = await db.UserTesting.create({ //tests will fail if this user already exists in database
          data: {
            email: 'john.doe@example.com',
            password: 'testingPassword',
            firstName: 'John',
            lastName: 'Doe'
          }
        })
      })
   

    it("user added to database", async () => {
      const user = await db.User.findFirst()  
      expect(user).toBeDefined()

        
    })

    it('GET /account/login ', async() => {
      const res = await testServer.get('/account/login')
        .expect(200)
    });

    // it("should return 400 status code if password does not contain a special character", async() => { //this test does not currently work
    //           const response = await request(server)
    //               .post("/registration")
    //               .send({ firstName: "a", lastName: "a", email: "a@a", password:"nospchar", confirmPassword: "nospchar" });
      
    //           //expect(response.statusCode).toBe(400);
    //           expect(response.body.errors).toContain("Password must include a special character");
    //       });


})