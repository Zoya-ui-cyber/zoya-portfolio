import { seeds } from "./data/recipes/index.js";
import { cuisines, categories } from "./data/taxonomy.js";
import { read } from "./core/storage.js";
import { norm, ingredientName, matchesCategory } from "./core/ingredients.js";
import { english } from "./i18n/index.js";
import { initPlanner, renderPlanner, addToToday } from "./features/planner.js";
import {
  preparationMarkup,
  editorPreparation,
} from "./features/preparation.js";
const $ = (s) => document.querySelector(s);
let storageOK = true;
let custom = read("shiguang-recipes", []),
  saved = read("shiguang-saved", []);
if (!Array.isArray(custom)) custom = [];
if (!Array.isArray(saved)) saved = [];
let state = {
  view: "library",
  cuisine: "全部",
  category: "全部",
  ingredients: [],
  matching: false,
};
function persist() {
  try {
    localStorage.setItem("shiguang-recipes", JSON.stringify(custom));
    localStorage.setItem("shiguang-saved", JSON.stringify(saved));
    return true;
  } catch {
    storageOK = false;
    toast("浏览器存储不可用，请及时导出备份");
    return false;
  }
}
// Add shared recipes once; respect any later decision to unsave them.
if (!read("shiguang-reference-import-v1", false)) {
  saved = [
    ...new Set([...saved, ...seeds.filter((r) => r.featured).map((r) => r.id)]),
  ];
  if (persist()) {
    try {
      localStorage.setItem("shiguang-reference-import-v1", "true");
    } catch {}
  }
}
if (!read("shiguang-ribs-import-v1", false)) {
  saved = [...new Set([...saved, "fav-sweet-sour-ribs"])];
  if (persist()) {
    try {
      localStorage.setItem("shiguang-ribs-import-v1", "true");
    } catch {}
  }
}
function esc(s) {
  return String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
}
function toast(s) {
  $("#toast").textContent = s;
  $("#toast").style.display = "block";
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(
    () => ($("#toast").style.display = "none"),
    2800,
  );
}
function missing(r) {
  return [...new Set(r.ingredients.map(ingredientName))].filter(
    (x) =>
      !["盐", "油", "水", "食用油"].includes(x) &&
      !state.ingredients.map(norm).includes(norm(x)),
  );
}
function all() {
  return [...custom, ...seeds];
}
function filters() {
  const base = all().filter(
    (r) => state.view !== "mine" || r.custom || saved.includes(r.id),
  );
  for (const [id, list, key] of [
    ["cuisines", cuisines, "cuisine"],
    ["categories", categories, "category"],
  ]) {
    $("#" + id).innerHTML = list
      .map((x) => {
        const n = base.filter((r) =>
          key === "cuisine"
            ? x === "全部" || r.cuisine === x
            : (state.cuisine === "全部" || r.cuisine === state.cuisine) &&
              matchesCategory(r, x),
        ).length;
        if (state.view === "mine" && n === 0 && x !== "全部") return "";
        return `<button class="${state[key] === x ? "active" : ""}" data-value="${x}" ${key === "category" && n === 0 && x !== "全部" ? "disabled" : ""}><span>${x}</span><small>${n}</small></button>`;
      })
      .join("");
    $("#" + id).onclick = (e) => {
      const b = e.target.closest("button");
      if (!b || b.disabled) return;
      state[key] = b.dataset.value;
      if (
        key === "cuisine" &&
        !base.some(
          (r) =>
            (state.cuisine === "全部" || r.cuisine === state.cuisine) &&
            matchesCategory(r, state.category),
        )
      )
        state.category = "全部";
      filters();
      render();
    };
  }
}
function cover(r) {
  return r.image
    ? `<img class="reference-photo ${r.imagePosition === "bottom" ? "collage-photo" : ""}" style="object-position:left ${r.imagePosition === "bottom" ? "bottom" : "center"}" src="${esc(r.image)}" alt="${esc(r.title)}" loading="lazy">`
    : `<div class="recipe-cover tone-${esc(r.category)}"><span class="cover-kicker">RECIPE JOURNAL</span><span class="cover-emoji" aria-hidden="true">${r.emoji || "🍲"}</span><span class="cover-name">${esc(r.title)}</span><small>暂无实拍</small></div>`;
}
function render() {
  let rows = all();
  if (state.view === "mine")
    rows = rows.filter((r) => r.custom || saved.includes(r.id));
  const query = $("#search").value.trim().toLowerCase();
  rows = rows.filter(
    (r) =>
      (state.cuisine === "全部" || r.cuisine === state.cuisine) &&
      matchesCategory(r, state.category) &&
      (!query ||
        (
          [r.title, ...r.ingredients, r.cuisine].join(" ") +
          " " +
          (typeof english === "function"
            ? english([r.title, ...r.ingredients, r.cuisine].join(" "))
            : "")
        )
          .toLowerCase()
          .includes(query)),
  );
  if (state.matching) {
    rows = rows.filter(
      (r) =>
        missing(r).length <= Number($("#extraCount").value) &&
        missing(r).length < r.ingredients.length,
    );
    rows.sort((a, b) => missing(a).length - missing(b).length);
  }
  if ($("#sort").value === "time") rows.sort((a, b) => a.time - b.time);
  $("#count").textContent =
    `共 ${rows.length} 道食谱${state.matching ? " · 已按现有食材匹配" : ""}`;
  $("#empty").hidden = rows.length > 0;
  $("#grid").innerHTML = rows
    .map(
      (r) =>
        `<article class="card" tabindex="0" role="button" aria-label="查看${esc(r.title)}" data-id="${esc(r.id)}"><div class="food-image">${cover(r)}<span class="badge">${esc(r.cuisine)}</span>${r.featured ? '<span class="reference-label">你的收藏灵感</span>' : ""}<button class="save ${saved.includes(r.id) ? "saved" : ""}" aria-label="${saved.includes(r.id) ? "取消收藏" : "收藏"}" data-save="${esc(r.id)}">${saved.includes(r.id) ? "♥" : "♡"}</button></div><div class="card-content"><h3 ${r.custom ? "data-no-i18n" : ""}>${esc(r.title)}</h3><p>${r.ingredients.map(ingredientName).map(esc).join(" / ")}</p><div class="card-bottom"><span>◷ ${r.time} 分钟</span><span class="pill">${r.custom ? "我的原创" : esc(r.category)}</span></div>${state.matching ? `<div class="match-note">${missing(r).length ? "补充 " + missing(r).map(esc).join("、") : "✓ 现有食材就能做"}</div>` : ""}</div></article>`,
    )
    .join("");
  document.querySelectorAll(".food-image img").forEach(
    (img) =>
      (img.onerror = () => {
        img.replaceWith(
          Object.assign(document.createElement("div"), {
            className: "food-placeholder",
            textContent: "📖",
          }),
        );
      }),
  );
}
$("#grid").onclick = (e) => {
  const save = e.target.closest("[data-save]");
  if (save) {
    const id = save.dataset.save;
    saved = saved.includes(id) ? saved.filter((x) => x !== id) : [...saved, id];
    persist();
    render();
    filters();
    return;
  }
  const card = e.target.closest("[data-id]");
  if (card) showDetail(card.dataset.id);
};
$("#grid").onkeydown = (e) => {
  if (
    (e.key === "Enter" || e.key === " ") &&
    e.target.classList.contains("card")
  ) {
    e.preventDefault();
    showDetail(e.target.dataset.id);
  }
};
function showDetail(id) {
  const r = all().find((r) => r.id === id);
  if (!r) return;
  $("#detailBody").innerHTML =
    `<div class="modal-top"><span class="mini-label">${esc(r.cuisine)} · ${r.time} 分钟</span><button class="close" data-close="detail" aria-label="关闭">×</button></div><h2 ${r.custom ? "data-no-i18n" : ""}>${esc(r.title)}</h2>${r.image ? '<div class="food-image detail-photo">' + cover(r) + "</div>" : ""}<p class="recipe-source">${esc(r.source || "精选家常做法，调味可按口味调整")}</p>${preparationMarkup(r, esc)}<h3>开始制作</h3><ol>${r.steps.map((x) => `<li>${esc(x)}</li>`).join("")}</ol>${r.note ? `<h3>厨房小贴士</h3><p>${esc(r.note)}</p>` : ""}<button class="primary" id="planOne">＋ 加入今日菜单</button><button class="text-button" id="detailShopping">买菜清单 →</button><button class="text-button" id="editOne">${r.custom ? "编辑食谱" : "另存为我的版本"}</button><button class="primary" id="exportOne">↧ 导出这道食谱</button>${r.custom ? '<button id="deleteRecipe" class="text-button">删除食谱</button>' : ""}<p class="local-hint">${r.custom ? "个人食谱 · 保存在此浏览器" : r.image ? "图片来自你提供的食谱截图" : "本地食谱库 · 暂无实拍"}</p>`;
  $("#planOne").onclick = () => addToToday(r.id);
  $("#detailShopping").onclick = () => {
    addToToday(r.id);
    $("#detail").close();
    setView("shopping");
  };
  $("#editOne").onclick = () => {
    $("#detail").close();
    openEditor(r);
  };
  $("#exportOne").onclick = () => download([r], r.title);
  if (r.custom)
    $("#deleteRecipe").onclick = () => {
      if (confirm("确定删除这道个人食谱？建议先导出备份。")) {
        custom = custom.filter((x) => x.id !== id);
        saved = saved.filter((x) => x !== id);
        persist();
        $("#detail").close();
        if (["today", "shopping"].includes(state.view))
          renderPlanner(state.view);
        else {
          render();
          filters();
        }
      }
    };
  $("#detail").showModal();
}
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-close]");
  if (b) $("#" + b.dataset.close).close();
});
document.querySelectorAll("dialog").forEach((d) =>
  d.addEventListener("click", (e) => {
    if (
      e.target === d &&
      e.offsetX >= 0 &&
      e.offsetY >= 0 &&
      (e.offsetX > d.clientWidth || e.offsetY > d.clientHeight)
    )
      d.close();
  }),
);
function setView(view) {
  const isPlanner = ["today", "shopping"].includes(view);
  $("#libraryArea").hidden = isPlanner;
  $("#plannerArea").hidden = !isPlanner;
  if (isPlanner) {
    state.view = view;
    document
      .querySelectorAll("nav button")
      .forEach((b) => b.classList.toggle("active", b.dataset.view === view));
    $("#crumb").textContent = view === "today" ? "今天吃什么" : "买菜清单";
    $("#pageTitle").textContent =
      view === "today" ? "今天吃什么？" : "带上清单，去买菜。";
    $("#pageDesc").textContent =
      view === "today"
        ? "从灵感到菜单，再到买菜，一次安排好。"
        : "核对今天的菜单，带着清单去买菜。";
    renderPlanner(view);
    return;
  }
  state.view = view;
  $("#pageDesc").textContent =
    view === "mine"
      ? "你创建和收藏的每一道菜，都在这里。"
      : "从日常食材里，发现下一道喜欢的味道。";
  state.matching = false;
  state.cuisine = "全部";
  state.category = "全部";
  $("#search").value = "";
  document
    .querySelectorAll("nav button")
    .forEach((b) => b.classList.toggle("active", b.dataset.view === view));
  const names = {
    library: ["发现食谱", "今天，想吃点什么？", "为你推荐"],
    pantry: ["冰箱里有什么", "让剩余食材，好好上桌。", "食材灵感"],
    mine: ["我的食谱", "把喜欢的味道，留在这里。", "我的食谱"],
  };
  $("#crumb").textContent = names[view][0];
  $("#pageTitle").innerHTML = names[view][1] + "<span>✳</span>";
  $("#sectionTitle").innerHTML =
    names[view][2] + " <span>RECIPES TO LOVE</span>";
  $(".pantry-banner").hidden = view === "mine";
  $(".pantry-banner").style.display = view === "mine" ? "none" : "";
  $("#resultInfo").textContent =
    view === "mine"
      ? "你创建和收藏的每一道菜，都在这里。"
      : "从家常味道开始，找到你的拿手菜。";
  render();
  filters();
  if (view === "pantry") $("#ingredientInput").focus();
}
document
  .querySelectorAll("nav button")
  .forEach((b) => (b.onclick = () => setView(b.dataset.view)));
