const express = require("express");
const path = require("path");
const app = express();
const archRoutes = require("./routes/archdna");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/archdna", archRoutes);
app.use(express.static("static"));

app.get("/", (request, response) => {
    response.sendFile(path.join(__dirname, "templates", "index.html"));
});

app.listen(3000, () => {
    console.log("Server started");
});