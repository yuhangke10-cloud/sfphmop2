'use strict';
const screen=document.getElementById('screen');
let theme=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light',mode='satellite';
// Coordinates measured on the supplied 7680 x 4320 exports.
const regions={theme:[7258,76,154,174],satellite:[3850,512,390,142],line:[4240,512,405,142],network:[4645,512,530,142]};
function layout(){const scale=innerHeight/4320,offset=(innerWidth-7680*scale)/2;for(const [id,[x,y,w,h]]of Object.entries(regions)){Object.assign(document.getElementById(id).style,{left:(offset+x*scale)+'px',top:y*scale+'px',width:w*scale+'px',height:h*scale+'px'});}}
function render(){screen.src='assets/images/'+theme+'-'+mode+'.png';document.documentElement.dataset.theme=theme;document.getElementById('theme').setAttribute('aria-label',theme==='light'?'Switch to dark theme':'Switch to light theme');for(const id of ['satellite','line','network'])document.getElementById(id).setAttribute('aria-pressed',String(id===mode));layout();}
document.getElementById('theme').onclick=()=>{theme=theme==='light'?'dark':'light';render();};
for(const id of ['satellite','line','network'])document.getElementById(id).onclick=()=>{mode=id;render();};
addEventListener('resize',layout);render();