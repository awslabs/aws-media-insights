# Automated tests for the Media Insights front-end

This project tests the [Media Insights](https://github.com/awslabs/aws-media-insights) web application using browser automation in headless Chrome. 

The automation code is in `app.js`. It uses the node [puppeteer](https://developers.google.com/web/tools/puppeteer) package. Here's how you run it:

Run it with Docker:
    
    npm init -y
    npm i puppeteer 
    docker build --tag=cas-puppeteer:latest .
    docker run --rm -v "$PWD":/usr/src/app -e WEBAPP_URL="$WEBAPP_URL" cas-puppeteer:latest

Set $WEBAPP_URL to the cloudfront endpoint for the Media Insights UI.     

Note, you can make changes to app.js without rebuilding the docker container.

Here's how to run it *without* Docker:

    npm init -y
    npm i puppeteer 
    export WEBAPP_URL=...
    #IMPORTANT: update the executable path to Chrome in app.js
    node app.js
