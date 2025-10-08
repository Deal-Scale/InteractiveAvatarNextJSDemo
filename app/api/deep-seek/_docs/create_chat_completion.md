Create Chat Completion

POST 
https://api.deepseek.com/chat/completions

Creates a model response for the given chat conversation.
Request

    application/json

Body

required

    messages

    object[]

    required
    model
    stringrequired

    Possible values: [deepseek-chat, deepseek-reasoner]

    ID of the model to use. You can use deepseek-chat.
    frequency_penalty
    numbernullable

    Possible values: >= -2 and <= 2

    Default value: 0

    Number between -2.0 and 2.0. Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim.
    max_tokens
    integernullable

    The maximum number of tokens that can be generated in the chat completion.

    The total length of input tokens and generated tokens is limited by the model's context length.

    For the value range and default value, please refer to the documentation.
    presence_penalty
    numbernullable

    Possible values: >= -2 and <= 2

    Default value: 0

    Number between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics.

    response_format

    object

    nullable

    stop

    object

    nullable
    stream
    booleannullable

    If set, partial message deltas will be sent. Tokens will be sent as data-only server-sent events (SSE) as they become available, with the stream terminated by a data: [DONE] message.

    stream_options

    object

    nullable
    temperature
    numbernullable

    Possible values: <= 2

    Default value: 1

    What sampling temperature to use, between 0 and 2. Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic.

    We generally recommend altering this or top_p but not both.
    top_p
    numbernullable

    Possible values: <= 1

    Default value: 1

    An alternative to sampling with temperature, called nucleus sampling, where the model considers the results of the tokens with top_p probability mass. So 0.1 means only the tokens comprising the top 10% probability mass are considered.

    We generally recommend altering this or temperature but not both.

    tools

    object[]

    nullable

    tool_choice

    object

    nullable
    logprobs
    booleannullable

    Whether to return log probabilities of the output tokens or not. If true, returns the log probabilities of each output token returned in the content of message.
    top_logprobs
    integernullable

    Possible values: <= 20

    An integer between 0 and 20 specifying the number of most likely tokens to return at each token position, each with an associated log probability. logprobs must be set to true if this parameter is used.

Responses

    200 (No streaming)
    200 (Streaming)

OK, returns a chat completion object

    application/json

    Schema
    Example (from schema)
    Example

Schema

    id
    stringrequired

    A unique identifier for the chat completion.

    choices

    object[]

    required
    created
    integerrequired

    The Unix timestamp (in seconds) of when the chat completion was created.
    model
    stringrequired

    The model used for the chat completion.
    system_fingerprint
    stringrequired

    This fingerprint represents the backend configuration that the model runs with.
    object
    stringrequired

    Possible values: [chat.completion]

    The object type, which is always chat.completion.

    usage

    object

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

curl -L -X POST 'https://api.deepseek.com/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Accept: application/json' \
-H 'Authorization: Bearer <TOKEN>' \
--data-raw '{
  "messages": [
    {
      "content": "You are a helpful assistant",
      "role": "system"
    },
    {
      "content": "Hi",
      "role": "user"
    }
  ],
  "model": "deepseek-chat",
  "frequency_penalty": 0,
  "max_tokens": 4096,
  "presence_penalty": 0,
  "response_format": {
    "type": "text"
  },
  "stop": null,
  "stream": false,
  "stream_options": null,
  "temperature": 1,
  "top_p": 1,
  "tools": null,
  "tool_choice": "none",
  "logprobs": false,
  "top_logprobs": null
}'

Request Collapse all
Base URL
https://api.deepseek.com
Base URL
https://api.deepseek.com
Auth
Bearer Token
Body required

{
  "messages": [
    {
      "content": "You are a helpful assistant",
      "role": "system"
    },
    {
      "content": "Hi",
      "role": "user"
    }
  ],
  "model": "deepseek-chat",
  "frequency_penalty": 0,
  "max_tokens": 4096,
  "presence_penalty": 0,
  "response_format": {
    "type": "text"
  },
  "stop": null,
  "stream": false,
  "stream_options": null,
  "temperature": 1,
  "top_p": 1,
  "tools": null,
  "tool_choice": "none",
  "logprobs": false,
  "top_logprobs": null
}

