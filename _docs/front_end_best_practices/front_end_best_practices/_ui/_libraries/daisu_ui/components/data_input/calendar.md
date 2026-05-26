Calendar

Calendar includes styles for different calendar libraries.
Class name
	Type	
cally	Component
	for Cally web component
pika-single	Component
	for the input field that opens Pikaday calendar
react-day-picker	Component
	for the DayPicker component

    You can also use the native HTML<input type="date">for a date picker.Read more

daisyUI supports 3 calendar libraries

daisyUI includes styles for 3 popular calendar libraries.
Use any of them, based on your needs.
You don't need to import the CSS files for these libraries. daisyUI will style them automatically.

    Cally web component- Works everywhere
    Pikaday- Works everywhere
    React Day picker- React only

1. Cally Calendar

Cally is a web component calendar and it works everywhere.Read the docs
Cally calendar example
Example using daisyUI styles
Cally date picker example
Example using daisyUI styles and daisyUI dropdown
2. Pikaday Calendar

Pikaday is a JS datepicker library and you can use it from CDN or as a JS dependencyRead the docs
Pikaday CDN Example
html

<script src="https://cdn.jsdelivr.net/npm/pikaday/pikaday.js"></script>
<input type="text" class="input pika-single" id="myDatepicker">
<script>
  var picker = new Pikaday({ field: document.getElementById('myDatepicker') });
</script>

Pikaday Svelte Example
Install

npm i pikaday

file.svelte

<script>
  import Pikaday from "pikaday";
  let myDatepicker;
  $effect(() => {
    if (myDatepicker) {
      const picker = new Pikaday({
        field: myDatepicker
      });
      return () => picker.destroy();
    }
  });
</script>

<input type="text" class="input pika-single"  bind:this={myDatepicker} value="Pick a day" />

Pikaday Vue Example
Install

npm i pikaday

file.vue

<script>
import Pikaday from "pikaday";
export default {
  mounted: function() {
    const picker = new Pikaday({
      field: this.$refs.myDatepicker
    });
  }
};
</script>
<template>
  <input type="text" class="input pika-single" ref="myDatepicker" value="Pick a day"/>
</template>

Pikaday React Example
Install

npm i pikaday

file.tsx

import { useEffect, useRef } from "react";
import Pikaday from "pikaday";

export default function App() {
  const myDatepicker = useRef(null);
  useEffect(() => {
    const picker = new Pikaday({
      field: myDatepicker.current
    });
    return () => picker.destroy();
  }, []);
  return (
    <input type="text" className="input pika-single" defaultValue="Pick a date" ref={myDatepicker} />
  );
}

3. React Day Picker calendar

React Day Picker is a flexible date picker component for React.Read the docs
React Day Picker Example
Install

npm i react-day-picker

file.tsx

import { useState } from "react";
import { DayPicker } from "react-day-picker";

export default function App() {
  const [date, setDate] = useState<Date | undefined>();
  return (
    <>
      <button popoverTarget="rdp-popover" className="input input-border" style={{ anchorName: "--rdp" } as React.CSSProperties}>
        {date ? date.toLocaleDateString() : "Pick a date"}
      </button>
      <div popover="auto" id="rdp-popover" className="dropdown" style={{ positionAnchor: "--rdp" } as React.CSSProperties}>
        <DayPicker className="react-day-picker" mode="single" selected={date} onSelect={setDate} />
      </div>
    </>
  );
}