// Pure shopping-list logic. No DOM, storage or network access.
const seasoning = new Set([
  "盐",
  "油",
  "食用油",
  "水",
  "生抽",
  "老抽",
  "蚝油",
  "香醋",
  "白醋",
  "料酒",
  "黄酒",
  "白糖",
  "冰糖",
  "零卡糖",
  "黑胡椒",
  "白胡椒",
  "花椒粉",
  "花椒",
  "蒜粉",
  "红椒粉",
  "淀粉",
  "红薯淀粉",
  "番茄酱",
  "番茄膏",
  "沙茶酱",
  "花生酱",
  "郫县豆瓣酱",
  "豆豉",
  "辣椒面",
  "鸡精",
]);
const aromatic = new Set([
  "生姜",
  "大蒜",
  "大葱",
  "小葱",
  "香菜",
  "欧芹",
  "牛至叶",
  "罗勒",
  "白芝麻",
  "小米椒",
  "干辣椒",
  "龙井茶",
]);
export const groups = [
  ["food", "食材"],
  ["seasoning", "酱料与调味"],
  ["aromatic", "配料"],
  ["equipment", "锅具与工具"],
];
export function parseIngredient(raw) {
  const text = String(raw).trim();
  const split =
    text.match(/^(.+?)\s+((?:\d|半|适量|少许|to taste|a little|half\b).*)$/i) ||
    text.match(
      /^(.+?)(\d+(?:\.\d+)?(?:毫升|千克|公斤|小勺|克|勺|个|根|片|瓣|只|块|条|颗|碗|朵|升).*)$/,
    );
  const name = (split ? split[1] : text).replace(/[（(](干|dry)[）)]/gi, "");
  const amount = split ? split[2] : "适量";
  const match = amount.match(
    /^(\d+(?:\.\d+)?|半)\s*(毫升|千克|公斤|小勺|克|勺|个|根|片|瓣|只|块|条|颗|碗|朵|升|kg|g|ml|l|tbsp|tsp|pcs|cloves|stalks)(.*)$/i,
  );
  const units = {g:["克",1],kg:["克",1000],ml:["毫升",1],l:["毫升",1000],"千克":["克",1000],"公斤":["克",1000],"升":["毫升",1000],tbsp:["勺",1],tsp:["小勺",1],pcs:["个",1],cloves:["瓣",1],stalks:["根",1]};
  const conversion = units[(match?.[2] || "").toLowerCase()];
  return {
    name,
    amount,
    value: match ? (match[1] === "半" ? 0.5 : Number(match[1])) * (conversion?.[1] || 1) : null,
    unit: conversion?.[0] || match?.[2] || "",
    note: match?.[3] || "",
  };
}
export function groupFor(name) {
  return seasoning.has(name)
    ? "seasoning"
    : aromatic.has(name)
      ? "aromatic"
      : "food";
}
export function getSupplies(recipe, metadata = {}) {
  const output = recipe.ingredients.map((raw) => ({
    ...parseIngredient(raw),
    group: groupFor(parseIngredient(raw).name),
  }));
  for (const [key, group] of [
    ["sauces", "seasoning"],
    ["aromatics", "aromatic"],
    ["basics", "seasoning"],
  ]) {
    for (const raw of [...(metadata[key] || []), ...(recipe[key] || [])]) {
      const item = parseIngredient(raw);
      if (!output.some((x) => x.name === item.name))
        output.push({ ...item, group });
    }
  }
  const equipment = recipe.equipment?.length
    ? recipe.equipment
    : metadata.equipment || ["炒锅", "锅铲", "菜刀", "砧板"];
  for (const name of new Set(equipment))
    output.push({
      name,
      amount: "备好即可",
      value: null,
      unit: "",
      note: "",
      group: "equipment",
    });
  return output;
}
export function buildShoppingList(recipes, selected, metadata = {}) {
  const items = new Map();
  for (const recipe of recipes) {
    const multiplier = Number(selected[recipe.id]);
    if (!Number.isFinite(multiplier) || multiplier <= 0 || multiplier > 20)
      continue;
    for (const item of getSupplies(recipe, metadata[recipe.id])) {
      const key = `${item.group}:${item.name}`;
      if (!items.has(key))
        items.set(key, {
          id: key,
          name: item.name,
          group: item.group,
          parts: [],
          sources: [],
        });
      const merged = items.get(key);
      if (item.group !== "equipment")
        merged.parts.push({ ...item, multiplier, recipeId: recipe.id });
      merged.sources.push({
        id: recipe.id,
        title: recipe.title,
        multiplier,
        amount: item.amount,
      });
    }
  }
  return [...items.values()].map((item) => {
    const units = new Map(),
      uncounted = [];
    for (const part of item.parts) {
      if (part.value !== null)
        units.set(
          part.unit,
          (units.get(part.unit) || 0) + part.value * part.multiplier,
        );
      else if (!uncounted.includes(part.amount)) uncounted.push(part.amount);
    }
    const amounts = [...units].map(
      ([unit, value]) => `${Number(value.toFixed(2))}${unit}`,
    );
    const notes = [
      ...new Set(item.parts.map((p) => p.note).filter(Boolean)),
    ].join(" ");
    item.amount =
      item.group === "equipment"
        ? "备好即可"
        : [...amounts, ...uncounted].join(" + ") + (notes ? ` ${notes}` : "");
    // A changed quantity must be checked again; unchanged lines retain their check.
    item.signature = JSON.stringify([
      item.amount,
      ...item.parts.map((p) => [p.recipeId, p.multiplier, p.amount]).sort(),
    ]);
    return item;
  });
}
export function mapsSearchUrl(type, area = "") {
  const term = type === "market" ? "farmers market" : "supermarket";
  return (
    "https://www.google.com/maps/search/?" +
    new URLSearchParams({
      api: "1",
      query: area.trim() ? `${term} ${area.trim()}` : `${term} near me`,
    })
  );
}