$("#search").oninput = render;
$("#sort").onchange = render;
$("#extraCount").onchange = () => {
  if (state.matching) render();
};
function addIngredients() {
  const items = $("#ingredientInput")
    .value.split(/[,，、;；\n]/)
    .map((s) => norm(s))
    .filter(Boolean);
  for (const x of items)
    if (!state.ingredients.includes(x)) state.ingredients.push(x);
  $("#ingredientInput").value = "";
  drawChips();
  if (state.matching) render();
}
function drawChips() {
  $("#chips").innerHTML = state.ingredients
    .map(
      (x, i) =>
        `<span class="chip">${esc(x)}<button data-index="${i}" aria-label="移除${esc(x)}">×</button></span>`,
    )
    .join("");
}
$("#addIngredient").onclick = addIngredients;
$("#ingredientInput").onkeydown = (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    addIngredients();
  }
};
$("#chips").onclick = (e) => {
  if (e.target.dataset.index !== undefined) {
    state.ingredients.splice(Number(e.target.dataset.index), 1);
    drawChips();
    if (state.matching) render();
  }
};
$("#matchBtn").onclick = () => {
  addIngredients();
  if (!state.ingredients.length) {
    toast("先添加至少一种食材");
    $("#ingredientInput").focus();
    return;
  }
  if (state.view === "mine") setView("pantry");
  state.matching = true;
  $("#resultInfo").textContent =
    "根据已有食材与允许补充的数量，寻找适合的一餐。";
  render();
};
$("#formCuisine").innerHTML = cuisines
  .slice(1)
  .map((x) => `<option value="${x}">${x}</option>`)
  .join("");
