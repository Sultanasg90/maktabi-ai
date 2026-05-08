import { useState, useRef, useEffect } from “react”;

// ── IN-MEMORY STORE ───────────────────────────────────────────
const DB = { users:{}, session:null };
const saveU = u => { DB.users=u; };
const loadU = () => DB.users;
const saveSess = u => { DB.session=u; };
const loadSess = () => DB.session;
const today = () => new Date().toISOString().slice(0,10);

// ── DATA ──────────────────────────────────────────────────────
const PLANS = [
{ id:“free”,     name:“مجاني”,   price:0,   period:””,    req:3,   accent:”#888”,   color:”#1A1A1A”, popular:false,
features:[“3 طلبات يومياً”,“وورد وإكسل فقط”,“دعم أساسي”] },
{ id:“pro”,      name:“احترافي”, price:99,  period:“شهر”, req:200, accent:”#41A5EE”,color:”#0D1F3A”, popular:true,
features:[“200 طلب/شهر”,“جميع الأدوات”,“أولوية الرد”,“دعم واتساب”] },
{ id:“business”, name:“أعمال”,   price:299, period:“شهر”, req:-1,  accent:”#F59E0B”,color:”#1C1000”, popular:false,
features:[“غير محدود”,“API خاص”,“فريق متعدد”,“فاتورة ضريبية”] },
];

const TOOLS = [
{ id:“word”,   label:“وورد”,           icon:“W”, color:”#1E3A6E”, accent:”#41A5EE”,
sys:“أنت خبير Microsoft Word. قدّم محتوى نصياً منظماً واحترافياً باللغة العربية مع تعليمات التنسيق الكاملة.” },
{ id:“excel”,  label:“إكسل”,           icon:“X”, color:”#14532D”, accent:”#4ADE80”,
sys:“أنت خبير Excel. قدّم معادلات دقيقة وهيكل جداول واضح مع شرح خطوة بخطوة. إذا أُرسلت صورة أو رسم، استنبط منه بنية الجدول بالكامل.” },
{ id:“ppt”,    label:“بوربوينت”,       icon:“P”, color:”#7C1D0A”, accent:”#FB923C”,
sys:“أنت خبير PowerPoint. قدّم محتوى شرائح متكاملاً مع اقتراحات تصميمية واضحة لكل شريحة.” },
{ id:“design”, label:“تصميم”,          icon:“D”, color:”#4A1D96”, accent:”#C084FC”,
sys:“أنت مصمم جرافيك خبير. قدّم وصفاً دقيقاً للتصميم مع الألوان والخطوط والأدوات المقترحة.” },
{ id:“email”,  label:“بريد”,           icon:“E”, color:”#0C3A2A”, accent:”#34D399”,
sys:“أنت خبير كتابة البريد المهني. اكتب رسائل واضحة ومؤثرة باللغة العربية.” },
{ id:“legal”,  label:“قانوني”,         icon:“ق”, color:”#1C1A3A”, accent:”#818CF8”,
sys:“أنت مساعد في صياغة الوثائق الرسمية والعقود باللغة العربية. نبّه دائماً أنك لست محامياً.” },
];

const G = {
bg:”#07070E”, bg2:”#0A0A14”, bg3:”#0F0F18”,
border:”#141420”, border2:”#1E1E2E”,
text:”#F0F0F5”, muted:”#666”, dim:”#333”,
font:”‘Cairo’,‘Tahoma’,sans-serif”,
};

const IMG_SYS = `\n\nإذا ذكر المستخدم صوراً بمواضع محددة، أدرج في المستند علامات واضحة هكذا: [📷 صورة N — الصفحة X — الموضع — الحجم] ثم أضف تعليمات إدراج كل صورة خطوة بخطوة في البرنامج المطلوب. إذا أُرسلت صورة/رسم، حلّلها بدقة واستنبط منها البنية المطلوبة.`;

// ── CSS (single block) ────────────────────────────────────────
const CSS = `@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap'); *{box-sizing:border-box;margin:0;padding:0;} body{font-family:'Cairo','Tahoma',sans-serif;background:#07070E;color:#F0F0F5;direction:rtl;} textarea,input,select,button{font-family:'Cairo','Tahoma',sans-serif;} textarea{resize:none;outline:none;border:none;} ::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-track{background:#0A0A0F;} ::-webkit-scrollbar-thumb{background:#222;border-radius:2px;} @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:.25}} @keyframes glow{0%,100%{opacity:.5}50%{opacity:1}} .msg{animation:fadeUp .22s ease;} .hov{transition:transform .18s ease;} .hov:hover{transform:translateY(-2px);} .tbtn{transition:background .15s,color .15s;} .tbtn:hover{background:rgba(255,255,255,.07)!important;color:#ddd!important;} .sbtn{transition:all .15s;} .sbtn:hover{filter:brightness(1.2);transform:scale(1.04);} .chip{transition:background .15s;cursor:pointer;} .chip:hover{background:rgba(255,255,255,.1)!important;} .navbtn:hover{background:rgba(255,255,255,.07)!important;}`;

