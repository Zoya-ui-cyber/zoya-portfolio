import { language } from './language.js';
const dialog=document.createElement('dialog');dialog.id='mailbox-dialog';dialog.dataset.noTranslate='';dialog.setAttribute('aria-labelledby','mailbox-title');document.body.append(dialog);
function render(){
 const en=language==='en';dialog.replaceChildren();
 const close=document.createElement('button');close.className='mailbox-close';close.textContent='×';close.setAttribute('aria-label',en?'Close mailbox':'关闭邮箱');close.onclick=()=>dialog.close();
 const eyebrow=document.createElement('p');eyebrow.className='eyebrow';eyebrow.textContent='LET’S KEEP IN TOUCH';
 const title=document.createElement('h2');title.id='mailbox-title';title.textContent=en?'My mailbox':'我的邮箱';dialog.append(close,eyebrow,title);
 const status=document.createElement('p');status.className='mailbox-status';status.setAttribute('role','status');
 for(const [zh,english,email] of [['个人邮箱','Personal email','yinzhengjie945@outlook.com'],['学生邮箱','Student email','s3016785@ed.ac.uk']]){
  const row=document.createElement('section');row.className='mailbox-row';const label=document.createElement('h3');label.textContent=en?english:zh;
  const address=document.createElement('p');address.className='mailbox-address';address.textContent=email;
  const actions=document.createElement('div');const copy=document.createElement('button');copy.textContent=en?'Copy address':'复制地址';copy.onclick=async()=>{try{await navigator.clipboard.writeText(email);status.textContent=language==='en'?'Email address copied.':'邮箱地址已复制。';}catch{const selection=getSelection(),range=document.createRange();range.selectNodeContents(address);selection.removeAllRanges();selection.addRange(range);status.textContent=language==='en'?'Address selected. Press Ctrl+C or copy manually.':'地址已选中，请按 Ctrl+C 或手动复制。';}};
  const send=document.createElement('a');send.href='mailto:'+email;send.textContent=en?'Send email ↗':'发送邮件 ↗';actions.append(copy,send);row.append(label,address,actions);dialog.append(row);
 }dialog.append(status);
}
export function openMailbox(){render();dialog.showModal();}
window.addEventListener('house-language-change',()=>{if(dialog.open)render()});
dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()});
// A keyboard and touch entry remains available without aiming at the 3D model.
const entry=document.createElement('button');entry.id='mailbox-open';entry.textContent='邮箱';entry.onclick=openMailbox;document.querySelector('header nav').insertBefore(entry,document.querySelector('#language-toggle'));
