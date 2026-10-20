import {
  recipeCatalog,
  catalogTranslations as curatedTranslations,
} from "./curated.js";
import { originalSeeds } from "./original.js";
import { additions } from "./additions.js";
export const seeds = [
  ...additions,
  ...recipeCatalog,
  ...originalSeeds.map(({ photo, ...recipe }) => recipe),
];
export const catalogTranslations = { ...curatedTranslations };
for (const recipe of additions) {
  if (!recipe.en) continue;
  catalogTranslations[recipe.title] = recipe.en.title;
  recipe.ingredients.forEach(
    (text, i) =>
      (catalogTranslations[text] = recipe.en.ingredients?.[i] || text),
  );
  recipe.steps.forEach(
    (text, i) => (catalogTranslations[text] = recipe.en.steps?.[i] || text),
  );
  if (recipe.en.note) catalogTranslations[recipe.note] = recipe.en.note;
}
