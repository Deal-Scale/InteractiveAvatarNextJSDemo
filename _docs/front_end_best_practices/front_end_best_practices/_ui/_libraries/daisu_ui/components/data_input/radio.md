Radio

Radio buttons allow the user to select one option from a set.
Class name
Type
radio Component
For radio input
radio-neutral
Color
neutral color
radio-primary
Color
primary color
radio-secondary
Color
secondary color
radio-accent
Color
accent color
radio-success
Color
success color
radio-warning
Color
warning color
radio-info
Color
info color
radio-error
Color
error color
radio-xs
Size
Extra small size
radio-sm
Size
Small size
radio-md
Size
Medium size [Default]
radio-lg
Size
Large size
radio-xl
Size
Extra large size

    Each set of radio inputs should have uniquenameattributes to avoid conflicts with other sets of radio inputs on the same page.

Radio

<input type="radio" name="radio-1" className="radio" defaultChecked />
<input type="radio" name="radio-1" className="radio" />

Radio sizes

<input type="radio" name="radio-2" className="radio radio-xs" defaultChecked />
<input type="radio" name="radio-2" className="radio radio-sm" defaultChecked />
<input type="radio" name="radio-2" className="radio radio-md" defaultChecked />
<input type="radio" name="radio-2" className="radio radio-lg" defaultChecked />
<input type="radio" name="radio-2" className="radio radio-xl" defaultChecked />

Neutral color

<input type="radio" name="radio-3" className="radio radio-neutral" defaultChecked />
<input type="radio" name="radio-3" className="radio radio-neutral" />

Primary color

<input type="radio" name="radio-4" className="radio radio-primary" defaultChecked />
<input type="radio" name="radio-4" className="radio radio-primary" />

Secondary color

<input type="radio" name="radio-5" className="radio radio-secondary" defaultChecked />
<input type="radio" name="radio-5" className="radio radio-secondary" />

Accent color

<input type="radio" name="radio-6" className="radio radio-accent" defaultChecked />
<input type="radio" name="radio-6" className="radio radio-accent" />

Success color

<input type="radio" name="radio-7" className="radio radio-success" defaultChecked />
<input type="radio" name="radio-7" className="radio radio-success" />

Warning color

<input type="radio" name="radio-8" className="radio radio-warning" defaultChecked />
<input type="radio" name="radio-8" className="radio radio-warning" />

Info color

<input type="radio" name="radio-9" className="radio radio-info" defaultChecked />
<input type="radio" name="radio-9" className="radio radio-info" />

Error color

<input type="radio" name="radio-10" className="radio radio-error" defaultChecked />
<input type="radio" name="radio-10" className="radio radio-error" />

Disabled

<input type="radio" name="radio-11" className="radio" disabled defaultChecked />
<input type="radio" name="radio-11" className="radio" disabled />

Radio with custom colors

<input
  type="radio" name="radio-12" defaultChecked
  className="radio bg-red-100 border-red-300 checked:bg-red-200 checked:text-red-600 checked:border-red-600" />
<input
type="radio" name="radio-12" defaultChecked
className="radio bg-blue-100 border-blue-300 checked:bg-blue-200 checked:text-bl
