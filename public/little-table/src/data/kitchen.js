// Explicit tools and incidental ingredients for every built-in recipe.
const kit = (equipment, extra = {}) => ({
  equipment: ["菜刀", "砧板", ...equipment],
  ...extra,
});
const fry = ["炒锅", "锅铲"];
export const kitchen = {
  "fav-beef-ribs": kit(["高压锅", "焯水锅", "漏勺", "汤勺"], {
    basics: ["盐 适量", "水 适量"],
    aromatics: ["香菜 适量", "大蒜 2瓣（蘸汁可选）", "小米椒 1个（蘸汁可选）"],
    sauces: ["蚝油 1勺", "生抽 2勺", "白糖 少许", "香油 少许", "辣椒油 少许"],
  }),
  "fav-lemon-chicken": kit(["煮锅", "漏勺", "耐热拌料碗", "拌菜盆"], {
    basics: ["盐 适量", "食用油 适量"],
  }),
  "fav-teriyaki": kit(["平底锅", "锅盖", "夹子", "调料碗"], {
    basics: ["食用油 少许", "水 小半碗"],
  }),
  "fav-tuscan": kit(["平底锅", "煮面锅", "夹子", "刨丝器"], {
    basics: ["盐 适量", "水 适量"],
    sauces: ["白糖 少许"],
  }),
  "fav-sweet-sour-ribs": kit(["炒锅", "锅盖", "锅铲", "调料碗", "厨房纸"], {
    basics: ["食用油 少许", "水 适量"],
  }),
  "home-spinach": kit([...fry, "焯水锅", "漏勺"], {
    basics: ["盐 适量", "食用油 少许", "水 适量"],
  }),
  "home-pork-onion": kit(fry, { basics: ["盐 适量", "食用油 少许"] }),
  "hunan-beef": kit([...fry, "腌肉碗"], { basics: ["盐 适量", "食用油 适量"] }),
  "hunan-pork": kit(fry, { basics: ["食用油 少许"] }),
  "sichuan-tofu": kit([...fry, "焯水锅", "调料碗"], {
    basics: ["盐 适量", "食用油 少许", "水 适量"],
  }),
  "sichuan-chicken": kit([...fry, "调料碗"], {
    basics: ["食用油 适量", "水 适量"],
  }),
  "cantonese-eggs": kit(["不粘锅", "锅铲", "打蛋碗"], {
    basics: ["盐 适量", "食用油 少许", "水 少许"],
  }),
  "shandong-pork": kit(["深锅", "漏勺", "炒锅", "锅铲", "调料碗"], {
    basics: ["盐 适量", "食用油 适量", "水 适量"],
  }),
  "shandong-leek": kit(["平底锅", "锅盖", "锅铲"], {
    basics: ["食用油 少许", "水 半碗"],
  }),
  "jiangsu-meatball": kit(["煮锅", "砂锅", "搅拌碗", "汤勺"], {
    basics: ["盐 适量", "水 适量"],
  }),
  "jiangsu-rice": kit(fry, { basics: ["盐 适量", "食用油 少许", "水 适量"] }),
  "zhejiang-shrimp": kit([...fry, "茶杯", "腌料碗"], {
    basics: ["盐 适量", "食用油 少许", "水 适量"],
  }),
  "fujian-oyster": kit(["平底锅", "锅铲", "打蛋碗", "翻面盘"], {
    basics: ["盐 适量", "食用油 少许", "水 适量"],
  }),
  "fujian-noodles": kit(["煮面锅", "漏勺", "拌面碗"], {
    basics: ["食用油 少许", "水 适量"],
  }),
  "anhui-chicken": kit(["炖锅", "焯水锅", "汤勺"], {
    basics: ["盐 适量", "食用油 少许", "水 适量"],
  }),
  "anhui-tofu": kit(["平底锅", "锅盖", "锅铲"], {
    basics: ["食用油 少许", "水 半碗"],
  }),
  "italian-risotto": kit(["厚底锅", "高汤锅", "汤勺", "刨丝器"], {
    basics: ["盐 适量"],
    sauces: ["黑胡椒 少许"],
  }),
  "creative-rice": kit(["炒锅", "平底锅", "锅铲"], { basics: ["食用油 少许"] }),
  s1: kit(["炒锅", "锅铲", "打蛋碗"], { basics: ["盐 适量", "食用油 少许"] }),
  s2: kit(["炖锅", "焯水锅", "锅铲", "锅盖"], {
    basics: ["食用油 少许", "水 适量"],
  }),
  s3: kit(["煮面锅", "平底锅", "夹子"], {
    basics: ["盐 适量", "食用油 少许", "水 适量"],
  }),
  s4: kit(["蒸锅", "蒸鱼盘", "夹子", "小锅"], {
    basics: ["食用油 少许", "水 适量"],
  }),
  s5: kit(["炒锅", "焯水锅", "锅铲", "漏勺"], {
    basics: ["盐 适量", "食用油 少许", "水 适量"],
  }),
  s6: kit(fry, { basics: ["盐 适量", "食用油 少许"] }),
};
