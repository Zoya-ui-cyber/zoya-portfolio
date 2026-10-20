import { safeImage } from './meal-state.js';

// A cooking session owns snapshots: later recipe edits must not change this meal.
export function beginCooking({recipes,plan,prices,items,journey={},now=new Date().toISOString()}) {
  if (!recipes.length || new Set(recipes.map(r=>r.id)).size!==recipes.length) throw Error('EMPTY_MEAL');
  return structuredClone({...journey,id:journey.id||crypto.randomUUID(),groceriesAt:now,cookingAt:now,
    recipes,plan,prices,items,order:recipes.map(r=>r.id),activeId:recipes[0].id,servedAt:{},photos:{}});
}
export function normalizeCooking(value) {
  if (!value || typeof value!=='object') return null;
  if (typeof value.recordId==='string') return {recordId:value.recordId};
  if (!Array.isArray(value.recipes)||!value.recipes.length||typeof value.id!=='string')return null;
  const recipes=value.recipes.filter(r=>r&&typeof r.id==='string'&&typeof r.title==='string'&&Array.isArray(r.steps)&&r.steps.every(s=>typeof s==='string')&&Array.isArray(r.ingredients)&&r.ingredients.every(s=>typeof s==='string'));
  if(recipes.length!==value.recipes.length||new Set(recipes.map(r=>r.id)).size!==recipes.length)return null;
  const ids=recipes.map(r=>r.id),servedAt={},photos={};
  for(const id of ids){if(typeof value.servedAt?.[id]==='string')servedAt[id]=value.servedAt[id];const image=safeImage(value.photos?.[id]);if(image)photos[id]=image;}
  const order=[...new Set([...(Array.isArray(value.order)?value.order:[]),...ids])].filter(id=>ids.includes(id));
  return {...value,recipes,order:[...order.filter(id=>!servedAt[id]),...order.filter(id=>servedAt[id])],activeId:ids.includes(value.activeId)?value.activeId:order[0],servedAt,photos};
}
export function moveTicket(session,id,direction){
  if(![-1,1].includes(direction)||session.servedAt[id])return session;
  const pending=session.order.filter(key=>!session.servedAt[key]),index=pending.indexOf(id),next=index+direction;
  if(index<0||next<0||next>=pending.length)return session;
  [pending[index],pending[next]]=[pending[next],pending[index]];
  return {...session,order:[...pending,...session.order.filter(key=>session.servedAt[key])]};
}
export function placeTicket(session,id,targetId){
  if(id===targetId||session.servedAt[id]||session.servedAt[targetId])return session;
  const order=[...session.order],from=order.indexOf(id),to=order.indexOf(targetId);
  if(from<0||to<0)return session;
  order.splice(from,1);order.splice(to,0,id);return {...session,order};
}
export function serveTicket(session,id,now=new Date().toISOString()){
  if(!session.order.includes(id)||session.servedAt[id])return session;
  const servedAt={...session.servedAt,[id]:now};
  const order=[...session.order.filter(key=>!servedAt[key]),...session.order.filter(key=>servedAt[key]&&key!==id),id];
  return {...session,order,servedAt,activeId:order.find(key=>!servedAt[key])||id};
}
export function allServed(session){return !!session?.recipes?.length&&session.recipes.every(r=>!!session.servedAt?.[r.id]);}
export function finishCooking(session,now=new Date().toISOString()){
  if(!allServed(session))throw Error('UNFINISHED_MEAL');
  const costs={};for(const r of session.recipes){const p=session.prices?.[r.id];if(p&&['CNY','GBP'].includes(p.currency)&&Number.isFinite(p.value))costs[p.currency]=(costs[p.currency]||0)+p.value*(session.plan[r.id]||1);}
  return structuredClone({...session,completedAt:now,costs,completionVersion:6});
}
