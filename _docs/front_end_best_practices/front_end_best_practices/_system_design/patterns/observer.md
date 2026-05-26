# Observer Pattern

The Observer pattern defines a one-to-many dependency between objects so that when one object changes state, all its dependents are notified and updated automatically. This is widely used in UI frameworks and event-driven architectures.

## When to Use
- Event systems (e.g., DOM events)
- State management (e.g., React hooks, Redux subscriptions)
- Real-time data updates

## Example (JavaScript)
```js
class Subject {
  constructor() {
    this.observers = [];
  }
  subscribe(observer) {
    this.observers.push(observer);
  }
  unsubscribe(observer) {
    this.observers = this.observers.filter(obs => obs !== observer);
  }
  notify(data) {
    this.observers.forEach(observer => observer(data));
  }
}

const subject = new Subject();
subject.subscribe(data => console.log('Observer 1:', data));
subject.notify('Hello');
```

## Real World Usage
- **React:** useEffect and useSubscription hooks implement observer-like behavior.
- **Redux:** Store subscriptions notify components of state changes.
- **RxJS:** Implements the observer pattern for reactive programming.

## TypeScript Example
```ts
interface Observer<T> {
  update: (data: T) => void;
}

class Subject<T> {
  private observers: Observer<T>[] = [];
  subscribe(observer: Observer<T>) {
    this.observers.push(observer);
  }
  unsubscribe(observer: Observer<T>) {
    this.observers = this.observers.filter(obs => obs !== observer);
  }
  notify(data: T) {
    this.observers.forEach(observer => observer.update(data));
  }
}

class ConcreteObserver implements Observer<string> {
  update(data: string) {
    console.log('Received:', data);
  }
}

const subject = new Subject<string>();
const observer = new ConcreteObserver();
subject.subscribe(observer);
subject.notify('TypeScript Observer!');
```

## Pros
- Decouples subject and observers
- Promotes reactive programming

## Cons
- Can lead to memory leaks if not managed
- Notification order is not guaranteed

## Anti-Patterns / Common Mistakes
- Not unsubscribing observers can cause memory leaks.
- Overcomplicating with observers when simple callbacks suffice.

## Checklist
- [ ] Observers are unsubscribed when no longer needed.
- [ ] Subject does not hold references to unused observers.
- [ ] Use observer pattern only when many dependents need notification.

## References
- [Refactoring Guru: Observer](https://refactoring.guru/design-patterns/observer)
- [MDN: EventTarget](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget)
