# Strategy Pattern

The Strategy pattern defines a family of algorithms, encapsulates each one, and makes them interchangeable. The algorithm can vary independently from clients that use it. This is useful for situations where multiple approaches to a problem are needed.

## When to Use
- Sorting, filtering, or validation logic
- Swappable business rules
- Feature toggles

## Example (JavaScript)
```js
class Sorter {
  constructor(strategy) {
    this.strategy = strategy;
  }
  sort(data) {
    return this.strategy(data);
  }
}

const ascending = arr => arr.sort((a, b) => a - b);
const descending = arr => arr.sort((a, b) => b - a);

const sorter = new Sorter(ascending);
console.log(sorter.sort([3, 1, 2])); // [1, 2, 3]
```

## Real World Usage
- **Sorting/Filtering:** Table sorting/filtering logic in UI libraries.
- **Validation:** Swappable validation strategies for forms.
- **Feature Toggles:** Enable/disable features with different strategies at runtime.

## TypeScript Example
```ts
interface SortStrategy {
  sort(data: number[]): number[];
}

class AscendingSort implements SortStrategy {
  sort(data: number[]): number[] {
    return [...data].sort((a, b) => a - b);
  }
}

class DescendingSort implements SortStrategy {
  sort(data: number[]): number[] {
    return [...data].sort((a, b) => b - a);
  }
}

class Sorter {
  constructor(private strategy: SortStrategy) {}
  setStrategy(strategy: SortStrategy) {
    this.strategy = strategy;
  }
  sort(data: number[]): number[] {
    return this.strategy.sort(data);
  }
}

const sorter = new Sorter(new AscendingSort());
console.log(sorter.sort([3, 1, 2])); // [1, 2, 3]
```

## Pros
- Promotes open/closed principle
- Cleaner code for swappable logic

## Cons
- Adds extra classes/functions
- Can be overkill for simple cases

## Anti-Patterns / Common Mistakes
- Using strategy when only one algorithm is ever needed.
- Not exposing a way to change the strategy at runtime.

## Checklist
- [ ] Strategy is swappable at runtime if required.
- [ ] Strategy interface is clearly defined.
- [ ] Avoid unnecessary complexity for simple use cases.

## References
- [Refactoring Guru: Strategy](https://refactoring.guru/design-patterns/strategy)
- [MDN: Functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions)
