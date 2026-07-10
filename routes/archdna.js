const express = require("express");
const path = require("path");
const router = express.Router();
const db = require("../database");
const bcrypt = require('bcrypt');
const { error, time } = require("console");


router.get("/registration", (request, response) => {
    response.sendFile(
        path.join(__dirname, "..", "templates", "authorisation.html")
    );
});

router.get("/main", (request, response) => {
    const userID = request.session.userID
    const limit = 10
    const page = Number(request.query.page)
    const offset = (page - 1)*10

    if (!userID) {
        return response.redirect("/archdna/registration");
    }

    db.all("SELECT * FROM Samples LIMIT ? OFFSET ?", [limit,offset], (error, samples) => {
        if (error) {
            console.log(error.message);
            return response.status(500).send("Database error");
        }

        db.get("SELECT COUNT(*) AS count FROM Samples", [], (error, result) => {
            if (error) {
                console.log(error.message);
                return response.status(500).send("Database error");
            }

            response.render("main", {
                samples: samples,
                pages: Math.ceil(result.count/10),
                currentPage:page,
                id:userID
            });
        });
    });
});

router.post("/signup", async (request, response) => {
    const email = request.body.email;
    const password = request.body.password;

    try {
        const hashedPassword = await bcrypt.hash(password, 12);

        db.run(
            "INSERT INTO Accounts (email, password) VALUES (?, ?)",
            [email, hashedPassword],
            function (error) {
                if (error) {
                    console.log(error.message);
                    return response.status(500).send("Email is already registered");
                }

                request.session.userID = this.lastID;

                return response.redirect("/archdna/main?page=1");
            }
        );
    } catch (error) {
        console.log(error);
        return response.status(500).send("Password hashing error");
    }
});


router.post("/login", (request, response) => {
    const email = request.body.email;
    const password = request.body.password;

    db.get(
        "SELECT * FROM Accounts WHERE email = ?",
        [email],
        async (error, account) => {
            if (error) {
                console.log(error.message);
                return response.status(500).send("Database error");
            }

            if (!account) {
                console.log("Account not found");
                return response.status(401).send("Invalid email or password");
            }

            try {
                const checkedPassword = await bcrypt.compare(
                    password,
                    account.password
                );

                if (!checkedPassword) {
                    console.log("Wrong password");
                    return response.status(401).send("Invalid email or password");
                }

                request.session.userID = account.id;

                return response.redirect("/archdna/main?page=1");
            } catch (error) {
                console.log(error.message);
                return response.status(500).send("Login error");
            }
        }
    );
});

router.post("/logout",(request,response)=>{
    request.session.destroy((error)=>{
        if(error){
            console.log(error)
            return response.status(500).send("Logout error");
        }

        response.clearCookie("connect.sid")
        response.redirect("/archdna/registration")
    })
})
   
module.exports = router;