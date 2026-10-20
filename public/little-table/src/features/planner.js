import { read, write } from "../core/storage.js";
import { buildShoppingList, groups, mapsSearchUrl } from "../core/shopping.js";
import { kitchen } from "../data/kitchen.js";
import { english } from "../i18n/index.js";

const escape = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
let plan = read("shiguang-meal-plan", {});
if (
  plan.date !== today() ||
  !plan.selected ||
  typeof plan.selected !== "object"
)
  plan = { date: today(), selected: {}, checked: {} };
if (!plan.checked || typeof plan.checked !== "object") plan.checked = {};
let context,
  view = "today",
  search = "",
  pendingOnly = false;
const root = () => document.querySelector("#plannerArea");
const entries = () =>
  context.getRecipes().filter((r) => Number(plan.selected[r.id]) > 0);
const items = () =>
  buildShoppingList(context.getRecipes(), plan.selected, kitchen);
function save() {
  if (!write("shiguang-meal-plan", plan))
    context.toast("浏览器存储不可用，请及时导出备份");
}
function checkDate() {
  if (plan.date !== today())
    plan = { date: today(), selected: {}, checked: {} };
}
export function addToToday(id) {
  checkDate();
  if (!context.getRecipes().some((r) => r.id === id)) return;
  plan.selected[id] = plan.selected[id] || 1;
  save();
  context.toast("已加入今日菜单");
  if (["today", "shopping"].includes(context.currentView()))
    renderPlanner(context.currentView());
}
function selectedMarkup() {
  return entries()
    .map(
      (r) =>
        `<div class="planned-dish"><span class="planned-emoji" aria-hidden="true">${r.emoji || "🍲"}</span><div><button class="dish-name" data-detail="${escape(r.id)}">${escape(r.title)}</button><small>${r.servings || 2} 人份 · ${r.time} 分钟</small></div><label class="scale-label"><span>份量倍数</span><select aria-label="${escape(r.title)} 份量倍数" data-scale="${escape(r.id)}">${[0.5, 1, 1.5, 2, 3, 4].map((n) => `<option value="${n}" ${Number(plan.selected[r.id]) === n ? "selected" : ""}>× ${n}</option>`).join("")}</select></label><button class="remove-dish" data-remove="${escape(r.id)}" aria-label="移除${escape(r.title)}">×</button></div>`,
    )
    .join("");
}
function selectionMarkup() {
  return `<div class="picker-head"><div><span class="mini-label">MAKE IT YOURS</span><h2>挑选今天想吃的菜</h2></div><input id="planSearch" placeholder="搜索菜名或食材" value="${escape(search)}"></div><div id="planChoices" class="plan-choices"></div>`;
}
function renderChoices() {
  const q = search.trim().toLowerCase();
  const recipes = context
    .getRecipes()
    .filter(
      (r) =>
        !q ||
        [
          r.title,
          ...r.ingredients,
          english(r.title),
          english(r.ingredients.join(" ")),
        ]
          .join(" ")
          .toLowerCase()
          .includes(q),
    );
  document.querySelector("#planChoices").innerHTML =
    recipes
      .map(
        (r) =>
          `<button class="plan-choice ${plan.selected[r.id] ? "chosen" : ""}" data-toggle="${escape(r.id)}" aria-pressed="${!!plan.selected[r.id]}"><span class="choice-emoji" aria-hidden="true">${r.emoji || "🍲"}</span><span class="choice-body"><b>${escape(r.title)}</b><small>${escape(r.cuisine)} · ${r.time} 分钟</small></span><span class="choice-plus">${plan.selected[r.id] ? "✓" : "＋"}</span></button>`,
      )
      .join("") ||
    '<p class="planner-empty">没有找到食谱，换个关键词试试。</p>';
}
function checklistMarkup() {
  const list = items(),
    checked = list.filter((i) => plan.checked[i.id] === i.signature).length;
  return `<div class="shopping-heading"><div><span class="mini-label">READY, SET, SHOP</span><h2>这顿饭，需要准备这些</h2><p>同名食材自动合并，同单位数量相加；不同单位分开显示。</p></div><button class="text-button" data-action="export-list">↧ 导出清单</button></div><div class="check-progress"><div><b>${checked} / ${list.length}</b><span> 已买好或已备齐</span></div><progress max="${Math.max(list.length, 1)}" value="${checked}" aria-label="清单完成进度"></progress><label><input type="checkbox" id="pendingOnly" ${pendingOnly ? "checked" : ""}>只看未完成</label></div>${groups
    .map(([key, label]) => {
      const rows = list.filter(
        (i) =>
          i.group === key &&
          (!pendingOnly || plan.checked[i.id] !== i.signature),
      );
      return `<section class="shopping-group"><h3>${label}<span>${list.filter((i) => i.group === key).length}</span></h3>${rows.map((i) => `<label class="check-row ${plan.checked[i.id] === i.signature ? "checked" : ""}"><input type="checkbox" data-check="${escape(i.id)}" ${plan.checked[i.id] === i.signature ? "checked" : ""}><span class="check-item"><b>${escape(i.name)}</b><small>${i.sources.map((s) => `${escape(s.title)} × ${s.multiplier} · ${escape(s.amount)}`).join(" / ")}</small></span><span class="check-amount">${escape(i.amount)}</span></label>`).join("") || '<p class="group-empty">这一组已备齐或无需准备</p>'}</section>`;
    })
    .join(
      "",
    )}<p class="planner-note">份量变化后，受影响的项目会取消勾选，请重新核对。锅具只需确认家里已有。</p>`;
}
function mapMarkup() {
  const area = read("shiguang-shopping-area", "");
  return `<section class="market-card"><span class="mini-label">A LITTLE TRIP TO THE MARKET</span><h2>去附近，买点新鲜的。</h2><p>打开地图查找店铺，选好地点后即可导航。</p><label>城市或街区（可选）<input id="marketArea" maxlength="150" placeholder="留空搜索附近，或输入城市/街区" value="${escape(typeof area === "string" ? area : "")}"></label><div class="market-links"><a id="supermarketLink" target="_blank" rel="noopener noreferrer" href="${escape(mapsSearchUrl("supermarket", typeof area === "string" ? area : ""))}">附近超市 ↗</a><a id="marketLink" target="_blank" rel="noopener noreferrer" href="${escape(mapsSearchUrl("market", typeof area === "string" ? area : ""))}">附近菜市场 ↗</a></div><small>附近结果取决于地图网站的定位；也可填写城市或街区。</small></section>`;
}
export function renderPlanner(nextView = view) {
  if (!context) return;
  checkDate();
  view = nextView;
  const recipes = context.getRecipes();
  for (const id of Object.keys(plan.selected))
    if (!recipes.some((r) => r.id === id)) delete plan.selected[id];
  const selected = entries();
  root().innerHTML = `<section class="meal-intro"><div><span class="mini-label">${view === "today" ? "A GOOD DAY STARTS WITH GOOD FOOD" : "FROM YOUR MENU TO YOUR BASKET"}</span><h2>${view === "today" ? "今天吃什么，交给一点灵感。" : "菜单选好了，买菜就简单了。"}</h2><p>${view === "today" ? "自己挑几道喜欢的，或让我帮你搭配一餐。" : "选菜、核对份量，再把需要准备的东西逐项勾掉。"}</p></div><span class="plan-date" data-no-i18n>${plan.date}</span></section>${view === "today" ? `<div class="suggestion-controls"><label>推荐几道 <select id="suggestCount"><option value="1">1</option><option value="2" selected>2</option><option value="3">3</option><option value="4">4</option></select></label><button class="primary" data-action="suggest">✳ 给我一点灵感</button><span>推荐会补充到今日菜单，可随时移除。</span></div>` : ""}<div class="planner-layout"><div class="meal-column"><section class="planner-panel"><div class="panel-heading"><h2>今日菜单 <span>${selected.length}</span></h2><button class="text-button" data-action="clear-plan" ${selected.length ? "" : "disabled"}>清空菜单</button></div>${selectedMarkup() || '<div class="planner-empty">今天的菜单还是空的<p>从下方挑选你想吃的菜，清单会自动生成。</p></div>'}${view === "today" ? `<button class="primary go-shopping" data-action="go-shopping">查看买菜清单 →</button>` : ""}</section><section class="planner-panel recipe-picker">${selectionMarkup()}</section></div><div class="list-column">${view === "shopping" ? `<section class="planner-panel checklist-panel">${selected.length ? checklistMarkup() : '<div class="planner-empty">先挑一道想吃的菜吧<p>所需食材、酱料、配料和锅具会出现在这里。</p></div>'}</section>${mapMarkup()}` : `<section class="plan-summary"><span>✳</span><h2>从一顿饭，到一个清单。</h2><p>所有选中的菜都会一起整理。</p><ul><li>食材与份量自动汇总</li><li>调味料和锅具不遗漏</li><li>买好一项，就勾选一项</li></ul><button class="primary" data-action="go-shopping">去准备这顿饭 →</button></section>`}</div></div>`;
  renderChoices();
}
function exportList() {
  const en = document.documentElement.lang === "en";
  const translate = (text) => (en ? english(text) : text);
  const lines = [
    `${translate("今日菜单")} · ${plan.date}`,
    ...entries().map((r) => `${translate(r.title)} × ${plan.selected[r.id]}`),
    "",
  ];
  const list = items();
  for (const [group, label] of groups) {
    lines.push(translate(label));
    for (const i of list.filter((x) => x.group === group))
      lines.push(
        `${plan.checked[i.id] === i.signature ? "[x]" : "[ ]"} ${translate(i.name)} — ${translate(i.amount)}`,
      );
    lines.push("");
  }
  const url = URL.createObjectURL(
    new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = `shopping-${plan.date}.txt`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function initPlanner(options) {
  context = options;
  root().addEventListener("click", (e) => {
    const add = e.target.closest("[data-toggle]");
    if (add) {
      const id = add.dataset.toggle;
      if (plan.selected[id]) delete plan.selected[id];
      else plan.selected[id] = 1;
      save();
      renderPlanner();
      return;
    }
    const remove = e.target.closest("[data-remove]");
    if (remove) {
      delete plan.selected[remove.dataset.remove];
      save();
      renderPlanner();
      return;
    }
    const detail = e.target.closest("[data-detail]");
    if (detail) {
      context.showDetail(detail.dataset.detail);
      return;
    }
    const action = e.target.closest("[data-action]")?.dataset.action;
    if (action === "go-shopping") context.navigate("shopping");
    if (action === "clear-plan") {
      plan.selected = {};
      plan.checked = {};
      save();
      renderPlanner();
    }
    if (action === "export-list") exportList();
    if (action === "suggest") {
      const count = Number(document.querySelector("#suggestCount").value);
      const pool = context.getRecipes().filter((r) => !plan.selected[r.id]);
      const veggies = pool.filter((r) => r.category === "蔬菜");
      let chosen = [];
      if (count > 1 && veggies.length)
        chosen.push(veggies[Math.floor(Math.random() * veggies.length)]);
      while (chosen.length < count && chosen.length < pool.length) {
        const candidates = pool.filter((r) => !chosen.includes(r));
        chosen.push(candidates[Math.floor(Math.random() * candidates.length)]);
      }
      for (const r of chosen) plan.selected[r.id] = 1;
      save();
      renderPlanner();
      context.toast(chosen.length ? "已加入今日菜单" : "所有食谱都已在菜单里");
    }
  });
  root().addEventListener("change", (e) => {
    const scale = e.target.dataset.scale;
    if (scale) {
      plan.selected[scale] = Number(e.target.value);
      save();
      renderPlanner();
      return;
    }
    if (e.target.dataset.check) {
      const item = items().find((i) => i.id === e.target.dataset.check);
      if (item) {
        if (e.target.checked) plan.checked[item.id] = item.signature;
        else delete plan.checked[item.id];
        save();
        renderPlanner();
      }
      return;
    }
    if (e.target.id === "pendingOnly") {
      pendingOnly = e.target.checked;
      renderPlanner();
    }
  });
  root().addEventListener("input", (e) => {
    if (e.target.id === "planSearch") {
      search = e.target.value;
      renderChoices();
    }
    if (e.target.id === "marketArea") {
      const area = e.target.value;
      write("shiguang-shopping-area", area);
      document.querySelector("#supermarketLink").href = mapsSearchUrl(
        "supermarket",
        area,
      );
      document.querySelector("#marketLink").href = mapsSearchUrl(
        "market",
        area,
      );
    }
  });
}
