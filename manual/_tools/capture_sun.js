// 일조권·사선제한 계산기 매뉴얼 화면 캡처 — usage: node capture_sun.js <repoDir> <outDir>
// 규격: 1440×900 · DSF 1.25 · serviceWorkers block · _marks.json(번호 배지 % 좌표) · _example.json(예제 검증값 — 앱에서 읽음)
const {chromium}=require(process.env.MM_PW||'playwright');const fs=require('fs');const path=require('path');const {setup,server}=require('./serve');
const repo=path.resolve(process.argv[2]),out=path.resolve(process.argv[3]);fs.mkdirSync(out,{recursive:true});
const VW=1440,VH=900,DSF=1.25,PORT=8897;
/* 예제 A = 제2종 일반주거지역 다세대주택 — 높이 13.5 m · 측정 13.5 m · 정북 경계 5.0 m · 사이 도로 4 m(§86⑥ → 중심선 +2 m)
            · 채광창 이격 8 m · 동 간 8 m · 익산(35.87°N) · 동지 · 경계선 방위각 0°            → 적합
   예제 B = 제1종 일반주거지역 단독주택 — 높이 11 m · 측정 11 m · 경계 3.0 m                     → 정북 사선 위반(5.5 m 필요)
   예제 C = 준주거지역 공동주택 — 높이 27 m · 채광창 이격 6 m(×4 = 24 m) · 동 간 15 m · 경계 2 m  → 채광 위반(사선 미적용) */
