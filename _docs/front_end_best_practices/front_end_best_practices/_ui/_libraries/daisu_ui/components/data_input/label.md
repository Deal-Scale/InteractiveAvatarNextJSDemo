Label

Label is used to provide a name or title for an input field. Label can be placed before or after the field.
Class name
Type
label Component
For styling the text next to an input field (or select)
floating-label Component
For the parent of an input field (or select) and a span that floats above the input field when the field is focused
Label for input

<label className="input">
  <span className="label">https://</span>
  <input type="text" placeholder="URL" />
</label>

Label for input at the end

<label className="input">
  <input type="text" placeholder="domain name" />
  <span className="label">.com</span>
</label>

Label for select

<label className="select">
  <span className="label">Type</span>
  <select>
    <option>Personal</option>
    <option>Business</option>
  </select>
</label>

Label for date input

<label className="input">
  <span className="label">Publish date</span>
  <input type="date" />
</label>

Floating Label

<label className="floating-label">
  <span>Your Email</span>
  <input type="text" placeholder="mail@site.com" className="input input-md" />
</label>

Floating Label with Different Sizes

<label className="floating-label">
  <input type="text" placeholder="Extra Small" className="input input-xs" />
  <span>Extra Small</span>
</label>
<label className="floating-label">
  <input type="text" placeholder="Small" className="input input-sm" />
  <span>Small</span>
</label>
<label className="floating-label">
  <input type="text" placeholder="Medium" className="input input-md" />
  <span>Medium</span>
</label>
<label className="floating-label">
  <input type="text" placeholder="Large" className="input input-lg" />
  <span>Large</span>
</label>
<label className="floating-label">
  <input type="text" placeholder="Extra Large" className="input input-xl" />
  <span>Extra Large</span>
</label>
