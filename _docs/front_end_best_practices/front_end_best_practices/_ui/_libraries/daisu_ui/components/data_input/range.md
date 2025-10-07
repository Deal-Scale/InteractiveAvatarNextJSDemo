Range slider

Range slider is used to select a value by sliding a handle.
Class name
	Type	
range	Component
	For <input type="range"> tag
range-neutral	
Color
	neutral color
range-primary	
Color
	primary color
range-secondary	
Color
	secondary color
range-accent	
Color
	accent color
range-success	
Color
	success color
range-warning	
Color
	warning color
range-info	
Color
	info color
range-error	
Color
	error color
range-xs	
Size
	Extra small size
range-sm	
Size
	Small size
range-md	
Size
	Medium size [Default]
range-lg	
Size
	Large size
range-xl	
Size
	Extra large size
Range

<input type="range" min={0} max="100" value="40" className="range" />

With steps and measure

<div className="w-full max-w-xs">
  <input type="range" min={0} max="100" value="25" className="range" step="25" />
  <div className="flex justify-between px-2.5 mt-2 text-xs">
    <span>|</span>
    <span>|</span>
    <span>|</span>
    <span>|</span>
    <span>|</span>
  </div>
  <div className="flex justify-between px-2.5 mt-2 text-xs">
    <span>1</span>
    <span>2</span>
    <span>3</span>
    <span>4</span>
    <span>5</span>
  </div>
</div>

Neutral color

<input type="range" min={0} max="100" value="40" className="range range-neutral" />

Primary color

<input type="range" min={0} max="100" value="40" className="range range-primary" />

Secondary color

<input type="range" min={0} max="100" value="40" className="range range-secondary" />

Accent color

<input type="range" min={0} max="100" value="40" className="range range-accent" />

Success color

<input type="range" min={0} max="100" value="40" className="range range-success" />

Warning color

<input type="range" min={0} max="100" value="40" className="range range-warning" />

Info color

<input type="range" min={0} max="100" value="40" className="range range-info" />

Error color

<input type="range" min={0} max="100" value="40" className="range range-error" />

Sizes

<input type="range" min={0} max="100" value="30" className="range range-xs" />
<input type="range" min={0} max="100" value="40" className="range range-sm" />
<input type="range" min={0} max="100" value="50" className="range range-md" />
<input type="range" min={0} max="100" value="60" className="range range-lg" />
<input type="range" min={0} max="100" value="70" className="range range-xl" />

Range with custom color and no fill

<input type="range" min={0} max="100" value="40" 
  className="range text-blue-300 [--range-bg:orange] [--range-thumb:blue] [--range-fill:0]" />

Do you have a question? Ask on GitHub or Discord server
Do you see a bug? open an issue on GitHub
Do you like daisyUI? Post about it!
Support daisyUI's development: Open Collective