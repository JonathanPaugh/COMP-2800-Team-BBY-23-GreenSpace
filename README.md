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

  * Chrome\
  * Git\
  * VSCode\
  * Sourcetree\
  * Node.js

## Setup ##

https://github.com/JonathanPaugh/COMP-2800-Team-BBY-23-GreenSpace.git

2. Ask Jonathan for write access on the git repo
3. Clone the repo to a local location using “git clone” with the link above
4. Use cmd/terminal and navigate to repo folder
5. Install Node.js project dependencies using “npm install”
6. This should install express and express-rate-limit if not install them manually with the following commands:
  * “npm install express”
  * “npm install express-rate-limit”

7. Insert the api keys into your environment variables:
  * API_GREENSPACE_GOOGLE=AIzaSyC7xuP2DGbB4a0aBT0AcLUDOMnuxoRpGKg
  * TWITTER_CONSUMER_KEY_GREENSPACE=AlhyKbXM4gpXQL37bA4R0kkb3
  * TWITTER_CONSUMER_SECRET_GREENSPACE=37adRFcR6FFtxMT6MOKYPhAkoTlqMDeyWAtV6OoCBTj2G5xLr0
  * TWITTER_ACCESS_TOKEN_GREENSPACE=1250448348433117192-bavVHWdE8FvN0BSGphdBDEOLQMO0Pd
  * TWITTER_ACCESS_TOKEN_SECRET_GREENSPACE=hvap3rQYVHhAq8rga8MxYNWrQ65OUCGasbrhUtnICbU2P

## Run App ##

8. Use cmd/terminal and navigate to repo folder
9. Run command “node app.js”
10. Navigate to “http://127.0.0.1:3000/” in your development browser (Chrome)

## Start Developing ##

11. Open the repo folder using VSCode
12. Make changes
13. Push to the dev branch or make a feature branch from the dev branch to push to 