ResponseClear

Click the Send API Request button above and see the response here!
Previous
Introduction
Next
Create FIM Completion (Beta)

Create FIM Completion (Beta)

POST 
https://api.deepseek.com/beta/completions

The FIM (Fill-In-the-Middle) Completion API. User must set base_url="https://api.deepseek.com/beta" to use this feature.
Request

    application/json

Body

required

    model
    stringrequired

    Possible values: [deepseek-chat]

    ID of the model to use.
    prompt
    stringrequired

    Default value: Once upon a time,

    The prompt to generate completions for.
    echo
    booleannullable

    Echo back the prompt in addition to the completion
    frequency_penalty
    numbernullable

    Possible values: >= -2 and <= 2

    Default value: 0

    Number between -2.0 and 2.0. Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim.
    logprobs
    integernullable

    Possible values: <= 20

    Include the log probabilities on the logprobs most likely output tokens, as well the chosen tokens. For example, if logprobs is 20, the API will return a list of the 20 most likely tokens. The API will always return the logprob of the sampled token, so there may be up to logprobs+1 elements in the response.

    The maximum value for logprobs is 20.
    max_tokens
    integernullable

    The maximum number of tokens that can be generated in the completion.
    presence_penalty
    numbernullable

    Possible values: >= -2 and <= 2

    Default value: 0

    Number between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics.

    stop

    object

    nullable
    stream
    booleannullable

    Whether to stream back partial progress. If set, tokens will be sent as data-only server-sent events as they become available, with the stream terminated by a data: [DONE] message. Example Python code.

    stream_options

    object

    nullable
    suffix
    stringnullable

    The suffix that comes after a completion of inserted text.
    temperature
    numbernullable

    Possible values: <= 2

    Default value: 1

    What sampling temperature to use, between 0 and 2. Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic.

    We generally recommend altering this or top_p but not both.
    top_p
    numbernullable

    Possible values: <= 1

    Default value: 1

    An alternative to sampling with temperature, called nucleus sampling, where the model considers the results of the tokens with top_p probability mass. So 0.1 means only the tokens comprising the top 10% probability mass are considered.

    We generally recommend altering this or temperature but not both.

Responses

    200

OK

    application/json

    Schema
    Example (from schema)

Schema

    id
    stringrequired

    A unique identifier for the completion.

    choices

    object[]

    required
    created
    integerrequired

    The Unix timestamp (in seconds) of when the completion was created.
    model
    stringrequired

    The model used for completion.
    system_fingerprint
    string

    This fingerprint represents the backend configuration that the model runs with.
    object
    stringrequired

    Possible values: [text_completion]

    The object type, which is always "text_completion"

    usage

    object

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

curl -L -X POST 'https://api.deepseek.com/beta/completions' \
-H 'Content-Type: application/json' \
-H 'Accept: application/json' \
-H 'Authorization: Bearer <TOKEN>' \
--data-raw '{
  "model": "deepseek-chat",
  "prompt": "Once upon a time, ",
  "echo": false,
  "frequency_penalty": 0,
  "logprobs": 0,
  "max_tokens": 1024,
  "presence_penalty": 0,
  "stop": null,
  "stream": false,
  "stream_options": null,
  "suffix": null,
  "temperature": 1,
  "top_p": 1
}'

Request Collapse all
Base URL
https://api.deepseek.com/beta
Base URL
https://api.deepseek.com/beta
Auth
Bearer Token
Body required

{
  "model": "deepseek-chat",
  "prompt": "Once upon a time, ",
  "echo": false,
  "frequency_penalty": 0,
  "logprobs": 0,
  "max_tokens": 1024,
  "presence_penalty": 0,
  "stop": null,
  "stream": false,
  "stream_options": null,
  "suffix": null,
  "temperature": 1,
  "top_p": 1
}

ResponseClear

Click the Send API Request button above and see th