// 일조사선 v5.0.6 판정 독립 대조 — usage: node verify_sun_judge.js (index.html 경로는 아래 path 상수). 경계 12건 + 무작위 300건
// 독립 검증 — 페이지 calculate() 결과(_lastResult)를 독립 구현과 대조
const { chromium } = require('playwright');
const path='file://'+require('path').resolve(__dirname,'../../index.html');
const R=['전용1종','전용2종','일반1종','일반2종','일반3종'];
const ZONES=[...R,'준주거','근린상업','일반중심상업','유통상업','공업','농림'];
function sunVec(doy,tf,lat){ // ENU 벡터법 (같은 Cooper 적위식, 방위는 atan2 독립 계산)
  const d=23.45*Math.sin(2*Math.PI*(doy-81)/365)*Math.PI/180, H=(tf-12)*15*Math.PI/180, p=lat*Math.PI/180;
  const E=-Math.cos(d)*Math.sin(H), N=Math.cos(p)*Math.sin(d)-Math.sin(p)*Math.cos(d)*Math.cos(H), U=Math.sin(p)*Math.sin(d)+Math.cos(p)*Math.cos(d)*Math.cos(H);
  return {E,N,U};
}
function ref(c){
  const isApt=c.type==='공동', res=R.includes(c.zone), ex=c.ex1||c.ex2||c.ex3;
  const sa=res&&!ex, six=c.os!=='none'&&c.roadW>0;
  const eff=c.dist+(six?(isApt?c.roadW/2:c.roadW):0);
  const md=c.partH<=10?1.5:c.partH/2;
  const sok=!sa||eff>=md-1e-9;
  const ap=isApt&&c.zone!=='일반중심상업';
  const fac=(c.zone==='근린상업'||c.zone==='준주거')?4:2;
  const L= ap&&c.ld>0 ? {apply:true,ok:c.H<=c.ld*fac+1e-9,lim:c.ld*fac}:{apply:false};
  const gf=c.ht==='도시형'?0.25:0.5;
  const G= ap&&c.bd>0 ? {apply:true,ok:c.bd>=c.H*gf-1e-9}:{apply:false};
  const any=sa||L.apply||G.apply, all=sok&&(!L.apply||L.ok)&&(!G.apply||G.ok);
  // 그림자: 경계 법선 θ 방향 성분
  const th=c.az*Math.PI/180, D=c.dist+(six?c.roadW:0); let sh=0,cont=0,mx=0;
  for(let tf=9;tf<15;tf+=0.5){   // 30분 구간 12개(시작 시각 표본)
    const v=sunVec(c.doy,tf,c.lat); const alt=Math.asin(v.U)*180/Math.PI;
    let shadow=false;
    if(alt>1){ const k=c.H/v.U; const tipE=-v.E*k, tipN=-v.N*k; shadow = tipE*Math.sin(th)+tipN*Math.cos(th) >= D; }
    if(shadow) sh+=0.5;
    if(alt>1&&!shadow){cont+=0.5; mx=Math.max(mx,cont);} else cont=0;
  }
  return {sa,sok,eff,md,L,G,any,all,sh,cont:mx};
}
function rnd(a,b,st){return Math.round((a+Math.random()*(b-a))/st)*st;}
(async()=>{
  const b=await chromium.launch(); const pg=await b.newPage();
  const errs=[]; pg.on('pageerror',e=>errs.push(String(e)));
  await pg.goto(path); await pg.waitForTimeout(600);
  const types=await pg.$$eval('#bldgType option',o=>o.map(x=>x.value).filter(Boolean));
  const fixed=[ // 경계 사례
    {zone:'일반2종',type:'공동',H:12,partH:12,dist:6,roadW:0,os:'none',ld:0,bd:0,ht:'일반',ex1:0,ex2:0,ex3:0,az:0,lat:35.87,day:'winter'},
    {zone:'일반2종',type:'단독',H:9,partH:9,dist:1.5,roadW:0,os:'none',ld:0,bd:0,ht:'일반',ex1:0,ex2:0,ex3:0,az:0,lat:35.87,day:'winter'},
    {zone:'일반2종',type:'공동',H:20,partH:20,dist:6,roadW:8,os:'road',ld:0,bd:0,ht:'일반',ex1:0,ex2:0,ex3:0,az:0,lat:35.87,day:'winter'},
    {zone:'일반2종',type:'단독',H:20,partH:20,dist:6,roadW:4,os:'road',ld:0,bd:0,ht:'일반',ex1:0,ex2:0,ex3:0,az:0,lat:35.87,day:'winter'},
    {zone:'준주거',type:'공동',H:40,partH:40,dist:0,roadW:0,os:'none',ld:10,bd:0,ht:'일반',ex1:0,ex2:0,ex3:0,az:0,lat:35.87,day:'winter'},
    {zone:'준주거',type:'공동',H:41,partH:41,dist:0,roadW:0,os:'none',ld:10,bd:0,ht:'일반',ex1:0,ex2:0,ex3:0,az:0,lat:35.87,day:'winter'},
    {zone:'일반중심상업',type:'공동',H:80,partH:80,dist:0,roadW:0,os:'none',ld:5,bd:5,ht:'일반',ex1:0,ex2:0,ex3:0,az:0,lat:35.87,day:'winter'},
    {zone:'유통상업',type:'공동',H:30,partH:30,dist:0,roadW:0,os:'none',ld:14,bd:0,ht:'일반',ex1:0,ex2:0,ex3:0,az:0,lat:35.87,day:'winter'},
    {zone:'일반3종',type:'공동',H:30,partH:30,dist:20,roadW:0,os:'none',ld:0,bd:7.5,ht:'도시형',ex1:0,ex2:0,ex3:0,az:0,lat:35.87,day:'winter'},
    {zone:'일반3종',type:'공동',H:30,partH:30,dist:20,roadW:0,os:'none',ld:0,bd:14,ht:'일반',ex1:0,ex2:0,ex3:0,az:0,lat:35.87,day:'winter'},
    {zone:'일반1종',type:'단독',H:15,partH:15,dist:3,roadW:0,os:'none',ld:0,bd:0,ht:'일반',ex1:0,ex2:1,ex3:0,az:0,lat:35.87,day:'winter'},
    {zone:'공업',type:types.find(t=>t!=='공동'),H:15,partH:15,dist:1,roadW:0,os:'none',ld:0,bd:0,ht:'일반',ex1:0,ex2:0,ex3:0,az:0,lat:35.87,day:'winter'},
  ];
  const cases=[...fixed];
  const lats=await pg.$$eval('#latitude option',o=>o.map(x=>+x.value).filter(x=>x>0));
  for(let i=0;i<300;i++){
    const H=rnd(3,60,0.5); const partH=Math.max(0.5,rnd(0.5,H,0.5));
    cases.push({zone:ZONES[i%ZONES.length],type:types[i%types.length],H,partH,dist:rnd(0,30,0.1),
      roadW:Math.random()<.4?rnd(0,20,0.5):0,os:['none','park','road','river','vacant'][i%5],
      ld:Math.random()<.6?rnd(0,30,0.5):0,bd:Math.random()<.6?rnd(0,40,0.5):0,ht:Math.random()<.5?'일반':'도시형',
      ex1:Math.random()<.1?1:0,ex2:Math.random()<.1?1:0,ex3:Math.random()<.1?1:0,az:rnd(-90,90,1),
      lat:lats[i%lats.length],day:['winter','summer','equinox'][i%3]});
  }
  let pass=0,fail=[]; const types_seen={};
  for(const c of cases){
    if(c.partH>c.H) c.partH=c.H;
    const got=await pg.evaluate((c)=>{
      const sv=(id,v)=>{const e=document.getElementById(id); e.value=v; e.dispatchEvent(new Event('change',{bubbles:true}));};
      sv('zone',c.zone); sv('bldgType',c.type); sv('bldgH',c.H); sv('partH',c.partH); sv('distBound',c.dist);
      sv('roadW',c.roadW); sv('openSpace',c.os); sv('lightDist',c.ld||''); sv('betweenDist',c.bd||''); sv('aptZoneType',c.ht);
      sv('azimuth',c.az); sv('latitude',c.lat);
      ['ex1','ex2','ex3'].forEach(k=>document.getElementById(k).checked=!!c[k]);
      const r=document.querySelector('input[name="refDay"][value="'+c.day+'"]'); if(r) r.checked=true;
      _lastResult=null; calculate(); const d=_lastResult; if(!d) return null;
      return {sa:d.saseonApply,sok:d.saseonOk,eff:d.effDist,md:d.mDist,L:d.light,G:d.gap,any:d.anyApply,all:d.allOk,
        sh:d.shadowData.shadowH09_15,cont:d.shadowData.continuousSun,doy:d.doy,lat:d.lat,
        verdict:(document.querySelector('#result-area, #resultArea, .verdict')||{}).innerText||''};
    },c);
    if(!got){fail.push(['null',c]);continue;}
    c.doy=got.doy; c.lat=got.lat;
    const e=ref(c);
    const chk=[['사선적용',e.sa===got.sa],['사선판정',e.sok===got.sok],['유효이격',Math.abs(e.eff-got.eff)<1e-9],['최소이격',Math.abs(e.md-got.md)<1e-9],
      ['채광적용',e.L.apply===got.L.apply],['채광판정',!e.L.apply||e.L.ok===got.L.ok],['동간적용',e.G.apply===got.G.apply],['동간판정',!e.G.apply||e.G.ok===got.G.ok],
      ['종합',e.any===got.any&&e.all===got.all],['일영',e.sh===got.sh],['연속일조',e.cont===got.cont]];
    const bad=chk.filter(x=>!x[1]).map(x=>x[0]);
    const key=(got.any?(got.all?'적합':'위반'):'대상없음'); types_seen[key]=(types_seen[key]||0)+1;
    if(bad.length) fail.push([bad.join(','),c,e,got]); else pass++;
  }
  console.log(JSON.stringify({total:cases.length,pass,fails:fail.length,verdicts:types_seen,pageErrors:errs.slice(0,5)}));
  fail.slice(0,6).forEach(f=>console.log(JSON.stringify(f).slice(0,700)));
  await b.close();
})();

