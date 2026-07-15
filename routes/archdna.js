const express = require("express");
const path = require("path");
const router = express.Router();
const db = require("../database");
const bcrypt = require('bcrypt');
const { error, time, assert } = require("console");
const { resolve } = require("path");



function findSamples(limit, offset) {
    return new Promise(function (resolve, reject) {
        db.all(
            "SELECT * FROM Samples LIMIT ? OFFSET ?",
            [limit, offset],
            function (error, samples) {
                if (error) {
                    console.log(error.message);
                    return reject(error);
                }

                resolve(samples);
            }
        );
    });
}

function findCount() {
    return new Promise(function (resolve, reject) {
        db.get(
            "SELECT COUNT(*) AS count FROM Samples",
            [],
            function (error, result) {
                if (error) {
                    console.log(error.message);
                    return reject(error);
                }

                resolve(result.count);
            }
        );
    });
}

function findSample(id) {
    return new Promise(function (resolve, reject) {
        db.get(
            'SELECT * FROM Samples WHERE id = ?',
            [id],
            (error, sample) => {
                if (error) {
                    console.error(error);
                    return reject(error);
                }

                resolve(sample);
            }
        );
    });
}

function createAccount(email,password){
    return new Promise(function(resolve,reject){
        db.run(
            "INSERT INTO Accounts (email, password) VALUES (?, ?)",
            [email, password],function (error){
                if(error){
                    consoler.error(error)
                    return reject(error)
                }
               
            }         
        )
        resolve(this.lastID)
    })
};

function getAccount(email) {
    return new Promise(function (resolve, reject) {
        db.get(
            "SELECT * FROM Accounts WHERE email = ?",
            [email],
            (error, account) => {
                if (error) {
                    console.error(error.message);
                    return reject(error);
                }

                resolve(account);
            }
        );
    });
}

router.get("/registration", (request, response) => {
    response.sendFile(
        path.join(__dirname, "..", "templates", "authorisation.html")
    );
});

router.get("/main", async (request, response) => {
    const userID = request.session.userID
    const limit = 10
    const page = Number(request.query.page)
    const offset = (page - 1)*10

    if (!userID) {
        return response.redirect("/archdna/registration");
    }

    try {
        const samples = await findSamples(limit, offset)
        const count = await findCount()

        response.render("main", {
            samples: samples,
            pages: Math.ceil(count/10),
            currentPage: page,
            id: userID
        });
    } catch (error) {
        console.log(error.message);
        return response.status(500).send("Database error");
    }
});


router.get("/sample",async (request,response)=>{
    const sampleid = request.query.id

    try{
        const sample = await findSample(sampleid)

        response.render("sample",
                {name:sample.name,
                 age:sample.age,
                 composition:sample.composition,
                 period:sample.period
                })
    }catch(error){
        console.log(error.message)
        return response.status(500).send("Database error")
    }
});


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

        request.session.userID = await createAccount(
            email,
            hashedPassword
        );

        return response.redirect("/archdna/main?page=1");
    } catch (error) {
        console.error(error);

        if (error.code === "SQLITE_CONSTRAINT") {
            return response.send(`
                <script>
                    alert("Email is already registered");
                    history.back();
                </script>
            `);
        }

        return response.status(500).send(`
            <script>
                alert("Registration error");
                history.back();
            </script>
        `);
    }
});

router.post("/login", async (request, response) => {
    const email = request.body.email;
    const password = request.body.password;

    try {
        const account = await getAccount(email);

        if (!account) {
            console.log("Account not found");

            return response.send(`
                <script>
                    alert("Invalid email or password");
                    history.back();
                </script>
            `);
        }

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
        console.error(error);

        return response.status(500).send(`
            <script>
                alert("Login error");
                history.back();
            </script>
        `);
    }
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