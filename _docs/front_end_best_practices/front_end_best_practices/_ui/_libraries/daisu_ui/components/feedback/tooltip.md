Tooltip

Tooltip can be used to show a message when hovering over an element.
Class name
Type
tooltip Component
Container element
tooltip-content
Part
Optional. Setting a div as the content of the tooltip instead of the `data-tip` text
tooltip-top
Placement
Put tooltip on top [Default]
tooltip-bottom
Placement
Put tooltip on bottom
tooltip-left
Placement
Put tooltip on left
tooltip-right
Placement
Put tooltip on right
tooltip-open
Modifier
Force open tooltip
tooltip-neutral
Color
neutral color
tooltip-primary
Color
primary color
tooltip-secondary
Color
secondary color
tooltip-accent
Color
accent color
tooltip-info
Color
info color
tooltip-success
Color
success color
tooltip-warning
Color
warning color
tooltip-error
Color
error color
Tooltip

<div className="tooltip" data-tip="hello">
  <button className="btn">Hover me</button>
</div>

Tooltip with tooltip-content

<div className="tooltip">
  <div className="tooltip-content">
    <div className="animate-bounce text-orange-400 -rotate-10 text-2xl font-black">Wow!</div>
  </div>
  <button className="btn">Hover me</button>
</div>

Force open

<div className="tooltip tooltip-open" data-tip="hello">
  <button className="btn">Force open</button>
</div>

Top

<div className="tooltip tooltip-open tooltip-top" data-tip="hello">
  <button className="btn">Top</button>
</div>

Bottom

<div className="tooltip tooltip-open tooltip-bottom" data-tip="hello">
  <button className="btn">Bottom</button>
</div>

Left

<div className="tooltip tooltip-open tooltip-left" data-tip="hello">
  <button className="btn">Left</button>
</div>

Right

<div className="tooltip tooltip-open tooltip-right" data-tip="hello">
  <button className="btn">Right</button>
</div>

Neutral color

<div className="tooltip tooltip-open tooltip-neutral" data-tip="neutral">
  <button className="btn btn-neutral">neutral</button>
</div>

Primary color

<div className="tooltip tooltip-open tooltip-primary" data-tip="primary">
  <button className="btn btn-primary">primary</button>
</div>

Secondary color

<div className="tooltip tooltip-open tooltip-secondary" data-tip="secondary">
  <button className="btn btn-secondary">secondary</button>
</div>

Accent color

<div className="tooltip tooltip-open tooltip-accent" data-tip="accent">
  <button className="btn btn-accent">accent</button>
</div>

Info color

<div className="tooltip tooltip-open tooltip-info" data-tip="info">
  <button className="btn btn-info">info</button>
</div>

Success color

<div className="tooltip tooltip-open tooltip-success" data-tip="success">
  <button className="btn btn-success">success</button>
</div>

Warning color

<div className="tooltip tooltip-open tooltip-warning" data-tip="warning">
  <button className="btn btn-warning">warning</button>
</div>

Error color

<div className="tooltip tooltip-open tooltip-error" data-tip="error">
  <button className="btn btn-error">error</button>
</div>

Responsive tooltip. only show for large screen

<div className="lg:tooltip" data-tip="hello">
  <button className="btn">Hover me</button>
</div>
