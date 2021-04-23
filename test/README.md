# Automated tests for the Media Insights front-end

This project tests the [Media Insights](https://github.com/awslabs/aws-media-insights) web application using browser automation in headless Chrome. When you run it, it will generate screenshots which you can manually look at to validate the GUI.

The automation code is in `app.js`. It uses the node [puppeteer](https://developers.google.com/web/tools/puppeteer) package. Here's how you run it:

Run it with Docker:
    
    npm i puppeteer puppeteer-screenshot-tester
    docker build --tag=cas-puppeteer:latest .
    docker run --rm -v "$PWD":/usr/src/app -e WEBAPP_URL=https://d1y2qgp44g5rhq.cloudfront.net cas-puppeteer:latest
    
Note, you can make changes to app.js without rebuilding the docker container.

Here's how to run it *without* Docker:

    npm i puppeteer puppeteer-screenshot-tester
    export WEBAPP_URL=https://d1y2qgp44g5rhq.cloudfront.net
    #IMPORTANT: update the executable path to Chrome in app.js
    node app.js
