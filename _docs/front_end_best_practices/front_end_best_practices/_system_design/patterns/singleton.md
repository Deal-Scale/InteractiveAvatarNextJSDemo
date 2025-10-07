# Singleton Pattern

The Singleton pattern ensures that a class has only one instance and provides a global point of access to it. This is useful for situations where a single object is needed to coordinate actions across the system, such as a configuration manager or a logging service.

## When to Use
- Global state management (e.g., app-wide settings)
- Shared resources (e.g., database connections)
- Logging utilities

## Real World Usage
- **React Context:** The context provider is often a singleton for app-wide state.
- **Configuration:** App config or environment variables are managed as singletons.
- **Logging:** Logger instances are typically singletons.

## Example (JavaScript)
```js
class Singleton {
  constructor() {
    if (!Singleton.instance) {
      this.value = Math.random();
      Singleton.instance = this;
    }
    return Singleton.instance;
  }
}

const instance1 = new Singleton();
const instance2 = new Singleton();
console.log(instance1 === instance2); // true
```

## TypeScript Example
```ts
class Singleton {
  private static instance: Singleton;
  private constructor(public value: number) {}
  static getInstance(): Singleton {
    if (!Singleton.instance) {
      Singleton.instance = new Singleton(Math.random());
    }
    return Singleton.instance;
  }
}

const a = Singleton.getInstance();
const b = Singleton.getInstance();
console.log(a === b); // true
```

## Pros
- Controlled access to sole instance
- Reduces memory footprint

## Cons
- Can introduce global state (anti-pattern if overused)
- Harder to test

## Anti-Patterns / Common Mistakes
- Using singletons for global mutable state can lead to hidden dependencies.
- Singleton misuse makes unit testing harder.

## Checklist
- [ ] Singleton is stateless or manages immutable state where possible.
- [ ] Avoid singletons for business logic.
- [ ] Singleton is easily mockable for tests.

## References
- [Refactoring Guru: Singleton](https://refactoring.guru/design-patterns/singleton)
- [MDN: Module Pattern (related)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
