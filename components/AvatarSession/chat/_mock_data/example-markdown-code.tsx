import { Message, MessageSender } from "@/lib/types";

export const exampleMarkdownCode: {
  message: Message;
} = {
  message: {
    id: "demo-md-code-1",
    sender: MessageSender.AVATAR,
    content: String.raw`# Advanced Markdown + PromptKit Demo

Showcases rich markdown features compatible with the PromptKit renderer: callouts, task lists, tables, images, and multi-language code blocks with metadata.

- Inline code: \`npm run dev\`
- Links adapt to theme tokens: [Next.js](https://nextjs.org)
- Keyboard keys: <kbd>Ctrl</kbd> + <kbd>K</kbd>

> Note
> This is a callout rendered using a blockquote. Use it for tips and context.

---

## Task List

- [x] Initialize project
- [x] Add PromptKit components
- [ ] Wire up real API
- [ ] Add e2e tests

---

## Comparison Table

| Feature        | Status   | Notes                         |
| -------------- | -------- | ----------------------------- |
| Reasoning UI   | Ready    | Collapsible, default-open     |
| Tool UI        | Ready    | Tokenized, multiple states    |
| Code Blocks    | Ready    | Shiki highlighting, themes    |
| Sources        | Ready    | Chip + hover card with tokens |

---

## Image

![Demo Image](/demo.png)

---

## JavaScript (with filename + highlight lines)

~~~js {filename="greet.js" title="Greeter" highlight="1,3"}
function greet(name) {
  return \`Hello, \${name}!\`;
}
console.log(greet("World"));
~~~

## TypeScript + Theme Override

~~~tsx {theme="nord" filename="Counter.tsx"}
import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount((c) => c + 1)}>
      Count: {count}
    </button>
  );
}
~~~

## Python

~~~python {filename="fib.py"}
def fibonacci(n):
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b

print(list(fibonacci(5)))
~~~

## CSS (card tokens)

~~~css {filename="card.css"}
.card {
  background: var(--card);
  color: var(--foreground);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
}
~~~

## Diff (package updates)

~~~diff {filename="package.json"}
 {
   "dependencies": {
-    "shiki": "^0.14.0"
+    "shiki": "^1.0.0"
   }
 }
~~~
`
  },
};
