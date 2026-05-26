

ctrl
K
Join

Join is a container for grouping multiple items, it can be used to group buttons, inputs, etc. Join applies border radius to the first and last item. Join can be used to create a horizontal or vertical list of items.
Class name
	Type	
join	Component
	For grouping multiple items
join-item	Component
	Item inside join. Can be a button, input, etc.
join-vertical	
direction
	Show items vertically
join-horizontal	
direction
	Show items horizontally
Join

<div className="join">
  <button className="btn join-item">Button</button>
  <button className="btn join-item">Button</button>
  <button className="btn join-item">Button</button>
</div>

Group items vertically

<div className="join join-vertical">
  <button className="btn join-item">Button</button>
  <button className="btn join-item">Button</button>
  <button className="btn join-item">Button</button>
</div>

Responsive: it's vertical on small screen and horizontal on large screen

<div className="join join-vertical lg:join-horizontal">
  <button className="btn join-item">Button</button>
  <button className="btn join-item">Button</button>
  <button className="btn join-item">Button</button>
</div>

With extra elements in the group
Even if join-item is not a direct child of the group, it still gets the style

<div className="join">
  <div>
    <div>
      <input className="input join-item" placeholder="Search" />
    </div>
  </div>
  <select className="select join-item">
    <option disabled selected>Filter</option>
    <option>Sci-fi</option>
    <option>Drama</option>
    <option>Action</option>
  </select>
  <div className="indicator">
    <span className="indicator-item badge badge-secondary">new</span>
    <button className="btn join-item">Search</button>
  </div>
</div>

Custom border radius

<div className="join">
  <input className="input join-item" placeholder="Email" />
  <button className="btn join-item rounded-r-full">Subscribe</button>
</div>

Join radio inputs with btn style

<div className="join">
  <input className="join-item btn" type="radio" name="options" aria-label="Radio 1" />
  <input className="join-item btn" type="radio" name="options" aria-label="Radio 2" />
  <input className="join-item btn" type="radio" name="options" aria-label="Radio 3" />
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

Tailwind Join Component — Tailwind CSS Components ( version 5 update is here )
