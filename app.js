"use strict";

const express = require("express");
const fs = require("fs");

const app = express();
const port = 8000;

app.listen(port, function () {
    console.log(`Server Started: ${port}`);
});

// For drafting requests without running static site on node
// app.get("/", (_req, res) => {
//     res.setHeader("Access-Control-Allow-Origin", "*");
// });