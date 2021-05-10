"use strict";

const express = require("express");
const fs = require("fs");

const app = express();
const port = 8000;

app.use("/", express.static("public/"))
app.use("/js", express.static("public/js"))
app.use("/css", express.static("public/css"))
app.use("/image", express.static("public/image"))
app.use("/template", express.static("public/template"))
app.use("/favicon.ico", express.static("public/favicon.ico"));

app.get("/", (req, res) => {
    let file = fs.readFileSync("/public/index.html", "utf-8");
    res.send(file);
});

app.listen(port, function () {
    console.log(`Server Started: ${port}`);
});