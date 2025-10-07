Steps

Steps can be used to show a list of steps in a process.
Class name
	Type	
steps	Component
	Container of multiple step nodes
step	
Part
	A single step node
step-icon	
Part
	For custom icon inside step
step-neutral	
Color
	neutral color
step-primary	
Color
	primary color
step-secondary	
Color
	secondary color
step-accent	
Color
	accent color
step-info	
Color
	info color
step-success	
Color
	success color
step-warning	
Color
	warning color
step-error	
Color
	error color
steps-vertical	
direction
	Makes steps vertical (default)
steps-horizontal	
direction
	Makes steps horizontal
Horizontal

<ul className="steps">
  <li className="step step-primary">Register</li>
  <li className="step step-primary">Choose plan</li>
  <li className="step">Purchase</li>
  <li className="step">Receive Product</li>
</ul>

Vertical

<ul className="steps steps-vertical">
  <li className="step step-primary">Register</li>
  <li className="step step-primary">Choose plan</li>
  <li className="step">Purchase</li>
  <li className="step">Receive Product</li>
</ul>

responsive (vertical on small screen, horizontal on large screen)

<ul className="steps steps-vertical lg:steps-horizontal">
  <li className="step step-primary">Register</li>
  <li className="step step-primary">Choose plan</li>
  <li className="step">Purchase</li>
  <li className="step">Receive Product</li>
</ul>

With custom content in step-icon

<ul className="steps">
  <li className="step step-neutral">
    <span className="step-icon">😕</span>Step 1
  </li>
  <li className="step step-neutral">
    <span className="step-icon">😃</span>Step 2
  </li>
  <li className="step">
    <span className="step-icon">😍</span>Step 3
  </li>
</ul>

With data-content

<ul className="steps">
  <li data-content="?" className="step step-neutral">Step 1</li>
  <li data-content="!" className="step step-neutral">Step 2</li>
  <li data-content="✓" className="step step-neutral">Step 3</li>
  <li data-content="✕" className="step step-neutral">Step 4</li>
  <li data-content="★" className="step step-neutral">Step 5</li>
  <li data-content="" className="step step-neutral">Step 6</li>
  <li data-content="●" className="step step-neutral">Step 7</li>
</ul>

Custom colors

<ul className="steps">
  <li className="step step-info">Fly to moon</li>
  <li className="step step-info">Shrink the moon</li>
  <li className="step step-info">Grab the moon</li>
  <li className="step step-error" data-content="?">Sit on toilet</li>
</ul>

With scrollable wrapper

<div className="overflow-x-auto">
  <ul className="steps">
    <li className="step">start</li>
    <li className="step step-secondary">2</li>
    <li className="step step-secondary">3</li>
    <li className="step step-secondary">4</li>
    <li className="step">5</li>
    <li className="step step-accent">6</li>
    <li className="step step-accent">7</li>
    <li className="step">8</li>
    <li className="step step-error">9</li>
    <li className="step step-error">10</li>
    <li className="step">11</li>
    <li className="step">12</li>
    <li className="step step-warning">13</li>
    <li className="step step-warning">14</li>
    <li className="step">15</li>
    <li className="step step-neutral">16</li>
    <li className="step step-neutral">17</li>
    <li className="step step-neutral">18</li>
    <li className="step step-neutral">19</li>
    <li className="step step-neutral">20</li>
    <li className="step step-neutral">21</li>
    <li className="step step-neutral">22</li>
    <li className="step step-neutral">23</li>
    <li className="step step-neutral">end</li>
  </ul>
</div>

