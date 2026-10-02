export type Cell = { color: number; gem?: boolean } | null;
export type Board = Cell[];
export type Shape = { cells: [number, number][]; color: number; name: string };
export type Goal = { lines?: number; gems?: number; score?: number };
export type Stage = { id: number; name: string; board: Board; supply: Shape[]; limit: number; goal: Goal; stars: [number, number]; solution: { slot: number; row: number; col: number }[] };
export type Game = { mode: 'classic' | 'stage'; stage: number; board: Board; tray: (Shape | null)[]; cursor: number; score: number; lines: number; gems: number; combo: number; moves: number; status: 'playing' | 'won' | 'lost'; reason: string; bestAtStart: number };
export const SHAPES: Shape[] = [
 {cells:[[0,0]],color:0,name:'한 칸'},
 {cells:[[0,0],[0,1]],color:1,name:'가로 두 칸'},
 {cells:[[0,0],[1,0]],color:2,name:'세로 두 칸'},
 {cells:[[0,0],[0,1],[0,2]],color:3,name:'가로 세 칸'},
 {cells:[[0,0],[1,0],[2,0]],color:4,name:'세로 세 칸'},
 {cells:[[0,0],[0,1],[1,0],[1,1]],color:0,name:'작은 정사각형'},
 {cells:[[0,0],[1,0],[1,1]],color:2,name:'작은 ㄴ자'},
 {cells:[[0,0],[0,1],[0,2],[0,3]],color:1,name:'가로 네 칸'},
 {cells:[[0,0],[1,0],[2,0],[3,0]],color:3,name:'세로 네 칸'},
 {cells:[[0,0],[1,0],[2,0],[2,1]],color:4,name:'긴 ㄴ자'},
 {cells:[[0,0],[0,1],[0,2],[1,1]],color:2,name:'ㅜ자'},
 {cells:[[0,1],[0,2],[1,0],[1,1]],color:0,name:'번개'},
 {cells:[[0,0],[0,1],[0,2],[1,0],[1,1],[1,2],[2,0],[2,1],[2,2]],color:1,name:'큰 정사각형'}
];
export const emptyBoard = (): Board => Array(64).fill(null);
export function canPlace(board: Board, shape: Shape, row: number, col: number) {
 return Number.isInteger(row) && Number.isInteger(col) && shape.cells.every(([r,c])=>r+row>=0 && r+row<8 && c+col>=0 && c+col<8 && !board[(row+r)*8+col+c]);
}
export function resolve(board: Board, shape: Shape, row: number, col: number) {
 const next = board.map(c=>c?{...c}:null);
 shape.cells.forEach(([r,c])=>next[(row+r)*8+col+c]={color:shape.color});
 const rows=Array.from({length:8},(_,r)=>r).filter(r=>next.slice(r*8,r*8+8).every(Boolean));
 const cols=Array.from({length:8},(_,c)=>c).filter(c=>Array.from({length:8},(_,r)=>next[r*8+c]).every(Boolean));
 const cleared=next.map((_,i)=>i).filter(i=>rows.includes(Math.floor(i/8)) || cols.includes(i%8));
 const gems=cleared.filter(i=>next[i]?.gem).length;
 cleared.forEach(i=>next[i]=null);
 return { board:next, lines:rows.length+cols.length, gems, cleared };
}
export function hasMove(board: Board, tray: (Shape|null)[]) {return tray.some(s=>s && board.some((_,i)=>canPlace(board,s,Math.floor(i/8),i%8)));}
export function goalMet(game: Pick<Game,'score'|'lines'|'gems'>, goal: Goal) {return Object.entries(goal).every(([k,v])=>game[k as keyof typeof game]>=v!);}
export function randomTray(): Shape[] {return Array.from({length:3},()=>SHAPES[Math.floor(Math.random()*SHAPES.length)]);}
export function newGame(mode: Game['mode'], stage?: Stage, best=0):Game {
 return {mode,stage:stage?.id??0,board:stage?stage.board.map(c=>c?{...c}:null):emptyBoard(),tray:stage?stage.supply.slice(0,3):randomTray(),cursor:3,score:0,lines:0,gems:0,combo:0,moves:0,status:'playing',reason:'',bestAtStart:best};
}
export function place(game: Game, slot:number,row:number,col:number,stage?:Stage,draw=randomTray) {
 const shape=game.tray[slot];
 if(game.status!=='playing'||!shape||!canPlace(game.board,shape,row,col)) return null;
 const result=resolve(game.board,shape,row,col);
 const combo=result.lines?game.combo+1:0;
 const points=shape.cells.length*10+result.lines*100+Math.max(0,result.lines-1)*50+Math.max(0,combo-1)*50;
 const next:Game={...game,board:result.board,tray:[...game.tray],score:game.score+points,lines:game.lines+result.lines,gems:game.gems+result.gems,combo,moves:game.moves+1};
 next.tray[slot]=null;
 if(stage && goalMet(next,stage.goal)) next.status='won';
 else if(stage && next.moves>=stage.limit) {next.status='lost';next.reason='주어진 배치 횟수를 모두 사용했어요.';}
 if(next.status==='playing') {
  if(next.tray.every(s=>!s)) {next.tray=stage?stage.supply.slice(next.cursor,next.cursor+3):draw();next.cursor+=3;}
  if(!hasMove(next.board,next.tray)){next.status='lost';next.reason='남은 블록을 놓을 자리가 없어요.';}
 }
 return {game:next,cleared:result.cleared,points,lines:result.lines};
}
export function rating(game:Game,stage:Stage) {const left=stage.limit-game.moves;return left>=stage.stars[1]?3:left>=stage.stars[0]?2:1;}
