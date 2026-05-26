Badge

Badges are used to inform the user of the status of specific data.
Class name
Type
badge Component
Container element
badge-outline
Style
outline style
badge-dash
Style
dash outline style
badge-soft
Style
soft style
badge-ghost
Style
ghost style
badge-neutral
Color
neutral color
badge-primary
Color
primary color
badge-secondary
Color
secondary color
badge-accent
Color
accent color
badge-info
Color
info color
badge-success
Color
success color
badge-warning
Color
warning color
badge-error
Color
error color
badge-xs
Size
extra small size
badge-sm
Size
small size
badge-md
Size
medium size (default)
badge-lg
Size
large size
badge-xl
Size
extra large size
Badge

<span className="badge">Badge</span>

Badge sizes

<div className="badge badge-xs">Xsmall</div>
<div className="badge badge-sm">Small</div>
<div className="badge badge-md">Medium</div>
<div className="badge badge-lg">Large</div>
<div className="badge badge-xl">Xlarge</div>

Badge with colors

<div className="badge badge-primary">Primary</div>
<div className="badge badge-secondary">Secondary</div>
<div className="badge badge-accent">Accent</div>
<div className="badge badge-neutral">Neutral</div>
<div className="badge badge-info">Info</div>
<div className="badge badge-success">Success</div>
<div className="badge badge-warning">Warning</div>
<div className="badge badge-error">Error</div>

Badge with soft style

<div className="badge badge-soft badge-primary">Primary</div>
<div className="badge badge-soft badge-secondary">Secondary</div>
<div className="badge badge-soft badge-accent">Accent</div>
<div className="badge badge-soft badge-info">Info</div>
<div className="badge badge-soft badge-success">Success</div>
<div className="badge badge-soft badge-warning">Warning</div>
<div className="badge badge-soft badge-error">Error</div>

Badge with outline style

<div className="badge badge-outline badge-primary">Primary</div>
<div className="badge badge-outline badge-secondary">Secondary</div>
<div className="badge badge-outline badge-accent">Accent</div>
<div className="badge badge-outline badge-info">Info</div>
<div className="badge badge-outline badge-success">Success</div>
<div className="badge badge-outline badge-warning">Warning</div>
<div className="badge badge-outline badge-error">Error</div>

Badge with dash style

<div className="badge badge-dash badge-primary">Primary</div>
<div className="badge badge-dash badge-secondary">Secondary</div>
<div className="badge badge-dash badge-accent">Accent</div>
<div className="badge badge-dash badge-info">Info</div>
<div className="badge badge-dash badge-success">Success</div>
<div className="badge badge-dash badge-warning">Warning</div>
<div className="badge badge-dash badge-error">Error</div>

neutral badge with outline or dash style
These badges use dark text, only use them on light backgrounds

<div className="bg-white p-6">
  <div className="badge badge-neutral badge-outline">Outline</div>
  <div className="badge badge-neutral badge-dash">Dash</div>
</div>

Badge ghost

<div className="badge badge-ghost">ghost</div>

Empty badge

<div className="badge badge-primary badge-lg"></div>
<div className="badge badge-primary badge-md"></div>
<div className="badge badge-primary badge-sm"></div>
<div className="badge badge-primary badge-xs"></div>

Badge with icon

<div className="badge badge-info">
  <svg className="size-[1em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="currentColor" strokeLinejoin="miter" strokeLinecap="butt"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeLinecap="square" stroke-miterlimit="10" strokeWidth="2"></circle><path d="m12,17v-5.5c0-.276-.224-.5-.5-.5h-1.5" fill="none" stroke="currentColor" strokeLinecap="square" stroke-miterlimit="10" strokeWidth="2"></path><circle cx="12" cy="7.25" r="1.25" fill="currentColor" strokeWidth="2"></circle></g></svg>
  Info
</div>
<div className="badge badge-success">
  <svg className="size-[1em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="currentColor" strokeLinejoin="miter" strokeLinecap="butt"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeLinecap="square" stroke-miterlimit="10" strokeWidth="2"></circle><polyline points="7 13 10 16 17 8" fill="none" stroke="currentColor" strokeLinecap="square" stroke-miterlimit="10" strokeWidth="2"></polyline></g></svg>
  Success
</div>
<div className="badge badge-warning">
  <svg className="size-[1em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18"><g fill="currentColor"><path d="M7.638,3.495L2.213,12.891c-.605,1.048,.151,2.359,1.362,2.359H14.425c1.211,0,1.967-1.31,1.362-2.359L10.362,3.495c-.605-1.048-2.119-1.048-2.724,0Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path><line x1="9" y1="6.5" x2="9" y2="10" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></line><path d="M9,13.569c-.552,0-1-.449-1-1s.448-1,1-1,1,.449,1,1-.448,1-1,1Z" fill="currentColor" data-stroke="none" stroke="none"></path></g></svg>
  Warning
</div>
<div className="badge badge-error">
  <svg className="size-[1em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="currentColor"><rect x="1.972" y="11" width="20.056" height="2" transform="translate(-4.971 12) rotate(-45)" fill="currentColor" strokeWidth={0}></rect><path d="m12,23c-6.065,0-11-4.935-11-11S5.935,1,12,1s11,4.935,11,11-4.935,11-11,11Zm0-20C7.038,3,3,7.037,3,12s4.038,9,9,9,9-4.037,9-9S16.962,3,12,3Z" strokeWidth={0} fill="currentColor"></path></g></svg>
  Error
</div>

Badge in a text

<h1 className="text-xl font-semibold">
  Heading 1 <span className="badge badge-xl">Badge</span>
</h1>

<h2 className="text-lg font-semibold">
  Heading 2 <span className="badge badge-lg">Badge</span>
</h2>

<h3 className="text-base font-semibold">
  Heading 3 <span className="badge badge-md">Badge</span>
</h3>

<h4 className="text-sm font-semibold">
  Heading 4 <span className="badge badge-sm">Badge</span>
</h4>

<h5 className="text-xs font-semibold">
  Heading 5 <span className="badge badge-xs">Badge</span>
</h5>

<p className="text-xs">
  Paragraph <span className="badge badge-xs">Badge</span>
</p>

Badge in a button

<button className="btn">
  Inbox <div className="badge badge-sm">+99</div>
</button>

<button className="btn">
  Inbox <div className="badge badge-sm badge-secondary">+99</div>
</button>
