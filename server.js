const express = require("express");
const path = require("path");
const app = express();
const archRoutes = require("./routes/archdna");
const adminRoutes = require("./routes/admin");
const cookieParser = require("cookie-parser");
const session = require("express-session");



app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(
    session({
        secret: "Fkfr352LKfsfa345",
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000
        }
    })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/archdna", archRoutes);
app.use("/adminarch", adminRoutes);

app.use(express.static("static"));

app.get("/", (request, response) => {
    response.sendFile(path.join(__dirname, "templates", "index.html"));
});

app.listen(3000, () => {
    console.log("Server started");
});