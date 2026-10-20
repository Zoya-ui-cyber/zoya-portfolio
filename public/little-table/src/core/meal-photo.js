// Store a small JPEG, with camera metadata removed, rather than the original file.
export async function compressMealPhoto(file){
  if(!file||!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>10e6)throw Error('IMAGE');
  const bitmap=await createImageBitmap(file);
  try{
    if(!bitmap.width||!bitmap.height||bitmap.width*bitmap.height>80e6)throw Error('IMAGE');
    const canvas=document.createElement('canvas');let edge=960,encoded='';
    for(let attempt=0;attempt<5;attempt++){
      const scale=Math.min(1,edge/Math.max(bitmap.width,bitmap.height));canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));
      const ctx=canvas.getContext('2d');ctx.fillStyle='#ffffff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);
      encoded=canvas.toDataURL('image/jpeg',Math.max(.45,.76-attempt*.07));if(encoded.length<=96000)return encoded;edge=Math.round(edge*.76);
    }
    if(encoded.length>96000)throw Error('IMAGE');return encoded;
  }finally{bitmap.close();}
}
