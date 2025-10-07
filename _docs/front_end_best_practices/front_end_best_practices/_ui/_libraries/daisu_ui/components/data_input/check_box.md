Checkbox

Checkboxes are used to select or deselect a value.
Class name
Type
checkbox Component
Checkbox
checkbox-primary
Color
primary color
checkbox-secondary
Color
secondary color
checkbox-accent
Color
accent color
checkbox-neutral
Color
neutral color
checkbox-success
Color
success color
checkbox-warning
Color
warning color
checkbox-info
Color
info color
checkbox-error
Color
error color
checkbox-xs
Size
Extra small size
checkbox-sm
Size
Small size
checkbox-md
Size
Medium size [Default]
checkbox-lg
Size
Large size
checkbox-xl
Size
Extra large size
Checkbox

<input type="checkbox" defaultChecked className="checkbox" />

With fieldset and label

<fieldset className="fieldset bg-base-100 border-base-300 rounded-box w-64 border p-4">
  <legend className="fieldset-legend">Login options</legend>
  <label className="label">
    <input type="checkbox" defaultChecked className="checkbox" />
    Remember me
  </label>
</fieldset>

Sizes

<input type="checkbox" defaultChecked className="checkbox checkbox-xs" />
<input type="checkbox" defaultChecked className="checkbox checkbox-sm" />
<input type="checkbox" defaultChecked className="checkbox checkbox-md" />
<input type="checkbox" defaultChecked className="checkbox checkbox-lg" />
<input type="checkbox" defaultChecked className="checkbox checkbox-xl" />

Colors

<input type="checkbox" defaultChecked className="checkbox checkbox-primary" />
<input type="checkbox" defaultChecked className="checkbox checkbox-secondary" />
<input type="checkbox" defaultChecked className="checkbox checkbox-accent" />
<input type="checkbox" defaultChecked className="checkbox checkbox-neutral" />

<input type="checkbox" defaultChecked className="checkbox checkbox-info" />
<input type="checkbox" defaultChecked className="checkbox checkbox-success" />
<input type="checkbox" defaultChecked className="checkbox checkbox-warning" />
<input type="checkbox" defaultChecked className="checkbox checkbox-error" />

Disabled

<input type="checkbox" className="checkbox" disabled />
<input type="checkbox" className="checkbox" disabled defaultChecked />

Indeterminate

{/_ You can make a checkbox indeterminate using JS _/}

<script>
  document.getElementById("my-checkbox").indeterminate = true
</script>
<input type="checkbox" className="checkbox" id="my-checkbox" />

Checkbox with custom colors

<input
  type="checkbox"
  checked="checked"
  className="checkbox border-indigo-600 bg-indigo-500 checked:border-orange-500 checked:bg-orange-400 checked:text-orange-800"
/>
