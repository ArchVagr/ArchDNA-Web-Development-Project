const express = require("express");
const path = require("path");
const router = express.Router();
const db = require("../database");


router.get('/admin',(request,response)=>{
    if(request.session.userID==7){
        response.sendFile(path.join(__dirname,"..",'templates','admin.html'))
    }else{
        response.redirect("/archdna/main")
    }
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

            response.redirect('/admin')
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

            return response.redirect("/admin");
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
            return response.redirect("/admin");
        })

        
});



module.exports = router;