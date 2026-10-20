let words={},dictionary=[];
export function setTranslations(entries){dictionary=entries;words=Object.fromEntries(entries);}
export function english(text) {
  let t = text;
  const exact = words[t.trim()];
  if (exact) return t.replace(t.trim(), exact);
  for (const [zh, en] of dictionary) t = t.split(zh).join(en);
  return t
    .replace(/共 (\d+) 道食谱/g, "$1 recipes")
    .replace(/已导入 (\d+) 道食谱/g, "Imported $1 recipes")
    .replace(/(\d+)克/g, "$1 g")
    .replace(/(\d+)个/g, "$1 pcs")
    .replace(/(\d+)根/g, "$1 stalks")
    .replace(/(\d+)片/g, "$1 slices")
    .replace(/(\d+)勺/g, "$1 tbsp")
    .replace(/(\d+)瓣/g, "$1 cloves")
    .replace(/(\d+)条/g, "$1 whole")
    .replace(/(\d+)颗/g, "$1 head")
    .replace(/适量/g, "to taste")
    .replace(/、/g, ", ")
    .replace(/\b1 recipes\b/g, "1 recipe")
    .replace(/\b1 extra ingredients\b/g, "1 extra ingredient");
}