// ── HELPERS ───────────────────────────────────────────────────
function Inp({ label, type=“text”, value, onChange, placeholder, error }) {
const [f,setF] = useState(false);
return (
<div style={{marginBottom:14}}>
{label && <label style={{display:“block”,fontSize:12,color:G.muted,marginBottom:5,fontWeight:600}}>{label}</label>}
<input type={type} value={value} onChange={e=>onChange(e.target.value)}
placeholder={placeholder} onFocus={()=>setF(true)} onBlur={()=>setF(false)}
style={{width:“100%”,padding:“10px 13px”,borderRadius:9,
border:`1.5px solid ${error?"#F87171":f?"#41A5EE":G.border2}`,
background:G.bg3,color:G.text,fontSize:13,outline:“none”,transition:“border-color .2s”,direction:“rtl”}} />
{error && <div style={{fontSize:11,color:”#F87171”,marginTop:3}}>{error}</div>}
</div>
);
}

function PrimaryBtn({ children, onClick, disabled, full, color=”#1E3A6E”, accent=”#41A5EE” }) {
return (
<button onClick={disabled?undefined:onClick}
style={{width:full?“100%”:undefined,padding:“11px 22px”,borderRadius:10,border:“none”,
background:disabled?”#1A1A2A”:`linear-gradient(90deg,${color},${accent})`,
color:disabled?”#444”:”#fff”,fontWeight:700,fontSize:14,cursor:disabled?“not-allowed”:“pointer”,
opacity:disabled?.7:1,transition:“all .15s”,boxShadow:disabled?“none”:`0 4px 18px ${accent}28`}}>
{children}
</button>
);
}

function Modal({ children, onClose }) {
return (
<div style={{position:“fixed”,inset:0,background:“rgba(0,0,0,.88)”,display:“flex”,
alignItems:“center”,justifyContent:“center”,zIndex:500,padding:16}}
onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
<div style={{background:G.bg3,border:`1px solid ${G.border}`,borderRadius:18,
padding:“28px 24px”,maxWidth:420,width:“100%”,position:“relative”}}>
<button onClick={onClose} style={{position:“absolute”,top:14,left:14,
background:“none”,border:“none”,color:G.dim,cursor:“pointer”,fontSize:18}}>✕</button>
{children}
</div>
</div>
);
}

// ── AUTH ──────────────────────────────────────────────────────
function AuthModal({ mode:init, onAuth, onClose }) {
const [mode,setMode] = useState(init||“login”);
const [name,setName] = useState(””);
const [email,setEmail] = useState(””);
const [pass,setPass] = useState(””);
const [err,setErr] = useState({});
const [busy,setBusy] = useState(false);

const submit = () => {
const e={};
if(mode===“register”&&!name.trim()) e.name=“الاسم مطلوب”;
if(!email.includes(”@”)) e.email=“بريد غير صحيح”;
if(pass.length<6) e.pass=“6 أحرف على الأقل”;
if(Object.keys(e).length){setErr(e);return;}
setBusy(true);
setTimeout(()=>{
const users=loadU();
if(mode===“login”){
const u=users[email];
if(!u||u.pass!==pass){setErr({pass:“بريد أو كلمة مرور خاطئة”});setBusy(false);return;}
const sess={…u,pass:undefined};
saveSess(sess); onAuth(sess);
} else {
if(users[email]){setErr({email:“البريد مسجّل مسبقاً”});setBusy(false);return;}
const u={email,name,pass,plan:“free”,joined:today(),usage:{}};
users[email]=u; saveU(users);
const sess={email,name,plan:“free”,joined:today(),usage:{}};
saveSess(sess); onAuth(sess);
}
},700);
};

return (
<Modal onClose={onClose}>
<div style={{textAlign:“center”,marginBottom:20}}>
<div style={{width:44,height:44,borderRadius:11,background:“linear-gradient(135deg,#1E3A6E,#41A5EE)”,
display:“flex”,alignItems:“center”,justifyContent:“center”,fontSize:20,fontWeight:900,
margin:“0 auto 12px”,color:”#fff”}}>م</div>
<div style={{fontWeight:800,fontSize:18}}>{mode===“login”?“تسجيل الدخول”:“إنشاء حساب”}</div>
<div style={{color:G.muted,fontSize:12,marginTop:3}}>
{mode===“login”?“مرحباً بعودتك!”:“انضم إلى آلاف المستخدمين اليوم”}
</div>
</div>
{mode===“register”&&<Inp label="الاسم الكامل" value={name} onChange={setName} placeholder="محمد العمري" error={err.name}/>}
<Inp label="البريد الإلكتروني" type="email" value={email} onChange={setEmail} placeholder="example@email.com" error={err.email}/>
<Inp label="كلمة المرور" type="password" value={pass} onChange={setPass} placeholder="••••••••" error={err.pass}/>
<PrimaryBtn full onClick={submit} disabled={busy}>
{busy?“جاري المعالجة…”:mode===“login”?“دخول ←”:“إنشاء الحساب ←”}
</PrimaryBtn>
<div style={{textAlign:“center”,marginTop:14,fontSize:12,color:G.muted}}>
{mode===“login”?“ليس لديك حساب؟ “:“لديك حساب؟ “}
<span style={{color:”#41A5EE”,cursor:“pointer”,fontWeight:700}}
onClick={()=>{setMode(mode===“login”?“register”:“login”);setErr({});}}>
{mode===“login”?“إنشاء حساب”:“تسجيل الدخول”}
</span>
</div>
</Modal>
);
}

// ── DRAW MODAL ────────────────────────────────────────────────
function DrawModal({ onClose, onSubmit, accent, color }) {
const cvs = useRef(null);
const [drawing,setDrawing] = useState(false);
const [clr,setClr] = useState(”#ffffff”);
const [sz,setSz] = useState(3);
const [eraser,setEraser] = useState(false);
const last = useRef(null);

useEffect(()=>{
const c=cvs.current, ctx=c.getContext(“2d”);
ctx.fillStyle=”#1A1A2E”; ctx.fillRect(0,0,c.width,c.height);
ctx.strokeStyle=“rgba(255,255,255,0.05)”; ctx.lineWidth=1;
for(let x=0;x<c.width;x+=30){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,c.height);ctx.stroke();}
for(let y=0;y<c.height;y+=30){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(c.width,y);ctx.stroke();}
},[]);

const pos=(e,c)=>{
const r=c.getBoundingClientRect(),sx=c.width/r.width,sy=c.height/r.height;
if(e.touches) return{x:(e.touches[0].clientX-r.left)*sx,y:(e.touches[0].clientY-r.top)*sy};
return{x:(e.clientX-r.left)*sx,y:(e.clientY-r.top)*sy};
};
const start=e=>{e.preventDefault();setDrawing(true);last.current=pos(e,cvs.current);};
const move=e=>{
e.preventDefault(); if(!drawing) return;
const c=cvs.current,ctx=c.getContext(“2d”),p=pos(e,c);
ctx.beginPath();ctx.moveTo(last.current.x,last.current.y);ctx.lineTo(p.x,p.y);
ctx.strokeStyle=eraser?”#1A1A2E”:clr; ctx.lineWidth=eraser?sz*5:sz;
ctx.lineCap=“round”;ctx.lineJoin=“round”;ctx.stroke();
last.current=p;
};
const stop=()=>setDrawing(false);
const clear=()=>{
const c=cvs.current,ctx=c.getContext(“2d”);
ctx.fillStyle=”#1A1A2E”;ctx.fillRect(0,0,c.width,c.height);
ctx.strokeStyle=“rgba(255,255,255,0.05)”;ctx.lineWidth=1;
for(let x=0;x<c.width;x+=30){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,c.height);ctx.stroke();}
for(let y=0;y<c.height;y+=30){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(c.width,y);ctx.stroke();}
};

const COLS=[”#ffffff”,”#4ADE80”,”#41A5EE”,”#FB923C”,”#F87171”,”#C084FC”,”#FCD34D”];
return (
<div style={{position:“fixed”,inset:0,background:“rgba(0,0,0,.92)”,display:“flex”,
alignItems:“center”,justifyContent:“center”,zIndex:600,padding:12}}>
<div style={{background:G.bg3,border:`1px solid ${G.border}`,borderRadius:18,padding:16,
width:“100%”,maxWidth:540,display:“flex”,flexDirection:“column”,gap:12}}>
<div style={{display:“flex”,justifyContent:“space-between”,alignItems:“center”}}>
<div>
<div style={{fontWeight:800,fontSize:15}}>✏️ ارسم شكل الجدول</div>
<div style={{fontSize:11,color:G.muted,marginTop:2}}>ارسم الأعمدة والصفوف — سيفهمها الذكاء الاصطناعي</div>
</div>
<button onClick={onClose} style={{background:“none”,border:“none”,color:G.muted,cursor:“pointer”,fontSize:18}}>✕</button>
</div>
<div style={{display:“flex”,alignItems:“center”,gap:8,flexWrap:“wrap”}}>
<button onClick={()=>setEraser(false)} style={{padding:“4px 11px”,borderRadius:6,border:“none”,
background:!eraser?accent:”#1A1A2A”,color:”#fff”,cursor:“pointer”,fontSize:11,fontWeight:700}}>🖊 قلم</button>
<button onClick={()=>setEraser(true)} style={{padding:“4px 11px”,borderRadius:6,border:“none”,
background:eraser?”#555”:”#1A1A2A”,color:”#fff”,cursor:“pointer”,fontSize:11}}>⬜ ممحاة</button>
<div style={{display:“flex”,gap:4}}>
{COLS.map(c=>(
<button key={c} onClick={()=>{setClr(c);setEraser(false);}}
style={{width:18,height:18,borderRadius:“50%”,background:c,padding:0,border:clr===c&&!eraser?“2px solid #fff”:“2px solid transparent”,cursor:“pointer”}}/>
))}
</div>
<input type=“range” min={1} max={10} value={sz} onChange={e=>setSz(+e.target.value)} style={{width:55}}/>
<button onClick={clear} style={{marginRight:“auto”,padding:“4px 11px”,borderRadius:6,
border:`1px solid ${G.border2}`,background:“transparent”,color:G.muted,cursor:“pointer”,fontSize:11}}>🗑 مسح</button>
</div>
<canvas ref={cvs} width={800} height={420}
onMouseDown={start} onMouseMove={move} onMouseUp={stop} onMouseLeave={stop}
onTouchStart={start} onTouchMove={move} onTouchEnd={stop}
style={{width:“100%”,borderRadius:10,border:`1px solid ${G.border}`,cursor:eraser?“cell”:“crosshair”,touchAction:“none”}}/>
<div style={{display:“flex”,gap:8}}>
<button onClick={onClose} style={{flex:1,padding:“9px 0”,borderRadius:9,border:`1px solid ${G.border2}`,
background:“transparent”,color:G.muted,cursor:“pointer”,fontSize:13}}>إلغاء</button>
<button onClick={()=>onSubmit(cvs.current.toDataURL(“image/png”).split(”,”)[1])}
style={{flex:2,padding:“9px 0”,borderRadius:9,border:“none”,
background:`linear-gradient(90deg,${color},${accent})`,color:”#fff”,cursor:“pointer”,fontSize:13,fontWeight:700}}>
إرسال للذكاء الاصطناعي ←
</button>
</div>
</div>
</div>
);
}

// ── IMAGE MANAGER ─────────────────────────────────────────────
const POSITIONS = [“أعلى الصفحة”,“وسط الصفحة”,“أسفل الصفحة”,“يمين النص”,“يسار النص”];
const IMG_SIZES = [“صغير (5×4 سم)”,“متوسط (10×8 سم)”,“كبير (15×12 سم)”,“عرض كامل”];

function ImgManager({ images, onAdd, onRemove, onUpdate, onClose, onSend, accent, color }) {
const fRef = useRef(null);
const addFiles = e => {
Array.from(e.target.files).forEach(file=>{
const r=new FileReader();
r.onload=ev=>{
const im=new Image();
im.onload=()=>onAdd({id:Date.now()+Math.random(),
base64:ev.target.result.split(”,”)[1],preview:ev.target.result,
type:file.type||“image/jpeg”,name:file.name,
w:im.width,h:im.height,page:1,pos:“وسط الصفحة”,size:“متوسط (10×8 سم)”,note:””});
im.src=ev.target.result;
};
r.readAsDataURL(file);
});
e.target.value=””;
};

return (
<div style={{position:“fixed”,inset:0,background:“rgba(0,0,0,.92)”,display:“flex”,
alignItems:“center”,justifyContent:“center”,zIndex:600,padding:12}}>
<div style={{background:G.bg3,border:`1px solid ${G.border}`,borderRadius:18,width:“100%”,
maxWidth:600,maxHeight:“88vh”,display:“flex”,flexDirection:“column”,overflow:“hidden”}}>
<div style={{padding:“16px 20px”,borderBottom:`1px solid ${G.border}`,display:“flex”,justifyContent:“space-between”,alignItems:“center”}}>
<div>
<div style={{fontWeight:800,fontSize:15}}>🗂 مدير الصور</div>
<div style={{fontSize:11,color:G.muted,marginTop:2}}>حدّد موضع وحجم كل صورة في المستند</div>
</div>
<button onClick={onClose} style={{background:“none”,border:“none”,color:G.muted,cursor:“pointer”,fontSize:18}}>✕</button>
</div>

```
    <div style={{padding:"12px 20px",borderBottom:`1px solid ${G.border}`}}>
      <input ref={fRef} type="file" accept="image/*" multiple onChange={addFiles} style={{display:"none"}}/>
      <button onClick={()=>fRef.current?.click()}
        style={{width:"100%",padding:"12px",borderRadius:10,border:`2px dashed ${accent}55`,
          background:`${color}18`,color:accent,cursor:"pointer",fontSize:13,fontWeight:700}}>
        ＋ ارفع صوراً (يمكن رفع أكثر من صورة)
      </button>
    </div>

    <div style={{flex:1,overflowY:"auto",padding:"12px 20px",display:"flex",flexDirection:"column",gap:12}}>
      {images.length===0&&(
        <div style={{textAlign:"center",padding:"36px 0",color:G.dim,fontSize:13}}>لم تُرفع أي صور بعد</div>
      )}
      {images.map((img,idx)=>(
        <div key={img.id} style={{borderRadius:12,border:`1px solid ${G.border2}`,background:G.bg2,overflow:"hidden"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderBottom:`1px solid ${G.border}`}}>
            <img src={img.preview} alt="" style={{width:48,height:36,objectFit:"cover",borderRadius:6,border:`1px solid ${G.border}`,flexShrink:0}}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:12,fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{img.name}</div>
              <div style={{fontSize:10,color:G.muted,marginTop:1}}>{img.w}×{img.h} بكسل</div>
            </div>
            <div style={{padding:"2px 9px",borderRadius:20,background:`${accent}22`,color:accent,fontSize:10,fontWeight:700,flexShrink:0}}>صورة {idx+1}</div>
            <button onClick={()=>onRemove(img.id)} style={{background:"none",border:"none",color:G.muted,cursor:"pointer",fontSize:15,flexShrink:0}}>🗑</button>
          </div>
          <div style={{padding:"10px 12px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <div>
              <div style={{fontSize:10,color:G.muted,marginBottom:4,fontWeight:600}}>📄 رقم الصفحة</div>
              <input type="number" min={1} value={img.page} onChange={e=>onUpdate(img.id,{page:+e.target.value})}
                style={{width:"100%",padding:"6px 9px",borderRadius:7,border:`1px solid ${G.border2}`,
                  background:"#111",color:G.text,fontSize:12,outline:"none",direction:"ltr"}}/>
            </div>
            <div>
              <div style={{fontSize:10,color:G.muted,marginBottom:4,fontWeight:600}}>📐 الحجم</div>
              <select value={img.size} onChange={e=>onUpdate(img.id,{size:e.target.value})}
                style={{width:"100%",padding:"6px 9px",borderRadius:7,border:`1px solid ${G.border2}`,
                  background:"#111",color:G.text,fontSize:11,outline:"none"}}>
                {IMG_SIZES.map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
            <div style={{gridColumn:"1/-1"}}>
              <div style={{fontSize:10,color:G.muted,marginBottom:4,fontWeight:600}}>📍 الموضع في الصفحة</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                {POSITIONS.map(p=>(
                  <button key={p} onClick={()=>onUpdate(img.id,{pos:p})}
                    style={{padding:"3px 9px",borderRadius:6,border:"none",
                      background:img.pos===p?`linear-gradient(90deg,${color},${accent})`:"#1A1A2A",
                      color:img.pos===p?"#fff":G.muted,cursor:"pointer",fontSize:11,fontWeight:img.pos===p?700:400}}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div style={{gridColumn:"1/-1"}}>
              <div style={{fontSize:10,color:G.muted,marginBottom:4,fontWeight:600}}>💬 ملاحظة (اختياري)</div>
              <input value={img.note} onChange={e=>onUpdate(img.id,{note:e.target.value})}
                placeholder="مثال: شعار الشركة — يُوضع في أعلى يمين الصفحة"
                style={{width:"100%",padding:"6px 9px",borderRadius:7,border:`1px solid ${G.border2}`,
                  background:"#111",color:G.text,fontSize:11,outline:"none"}}/>
            </div>
          </div>
        </div>
      ))}
    </div>

    <div style={{padding:"12px 20px",borderTop:`1px solid ${G.border}`,display:"flex",gap:8}}>
      <button onClick={onClose} style={{flex:1,padding:"9px 0",borderRadius:9,border:`1px solid ${G.border2}`,
        background:"transparent",color:G.muted,cursor:"pointer",fontSize:13}}>إغلاق</button>
      <button onClick={()=>{if(images.length>0)onSend();}} disabled={images.length===0}
        style={{flex:2,padding:"9px 0",borderRadius:9,border:"none",
          background:images.length>0?`linear-gradient(90deg,${color},${accent})`:"#1A1A2A",
          color:images.length>0?"#fff":"#444",cursor:images.length>0?"pointer":"default",fontSize:13,fontWeight:700}}>
        إرسال {images.length>0?`(${images.length} صورة)`:""}  للذكاء الاصطناعي ←
      </button>
    </div>
  </div>
</div>
```

);
}

// ── FEEDBACK MODAL ───────────────────────────────────────────
const FEEDBACK_TYPES = [
{ id:“idea”,  label:“💡 اقتراح ميزة”,   color:”#F59E0B”, bg:”#1C100030” },
{ id:“bug”,   label:“🐛 إبلاغ عن مشكلة”, color:”#F87171”, bg:”#2D0A0A30” },
{ id:“other”, label:“💬 ملاحظة عامة”,   color:”#41A5EE”, bg:”#0D1F3A30” },
];

function FeedbackModal({ user, tool, onClose }) {
const [type, setType]     = useState(“idea”);
const [text, setText]     = useState(””);
const [email, setEmail]   = useState(user?.email||””);
const [sent, setSent]     = useState(false);
const [busy, setBusy]     = useState(false);
const selType = FEEDBACK_TYPES.find(t=>t.id===type);

const submit = async () => {
if(!text.trim()) return;
setBusy(true);
// In production: send to your backend/email/Supabase
// Here we simulate a successful send
await new Promise(r=>setTimeout(r,900));
setSent(true);
setBusy(false);
};

if(sent) return (
<div style={{position:“fixed”,inset:0,background:“rgba(0,0,0,.88)”,display:“flex”,
alignItems:“center”,justifyContent:“center”,zIndex:500,padding:16}}>
<div style={{background:”#0F0F18”,border:“1px solid #141420”,borderRadius:18,
padding:“36px 28px”,maxWidth:380,width:“100%”,textAlign:“center”}}>
<div style={{fontSize:52,marginBottom:16}}>✅</div>
<div style={{fontSize:20,fontWeight:800,marginBottom:8}}>شكراً لك!</div>
<div style={{color:”#666”,fontSize:14,lineHeight:1.8,marginBottom:24}}>
وصلنا اقتراحك وسنراجعه بعناية.<br/>مساهمتك تساعدنا على تطوير المنصة.
</div>
<button onClick={onClose}
style={{padding:“10px 32px”,borderRadius:10,border:“none”,
background:“linear-gradient(90deg,#1E3A6E,#41A5EE)”,color:”#fff”,
fontWeight:700,fontSize:14,cursor:“pointer”,fontFamily:“inherit”}}>
إغلاق
</button>
</div>
</div>
);

return (
<div style={{position:“fixed”,inset:0,background:“rgba(0,0,0,.88)”,display:“flex”,
alignItems:“center”,justifyContent:“center”,zIndex:500,padding:16}}
onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
<div style={{background:”#0F0F18”,border:“1px solid #141420”,borderRadius:18,
padding:“24px 22px”,maxWidth:440,width:“100%”,position:“relative”}}>
<button onClick={onClose}
style={{position:“absolute”,top:14,left:14,background:“none”,border:“none”,color:”#333”,cursor:“pointer”,fontSize:18}}>✕</button>

```
    {/* Header */}
    <div style={{marginBottom:20}}>
      <div style={{fontWeight:800,fontSize:17,marginBottom:4}}>💡 اقتراحات وتطوير</div>
      <div style={{fontSize:12,color:"#555",lineHeight:1.7}}>
        رأيك يبني المنصة — شاركنا اقتراحاتك أو أبلغنا عن أي مشكلة
      </div>
    </div>

    {/* Type selector */}
    <div style={{marginBottom:16}}>
      <div style={{fontSize:11,color:"#555",fontWeight:600,marginBottom:8}}>نوع الرسالة</div>
      <div style={{display:"flex",gap:7}}>
        {FEEDBACK_TYPES.map(t=>(
          <button key={t.id} onClick={()=>setType(t.id)}
            style={{flex:1,padding:"8px 6px",borderRadius:9,border:`1.5px solid ${type===t.id?t.color:"#1E1E2E"}`,
              background:type===t.id?t.bg:"transparent",
              color:type===t.id?t.color:"#555",cursor:"pointer",fontSize:11,fontWeight:type===t.id?700:400,
              fontFamily:"inherit",transition:"all .15s",lineHeight:1.5}}>
            {t.label}
          </button>
        ))}
      </div>
    </div>

    {/* Context badge */}
    <div style={{marginBottom:12,padding:"7px 11px",borderRadius:8,background:"#111",
      border:`1px solid ${selType.color}30`,display:"flex",alignItems:"center",gap:8}}>
      <span style={{fontSize:11,color:"#444"}}>الأداة الحالية:</span>
      <span style={{fontSize:11,color:selType.color,fontWeight:700}}>{tool?.label||"عام"}</span>
    </div>

    {/* Message */}
    <div style={{marginBottom:12}}>
      <div style={{fontSize:11,color:"#555",fontWeight:600,marginBottom:6}}>
        {type==="idea"?"✍️ وصف الاقتراح":type==="bug"?"🐛 وصف المشكلة":"💬 ملاحظتك"}
      </div>
      <textarea value={text} onChange={e=>setText(e.target.value)}
        placeholder={
          type==="idea"?"مثال: أريد إمكانية تصدير النتيجة مباشرة كملف PDF...":
          type==="bug"?"مثال: عند الضغط على زر الإرسال لا يحدث شيء في أداة الإكسل...":
          "شاركنا أي ملاحظة تراها مفيدة..."
        }
        rows={4}
        style={{width:"100%",padding:"10px 12px",borderRadius:10,
          border:`1.5px solid ${text.trim()?selType.color+"60":"#1E1E2E"}`,
          background:"#111118",color:"#F0F0F5",fontSize:13,lineHeight:1.7,
          outline:"none",resize:"none",fontFamily:"inherit",transition:"border-color .2s",direction:"rtl"}}/>
    </div>

    {/* Email */}
    <div style={{marginBottom:18}}>
      <div style={{fontSize:11,color:"#555",fontWeight:600,marginBottom:6}}>بريدك الإلكتروني (اختياري — للرد عليك)</div>
      <input value={email} onChange={e=>setEmail(e.target.value)}
        placeholder="example@email.com"
        style={{width:"100%",padding:"9px 12px",borderRadius:9,
          border:"1px solid #1E1E2E",background:"#111118",color:"#F0F0F5",
          fontSize:13,outline:"none",fontFamily:"inherit",direction:"ltr"}}/>
    </div>

    {/* Stars rating */}
    <RatingStars/>

    {/* Submit */}
    <button onClick={submit} disabled={!text.trim()||busy}
      style={{width:"100%",padding:"12px 0",borderRadius:10,border:"none",marginTop:14,
        background:text.trim()&&!busy?`linear-gradient(90deg,${selType.color}88,${selType.color})`:"#1A1A2A",
        color:text.trim()&&!busy?"#fff":"#444",fontWeight:700,fontSize:14,
        cursor:text.trim()&&!busy?"pointer":"default",fontFamily:"inherit",
        boxShadow:text.trim()&&!busy?`0 4px 18px ${selType.color}28`:"none"}}>
      {busy?"جاري الإرسال...":"إرسال ←"}
    </button>
  </div>
</div>
```

);
}

function RatingStars() {
const [rating, setRating] = useState(0);
const [hover, setHover]   = useState(0);
return (
<div>
<div style={{fontSize:11,color:”#555”,fontWeight:600,marginBottom:7}}>تقييمك العام للمنصة</div>
<div style={{display:“flex”,gap:6,alignItems:“center”}}>
{[1,2,3,4,5].map(s=>(
<button key={s} onClick={()=>setRating(s)} onMouseEnter={()=>setHover(s)} onMouseLeave={()=>setHover(0)}
style={{background:“none”,border:“none”,cursor:“pointer”,fontSize:22,
color:(hover||rating)>=s?”#F59E0B”:”#2A2A2A”,transition:“color .1s, transform .1s”,
transform:(hover||rating)>=s?“scale(1.15)”:“scale(1)”}}>★</button>
))}
{rating>0&&<span style={{fontSize:11,color:”#F59E0B”,fontWeight:700,marginRight:4}}>
{[””,“ضعيف”,“مقبول”,“جيد”,“ممتاز”,“رائع!”][rating]}
</span>}
</div>
</div>
);
}

// ── MAIN APP ──────────────────────────────────────────────────
export default function App() {
const [screen, setScreen] = useState(“landing”); // landing|plans|app
const [user, setUser] = useState(null);
const [authMode, setAuthMode] = useState(null);

// App state
const [tool, setTool] = useState(TOOLS[0]);
const [msgs, setMsgs] = useState([]);
const [prompt, setPrompt] = useState(””);
const [busy, setBusy] = useState(false);
const [showDraw, setShowDraw] = useState(false);
const [showImgs, setShowImgs] = useState(false);
const [showProfile, setShowProfile] = useState(false);
const [showUpgrade, setShowUpgrade] = useState(false);
const [showFeedback, setShowFeedback] = useState(false);
const [attached, setAttached] = useState(null);
const [mImgs, setMImgs] = useState([]);
const fileRef = useRef(null);
const bottomRef = useRef(null);

const plan = PLANS.find(p=>p.id===(user?.plan||“free”))||PLANS[0];
const todayUsed = user?.usage?.[today()]||0;
const limit = plan.req;
const canSend = limit===-1||todayUsed<limit;
const remaining = limit===-1?“∞”:Math.max(0,limit-todayUsed);

useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:“smooth”}); },[msgs,busy]);

const handleAuth = u => { setUser(u); setAuthMode(null); setScreen(“app”); };
const handleLogout = () => { setUser(null); saveSess(null); setScreen(“landing”); };
const changePlan = id => {
const users=loadU();
if(users[user.email]){users[user.email].plan=id;saveU(users);}
const u={…user,plan:id}; setUser(u); saveSess(u);
};

const handleFile = e => {
const file=e.target.files[0]; if(!file) return;
const r=new FileReader();
r.onload=ev=>setAttached({base64:ev.target.result.split(”,”)[1],preview:ev.target.result,type:file.type||“image/png”});
r.readAsDataURL(file); e.target.value=””;
};

const buildImgPrompt = () => {
const lines = mImgs.map((img,i)=>`- صورة ${i+1} "${img.name}" (${img.w}×${img.h}px):\n  الصفحة: ${img.page} | الموضع: ${img.pos} | الحجم: ${img.size}${img.note?` | ملاحظة: ${img.note}`:""}`);
return `لدي ${mImgs.length} صورة أريد إدراجها في المستند:\n\n${lines.join("\n\n")}\n\nالمطلوب:\n1. المستند كاملاً مع علامة واضحة لكل صورة: [📷 صورة N — ص${"{رقم}"} — ${"{الموضع}"} — ${"{الحجم}"}]\n2. تعليمات إدراج كل صورة خطوة بخطوة\n3. نصائح للتناسق البصري`;
};

const send = async () => {
if((!prompt.trim()&&!attached)||busy) return;
if(!canSend){setShowUpgrade(true);return;}
const content = attached
? [{type:“image”,source:{type:“base64”,media_type:attached.type,data:attached.base64}},{type:“text”,text:prompt.trim()||“حلّل هذه الصورة وقدّم الحل المطلوب”}]
: prompt.trim();
const uMsg={role:“user”,content,disp:prompt.trim()||“📎 مرفق”,img:attached?.preview};
const history=[…msgs,uMsg];
setMsgs(history); setPrompt(””); setAttached(null); setBusy(true);
const users=loadU();
const usage={…(user?.usage||{}),[today()]:todayUsed+1};
if(users[user?.email]){users[user.email].usage=usage;saveU(users);}
const u={…user,usage}; setUser(u); saveSess(u);
try {
const res = await fetch(“https://api.anthropic.com/v1/messages”,{
method:“POST”,headers:{“Content-Type”:“application/json”},
body:JSON.stringify({
model:“claude-sonnet-4-20250514”,max_tokens:1000,
system:tool.sys+IMG_SYS,
messages:history.map(m=>({role:m.role,content:m.content}))
})
});
const data=await res.json();
const reply=data.content?.[0]?.text||“حدث خطأ، حاول مجدداً.”;
setMsgs([…history,{role:“assistant”,content:reply}]);
} catch {
setMsgs([…history,{role:“assistant”,content:“⚠️ حدث خطأ في الاتصال.”}]);
}
setBusy(false);
};

// ── LANDING ──────────────────────────────────────────────────
if(screen===“landing”) return (
<div style={{minHeight:“100vh”,background:G.bg,color:G.text,fontFamily:G.font}}>
<style>{CSS}</style>
<nav style={{padding:“13px 28px”,display:“flex”,justifyContent:“space-between”,alignItems:“center”,
borderBottom:`1px solid ${G.border}`,position:“sticky”,top:0,background:“rgba(7,7,14,.96)”,backdropFilter:“blur(14px)”,zIndex:100}}>
<div style={{display:“flex”,alignItems:“center”,gap:9}}>
<div style={{width:34,height:34,borderRadius:8,background:“linear-gradient(135deg,#1E3A6E,#41A5EE)”,
display:“flex”,alignItems:“center”,justifyContent:“center”,fontWeight:900,fontSize:15,color:”#fff”}}>م</div>
<span style={{fontWeight:900,fontSize:16}}>مكتبي AI</span>
</div>
<div style={{display:“flex”,gap:8,alignItems:“center”}}>
<button className=“navbtn” onClick={()=>setScreen(“plans”)}
style={{padding:“6px 14px”,borderRadius:7,background:“transparent”,border:`1px solid ${G.border2}`,
color:G.muted,cursor:“pointer”,fontSize:12,transition:“background .15s”}}>الأسعار</button>
{user ? (
<button onClick={()=>setScreen(“app”)}
style={{padding:“6px 14px”,borderRadius:7,background:“linear-gradient(90deg,#1E3A6E,#41A5EE)”,
border:“none”,color:”#fff”,cursor:“pointer”,fontSize:12,fontWeight:700}}>الدخول للتطبيق ←</button>
):(
<>
<button className=“navbtn” onClick={()=>setAuthMode(“login”)}
style={{padding:“6px 14px”,borderRadius:7,background:“transparent”,border:`1px solid ${G.border2}`,
color:G.muted,cursor:“pointer”,fontSize:12,transition:“background .15s”}}>دخول</button>
<button onClick={()=>setAuthMode(“register”)}
style={{padding:“6px 14px”,borderRadius:7,background:“linear-gradient(90deg,#1E3A6E,#41A5EE)”,
border:“none”,color:”#fff”,cursor:“pointer”,fontSize:12,fontWeight:700}}>ابدأ مجاناً</button>
</>
)}
</div>
</nav>

```
  <div style={{textAlign:"center",padding:"70px 20px 50px",position:"relative"}}>
    <div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:600,height:400,
      background:"radial-gradient(ellipse,#41A5EE12,transparent 65%)",pointerEvents:"none"}}/>
    <div style={{display:"inline-block",padding:"3px 13px",borderRadius:20,background:"#0D1F3A",
      border:"1px solid #1E3A6E",color:"#41A5EE",fontSize:11,fontWeight:700,marginBottom:18}}>
      🚀 مدعوم بأحدث نماذج الذكاء الاصطناعي
    </div>
    <h1 style={{fontSize:"clamp(26px,5vw,52px)",fontWeight:900,lineHeight:1.35,margin:"0 auto 16px",maxWidth:640}}>
      أنجز أي مستند مكتبي
      <span style={{background:"linear-gradient(90deg,#41A5EE,#4ADE80)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}> باحتراف </span>
      في ثوانٍ
    </h1>
    <p style={{color:G.muted,fontSize:16,maxWidth:440,margin:"0 auto 32px",lineHeight:1.9}}>
      وورد · إكسل · بوربوينت · تصميم · بريد · قانوني
    </p>
    <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
      <button className="hov" onClick={user?()=>setScreen("app"):()=>setAuthMode("register")}
        style={{padding:"12px 30px",borderRadius:11,background:"linear-gradient(90deg,#1E3A6E,#41A5EE)",
          border:"none",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",boxShadow:"0 6px 24px #41A5EE26"}}>
        {user?"الدخول للتطبيق ←":"جرّب مجاناً الآن ←"}
      </button>
      <button className="hov" onClick={()=>setScreen("plans")}
        style={{padding:"12px 30px",borderRadius:11,background:"transparent",
          border:`1px solid ${G.border2}`,color:G.muted,fontSize:14,cursor:"pointer"}}>
        عرض الأسعار
      </button>
    </div>
  </div>

  <div style={{display:"flex",justifyContent:"center",flexWrap:"wrap",
    borderTop:`1px solid ${G.border}`,borderBottom:`1px solid ${G.border}`}}>
    {[{n:"١٢٠٠+",l:"مستخدم نشط"},{n:"٥٠٠٠+",l:"مستند مُنجَز"},{n:"٤.٩★",l:"تقييم المستخدمين"},{n:"٩٨٪",l:"دقة النتائج"}]
      .map((s,i)=>(
      <div key={i} style={{textAlign:"center",padding:"20px 36px",borderLeft:i>0?`1px solid ${G.border}`:"none"}}>
        <div style={{fontSize:26,fontWeight:900,color:"#41A5EE"}}>{s.n}</div>
        <div style={{color:G.dim,fontSize:11,marginTop:2}}>{s.l}</div>
      </div>
    ))}
  </div>

  <div style={{padding:"50px 28px",maxWidth:820,margin:"0 auto"}}>
    <h2 style={{textAlign:"center",fontSize:22,fontWeight:900,marginBottom:30}}>٦ أدوات ذكية في مكان واحد</h2>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))",gap:12}}>
      {TOOLS.map(t=>(
        <div key={t.id} className="hov" onClick={user?()=>setScreen("app"):()=>setAuthMode("register")}
          style={{padding:"18px 16px",borderRadius:12,background:G.bg3,border:`1px solid ${G.border}`,cursor:"pointer"}}>
          <div style={{width:40,height:40,borderRadius:10,background:`linear-gradient(135deg,${t.color},${t.accent})`,
            display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:16,color:"#fff",marginBottom:11,boxShadow:`0 4px 12px ${t.accent}28`}}>{t.icon}</div>
          <div style={{fontWeight:700,fontSize:14,marginBottom:4}}>{t.label}</div>
        </div>
      ))}
    </div>
  </div>

  <div style={{textAlign:"center",padding:"50px 20px",borderTop:`1px solid ${G.border}`,background:G.bg2}}>
    <h2 style={{fontSize:22,fontWeight:900,marginBottom:10}}>ابدأ رحلتك نحو الإنتاجية الحقيقية</h2>
    <p style={{color:G.muted,marginBottom:22,fontSize:13}}>سجّل حسابك في ثوانٍ وابدأ الاستخدام الفوري — لا قيود، لا تعقيدات</p>
    <button className="hov" onClick={user?()=>setScreen("app"):()=>setAuthMode("register")}
      style={{padding:"12px 34px",borderRadius:11,background:"linear-gradient(90deg,#1E3A6E,#41A5EE)",
        border:"none",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",boxShadow:"0 6px 24px #41A5EE26"}}>
      {user?"الدخول للتطبيق ←":"إنشاء حساب مجاني ←"}
    </button>
  </div>
  {authMode&&<AuthModal mode={authMode} onAuth={handleAuth} onClose={()=>setAuthMode(null)}/>}
</div>
```

);

// ── PLANS ────────────────────────────────────────────────────
if(screen===“plans”) return (
<div style={{minHeight:“100vh”,background:G.bg,color:G.text,fontFamily:G.font,padding:“32px 20px”}}>
<style>{CSS}</style>
<button onClick={()=>setScreen(user?“app”:“landing”)}
style={{background:“none”,border:“none”,color:G.muted,cursor:“pointer”,marginBottom:24,fontSize:13}}>← رجوع</button>
<h1 style={{textAlign:“center”,fontSize:28,fontWeight:900,marginBottom:6}}>اختر خطتك</h1>
<p style={{textAlign:“center”,color:G.muted,marginBottom:40,fontSize:13}}>اختر الخطة المناسبة لطموحك وابدأ الإنتاج فوراً</p>
<div style={{display:“flex”,gap:16,justifyContent:“center”,flexWrap:“wrap”,maxWidth:820,margin:“0 auto 36px”}}>
{PLANS.map(p=>(
<div key={p.id} style={{position:“relative”,flex:1,minWidth:200,maxWidth:260,padding:“22px 20px”,borderRadius:16,
border:`1.5px solid ${user?.plan===p.id?p.accent:p.popular?p.accent+"44":G.border2}`,
background:p.popular?`linear-gradient(145deg,${p.color}50,${G.bg3})`:G.bg3,
boxShadow:p.popular?`0 0 36px ${p.accent}16`:“none”}}>
{p.popular&&<div style={{position:“absolute”,top:-11,left:“50%”,transform:“translateX(-50%)”,
background:`linear-gradient(90deg,${p.color},${p.accent})`,color:”#fff”,fontSize:10,fontWeight:700,
padding:“2px 12px”,borderRadius:20,whiteSpace:“nowrap”}}>⭐ الأكثر طلباً</div>}
<div style={{fontSize:10,color:p.accent,fontWeight:700,marginBottom:2}}>{p.id.toUpperCase()}</div>
<div style={{fontSize:18,fontWeight:900}}>{p.name}</div>
<div style={{fontSize:26,fontWeight:900,color:p.accent,margin:“9px 0 4px”}}>
{p.price===0?“مجاناً”:`${p.price} ﷼`}
{p.period&&<span style={{fontSize:11,color:G.muted,fontWeight:400}}> /{p.period}</span>}
</div>
<div style={{margin:“12px 0”,borderTop:`1px solid #1E1E2E`,paddingTop:12,display:“flex”,flexDirection:“column”,gap:6}}>
{p.features.map((f,i)=>(
<div key={i} style={{display:“flex”,gap:7,fontSize:11,color:”#bbb”,alignItems:“center”}}>
<span style={{color:p.accent}}>✓</span>{f}
</div>
))}
</div>
<button onClick={()=>{changePlan(p.id);setScreen(user?“app”:“landing”);}}
style={{width:“100%”,padding:“9px 0”,borderRadius:8,border:“none”,
background:p.popular||user?.plan===p.id?`linear-gradient(90deg,${p.color},${p.accent})`:”#1A1A2E”,
color:”#fff”,fontWeight:700,fontSize:12,cursor:“pointer”}}>
{user?.plan===p.id?“✓ مفعّل”:p.id===“business”?“تواصل معنا”:“اختر هذه الخطة”}
</button>
</div>
))}
</div>
<p style={{textAlign:“center”,color:G.dim,fontSize:11}}>جميع الأسعار بالريال السعودي · يمكن الإلغاء في أي وقت · الدفع عبر مدى وفيزا</p>
{authMode&&<AuthModal mode={authMode} onAuth={handleAuth} onClose={()=>setAuthMode(null)}/>}
</div>
);

// ── APP ──────────────────────────────────────────────────────
if(!user) { setAuthMode(“login”); setScreen(“landing”); return null; }

return (
<div style={{minHeight:“100vh”,background:G.bg,color:G.text,fontFamily:G.font,display:“flex”,flexDirection:“column”}}>
<style>{CSS}</style>

```
  <header style={{padding:"10px 16px",borderBottom:`1px solid ${G.border}`,display:"flex",
    alignItems:"center",justifyContent:"space-between",background:G.bg2,position:"sticky",top:0,zIndex:50}}>
    <div style={{display:"flex",alignItems:"center",gap:9}}>
      <div style={{width:30,height:30,borderRadius:7,background:`linear-gradient(135deg,${tool.color},${tool.accent})`,
        display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:13,color:"#fff",
        boxShadow:`0 0 12px ${tool.accent}38`}}>{tool.icon}</div>
      <div>
        <div style={{fontWeight:700,fontSize:13}}>مكتبي AI</div>
        <div style={{fontSize:9,color:G.dim}}>{tool.label}</div>
      </div>
    </div>
    <div style={{display:"flex",alignItems:"center",gap:7}}>
      <div style={{fontSize:10,padding:"3px 9px",borderRadius:20,background:"#111",
        border:`1px solid ${remaining===0?"#3D1010":G.border}`,color:remaining===0?"#F87171":G.muted}}>
        {remaining} طلب
      </div>
      <button onClick={()=>setShowFeedback(true)} title="اقتراح أو بلاغ"
        style={{width:30,height:30,borderRadius:7,background:"#1A1000",border:"1px solid #F59E0B44",
          cursor:"pointer",color:"#F59E0B",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>
        💡
      </button>
      <button onClick={()=>setShowProfile(true)}
        style={{width:30,height:30,borderRadius:7,background:G.bg3,border:`1px solid ${G.border2}`,
          cursor:"pointer",color:G.muted,fontSize:11,fontWeight:700}}>
        {user.name?.charAt(0)?.toUpperCase()||"أ"}
      </button>
    </div>
  </header>

  <div style={{display:"flex",flex:1,overflow:"hidden"}}>
    <aside style={{width:180,borderLeft:`1px solid ${G.border}`,background:G.bg2,padding:"10px 7px",
      display:"flex",flexDirection:"column",gap:2,overflowY:"auto"}}>
      <div style={{fontSize:9,color:G.dim,fontWeight:700,letterSpacing:1,paddingRight:7,marginBottom:4}}>الأدوات</div>
      {TOOLS.map(t=>(
        <button key={t.id} className="tbtn" onClick={()=>{setTool(t);setMsgs([]);}}
          style={{display:"flex",alignItems:"center",gap:7,padding:"7px 8px",borderRadius:7,border:"none",
            background:tool.id===t.id?`linear-gradient(135deg,${t.color}45,${t.accent}18)`:"transparent",
            borderRight:tool.id===t.id?`3px solid ${t.accent}`:"3px solid transparent",
            cursor:"pointer",color:tool.id===t.id?"#fff":G.muted,fontSize:11,
            fontWeight:tool.id===t.id?700:400,width:"100%",textAlign:"right"}}>
          <div style={{width:22,height:22,borderRadius:5,background:`linear-gradient(135deg,${t.color},${t.accent})`,
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:900,color:"#fff",flexShrink:0}}>{t.icon}</div>
          {t.label}
        </button>
      ))}
      <div style={{marginTop:12,borderTop:`1px solid ${G.border}`,paddingTop:10}}>
        <button onClick={()=>setShowFeedback(true)}
          style={{width:"100%",padding:"7px 8px",borderRadius:8,border:"1px solid #F59E0B33",
            background:"#1A100020",color:"#F59E0B",cursor:"pointer",fontSize:10,fontWeight:700,
            marginBottom:8,display:"flex",alignItems:"center",gap:6}}>
          <span>💡</span><span>اقتراح / بلاغ</span>
        </button>
        <div style={{padding:"9px 9px",borderRadius:9,background:`linear-gradient(135deg,${plan.color}60,#111)`,border:`1px solid ${plan.accent}28`}}>
          <div style={{fontSize:9,fontWeight:700,color:plan.accent,marginBottom:1}}>{plan.name}</div>
          <div style={{fontSize:8,color:G.muted}}>{limit===-1?"غير محدود":`${todayUsed}/${limit} اليوم`}</div>
          {user.plan==="free"&&(
            <button onClick={()=>setScreen("plans")}
              style={{marginTop:6,width:"100%",padding:"4px 0",borderRadius:5,background:plan.accent,
                border:"none",color:"#fff",fontSize:9,fontWeight:700,cursor:"pointer"}}>ترقية ↑</button>
          )}
        </div>
      </div>
    </aside>

    <main style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{flex:1,overflowY:"auto",padding:"20px 16px"}}>
        {msgs.length===0?(
          <div style={{textAlign:"center",paddingTop:40,maxWidth:460,margin:"0 auto"}}>
            <div style={{width:64,height:64,borderRadius:15,margin:"0 auto 14px",
              background:`linear-gradient(135deg,${tool.color},${tool.accent})`,
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,fontWeight:900,
              boxShadow:`0 0 32px ${tool.accent}40`}}>{tool.icon}</div>
            <div style={{fontSize:17,fontWeight:800,marginBottom:5}}>مساعد {tool.label} الذكي</div>
            <div style={{color:G.muted,fontSize:12,marginBottom:22,lineHeight:1.7}}>اكتب طلبك أو ارسم جدولك أو أرفق صورة</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:7,justifyContent:"center"}}>
              {["اكتب تقرير مالي احترافي","أنشئ جدول متابعة مشاريع","صمم عرض تقديمي"].map((ex,i)=>(
                <button key={i} className="chip" onClick={()=>setPrompt(ex)}
                  style={{padding:"6px 12px",borderRadius:20,background:"rgba(255,255,255,.05)",
                    border:`1px solid ${G.border2}`,color:G.muted,fontSize:11}}>
                  {ex}
                </button>
              ))}
            </div>
          </div>
        ):(
          <div style={{display:"flex",flexDirection:"column",gap:13,maxWidth:640,margin:"0 auto"}}>
            {msgs.map((m,i)=>(
              <div key={i} className="msg" style={{display:"flex",justifyContent:m.role==="user"?"flex-start":"flex-end"}}>
                <div style={{maxWidth:"85%",padding:"11px 14px",fontSize:13,lineHeight:1.85,whiteSpace:"pre-wrap",
                  borderRadius:m.role==="user"?"12px 12px 12px 3px":"12px 12px 3px 12px",
                  background:m.role==="user"?"rgba(255,255,255,.05)":`linear-gradient(135deg,${tool.color}28,${tool.accent}10)`,
                  border:m.role==="user"?`1px solid ${G.border}`:`1px solid ${tool.accent}22`,
                  color:m.role==="user"?"#bbb":"#e8e8f0"}}>
                  {m.role==="assistant"&&<div style={{fontSize:9,color:tool.accent,fontWeight:700,marginBottom:5,letterSpacing:.5}}>✦ المساعد الذكي</div>}
                  {m.img&&<img src={m.img} alt="" style={{maxWidth:"100%",maxHeight:140,borderRadius:7,border:`1px solid ${G.border}`,display:"block",marginBottom:7}}/>}
                  {m.disp||(typeof m.content==="string"?m.content:"")}
                  {m.role==="assistant"&&(
                    <button onClick={()=>navigator.clipboard.writeText(typeof m.content==="string"?m.content:"")}
                      style={{marginTop:7,padding:"2px 8px",borderRadius:4,background:"rgba(255,255,255,.05)",
                        border:`1px solid ${G.border}`,color:G.dim,fontSize:10,cursor:"pointer"}}>نسخ</button>
                  )}
                </div>
              </div>
            ))}
            {busy&&(
              <div style={{display:"flex",justifyContent:"flex-end"}}>
                <div style={{padding:"11px 15px",borderRadius:"12px 12px 3px 12px",
                  background:`linear-gradient(135deg,${tool.color}28,${tool.accent}10)`,
                  border:`1px solid ${tool.accent}22`,display:"flex",gap:5}}>
                  {[0,1,2].map(d=><div key={d} style={{width:6,height:6,borderRadius:"50%",background:tool.accent,animation:`pulse 1.2s ease ${d*.2}s infinite`}}/>)}
                </div>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>
        )}
      </div>

      <div style={{padding:"11px 14px",borderTop:`1px solid ${G.border}`,background:G.bg2}}>
        <div style={{maxWidth:640,margin:"0 auto"}}>
          {attached&&(
            <div style={{marginBottom:7,padding:"7px 9px",borderRadius:8,background:"#111",
              border:`1px solid ${tool.accent}40`,display:"flex",alignItems:"center",gap:8}}>
              <img src={attached.preview} alt="" style={{width:44,height:32,objectFit:"cover",borderRadius:5,border:`1px solid ${G.border}`,flexShrink:0}}/>
              <div style={{flex:1}}>
                <div style={{fontSize:10,color:tool.accent,fontWeight:700}}>📎 صورة مرفقة</div>
                <div style={{fontSize:9,color:G.muted,marginTop:1}}>أضف تعليقاً أو أرسل مباشرة</div>
              </div>
              <button onClick={()=>setAttached(null)} style={{background:"none",border:"none",color:G.muted,cursor:"pointer",fontSize:15}}>✕</button>
            </div>
          )}
          <div style={{display:"flex",gap:6,alignItems:"flex-end",background:"#111118",
            border:`1px solid ${(prompt||attached)?tool.accent+"50":G.border2}`,
            borderRadius:11,padding:"9px 10px",transition:"border-color .2s"}}>
            <div style={{display:"flex",gap:3,flexShrink:0}}>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{display:"none"}}/>
              <button onClick={()=>fileRef.current?.click()} title="رفع صورة"
                style={{width:28,height:28,borderRadius:6,border:`1px solid ${G.border}`,background:"#1A1A2A",
                  color:G.muted,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>🖼</button>
              <button onClick={()=>setShowDraw(true)} title="رسم جدول"
                style={{width:28,height:28,borderRadius:6,border:`1px solid ${tool.accent}44`,background:`${tool.color}30`,
                  color:tool.accent,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>✏️</button>
              <button onClick={()=>setShowImgs(true)} title="مدير الصور"
                style={{position:"relative",width:28,height:28,borderRadius:6,border:"1px solid #F59E0B44",background:"#1C100030",
                  color:"#F59E0B",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>
                🗂
                {mImgs.length>0&&<span style={{position:"absolute",top:-5,right:-5,width:15,height:15,borderRadius:"50%",
                  background:"#F59E0B",color:"#000",fontSize:8,fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {mImgs.length}</span>}
              </button>
            </div>
            <textarea value={prompt} onChange={e=>setPrompt(e.target.value)}
              onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}}
              onInput={e=>{e.target.style.height="auto";e.target.style.height=Math.min(e.target.scrollHeight,100)+"px";}}
              placeholder={attached?"أضف تعليقاً (اختياري)...":` اكتب طلبك لـ ${tool.label}...`} rows={1}
              style={{flex:1,background:"transparent",color:G.text,fontSize:13,lineHeight:1.7,maxHeight:100,overflowY:"auto"}}/>
            <button className="sbtn" onClick={send} disabled={(!prompt.trim()&&!attached)||busy}
              style={{width:32,height:32,borderRadius:7,border:"none",flexShrink:0,display:"flex",
                alignItems:"center",justifyContent:"center",fontSize:13,
                cursor:(prompt.trim()||attached)&&!busy?"pointer":"default",
                background:(prompt.trim()||attached)&&!busy?`linear-gradient(135deg,${tool.color},${tool.accent})`:"#1A1A2A",
                color:(prompt.trim()||attached)&&!busy?"#fff":"#333",
                boxShadow:(prompt.trim()||attached)&&!busy?`0 0 11px ${tool.accent}35`:"none"}}>↑</button>
          </div>
          <div style={{display:"flex",gap:8,marginTop:5}}>
            <span style={{fontSize:9,color:"#252530"}}>Enter للإرسال</span>
            <span style={{fontSize:9,color:tool.accent+"77"}}>✏️ رسم الجدول</span>
            <span style={{fontSize:9,color:"#F59E0B77"}}>🗂 مواضع الصور</span>
          </div>
        </div>
      </div>
    </main>
  </div>

  {showDraw&&<DrawModal onClose={()=>setShowDraw(false)} accent={tool.accent} color={tool.color}
    onSubmit={b=>{setAttached({base64:b,preview:"data:image/png;base64,"+b,type:"image/png"});
      setShowDraw(false);if(!prompt.trim())setPrompt("صمّم لي هذا الجدول بناءً على الرسم المرفق");}}/>}

  {showImgs&&<ImgManager images={mImgs}
    onAdd={img=>setMImgs(p=>[...p,img])}
    onRemove={id=>setMImgs(p=>p.filter(i=>i.id!==id))}
    onUpdate={(id,ch)=>setMImgs(p=>p.map(i=>i.id===id?{...i,...ch}:i))}
    onClose={()=>setShowImgs(false)}
    onSend={()=>{setPrompt(buildImgPrompt());setShowImgs(false);}}
    accent={tool.accent} color={tool.color}/>}

  {showProfile&&(
    <Modal onClose={()=>setShowProfile(false)}>
      <div style={{textAlign:"center",marginBottom:18}}>
        <div style={{width:50,height:50,borderRadius:12,background:"linear-gradient(135deg,#1E3A6E,#41A5EE)",
          display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:900,
          margin:"0 auto 11px",color:"#fff"}}>{user.name?.charAt(0)?.toUpperCase()||"أ"}</div>
        <div style={{fontWeight:800,fontSize:16}}>{user.name}</div>
        <div style={{color:G.muted,fontSize:12,marginTop:2}}>{user.email}</div>
      </div>
      <div style={{background:G.bg,borderRadius:10,padding:"12px 14px",marginBottom:14}}>
        {[["الخطة",plan.name],["الطلبات اليوم",`${todayUsed}/${limit===-1?"∞":limit}`],["تاريخ الانضمام",user.joined||"-"]]
          .map(([k,v],i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:12,
            marginBottom:i<2?7:0,paddingBottom:i<2?7:0,borderBottom:i<2?`1px solid ${G.border}`:"none"}}>
            <span style={{color:G.muted}}>{k}</span>
            <span style={{fontWeight:700,color:i===0?plan.accent:G.text}}>{v}</span>
          </div>
        ))}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:7}}>
        {user.plan!=="business"&&(
          <PrimaryBtn full onClick={()=>{setShowProfile(false);setScreen("plans");}}>⬆ ترقية الخطة</PrimaryBtn>
        )}
        <button onClick={()=>{handleLogout();setShowProfile(false);}}
          style={{width:"100%",padding:"10px",borderRadius:9,border:"1px solid #3D1010",
            background:"#2D0A0A",color:"#F87171",cursor:"pointer",fontWeight:700,fontSize:13}}>تسجيل الخروج</button>
      </div>
    </Modal>
  )}

  {showFeedback&&<FeedbackModal user={user} tool={tool} onClose={()=>setShowFeedback(false)}/>}

  {showUpgrade&&(
    <Modal onClose={()=>setShowUpgrade(false)}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:38,marginBottom:12}}>🔒</div>
        <div style={{fontSize:18,fontWeight:800,marginBottom:7}}>انتهت طلباتك اليومية</div>
        <div style={{color:G.muted,fontSize:13,marginBottom:22,lineHeight:1.7}}>
          لقد استنفدت حصتك اليومية من الطلبات.<br/>ارتقِ بإنتاجيتك — اختر خطة تناسب طموحك.
        </div>
        <PrimaryBtn full onClick={()=>{setShowUpgrade(false);setScreen("plans");}}>ترقية الآن ←</PrimaryBtn>
        <button onClick={()=>setShowUpgrade(false)}
          style={{background:"none",border:"none",color:G.dim,cursor:"pointer",fontSize:12,marginTop:10,display:"block",width:"100%"}}>لاحقاً</button>
      </div>
    </Modal>
  )}
</div>
```

);
}
