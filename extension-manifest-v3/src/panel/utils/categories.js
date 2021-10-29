import { t } from './i18n.js';

export function sortCategories(categories) {
  // CATEGORY_ORDER is a global from tracker-wheel.js
  return categories.sort((a, b) => CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b));
}

export function getCategoryName(category) {
  return t(`category_${category}`);
}