$("#formCategory").innerHTML = categories
  .slice(1)
  .map((x) => `<option value="${x}">${x}</option>`)
  .join("");
let editingId = null;
function openEditor(recipe) {
  const form = $("#recipeForm");
  form.reset();
  editingId = recipe?.custom ? recipe.id : null;
  $("#editor h2").textContent = editingId ? "编辑食谱" : "记录一道你的拿手菜";
  if (recipe) {
    recipe = { ...recipe, ...editorPreparation(recipe) };
    for (const key of [
      "title",
      "cuisine",
      "category",
      "time",
      "servings",
      "note",
      "ingredients",
      "steps",
      "sauces",
      "aromatics",
      "equipment",
    ]) {
      const field = form.elements.namedItem(key);
      if (field) {
        const value = recipe[key];
        field.value = Array.isArray(value)
          ? value.join("\n")
          : (value ?? (key === "servings" ? 2 : ""));
      }
    }
  }
  $("#editor").showModal();
}
$("#createBtn").onclick = () => openEditor();
$("#recipeForm").onsubmit = (e) => {
  e.preventDefault();
  const f = new FormData(e.target),
    r = {
      id: editingId || "local-" + crypto.randomUUID(),
      title: f.get("title").trim(),
      cuisine: f.get("cuisine"),
      category: f.get("category"),
      time: Number(f.get("time")),
      ingredients: f
        .get("ingredients")
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      steps: f
        .get("steps")
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      note: f.get("note").trim(),
      sauces: f
        .get("sauces")
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      aromatics: f
        .get("aromatics")
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      equipment: f
        .get("equipment")
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      servings: Number(f.get("servings")) || 2,
      custom: true,
    };
  if (!r.title || !r.ingredients.length || !r.steps.length) {
    toast("请填写名称、食材和步骤");
    return;
  }
  const existingIndex = custom.findIndex((item) => item.id === r.id);
  if (existingIndex >= 0) custom[existingIndex] = r;
  else custom.unshift(r);
  const ok = persist();
  $("#editor").close();
  e.target.reset();
  state.cuisine = "全部";
  state.category = "全部";
  $("#search").value = "";
  filters();
  setView("mine");
  if (ok) toast("已保存到我的食谱");
};
function download(rows, name = "我的食谱") {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify({ version: 1, recipes: rows }, null, 2)], {
      type: "application/json",
    }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name + ".json";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
