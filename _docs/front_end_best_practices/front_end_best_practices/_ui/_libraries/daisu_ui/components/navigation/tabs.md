Tabs

Tabs can be used to show a list of links in a tabbed format.
Class name
	Type	
tabs	Component
	Container of multiple tab items
tab	
Part
	A single tab button (can be button, link, div, radio input, etc)
tab-content	
Part
	Tab content that comes immediately after a tab
tabs-box	
Style
	box style
tabs-border	
Style
	bottom border style
tabs-lift	
Style
	lift style
tab-active	
Modifier
	Makes a single tab look active
tab-disabled	
Modifier
	Makes a single tab look disabled
tabs-top	
Placement
	Puts tab buttons on top of the tab-content (default)
tabs-bottom	
Placement
	Puts tabs on under the tab-content
tabs-xs	
Size
	Extra small size
tabs-sm	
Size
	Small size
tabs-md	
Size
	Medium size [Default]
tabs-lg	
Size
	Large size
tabs-xl	
Size
	Extra large size
tabs

<div role="tablist" className="tabs">
  <a role="tab" className="tab">Tab 1</a>
  <a role="tab" className="tab tab-active">Tab 2</a>
  <a role="tab" className="tab">Tab 3</a>
</div>

tabs-border

<div role="tablist" className="tabs tabs-border">
  <a role="tab" className="tab">Tab 1</a>
  <a role="tab" className="tab tab-active">Tab 2</a>
  <a role="tab" className="tab">Tab 3</a>
</div>

tabs-lift

<div role="tablist" className="tabs tabs-lift">
  <a role="tab" className="tab">Tab 1</a>
  <a role="tab" className="tab tab-active">Tab 2</a>
  <a role="tab" className="tab">Tab 3</a>
</div>

tabs-box

<div role="tablist" className="tabs tabs-box">
  <a role="tab" className="tab">Tab 1</a>
  <a role="tab" className="tab tab-active">Tab 2</a>
  <a role="tab" className="tab">Tab 3</a>
</div>

tabs-box using radio inputs

{/* name of each tab group should be unique */}
<div className="tabs tabs-box">
  <input type="radio" name="my_tabs_1" className="tab" aria-label="Tab 1" />
  <input type="radio" name="my_tabs_1" className="tab" aria-label="Tab 2" defaultChecked />
  <input type="radio" name="my_tabs_1" className="tab" aria-label="Tab 3" />
</div>

Sizes


<div role="tablist" className="tabs tabs-lift tabs-xs">
  <a role="tab" className="tab">Xsmall</a>
  <a role="tab" className="tab tab-active">Xsmall</a>
  <a role="tab" className="tab">Xsmall</a>
</div>

<div role="tablist" className="tabs tabs-lift tabs-sm">
  <a role="tab" className="tab">Small</a>
  <a role="tab" className="tab tab-active">Small</a>
  <a role="tab" className="tab">Small</a>
</div>

<div role="tablist" className="tabs tabs-lift">
  <a role="tab" className="tab">Medium</a>
  <a role="tab" className="tab tab-active">Medium</a>
  <a role="tab" className="tab">Medium</a>
</div>

<div role="tablist" className="tabs tabs-lift tabs-lg">
  <a role="tab" className="tab">Large</a>
  <a role="tab" className="tab tab-active">Large</a>
  <a role="tab" className="tab">Large</a>
</div>

<div role="tablist" className="tabs tabs-lift tabs-xl">
  <a role="tab" className="tab">Xlarge</a>
  <a role="tab" className="tab tab-active">Xlarge</a>
  <a role="tab" className="tab">Xlarge</a>
</div>

radio tabs-border + tab content

{/* name of each tab group should be unique */}
<div className="tabs tabs-border">
  <input type="radio" name="my_tabs_2" className="tab" aria-label="Tab 1" />
  <div className="tab-content border-base-300 bg-base-100 p-10">Tab content 1</div>

  <input type="radio" name="my_tabs_2" className="tab" aria-label="Tab 2" defaultChecked />
  <div className="tab-content border-base-300 bg-base-100 p-10">Tab content 2</div>

  <input type="radio" name="my_tabs_2" className="tab" aria-label="Tab 3" />
  <div className="tab-content border-base-300 bg-base-100 p-10">Tab content 3</div>
</div>