const FREEZE=`(()=>{const T=new Date(2026,9,14,10,0,0).getTime();const D=Date;class F extends D{constructor(...a){if(a.length)super(...a);else super(T);}static now(){return T;}}window.Date=F;window.alert=()=>{};window.confirm=()=>true;try{localStorage.clear();}catch(e){}})()`;
const HIDE='#toast,#pwa-install-bar,#ios-install-guide,#pwa-update-bar,.toast{display:none!important}#result-col{position:static!important;max-height:none!important;overflow:visible!important}';
const HELP=`window.__vis=e=>e&&e.getClientRects().length>0;
window.__card=t=>{const h=[...document.querySelectorAll('.sec-title,.diagram-title')].find(e=>__vis(e)&&e.textContent.trim().startsWith(t));return h?h.closest('.card'):null;};
window.__find=sel=>{if(sel.startsWith('card:'))return __card(sel.slice(5));
 if(sel.startsWith('up:')){const [a,b]=sel.slice(3).split('|');const e=[...document.querySelectorAll(a)].find(__vis);return e?e.closest(b):null;}
 if(sel.startsWith('nth:')){const [q,i]=sel.slice(4).split('|');return [...document.querySelectorAll(q)].filter(__vis)[+i]||null;}
 for(const s of sel.split(',')){const e=[...document.querySelectorAll(s)].find(__vis);if(e)return e;}return null;};
window.__sv=(id,v)=>{const e=document.getElementById(id);e.value=v;e.dispatchEvent(new Event('change',{bubbles:true}));};
window.__tab=i=>{document.querySelectorAll('.tab-bar-inner .tb:not(.tb-manual)')[i].click();};
window.__quiet=f=>{const si=Element.prototype.scrollIntoView;Element.prototype.scrollIntoView=function(){};try{f();}finally{setTimeout(()=>{Element.prototype.scrollIntoView=si;},300);}};
window.__set=c=>{document.getElementById('a4ProjName').value=c.pn||'';document.getElementById('a4Author').value=c.au||'';
 __sv('zone',c.zone);__sv('bldgType',c.type);__sv('bldgH',c.H);__sv('partH',c.partH);__sv('distBound',c.dist);
 __sv('roadW',c.roadW||'');__sv('openSpace',c.os||'none');__sv('lightDist',c.ld||'');__sv('betweenDist',c.bd||'');__sv('aptZoneType',c.ht||'일반');
 __sv('bldgW',c.W||'');__sv('azimuth',c.az||0);__sv('latitude',c.lat||'35.87');
 ['ex1','ex2','ex3'].forEach(k=>document.getElementById(k).checked=!!c[k]);
 document.querySelector('input[name="refDay"][value="'+(c.day||'winter')+'"]').checked=true;calculate();};
window.__E={
 A:{pn:'익산시 ○○동 다세대주택 신축공사',au:'김만민',zone:'일반2종',type:'공동',H:13.5,partH:13.5,dist:5.0,roadW:4,os:'road',ld:8,bd:8,ht:'일반',W:18,az:0},
 B:{pn:'익산시 ○○동 단독주택 신축공사',au:'김만민',zone:'일반1종',type:'단독',H:11,partH:11,dist:3.0,W:12,az:0},
 C:{pn:'익산시 ○○동 오피스텔·공동주택 신축공사',au:'김만민',zone:'준주거',type:'공동',H:27,partH:27,dist:2.0,ld:6,bd:15,ht:'일반',W:30,az:0},
};
window.__closeAll=()=>{try{closeModal('help-modal');}catch(e){}document.querySelectorAll('.info-bd.show').forEach(e=>e.classList.remove('show'));document.querySelectorAll('.info-arr.open').forEach(e=>e.classList.remove('open'));};
window.__run=k=>__quiet(()=>{__closeAll();__tab(0);__set(__E[k]);window.scrollTo(0,0);});
window.__ex=()=>{const d=_lastResult;if(!d)return null;
 return {zone:d.zone,type:d.bldgType,H:d.bldgH,partH:d.partH,dist:d.distBound,eff:+d.effDist.toFixed(3),mDist:+d.mDist.toFixed(3),six:d.sixApply,
  saApply:d.saseonApply,saOk:d.saseonOk,light:d.light,gap:d.gap,anyApply:d.anyApply,allOk:d.allOk,
  shadow:d.shadowData.shadowH09_15,cont:d.shadowData.continuousSun,lat:d.lat,
  verdict:document.getElementById('verdict-box').innerText.replace(/\\s+/g,' ').trim(),
  sum:[...document.querySelectorAll('.sum-bar .sum-item')].map(e=>e.textContent.trim()),
  rows:d.shadowData.rows.filter(r=>r.inWin).map(r=>[r.time,r.alt,r.az,r.shadow,r.proj,r.inShadow?'그림자':r.sun?'일조':'일몰'])};};`;
