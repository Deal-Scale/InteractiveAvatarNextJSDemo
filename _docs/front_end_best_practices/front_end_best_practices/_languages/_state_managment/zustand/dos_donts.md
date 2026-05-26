Zustand in React: DOs and DON’Ts
Nicolás Failla
Nicolás Failla
5 min read
·
May 23, 2022

Photo by Chanel Chomse on Unsplash

In the last post, we’ve seen how to setup Zustand, setting up some middlewares and stuff. Now it’s time to see some usage dos and dont’s.
Picking state

In the previous post, I’ve chosen to pick every slice of state separatedly, instead of just picking the whole state right away:
State values being picked one by one

When picking state from a Zustand store, you have to take into account how does that affect components re-rendering.

If the slice you select changes, it will trigger a re-render. If the slice you are selecting is the whole state, well… expect to experience a re-render any time any slice of state changes.

Let’s see it in practice.
Don’t: pick the whole state
BAD: we are picking the whole state

Open the sandbox’s console and look at those console.logs.

Whenever you click on Change, you’ll see both components re-rendering, even though GiftsCount doesn’t need to. The same happens with CurrentGift when you click on decrement or increment.
Example on how picking the whole state is a bad idea

(If you are testing this somewhere else, you might see two console.logs instead of one. If that’s the case, it might be because of React strict mode. I turned it off in this example just for simplicity.)
Do: pick a single value or a slice instead

Here, we just pick the specific slice we need in every component.
Pick state values one by one
This way, we get rid of those unnecessary re-renders

Look at those console.logs. Much better. Anyway, we are repeating a little bit ourselves. We’ll see how to tackle that in a moment.

As a side note, look at how we are calling the decrement action whenever we click on Decrement, but it doesn’t go below zero. Even though we are calling set on the action, as it doesn’t result in a state change, no re-renders are being triggered.
Do: pick multiple state values and/or actions in a single hook call

In order to do that, you need to pass a shallow comparison function as a second argument, otherwise Zustand would compare picks by identity, and therefore trigger unnecessary re-renders.
Return an array or an object with state values and/or actions
This works as good as the previous example

Be careful with overusing it anyway, as it doesn’t scale well. You might end up in a situation like this:
The values array being retrieved by the state grows quickly, which gets nightmarish

Which is just plain monstrous. I’d rather have something like this:
Picking all those values one by one scales better

Which is about half its length and way easier to reason about.
Calculated state

Sometimes, you would like to calculate state on demand, instead of storing a calculated value and retrieving it later.

You have to be careful with this approach, because changes in the values used inside actions don’t trigger re-renders on the components picking the actions.
Don’t: pick actions which calculate state and forget about re-renders

Check it out: the component which relies on calculated state (in the example, the one which displays the total) won’t re-render although it is intended to do so:
BAD: Picking an action which calculates state and calling it below
Try playing with the actions. The total won’t change.
Do: use the calculated value itself in the state selector callback

This way, your component will re-render any time the calculated value dependencies change:
Calculating the total in the state selector callback itself
This gets our code working

Once again, if you leave the count in zero, switching the gift won’t re-render the Total component, as the calculated value isn’t changing.
Do: delay the calculation until you really need it

You can also just pick the action itself and delay the calculation to the exact moment you depend on it.

This is a contrived example, but there are scenarios where the calculation is expensive and could be delayed.

Here, we only calculate and display the total when the user asks for it. We hide it out whenever the user changes a value.
Delaying the calculation could be useful, when used well
Private state with TypeScript

Did I mention that Zustand supports TypeScript? I’m sorry, I should’ve said that before.

Sometimes, you’d want to hide some piece of state or actions from the outside world. If you are using JavaScript, you’d have to rely on conventions (e.g. prefixing values and actions with an underscore). In TypeScript, there is a more interesting approach.
Don’t: use underscores for hiding state in TS

This is self-explanatory. TypeScript would find the state we‘d rather like to keep hidden.
A value prefixed with an underscore is still visible for TypeScript
A value that’s intended to be private is perfectly visible
Do: use a narrower state type than its actual type

This will get more clear with an example. Look at this:
Declare an interface with fewer properties than the actual state
This keeps us kind of safe

No way to see the private value outside the store! (In fact, given that this is kind of weak encapsulation, we could always rely on some tricks and access those properties anyway.)
Before you go

More articles are coming on Zustand and other stuff, stay tuned and do not hesitate to drop a message!

Also, don’t forget to follow me on Twitter!