# Vouzot Server API

This README provides the rest REST API documentation for the Vouzot API server.

The entrypoint of the server application is the `app.js` file.

## Install dependencies

    npm install

## Run the app

    npm run start

## Generate .env file from sample

    npm run create-env

# Authentication

The API includes the following endpoints for authentication.

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

`PATCH /auth/verifyUser/:verificationToken`

    curl -i -H 'Accept: application/json' -d 'name=Foo&status=new' http://localhost:7000/auth/verifyUser/:verificationToken

### Response

    HTTP/1.1 200 OK
    Date: Thu, 24 Feb 2011 12:36:31 GMT
    Status: 200 OK
    Connection: close
    Content-Type: application/json
    Content-Length: 74

    [{"id":1,"name":"Foo","status":"new"},{"id":2,"name":"Bar","status":null}]

# Chat

The API includes the following endpoints for chat.

## Get Chat

### Request

`GET /chat`

    curl -i -H 'Accept: application/json' -d 'name=Foo&status=new' http://localhost:7000/chat

### Response

    HTTP/1.1 200 OK
    Date: Thu, 24 Feb 2011 12:36:30 GMT
    Status: 200 OK
    Connection: close
    Content-Type: application/json
    Content-Length: 2

    []

## Post Chat

### Request

`POST /chat`

    curl -i -H 'Accept: application/json' -d 'name=Foo&status=new' http://localhost:7000/chat

### Response

    HTTP/1.1 200 OK
    Date: Thu, 24 Feb 2011 12:36:30 GMT
    Status: 200 OK
    Connection: close
    Content-Type: application/json
    Content-Length: 2

    []

# Messages

The API includes the following endpoints for messages.

## Get Messages

### Request

`GET /message`

    curl -i -H 'Accept: application/json' -d 'name=Foo&status=new' http://localhost:7000/message

### Response

    HTTP/1.1 200 OK
    Date: Thu, 24 Feb 2011 12:36:30 GMT
    Status: 200 OK
    Connection: close
    Content-Type: application/json
    Content-Length: 2

    []

## Delete Message

### Request

`DELETE /message/delete`

    curl -i -H 'Accept: application/json' -d 'name=Foo&status=new' http://localhost:7000/message/delete

### Response

    HTTP/1.1 200 OK
    Date: Thu, 24 Feb 2011 12:36:30 GMT
    Status: 200 OK
    Connection: close
    Content-Type: application/json
    Content-Length: 2

    []

# Posts

The API includes the following endpoints for posts.

## Get Posts

### Request

`GET /post`

    curl -i -H 'Accept: application/json' -d 'name=Foo&status=new' http://localhost:7000/post

### Response

    HTTP/1.1 200 OK
    Date: Thu, 24 Feb 2011 12:36:30 GMT
    Status: 200 OK
    Connection: close
    Content-Type: application/json
    Content-Length: 2

    []

## Create Post

### Request

`POST /post`

    curl -i -H 'Accept: application/json' -d 'name=Foo&status=new' http://localhost:7000/post

### Response

    HTTP/1.1 200 OK
    Date: Thu, 24 Feb 2011 12:36:30 GMT
    Status: 200 OK
    Connection: close
    Content-Type: application/json
    Content-Length: 2

    []

## Delete Post

### Request

`DELETE /post/:id`

    curl -i -H 'Accept: application/json' -d 'name=Foo&status=new' http://localhost:7000/post/:id

### Response

    HTTP/1.1 200 OK
    Date: Thu, 24 Feb 2011 12:36:30 GMT
    Status: 200 OK
    Connection: close
    Content-Type: application/json
    Content-Length: 2

    []

## Edit Post

### Request

`PATCH /post/:id`

    curl -i -H 'Accept: application/json' -d 'name=Foo&status=new' http://localhost:7000/post/:id

### Response

    HTTP/1.1 200 OK
    Date: Thu, 24 Feb 2011 12:36:30 GMT
    Status: 200 OK
    Connection: close
    Content-Type: application/json
    Content-Length: 2

    []

## Get Post Comment

### Request

`GET /post/comment`

    curl -i -H 'Accept: application/json' -d 'name=Foo&status=new' http://localhost:7000/post/comment

### Response

    HTTP/1.1 200 OK
    Date: Thu, 24 Feb 2011 12:36:30 GMT
    Status: 200 OK
    Connection: close
    Content-Type: application/json
    Content-Length: 2

    []

## Create Post Comment

### Request

`POST /post/comment`

    curl -i -H 'Accept: application/json' -d 'name=Foo&status=new' http://localhost:7000/post/comment

### Response

    HTTP/1.1 200 OK
    Date: Thu, 24 Feb 2011 12:36:30 GMT
    Status: 200 OK
    Connection: close
    Content-Type: application/json
    Content-Length: 2

    []

## Delete Post Comment

### Request

`DELETE /post/comment`

    curl -i -H 'Accept: application/json' -d 'name=Foo&status=new' http://localhost:7000/post/comment

### Response

    HTTP/1.1 200 OK
    Date: Thu, 24 Feb 2011 12:36:30 GMT
    Status: 200 OK
    Connection: close
    Content-Type: application/json
    Content-Length: 2

    []

## Edit Post Comment

### Request

`PATCH /post/comment`

    curl -i -H 'Accept: application/json' -d 'name=Foo&status=new' http://localhost:7000/post/comment

### Response

    HTTP/1.1 200 OK
    Date: Thu, 24 Feb 2011 12:36:30 GMT
    Status: 200 OK
    Connection: close
    Content-Type: application/json
    Content-Length: 2

    []

## Like Post

### Request

`PATCH /post/like`

    curl -i -H 'Accept: application/json' -d 'name=Foo&status=new' http://localhost:7000/post/like

### Response

    HTTP/1.1 200 OK
    Date: Thu, 24 Feb 2011 12:36:30 GMT
    Status: 200 OK
    Connection: close
    Content-Type: application/json
    Content-Length: 2

    []