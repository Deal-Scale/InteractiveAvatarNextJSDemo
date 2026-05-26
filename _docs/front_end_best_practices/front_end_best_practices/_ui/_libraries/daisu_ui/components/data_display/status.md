Status

Status is a really small icon to visually show the current status of an element, like online, offline, error, etc.
Class name
	Type	
status	Component
	Status icon
status-neutral	
Color
	neutral color
status-primary	
Color
	primary color
status-secondary	
Color
	secondary color
status-accent	
Color
	accent color
status-info	
Color
	info color
status-success	
Color
	success color
status-warning	
Color
	warning color
status-error	
Color
	error color
status-xs	
Size
	extra small size
status-sm	
Size
	small size
status-md	
Size
	medium size [Default]
status-lg	
Size
	large size
status-xl	
Size
	extra large size
Status

<span className="status"></span>

Status sizes

<div aria-label="status" className="status status-xs"></div>
<div aria-label="status" className="status status-sm"></div>
<div aria-label="status" className="status status-md"></div>
<div aria-label="status" className="status status-lg"></div>
<div aria-label="status" className="status status-xl"></div>

Status with colors

<div aria-label="status" className="status status-primary"></div>
<div aria-label="status" className="status status-secondary"></div>
<div aria-label="status" className="status status-accent"></div>
<div aria-label="status" className="status status-neutral"></div>

<div aria-label="info" className="status status-info"></div>
<div aria-label="success" className="status status-success"></div>
<div aria-label="warning" className="status status-warning"></div>
<div aria-label="error" className="status status-error"></div>

Status with ping animation

<div className="inline-grid *:[grid-area:1/1]">
  <div className="status status-error animate-ping"></div>
  <div className="status status-error"></div>
</div> Server is down

Status with bounce animation

<div className="status status-info animate-bounce"></div> Unread messages

