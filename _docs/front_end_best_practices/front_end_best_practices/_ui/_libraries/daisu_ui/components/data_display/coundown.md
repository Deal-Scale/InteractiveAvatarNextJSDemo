Countdown

Countdown gives you a transition effect when you change a number between 0 to 99.
Class name
Type
countdown Component
Countdown wrapper

    you need to change the span text and the--valueCSS variable using JS. Value must be a number between 0 and 99.

Countdown

{/_ For TSX uncomment the commented types below _/}
<span className="countdown">
<span style={{"--value":59} /_ as React.CSSProperties _/ } aria-live="polite" aria-label={counter}>59</span>
</span>

Large text

{/_ For TSX uncomment the commented types below _/}
<span className="countdown font-mono text-6xl">
<span style={{"--value":59} /_ as React.CSSProperties _/ } aria-live="polite" aria-label={counter}>59</span>
</span>

Clock countdown

{/_ For TSX uncomment the commented types below _/}
<span className="countdown font-mono text-2xl">
<span style={{"--value":10} /_ as React.CSSProperties _/ } aria-live="polite" aria-label={counter}>10</span>h
<span style={{"--value":24} /_ as React.CSSProperties _/ } aria-live="polite" aria-label={counter}>24</span>m
<span style={{"--value":59} /_ as React.CSSProperties _/ } aria-live="polite" aria-label={counter}>59</span>s
</span>

Clock countdown with colons

{/_ For TSX uncomment the commented types below _/}
<span className="countdown font-mono text-2xl">
<span style={{"--value":10} /_ as React.CSSProperties _/ } aria-live="polite" aria-label={counter}>10</span>:
<span style={{"--value":24} /_ as React.CSSProperties _/ } aria-live="polite" aria-label={counter}>24</span>:
<span style={{"--value":59} /_ as React.CSSProperties _/ } aria-live="polite" aria-label={counter}>59</span>
</span>

Large text with labels

{/_ For TSX uncomment the commented types below _/}

<div className="flex gap-5">
  <div>
    <span className="countdown font-mono text-4xl">
        <span style={{"--value":15} /* as React.CSSProperties */ } aria-live="polite" aria-label={counter}>15</span>
    </span>
    days
  </div>
  <div>
    <span className="countdown font-mono text-4xl">
        <span style={{"--value":10} /* as React.CSSProperties */ } aria-live="polite" aria-label={counter}>10</span>
    </span>
    hours
  </div>
  <div>
    <span className="countdown font-mono text-4xl">
      <span style={{"--value":24} /* as React.CSSProperties */ } aria-live="polite" aria-label={counter}>24</span>
    </span>
    min
  </div>
  <div>
    <span className="countdown font-mono text-4xl">
      <span style={{"--value":59} /* as React.CSSProperties */ } aria-live="polite" aria-label={counter}>59</span>
    </span>
    sec
  </div>
</div>

Large text with labels under

{/_ For TSX uncomment the commented types below _/}

<div className="grid grid-flow-col gap-5 text-center auto-cols-max">
  <div className="flex flex-col">
    <span className="countdown font-mono text-5xl">
      <span style={{"--value":15} /* as React.CSSProperties */ } aria-live="polite" aria-label={counter}>15</span>
    </span>
    days
  </div>
  <div className="flex flex-col">
    <span className="countdown font-mono text-5xl">
      <span style={{"--value":10} /* as React.CSSProperties */ } aria-live="polite" aria-label={counter}>10</span>
    </span>
    hours
  </div>
  <div className="flex flex-col">
    <span className="countdown font-mono text-5xl">
      <span style={{"--value":24} /* as React.CSSProperties */ } aria-live="polite" aria-label={counter}>24</span>
    </span>
    min
  </div>
  <div className="flex flex-col">
    <span className="countdown font-mono text-5xl">
      <span style={{"--value":59} /* as React.CSSProperties */ } aria-live="polite" aria-label={counter}>59</span>
    </span>
    sec
  </div>
</div>

In boxes

{/_ For TSX uncomment the commented types below _/}

<div className="grid grid-flow-col gap-5 text-center auto-cols-max">
  <div className="flex flex-col p-2 bg-neutral rounded-box text-neutral-content">
    <span className="countdown font-mono text-5xl">
      <span style={{"--value":15} /* as React.CSSProperties */ } aria-live="polite" aria-label={counter}>15</span>
    </span>
    days
  </div>
  <div className="flex flex-col p-2 bg-neutral rounded-box text-neutral-content">
    <span className="countdown font-mono text-5xl">
      <span style={{"--value":10} /* as React.CSSProperties */ } aria-live="polite" aria-label={counter}>10</span>
    </span>
    hours
  </div>
  <div className="flex flex-col p-2 bg-neutral rounded-box text-neutral-content">
    <span className="countdown font-mono text-5xl">
      <span style={{"--value":24} /* as React.CSSProperties */ } aria-live="polite" aria-label={counter}>24</span>
    </span>
    min
  </div>
  <div className="flex flex-col p-2 bg-neutral rounded-box text-neutral-content">
    <span className="countdown font-mono text-5xl">
      <span style={{"--value":59} /* as React.CSSProperties */ } aria-live="polite" aria-label={counter}>59</span>
    </span>
    sec
  </div>
</div>
