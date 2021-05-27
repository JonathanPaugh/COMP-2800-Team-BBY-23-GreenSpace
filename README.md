# GreenSpace

A web application targeting people interested or involved in community gardening focusing on the social aspect to help people learn and share their experiences while providing helpful feedback.

Created for BCIT course COMP 2800

http://green-space.us-west-1.elasticbeanstalk.com/

# Features #

User Profile\
Social Forum\
Social Groups\
Garden Information\
Plant Information\
Garden Gallery\
Plant Progress Tracker

# Technologies #

HTML\
JavaScript\
JQuery\
Firebase\
Firestore\
Node.Js\
AWS (Elastic Beanstalk, CodePipeline)\
VSCode\
GitHub\
Git\
Sourcetree

# Packages #

express\
express-rate-limit

# APIS #

NatureServe Explorer - https://explorer.natureserve.org/api-docs/

Google Custom Search - https://developers.google.com/custom-search/v1/overview

# Team Members #

| Name            | Student Number |
|-----------------|----------------|
| Jonathan Paugh  | A00879799      |
| Anna Yujeong An | A01167165      |
| Angel Zhong     | A01005216      |

Jonathan Paugh, Anna An, Angel Zhong

# Developer Setup #

## Install ##
Install these programs, order doesn't matter, but do this before continuing to setup.

Chrome\
Git\
VSCode\
Sourcetree\
Node.js

## Setup ##

https://github.com/JonathanPaugh/COMP-2800-Team-BBY-23-GreenSpace.git

1. Ask Jonathan for write access on the git repo
2. Clone the repo to a local location using “git clone” with the link above
3. Use cmd/terminal and navigate to repo folder
4. Install Node.js project dependencies using “npm install”
5. This should install express and express-rate-limit if not install them manually with the following commands:
  * “npm install express”
  * “npm install express-rate-limit”

6. Insert the google custom search api key into your environment variables:
  * Variable: API_GREENSPACE_GOOGLE
  * Value: AIzaSyC7xuP2DGbB4a0aBT0AcLUDOMnuxoRpGKg

## Run App ##

1. Use cmd/terminal and navigate to repo folder
2. Run command “node app.js”
3. Navigate to “http://127.0.0.1:3000/” in your development browser (Chrome)

## Start Developing ##

1. Open the repo folder using VSCode
2. Make changes
3. Push to the dev branch or make a feature branch from the dev branch to push to 

