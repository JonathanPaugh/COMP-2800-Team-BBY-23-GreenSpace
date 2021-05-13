"use strict";

const fs = require("fs");
const https = require("https");
const url = require("url");

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

app.post("/find-plants", (req, res) => {
    findPlants(req.body.query, data => {
        res.send(data);
    });
});

app.post("/search-plant", (req, res) => {
    findPlant(req.body.query, data => {
        if (data) {
            findPlantImages(data.scientificName, images => {
                data.images = images;
                findPlantInformation(data.scientificName, information => {
                    data.information = information;
                    res.send(data);
                });
            });
        } else {
            res.status(400).send("Could not find plant");
        }
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

function findPlantImages(query, callback) {
    requestSearch(url.format({
        protocol: "https",
        hostname: "www.googleapis.com",
        pathname: "/customsearch/v1",
        query: 
        {
            key: process.env.API_GREENSPACE_GOOGLE,
            cx: "6a02f3c7401460e16",
            q: query,
            searchType: "image",
            imgType: "photo"
        }
    }), data => {
        if (callback) {
            if (data) {
                if (data.items) {
                    callback(data.items.map(item => item.link));
                } else {
                    callback(null);
                }
            } else {
                callback(null);
            }
        }
    });
}

function findPlantInformation(query, callback) {
    requestSearch(url.format({
        protocol: "https",
        hostname: "www.googleapis.com",
        pathname: "/customsearch/v1",
        query: 
        {
            key: process.env.API_GREENSPACE_GOOGLE,
            cx: "6a02f3c7401460e16",
            q: query
        }
    }), data => {
        if (callback) {
            if (data) {
                if (data.items) {
                    callback(data.items[0]);
                } else {
                    callback(null);
                }
            } else {
                callback(null);
            }
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
    }, res => getResponseChunked(res, callback));

    req.on("error", error => {
        console.error(error);
    });

    if (data) {
        req.write(JSON.stringify(data));
    }

    req.end();
}

function requestSearch(url, callback) {
    var req = https.request(url, res => getResponseChunked(res, callback));

    req.on("error", error => {
        console.error(error);
    });

    req.end();
}

function getResponseChunked(res, callback) {
    let data = "";
    
    // Append data chunks from api
    res.on("data", chunk => {
        data += chunk;
    });

    // Return all data when api done sending data
    res.on("close", () => {
        if (callback) {
            callback(JSON.parse(data));
        }
    });
}

app.listen(port, () => {
    console.log(`Server Started: ${port}`);
});