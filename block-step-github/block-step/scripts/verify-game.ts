import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {SHAPES,emptyBoard,canPlace,resolve,hasMove,newGame,place,rating} from '../lib/game.ts';
import type {Stage,Game,Board} from '../lib/game.ts';
import {defaults,parseSave} from '../lib/storage.ts';
let checks=0;
function test(name:string,fn:()=>void){fn();checks++;console.log('PASS '+name)}
const dot=SHAPES[0];
test('overlap, negative coordinates, fractions, and board edges rejected',()=>{const b=emptyBoard();b[0]={color:0};assert(!canPlace(b,dot,0,0));assert(!canPlace(b,dot,-1,0));assert(!canPlace(b,SHAPES[3],0,6));assert(!canPlace(b,dot,.5,0));assert(canPlace(b,SHAPES[3],7,5));});
test('crossing row and column clear simultaneously with one gem count',()=>{const b=emptyBoard();for(let n=0;n<8;n++){b[n]={color:0};b[n*8]={color:1};}b[0]={color:0,gem:true};b[1]=null;b[9]=null; // use a vertical domino completing row 0 and column 0 was already full: valid resolve fixture
 const out=resolve(b,SHAPES[2],0,1);assert.equal(out.lines,2);assert.equal(out.cleared.length,15);assert.equal(out.gems,1);assert.equal(out.board.filter(Boolean).length,1);
});
test('two newly completed crossing lines and exact score',()=>{const b=emptyBoard();for(let n=1;n<8;n++){b[n]={color:0};b[n*8]={color:1,gem:n===1};}const g={...newGame('classic'),board:b,tray:[dot,dot,dot]};const out=place(g,0,0,0)!;assert.equal(out.lines,2);assert.equal(out.game.score,260);assert.equal(out.game.gems,1);assert.equal(out.game.board.filter(Boolean).length,0);});
test('tray is supplied only after all three are used',()=>{let calls=0;const draw=()=>{calls++;return [dot,dot,dot]};let g:Game={...newGame('classic'),tray:[dot,dot,dot]};for(let i=0;i<3;i++){g=place(g,i,0,i,undefined,draw)!.game;assert.equal(calls,i===2?1:0)}assert.equal(g.cursor,6);assert(g.tray.every(Boolean));});
test('invalid move is immutable and does not consume move or score',()=>{const g=newGame('classic');const snapshot=JSON.stringify(g);assert.equal(place(g,0,8,8),null);assert.equal(JSON.stringify(g),snapshot);});
test('combo score builds and resets on a non-clear',()=>{const b=emptyBoard();for(let r=0;r<2;r++)for(let c=0;c<7;c++)b[r*8+c]={color:0};let g:Game={...newGame('classic'),board:b,tray:[dot,dot,dot]};g=place(g,0,0,7)!.game;assert.equal(g.score,110);g=place(g,1,1,7)!.game;assert.equal(g.score,270);assert.equal(g.combo,2);g=place(g,2,7,7)!.game;assert.equal(g.combo,0);assert.equal(g.score,280);});
test('game over depends on every remaining piece',()=>{const b=Array(64).fill({color:0}) as Board;b[1]=null;assert(!hasMove(b,[SHAPES[5],null,SHAPES[3]]));assert(hasMove(b,[SHAPES[5],null,dot]));});
const stages=JSON.parse(readFileSync('lib/stages.json','utf8')) as Stage[];
test('all 20 fixed-supply stages achieve three stars; replay is deterministic',()=>{assert.equal(stages.length,20);for(const stage of stages){let g=newGame('stage',stage);for(const move of stage.solution){if(g.status==='won')break;const out=place(g,move.slot,move.row,move.col,stage);assert(out,`stage ${stage.id} invalid move`);g=out.game;}assert.equal(g.status,'won',`stage ${stage.id}`);assert.equal(rating(g,stage),3);assert.deepEqual(newGame('stage',stage),newGame('stage',stage));}});
test('victory takes priority on the final allowed placement',()=>{const s={...stages[0],limit:stages[0].solution.length};let g=newGame('stage',s);for(const m of s.solution){if(g.status==='won')break;g=place(g,m.slot,m.row,m.col,s)!.game;}assert.equal(g.status,'won');assert.equal(g.moves,s.limit);});
test('move limit fails with unmet goal',()=>{const s={...stages[0],limit:1,goal:{lines:999}};const g=newGame('stage',s),m=s.solution[0];assert.equal(place(g,m.slot,m.row,m.col,s)!.game.status,'lost');});
test('save restores exactly and damaged data is safely discarded',()=>{const d=defaults();d.best=500;d.stars[0]=3;d.game=newGame('stage',stages[0]);assert.deepEqual(parseSave(JSON.stringify(d)),d);assert.deepEqual(parseSave('{broken'),defaults());assert.deepEqual(parseSave('{"version":2}'),defaults());const corrupt={...d,game:{...d.game,board:[null]}};assert.equal(parseSave(JSON.stringify(corrupt)).game,null);assert.equal(parseSave(JSON.stringify(corrupt)).best,500);});
console.log(`\n${checks} verification groups passed. All 20 stages validated.`);
