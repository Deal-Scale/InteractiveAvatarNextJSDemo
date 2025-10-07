ctrl
K
Stack

Stack visually puts elements on top of each other.
Class name
Type
stack Component
Puts the children elements on top of each other
stack-top
Modifier
Aligns the children elements to the top
stack-bottom
Modifier
Aligns the children elements to the bottom [Default]
stack-start
Modifier
Aligns the children elements to the start (horizontally)
stack-end
Modifier
Aligns the children elements to the end (horizontally)

    You can usew-*andh-*classes to set the width and height of the stack, making all items the same size.

3 divs in a stack

<div className="stack h-20 w-32">
  <div className="bg-primary text-primary-content grid place-content-center rounded-box">1</div>
  <div className="bg-accent text-accent-content grid place-content-center rounded-box">2</div>
  <div className="bg-secondary text-secondary-content grid place-content-center rounded-box">
    3
  </div>
</div>

stacked images

<div className="stack w-48">
  <img src="https://img.daisyui.com/images/stock/photo-1572635148818-ef6fd45eb394.webp" className="rounded-box" />
  <img src="https://img.daisyui.com/images/stock/photo-1565098772267-60af42b81ef2.webp" className="rounded-box" />
  <img src="https://img.daisyui.com/images/stock/photo-1559703248-dcaaec9fab78.webp" className="rounded-box" />
</div>

stacked cards

<div className="stack size-28">
  <div className="border-base-content card bg-base-100 border text-center">
    <div className="card-body">A</div>
  </div>
  <div className="border-base-content card bg-base-100 border text-center">
    <div className="card-body">B</div>
  </div>
  <div className="border-base-content card bg-base-100 border text-center">
    <div className="card-body">C</div>
  </div>
</div>

stacked cards (top direction)

<div className="stack stack-top size-28">
  <div className="border-base-content card bg-base-100 border text-center">
    <div className="card-body">A</div>
  </div>
  <div className="border-base-content card bg-base-100 border text-center">
    <div className="card-body">B</div>
  </div>
  <div className="border-base-content card bg-base-100 border text-center">
    <div className="card-body">C</div>
  </div>
</div>

stacked cards (start direction)

<div className="stack stack-start size-28">
  <div className="border-base-content card bg-base-100 border text-center">
    <div className="card-body">A</div>
  </div>
  <div className="border-base-content card bg-base-100 border text-center">
    <div className="card-body">B</div>
  </div>
  <div className="border-base-content card bg-base-100 border text-center">
    <div className="card-body">C</div>
  </div>
</div>

stacked cards (end direction)

<div className="stack stack-end size-28">
  <div className="border-base-content card bg-base-100 border text-center">
    <div className="card-body">A</div>
  </div>
  <div className="border-base-content card bg-base-100 border text-center">
    <div className="card-body">B</div>
  </div>
  <div className="border-base-content card bg-base-100 border text-center">
    <div className="card-body">C</div>
  </div>
</div>

stacked cards with shadow

<div className="stack">
  <div className="card bg-base-200 text-center shadow-md">
    <div className="card-body">A</div>
  </div>
  <div className="card bg-base-200 text-center shadow">
    <div className="card-body">B</div>
  </div>
  <div className="card bg-base-200 text-center shadow-sm">
    <div className="card-body">C</div>
  </div>
</div>

stacked cards

<div className="stack">
  <div className="card shadow-md bg-base-100">
    <div className="card-body">
      <h2 className="card-title">Notification 1</h2>
      <p>You have 3 unread messages. Tap here to see.</p>
    </div>
  </div>
  <div className="card shadow-md bg-base-100">
    <div className="card-body">
      <h2 className="card-title">Notification 2</h2>
      <p>You have 3 unread messages. Tap here to see.</p>
    </div>
  </div>
  <div className="card shadow-md bg-base-100">
    <div className="card-body">
      <h2 className="card-title">Notification 3</h2>
      <p>You have 3 unread messages. Tap here to see.</p>
    </div>
  </div>
</div>

Do you have a question? Ask on GitHub or Discord server
Do you see a bug? open an issue on GitHub
Do you like daisyUI? Post about it!
Support daisyUI's development: Open Collective
Edit this page on GitHub
Text version for AI prompts
daisyUI store
NEXUS
Official daisyUI Dashboard Template
Available on daisyUI store
5.0.35

Actions

Data display

Navigation

Feedback

Data input

Layout

Mockup

Tailwind Stack Component — Tailwind CSS Components ( version 5 update is here )
