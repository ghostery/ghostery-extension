// CATEGORY_ORDER is a global from tracker-wheel.js

export function sortCategories(categories) {
  return categories.sort((a, b) => CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b));
}