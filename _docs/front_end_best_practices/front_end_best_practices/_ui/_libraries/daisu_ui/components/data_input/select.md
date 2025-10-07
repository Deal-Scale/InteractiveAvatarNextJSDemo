Select

Select is used to pick a value from a list of options.
Class name
	Type	
select	Component
	For <select> element
select-ghost	
Style
	ghost style
select-neutral	
Color
	neutral color
select-primary	
Color
	primary color
select-secondary	
Color
	secondary color
select-accent	
Color
	accent color
select-info	
Color
	info color
select-success	
Color
	success color
select-warning	
Color
	warning color
select-error	
Color
	error color
select-xs	
Size
	Extra small size
select-sm	
Size
	Small size
select-md	
Size
	Medium size [Default]
select-lg	
Size
	Large size
select-xl	
Size
	Extra large size
Select

<select defaultValue="Pick a color" className="select">
  <option disabled={true}>Pick a color</option>
  <option>Crimson</option>
  <option>Amber</option>
  <option>Velvet</option>
</select>

Ghost (no background)

<select defaultValue="Pick a font" className="select select-ghost">
  <option disabled={true}>Pick a font</option>
  <option>Inter</option>
  <option>Poppins</option>
  <option>Raleway</option>
</select>

With fieldset and labels

<fieldset className="fieldset">
  <legend className="fieldset-legend">Browsers</legend>
  <select defaultValue="Pick a browser" className="select">
    <option disabled={true}>Pick a browser</option>
    <option>Chrome</option>
    <option>FireFox</option>
    <option>Safari</option>
  </select>
  <span className="label">Optional</span>
</fieldset>

Primary color

<select defaultValue="Pick a text editor" className="select select-primary">
  <option disabled={true}>Pick a text editor</option>
  <option>VScode</option>
  <option>VScode fork</option>
  <option>Another VScode fork</option>
</select>

Secondary color

<select defaultValue="Pick a language" className="select select-secondary">
  <option disabled={true}>Pick a language</option>
  <option>Zig</option>
  <option>Go</option>
  <option>Rust</option>
</select>

Accent color

<select defaultValue="Color scheme" className="select select-accent">
  <option disabled={true}>Color scheme</option>
  <option>Light mode</option>
  <option>Dark mode</option>
  <option>System</option>
</select>

Neutral color

<select defaultValue="Server location" className="select select-neutral">
  <option disabled={true}>Server location</option>
  <option>North America</option>
  <option>EU west</option>
  <option>South East Asia</option>
</select>

Info color

<select defaultValue="Pick a Framework" className="select select-info">
  <option disabled={true}>Pick a Framework</option>
  <option>React</option>
  <option>Vue</option>
  <option>Angular</option>
</select>

Success color

<select defaultValue="Pick a Runtime" className="select select-success">
  <option disabled={true}>Pick a Runtime</option>
  <option>npm</option>
  <option>Bun</option>
  <option>yarn</option>
</select>

Warning color

<select defaultValue="Pick an OS" className="select select-warning">
  <option disabled={true}>Pick an OS</option>
  <option>Windows</option>
  <option>MacOS</option>
  <option>Linux</option>
</select>

Error color

<select defaultValue="Pick an AI Model" className="select select-error">
  <option disabled={true}>Pick an AI Model</option>
  <option>GPT-4</option>
  <option>Claude</option>
  <option>Llama</option>
</select>

Sizes

<select defaultValue="Xsmall" className="select select-xs">
  <option disabled={true}>Xsmall</option>
  <option>Xsmall Apple</option>
  <option>Xsmall Orange</option>
  <option>Xsmall Tomato</option>
</select>
<select defaultValue="Small" className="select select-sm">
  <option disabled={true}>Small</option>
  <option>Small Apple</option>
  <option>Small Orange</option>
  <option>Small Tomato</option>
</select>
<select defaultValue="Medium" className="select select-md">
  <option disabled={true}>Medium</option>
  <option>Medium Apple</option>
  <option>Medium Orange</option>
  <option>Medium Tomato</option>
</select>
<select defaultValue="Large" className="select select-lg">
  <option disabled={true}>Large</option>
  <option>Large Apple</option>
  <option>Large Orange</option>
  <option>Large Tomato</option>
</select>
<select defaultValue="Xlarge" className="select select-xl">
  <option disabled={true}>Xlarge</option>
  <option>Xlarge Apple</option>
  <option>Xlarge Orange</option>
  <option>Xlarge Tomato</option>
</select>

Disabled

<select className="select" disabled={true}>
  <option>You can't touch this</option>
</select>

