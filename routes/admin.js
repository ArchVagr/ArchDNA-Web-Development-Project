const express = require("express");
const path = require("path");
const router = express.Router();
const db = require("../database");
const { error } = require("console");

function getAdminAccount(id){
    return new Promise(function(resolve,reject){
        db.get("SELECT * FROM Accounts WHERE id = ?",
            [id],(error,account) => {
                if(error){
                    console.log(error)
                    return reject(error)
                }

                resolve(account)
            }
        )
    })
}

async function requireAdmin  ( request, response, next) {
    try{
        const account = await getAdminAccount(request.session.userID)

        if(!account){
           return response.status(403).send("Account not found ADMIN")
        }

        if (account.role !== 'admin'){
           return response.status(403).send("Not admin")
        }

        next();
    }catch(error){
        console.log(error)
        return response.status(500).send("Unknown error. Check the log")
    }


}

router.use(requireAdmin)

router.get('/admin',(request,response)=>{
    response.sendFile(path.join(__dirname,'..','templates','admin.html'))
})

router.post('/addpop',(request,response)=>{
    const period = request.body.period
    const name = request.body.name
    const age = request.body.age
    const composition = request.body.composition

    db.run('INSERT INTO Samples (period, name, age, composition) VALUES (? , ? , ? , ?)',
        [period,name,age,composition],
        function(error){
            if(error){
            console.log(error)
            return response.status(500).send("Database error")
            }

            response.redirect('/adminarch/admin')
        }
    )
});

router.post("/removepop", (request, response) => {
    const id = request.body.id;

    db.run(
        "DELETE FROM Samples WHERE id = ?",
        [id],
        function (error) {
            if (error) {
                console.log(error);
                return response.status(500).send("Database error");
            }

            if (this.changes === 0) {
                return response.status(404).send("Sample not found");
            }

            return response.redirect("/adminarch/admin");
        }
    );
});

router.post('/updatepop',(request,response)=>{
    const id = request.body.id
    const period = request.body.period
    const name = request.body.name
    const age = request.body.age
    const composition = request.body.composition

    db.run('UPDATE Samples SET period = ? ,name = ? ,age = ? ,composition = ? WHERE id = ?',
        [period,name,age,composition,id],
        function(error){
            if(error){
            console.log(error)
            return response.status(500).send("Database error")
            }

            if (this.changes === 0) {
                return response.status(404).send("Sample not found");
            }
            return response.redirect("/adminarch/admin");
        })

        
});



module.exports = router;