radio tabs-lift + tab content

{/* name of each tab group should be unique */}
<div className="tabs tabs-lift">
  <input type="radio" name="my_tabs_3" className="tab" aria-label="Tab 1" />
  <div className="tab-content bg-base-100 border-base-300 p-6">Tab content 1</div>

  <input type="radio" name="my_tabs_3" className="tab" aria-label="Tab 2" defaultChecked />
  <div className="tab-content bg-base-100 border-base-300 p-6">Tab content 2</div>

  <input type="radio" name="my_tabs_3" className="tab" aria-label="Tab 3" />
  <div className="tab-content bg-base-100 border-base-300 p-6">Tab content 3</div>
</div>

radio tabs-lift with icons + tab content

{/* name of each tab group should be unique */}
<div className="tabs tabs-lift">
  <label className="tab">
    <input type="radio" name="my_tabs_4" />
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4 me-2"><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" /></svg>
    Live
  </label>
  <div className="tab-content bg-base-100 border-base-300 p-6">Tab content 1</div>

  <label className="tab">
    <input type="radio" name="my_tabs_4" defaultChecked />
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4 me-2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" /></svg>
    Laugh
  </label>
  <div className="tab-content bg-base-100 border-base-300 p-6">Tab content 2</div>

  <label className="tab">
    <input type="radio" name="my_tabs_4" />
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4 me-2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" /></svg>
    Love
  </label>
  <div className="tab-content bg-base-100 border-base-300 p-6">Tab content 3</div>
</div>

radio tabs-lift + tab content on bottom

{/* name of each tab group should be unique */}
<div className="tabs tabs-lift tabs-bottom">
  <input type="radio" name="my_tabs_5" className="tab" aria-label="Tab 1" />
  <div className="tab-content bg-base-100 border-base-300 p-6">Tab content 1</div>

  <input type="radio" name="my_tabs_5" className="tab" aria-label="Tab 2" defaultChecked />
  <div className="tab-content bg-base-100 border-base-300 p-6">Tab content 2</div>

  <input type="radio" name="my_tabs_5" className="tab" aria-label="Tab 3" />
  <div className="tab-content bg-base-100 border-base-300 p-6">Tab content 3</div>
</div>

radio tabs-box + tab content

{/* name of each tab group should be unique */}
<div className="tabs tabs-box">
  <input type="radio" name="my_tabs_6" className="tab" aria-label="Tab 1" />
  <div className="tab-content bg-base-100 border-base-300 p-6">Tab content 1</div>

  <input type="radio" name="my_tabs_6" className="tab" aria-label="Tab 2" defaultChecked />
  <div className="tab-content bg-base-100 border-base-300 p-6">Tab content 2</div>

  <input type="radio" name="my_tabs_6" className="tab" aria-label="Tab 3" />
  <div className="tab-content bg-base-100 border-base-300 p-6">Tab content 3</div>
</div>

tabs-box with a horizontal scroll when there's no space

<div className="overflow-x-auto max-w-60">
  <div className="tabs-lift tabs min-w-max">
    <input type="radio" name="my_tabs_7" className="tab z-1" aria-label="Tab title 1" />
    <div className="sticky start-0 tab-content max-w-60 border-base-300 bg-base-100 p-6">Tab content 1</div>
    <input type="radio" name="my_tabs_7" className="tab z-1" aria-label="Tab title 2" defaultChecked />
    <div className="sticky start-0 tab-content max-w-60 border-base-300 bg-base-100 p-6">Tab content 2</div>
    <input type="radio" name="my_tabs_7" className="tab z-1" aria-label="Tab title 3" />
    <div className="sticky start-0 tab-content max-w-60 border-base-300 bg-base-100 p-6">Tab content 3</div>
    <input type="radio" name="my_tabs_7" className="tab z-1" aria-label="Tab title 4" />
    <div className="sticky start-0 tab-content max-w-60 border-base-300 bg-base-100 p-6">Tab content 4</div>
  </div>
</div>

Tabs with custom color

<div role="tablist" className="tabs tabs-lift">
  <a role="tab" className="tab">Tab 1</a>
  <a role="tab" className="tab tab-active text-primary [--tab-bg:orange] [--tab-border-color:red]"> Tab 2</a>
  <a role="tab" className="tab">Tab 3</a>
</div>