Rating

Rating is a set of radio buttons that allow the user to rate something.
Class name
	Type	
rating	Component
	For a div containing radio inputs
rating-half	
Modifier
	To shows half of the shapes. Useful for half star ratings
rating-hidden	
Modifier
	For the first radio to make it hidden so user can clear the rating
rating-xs	
Size
	Extra small size
rating-sm	
Size
	Small size
rating-md	
Size
	Medium size [Default]
rating-lg	
Size
	Large size
rating-xl	
Size
	Extra large size

    Items in each rating should have uniquenameattributes to avoid conflicts with other ratings on the same page.

Rating

<div className="rating">
  <input type="radio" name="rating-1" className="mask mask-star" aria-label="1 star" />
  <input type="radio" name="rating-1" className="mask mask-star" aria-label="2 star" defaultChecked />
  <input type="radio" name="rating-1" className="mask mask-star" aria-label="3 star" />
  <input type="radio" name="rating-1" className="mask mask-star" aria-label="4 star" />
  <input type="radio" name="rating-1" className="mask mask-star" aria-label="5 star" />
</div>

Read-only Rating

<div className="rating">
  <div className="mask mask-star" aria-label="1 star"></div>
  <div className="mask mask-star" aria-label="2 star"></div>
  <div className="mask mask-star" aria-label="3 star" aria-current="true"></div>
  <div className="mask mask-star" aria-label="4 star"></div>
  <div className="mask mask-star" aria-label="5 star"></div>
</div>

mask-star-2 with warning color

<div className="rating">
  <input type="radio" name="rating-2" className="mask mask-star-2 bg-orange-400" aria-label="1 star" />
  <input type="radio" name="rating-2" className="mask mask-star-2 bg-orange-400" aria-label="2 star" defaultChecked />
  <input type="radio" name="rating-2" className="mask mask-star-2 bg-orange-400" aria-label="3 star" />
  <input type="radio" name="rating-2" className="mask mask-star-2 bg-orange-400" aria-label="4 star" />
  <input type="radio" name="rating-2" className="mask mask-star-2 bg-orange-400" aria-label="5 star" />
</div>

mask-heart with multiple colors

<div className="rating gap-1">
  <input type="radio" name="rating-3" className="mask mask-heart bg-red-400" aria-label="1 star" />
  <input type="radio" name="rating-3" className="mask mask-heart bg-orange-400" aria-label="2 star" defaultChecked />
  <input type="radio" name="rating-3" className="mask mask-heart bg-yellow-400" aria-label="3 star" />
  <input type="radio" name="rating-3" className="mask mask-heart bg-lime-400" aria-label="4 star" />
  <input type="radio" name="rating-3" className="mask mask-heart bg-green-400" aria-label="5 star" />
</div>

mask-star-2 with green-500 color

<div className="rating">
  <input type="radio" name="rating-4" className="mask mask-star-2 bg-green-500" aria-label="1 star" />
  <input type="radio" name="rating-4" className="mask mask-star-2 bg-green-500" aria-label="2 star" defaultChecked />
  <input type="radio" name="rating-4" className="mask mask-star-2 bg-green-500" aria-label="3 star" />
  <input type="radio" name="rating-4" className="mask mask-star-2 bg-green-500" aria-label="4 star" />
  <input type="radio" name="rating-4" className="mask mask-star-2 bg-green-500" aria-label="5 star" />
</div>

Sizes

{/* xs */}
<div className="rating rating-xs">
  <input type="radio" name="rating-5" className="mask mask-star-2 bg-orange-400" aria-label="1 star" />
  <input type="radio" name="rating-5" className="mask mask-star-2 bg-orange-400" aria-label="2 star" defaultChecked />
  <input type="radio" name="rating-5" className="mask mask-star-2 bg-orange-400" aria-label="3 star" />
  <input type="radio" name="rating-5" className="mask mask-star-2 bg-orange-400" aria-label="4 star" />
  <input type="radio" name="rating-5" className="mask mask-star-2 bg-orange-400" aria-label="5 star" />
</div>
{/* sm */}
<div className="rating rating-sm">
  <input type="radio" name="rating-6" className="mask mask-star-2 bg-orange-400" aria-label="1 star" />
  <input type="radio" name="rating-6" className="mask mask-star-2 bg-orange-400" aria-label="2 star" defaultChecked />
  <input type="radio" name="rating-6" className="mask mask-star-2 bg-orange-400" aria-label="3 star" />
  <input type="radio" name="rating-6" className="mask mask-star-2 bg-orange-400" aria-label="4 star" />
  <input type="radio" name="rating-6" className="mask mask-star-2 bg-orange-400" aria-label="5 star" />
