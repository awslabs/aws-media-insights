# Automated tests for the Media Insights front-end

This project tests the [Media Insights](https://github.com/awslabs/aws-media-insights) web application using browser automation in headless Chrome. 

The automation code is in `app.js`. It uses the node [puppeteer](https://developers.google.com/web/tools/puppeteer) package. Run it with Docker, like this:
    
    npm init -y
    npm i puppeteer 
    docker build --tag=cas-puppeteer:latest .
    docker run --rm -v "$PWD":/usr/src/app -e WEBAPP_URL="$WEBAPP_URL" -e INVITATION_EMAIL_RECIPIENT="${{ env.INVITATION_EMAIL_RECIPIENT }}" -e TEMP_PASSWORD="${{ env.TEMP_PASSWORD }}" cas-puppeteer:latest

Set $WEBAPP_URL to the cloudfront endpoint for the Media Insights UI.     
Set INVITATION_EMAIL_RECIPIENT to an email address that can be used to log into the Media Insights UI.
Set TEMP_PASSWORD to the corresponding login password.

Note, you can make changes to app.js without rebuilding the docker container.

You can also run these tests *without* Docker, like this:

    npm init -y
    npm i puppeteer 
    export WEBAPP_URL=...
    export INVITATION_EMAIL_RECIPIENT=...
    export TEMP_PASSWORD=...
    #IMPORTANT: update the executable path to Chrome in app.js
    node app.js
