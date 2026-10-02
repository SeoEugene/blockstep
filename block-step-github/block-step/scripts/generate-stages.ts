import {writeFileSync} from 'node:fs';
import {SHAPES,emptyBoard,canPlace,resolve,newGame,place,rating} from '../lib/game.ts';
import type {Board,Shape,Stage} from '../lib/game.ts';
const names=['첫 번째 한 줄','차곡차곡','세로로 생각하기','두 줄의 리듬','작은 자신감','숨은 보석','민트 정원','보랏빛 길','반짝이는 모서리','보석 수집가','새로운 모양','교차하는 길','빈칸의 비밀','연속의 즐거움','균형 잡기','신중한 한 수','보석 미로','마지막 빈자리','별을 향해서','블록 마스터'];
let seed=7453;function random(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
const stages:Stage[]=[];
for(let id=1;id<=20;id++){
 let board:Board=emptyBoard();
 if(id>5) board=board.map(()=>random()<(id>15?.47:id>10?.36:.25)?{color:Math.floor(random()*5)}:null);
 // Never begin with an already-complete line.
 for(let r=0;r<8;r++) if(board.slice(r*8,r*8+8).every(Boolean)) board[r*8]=null;
 for(let c=0;c<8;c++) if(Array.from({length:8},(_,r)=>board[r*8+c]).every(Boolean)) board[c]=null;
 const initial=board.map(c=>c?{...c}:null);let totalLines=0;let score=0;let combo=0;
 const supply:Shape[]=[];const solution:Stage['solution']=[];const collectedInitial=new Set<number>();
 let original=new Set(initial.map((v,i)=>v?i:-1).filter(i=>i>=0));
 const target=id<=5?(id<3?1:2):id<=10?3:id<=15?5:7;
 for(let move=0;move<80 && totalLines<target;move++){
  const pool=id<=5?SHAPES.slice(0,5):SHAPES.slice(0,id<=10?10:13);
  let best:{s:Shape,r:number,c:number,value:number}|null=null;
  for(const s of pool) for(let r=0;r<8;r++)for(let c=0;c<8;c++){
   if(!canPlace(board,s,r,c))continue;
   const out=resolve(board,s,r,c);
   const density=out.board.reduce((acc,v,i)=>acc+(v?Math.pow(out.board.slice(Math.floor(i/8)*8,Math.floor(i/8)*8+8).filter(Boolean).length,2)+Math.pow(out.board.filter((_,j)=>j%8===i%8).filter(Boolean).length,2):0),0);
   const value=out.lines*1800+density*.08+s.cells.length*8+(7-r)*.8+random()*22;
   if(!best||value>best.value)best={s,r,c,value};
  }
  if(!best)throw Error('generation stuck');
  const out=resolve(board,best.s,best.r,best.c);out.cleared.forEach(i=>{if(original.has(i)){collectedInitial.add(i);original.delete(i);}});
  board=out.board;totalLines+=out.lines;combo=out.lines?combo+1:0;
  score+=best.s.cells.length*10+out.lines*100+Math.max(0,out.lines-1)*50+Math.max(0,combo-1)*50;
  supply.push(best.s);solution.push({slot:move%3,row:best.r,col:best.c});
 }
 if(totalLines<target)throw Error('target missed');
 const gemPositions=[...collectedInitial].sort(()=>random()-.5).slice(0,id>15?5:id>10?4:3);
 if(id>5)gemPositions.forEach(i=>initial[i]!.gem=true);
 const goal=id<=5?{lines:totalLines}:id<=10?{gems:gemPositions.length}:id<=15?{lines:totalLines,gems:gemPositions.length}:{score, gems:gemPositions.length};
 // Additional deterministic supplies leave room for alternative solutions.
 const count=solution.length;const spare=id<=5?5:id<=10?4:id<=15?3:2;
 while(supply.length<Math.ceil((count+spare)/3)*3) supply.push(SHAPES[Math.floor(random()*(id<=5?5:13))]);
 const stage:Stage={id,name:names[id-1],board:initial,supply,limit:count+spare,goal,stars:[1,spare],solution};
 let g=newGame('stage',stage);
 for(const p of solution){if(g.status==='won')break;const out=place(g,p.slot,p.row,p.col,stage);if(!out)throw Error('invalid solution');g=out.game;}
 if(g.status!=='won'||rating(g,stage)!==3)throw Error('stage not 3-star solvable '+id);
 stages.push(stage);
}
writeFileSync('lib/stages.json',JSON.stringify(stages));
console.log(stages.map(s=>`${s.id}: ${s.name}, ${s.solution.length}/${s.limit} moves, ${JSON.stringify(s.goal)}`).join('\n'));
