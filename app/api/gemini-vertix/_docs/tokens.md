 Counting tokens

For a detailed guide on counting tokens using the Gemini API, including how images, audio and video are counted, see the Token counting guide and accompanying Cookbook recipe.
Method: models.countTokens

Runs a model's tokenizer on input Content and returns the token count. Refer to the tokens guide to learn more about tokens.
Endpoint
post https://generativelanguage.googleapis.com/v1beta/{model=models/*}:countTokens
Path parameters
model string

Required. The model's resource name. This serves as an ID for the Model to use.

This name should match a model name returned by the models.list method.

Format: models/{model} It takes the form models/{model}.
Request body

The request body contains data with the following structure:
Fields
contents[] object (Content)

Optional. The input given to the model as a prompt. This field is ignored when generateContentRequest is set.
generateContentRequest object (GenerateContentRequest)

Optional. The overall input given to the Model. This includes the prompt as well as other model steering information like system instructions, and/or function declarations for function calling. Models/Contents and generateContentRequests are mutually exclusive. You can either send Model + Contents or a generateContentRequest, but never both.
Example request
Text
Chat
Inline media
Video
PDF
Cache
Python
Node.js
Go
Shell

from google import genai

client = genai.Client()
prompt = "The quick brown fox jumps over the lazy dog."

# Count tokens using the new client method.
total_tokens = client.models.count_tokens(
    model="gemini-2.0-flash", contents=prompt
)
print("total_tokens: ", total_tokens)
# ( e.g., total_tokens: 10 )

response = client.models.generate_content(
    model="gemini-2.0-flash", contents=prompt
)

# The usage_metadata provides detailed token counts.
print(response.usage_metadata)
# ( e.g., prompt_token_count: 11, candidates_token_count: 73, total_token_count: 84 )

Response body

A response from models.countTokens.

It returns the model's tokenCount for the prompt.

If successful, the response body contains data with the following structure:
Fields
totalTokens integer

The number of tokens that the Model tokenizes the prompt into. Always non-negative.
cachedContentTokenCount integer

Number of tokens in the cached part of the prompt (the cached content).
promptTokensDetails[] object (ModalityTokenCount)

Output only. List of modalities that were processed in the request input.
cacheTokensDetails[] object (ModalityTokenCount)

Output only. List of modalities that were processed in the cached content.
JSON representation

{
  "totalTokens": integer,
  "cachedContentTokenCount": integer,
  "promptTokensDetails": [
    {
      object (ModalityTokenCount)
    }
  ],
  "cacheTokensDetails": [
    {
      object (ModalityTokenCount)
    }
  ]
}