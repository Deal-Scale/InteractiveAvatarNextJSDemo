

ctrl
K
Toggle

Toggle is a checkbox that is styled to look like a switch button.
Class name
	Type	
toggle	Component
	For <input type="checkbox">
toggle-primary	
Color
	primary color
toggle-secondary	
Color
	secondary color
toggle-accent	
Color
	accent color
toggle-neutral	
Color
	neutral color
toggle-success	
Color
	success color
toggle-warning	
Color
	warning color
toggle-info	
Color
	info color
toggle-error	
Color
	error color
toggle-xs	
Size
	Extra small size
toggle-sm	
Size
	Small size
toggle-md	
Size
	Medium size [Default]
toggle-lg	
Size
	Large size
toggle-xl	
Size
	Extra large size
Toggle

<input type="checkbox" defaultChecked className="toggle" />

With fieldset and label

<fieldset className="fieldset bg-base-100 border-base-300 rounded-box w-64 border p-4">
  <legend className="fieldset-legend">Login options</legend>
  <label className="label">
    <input type="checkbox" defaultChecked className="toggle" />
    Remember me
  </label>
</fieldset>

Sizes

<input type="checkbox" defaultChecked className="toggle toggle-xs" />
<input type="checkbox" defaultChecked className="toggle toggle-sm" />
<input type="checkbox" defaultChecked className="toggle toggle-md" />
<input type="checkbox" defaultChecked className="toggle toggle-lg" />
<input type="checkbox" defaultChecked className="toggle toggle-xl" />

Colors

<input type="checkbox" defaultChecked className="toggle toggle-primary" />
<input type="checkbox" defaultChecked className="toggle toggle-secondary" />
<input type="checkbox" defaultChecked className="toggle toggle-accent" />
<input type="checkbox" defaultChecked className="toggle toggle-neutral" />

<input type="checkbox" defaultChecked className="toggle toggle-info" />
<input type="checkbox" defaultChecked className="toggle toggle-success" />
<input type="checkbox" defaultChecked className="toggle toggle-warning" />
<input type="checkbox" defaultChecked className="toggle toggle-error" />

Disabled

<input type="checkbox" className="toggle" disabled />
<input type="checkbox" className="toggle" disabled defaultChecked />

Indeterminate

{/* You can make a checkbox indeterminate using JS */}
<script>
  document.getElementById("my-toggle").indeterminate = true
</script>
<input type="checkbox" className="toggle" id="my-toggle" />

Toggle with icons inside
Use toggle class for a label, put a checkbox and 2 icons inside it.

<label className="toggle text-base-content">
  <input type="checkbox" />
  <svg aria-label="enabled" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <g
      strokeLinejoin="round"
      strokeLinecap="round"
      strokeWidth="4"
      fill="none"
      stroke="currentColor"
    >
      <path d="M20 6 9 17l-5-5"></path>
    </g>
  </svg>
  <svg
    aria-label="disabled"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="4"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
</label>

Toggle with custom colors

<input
  type="checkbox"
  checked="checked"
  className="toggle border-indigo-600 bg-indigo-500 checked:border-orange-500 checked:bg-orange-400 checked:text-orange-800"
/>

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

Tailwind Toggle Component — Tailwind CSS Components ( version 5 update is here )