const SHOTS=[
 {id:'s01_overview',pre:"__run('A')",clip:'viewport',m:[['.tab-bar-inner','작업 탭'],['.sum-bar','요약 스트립'],['card:① 공사 정보','① 공사 정보 · 용도지역'],['card:② 대지','② 대지 및 건물 정보'],['#verdict-box','종합 판정'],['#metrics-grid','검토 지표 6종'],['#fab-group','초기화 · 이용안내']]},
 {id:'s02_tabs',clip:'.app-header',m:[['nth:.tab-bar-inner .tb|0','검토 입력·결과'],['nth:.tab-bar-inner .tb|1','A4 계산서'],['.tb-manual','매뉴얼'],['.hdr-right','근거 법령 · 시행일']]},
 {id:'s03_card1',clip:'card:① 공사 정보',m:[['#a4ProjName','① 공사명 · 작성자(A4 표제)'],['#zone','② 용도지역'],['#zone-notice','③ 적용 안내'],['#bldgType','④ 건축물 유형']]},
 {id:'s04_card2',clip:'card:② 대지',m:[['up:#bldgH|.fg','① 건물 높이'],['up:#partH|.fg','② 측정 부분 높이'],['up:#distBound|.fg','③ 경계선까지 거리'],['up:#lightDist|.fg','④ 채광창 이격거리'],['up:#betweenDist|.fg','⑤ 동 간 간격'],['up:#aptZoneType|.fg','⑥ 주택 유형'],['up:#roadW|.fg','⑦ 사이 시설·부지 너비'],['up:#openSpace|.fg','⑧ 사이 시설·부지 종류'],['up:#ex1|.toggle-row','⑨ 적용 제외 특례 3종']]},
 {id:'s05_card3',clip:'card:③ 일영',union:'.btn-row',m:[['#latitude','① 대지 위도'],['.radio-grp','② 분석 기준일'],['up:#bldgW|.fg','③ 건물 폭(참고)'],['up:#azimuth|.fg','④ 경계선 방위각'],['.calc-btn','⑤ 일조권 검토 실행']]},
 {id:'s06_result_a',clip:'#verdict-box',union:'#metrics-grid',m:[['#verdict-box','종합 판정'],['nth:.metric-card|0','최소 이격(기준)'],['nth:.metric-card|1','계획 이격(⑥ 중심선)'],['nth:.metric-card|2','일영 시간(참고)'],['nth:.metric-card|3','연속 일조(참고)'],['nth:.metric-card|4','공동주택 채광'],['nth:.metric-card|5','동 간 거리']]},
 {id:'s07_diagram',clip:'card:📐 일조 사선제한 단면도',m:[['#diagram-canvas','단면도 — 사선 · 경계선 · 이격']]},
 {id:'s08_shadow',clip:'card:⏱ 시간대별',crop:820,m:[['nth:.shadow-table th|3','그림자 길이'],['nth:.shadow-table th|4','경계 방향 성분'],['nth:.shadow-table th|5','일조 여부']]},
 {id:'s09_law',clip:'card:📊 일조 시간',m:[]},
 {id:'s10_result_b',pre:"__run('B')",wait:800,clip:'#verdict-box',union:'#metrics-grid',m:[['#verdict-box','정북 사선 위반'],['nth:.metric-card|0','최소 이격 5.5 m'],['nth:.metric-card|1','계획 이격 3.0 m']]},
 {id:'s11_result_c',pre:"__run('C')",wait:800,clip:'#verdict-box',union:'#metrics-grid',m:[['#verdict-box','채광 위반 · 사선 미적용'],['nth:.metric-card|4','채광 한도 24 m'],['nth:.metric-card|5','동 간 거리 적합']]},
 {id:'s12_info',pre:"__run('A');document.querySelectorAll('.info-hd').forEach(h=>toggleAccordion(h));",wait:800,clip:'up:.info-item|.fi',m:[['nth:.info-item|0','일조 사선제한이란? · 법 개정 안내'],['nth:.info-item|1','일영 계산 원리'],['nth:.info-item|2','적용 제외 규정']]},
 {id:'s13_modal',pre:"__closeAll();openModal('guide')",wait:900,fixed:true,clip:'.modal-box',m:[]},
 {id:'s14_modal_law',pre:"switchMTabById('mt-law');document.querySelector('#help-modal .modal-body').scrollTop=0",wait:700,fixed:true,post:"__closeAll()",clip:'.modal-box',m:[]},
 {id:'s15_a4',pre:"__run('A');__tab(1);scrollTo(0,0)",wait:1500,clip:'viewport',m:[['.mm-btn-print','인쇄 / PDF'],['.mm-btn-jpg','JPG 저장'],['#a4Page','A4 검토 계산서']]},
 {id:'s16_a4page',clip:'#a4Page',crop:2600,m:[['nth:#a4Page .a4-sub|0','1. 검토 조건'],['nth:#a4Page .a4-sub|1','2. 판정 결과'],['nth:#a4Page .a4-sub|2','3. 높이 제한 검토'],['nth:#a4Page .a4-sub|3','4. 일조 시간(참고)']]},
];
(async()=>{
 const s=await server(repo,PORT);const b=await chromium.launch();
 const ctx=await b.newContext({viewport:{width:VW,height:VH},deviceScaleFactor:DSF,serviceWorkers:'block'});await setup(ctx);
 const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 await pg.addInitScript(FREEZE);
 await pg.goto(`http://127.0.0.1:${PORT}/index.html`);await pg.evaluate(()=>document.fonts.ready);await pg.waitForTimeout(2500);
 await pg.addStyleTag({content:HIDE});
 await pg.evaluate(HELP);
 const ex={};const meta={};
 for(const S of SHOTS){
  if(S.pre){try{await pg.evaluate(S.pre);}catch(e){errs.push(S.id+' pre '+e.message);}}
  await pg.waitForTimeout(S.wait||700);
  if(S.clip!=='viewport'&&!S.fixed){await pg.evaluate(c=>{const e=__find(c);if(e){window.scrollTo(0,e.getBoundingClientRect().top+scrollY-40);}},S.clip);await pg.waitForTimeout(500);}   // 화면 밖 영역 미도색 방지
  await pg.evaluate(v=>{const f=document.getElementById('fab-group');if(f)f.style.visibility=v?'':'hidden';},S.clip==='viewport');
  if(S.id==='s01_overview')ex.A=await pg.evaluate('__ex()');
  if(S.id==='s10_result_b')ex.B=await pg.evaluate('__ex()');
  if(S.id==='s11_result_c')ex.C=await pg.evaluate('__ex()');
  if(S.id==='s16_a4page')ex.A_a4=await pg.evaluate(()=>document.getElementById('a4Page').innerText.replace(/\s+/g,' '));
  const info=await pg.evaluate(({S,VW,VH})=>{
   const abs=e=>{const r=e.getBoundingClientRect();return {x:r.left+scrollX,y:r.top+scrollY,w:r.width,h:r.height};};
   let clip;
   if(S.clip==='viewport'){clip={x:0,y:scrollY,width:VW,height:VH};}
   else{const el=__find(S.clip);if(!el)return {err:'clip '+S.clip};const a=abs(el);clip={x:a.x,y:a.y,width:a.w,height:a.h};
     if(S.union){const e2=__find(S.union);if(e2){const a2=abs(e2);const x0=Math.min(clip.x,a2.x),y0=Math.min(clip.y,a2.y),x1=Math.max(clip.x+clip.width,a2.x+a2.w),y1=Math.max(clip.y+clip.height,a2.y+a2.h);clip={x:x0,y:y0,width:x1-x0,height:y1-y0};}}
     const P=12;clip={x:Math.max(0,clip.x-P),y:Math.max(0,clip.y-P),width:clip.width+2*P,height:clip.height+2*P};
     if(S.crop&&clip.height>S.crop)clip.height=S.crop;}
   const marks=[];(S.m||[]).forEach(([sel,label],i)=>{const e=__find(sel);if(!e){marks.push({n:i+1,label,miss:sel});return;}const a=abs(e);
     marks.push({n:i+1,label,x:+((a.x-clip.x)/clip.width*100).toFixed(2),y:+((a.y-clip.y)/clip.height*100).toFixed(2),w:+(Math.min(a.w,clip.x+clip.width-a.x)/clip.width*100).toFixed(2),h:+(Math.min(a.h,clip.y+clip.height-a.y)/clip.height*100).toFixed(2)});});
   return {clip,marks};},{S,VW,VH});
  if(info.err){errs.push(S.id+' '+info.err);continue;}
  const c=info.clip;const cl={x:Math.max(0,c.x),y:Math.max(0,c.y),width:Math.min(c.width,VW-Math.max(0,c.x)),height:c.height};
  if(S.clip==='viewport'){await pg.screenshot({path:path.join(out,S.id+'.png'),clip:{x:0,y:0,width:VW,height:VH}});}
  else if(S.fixed){const sx=await pg.evaluate(()=>scrollX),sy=await pg.evaluate(()=>scrollY);await pg.screenshot({path:path.join(out,S.id+'.png'),clip:{x:Math.max(0,c.x-sx),y:Math.max(0,c.y-sy),width:Math.min(c.width,VW),height:Math.min(c.height,VH-Math.max(0,c.y-sy))}});}
  else{try{await pg.screenshot({path:path.join(out,S.id+'.png'),clip:cl,fullPage:true});}catch(e){errs.push(S.id+' shot '+JSON.stringify(cl)+' '+await pg.evaluate(()=>document.documentElement.scrollHeight+'/'+scrollY));continue;}}
  meta[S.id]={w:Math.round(cl.width),h:Math.round(Math.min(cl.height,S.fixed?VH:1e9)),marks:info.marks};
  if(S.post){try{await pg.evaluate(S.post);}catch(e){errs.push(S.id+' post '+e.message);}await pg.waitForTimeout(400);}
 }
 await pg.evaluate("__run('A')");await pg.waitForTimeout(600);ex.after=await pg.evaluate('__ex()');
 const mctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,serviceWorkers:'block',isMobile:true,hasTouch:true});await setup(mctx);
 const mp=await mctx.newPage();await mp.addInitScript(FREEZE);
 await mp.goto(`http://127.0.0.1:${PORT}/index.html`);await mp.waitForTimeout(2500);
 await mp.addStyleTag({content:HIDE});await mp.evaluate(HELP);await mp.evaluate("__run('A')");await mp.waitForTimeout(800);
 await mp.screenshot({path:path.join(out,'s17_mobile_main.png')});meta['s17_mobile_main']={w:390,h:844,marks:[]};
 await mp.evaluate(()=>{const e=document.getElementById('verdict-box');const y=e.getBoundingClientRect().top+window.scrollY-12;window.scrollTo(0,y);document.scrollingElement.scrollTop=y;});await mp.waitForTimeout(1200);
 await mp.screenshot({path:path.join(out,'s18_mobile_result.png')});meta['s18_mobile_result']={w:390,h:844,marks:[]};
 await mp.evaluate(()=>{__tab(1);window.scrollTo(0,0);});await mp.waitForTimeout(1200);
 await mp.screenshot({path:path.join(out,'s19_mobile_a4.png')});meta['s19_mobile_a4']={w:390,h:844,marks:[]};
 ex.mobile=await mp.evaluate(()=>({page:document.documentElement.scrollWidth,vw:innerWidth,tabRows:new Set([...document.querySelectorAll('.tab-bar-inner .tb')].map(e=>Math.round(e.getBoundingClientRect().top))).size}));
 fs.writeFileSync(path.join(out,'_marks.json'),JSON.stringify(meta,null,1));fs.writeFileSync(path.join(out,'_example.json'),JSON.stringify(ex,null,1));
 const miss=[];Object.entries(meta).forEach(([k,v])=>v.marks.forEach(m=>{if(m.miss)miss.push(k+':'+m.miss);else if(m.x<0||m.y<0||m.x+m.w>100.5||m.y+m.h>100.5||m.w<=0||m.h<=0)miss.push(k+':OUT '+m.label+' '+m.x+','+m.y+','+m.w+','+m.h);}));
 const sh=o=>o&&[o.verdict.slice(0,60),o.mDist,o.eff,o.saOk,o.light.apply&&[o.light.lim,o.light.ok],o.gap.apply&&[o.gap.req,o.gap.ok],o.shadow,o.cont];
 const strip=o=>JSON.stringify(o);
 console.log(JSON.stringify({A:sh(ex.A),B:sh(ex.B),C:sh(ex.C),same:strip(ex.A)===strip(ex.after),mobile:ex.mobile,sizes:Object.fromEntries(Object.entries(meta).map(([k,v])=>[k,v.w+'x'+v.h])),miss,errs:errs.slice(0,15)},null,1));
 await b.close();s.close();
})();
