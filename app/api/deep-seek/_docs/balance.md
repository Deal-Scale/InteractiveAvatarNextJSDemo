Get User Balance

GET 
https://api.deepseek.com/user/balance

Get user current balance
Responses

    200

OK, returns user balance info.

    application/json

    Schema
    Example (from schema)
    Example

Schema

    is_available
    boolean

    Whether the user's balance is sufficient for API calls.

    balance_infos

    object[]

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

curl -L -X GET 'https://api.deepseek.com/user/balance' \
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