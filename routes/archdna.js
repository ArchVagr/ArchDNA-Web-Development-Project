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

router.get("/sample",(request,response)=>{
    const sampleid = request.query.id

    db.get(
        'SELECT * FROM Samples WHERE id = ?',
        [sampleid],(error,sample)=>{
            if(error){
                console.log(error)
                return response.status(500).send("Sample not found")
            }

            response.render("sample",
                {name:sample.name,
                 age:sample.age,
                 composition:sample.composition,
                 period:sample.period
                }
            )
        }
    )
})
router.post("/signup", async (request, response) => {
    const email = request.body.email;
    const password = request.body.password;

    if (!email || !password) {
        return response.send(`
            <script>
                alert("Email and password are required");
                history.back();
            </script>
        `);
    }

    if (password.length < 8) {
        return response.send(`
            <script>
                alert("Password must contain at least 8 characters");
                history.back();
            </script>
        `);
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 12);

        db.run(
            "INSERT INTO Accounts (email, password) VALUES (?, ?)",
            [email, hashedPassword],
            function (error) {
                if (error) {
                    console.log(error.message);

                    return response.send(`
                        <script>
                            alert("Email is already registered");
                            history.back();
                        </script>
                    `);
                }

                request.session.userID = this.lastID;

                return response.redirect("/archdna/main?page=1");
            }
        );
    } catch (error) {
        console.log(error);

        return response.send(`
            <script>
                alert("Password hashing error");
                history.back();
            </script>
        `);
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
                return response.send(`
                        <script>
                            alert("Invalid email or password");
                            history.back();
                        </script>
                    `);
            }

            try {
                const checkedPassword = await bcrypt.compare(
                    password,
                    account.password
                );

                if (!checkedPassword) {
                    console.log("Wrong password");
                     return response.send(`
                        <script>
                            alert("Invalid email or password");
                            history.back();
                        </script>
                    `);
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