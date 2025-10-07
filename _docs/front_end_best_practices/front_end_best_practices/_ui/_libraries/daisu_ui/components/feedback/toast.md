Toast

Toast is a wrapper to stack elements, positioned on the corner of page.
Class name
	Type	
toast	Component
	Container element that sticks to the corner of page
toast-start	
Placement
	align horizontally to the left
toast-center	
Placement
	align horizontally to the center
toast-end	
Placement
	align horizontally to the right [Default]
toast-top	
Placement
	align vertically to top
toast-middle	
Placement
	align vertically to middle
toast-bottom	
Placement
	align vertically to bottom [Default]
toast with alert inside

<div className="toast">
  <div className="alert alert-info">
    <span>New message arrived.</span>
  </div>
</div>

toast-top toast-start

<div className="toast toast-top toast-start">
  <div className="alert alert-info">
    <span>New mail arrived.</span>
  </div>
  <div className="alert alert-success">
    <span>Message sent successfully.</span>
  </div>
</div>

toast-top toast-center

<div className="toast toast-top toast-center">
  <div className="alert alert-info">
    <span>New mail arrived.</span>
  </div>
  <div className="alert alert-success">
    <span>Message sent successfully.</span>
  </div>
</div>

toast-top toast-end

<div className="toast toast-top toast-end">
  <div className="alert alert-info">
    <span>New mail arrived.</span>
  </div>
  <div className="alert alert-success">
    <span>Message sent successfully.</span>
  </div>
</div>

toast-start toast-middle

<div className="toast toast-start toast-middle">
  <div className="alert alert-info">
    <span>New mail arrived.</span>
  </div>
  <div className="alert alert-success">
    <span>Message sent successfully.</span>
  </div>
</div>

toast-center toast-middle

<div className="toast toast-center toast-middle">
  <div className="alert alert-info">
    <span>New mail arrived.</span>
  </div>
  <div className="alert alert-success">
    <span>Message sent successfully.</span>
  </div>
</div>

toast-end toast-middle

<div className="toast toast-end toast-middle">
  <div className="alert alert-info">
    <span>New mail arrived.</span>
  </div>
  <div className="alert alert-success">
    <span>Message sent successfully.</span>
  </div>
</div>

toast-start toast-bottom (default)

<div className="toast toast-start">
  <div className="alert alert-info">
    <span>New mail arrived.</span>
  </div>
  <div className="alert alert-success">
    <span>Message sent successfully.</span>
  </div>
</div>

toast-center toast-bottom (default)

<div className="toast toast-center">
  <div className="alert alert-info">
    <span>New mail arrived.</span>
  </div>
  <div className="alert alert-success">
    <span>Message sent successfully.</span>
  </div>
</div>

toast-end (default) toast-bottom (default)

<div className="toast toast-end">
  <div className="alert alert-info">
    <span>New mail arrived.</span>
  </div>
  <div className="alert alert-success">
    <span>Message sent successfully.</span>
  </div>
</div>

