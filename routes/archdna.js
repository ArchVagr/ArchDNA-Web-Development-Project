const express = require("express");
const path = require("path");
const router = express.Router();
const db = require("../database");

router.get("/registration", (request, response) => {
    response.sendFile(
        path.join(__dirname, "..", "templates", "authorisation.html")
    );
});

router.get('/main',(request,response)=>)

router.post("/signup", (request, response) => {
    const email = request.body.email;
    const password = request.body.password;

    db.run(
        "INSERT INTO Accounts (email, password) VALUES (?, ?)",
        [email, password],
        function (error) {
            if (error) {
                console.log(error.message);
                return response.status(500).send("Database error");
            }

            const userId = this.lastID;

            response.cookie("userID",userId,{
                httpOnly: true,
                maxAge: 24 * 60 * 60 * 1000
            })

            return response.redirect(`/archdna/main`);
        }
    );
});

module.exports = router;