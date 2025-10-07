# Factory Pattern

The Factory pattern provides a way to create objects without specifying the exact class of object that will be created. This is useful for managing and centralizing object creation, especially when dealing with complex objects or families of related objects.

## When to Use
- Component creation in UI frameworks
- Managing object instantiation logic
- Abstracting away class details

## Example (JavaScript)
```js
function ButtonFactory(type) {
  if (type === 'primary') {
    return { color: 'blue', label: 'Primary' };
  } else if (type === 'secondary') {
    return { color: 'gray', label: 'Secondary' };
  }
  return { color: 'black', label: 'Default' };
}

const btn = ButtonFactory('primary');
console.log(btn); // { color: 'blue', label: 'Primary' }
```

## Real World Usage
- **React:** Factories are used for dynamic component rendering (e.g., render props, component factories).
- **UI Libraries:** Theme or style factories for consistent UI.
- **Testing:** Test data factories for generating mock objects.

## TypeScript Example
```ts
type ButtonType = 'primary' | 'secondary' | 'default';

interface Button {
  color: string;
  label: string;
}

function buttonFactory(type: ButtonType): Button {
  switch (type) {
    case 'primary':
      return { color: 'blue', label: 'Primary' };
    case 'secondary':
      return { color: 'gray', label: 'Secondary' };
    default:
      return { color: 'black', label: 'Default' };
  }
}

const btn = buttonFactory('primary');
```

## Pros
- Centralizes creation logic
- Promotes DRY principle

## Cons
- Adds complexity
- Can obscure code intent if overused

## Anti-Patterns / Common Mistakes
- Overusing factories for simple objects adds unnecessary abstraction.
- Factories that leak implementation details defeat their purpose.

## Checklist
- [ ] Factory hides all instantiation logic from the consumer.
- [ ] Factory is easy to extend for new types.
- [ ] Factory does not expose implementation details.

## References
- [Refactoring Guru: Factory](https://refactoring.guru/design-patterns/factory-method)
- [MDN: Object.create](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create)
