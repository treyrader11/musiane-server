# Vouzot Server

This README provides the rest REST API documentation for the Vouzot API server.

The entrypoint of the server application is the `app.js` file.

## Install dependencies

    npm install

## Run the app

    npm run start

## Generate .env file from sample

    npm run create-env

# REST API

The REST API to the example app is described below.

## Register

### Request

`POST /auth/register`

    curl -i -H 'Accept: application/json' -d 'name=Foo&status=new' http://localhost:7000/auth/register

### Response

    HTTP/1.1 200 OK
    Date: Thu, 24 Feb 2011 12:36:30 GMT
    Status: 200 OK
    Connection: close
    Content-Type: application/json
    Content-Length: 2

    []

## Login

### Request

`POST /auth/login`

    curl -i -H 'Accept: application/json' -d 'name=Foo&status=new' http://localhost:7000/auth/login

### Response

    HTTP/1.1 201 Created
    Date: Thu, 24 Feb 2011 12:36:30 GMT
    Status: 201 Created
    Connection: close
    Content-Type: application/json
    Location: /thing/1
    Content-Length: 36

    {"id":1,"name":"Foo","status":"new"}

## Google Callback

### Request

`POST /auth/google/callback`

    curl -i -H 'Accept: application/json' -d 'name=Foo&status=new' http://localhost:7000/auth/google/callback

### Response

    HTTP/1.1 200 OK
    Date: Thu, 24 Feb 2011 12:36:30 GMT
    Status: 200 OK
    Connection: close
    Content-Type: application/json
    Content-Length: 36

    {"id":1,"name":"Foo","status":"new"}

## Send Automated Email

### Request

`POST /auth/sendAutomatedEmail`

    curl -i -H 'Accept: application/json' -d 'name=Foo&status=new' http://localhost:7000/auth/sendAutomatedEmail

### Response

    HTTP/1.1 404 Not Found
    Date: Thu, 24 Feb 2011 12:36:30 GMT
    Status: 404 Not Found
    Connection: close
    Content-Type: application/json
    Content-Length: 35

    {"status":404,"reason":"Not found"}

## Send Verification Email

### Request

`POST /auth/sendVerificationEmail`

    curl -i -H 'Accept: application/json' -d 'name=Foo&status=new' http://localhost:7000/auth/sendVerificationEmail

### Response

    HTTP/1.1 201 Created
    Date: Thu, 24 Feb 2011 12:36:31 GMT
    Status: 201 Created
    Connection: close
    Content-Type: application/json
    Location: /thing/2
    Content-Length: 35

    {"id":2,"name":"Bar","status":null}

## Verify User

### Request

`POST /auth/verifyUser/:verificationToken`

    curl -i -H 'Accept: application/json' -d 'name=Foo&status=new' http://localhost:7000/auth/verifyUser/:verificationToken

### Response

    HTTP/1.1 200 OK
    Date: Thu, 24 Feb 2011 12:36:31 GMT
    Status: 200 OK
    Connection: close
    Content-Type: application/json
    Content-Length: 74

    [{"id":1,"name":"Foo","status":"new"},{"id":2,"name":"Bar","status":null}]