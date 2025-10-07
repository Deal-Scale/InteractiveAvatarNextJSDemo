Modal

Modal is used to show a dialog or a box when you click a button.
Class name
Type
modal Component
Modal
modal-box
Part
The content part
modal-action
Part
Actions part (buttons, etc.)
modal-backdrop
Part
Label that covers the page when modal is open so we can close the modal by clicking outside
modal-toggle
Part
Hidden checkbox that controls the state of modal
modal-open
Modifier
Keeps the modal open (you can add this class using JS)
modal-top
Placement
Moves the modal to top
modal-middle
Placement
Moves the modal to middle [Default]
modal-bottom
Placement
Moves the modal to bottom
modal-start
Placement
Moves the modal to start horizontally
modal-end
Placement
Moves the modal to end horizontally
There are 3 methods to use modals

    Using HTML <dialog> element
    It needs JS to open but it has better accessibility and we can close it usingEsckey
    Using checkbox
    A hidden<input type="checkbox">to control the sate of modal and<label>to check/uncheck the checkbox and open/close the modal
    Using <a> anchor links
    A link adds a parameter to the URL and you only see the modal when the URL has that parameter

    Opening a modal adds ascrollbar-gutterto the page to avoid layout shift on operating systems that have a fixed scrollbar.
    If you don't want to use this feature,you can exclude rootscrollgutter.

Method 1. HTML dialog elementrecommended

HTML dialog element is a native way to create modals. It is accessible and we can close the modal usingEsckey.
We can open the modal using JSID.showModal()method and close it usingID.close()method.
The ID must be unique for each modal.
Dialog modal
opens on click using ID.showModal() method. can be closed using ID.close() method

{/_ Open the modal using document.getElementById('ID').showModal() method _/}
<button className="btn" onClick={()=>document.getElementById('my_modal_1').showModal()}>open modal</button>

<dialog id="my_modal_1" className="modal">
  <div className="modal-box">
    <h3 className="font-bold text-lg">Hello!</h3>
    <p className="py-4">Press ESC key or click the button below to close</p>
    <div className="modal-action">
      <form method="dialog">
        {/* if there is a button in form, it will close the modal */}
        <button className="btn">Close</button>
      </form>
    </div>
  </div>
</dialog>

Dialog modal, closes when clicked outside
there is a second form with 'modal-backdrop' class and it covers the screen so we can close the modal when clicked outside

{/_ Open the modal using document.getElementById('ID').showModal() method _/}
<button className="btn" onClick={()=>document.getElementById('my_modal_2').showModal()}>open modal</button>

<dialog id="my_modal_2" className="modal">
  <div className="modal-box">
    <h3 className="font-bold text-lg">Hello!</h3>
    <p className="py-4">Press ESC key or click outside to close</p>
  </div>
  <form method="dialog" className="modal-backdrop">
    <button>close</button>
  </form>
</dialog>

Dialog modal with a close button at corner

{/_ You can open the modal using document.getElementById('ID').showModal() method _/}
<button className="btn" onClick={()=>document.getElementById('my_modal_3').showModal()}>open modal</button>

<dialog id="my_modal_3" className="modal">
  <div className="modal-box">
    <form method="dialog">
      {/* if there is a button in form, it will close the modal */}
      <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
    </form>
    <h3 className="font-bold text-lg">Hello!</h3>
    <p className="py-4">Press ESC key or click on ✕ button to close</p>
  </div>
</dialog>

Dialog modal with custom width
You can use any w-

{/_ You can open the modal using document.getElementById('ID').showModal() method _/}
<button className="btn" onClick={()=>document.getElementById('my_modal_4').showModal()}>open modal</button>

<dialog id="my_modal_4" className="modal">
  <div className="modal-box w-11/12 max-w-5xl">
    <h3 className="font-bold text-lg">Hello!</h3>
    <p className="py-4">Click the button below to close</p>
    <div className="modal-action">
      <form method="dialog">
        {/* if there is a button, it will close the modal */}
        <button className="btn">Close</button>
      </form>
    </div>
  </div>
</dialog>

Responsive
Modal goes bottom on SM screen size, goes middle on MD screen size

{/_ Open the modal using document.getElementById('ID').showModal() method _/}
<button className="btn" onClick={()=>document.getElementById('my_modal_5').showModal()}>open modal</button>

<dialog id="my_modal_5" className="modal modal-bottom sm:modal-middle">
  <div className="modal-box">
    <h3 className="font-bold text-lg">Hello!</h3>
    <p className="py-4">Press ESC key or click the button below to close</p>
    <div className="modal-action">
      <form method="dialog">
        {/* if there is a button in form, it will close the modal */}
        <button className="btn">Close</button>
      </form>
    </div>
  </div>
</dialog>

Method 2. checkboxlegacy

A hidden checkbox can control the state of modal and labels can toggle the checkbox so we can open/close the modal.
Modal using checkbox

{/_ The button to open modal _/}
<label htmlFor="my_modal_6" className="btn">open modal</label>

{/_ Put this part before </body> tag _/}
<input type="checkbox" id="my_modal_6" className="modal-toggle" />

<div className="modal" role="dialog">
  <div className="modal-box">
    <h3 className="text-lg font-bold">Hello!</h3>
    <p className="py-4">This modal works with a hidden checkbox!</p>
    <div className="modal-action">
      <label htmlFor="my_modal_6" className="btn">Close!</label>
    </div>
  </div>
</div>

Modal that closes when clicked outside
Modal works with a hidden checkbox and labels can toggle the checkbox so we can use another label tag with 'modal-backdrop' class that covers the screen so we can close the modal when clicked outside

{/_ The button to open modal _/}
<label htmlFor="my_modal_7" className="btn">open modal</label>

{/_ Put this part before </body> tag _/}
<input type="checkbox" id="my_modal_7" className="modal-toggle" />

<div className="modal" role="dialog">
  <div className="modal-box">
    <h3 className="text-lg font-bold">Hello!</h3>
    <p className="py-4">This modal works with a hidden checkbox!</p>
  </div>
  <label className="modal-backdrop" htmlFor="my_modal_7">Close</label>
</div>

Method 3. using anchor linkslegacy

A link adds a parameter to the URL and you only see the modal when the URL has that parameter
When modal is closed, the page will scroll to the top because of the anchor link. Anchor links might not work well on some SPA frameworks. If there are problems, use the other methods
Modal using anchor link

{/_ The button to open modal _/}
<a href="#my_modal_8" className="btn">open modal</a>

{/_ Put this part before </body> tag _/}

<div className="modal" role="dialog" id="my_modal_8">
  <div className="modal-box">
    <h3 className="text-lg font-bold">Hello!</h3>
    <p className="py-4">This modal works with anchor links</p>
    <div className="modal-action">
      <a href="#" className="btn">Yay!</a>
    </div>
  </div>
</div>
