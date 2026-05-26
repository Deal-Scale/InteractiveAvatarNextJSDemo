ctrl
K
Indicator

Indicators are used to place an element on the corner of another element.
Class name
Type
indicator Component
Container element
indicator-item
Part
will be placed on the corner of sibling
indicator-start
Placement
align horizontally to the start
indicator-center
Placement
align horizontally to the center
indicator-end
Placement
align horizontally to the end [Default]
indicator-top
Placement
align vertically to top [Default]
indicator-middle
Placement
align vertically to middle
indicator-bottom
Placement
align vertically to bottom
Status Indicator

<div className="indicator">
  <span className="indicator-item status status-success"></span>
  <div className="bg-base-300 grid h-32 w-32 place-items-center">content</div>
</div>

Badge as indicator

<div className="indicator">
  <span className="indicator-item badge badge-primary">New</span>
  <div className="bg-base-300 grid h-32 w-32 place-items-center">content</div>
</div>

for button

<div className="indicator">
  <span className="indicator-item badge badge-secondary">12</span>
  <button className="btn">inbox</button>
</div>

for tab

<div className="tabs tabs-lift">
  <a className="tab">Messages</a>
  <a className="indicator tab tab-active">
    Notifications
    <span className="indicator-item badge">8</span>
  </a>
  <a className="tab">Requests</a>
</div>

for avatar

<div className="avatar indicator">
  <span className="indicator-item badge badge-secondary">Justice</span>
  <div className="h-20 w-20 rounded-lg">
    <img
      alt="Tailwind CSS examples"
      src="https://img.daisyui.com/images/profile/demo/batperson@192.webp"
    />
  </div>
</div>

for an input

<div className="indicator">
  <span className="indicator-item badge">Required</span>
  <input type="text" placeholder="Your email address" className="input input-bordered" />
</div>

A button as an indicator for a card

<div className="indicator">
  <div className="indicator-item indicator-bottom">
    <button className="btn btn-primary">Apply</button>
  </div>
  <div className="card border-base-300 border shadow-sm">
    <div className="card-body">
      <h2 className="card-title">Job Title</h2>
      <p>Rerum reiciendis beatae tenetur excepturi</p>
    </div>
  </div>
</div>

in center of an image

<div className="indicator">
  <span className="indicator-item indicator-center indicator-middle">
    Only available for Pro users
  </span>
  <img
    alt="Tailwind CSS examples"
    src="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"
  />
</div>

indicator-top (default) indicator-start

<div className="indicator">
  <span className="indicator-item indicator-start badge badge-secondary"></span>
  <div className="bg-base-300 grid h-32 w-32 place-items-center">content</div>
</div>

indicator-top (default) indicator-center

<div className="indicator">
  <span className="indicator-item indicator-center badge badge-secondary"></span>
  <div className="bg-base-300 grid h-32 w-32 place-items-center">content</div>
</div>

indicator-top (default) indicator-end (default)

<div className="indicator">
  <span className="indicator-item badge badge-secondary"></span>
  <div className="bg-base-300 grid h-32 w-32 place-items-center">content</div>
</div>

indicator-middle indicator-start

<div className="indicator">
  <span
    className="indicator-item indicator-middle indicator-start badge badge-secondary"
  ></span>
  <div className="bg-base-300 grid h-32 w-32 place-items-center">content</div>
</div>

indicator-middle indicator-center

<div className="indicator">
  <span
    className="indicator-item indicator-middle indicator-center badge badge-secondary"
  ></span>
  <div className="bg-base-300 grid h-32 w-32 place-items-center">content</div>
</div>

indicator-middle indicator-end (default)

<div className="indicator">
  <span className="indicator-item indicator-middle badge badge-secondary"></span>
  <div className="bg-base-300 grid h-32 w-32 place-items-center">content</div>
</div>

indicator-bottom indicator-start

<div className="indicator">
  <span
    className="indicator-item indicator-bottom indicator-start badge badge-secondary"
  ></span>
  <div className="bg-base-300 grid h-32 w-32 place-items-center">content</div>
</div>

indicator-bottom indicator-center

<div className="indicator">
  <span
    className="indicator-item indicator-bottom indicator-center badge badge-secondary"
  ></span>
  <div className="bg-base-300 grid h-32 w-32 place-items-center">content</div>
</div>

indicator-bottom indicator-end (default)

<div className="indicator">
  <span className="indicator-item indicator-bottom badge badge-secondary"></span>
  <div className="bg-base-300 grid h-32 w-32 place-items-center">content</div>
</div>

multiple indicators

<div className="indicator">
  <span className="indicator-item indicator-top indicator-start badge">↖︎</span>
  <span className="indicator-item indicator-top indicator-center badge">↑</span>
  <span className="indicator-item indicator-top indicator-end badge">↗︎</span>
  <span className="indicator-item indicator-middle indicator-start badge">←</span>
  <span className="indicator-item indicator-middle indicator-center badge">●</span>
  <span className="indicator-item indicator-middle indicator-end badge">→</span>
  <span className="indicator-item indicator-bottom indicator-start badge">↙︎</span>
  <span className="indicator-item indicator-bottom indicator-center badge">↓</span>
  <span className="indicator-item indicator-bottom indicator-end badge">↘︎</span>
  <div className="bg-base-300 grid h-32 w-60 place-items-center">Box</div>
</div>

Responsive
changes position based on resolution

<div className="indicator">
  <span
    className="indicator-item indicator-start sm:indicator-middle md:indicator-bottom lg:indicator-center xl:indicator-end badge badge-secondary"
  ></span>
  <div className="bg-base-300 grid h-32 w-32 place-items-center">content</div>
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

Tailwind Indicator Component — Tailwind CSS Components ( version 5 update is here )
