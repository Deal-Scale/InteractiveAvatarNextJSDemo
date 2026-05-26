How to Conduct Comparison Testing

You can control which model version to access by modifying the base_url:

    When using the original method to access the API, you will reach the DeepSeek-V3.2-Exp model
    When you set base_url="https://api.deepseek.com/v3.1_terminus_expires_on_20251015", you are accessing the DeepSeek-V3.1-Terminus model.

The correspondence between base_url settings and specific model versions is shown in the table below:
API Type	base_url Setting	Model Version
OpenAI	https://api.deepseek.com	DeepSeek-V3.2-Exp
Anthropic	https://api.deepseek.com/anthropic	DeepSeek-V3.2-Exp
OpenAI	https://api.deepseek.com/v3.1_terminus_expires_on_20251015	DeepSeek-V3.1-Terminus
Anthropic	https://api.deepseek.com/v3.1_terminus_expires_on_20251015/anthropic	DeepSeek-V3.1-Terminus
Usage Examples
Accessing V3.1-Terminus via OpenAI-Compatible API

    curl
    python
    nodejs

Invoke The API

curl https://api.deepseek.com/v3.1_terminus_expires_on_20251015/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${DEEPSEEK_API_KEY}" \
  -d '{
        "model": "deepseek-chat",
        "messages": [
          {"role": "system", "content": "You are a helpful assistant."},
          {"role": "user", "content": "Hello!"}
        ],
        "stream": false
      }'

Sample Output

{
    ... ...
    "model": "deepseek-v3.1-terminus",
    "choices": [
        {
            "index": 0,
            "message": {
                "role": "assistant",
                "content": "Hello! How can I help you today?"
            },
            "logprobs": null,
            "finish_reason": "stop"
        }
    ],
    ... ...
}

As shown in the sample output, you can verify whether the called model is V3.1-Terminus by checking the model field in the API response.
Accessing V3.1-Terminus via Claude Code

When setting up Claude Code environment variables, you need to modify the ANTHROPIC_BASE_URL environment variable to access the DeepSeek-V3.1-Terminus model:

export ANTHROPIC_BASE_URL=https://api.deepseek.com/v3.1_terminus_expires_on_20251015/anthropic

For complete configuration instructions, please refer to the Anthropic API Guide.https://api-docs.deepseek.com/guides/anthropic_api