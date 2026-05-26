API Call
Are there any rate limits when calling your API? Can I increase the limits for my account?

The rate limit exposed on each account is adjusted dynamically according to our real-time traffic pressure and each account's short-term historical usage.

We temporarily do not support increasing the dynamic rate limit exposed on any individual account, thanks for your understanding.
Why do I feel that your API's speed is slower than the web service?

The web service uses streaming output, i.e., every time the model outputs a token, it will be displayed incrementally on the web page.

The API uses non-streaming output (stream=false) by default, i.e., the model's output will not be returned to the user until the generation is done completely. You can use streaming output in your API call to optimize interactivity.
Why are empty lines continuously returned when calling the API?

To prevent the TCP connection from being interrupted due to timeout, we continuously return empty lines (for non-streaming requests) or SSE keep-alive comments ( : keep-alive，for streaming requests) while waiting for the request to be scheduled. If you are parsing the HTTP response yourself, please make sure to handle these empty lines or comments appropriately.
Does your API support LangChain?

Yes. You can refer to the demo code below, which demonstrates how to use LangChain with DeepSeek API. Replace the API key in the code as necessary.

deepseek_langchain.py
How to calculate token usage offline?

Please refer to Token & Token Usage