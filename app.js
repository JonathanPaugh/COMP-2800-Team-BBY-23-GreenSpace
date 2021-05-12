"use strict";

const express = require("express");
const fs = require("fs");
const https = require("https");

const app = express();
const port = process.env.PORT || 3000;

app.use("/", express.static("public/"))
app.use("/js", express.static("public/js"))
app.use("/css", express.static("public/css"))
app.use("/image", express.static("public/image"))
app.use("/template", express.static("public/template"))
app.use("/favicon.ico", express.static("public/favicon.ico"));

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get("/", (req, res) => {
    let file = fs.readFileSync("/public/index.html", "utf-8");
    res.send(file);
});

app.post("/get-plant", (req, res) => {
    getPlantData(req.body.query, data => {
        res.send(data.results);
    });
});

function getPlantData(query, callback) {
    requestNatureServe("/api/data/speciesSearch", 
        {
            "criteriaType": "species",
            "textCriteria": 
            [
                {
                    "paramType": "quickSearch",
                    "searchToken": query
                }
            ],
            "speciesTaxonomyCriteria": [
                {
                    "paramType": "scientificTaxonomy",
                    "level": "KINGDOM",
                    "scientificTaxonomy": "Plantae"
                }
            ]
        }, data => {
            if (callback) {
                callback(data);
            }
    });
}

function requestNatureServe(path, data, callback) {
    var req = https.request({
        hostname: "explorer.natureserve.org",
        path: path,
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        }
    }, res => {
        let resData = "";
        
        // Append data chunks from api
        res.on("data", chunk => {
            resData += chunk;
        });

        // Return all data when api done sending data
        res.on("close", () => {
            console.log("Request Complete");
            if (callback) {
                callback(JSON.parse(resData));
            }
        });
    });

    req.on("error", error => {
        console.error(error);
    });

    if (data) {
        req.write(JSON.stringify(data));
    }

    req.end();
}

app.listen(port, () => {
    console.log(`Server Started: ${port}`);
});