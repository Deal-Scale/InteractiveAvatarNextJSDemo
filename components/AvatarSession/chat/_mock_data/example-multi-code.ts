import { Message, MessageSender } from "@/lib/types";

export const exampleMultiCode: {
  message: Message;
} = {
  message: {
    id: "demo-multi-code-1",
    sender: MessageSender.AVATAR,
    content: String.raw`# Multiple Code Blocks

Below are several fenced code blocks across different languages in a single message.

---

## Shell

~~~bash
pnpm install
pnpm dev
~~~

## JavaScript

~~~js
export function sum(a, b) {
  return a + b;
}
console.log(sum(2, 3));
~~~

## TypeScript

~~~ts
type User = { id: string; name: string };
const u: User = { id: "1", name: "Ada" };
~~~

## TSX

~~~tsx
import { useState } from "react";

export default function Counter() {
  const [c, setC] = useState(0);
  return <button onClick={() => setC((v) => v + 1)}>Count: {c}</button>;
}
~~~

## Python

~~~python
def fib(n):
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b

print(list(fib(6)))
~~~

## CSS

~~~css
.card {
  background: var(--card);
  color: var(--foreground);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
}
~~~
`,
  },
};