const exportBtn = document.createElement("button");
exportBtn.className = "text-button";
exportBtn.textContent = "↧ 导出我的食谱";
$(".header-actions").prepend(exportBtn);
exportBtn.onclick = () => {
  const rows = all().filter((r) => r.custom || saved.includes(r.id));
  if (!rows.length) {
    toast("先创建或收藏一道食谱");
    return;
  }
  download(rows);
};
$("#importBtn").onclick = () => $("#importFile").click();
$("#importFile").onchange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    if (file.size > 5000000) throw Error("文件过大，请选择小于5MB的JSON");
    const data = JSON.parse(await file.text()),
      rows = Array.isArray(data) ? data : data.recipes;
    if (!Array.isArray(rows) || !rows.length) throw Error("没有找到食谱数组");
    const valid = rows.every(
      (r) =>
        r &&
        typeof r.title === "string" &&
        r.title.trim() &&
        Array.isArray(r.ingredients) &&
        r.ingredients.length &&
        r.ingredients.every((x) => typeof x === "string" && x.trim()) &&
        Array.isArray(r.steps) &&
        r.steps.length &&
        r.steps.every((x) => typeof x === "string" && x.trim()) &&
        Number.isFinite(Number(r.time)) &&
        Number(r.time) > 0,
    );
    if (!valid) throw Error("每道食谱需要名称、用时、食材和步骤");
    const incoming = rows.map((r) => ({
      id: "local-" + crypto.randomUUID(),
      title: r.title.trim(),
      time: Number(r.time),
      cuisine: cuisines.includes(r.cuisine) ? r.cuisine : "家常菜",
      category: categories.includes(r.category) ? r.category : "蔬菜",
      ingredients: r.ingredients,
      steps: r.steps,
      note: typeof r.note === "string" ? r.note : "",
      servings: Number(r.servings) > 0 ? Number(r.servings) : 2,
      ...Object.fromEntries(
        ["sauces", "aromatics", "equipment", "basics"].map((k) => [
          k,
          Array.isArray(r[k])
            ? r[k].filter((x) => typeof x === "string" && x.trim())
            : [],
        ]),
      ),
      custom: true,
    }));
    custom.unshift(...incoming);
    const ok = persist();
    state.cuisine = "全部";
    state.category = "全部";
    $("#search").value = "";
    filters();
    setView("mine");
    if (ok) toast(`已导入 ${incoming.length} 道食谱`);
  } catch (err) {
    toast("导入失败：" + err.message);
  }
  e.target.value = "";
};
initPlanner({
  getRecipes: all,
  navigate: setView,
  showDetail,
  toast,
  currentView: () => state.view,
});
filters();
render();
