"use strict";

const fs = require("fs");
const https = require("https");
const url = require("url");
const Twit = require('twit')

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

app.post("/suggest-plants", (req, res) => {
    findPlants(req.body.query, data => {
        res.send(data?.map(function (plant) { 
            return {
                id: plant.uniqueId,
                value: `${plant.primaryCommonName} (${plant.scientificName})`
            }})
        );
    });
});

app.post("/search-plant", (req, res) => {
    let method;
    let body;

    if (req.body.id) {
        
        method = getPlant;
        body = req.body.id;
    } else if (req.body.query) {
        method = findPlant;
        body = req.body.query;
    } else {
        res.status(400).send("Invalid Request");
        return;
    }

    method(body, data => {
        if (data) {
            findPlantImages(data.scientificName, images => {
                data.images = images;
                findPlantInformation(data.scientificName, information => {
                    if (!information) {
                        findPlantInformation(data.primaryCommonName, information => {
                            data.information = information;
                            res.send(data);
                        });
                    } else {
                        data.information = information;
                        res.send(data);
                    }
                });
            });
        } else {
            res.status(400).send("Could not find plant");
        }
    });
});

<<<<<<< HEAD
/**
 * API keys for Twitter
 */
var T = new Twit({
    consumer_key: 'AlhyKbXM4gpXQL37bA4R0kkb3',
    consumer_secret: '37adRFcR6FFtxMT6MOKYPhAkoTlqMDeyWAtV6OoCBTj2G5xLr0',
    access_token: '1250448348433117192-bavVHWdE8FvN0BSGphdBDEOLQMO0Pd',
    access_token_secret: 'hvap3rQYVHhAq8rga8MxYNWrQ65OUCGasbrhUtnICbU2P',
});

/**
 * Returns data of the hash tag
 * I found this code on GitHub
 * 
 * @author tombaranowicz
 * @see https://github.com/tombaranowicz/TwitterMonitoringJavaScript/blob/master/index.js
 */
app.get("/get-tweets", function (req, res) {
    T.get('search/tweets', { q: '#TeamGreenSpace23 since:2020-05-25', count: 100 }, function(err, data, response) {
        const tweetUser = data.statuses.map(tweet => tweet.user.name)
        const tweetContent = data.statuses.map(tweet => tweet.text)
        const tweetDate = data.statuses.map(tweet => tweet.created_at)
  
        res.send({user: tweetUser, content: tweetContent, date: tweetDate});
    });
});

/***************\
* Data Requests *
\***************/

/* 
* Gets a plant from nature serve from unique nature serve id
*/
=======
>>>>>>> a3943237336590e2ff3d0a0ec5605889679e6667
function getPlant(id, callback) {
    requestPlantData(`/api/data/taxon/${id}`, "GET", null, data => {
        if (callback) {
            callback(data);
        }
    });
}

function findPlant(query, callback) {
    findPlants(query, data => {
        if (callback) {
            if (data?.length) {
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
            cx: "ef88b6adf0f68d6d2",
            q: query,
            searchType: "image",
            imgType: "photo",
            imgDominantColor: "green"
        }
    }), data => {
        if (callback) {
            if (data?.items) {
                callback(data.items.map(item => item.link));
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
            if (data?.items) {
                    callback(data.items[0]);
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
