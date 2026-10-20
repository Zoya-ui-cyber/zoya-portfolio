import { read } from "../core/storage.js";
import { catalogTranslations } from "../data/recipes/index.js";
import { plannerTranslations } from "../data/planner-translations.js";
const $ = (s) => document.querySelector(s);
// Keep recipe data and select values language-independent; translate presentation only.
let language = read("shiguang-language", "zh");
const words = {
  食光: "Shiguang",
  我的厨房: "My kitchen",
  发现食谱: "Discover recipes",
  冰箱里有什么: "What’s in my fridge",
  我的食谱: "My recipes",
  "一餐一饭，皆是生活。": "A little joy in every meal.",
  "把喜欢的味道，": "Keep the flavours you love,",
  "慢慢收进自己的食谱。": "one recipe at a time.",
  我的私人厨房: "My personal kitchen",
  今天也要好好吃饭: "Make something good today",
  导出我的食谱: "Export recipes",
  导入食谱: "Import recipes",
  创建食谱: "Create recipe",
  "今天，想吃点什么？": "What’s cooking today?",
  "从日常食材里，发现下一道喜欢的味道。":
    "Turn everyday ingredients into your next favourite meal.",
  "用心做饭 · 好好生活": "Cook with care · Live well",
  从冰箱到餐桌: "FROM FRIDGE TO TABLE",
  "剩下的食材，也有新灵感。": "A little left over. A lot of possibility.",
  "告诉我你有什么，一起看看今天能做什么。":
    "Tell us what you have. Find out what you can make.",
  "输入食材，按回车添加，如：鸡蛋、番茄":
    "Add ingredients, e.g. eggs, tomatoes. Press Enter.",
  添加: "Add",
  还可以补充: "Allow up to",
  样食材: "extra ingredients",
  看看能做什么: "Find recipes",
  "盐、油、水等基础调味料不计入补充数量":
    "Salt, oil and water do not count as extra ingredients.",
  为你推荐: "Picked for you",
  "从家常味道开始，找到你的拿手菜。":
    "Find a new favourite, starting with the everyday.",
  "搜索食谱、食材…": "Search recipes or ingredients…",
  地域菜系: "Cuisine",
  主要食材分类: "Main ingredient category",
  主要食材: "Main ingredient",
  全部: "All",
  川菜: "Sichuan",
  粤菜: "Cantonese",
  湘菜: "Hunan",
  鲁菜: "Shandong",
  苏菜: "Jiangsu",
  浙菜: "Zhejiang",
  闽菜: "Fujian",
  徽菜: "Anhui",
  家常菜: "Home cooking",
  意大利菜: "Italian",
  猪肉: "Pork",
  牛肉: "Beef",
  鸡肉: "Chicken",
  鱼虾: "Fish & seafood",
  蛋类: "Eggs",
  蔬菜: "Vegetables",
  面食: "Noodles & pasta",
  推荐排序: "Recommended",
  用时最短: "Quickest first",
  分钟: "min",
  我的原创: "My creation",
  还没有找到合适的食谱: "No recipes found yet",
  "试试调整筛选条件，或创建一道自己的菜。":
    "Try adjusting your filters, or add a recipe of your own.",
  "收藏味道，也收藏生活。": "Good food. Memories worth keeping.",
  记录一道你的拿手菜: "Save your signature dish",
  食谱名称: "Recipe name",
  "比如：妈妈的红烧肉": "e.g. Mum’s braised pork",
  "用时（分钟）": "Time (minutes)",
  食材清单: "Ingredients",
  "每行一种食材，例如：\n猪肉 500克\n生姜 3片":
    "One ingredient per line, e.g.\nPork 500g\nGinger 3 slices",
  制作步骤: "Method",
  "每行一个步骤，写下你的独家做法…":
    "One step per line. Share your own way of making it…",
  小贴士: "Tips",
  "火候、调味，或这道菜背后的故事":
    "Cooking tips, seasoning, or the story behind this dish",
  "食谱保存在当前浏览器，可导出备份到本地。":
    "Recipes are saved in this browser. Export a local backup anytime.",
  保存到我的食谱: "Save to my recipes",
  准备食材: "Ingredients",
  开始制作: "Method",
  厨房小贴士: "Kitchen notes",
  导出这道食谱: "Export this recipe",
  删除食谱: "Delete recipe",
  "个人食谱 · 保存在此浏览器": "Personal recipe · Saved in this browser",
  "内置示例食谱 · 图片为示意配图": "Sample recipe · Photo is illustrative",
  "让剩余食材，好好上桌。": "Make the most of what you have.",
  食材灵感: "Ingredient inspiration",
  "把喜欢的味道，留在这里。": "Keep your favourite flavours here.",
  "你创建和收藏的每一道菜，都在这里。":
    "All the recipes you create and save, in one place.",
  "根据已有食材与允许补充的数量，寻找适合的一餐。":
    "Recipes that fit your ingredients and extra-ingredient allowance.",
  番茄炒鸡蛋: "Tomato & egg stir-fry",
  家常红烧肉: "Homestyle braised pork",
  番茄罗勒意大利面: "Tomato & basil pasta",
  清蒸鲈鱼: "Steamed sea bass",
  蒜蓉西兰花: "Garlic broccoli",
  青椒炒肉丝: "Pork & green pepper stir-fry",
  番茄: "Tomato",
  鸡蛋: "Egg",
  小葱: "Spring onion",
  生姜: "Ginger",
  冰糖: "Rock sugar",
  生抽: "Light soy sauce",
  老抽: "Dark soy sauce",
  意大利面: "Pasta",
  大蒜: "Garlic",
  罗勒: "Basil",
  鲈鱼: "Sea bass",
  西兰花: "Broccoli",
  青椒: "Green pepper",
  黄瓜: "Cucumber",
  "番茄切块，小葱切末，鸡蛋打散。":
    "Chop the tomatoes and spring onion. Beat the eggs.",
  "热锅放油，倒入蛋液炒至凝固后盛出。":
    "Heat oil in a pan. Scramble the eggs until set, then remove.",
  "放入番茄炒软，加入鸡蛋翻炒，用盐调味，撒葱花出锅。":
    "Cook the tomatoes until soft. Return the eggs, season with salt and finish with spring onion.",
  "番茄炒出汁再加入鸡蛋，味道更浓郁。":
    "Let the tomatoes release their juices before adding the eggs.",
  "五花肉切块，冷水下锅焯水后沥干。":
    "Cut the pork belly into cubes. Blanch from cold water and drain.",
  "炒化冰糖，加入肉块翻炒上色。":
    "Melt the rock sugar in the pan. Add the pork and stir to coat.",
  "加入生姜、生抽、老抽和热水，小火炖45分钟后收汁。":
    "Add ginger, both soy sauces and hot water. Simmer for 45 minutes, then reduce the sauce.",
  "选肥瘦相间的五花肉。":
    "Choose pork belly with an even balance of fat and lean meat.",
  "意大利面按包装时间煮熟，保留一杯面汤。":
    "Cook the pasta according to the package. Reserve a cup of pasta water.",
  "大蒜切碎炒香，加入切块番茄炖出汁。":
    "Sauté chopped garlic, then add chopped tomatoes and simmer into a sauce.",
  "加入面条、少许面汤翻拌，撒罗勒后调味。":
    "Toss in the pasta with a splash of pasta water. Add basil and season.",
  "面条保留一点硬芯，口感更好。":
    "Cook the pasta al dente for the best texture.",
  "鲈鱼处理干净，两面划刀，铺姜片。":
    "Clean and score the sea bass on both sides, then add sliced ginger.",
  "水开后上锅蒸8至12分钟，按鱼的大小调整，确保鱼肉熟透。":
    "Steam over boiling water for 8–12 minutes, adjusting for the size of the fish until fully cooked.",
  "倒掉蒸出的水，铺葱丝，淋热油和生抽。":
    "Discard the cooking liquid. Add shredded spring onion, then pour over hot oil and light soy sauce.",
  "蒸好后及时取出。": "Remove from the steamer as soon as it is done.",
  "西兰花切小朵洗净，大蒜切末。":
    "Wash and cut the broccoli into florets. Mince the garlic.",
  "沸水中加入少许盐，西兰花焯水后沥干。":
    "Blanch the broccoli in lightly salted boiling water, then drain.",
  "炒香蒜末，加入西兰花翻炒，用盐调味。":
    "Sauté the garlic, add the broccoli and stir-fry. Season with salt.",
  "焯水时间不要过长，保留爽脆口感。":
    "Keep the blanching time short so the broccoli stays crisp.",
  "猪肉切丝，用生抽和少许油拌匀。":
    "Slice the pork into strips and mix with light soy sauce and a little oil.",
  "青椒切丝，大蒜切片。":
    "Slice the peppers into strips and thinly slice the garlic.",
  "热锅炒熟肉丝，加入青椒与大蒜翻炒至熟，调味后出锅。":
    "Stir-fry the pork until cooked, then add peppers and garlic. Cook through and season.",
  "大火快炒更香。": "Use high heat and keep the ingredients moving.",
  先添加至少一种食材: "Add at least one ingredient first",
  先创建或收藏一道食谱: "Create or save a recipe first",
  已保存到我的食谱: "Saved to my recipes",
  "请填写名称、食材和步骤": "Please enter a name, ingredients and method",
  "浏览器存储不可用，请及时导出备份":
    "Browser storage is unavailable. Please export a backup.",
  "文件过大，请选择小于5MB的JSON": "Choose a JSON file smaller than 5 MB",
  没有找到食谱数组: "No recipe array found",
  "每道食谱需要名称、用时、食材和步骤":
    "Each recipe needs a name, time, ingredients and steps",
  "确定删除这道个人食谱？建议先导出备份。":
    "Delete this personal recipe? Export a backup first if you want to keep it.",
  关闭: "Close",
  取消收藏: "Unsave",
  收藏: "Save",
  移除: "Remove ",
  查看: "View ",
  食谱配图: "illustrative recipe photo",
  补充: "Add",
  现有食材就能做: "Ready with what you have",
  已按现有食材匹配: "matched to your ingredients",
  "导入失败：": "Import failed: ",
};
Object.entries(catalogTranslations).forEach(([zh, en]) => {
  if (!words[zh]) words[zh] = en;
});
Object.assign(words, {
  菠菜: "Spinach",
  黑胡椒: "Black pepper",
  白胡椒: "White pepper",
  香菜: "Coriander",
  牛至叶: "Oregano",
  欧芹: "Parsley",
  米饭: "Rice dishes",
  豆制品: "Tofu & soy",
  "本地食谱库 · 暂无实拍": "Local recipe library · No photo yet",
});
Object.assign(words, plannerTranslations);
const dictionary = Object.entries(words).sort(
  (a, b) => b[0].length - a[0].length,
);
function english(text) {
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
const originals = new WeakMap(),
  attrs = new WeakMap();
function localize() {
  observer.disconnect();
  document.documentElement.lang = language === "en" ? "en" : "zh-CN";
  document.title =
    language === "en" ? "Shiguang · My Recipe Journal" : "食光 · 我的私人食谱";
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    if (node.parentElement.closest("script,style,textarea,[data-no-i18n]"))
      continue;
    const previous = originals.get(node);
    let source =
      previous && node.nodeValue === previous.output
        ? previous.source
        : node.nodeValue;
    const output = language === "en" ? english(source) : source;
    originals.set(node, { source, output });
    if (node.nodeValue !== output) node.nodeValue = output;
  }
  for (const el of document.querySelectorAll(
    "[placeholder],[aria-label],[alt]",
  )) {
    let records = attrs.get(el) || {};
    for (const key of ["placeholder", "aria-label", "alt"]) {
      if (!el.hasAttribute(key)) continue;
      const current = el.getAttribute(key),
        prev = records[key],
        source = prev && current === prev.output ? prev.source : current,
        output = language === "en" ? english(source) : source;
      records[key] = { source, output };
      if (current !== output) el.setAttribute(key, output);
    }
    attrs.set(el, records);
  }
  langBtn.textContent = language === "en" ? "中文 / EN" : "中文 / English";
  langBtn.setAttribute(
    "aria-label",
    language === "en" ? "Switch to Chinese" : "切换到英文",
  );
  langBtn.setAttribute("aria-pressed", String(language === "en"));
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ["placeholder", "aria-label", "alt"],
  });
}
const langBtn = document.createElement("button");
langBtn.id = "languageToggle";
langBtn.className = "language-toggle";
langBtn.dataset.noI18n = "";
$(".header-actions").prepend(langBtn);
const observer = new MutationObserver(localize);
langBtn.onclick = () => {
  language = language === "en" ? "zh" : "en";
  try {
    localStorage.setItem("shiguang-language", JSON.stringify(language));
  } catch {}
  localize();
};

const originalConfirm = window.confirm.bind(window);
window.confirm = (message) =>
  originalConfirm(language === "en" ? english(message) : message);
localize();
export { english, localize };