</div>
{/* md */}
<div className="rating rating-md">
  <input type="radio" name="rating-7" className="mask mask-star-2 bg-orange-400" aria-label="1 star" />
  <input type="radio" name="rating-7" className="mask mask-star-2 bg-orange-400" aria-label="2 star" defaultChecked />
  <input type="radio" name="rating-7" className="mask mask-star-2 bg-orange-400" aria-label="3 star" />
  <input type="radio" name="rating-7" className="mask mask-star-2 bg-orange-400" aria-label="4 star" />
  <input type="radio" name="rating-7" className="mask mask-star-2 bg-orange-400" aria-label="5 star" />
</div>
{/* lg */}
<div className="rating rating-lg">
  <input type="radio" name="rating-8" className="mask mask-star-2 bg-orange-400" aria-label="1 star" />
  <input type="radio" name="rating-8" className="mask mask-star-2 bg-orange-400" aria-label="2 star" defaultChecked />
  <input type="radio" name="rating-8" className="mask mask-star-2 bg-orange-400" aria-label="3 star" />
  <input type="radio" name="rating-8" className="mask mask-star-2 bg-orange-400" aria-label="4 star" />
  <input type="radio" name="rating-8" className="mask mask-star-2 bg-orange-400" aria-label="5 star" />
</div>
{/* xl */}
<div className="rating rating-xl">
  <input type="radio" name="rating-9" className="mask mask-star-2 bg-orange-400" aria-label="1 star" />
  <input type="radio" name="rating-9" className="mask mask-star-2 bg-orange-400" aria-label="2 star" defaultChecked />
  <input type="radio" name="rating-9" className="mask mask-star-2 bg-orange-400" aria-label="3 star" />
  <input type="radio" name="rating-9" className="mask mask-star-2 bg-orange-400" aria-label="4 star" />
  <input type="radio" name="rating-9" className="mask mask-star-2 bg-orange-400" aria-label="5 star" />
</div>

with
is a hidden radio at the start to allow users to remove their rating.

<div className="rating rating-lg">
  <input type="radio" name="rating-10" className="rating-hidden" aria-label="clear" />
  <input type="radio" name="rating-10" className="mask mask-star-2" aria-label="1 star" />
  <input type="radio" name="rating-10" className="mask mask-star-2" aria-label="2 star" defaultChecked />
  <input type="radio" name="rating-10" className="mask mask-star-2" aria-label="3 star" />
  <input type="radio" name="rating-10" className="mask mask-star-2" aria-label="4 star" />
  <input type="radio" name="rating-10" className="mask mask-star-2" aria-label="5 star" />
</div>

half stars

<div className="rating rating-lg rating-half">
  <input type="radio" name="rating-11" className="rating-hidden" />
  <input type="radio" name="rating-11" className="mask mask-star-2 mask-half-1 bg-green-500" aria-label="0.5 star" />
  <input type="radio" name="rating-11" className="mask mask-star-2 mask-half-2 bg-green-500" aria-label="1 star" />
  <input type="radio" name="rating-11" className="mask mask-star-2 mask-half-1 bg-green-500" aria-label="1.5 star" defaultChecked />
  <input type="radio" name="rating-11" className="mask mask-star-2 mask-half-2 bg-green-500" aria-label="2 star" />
  <input type="radio" name="rating-11" className="mask mask-star-2 mask-half-1 bg-green-500" aria-label="2.5 star" />
  <input type="radio" name="rating-11" className="mask mask-star-2 mask-half-2 bg-green-500" aria-label="3 star" />
  <input type="radio" name="rating-11" className="mask mask-star-2 mask-half-1 bg-green-500" aria-label="3.5 star" />
  <input type="radio" name="rating-11" className="mask mask-star-2 mask-half-2 bg-green-500" aria-label="4 star" />
  <input type="radio" name="rating-11" className="mask mask-star-2 mask-half-1 bg-green-500" aria-label="4.5 star" />
  <input type="radio" name="rating-11" className="mask mask-star-2 mask-half-2 bg-green-500" aria-label="5 star" />
</div>

