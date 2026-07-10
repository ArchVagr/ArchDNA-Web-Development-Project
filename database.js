const sqlite3 = require('sqlite3').verbose()
const path = require('path')

const dbPath = path.join(__dirname,'database','database.db')

const db = new sqlite3.Database(dbPath, (error) => {
    if (error) {
        console.log("Database connection error:", error.message);
    } else {
        console.log("Connected to existing database");
    }
});

module.exports = db;