// Translate known server failures without exposing raw database details.
export function actionError(error,lang='zh'){
 const message=String(error?.message||''),en=lang==='en';
 const text=(zh,english)=>en?english:zh;
 if(/Email must be verified first|email_not_confirmed/i.test(message+' '+error?.code))return text('对方尚未验证邮箱，请先点击注册邮件中的验证链接，再审核通过。','This member has not verified their email. Ask them to confirm the registration email before approval.');
 if(/Cannot review your own account/i.test(message))return text('不能审核自己的账号。','You cannot review your own account.');
 if(/Administrator access required/i.test(message))return text('当前账号没有管理员权限，请刷新账号状态或重新登录。','Administrator access is required. Refresh your account or sign in again.');
 if(error?.status===401||/JWT expired|invalid JWT|refresh_token_not_found/i.test(message+' '+error?.code))return text('登录已失效，请重新登录后操作。','Your session has expired. Please sign in again.');
 if(error?.status===403||/permission denied/i.test(message))return text('后台权限校验未通过，请检查管理员身份和数据库权限。','The server denied access. Check administrator status and database permissions.');
 if(error?.name==='TimeoutError'||error?.name==='AbortError')return text('请求超时，请稍后重试。','The request timed out. Please try again.');
 if(error instanceof TypeError&&/fetch|network|load failed/i.test(message))return text('无法连接服务器，请检查网络后重试。','Could not reach the server. Check your connection and try again.');
 const code=/^[A-Z0-9_]{2,30}$/i.test(String(error?.code||''))?' ('+error.code+')':'';
 return text('操作未完成，服务器返回错误','The server could not complete this action')+code+text('，请将此提示反馈给管理员。','. Please report this message to the administrator.');
}
