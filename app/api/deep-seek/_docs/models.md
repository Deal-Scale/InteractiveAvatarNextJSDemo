Lists Models

GET 
https://api.deepseek.com/models

Lists the currently available models, and provides basic information about each one such as the owner and availability. Check Models & Pricing for our currently supported models.
Responses

    200

OK, returns A list of models

    application/json

    Schema
    Example (from schema)
    Example

Schema

    object
    stringrequired

    Possible values: [list]

    data

    Model[]

    required

    curl
    python
    go
    nodejs
    ruby
    csharp
    php
    java
    powershell

    CURL

curl -L -X GET 'https://api.deepseek.com/models' \
-H 'Accept: application/json' \
-H 'Authorization: Bearer <TOKEN>'

Request Collapse all
Base URL
https://api.deepseek.com
Base URL
https://api.deepseek.com
Auth
Bearer Token
ResponseClear

Click the Send API Request button above and see the response here!