import type {Game,Shape} from './game';
export type Saved = {version:1; best:number; stars:number[]; sound:boolean; reduced:boolean; game:Game|null};
export const KEY='block-step-v1';
export const defaults=():Saved=>({version:1,best:0,stars:Array(20).fill(0),sound:true,reduced:false,game:null});
const uint=(v:unknown):v is number=>typeof v==='number'&&Number.isSafeInteger(v)&&v>=0;
const shape=(s:unknown):s is Shape=>!!s&&typeof s==='object'&&'cells'in s&&Array.isArray(s.cells)&&s.cells.length>0&&s.cells.length<=9&&s.cells.every((p:unknown)=>Array.isArray(p)&&p.length===2&&p.every(v=>uint(v)&&v<4))&&'color'in s&&uint(s.color)&&s.color<5&&'name'in s&&typeof s.name==='string';
export function parseSave(raw:string|null):Saved {
 const base=defaults(); if(!raw)return base;
 try{const v=JSON.parse(raw);if(v.version!==1)return base;
  if(uint(v.best))base.best=v.best;
  if(Array.isArray(v.stars)&&v.stars.length===20&&v.stars.every((n:unknown)=>uint(n)&&Number(n)<=3))base.stars=v.stars;
  if(typeof v.sound==='boolean')base.sound=v.sound;if(typeof v.reduced==='boolean')base.reduced=v.reduced;
  const g=v.game;
  if(g && ['classic','stage'].includes(g.mode)&&uint(g.stage)&&(g.mode==='classic'?g.stage===0:g.stage>=1&&g.stage<=20)&&Array.isArray(g.board)&&g.board.length===64&&g.board.every((c:any)=>c===null||(c&&uint(c.color)&&c.color<5&&(c.gem===undefined||typeof c.gem==='boolean')))&&Array.isArray(g.tray)&&g.tray.length===3&&g.tray.every((s:unknown)=>s===null||shape(s))&&['cursor','score','lines','gems','combo','moves','bestAtStart'].every(k=>uint(g[k]))&&g.cursor>=3&&g.cursor%3===0&&g.cursor<=30000&&g.status==='playing'&&typeof g.reason==='string')base.game=g;
  return base;
 }catch{return base;}
}
