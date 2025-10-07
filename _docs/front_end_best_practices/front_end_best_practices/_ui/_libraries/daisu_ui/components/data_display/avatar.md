Avatar

Avatars are used to show a thumbnail representation of an individual or business in the interface.
Class name
Type
avatar Component
Avatar
avatar-group Component
Container for multiple avatars
avatar-online
Modifier
shows a green dot as online indicator
avatar-offline
Modifier
shows a gray dot as offline indicator
avatar-placeholder
Modifier
To show letters as avatar placeholder
Avatar

<div className="avatar">
  <div className="w-24 rounded">
    <img src="https://img.daisyui.com/images/profile/demo/batperson@192.webp" />
  </div>
</div>

Avatar in custom sizes

<div className="avatar">
  <div className="w-32 rounded">
    <img src="https://img.daisyui.com/images/profile/demo/superperson@192.webp" />
  </div>
</div>
<div className="avatar">
  <div className="w-20 rounded">
    <img
      src="https://img.daisyui.com/images/profile/demo/superperson@192.webp"
      alt="Tailwind-CSS-Avatar-component"
    />
  </div>
</div>
<div className="avatar">
  <div className="w-16 rounded">
    <img
      src="https://img.daisyui.com/images/profile/demo/superperson@192.webp"
      alt="Tailwind-CSS-Avatar-component"
    />
  </div>
</div>
<div className="avatar">
  <div className="w-8 rounded">
    <img
      src="https://img.daisyui.com/images/profile/demo/superperson@192.webp"
      alt="Tailwind-CSS-Avatar-component"
    />
  </div>
</div>

Avatar rounded

<div className="avatar">
  <div className="w-24 rounded-xl">
    <img src="https://img.daisyui.com/images/profile/demo/yellingwoman@192.webp" />
  </div>
</div>
<div className="avatar">
  <div className="w-24 rounded-full">
    <img src="https://img.daisyui.com/images/profile/demo/yellingcat@192.webp" />
  </div>
</div>

Avatar with mask

<div className="avatar">
  <div className="mask mask-heart w-24">
    <img src="https://img.daisyui.com/images/profile/demo/distracted3@192.webp" />
  </div>
</div>
<div className="avatar">
  <div className="mask mask-squircle w-24">
    <img src="https://img.daisyui.com/images/profile/demo/distracted1@192.webp" />
  </div>
</div>
<div className="avatar">
  <div className="mask mask-hexagon-2 w-24">
    <img src="https://img.daisyui.com/images/profile/demo/distracted2@192.webp" />
  </div>
</div>

Avatar group

<div className="avatar-group -space-x-6">
  <div className="avatar">
    <div className="w-12">
      <img src="https://img.daisyui.com/images/profile/demo/batperson@192.webp" />
    </div>
  </div>
  <div className="avatar">
    <div className="w-12">
      <img src="https://img.daisyui.com/images/profile/demo/spiderperson@192.webp" />
    </div>
  </div>
  <div className="avatar">
    <div className="w-12">
      <img src="https://img.daisyui.com/images/profile/demo/averagebulk@192.webp" />
    </div>
  </div>
  <div className="avatar">
    <div className="w-12">
      <img src="https://img.daisyui.com/images/profile/demo/wonderperson@192.webp" />
    </div>
  </div>
</div>

Avatar group with counter

<div className="avatar-group -space-x-6">
  <div className="avatar">
    <div className="w-12">
      <img src="https://img.daisyui.com/images/profile/demo/batperson@192.webp" />
    </div>
  </div>
  <div className="avatar">
    <div className="w-12">
      <img src="https://img.daisyui.com/images/profile/demo/spiderperson@192.webp" />
    </div>
  </div>
  <div className="avatar">
    <div className="w-12">
      <img src="https://img.daisyui.com/images/profile/demo/averagebulk@192.webp" />
    </div>
  </div>
  <div className="avatar avatar-placeholder">
    <div className="bg-neutral text-neutral-content w-12">
      <span>+99</span>
    </div>
  </div>
</div>

Avatar with ring

<div className="avatar">
  <div className="ring-primary ring-offset-base-100 w-24 rounded-full ring-2 ring-offset-2">
    <img src="https://img.daisyui.com/images/profile/demo/spiderperson@192.webp" />
  </div>
</div>

Avatar with presence indicator

<div className="avatar avatar-online">
  <div className="w-24 rounded-full">
    <img src="https://img.daisyui.com/images/profile/demo/gordon@192.webp" />
  </div>
</div>
<div className="avatar avatar-offline">
  <div className="w-24 rounded-full">
    <img src="https://img.daisyui.com/images/profile/demo/idiotsandwich@192.webp" />
  </div>
</div>

Avatar placeholder

<div className="avatar avatar-placeholder">
  <div className="bg-neutral text-neutral-content w-24 rounded-full">
    <span className="text-3xl">D</span>
  </div>
</div>
<div className="avatar avatar-online avatar-placeholder">
  <div className="bg-neutral text-neutral-content w-16 rounded-full">
    <span className="text-xl">AI</span>
  </div>
</div>
<div className="avatar avatar-placeholder">
  <div className="bg-neutral text-neutral-content w-12 rounded-full">
    <span>SY</span>
  </div>
</div>
<div className="avatar avatar-placeholder">
  <div className="bg-neutral text-neutral-content w-8 rounded-full">
    <span className="text-xs">UI</span>
  </div>
</div>
