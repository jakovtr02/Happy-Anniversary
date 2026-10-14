'use strict';

// Original PDF pages, preserved as full-page images.
const chapters = ['Happy Anniversary', 'Our Journey', 'The Moments', 'How We Love', 'Favorite Things', 'Our Growth', 'Highlights of Our Year', 'Gratitude', 'My Promise', 'A Love Still Growing'];
const pageImage = index => `assets/page-${String(index + 1).padStart(2, '0')}.webp`;
const book = document.getElementById('book');
const under = document.getElementById('underImage');
const flip = document.getElementById('pageFlip');
const front = document.getElementById('flipFrontImage');
const back = document.getElementById('flipBackImage');
let current = 0;
let turning = false;
let suppressClick = false;

function update() {
  under.src = pageImage(current);
  under.alt = `Page ${current + 1} of ${chapters.length}: ${chapters[current]}`;
}
function preloadNeighbors() {
  [current - 1, current + 1].filter(i => i >= 0 && i < chapters.length).forEach(i => {
    const image = new Image();
    image.src = pageImage(i);
  });
}
function turn(direction) {
  if (turning) return;
  const target = current + direction;
  if (target < 0 || target >= chapters.length) return;
  turning = true;
  under.src = pageImage(direction > 0 ? target : current);
  front.src = pageImage(direction > 0 ? current : target);
  back.src = pageImage(direction > 0 ? current : target);
  flip.className = 'page-flip';
  void flip.offsetWidth;
  flip.classList.add(direction > 0 ? 'forward' : 'backward');
  flip.addEventListener('animationend', () => {
    flip.className = 'page-flip';
    current = target;
    turning = false;
    update();
    history.replaceState(null, '', `#page-${current + 1}`);
    preloadNeighbors();
  }, {once: true});
}
book.addEventListener('click', e => {
  if (suppressClick) { suppressClick = false; return; }
  const bounds = book.getBoundingClientRect();
  turn(e.clientX < bounds.left + bounds.width / 2 ? -1 : 1);
});
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); turn(1); }
  if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); turn(-1); }
});
let start = null;
book.addEventListener('touchstart', e => { start = {x:e.changedTouches[0].clientX, y:e.changedTouches[0].clientY}; }, {passive:true});
book.addEventListener('touchend', e => {
  if (!start) return;
  const dx = e.changedTouches[0].clientX - start.x;
  const dy = e.changedTouches[0].clientY - start.y;
  start = null;
  if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.2) {
    suppressClick = true;
    turn(dx < 0 ? 1 : -1);
    setTimeout(() => { suppressClick = false; }, 400);
  }
}, {passive:true});
const initial = Number(location.hash.match(/^#page-(\d+)$/)?.[1]);
if (initial >= 1 && initial <= chapters.length) current = initial - 1;
update();
preloadNeighbors();
