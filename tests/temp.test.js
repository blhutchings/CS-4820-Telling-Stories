const supertest = require("supertest");
const bcrypt = require("bcrypt");
const db = require("../src/config/database");
const http = require("http")
const app = require("../src/server");
// const server = http.createServer(app);
const PORT = 3000;




describe("POST /registration", () => {
    let firstName;
    let lastName;
    let email;
    let password;
    let encryptedPassword;
    beforeAll(() => {
        // app.listen(PORT); //apparently this may not be needed
        request = supertest(app)
    });
    // afterAll(() => {
    //     app.close();
    // });
    beforeEach(() => {
        firstName = "John";
        lastName = "Doe";
        email = "johndoe@example.com";
        password = "password123!";
        encryptedPassword = bcrypt.hashSync(password, 10);
    });
    // afterEach(async() => { //when dealing with async() tests should add done() at the end
    //     await db.UserTesting.deleteMany({});
    // });

    it("testing codes", async () => {
        const response = await request.get("/registration");

        expect(response.status).toBe(200);

        
    })




    it("should return 400 status code if password does not match the confirmPassword", async () => {
        const response = await request
            .post("/registration")
            .send({ firstName: "firstName", lastName: "lastName", email: "email", password: "temp", confirmPassword: "wrongPassword" });

        expect(response.statusCode).toBe(400);
        //expect(response.body.errors).toContain("Passwords do not match");
        
    })



})