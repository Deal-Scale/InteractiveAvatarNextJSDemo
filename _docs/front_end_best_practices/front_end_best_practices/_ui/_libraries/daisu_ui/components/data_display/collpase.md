Collapse

Collapse is used for showing and hiding content.
Class name
	Type	
collapse	Component
	Collapse
collapse-title	
Part
	Title part
collapse-content	
Part
	Content part
collapse-arrow	
Modifier
	Adds arrow icon
collapse-plus	
Modifier
	Adds plus/minus icon
collapse-open	
Modifier
	Force open
collapse-close	
Modifier
	Force close

    Also seeaccordionexamples

Collapse with focus
This collapse works with focus. When div loses focus, it gets closed

<div tabIndex={0} className="collapse bg-base-100 border-base-300 border">
  <div className="collapse-title font-semibold">How do I create an account?</div>
  <div className="collapse-content text-sm">
    Click the "Sign Up" button in the top right corner and follow the registration process.
  </div>
</div>

Collapse with checkbox
This collapse works with checkbox instead of focus. It needs to get clicked again to get closed.

<div className="collapse bg-base-100 border-base-300 border">
  <input type="checkbox" />
  <div className="collapse-title font-semibold">How do I create an account?</div>
  <div className="collapse-content text-sm">
    Click the "Sign Up" button in the top right corner and follow the registration process.
  </div>
</div>

Collapse using details and summary tag
collapse-open and collapse-close doesn't work with this method. You can add/remove open attribute to the details instead

<details className="collapse bg-base-100 border-base-300 border">
  <summary className="collapse-title font-semibold">How do I create an account?</summary>
  <div className="collapse-content text-sm">
    Click the "Sign Up" button in the top right corner and follow the registration process.
  </div>
</details>

Using <details> tag, we can't have animations because <details> tag doesn't allow CSS transitions.
Without border and background color

<div tabIndex={0} className="collapse">
  <div className="collapse-title font-semibold">How do I create an account?</div>
  <div className="collapse-content text-sm">
    Click the "Sign Up" button in the top right corner and follow the registration process.
  </div>
</div>

With arrow icon

<div tabIndex={0} className="collapse collapse-arrow bg-base-100 border-base-300 border">
  <div className="collapse-title font-semibold">How do I create an account?</div>
  <div className="collapse-content text-sm">
    Click the "Sign Up" button in the top right corner and follow the registration process.
  </div>
</div>

With arrow plus/minus icon

<div tabIndex={0} className="collapse collapse-plus bg-base-100 border-base-300 border">
  <div className="collapse-title font-semibold">How do I create an account?</div>
  <div className="collapse-content text-sm">
    Click the "Sign Up" button in the top right corner and follow the registration process.
  </div>
</div>

Force open

<div tabIndex={0} className="collapse collapse-open bg-base-100 border-base-300 border">
  <div className="collapse-title font-semibold">I have collapse-open class</div>
  <div className="collapse-content text-sm">
    Click the "Sign Up" button in the top right corner and follow the registration process.
  </div>
</div>

Force close

<div tabIndex={0} className="collapse collapse-close bg-base-100 border-base-300 border">
  <div className="collapse-title font-semibold">I have collapse-open class</div>
  <div className="collapse-content text-sm">
    Click the "Sign Up" button in the top right corner and follow the registration process.
  </div>
</div>

Custom colors for collapse that works with focus
Use Tailwind CSS

<div
  tabIndex={0}
  className="bg-primary text-primary-content focus:bg-secondary focus:text-secondary-content collapse"
>
  <div className="collapse-title font-semibold">How do I create an account?</div>
  <div className="collapse-content text-sm">
    Click the "Sign Up" button in the top right corner and follow the registration process.
  </div>
</div>

Custom colors for collapse that works with checkbox
Use Tailwind CSS

<div className="bg-base-100 border-base-300 collapse border">
  <input type="checkbox" className="peer" />
  <div
    className="collapse-title bg-primary text-primary-content peer-checked:bg-secondary peer-checked:text-secondary-content"
  >
    How do I create an account?
  </div>
  <div
    className="collapse-content bg-primary text-primary-content peer-checked:bg-secondary peer-checked:text-secondary-content"
  >
    Click the "Sign Up" button in the top right corner and follow the registration process.
  </div>
</div>

