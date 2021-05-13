"use strict";

const fs = require("fs");
const https = require("https");

const express = require("express");

const app = express();
const port = process.env.PORT || 3000;

// Used to limit requests
const limiter = require("express-rate-limit")({
    windowMs: 100,
    max: 1,
    skipFailedRequests: true
});

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
    getPlant(req.body.id, data => {
        res.send(data);
    });
});

app.post("/find-plant", (req, res) => {
    findPlant(req.body.query, data => {
        res.send(data);
    });
});

app.post("/find-plants", limiter, (req, res) => {
    findPlants(req.body.query, data => {
        res.send(data);
    });
});

function getPlant(id, callback) {
    console.log(id);
    requestPlantData(`/api/data/taxon/${id}`, "GET", null, data => {
        if (callback) {
            callback(data);
        }
    });
}

function findPlant(query, callback) {
    findPlants(query, data => {
        if (callback) {
            if (data.length) {
                callback(data[0]);
            } else {
                callback(null);
            }
            
        }
    });
}

function findPlants(query, callback) {
    requestPlantData("/api/data/speciesSearch", "POST",
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
                callback(data.results);
            }
    });
}

function requestPlantData(path, method, data, callback) {
    var req = https.request({
        hostname: "explorer.natureserve.org",
        path: path,
        method: method,
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