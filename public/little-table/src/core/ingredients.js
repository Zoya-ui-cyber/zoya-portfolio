const englishAliases = {
  tomato: "番茄",
  tomatoes: "番茄",
  egg: "鸡蛋",
  eggs: "鸡蛋",
  "spring onion": "小葱",
  scallion: "小葱",
  scallions: "小葱",
  pork: "猪肉",
  "pork belly": "猪肉",
  ginger: "生姜",
  garlic: "大蒜",
  pasta: "意大利面",
  basil: "罗勒",
  broccoli: "西兰花",
  "sea bass": "鲈鱼",
  "green pepper": "青椒",
  "light soy sauce": "生抽",
  "dark soy sauce": "老抽",
  "rock sugar": "冰糖",
  cucumber: "黄瓜",
  spinach: "菠菜",
  salmon: "三文鱼",
  beef: "牛肉",
  chicken: "鸡肉",
  "chicken breast": "鸡肉",
  "chicken thigh": "鸡肉",
  "chicken legs": "鸡肉",
  tofu: "豆腐",
  rice: "米饭",
  mushrooms: "蘑菇",
  shrimp: "虾仁",
  prawns: "虾仁",
  lemon: "柠檬",
  onion: "洋葱",
  cream: "淡奶油",
  butter: "黄油",
  parmesan: "帕玛森芝士",
  "white radish": "白萝卜",
  noodles: "面条",
};
const aliases = {
  西红柿: "番茄",
  五花肉: "猪肉",
  瘦肉: "猪肉",
  蒜: "大蒜",
  蒜头: "大蒜",
  姜: "生姜",
  葱: "小葱",
  面条: "面条",
  鸡胸肉: "鸡肉",
  鸡腿: "鸡肉",
  去骨鸡腿: "鸡肉",
  牛肋条: "牛肉",
  猪里脊: "猪肉",
  猪肉末: "猪肉",
  红薯淀粉: "淀粉",
  "baby spinach": "菠菜",
  小番茄: "番茄",
};
export function norm(s) {
  const n = s.trim().toLowerCase();
  const translated = englishAliases[n] || n;
  return aliases[translated] || translated;
}
export function ingredientName(s) {
  return s.replace(/[\s\d].*$/, "").replace(/（.*?）/g, "");
}
export function matchesCategory(r, c) {
  return c === "全部" || r.category === c || (r.categories || []).includes(c);
}
