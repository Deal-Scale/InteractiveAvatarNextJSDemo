

ctrl
K
Drawer

Drawer is a grid layout that can show/hide a sidebar on the left or right side of the page.
Class name
	Type	
drawer	Component
	The wrapper for sidebar and content
drawer-toggle	
Part
	The hidden checkbox that controls the state of drawer
drawer-content	
Part
	Content part
drawer-side	
Part
	Sidebar part
drawer-overlay	
Part
	Label that covers the page when drawer is open
drawer-end	
Placement
	puts drawer to the other side
drawer-open	
Modifier
	Forces the drawer to be open
Structure

Drawer is a grid layout that can show/hide a sidebar on the left or right side of the page, based on the screen size or based on the value of adrawer-togglecheckbox.
Drawer must be the parent element of the content and sidebar.
Structure

.drawer // The root container
  ├── .drawer-toggle // A hidden checkbox to toggle the visibility of the sidebar
  ├── .drawer-content // All your page content goes here
  │    ╰── // navbar, content, footer
  │
  ╰── .drawer-side // Sidebar wrapper
       ├── .drawer-overlay // A dark overlay that covers the whole page when the drawer is open
       ╰── // Sidebar content (menu or anything)

Functionality

Drawer sidebar is hidden by default. You can make it visible on larger screens usinglg:drawer-openclass (or using other responsive prefixes: sm, md, lg, xl)

You can check/uncheck the checkbox using JavaScript or by clicking thelabeltag which is assigned to the hidden checkbox

    Opening a drawer adds ascrollbar-gutterto the page to avoid layout shift on operating systems that have a fixed scrollbar.
    If you don't want to use this feature,you can exclude rootscrollgutter.

Drawer

<div className="drawer">
  <input id="my-drawer" type="checkbox" className="drawer-toggle" />
  <div className="drawer-content">
    {/* Page content here */}
    <label htmlFor="my-drawer" className="btn btn-primary drawer-button">Open drawer</label>
  </div>
  <div className="drawer-side">
    <label htmlFor="my-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
    <ul className="menu bg-base-200 text-base-content min-h-full w-80 p-4">
      {/* Sidebar content here */}
      <li><a>Sidebar Item 1</a></li>
      <li><a>Sidebar Item 2</a></li>
    </ul>
  </div>
</div>

Navbar menu for desktop + sidebar drawer for mobile
Change screen size to show/hide menu

<div className="drawer">
  <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />
  <div className="drawer-content flex flex-col">
    {/* Navbar */}
    <div className="navbar bg-base-300 w-full">
      <div className="flex-none lg:hidden">
        <label htmlFor="my-drawer-3" aria-label="open sidebar" className="btn btn-square btn-ghost">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="inline-block h-6 w-6 stroke-current"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            ></path>
          </svg>
        </label>
      </div>
      <div className="mx-2 flex-1 px-2">Navbar Title</div>
      <div className="hidden flex-none lg:block">
        <ul className="menu menu-horizontal">
          {/* Navbar menu content here */}
          <li><a>Navbar Item 1</a></li>
          <li><a>Navbar Item 2</a></li>
        </ul>
      </div>
    </div>
    {/* Page content here */}
    Content
  </div>
  <div className="drawer-side">
    <label htmlFor="my-drawer-3" aria-label="close sidebar" className="drawer-overlay"></label>
    <ul className="menu bg-base-200 min-h-full w-80 p-4">
      {/* Sidebar content here */}
      <li><a>Sidebar Item 1</a></li>
      <li><a>Sidebar Item 2</a></li>
    </ul>
  </div>
</div>

Responsive
Sidebar is always visible on large screen, can be toggled on small screen because of lg:drawer-open class

<div className="drawer lg:drawer-open">
  <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
  <div className="drawer-content flex flex-col items-center justify-center">
    {/* Page content here */}
    <label htmlFor="my-drawer-2" className="btn btn-primary drawer-button lg:hidden">
      Open drawer
    </label>
  </div>
  <div className="drawer-side">
    <label htmlFor="my-drawer-2" aria-label="close sidebar" className="drawer-overlay"></label>
    <ul className="menu bg-base-200 text-base-content min-h-full w-80 p-4">
      {/* Sidebar content here */}
      <li><a>Sidebar Item 1</a></li>
      <li><a>Sidebar Item 2</a></li>
    </ul>
  </div>
</div>

Drawer that opens from right side of page

<div className="drawer drawer-end">
  <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
  <div className="drawer-content">
    {/* Page content here */}
    <label htmlFor="my-drawer-4" className="drawer-button btn btn-primary">Open drawer</label>
  </div>
  <div className="drawer-side">
    <label htmlFor="my-drawer-4" aria-label="close sidebar" className="drawer-overlay"></label>
    <ul className="menu bg-base-200 text-base-content min-h-full w-80 p-4">
      {/* Sidebar content here */}
      <li><a>Sidebar Item 1</a></li>
      <li><a>Sidebar Item 2</a></li>
    </ul>
  </div>
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

Tailwind Drawer Component — Tailwind CSS Components ( version 5 update is here )
