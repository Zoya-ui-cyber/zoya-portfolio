import { getSupplies, groups } from "../core/shopping.js";
import { kitchen } from "../data/kitchen.js";
export function preparationMarkup(recipe, escape) {
  const supplies = getSupplies(recipe, kitchen[recipe.id]);
  return groups
    .map(([key, label]) => {
      const list = supplies.filter((i) => i.group === key);
      return list.length
        ? `<h3>${label}</h3><ul>${list.map((i) => `<li>${escape(i.name)} ${escape(i.amount)}</li>`).join("")}</ul>`
        : "";
    })
    .join("");
}

export function editorPreparation(recipe) {
  const supplies = getSupplies(recipe, kitchen[recipe.id]);
  const originalNames = new Set(
    recipe.ingredients.map((raw) => raw.replace(/\s.*$/, "")),
  );
  const collect = (group) =>
    supplies
      .filter((i) => i.group === group && !originalNames.has(i.name))
      .map((i) => i.name + " " + i.amount);
  return {
    sauces: collect("seasoning"),
    aromatics: collect("aromatic"),
    equipment: supplies
      .filter((i) => i.group === "equipment")
      .map((i) => i.name),
  };
}
