

ctrl
K
Divider

Divider will be used to separate content vertically or horizontally.
Class name
	Type	
divider	Component
	A divider line between two elements
divider-neutral	
Color
	neutral color
divider-primary	
Color
	primary color
divider-secondary	
Color
	secondary color
divider-accent	
Color
	accent color
divider-success	
Color
	success color
divider-warning	
Color
	warning color
divider-info	
Color
	info color
divider-error	
Color
	error color
divider-vertical	
direction
	Divide vertical elements (on top of each other) [Default]
divider-horizontal	
direction
	Divide horizontal elements (next to each other)
divider-start	
Placement
	Pushes the divider text to the start
divider-end	
Placement
	Pushes the divider text to the end
Divider

<div className="flex w-full flex-col">
  <div className="card bg-base-300 rounded-box grid h-20 place-items-center">content</div>
  <div className="divider">OR</div>
  <div className="card bg-base-300 rounded-box grid h-20 place-items-center">content</div>
</div>

Divider horizontal

<div className="flex w-full">
  <div className="card bg-base-300 rounded-box grid h-20 grow place-items-center">content</div>
  <div className="divider divider-horizontal">OR</div>
  <div className="card bg-base-300 rounded-box grid h-20 grow place-items-center">content</div>
</div>

Divider with no text

<div className="flex w-full flex-col">
  <div className="card bg-base-300 rounded-box grid h-20 place-items-center">content</div>
  <div className="divider"></div>
  <div className="card bg-base-300 rounded-box grid h-20 place-items-center">content</div>
</div>

responsive (lg:divider-horizontal)

<div className="flex w-full flex-col lg:flex-row">
  <div className="card bg-base-300 rounded-box grid h-32 grow place-items-center">content</div>
  <div className="divider lg:divider-horizontal">OR</div>
  <div className="card bg-base-300 rounded-box grid h-32 grow place-items-center">content</div>
</div>

Divider with colors

<div className="flex w-full flex-col">
  <div className="divider">Default</div>
  <div className="divider divider-neutral">Neutral</div>
  <div className="divider divider-primary">Primary</div>
  <div className="divider divider-secondary">Secondary</div>
  <div className="divider divider-accent">Accent</div>
  <div className="divider divider-success">Success</div>
  <div className="divider divider-warning">Warning</div>
  <div className="divider divider-info">Info</div>
  <div className="divider divider-error">Error</div>
</div>

Divider in different positions

<div className="flex w-full flex-col">
  <div className="divider divider-start">Start</div>
  <div className="divider">Default</div>
  <div className="divider divider-end">End</div>
</div>

Divider in different positions (horizontal)

<div className="flex w-full">
  <div className="divider divider-horizontal divider-start">Start</div>
  <div className="divider divider-horizontal">Default</div>
  <div className="divider divider-horizontal divider-end">End</div>
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

Tailwind Divider Component — Tailwind CSS Components ( version 5 update is here )
