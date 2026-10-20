export function memberStage(profile,user){
  if(!profile)return null;
  if(profile.status==='rejected'||profile.status==='suspended')return profile.status;
  if(!user?.email_confirmed_at)return 'verify-email';
  return profile.status==='approved'?'approved':'pending';
}
export function mailboxUrl(email){
 const domain=String(email||'').trim().toLowerCase().split('@')[1];
 return ({'gmail.com':'https://mail.google.com/','googlemail.com':'https://mail.google.com/','outlook.com':'https://outlook.live.com/mail/','hotmail.com':'https://outlook.live.com/mail/','live.com':'https://outlook.live.com/mail/','qq.com':'https://mail.qq.com/','163.com':'https://mail.163.com/','126.com':'https://mail.126.com/','icloud.com':'https://www.icloud.com/mail/'})[domain]||null;
}
