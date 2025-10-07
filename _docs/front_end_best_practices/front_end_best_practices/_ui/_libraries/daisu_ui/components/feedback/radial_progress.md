Radial progress

Radial progress can be used to show the progress of a task or to show the passing of time.
Class name
Type
radial-progress Component
Shows a radial progress

    Radial progress needs--valueCSS variable to work.
    To change the size, use--sizeCSS variable which has a default value of5rem.
    To change the thickness, use--thicknessCSS variable which is 10% of the size by default.

    For Radial progress we need to use adivinstead of theprogresstag because browsers can't show text insideprogresstag, and Firefox doesn’t render pseudo-elements insideprogresstag at all.
    Addingrole="progressbar"makes it accessible to screen readers as well.

Radial progress

{/_ For TSX uncomment the commented types below _/}

<div className="radial-progress" style={{ "--value": 70 } /* as React.CSSProperties */ } 
  aria-valuenow={70} role="progressbar">70%</div>

Different values

{/_ For TSX uncomment the commented types below _/}

<div className="radial-progress" style={{"--value":0} /* as React.CSSProperties */ } 
  aria-valuenow={0} role="progressbar">0%</div>

<div className="radial-progress" style={{"--value":20} /* as React.CSSProperties */ } 
aria-valuenow={20} role="progressbar">20%</div>

<div className="radial-progress" style={{"--value":60} /* as React.CSSProperties */ } 
  aria-valuenow={60} role="progressbar">60%</div>

<div className="radial-progress" style={{"--value":80} /* as React.CSSProperties */ } 
  aria-valuenow={80} role="progressbar">80%</div>

<div className="radial-progress" style={{"--value":100} /* as React.CSSProperties */ } 
  aria-valuenow={100} role="progressbar">100%</div>

Custom color

{/_ For TSX uncomment the commented types below _/}

<div className="radial-progress text-primary" style={{ "--value": 70 } /* as React.CSSProperties */ } aria-valuenow={70} role="progressbar">
  70%
</div>

With background color and border

{/_ For TSX uncomment the commented types below _/}

<div
  className="radial-progress bg-primary text-primary-content border-primary border-4"
  style={{ "--value": 70 } /* as React.CSSProperties */ } aria-valuenow={70} role="progressbar">
  70%
</div>

Custom size and custom thickness

{/_ For TSX uncomment the commented types below _/}

<div className="radial-progress"
  style={{ "--value": "70", "--size": "12rem", "--thickness": "2px" } /* as React.CSSProperties */ } 
  aria-valuenow={70} role="progressbar">70%</div>

<div className="radial-progress"
  style={{ "--value": "70", "--size": "12rem", "--thickness": "2rem" } /* as React.CSSProperties */ } 
  aria-valuenow={70} role="progressbar">70%</div>
