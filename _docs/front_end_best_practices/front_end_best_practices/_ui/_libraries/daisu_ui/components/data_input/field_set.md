Fieldset

Fieldset is a container for grouping related form elements. It includes fieldset-legend as a title and label as a description.
Class name
	Type	
fieldset	Component
	for the fieldset container
label	Component
	label for inputs
fieldset-legend	
Part
	for the title of the fieldset
Fieldset fieldset-legend and label

<fieldset className="fieldset">
  <legend className="fieldset-legend">Page title</legend>
  <input type="text" className="input" placeholder="My awesome page" />
  <p className="label">You can edit page title later on from settings</p>
</fieldset>

Fieldset with background and border

<fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
  <legend className="fieldset-legend">Page title</legend>
  <input type="text" className="input" placeholder="My awesome page" />
  <p className="label">You can edit page title later on from settings</p>
</fieldset>

Fieldset with multiple inputs

<fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
  <legend className="fieldset-legend">Page details</legend>

  <label className="label">Title</label>
  <input type="text" className="input" placeholder="My awesome page" />

  <label className="label">Slug</label>
  <input type="text" className="input" placeholder="my-awesome-page" />

  <label className="label">Author</label>
  <input type="text" className="input" placeholder="Name" />
</fieldset>

Fieldset with multiple join items

<fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
  <legend className="fieldset-legend">Settings</legend>
  <div className="join">
    <input type="text" className="input join-item" placeholder="Product name" />
    <button className="btn join-item">save</button>
  </div>
</fieldset>

Login form with fieldset

<fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
  <legend className="fieldset-legend">Login</legend>

  <label className="label">Email</label>
  <input type="email" className="input" placeholder="Email" />

  <label className="label">Password</label>
  <input type="password" className="input" placeholder="Password" />

  <button className="btn btn-neutral mt-4">Login</button>
</fieldset>

