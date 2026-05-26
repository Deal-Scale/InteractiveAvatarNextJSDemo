# Decorator Pattern

The Decorator pattern allows behavior to be added to individual objects, dynamically, without affecting the behavior of other objects from the same class. This is useful for extending functionality in a flexible and reusable way.

## When to Use
- Enhancing components (e.g., higher-order components in React)
- Adding features to objects at runtime
- Wrapping libraries or APIs

## Example (JavaScript)
```js
function withTimestamp(fn) {
  return function(...args) {
    console.log('Timestamp:', Date.now());
    return fn(...args);
  };
}

function greet(name) {
  return `Hello, ${name}`;
}

const decoratedGreet = withTimestamp(greet);
console.log(decoratedGreet('Alice'));
```

## Real World Usage
- **React:** Higher-Order Components (HOCs) and hooks (e.g., `withRouter`, `useTheme`) are decorator-like patterns for enhancing components.
- **Redux:** Middleware and enhancers often use decorators to add logging, persistence, etc.
- **Styled Components:** The `styled()` function wraps components to add styles dynamically.

## TypeScript Example
```ts
function withLogger<T extends (...args: any[]) => any>(fn: T): T {
  return ((...args: Parameters<T>): ReturnType<T> => {
    console.log('Calling function with args:', args);
    return fn(...args);
  }) as T;
}

function sayHello(name: string): string {
  return `Hello, ${name}!`;
}

const loggedHello = withLogger(sayHello);
loggedHello('TypeScript');
```

## Pros
- Flexible extension of behavior
- Promotes composition over inheritance

## Cons
- Can make code harder to trace
- Many small wrappers can add complexity

## Anti-Patterns / Common Mistakes
- Wrapping too many times (decorator hell) makes debugging hard.
- Using decorators to hide side effects or business logic can reduce code clarity.

## Checklist
- [ ] Decorators are pure and do not introduce side effects.
- [ ] Document all decorators and their purpose.
- [ ] Avoid deep decorator chains unless necessary.

## References
- [Refactoring Guru: Decorator](https://refactoring.guru/design-patterns/decorator)
- [MDN: Higher-Order Functions](https://developer.mozilla.org/en-US/docs/Glossary/Higher-order_function)
