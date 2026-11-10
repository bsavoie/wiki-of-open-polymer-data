const article = document.querySelector('#review-article');
const width = document.querySelector('#review-width');
const section = document.querySelector('#review-section');
const frame = document.querySelector('#article-preview');
const open = document.querySelector('#open-article');
function updateArticle() {
  const target = `${article.value.split('#')[0]}#${section.value}`;
  frame.src = target;
  open.href = target;
}
article.addEventListener('change', updateArticle);
section.addEventListener('change', updateArticle);
width.addEventListener('change', () => { frame.style.width = width.value; });
const search = document.querySelector('#review-search');
const previous = document.querySelector('#review-previous');
const next = document.querySelector('#review-next');
const count = document.querySelector('#review-count');
const allArticles = [...article.options].map(option => ({value: option.value, label: option.textContent}));
function updateNavigation() {
  previous.disabled = article.selectedIndex <= 0;
  next.disabled = article.selectedIndex < 0 || article.selectedIndex >= article.options.length - 1;
  count.textContent = article.options.length ? `${article.selectedIndex + 1} of ${article.options.length}` : 'No matches';
}
search.addEventListener('input', () => {
  const selected = article.value;
  const query = search.value.toLocaleLowerCase().trim();
  article.replaceChildren(...allArticles.filter(option => option.label.toLocaleLowerCase().includes(query)).map(option => new Option(option.label, option.value)));
  if ([...article.options].some(option => option.value === selected)) article.value = selected;
  if (article.value && article.value !== selected) updateArticle();
  updateNavigation();
});
for (const [button, direction] of [[previous, -1], [next, 1]]) button.addEventListener('click', () => {
  article.selectedIndex += direction;
  updateArticle();
  updateNavigation();
});
article.addEventListener('change', updateNavigation);
updateNavigation();
