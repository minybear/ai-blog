import {createAtmosphere, updateReadingProgress} from './world-ui.js?v=4';
createAtmosphere();
updateReadingProgress();
const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();
const tocLinks = [...document.querySelectorAll('.article-toc a[href^="#"]')];
if ('IntersectionObserver' in window && tocLinks.length) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      for (const link of tocLinks) {
        const current = link.hash === `#${entry.target.id}`;
        link.classList.toggle('current',current);
        if (current) link.setAttribute('aria-current','location');
        else link.removeAttribute('aria-current');
      }
    }
  }, {rootMargin:'-12% 0px -65% 0px'});
  tocLinks.forEach(link => {const target = document.querySelector(link.hash);if(target)observer.observe(target);});
}
