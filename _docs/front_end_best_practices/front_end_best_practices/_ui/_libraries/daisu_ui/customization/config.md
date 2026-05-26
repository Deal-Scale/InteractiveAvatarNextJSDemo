Config

How to change the default configuration of daisyUI?

daisyUI can be configured from your CSS file.

Replace the semicolon;after@plugin "daisyui"with brackets{}and add the configuration inside the brackets.
app.css

 @plugin "daisyui";

 @plugin "daisyui" {

 }

Default config:
app.css

@plugin "daisyui" {
  themes: light --default, dark --prefersdark;
  root: ":root";
  include: ;
  exclude: ;
  prefix: ;
  logs: true;
}