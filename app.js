"use strict";

/*******\
* Setup *
\*******/

const fs = require("fs");
const https = require("https");
const url = require("url");
const Twit = require('twit');

const express = require("express");

const app = express();
const port = process.env.PORT || 3000;

/* 
* Limits client request to 1 per second
* Only applied to suggestion request to prevent over usage of api
*/
const limiter = require("express-rate-limit")({
    windowMs: 1000,
    max: 1,
    skipFailedRequests: true
});

/****************\
* Static Mapping *
\****************/

app.use("/", express.static("public/"))
app.use("/js", express.static("public/js"))
app.use("/css", express.static("public/css"))
app.use("/image", express.static("public/image"))
app.use("/template", express.static("public/template"))
app.use("/favicon.ico", express.static("public/favicon.ico"));

app.use(express.json());
app.use(express.urlencoded({extended: true}));

/*****************\
* Client Requests *
\*****************/

/* 
* App entry point
*/
app.get("/", (req, res) => {
    let file = fs.readFileSync("/public/index.html", "utf-8");
    res.send(file);
});

/* 
* Requests to get plant from unique id
* Returns matching plant
*/
app.post("/get-plant", (req, res) => {
    getPlant(req.body.id, data => {
        res.send(data);
    });
});

/* 
* Requests to find first matching plant for query
* Returns first matching plant
*/
app.post("/find-plant", (req, res) => {
    findPlant(req.body.query, data => {
        res.send(data);
    });
});

/* 
* Requests to find all plants for query
* Returns all matching plants
*/
app.post("/find-plants", (req, res) => {
    findPlants(req.body.query, data => {
        res.send(data);
    });
});

/* 
* Requests to get plant suggestions for current query
* Returns plants with simplified data to lower data transfer consumption
*/
app.post("/suggest-plants", limiter, (req, res) => {
    findPlants(req.body.query, data => {
        res.send(data?.map(function (plant) { 
            return {
                id: plant.uniqueId,
                value: `${plant.primaryCommonName} (${plant.scientificName})`
            }})
        );
    });
});

/* 
* Request to search for a matching plant for query
* Returns a plant with additional appended information such as 
*/
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

/**
 * API keys for Twitter
 */
var T = new Twit({
    consumer_key: process.env.TWITTER_CONSUMER_KEY_GREENSPACE,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET_GREENSPACE,
    access_token: process.env.TWITTER_ACCESS_TOKEN_GREENSPACE,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET_GREENSPACE,
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
/**
 * Reference end
 */



/***************\
* Data Requests *
\***************/

/* 
* Gets a plant from nature serve from unique nature serve id
*/
function getPlant(id, callback) {
    requestPlantData(`/api/data/taxon/${id}`, "GET", null, data => {
        if (callback) {
            callback(data);
        }
    });
}

/* 
* Finds the first matching plant from nature serve from a query
*/
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

/* 
* Finds matching plants from nature serve from a query
*/
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

/* 
* Finds plant images from google from a query
*/
function findPlantImages(query, callback) {
    requestSearch(url.format({
        protocol: "https",
        hostname: "www.googleapis.com",
        pathname: "/customsearch/v1",
        query: 
        {
            key: process.env.API_GREENSPACE_GOOGLE,
            // Google search cx
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

/* 
* Finds plant information from wikipedia from a query
*/
function findPlantInformation(query, callback) {
    requestSearch(url.format({
        protocol: "https",
        hostname: "www.googleapis.com",
        pathname: "/customsearch/v1",
        query: 
        {
            key: process.env.API_GREENSPACE_GOOGLE,
            // Wikipedia Cx
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

/**************\
* Api Requests *
\**************/

/* 
* Issues a nature server api request
*/
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

/* 
* Issues a google custom search api request
*/
function requestSearch(url, callback) {
    var req = https.request(url, res => getResponseChunked(res, callback));

    req.on("error", error => {
        console.error(error);
    });

    req.end();
}

/* 
* Parses api resposes in chunks
* Each chunk received is appended to data
* On request completion the data containing all the appended chunks
*   is parsed and sent in the callback
*/
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

/******\
* Init *
\******/

app.listen(port, () => {
    console.log(`Server Started: ${port}`);
});
