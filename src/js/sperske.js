// Vendor bundle for the main site layout (views/layout.ejs).
//
// Replaces the old gulp concat of jquery + popper + bootstrap + lity dist
// files. esbuild resolves the inter-package imports itself, so every library
// shares one jQuery instance. The globals are re-exported onto `window`
// because views such as views/adventure/_id/index.ejs use `$` inline.
import $ from 'jquery';
import Popper from 'popper.js';
import lity from 'lity';
import 'bootstrap';

window.jQuery = window.$ = $;
window.Popper = Popper;
window.lity = lity;
