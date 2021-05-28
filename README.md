# GreenSpace #

A web application targeting people interested or involved in community gardening focusing on the social aspect to help people learn and share their experiences while providing helpful feedback.

Created for BCIT course COMP 2800

http://green-space.us-west-1.elasticbeanstalk.com/

# Test Plan #

https://docs.google.com/spreadsheets/d/1KdybRfJBqQhcJApiRZRBhD_RVcE7FFl4ZR2aBu-F8sw/edit#gid=394496370

# Team Members #

| Name            | Student Number |
|-----------------|----------------|
| Jonathan Paugh  | A00879799      |
| Anna Yujeong An | A01167165      |
| Angel Zhong     | A01005216      |

# Developer Setup #

## Install ##
1. Install these programs, order doesn't matter, but do this before continuing to setup.

 Chrome\
 Git\
 VSCode\
 Sourcetree\
 Node.js

## Setup ##

https://github.com/JonathanPaugh/COMP-2800-Team-BBY-23-GreenSpace.git

2. Ask Jonathan for write access on the git repo
3. Clone the repo to a local location using “git clone” with the link above
4. Use cmd/terminal and navigate to repo folder
5. Install Node.js project dependencies using “npm install”
6. This should install express and express-rate-limit if not install them manually with the following commands:
  * “npm install express”
  * “npm install express-rate-limit”

7. Insert the google custom search api key into your environment variables:
  * Variable: API_GREENSPACE_GOOGLE
  * Value: AIzaSyC7xuP2DGbB4a0aBT0AcLUDOMnuxoRpGKg

## Run App ##

8. Use cmd/terminal and navigate to repo folder
9. Run command “node app.js”
10. Navigate to “http://127.0.0.1:3000/” in your development browser (Chrome)

## Start Developing ##

11. Open the repo folder using VSCode
12. Make changes
13. Push to the dev branch or make a feature branch from the dev branch to push to 
