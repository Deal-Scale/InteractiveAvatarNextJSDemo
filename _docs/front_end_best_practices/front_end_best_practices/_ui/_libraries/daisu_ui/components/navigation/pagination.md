Pagination

Pagination is a group of buttons that allow the user to navigate between a set of related content.
Class name
Type
join Component
For grouping multiple items
join-item
Part
Item inside join. Can be a button, input, etc.
join-vertical
direction
Show items vertically
join-horizontal
direction
Show items horizontally

    For pagination, we usejoin componentto show multiple links or buttons next to each other.

Pagination with an active button

<div className="join">
  <button className="join-item btn">1</button>
  <button className="join-item btn btn-active">2</button>
  <button className="join-item btn">3</button>
  <button className="join-item btn">4</button>
</div>

Sizes

<div className="join">
  <button className="join-item btn btn-xs">1</button>
  <button className="join-item btn btn-xs btn-active">2</button>
  <button className="join-item btn btn-xs">3</button>
  <button className="join-item btn btn-xs">4</button>
</div>
<div className="join">
  <button className="join-item btn btn-sm">1</button>
  <button className="join-item btn btn-sm btn-active">2</button>
  <button className="join-item btn btn-sm">3</button>
  <button className="join-item btn btn-sm">4</button>
</div>
<div className="join">
  <button className="join-item btn btn-md">1</button>
  <button className="join-item btn btn-md btn-active">2</button>
  <button className="join-item btn btn-md">3</button>
  <button className="join-item btn btn-md">4</button>
</div>
<div className="join">
  <button className="join-item btn btn-lg">1</button>
  <button className="join-item btn btn-lg btn-active">2</button>
  <button className="join-item btn btn-lg">3</button>
  <button className="join-item btn btn-lg">4</button>
</div>
<div className="join">
  <button className="join-item btn btn-xl">1</button>
  <button className="join-item btn btn-xl btn-active">2</button>
  <button className="join-item btn btn-xl">3</button>
  <button className="join-item btn btn-xl">4</button>
</div>

With a disabled button

<div className="join">
  <button className="join-item btn">1</button>
  <button className="join-item btn">2</button>
  <button className="join-item btn btn-disabled">...</button>
  <button className="join-item btn">99</button>
  <button className="join-item btn">100</button>
</div>

Extra small buttons

<div className="join">
  <button className="join-item btn">«</button>
  <button className="join-item btn">Page 22</button>
  <button className="join-item btn">»</button>
</div>

Nex/Prev outline buttons with equal width

<div className="join grid grid-cols-2">
  <button className="join-item btn btn-outline">Previous page</button>
  <button className="join-item btn btn-outline">Next</button>
</div>

Using radio inputs

<div className="join">
  <input
    className="join-item btn btn-square"
    type="radio"
    name="options"
    aria-label="1"
    checked="checked" />
  <input className="join-item btn btn-square" type="radio" name="options" aria-label="2" />
  <input className="join-item btn btn-square" type="radio" name="options" aria-label="3" />
  <input className="join-item btn btn-square" type="radio" name="options" aria-label="4" />
</div>
