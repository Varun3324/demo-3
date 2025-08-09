# LearnDesk — immersive learning site

How to run
- Open `index.html` in a browser, or use a live server.

Logo
- Save your provided logo image as `logo.png` in `public/assets/` so the page can load it at `./public/assets/logo.png`.
- The site applies a purple tint, glow, and blend mode to match the theme. You can tweak the CSS for `.logo-img` in `styles.css` to customize.

Motion sensors
- On iOS devices, tap the "Enable Motion" button to grant permission for device motion. On Android and desktop, motion/tilt works automatically or falls back to mouse movement.

Customization
- Colors and gradients are defined in `styles.css` under the `:root` variables.
- Sections are in `index.html`; interactivity lives in `app.js`.