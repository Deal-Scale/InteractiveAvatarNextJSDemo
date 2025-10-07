Filter

Filter is a group of radio buttons. Choosing one of the options will hide the others and shows a reset button next to the chosen option.
Class name
	Type	
filter	Component
	For a HTML <form> or a <div> element that includes radio buttons for filtering items
filter-reset	
Part
	An alternative to the reset button if you can't use a HTML form
Filter using HTML form, radio buttons and reset button
A HTML from for filtering items

<form className="filter">
  <input className="btn btn-square" type="reset" value="×"/>
  <input className="btn" type="radio" name="frameworks" aria-label="Svelte"/>
  <input className="btn" type="radio" name="frameworks" aria-label="Vue"/>
  <input className="btn" type="radio" name="frameworks" aria-label="React"/>
</form>

Filter without HTML form
Use this if you can't use a HTML form for some reason

<div className="filter">
  <input className="btn filter-reset" type="radio" name="metaframeworks" aria-label="All"/>
  <input className="btn" type="radio" name="metaframeworks" aria-label="Sveltekit"/>
  <input className="btn" type="radio" name="metaframeworks" aria-label="Nuxt"/>
  <input className="btn" type="radio" name="metaframeworks" aria-label="Next.js"/>
</div>

