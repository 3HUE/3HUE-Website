/* 3HUE digital workforce — character renderer.
 *
 * Ported verbatim from the "3HUE Digital Workforce" introduction (the roster's visual source of
 * truth) so the hub, ECARM and every other 3HUE surface draw the same faces. One function:
 *
 *   agentSVG(look, idPrefix, { thumb })  → <svg> markup of one character
 *
 * `look` carries the fields the artwork is built from (hi/lo tint, skin, hairBase, hair, brows,
 * lashes, beard, inner, tie/tee, acc, prop, iris, key, name, role, status "on" | "onb").
 * `thumb: true` crops to the head (viewBox "14 2 68 72"); otherwise the full character with props
 * and, for agents in onboarding, the lanyard. Every id is prefixed with `idPrefix` so several
 * portraits can share a page. Static markup only — animations live in CSS and only run where the
 * page enables them. */
/* eslint-disable */
/* prettier-ignore */
// ---------- color helpers ----------
const rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const mix=(a,b,t)=>{const A=rgb(a),B=rgb(b);return '#'+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,'0')).join('');};
const Lt=(c,t)=>mix(c,'#ffffff',t), Dk=(c,t)=>mix(c,'#000000',t);
const lum=c=>{const [r,g,b]=rgb(c);return .299*r+.587*g+.114*b;};

function palette(a){
  const {hi,lo,skin:S,hairBase:H}=a;
  const lips=mix(S,'#A8405E',.5);
  const p={
    bg:[hi,mix(hi,lo,.55),Dk(lo,.35)], glow:Lt(hi,.75),
    face:[Lt(S,.14),S,Dk(S,.09),Dk(S,.18)], neck:[Dk(S,.17),Dk(S,.05)], hand:[Lt(S,.1),Dk(S,.08)],
    line:Dk(S,.3), finger:Dk(S,.22), jaw:Dk(S,.33), headShadow:Dk(S,.55), noseShade:Dk(S,.2), noseHi:Lt(S,.3),
    blush: lum(S)>150?'#E0707A':'#A84858', blushOp: lum(S)>150?.28:.3,
    lips, lipLine:Dk(lips,.38), mouthIn:'#3A1424',
    iris:[Lt(hi,.2),mix(hi,lo,.55),Dk(lo,.35)],
    hair:[mix(Lt(H,.38),hi,.22),Lt(H,.08),H,Dk(H,.45)], hairBack:[Lt(H,.04),Dk(H,.4)],
    strand:[Lt(H,.55),mix(Lt(H,.25),hi,.3),mix(Lt(H,.3),hi,.3)],
    brow:Dk(H,.12), eyeLine:Dk(mix(H,lo,.25),.35),
    suit:[mix(lo,hi,.12),Dk(lo,.18),Dk(lo,.5)], sleeve:[mix(lo,hi,.12),Dk(lo,.35)], pants:[Dk(lo,.5),Dk(lo,.72)],
    lapelL:lo, lapelR:Dk(lo,.38), V:Dk(lo,.72), seam:Lt(hi,.55), dark:Dk(lo,.5), hilite:Lt(hi,.25), pantsLine:Dk(lo,.18), shoe:Dk(lo,.82),
    ring:['#F4EBFF',hi,lo,Dk(lo,.45)]
  };
  if(a.iris) p.iris=a.iris;
  if(a.marlowe) Object.assign(p,{
    bg:['#C5A3EF','#7A47B8','#3B1866'], glow:'#F3E8FF',
    face:['#E6BC97','#D4A37C','#C08B66','#AD7957'], neck:['#B07C5A','#C99470'], hand:['#E4B993','#C28D68'],
    line:'#9C6646', finger:'#A9714F', jaw:'#8E5A3E', headShadow:'#5A3324', noseShade:'#A9714F', noseHi:'#E9C3A0',
    blush:'#E0707A', blushOp:.3, lips:'#B65A73', lipLine:'#7A2E46',
    iris:['#C9A6FF','#7A47B8','#3B1866'], hair:['#B98BFF','#6A36B0','#3B1866','#22093F'], hairBack:['#4A2083','#26093F'],
    strand:['#EADCFF','#9566D6','#B48BEA'], brow:'#3A1A63', eyeLine:'#2A1440',
    suit:['#6A36AE','#4A2386','#2E1458'], sleeve:['#6A36AE','#3C1A70'], pants:['#2E1458','#1A0A33'],
    lapelL:'#5A2C9C', lapelR:'#3A186C', V:'#1A0A30', seam:'#D9C6FF', dark:'#2E1458', hilite:'#C9A8F5', pantsLine:'#4A2386', shoe:'#160828',
    ring:['#F4EBFF','#A57AE0','#5B2D8F','#2E1250']
  });
  return p;
}

// ---------- hair styles: back (behind ears/face), front (over the forehead) ----------
const HAIR = {
  bob:{
    back:`<path d="M22 46 C 20 26, 34 13.6, 50 13.6 C 66 13.6, 77 26, 74.4 46 C 73.6 53, 72.6 58, 70.8 61 L 69.4 44 C 60 40, 36 40, 27 44 L 25.4 61 C 23.4 57, 22.4 52, 22 46 Z" fill="HB"/>`,
    front:'M23.6 41 C 23.6 24, 39 15.6, 53.6 16.6 C 66 17.6, 74.6 27, 73.8 41 C 68 32.6, 60 30, 52 32 C 44 29, 33 31.6, 23.6 41 Z',
    strands:[['M30 28 C 38 20.6, 50 18.6, 60 22',0,1.2,.7],['M36 30.6 C 42 25, 52 23.4, 60 26',1,.6,.8],['M62 24 C 67.6 27, 71 31.6, 72.4 36.6',2,.8,.6],['M26.6 36 C 29 30, 33.6 26.6, 39 25',1,.6,.7]]
  },
  long:{
    back:`<path d="M21.6 46 C 19.6 25, 34 13.4, 49.6 13.4 C 66 13.4, 78 25, 75 46 C 75.6 58, 77.6 72, 80.4 86 C 76 90.4, 70 89.6, 66.6 85.4 C 68 72, 69.4 58, 69.4 44 C 60 40, 36 40, 27 44 C 27 58, 28.4 72, 29.6 85.4 C 26 89.6, 20 90.4, 15.6 86 C 18.4 72, 20.4 58, 21.6 46 Z" fill="HB"/>
          <path d="M74 52 C 75 64, 76.6 74, 78.6 84 M22 52 C 21 64, 19.4 74, 17.6 84 M71.6 56 C 72.4 66, 73 74, 72 84" fill="none" stroke="S1" stroke-width=".6" stroke-linecap="round" opacity=".55"/>`,
    front:'M23.6 42 C 22.6 25, 38 15.4, 52 16.4 C 66 17.4, 75 27, 73.8 42 C 71 35, 66 31, 60 30.4 C 52 33.6, 38 34.4, 30 38 C 27.6 39, 25.4 40.4, 23.6 42 Z',
    strands:[['M28 34 C 36 26, 48 21, 62 22',0,1.1,.7],['M34 33 C 42 29, 52 27, 60 28',1,.6,.8],['M64 24 C 69 27.6, 72 32, 73 37',2,.8,.6]]
  },
  crop:{
    back:`<path d="M24.4 44 C 22.6 27, 34 15.6, 48 15.6 C 62 15.6, 73.4 27, 71.6 44 C 71 41, 70 39.4, 69 38.6 C 60 35, 36 35, 27 38.6 C 26 39.4, 25 41, 24.4 44 Z" fill="HB"/>`,
    front:'M24.6 40.4 C 24 27, 35 17.2, 49 17.4 C 62 17.6, 72.6 26, 71.6 39.6 C 68 32.4, 61 28.6, 54 29 C 50 27.4, 46 27.2, 42 28.4 C 34 29.6, 28 33.6, 24.6 40.4 Z',
    strands:[['M30 30 C 36 23, 46 20, 56 21',0,1,.6],['M54 22 C 60 23, 66 26, 69 31',2,.7,.6],['M42 28.4 C 40.4 24, 40.6 21, 42.4 18.4',3,.6,.7]]
  },
  coily:{
    back:`<path d="M24.2 44 C 21.6 26, 33 13.8, 48 13.8 C 63 13.8, 74.4 26, 71.8 44 C 70 40, 66 37, 60 36 L 36 36 C 30 37, 26 40, 24.2 44 Z" fill="HB"/>`,
    front:'M24.4 40 C 23.4 25, 34.6 15.6, 48 15.6 C 61.4 15.6, 72.6 25, 71.6 40 C 69 33.6, 64 30.4, 56 30 C 51 30.6, 45 30.6, 40 30 C 32 30.4, 27 33.6, 24.4 40 Z',
    texture:true,
    strands:[['M29 28 C 36 21, 46 18.6, 56 19.4',0,.9,.5]]
  },
  afro:{
    back:`<g fill="HB"><circle cx="48" cy="27" r="24"/><circle cx="29" cy="33" r="13.5"/><circle cx="67" cy="33" r="13.5"/><circle cx="25.6" cy="47" r="10"/><circle cx="70.4" cy="47" r="10"/><circle cx="37" cy="15.6" r="12"/><circle cx="59" cy="15.6" r="12"/><circle cx="48" cy="11" r="12"/><circle cx="23.6" cy="57" r="6.4"/><circle cx="72.4" cy="57" r="6.4"/></g>`,
    front:'M24.4 42 C 24 28, 35 19.4, 48 19.4 C 61 19.4, 72 28, 71.6 42 C 66 34.4, 58 31.6, 48 32 C 38 31.6, 30 34.4, 24.4 42 Z',
    curls:true,
    strands:[['M31 27 C 37 22, 44 20.4, 52 20.6',0,.9,.45]]
  },
  bun:{
    back:`<circle cx="48" cy="10.6" r="7.6" fill="HB"/><ellipse cx="48" cy="16.8" rx="4.8" ry="1.3" fill="none" stroke="#7FE9FF" stroke-width=".55" filter="url(#Pglow)" opacity=".9"/>
          <path d="M23 46 C 21 26, 34 14.6, 48 14.6 C 62 14.6, 75 26, 73 46 C 72.6 50, 72 53, 71 55 L 69.6 42 C 60 38.6, 36 38.6, 26.4 42 L 25 55 C 24 53, 23.4 50, 23 46 Z" fill="HB"/>
          <path d="M43 8 C 45 5.4, 51 5.4, 53 8" fill="none" stroke="S1" stroke-width=".6" opacity=".6"/>`,
    front:'M23.8 42 C 23.4 26, 35 16.4, 48 16.4 C 61 16.4, 72.6 26, 72.2 42 C 68 33, 60 28.4, 48.6 27 L 47.4 27 C 36 28.4, 28 33, 23.8 42 Z',
    strands:[['M47.6 17 L 48 27',3,.6,.8],['M46 18.6 C 38 20, 30 26, 26 34',0,.9,.6],['M50 18.6 C 58 20, 66 26, 70 34',2,.7,.6]]
  },
  ponytail:{
    back:`<path d="M66 21 C 79 21, 85 34, 83 50 C 82 60, 83.4 68, 86 75 C 80.6 75, 76.6 68.6, 76.2 60 C 75.6 50, 76.4 38, 70 30 Z" fill="HB"/>
          <path d="M78 36 C 80 46, 79.6 58, 82.6 70" fill="none" stroke="S1" stroke-width=".6" opacity=".55"/>
          <path d="M23.6 44 C 21.6 26, 34 14.6, 48.4 14.6 C 63 14.6, 75 26, 72.6 44 L 70 40 C 60 36, 36 36, 26.4 40 Z" fill="HB"/>
          <ellipse cx="71.4" cy="25.6" rx="1.6" ry="2.6" transform="rotate(30 71.4 25.6)" fill="none" stroke="#7FE9FF" stroke-width=".55" filter="url(#Pglow)"/>`,
    front:'M23.8 42 C 23 26, 36 16.2, 50 16.6 C 63 17, 73.6 26, 72.8 41 C 70 34, 65 30.6, 58 30.6 C 50 30, 40 32, 33 36.6 C 29.6 38.6, 26.4 40.4, 23.8 42 Z',
    strands:[['M28 33 C 36 24, 48 20, 60 21.6',0,1.1,.7],['M36 32 C 44 28, 52 27, 60 28',1,.6,.8]]
  },
  swoop:{
    back:`<path d="M24 44 C 22 27, 34 15.4, 48 15.4 C 62 15.4, 74 27, 72 44 C 71 41, 70 39.4, 69 38.6 C 60 35, 36 35, 27 38.6 C 26 39.4, 25 41, 24 44 Z" fill="HB"/>`,
    front:'M24.6 39.6 C 25 30, 31 21, 44 17.2 C 58 13.8, 75 19, 74.4 35 C 74.2 40.6, 72.6 44.6, 70.4 47.4 C 69.6 39, 64 31.6, 55 30.4 C 46 30, 36 31.4, 29 35.6 C 27.4 36.6, 25.8 38, 24.6 39.6 Z',
    strands:[['M30 30 C 40 21, 56 17, 68 22',0,1.1,.7],['M38 31 C 48 25, 60 25, 70 32',1,.6,.8],['M71.6 30 C 73 36, 72.6 41, 71 45',2,.7,.6]]
  },
  locs:{
    back:`<path d="M22.6 46 C 20.6 26, 34 14, 48 14 C 62 14, 75.4 26, 73.4 46 C 74.6 54, 75.6 62, 75.2 70 C 72 72, 69.6 71, 68.6 68 L 69 44 C 60 40, 36 40, 27 44 L 27.4 68 C 26.4 71, 24 72, 20.8 70 C 20.4 62, 21.4 54, 22.6 46 Z" fill="HB"/>
          <g fill="none" stroke="S1" stroke-width=".9" stroke-linecap="round" opacity=".35"><path d="M22.4 48 C 22 56, 22.4 63, 22.2 69"/><path d="M25 48 C 25 56, 25.6 63, 25.6 69"/><path d="M71 48 C 71 56, 70.4 63, 70.4 69"/><path d="M73.6 48 C 74 56, 73.6 63, 73.8 69"/></g>
          <g fill="#FFE08A"><rect x="21.2" y="64" width="2" height="1.2" rx=".4"/><rect x="72.8" y="62" width="2" height="1.2" rx=".4"/></g>`,
    front:'M24 41.4 C 23.4 26, 35 16, 48 16 C 61 16, 72.6 26, 72 41.4 C 68 34, 61 30, 54 29.6 C 53.6 31, 53.2 32.4, 52.6 33 C 52 32, 51.4 30.6, 51 29.4 C 50.4 31, 49.6 32.6, 48.6 33.4 C 48 32, 47.4 30.6, 47 29.4 C 46.4 30.8, 45.6 32.2, 45 33 C 44.4 32, 44 30.6, 43.6 29.6 C 36 30, 28 34, 24 41.4 Z',
    strands:[['M30 30 C 34 24, 40 20, 46 18',1,.9,.6],['M36 31 C 40 25, 46 21, 52 19.4',1,.9,.6],['M44 30 C 48 25, 54 21, 60 20.4',1,.9,.6],['M54 30 C 58 26, 64 23, 68 25',1,.9,.6],['M28 26 C 34 20, 42 17, 52 17',0,.9,.5]]
  },
  cap:{
    back:`<path d="M24.6 46 C 24 40, 24.4 34, 26 31 L 70 31 C 71.6 34, 72 40, 71.4 46 L 69.6 40 C 60 37.6, 36 37.6, 26.4 40 Z" fill="HB"/>`,
    front:'M22.6 35.4 C 22.6 21, 34.4 13.4, 48 13.4 C 61.6 13.4, 73.4 21, 73.4 35.4 Z',
    cap:true, strands:[]
  }
};

// ---------- props held in the right hand: under = behind the fingers, over = in front ----------
function prop(a,P,p){
  const u=x=>`url(#${P}${x})`;
  switch(a.prop){
    case 'dossier': return {under:'',over:`
      <g transform="rotate(-8 67 111)">
        <rect x="56" y="97" width="22" height="29" rx="2.4" fill="${u('holo')}" stroke="#BFF6FF" stroke-width=".55" filter="${u('glow')}"/>
        <g clip-path="${u('holoclip')}">
          <circle cx="60.4" cy="101.6" r="2" fill="#E9FBFF" opacity=".85"/>
          <rect x="63.6" y="100.4" width="10" height="1.2" rx=".6" fill="#E9FBFF" opacity=".9"/>
          <rect x="63.6" y="102.6" width="6" height=".8" rx=".4" fill="#BFF6FF" opacity=".6"/>
          <rect x="58.5" y="107" width="16" height=".9" rx=".45" fill="#BFF6FF" opacity=".55"/>
          <rect x="58.5" y="109.4" width="13" height=".9" rx=".45" fill="#BFF6FF" opacity=".55"/>
          <rect x="58.5" y="111.8" width="15" height=".9" rx=".45" fill="#FFE08A" opacity=".95"/>
          <rect x="58.5" y="114.2" width="11" height=".9" rx=".45" fill="#BFF6FF" opacity=".55"/>
          <path d="M58.5 122.5 L 61 120 L 63.5 121.2 L 66.5 117.4 L 69.5 119 L 73.5 115.6" fill="none" stroke="#7FE9FF" stroke-width=".55"/>
          <rect class="holoScan" x="56" y="100" width="22" height="1.4" fill="${u('holoBeam')}"/>
        </g>
      </g>`};
    case 'phone': return {under:'',over:`
      <g transform="rotate(-6 72 111)">
        <rect x="65.4" y="97.6" width="13.6" height="24.6" rx="2.6" fill="#0B1220" stroke="#F7F2EA" stroke-width=".55"/>
        <rect x="66.5" y="100" width="11.4" height="20" rx="1.4" fill="${u('screen')}"/>
        <rect x="70.2" y="98.6" width="4" height=".6" rx=".3" fill="#2A3550"/>
        <g clip-path="${u('screenclip')}">
          <text x="67.6" y="102.7" font-family="IBM Plex Mono,monospace" font-size="1.45" fill="#7FE9FF" letter-spacing=".08">TALK TRACK</text>
          <rect x="67.6" y="104.6" width="9" height=".75" rx=".37" fill="#E9FBFF" opacity=".85"/>
          <rect x="67.6" y="106.4" width="7.4" height=".75" rx=".37" fill="#E9FBFF" opacity=".6"/>
          <rect x="67.6" y="108.2" width="8.4" height=".75" rx=".37" fill="#FFE08A"/>
          <rect x="67.6" y="110" width="6.4" height=".75" rx=".37" fill="#E9FBFF" opacity=".6"/>
          <rect x="67.6" y="111.8" width="8.8" height=".75" rx=".37" fill="#E9FBFF" opacity=".6"/>
          <rect x="67.6" y="113.6" width="5.6" height=".75" rx=".37" fill="#E9FBFF" opacity=".6"/>
          <rect class="scriptScan" x="66.5" y="104" width="11.4" height="1.8" fill="#7FE9FF" opacity=".16"/>
          <rect x="68.6" y="116.4" width="7.2" height="2.2" rx="1.1" fill="none" stroke="#7FE9FF" stroke-width=".35"/>
          <text x="72.2" y="118" font-family="IBM Plex Mono,monospace" font-size="1.2" fill="#7FE9FF" text-anchor="middle">REVIEW</text>
        </g>
        <rect x="65.4" y="97.6" width="13.6" height="24.6" rx="2.6" fill="none" stroke="#7FE9FF" stroke-width=".3" opacity=".6" filter="${u('glow')}"/>
      </g>`};
    case 'checklist': return {under:'',over:`
      <g transform="rotate(-8 67 111)">
        <rect x="56" y="97" width="22" height="29" rx="2.4" fill="${u('holo')}" stroke="#BFF6FF" stroke-width=".55" filter="${u('glow')}"/>
        <rect x="56" y="97" width="22" height="4.4" rx="2.2" fill="${a.hi}" opacity=".35"/>
        <text x="58.4" y="100.2" font-family="IBM Plex Mono,monospace" font-size="1.6" fill="#F7F2EA" letter-spacing=".08">PREP BRIEF</text>
        ${[104,109,114,119].map((y,i)=>`<rect x="58.4" y="${y}" width="2.6" height="2.6" rx=".5" fill="none" stroke="#BFF6FF" stroke-width=".4"/>
          <path ${i<3?'':'class="lastCheck" opacity="0"'} d="M58.9 ${y+1.3} L 59.7 ${y+2.1} L 61.4 ${y-.2}" fill="none" stroke="#6FE3A1" stroke-width=".55" stroke-linecap="round"/>
          <rect x="62.6" y="${y+.9}" width="${[12,10,13,9][i]}" height=".85" rx=".42" fill="${i===3?'#FFE08A':'#E9FBFF'}" opacity="${i===3?.95:.6}"/>`).join('')}
        <rect class="holoScan" x="56" y="100" width="22" height="1.4" fill="${u('holoBeam')}"/>
      </g>`};
    case 'stamp': return {under:`
      <circle cx="78.2" cy="103.4" r="2.9" fill="${a.hi}" stroke="${Dk(a.lo,.2)}" stroke-width=".4"/>
      <circle cx="77.4" cy="102.5" r=".9" fill="#fff" opacity=".5"/>
      <rect x="76.8" y="105.6" width="2.8" height="8" fill="#2A3550"/>`,
      over:`
      <rect x="72.2" y="116.4" width="12" height="3.6" rx=".8" fill="#1B2333" stroke="${a.hi}" stroke-width=".4"/>
      <rect x="72.6" y="120" width="11.2" height=".9" rx=".4" fill="#7FE9FF" filter="${u('glow')}"/>
      <g transform="translate(61.6 104.4)"><g class="seal">
        <circle r="6.2" fill="${u('holo')}" stroke="#7FE9FF" stroke-width=".45" stroke-dasharray="1.6 .8" filter="${u('glow')}"/>
        <path d="M-2.8 0 L -.6 2.3 L 3.2 -2.4" fill="none" stroke="#6FE3A1" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
        <text y="9" font-family="IBM Plex Mono,monospace" font-size="1.55" fill="#BFF6FF" text-anchor="middle" letter-spacing=".1">VERIFIED</text>
      </g></g>`};
    case 'binoculars': return {under:`
      <path d="M68.6 104 C 64.4 98, 64.2 92, 67.4 87" fill="none" stroke="${a.hi}" stroke-width=".7"/>
      <rect x="67" y="103.4" width="5.8" height="15.6" rx="2.2" fill="#1B2333"/>
      <rect x="73.4" y="103.4" width="5.8" height="15.6" rx="2.2" fill="#1B2333"/>
      <rect x="66.6" y="102.6" width="6.6" height="3" rx="1" fill="#2A3550"/>
      <rect x="73" y="102.6" width="6.6" height="3" rx="1" fill="#2A3550"/>
      <rect x="72.4" y="107" width="1.4" height="6" fill="#2A3550"/>
      <path d="M68 108 L 68 116" stroke="#fff" stroke-width=".5" opacity=".18"/>`,
      over:`
      <ellipse cx="69.9" cy="119.2" rx="2.5" ry=".9" fill="#7FE9FF" filter="${u('glow')}"/>
      <g transform="translate(59 97.4)" opacity=".9"><g class="reticle">
        <circle r="4.2" fill="none" stroke="#7FE9FF" stroke-width=".4" filter="${u('glow')}"/>
        <path d="M0 -6 L 0 -2.4 M0 2.4 L 0 6 M-6 0 L -2.4 0 M2.4 0 L 6 0" stroke="#7FE9FF" stroke-width=".4"/>
        <circle r=".9" fill="#FFE08A"/>
      </g></g>`};
    case 'keys': return {under:'',over:`
      <circle cx="80.2" cy="121.4" r="2.8" fill="none" stroke="#FFE08A" stroke-width=".8"/>
      ${[[-24,'#FFE08A'],[0,'#E9FBFF'],[22,'#FFE08A']].map(([r,c])=>`<g transform="rotate(${r} 80.2 124.2)">
        <circle cx="80.2" cy="125.8" r="1.4" fill="none" stroke="${c}" stroke-width=".6"/>
        <rect x="79.8" y="127.2" width=".8" height="6.2" fill="${c}"/>
        <path d="M80.6 130.4 L 81.8 130.4 M80.6 132 L 81.4 132" stroke="${c}" stroke-width=".55"/></g>`).join('')}
      <g transform="translate(55.4 95.6)">
        <rect width="16.4" height="12.4" rx="1.4" fill="${u('holo')}" stroke="#BFF6FF" stroke-width=".45" filter="${u('glow')}"/>
        <path d="M2 2 H 14.4 V 10.4 H 2 Z M2 6.2 H 7.6 M7.6 2 V 10.4 M11 6.2 V 10.4 M7.6 6.2 H 14.4" fill="none" stroke="#BFF6FF" stroke-width=".35" opacity=".8"/>
        <circle cx="12.6" cy="8.4" r=".9" fill="#FFE08A" filter="${u('glow')}"/>
      </g>`};
    case 'clicker': return {under:`<rect x="76" y="105.6" width="4.4" height="11" rx="1.7" fill="#1B2333"/>`,
      over:`
      <circle cx="78.2" cy="107.8" r=".8" fill="#7FE9FF" filter="${u('glow')}"/>
      <path d="M77.4 106 L 70.6 100" stroke="#7FE9FF" stroke-width=".35" stroke-dasharray="1 .8" opacity=".7"/>
      <g transform="translate(51.2 87.4)"><g class="slide">
        <rect width="20.4" height="13.6" rx="1.4" fill="${u('holo')}" stroke="#BFF6FF" stroke-width=".5" filter="${u('glow')}"/>
        <rect x="2" y="2" width="9" height="1.1" rx=".55" fill="#E9FBFF" opacity=".9"/>
        <path class="storyLine" d="M2.4 11 C 5.6 10.6, 8.6 8, 11.4 7.2 C 13.6 6.6, 16 5.4, 18 3.8" fill="none" stroke="#FFE08A" stroke-width=".6" stroke-linecap="round" stroke-dasharray="20" stroke-dashoffset="0"/>
        <circle cx="2.4" cy="11" r=".6" fill="#FFE08A"/><circle cx="11.4" cy="7.2" r=".6" fill="#FFE08A"/><circle cx="18" cy="3.8" r=".6" fill="#FFE08A"/>
        <circle cx="8.6" cy="12.4" r=".35" fill="#7FE9FF"/><circle cx="10.2" cy="12.4" r=".35" fill="#7FE9FF" opacity=".4"/><circle cx="11.8" cy="12.4" r=".35" fill="#7FE9FF" opacity=".4"/>
      </g></g>`};
    case 'folders': return {under:'',over:`
      <g transform="rotate(-8 68 111)">
        <rect x="60.4" y="100.4" width="17" height="23" rx="1.2" fill="${Dk(a.lo,.25)}"/>
        <rect x="58.6" y="102" width="17" height="23" rx="1.2" fill="${a.lo}"/>
        <rect x="56.8" y="103.6" width="17" height="23" rx="1.2" fill="${mix(a.lo,a.hi,.35)}"/>
        <path d="M56.8 104.8 L 56.8 103.6 L 63 103.6 L 64.2 101.8 L 69 101.8 L 69 103.6" fill="${mix(a.lo,a.hi,.35)}"/>
        <rect x="59" y="108" width="11" height="1" rx=".5" fill="#F7F2EA" opacity=".85"/>
        <rect x="59" y="110.4" width="8" height=".8" rx=".4" fill="#F7F2EA" opacity=".55"/>
        <rect x="73.4" y="106" width="3.6" height="2.4" rx=".6" fill="#FFE08A"/>
        <rect x="73.4" y="110" width="3.6" height="2.4" rx=".6" fill="#7FE9FF"/>
        <rect x="73.4" y="114" width="3.6" height="2.4" rx=".6" fill="#F7A58C"/>
        <rect class="tagGlow" x="59" y="118" width="7.4" height="3.2" rx="1.6" fill="#7FE9FF" fill-opacity="0" stroke="#7FE9FF" stroke-width=".4" filter="${u('glow')}"/>
        <text x="62.7" y="120.2" font-family="IBM Plex Mono,monospace" font-size="1.5" fill="#BFF6FF" text-anchor="middle">INDEXED</text>
      </g>`};
    case 'radar': return {under:`<rect x="70.6" y="104.4" width="8" height="2.6" rx="1.2" fill="#1B2333"/>`,
      over:`
      <circle cx="63" cy="105" r="9" fill="${u('holo')}" stroke="#7FE9FF" stroke-width=".55" filter="${u('glow')}"/>
      <circle cx="63" cy="105" r="6" fill="none" stroke="#BFF6FF" stroke-width=".3" opacity=".6"/>
      <circle cx="63" cy="105" r="3" fill="none" stroke="#BFF6FF" stroke-width=".3" opacity=".6"/>
      <path d="M54 105 H 72 M63 96 V 114" stroke="#BFF6FF" stroke-width=".25" opacity=".5"/>
      <g class="radarSweep"><path d="M63 105 L 63 96 A 9 9 0 0 1 70.2 99.6 Z" fill="${u('sweep')}"/></g>
      <circle class="blipA" cx="59.4" cy="101.4" r=".8" fill="#FFE08A" filter="${u('glow')}"/>
      <circle class="blipB" cx="67.6" cy="108.6" r=".8" fill="#6FE3A1" filter="${u('glow')}"/>`};
    case 'stopwatch': return {under:`
      <rect x="70.6" y="101.2" width="2.4" height="2.6" rx=".5" fill="#C9D2E0"/>
      <circle cx="71.8" cy="111" r="7" fill="#1B2333" stroke="${a.hi}" stroke-width=".8"/>
      <circle cx="71.8" cy="111" r="5.6" fill="#F7F2EA"/>
      <circle class="watchArc" cx="71.8" cy="111" r="5.7" fill="none" stroke="#7FE9FF" stroke-width=".55" transform="rotate(-90 71.8 111)" filter="${u('glow')}"/>
      <path d="M71.8 111 L 74.4 112.6" stroke="#1B2333" stroke-width=".6" stroke-linecap="round"/><path class="watchHand" d="M71.8 111 L 71.8 106.6" stroke="#1B2333" stroke-width=".6" stroke-linecap="round"/>
      <circle cx="71.8" cy="111" r=".6" fill="${a.lo}"/>`,
      over:`
      <g transform="translate(53.6 93)">
        <rect width="20" height="6.4" rx="1.2" fill="${u('holo')}" stroke="#BFF6FF" stroke-width=".4" filter="${u('glow')}"/>
        <path d="M2 3.2 H 18" stroke="#BFF6FF" stroke-width=".3" opacity=".6"/>
        <circle cx="3.4" cy="3.2" r=".9" fill="#6FE3A1"/><circle cx="8.4" cy="3.2" r=".9" fill="#6FE3A1"/><circle cx="13.4" cy="3.2" r=".9" fill="#FFE08A"/><circle class="ms3" cx="13.4" cy="3.2" r=".9" fill="#6FE3A1" opacity="0"/><circle cx="17.6" cy="3.2" r=".9" fill="none" stroke="#BFF6FF" stroke-width=".3"/>
      </g>`};
  }
  return {under:'',over:''};
}

// ---------- inner clothing in the blazer's V and at the neck ----------
function inner(a,p,P){
  const u=x=>`url(#${P}${x})`;
  switch(a.inner){
    case 'turtle': return {v:p.V, neck:`
      <path d="M40 75.4 C 42 81.4, 54 81.4, 56 75.4 L 56.6 81.4 C 53 85.4, 43 85.4, 39.4 81.4 Z" fill="${p.V}"/>
      <path d="M39.8 81.2 C 43 85, 53 85, 56.2 81.2" fill="none" stroke="#7FE9FF" stroke-width=".45" opacity=".8" filter="${u('glow')}"/>`};
    case 'tie': return {v:'#EEF1F6', neck:`
      <path d="M42.2 77.4 L 47.6 83 L 43.2 85.2 L 40.8 79.2 Z" fill="#FFFFFF" stroke="#C9D2E0" stroke-width=".3"/>
      <path d="M53.8 77.4 L 48.4 83 L 52.8 85.2 L 55.2 79.2 Z" fill="#FFFFFF" stroke="#C9D2E0" stroke-width=".3"/>
      <path d="M46.4 82.8 L 49.6 82.8 L 49 85.6 L 47 85.6 Z" fill="${Dk(a.tie,.2)}"/>
      <path d="M47 85.6 L 49 85.6 L 50.2 95.2 L 48 97.4 L 45.8 95.2 Z" fill="${a.tie}"/>
      <path d="M46.5 91.2 L 49.5 91.2" stroke="#7FE9FF" stroke-width=".55" filter="${u('glow')}"/>`};
    case 'tee': return {v:a.tee, neck:`
      <path d="M41.6 78.8 C 43.6 82.4, 52.4 82.4, 54.4 78.8" fill="none" stroke="${Dk(a.tee,.25)}" stroke-width=".9"/>
      <path d="M42.6 80.6 C 44.8 83.4, 51.2 83.4, 53.4 80.6" fill="none" stroke="#7FE9FF" stroke-width=".35" opacity=".7" filter="${u('glow')}"/>`};
    case 'blouse': return {v:Lt(a.hi,.6), neck:`
      <path d="M44.4 78.8 L 48 85.6 L 51.6 78.8 Z" fill="${p.neck[1]}"/>
      <path d="M44.4 78.8 L 48 85.6 L 51.6 78.8" fill="none" stroke="${Lt(a.hi,.35)}" stroke-width=".6"/>
      <circle cx="48" cy="84.2" r=".75" fill="#7FE9FF" filter="${u('glow')}"/>`};
    case 'mandarin': return {v:Dk(a.lo,.62), neck:`
      <path d="M41.2 76.4 C 43 79, 53 79, 54.8 76.4 L 55.4 80.6 C 53 82.8, 43 82.8, 40.6 80.6 Z" fill="${Dk(a.lo,.5)}"/>
      <path d="M40.8 80.6 C 43 82.6, 53 82.6, 55.2 80.6" fill="none" stroke="#7FE9FF" stroke-width=".45" opacity=".85" filter="${u('glow')}"/>
      <circle cx="48" cy="81.6" r=".55" fill="#FFE08A"/>`};
  }
}

// ---------- face accessories ----------
function faceAcc(a,P){
  const u=x=>`url(#${P}${x})`;
  switch(a.acc){
    case 'roundGlasses': return {features:`<g class="glasses">
      <g fill="none" stroke="#E6FFF3" stroke-width=".7">
        <circle cx="38.6" cy="47.6" r="6.2" fill="${Lt(a.hi,.5)}" fill-opacity=".1"/><circle cx="57.4" cy="47.6" r="6.2" fill="${Lt(a.hi,.5)}" fill-opacity=".1"/>
        <path d="M44.8 46.8 C 46.4 45.4, 49.6 45.4, 51.2 46.8 M32.4 46.4 L 25 45.4 M63.6 46.4 L 71 45.4"/>
      </g>
      <circle cx="38.6" cy="47.6" r="5.5" fill="none" stroke="#7FE9FF" stroke-width=".25" opacity=".6"/>
      <circle cx="57.4" cy="47.6" r="5.5" fill="none" stroke="#7FE9FF" stroke-width=".25" opacity=".6"/>
      <path d="M34.4 43.6 A 5 5 0 0 1 38 42" stroke="#fff" stroke-width=".7" fill="none" opacity=".7" stroke-linecap="round"/>
      <circle cx="62.6" cy="44.2" r=".6" fill="#7FE9FF" filter="${u('glow')}"/>
      <path class="gleam" d="M33 52 L 44 42 M52 52 L 63 42" stroke="#fff" stroke-width="1.1" stroke-linecap="round" opacity="0"/></g>`};
    case 'halfGlasses': return {features:`<g class="glasses">
      <g fill="none" stroke-linecap="round">
        <path d="M32.2 44.4 C 35 42.8, 42 42.8, 45 44.4 M51 44.4 C 54 42.8, 61 42.8, 63.8 44.4" stroke="${Lt(a.hi,.15)}" stroke-width="1.3"/>
        <path d="M32.4 44.6 C 32.8 51, 44.4 51, 44.8 44.6 M51.2 44.6 C 51.6 51, 63.2 51, 63.6 44.6" stroke="#E9FBFF" stroke-width=".3" opacity=".55"/>
        <path d="M45 44.4 C 46.4 43.4, 49.6 43.4, 51 44.4 M32.2 44.4 L 25 44 M63.8 44.4 L 71 44" stroke="${Lt(a.hi,.15)}" stroke-width=".7"/>
      </g>
      <circle cx="63.6" cy="44.4" r=".6" fill="#7FE9FF" filter="${u('glow')}"/>
      <path class="gleam" d="M34 50 L 42 43 M53 50 L 61 43" stroke="#fff" stroke-width="1" stroke-linecap="round" opacity="0"/></g>`};
    case 'visor': return {features:`
      <rect x="28.4" y="41.4" width="39.2" height="11.6" rx="5.8" fill="${u('visor')}" stroke="#7FE9FF" stroke-width=".5" filter="${u('glow')}"/>
      <g clip-path="${u('visorclip')}"><rect class="visorScan" x="30" y="41.4" width="3" height="11.6" fill="#BFF6FF" opacity=".28"/><rect class="visorFlash" x="28.4" y="41.4" width="39.2" height="11.6" fill="#BFF6FF" opacity="0"/></g>
      <path d="M31.6 43.2 C 40 42, 56 42, 64.4 43.2" stroke="#fff" stroke-width=".55" fill="none" opacity=".55" stroke-linecap="round"/>
      <circle cx="66" cy="47.2" r=".6" fill="#FFE08A" filter="${u('glow')}"/>`};
    default: return {features:''};
  }
}
function earAcc(a,P){
  const u=x=>`url(#${P}${x})`;
  switch(a.acc){
    case 'headset': return {band:`
      <path d="M23.4 47 C 19.4 17.6, 76.6 17.6, 72.6 47" fill="none" stroke="#1B2333" stroke-width="2"/>
      <path d="M24 40 C 24 22, 72 22, 72 40" fill="none" stroke="${a.hi}" stroke-width=".4" opacity=".8"/>`,
      front:`
      <rect x="19.4" y="43.4" width="6.6" height="11.4" rx="3.2" fill="#1B2333" stroke="${a.hi}" stroke-width=".5"/>
      <rect x="70" y="43.4" width="6.6" height="11.4" rx="3.2" fill="#1B2333" stroke="${a.hi}" stroke-width=".5"/>
      <circle cx="22.7" cy="49" r=".8" fill="#7FE9FF" filter="${u('glow')}"/>
      <path d="M23 54.4 C 24.4 62, 30 66.6, 36.6 66.4" fill="none" stroke="#1B2333" stroke-width="1.1" stroke-linecap="round"/>
      <circle cx="37.4" cy="66.3" r="1.2" fill="#7FE9FF" filter="${u('glow')}"/>`};
    case 'earrings': return {band:`<rect x="58" y="23.4" width="6" height="1.3" rx=".65" transform="rotate(-24 61 24)" fill="#7FE9FF" filter="${u('glow')}"/>`,
      front:`<path d="M24.4 54.6 L 24.4 57.6 M71.6 54.6 L 71.6 57.6" stroke="#E9FBFF" stroke-width=".4"/>
      <circle cx="24.4" cy="58.8" r="1.2" fill="#7FE9FF" filter="${u('glow')}"/><circle cx="71.6" cy="58.8" r="1.2" fill="#7FE9FF" filter="${u('glow')}"/>`};
    case 'earpiece': return {band:'', front:`
      <rect x="70.2" y="45.6" width="3.4" height="7.4" rx="1.7" fill="#1B2333" stroke="${a.hi}" stroke-width=".45"/>
      <circle cx="71.9" cy="47.8" r=".7" fill="#7FE9FF" filter="${u('glow')}"/>
      <path d="M72 53 C 71.6 56, 69.6 58.4, 67 59.4" fill="none" stroke="#1B2333" stroke-width=".6" stroke-linecap="round"/>
      <path d="M22.6 46.4 C 21.6 48, 21.6 50.4, 22.6 52" fill="none" stroke="#FFE08A" stroke-width=".6" stroke-linecap="round"/>`};
    case 'stylus': return {band:`
      <g class="stylusStatic"><path d="M25.4 28.6 L 19.2 49.6" stroke="#F7F2EA" stroke-width="1.4" stroke-linecap="round"/>
      <path d="M25.4 28.6 L 24.2 32.6" stroke="${a.lo}" stroke-width="1.5" stroke-linecap="round"/>
      <circle cx="19" cy="50.2" r=".8" fill="#7FE9FF" filter="${u('glow')}"/></g>`,
      front:`<circle cx="24.4" cy="55.4" r=".8" fill="#FFE08A"/><circle cx="71.6" cy="55.4" r=".8" fill="#FFE08A"/>`};
    default: return {band:'',front:''};
  }
}

// ---------- effects that appear during a signature gesture ----------
function fx(a,P){
  const u=x=>`url(#${P}${x})`;
  const chip=(cls,x,y,w,txt,col)=>`<g class="${cls}" opacity="0"><rect x="${x}" y="${y}" width="${w}" height="6.4" rx="3.2" fill="#0B1220" fill-opacity=".72" stroke="${col}" stroke-width=".5" filter="${u('glow')}"/><text x="${x+w/2}" y="${y+4.4}" font-family="IBM Plex Mono,monospace" font-size="2.6" font-weight="500" fill="${col}" text-anchor="middle" letter-spacing=".1">${txt}</text></g>`;
  switch(a.key){
    case 'huey': return chip('fxA',-9,85,21,'← THIS WAY','#7FE9FF');
    case 'vera': return chip('fxA',-8,86,14,'HOLD','#FFE08A');
    case 'aries': return `<g class="fxA" opacity="0"><text x="-1" y="47" font-family="IBM Plex Mono,monospace" font-size="5" fill="#F7F2EA" text-anchor="middle">filler</text>
        <path class="strike" d="M-9.4 45.4 L 7.4 45.4" stroke="#FF8A6A" stroke-width="1.1" stroke-linecap="round" stroke-dasharray="17" stroke-dashoffset="17"/></g>`;
    case 'theo': return ['1','2','3'].map((n,i)=>`<g class="fxN fxN${i}" opacity="0"><circle cx="${2+i*6}" cy="32" r="2.6" fill="#0B1220" fill-opacity=".72" stroke="#B7DD92" stroke-width=".5" filter="${u('glow')}"/><text x="${2+i*6}" y="33.1" font-family="IBM Plex Mono,monospace" font-size="3" fill="#E9FBFF" text-anchor="middle">${n}</text></g>`).join('');
    case 'trevor': return `<g class="fxA" opacity="0"><circle cx="1" cy="38" r="3.2" fill="#0B1220" fill-opacity=".72" stroke="#FFE08A" stroke-width=".5" filter="${u('glow')}"/><text x="1" y="39.4" font-family="IBM Plex Mono,monospace" font-size="4" fill="#FFE08A" text-anchor="middle">!</text></g>`;
    case 'quinn': return `<g class="fxA" opacity="0"><circle cx="4" cy="34" r="3" fill="#0B1220" fill-opacity=".72" stroke="#6FE3A1" stroke-width=".5" filter="${u('glow')}"/><path d="M2.6 34 L 3.6 35.2 L 5.6 32.8" fill="none" stroke="#6FE3A1" stroke-width=".7" stroke-linecap="round"/></g>`;
    default: return '';
  }
}

// ---------- one complete character, every id prefixed with P ----------
function agentSVG(a,P,opts={}){
  const p=palette(a), u=x=>`url(#${P}${x})`, H=HAIR[a.hair];
  const pr=prop(a,P,p), inn=inner(a,p,P), fa=faceAcc(a,P), ea=earAcc(a,P);
  const browW=a.brows==='thick'?2.1:a.brows==='thin'?1.45:1.7;
  const fill=s=>s.replaceAll('HB',u('hairBack')).replaceAll('S1',p.strand[1]).replaceAll('url(#Pglow)',u('glow'));
  const strandCol=i=>i===3?Dk(a.hairBase,.35):p.strand[i];
  // coily / curl texture
  let texture='';
  if(H.texture){ const pts=[]; for(let y=18;y<=30;y+=2.4) for(let x=28;x<=68;x+=2.8){ const xx=x+((y*7)%3)-1; const dx=xx-48, top=16+Math.pow(Math.abs(dx)/24,2)*14; if(y>top+1 && y<31-Math.pow(Math.abs(dx)/26,2)*-2) pts.push([xx,y]); }
    texture=`<g fill="${p.strand[0]}" opacity=".22">${pts.map(([x,y],i)=>`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${i%2?.45:.32}"/>`).join('')}</g>`; }
  const curls=H.curls?`<g fill="${u('hairFill')}">${[30,35.4,41,46.6,52.2,57.8,63.2,67.6].map((x,i)=>`<circle cx="${x}" cy="${33.8-Math.sin(i/7*Math.PI)*2.4}" r="${i%2?3.4:3}"/>`).join('')}</g>`:'';
  const cap=H.cap?`
      <path d="M24.4 37.4 L 27.8 37.4 L 27 46 L 24.8 45 Z M71.6 37.4 L 68.2 37.4 L 69 46 L 71.2 45 Z" fill="${a.hairBase}" opacity=".9"/>
      <path d="${H.front}" fill="${u('capFill')}"/>
      <g clip-path="${u('hairclip')}"><rect class="hairSheen" x="10" y="10" width="14" height="40" fill="${u('sheenG')}" transform="skewX(-20)"/></g>
      <path d="M48 13.4 L 48 35 M35.6 16.4 C 38.6 23, 39.6 29, 39.6 35 M60.4 16.4 C 57.4 23, 56.4 29, 56.4 35" fill="none" stroke="${Dk(a.lo,.35)}" stroke-width=".45"/>
      <circle cx="48" cy="14" r="1.1" fill="${Dk(a.lo,.35)}"/>
      <path d="M20.4 35.4 C 30 31.8, 66 31.8, 75.6 35.4 C 70 38.2, 26 38.2, 20.4 35.4 Z" fill="${Dk(a.lo,.4)}"/>
      <path d="M21 35.6 C 30 37.8, 66 37.8, 75 35.6" fill="none" stroke="#7FE9FF" stroke-width=".45" filter="${u('glow')}"/>
      <path d="M30 22 C 36 17.6, 44 16, 52 16.4" fill="none" stroke="#fff" stroke-width=".9" opacity=".35" stroke-linecap="round"/>`:'';
  const beard = a.beard==='full'?`<path d="M26.2 50 C 26.8 63, 35.6 73.6, 48 73.8 C 60.4 73.6, 69.2 63, 69.8 50 C 67.2 56, 63.6 58.8, 60 59.4 C 57 59.8, 55 58.8, 52.6 58.6 C 50.6 58.4, 49 59, 48 59.6 C 47 59, 45.4 58.4, 43.4 58.6 C 41 58.8, 39 59.8, 36 59.4 C 32.4 58.8, 28.8 56, 26.2 50 Z" fill="${a.hairBase}"/>
      <path d="M30 60 C 34 67, 41 71, 48 71.4 C 55 71, 62 67, 66 60" fill="none" stroke="${Lt(a.hairBase,.25)}" stroke-width=".4" opacity=".5"/>`
    : a.beard==='stubble'?`<path d="M27 52 C 28 64, 36 72.6, 48 73 C 60 72.6, 68 64, 69 52 C 66 58, 62 60.4, 58 60.6 C 55 66.4, 41 66.4, 38 60.6 C 34 60.4, 30 58, 27 52 Z" fill="${a.hairBase}" opacity=".22"/>
      <path d="M41.4 60.2 C 44 58.8, 52 58.8, 54.6 60.2" fill="none" stroke="${a.hairBase}" stroke-width="1.1" opacity=".3" stroke-linecap="round"/>`:'';
  const lashL=a.lashes?`<path d="M32.9 46.6 L 31.6 45.6 M33.6 45.5 L 32.6 44.2" stroke="${p.eyeLine}" stroke-width=".6" stroke-linecap="round"/>`:'';
  const lashR=a.lashes?`<path d="M63.2 46.6 L 64.5 45.6 M62.5 45.5 L 63.5 44.2" stroke="${p.eyeLine}" stroke-width=".6" stroke-linecap="round"/>`:'';
  const eyeR=`
                    <path d="M51.8 47.6 C 53.4 43.8, 61.8 43.8, 63.4 47.6 C 61.8 51, 53.4 51, 51.8 47.6 Z" fill="#FFFFFF"/>
                    <circle cx="57.4" cy="47.6" r="2.9" fill="${u('iris')}"/>
                    <circle cx="57.4" cy="47.6" r="1.35" fill="#150B26"/>
                    <circle cx="58.5" cy="46.5" r=".8" fill="#fff"/>
                    <path d="M51.4 47.2 C 53.2 43.2, 61.6 43.2, 63.4 47.4" fill="none" stroke="${p.eyeLine}" stroke-width="1.1" stroke-linecap="round"/>${lashR}`;
  let ticks=''; for(let i=0;i<24;i++){const g=i/24*Math.PI*2, r1=10.6, r2=i%6==0?11.7:11.2; ticks+=`<line x1="${(57.5+Math.cos(g)*r1).toFixed(2)}" y1="${(47.3+Math.sin(g)*r1).toFixed(2)}" x2="${(57.5+Math.cos(g)*r2).toFixed(2)}" y2="${(47.3+Math.sin(g)*r2).toFixed(2)}"/>`;}
  const monocle=`
              <g clip-path="${u('lensclip')}">
                <circle cx="57.5" cy="47.3" r="9" fill="${u('skinFace')}"/>
                <g class="dataScroll" opacity=".35">
                  <rect x="50" y="39" width="8" height=".6" rx=".3" fill="#2FB7D6"/><rect x="50" y="41" width="12" height=".45" rx=".2" fill="#B48BEA"/>
                  <rect x="50" y="43" width="9" height=".45" rx=".2" fill="#B48BEA"/><rect x="50" y="45" width="6" height=".6" rx=".3" fill="#E0B341"/>
                  <rect x="50" y="47" width="11" height=".45" rx=".2" fill="#B48BEA"/><rect x="50" y="49" width="8" height=".45" rx=".2" fill="#B48BEA"/>
                  <rect x="50" y="51" width="8" height=".6" rx=".3" fill="#2FB7D6"/><rect x="50" y="53" width="12" height=".45" rx=".2" fill="#B48BEA"/>
                  <rect x="50" y="55" width="9" height=".45" rx=".2" fill="#B48BEA"/><rect x="50" y="57" width="6" height=".6" rx=".3" fill="#E0B341"/>
                </g>
                <g class="eye eyeR"><g>${eyeR}</g></g>
                <circle cx="57.5" cy="47.3" r="9" fill="${u('lensGlass')}"/>
                <path d="M51.4 42.8 A 8 8 0 0 1 59.2 39.4" fill="none" stroke="#fff" stroke-width="1" stroke-linecap="round" opacity=".85"/>
              </g>
              <circle cx="57.5" cy="47.3" r="9.4" fill="none" stroke="${u('ring')}" stroke-width="2"/>
              <circle cx="57.5" cy="47.3" r="8.2" fill="none" stroke="#7FE9FF" stroke-width=".3" opacity=".9" filter="${u('glow')}"/>
              <g clip-path="${u('lensclip')}"><g class="lensScan"><path d="M57.5 39.9 A 7.4 7.4 0 0 1 64.45 44.77" fill="none" stroke="#7FE9FF" stroke-width=".45" stroke-linecap="round" filter="${u('glow')}"/></g></g>
              <g stroke="#E9DCFF" stroke-width=".28" opacity=".8">${ticks}</g>
              <path class="photon" d="M66.9 47.4 C 69 46.8, 71 45.6, 73.4 43.6" fill="none" stroke="#FFE08A" stroke-width=".9" stroke-linecap="round" filter="${u('glow')}"/>
              <path d="M66.9 47.4 C 69 46.8, 71 45.6, 73.4 43.6" fill="none" stroke="${u('gold')}" stroke-width=".45" stroke-linecap="round" opacity=".6"/>
              <circle cx="66.9" cy="47.4" r=".85" fill="#FFE08A" filter="${u('glow')}"/>`;
  const lanyard = a.status==='onb' ? `
        <path d="M43.4 80.4 L 46 104 M52.6 80.4 L 50 104" stroke="#FFE08A" stroke-width=".7" fill="none"/>
        <rect x="41.8" y="103.2" width="12.4" height="8.8" rx="1.2" fill="#0B1220" stroke="#FFE08A" stroke-width=".45"/>
        <text x="48" y="106.5" font-family="IBM Plex Mono,monospace" font-size="1.5" fill="#FFE08A" text-anchor="middle" letter-spacing=".06">ONBOARDING</text>
        <rect x="43.6" y="108.4" width="8.8" height="1.1" rx=".55" fill="#2A3550"/>
        <g clip-path="${u('onbclip')}"><rect class="onbBar" x="43.6" y="108.4" width="3.4" height="1.1" rx=".55" fill="#7FE9FF" filter="${u('glow')}"/></g>` : '';
  const vb = opts.thumb ? '14 2 68 72' : '-12 -4 120 200';

  return `<svg viewBox="${vb}" role="img" aria-label="${a.name}, ${a.role}" ${opts.thumb?'':'class="hero"'}>
      <defs>
        <linearGradient id="${P}bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${p.bg[0]}"/><stop offset=".55" stop-color="${p.bg[1]}"/><stop offset="1" stop-color="${p.bg[2]}"/></linearGradient>
        <radialGradient id="${P}bgGlow" cx=".5" cy=".36" r=".55"><stop offset="0" stop-color="${p.glow}" stop-opacity=".6"/><stop offset="1" stop-color="${p.glow}" stop-opacity="0"/></radialGradient>
        <pattern id="${P}grid" width="6" height="6" patternUnits="userSpaceOnUse"><path d="M6 0 L0 0 0 6" fill="none" stroke="#fff" stroke-width=".12" opacity=".35"/></pattern>
        <radialGradient id="${P}skinFace" cx=".42" cy=".34" r=".78"><stop offset="0" stop-color="${p.face[0]}"/><stop offset=".6" stop-color="${p.face[1]}"/><stop offset=".9" stop-color="${p.face[2]}"/><stop offset="1" stop-color="${p.face[3]}"/></radialGradient>
        <linearGradient id="${P}skinNeck" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.neck[0]}"/><stop offset="1" stop-color="${p.neck[1]}"/></linearGradient>
        <radialGradient id="${P}skinHand" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="${p.hand[0]}"/><stop offset="1" stop-color="${p.hand[1]}"/></radialGradient>
        <radialGradient id="${P}iris" cx=".45" cy=".4" r=".6"><stop offset="0" stop-color="${p.iris[0]}"/><stop offset=".6" stop-color="${p.iris[1]}"/><stop offset="1" stop-color="${p.iris[2]}"/></radialGradient>
        <linearGradient id="${P}hairFill" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${p.hair[0]}"/><stop offset=".4" stop-color="${p.hair[1]}"/><stop offset=".75" stop-color="${p.hair[2]}"/><stop offset="1" stop-color="${p.hair[3]}"/></linearGradient>
        <linearGradient id="${P}hairBack" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.hairBack[0]}"/><stop offset="1" stop-color="${p.hairBack[1]}"/></linearGradient>
        <linearGradient id="${P}capFill" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${Lt(a.hi,.1)}"/><stop offset=".5" stop-color="${a.lo}"/><stop offset="1" stop-color="${Dk(a.lo,.35)}"/></linearGradient>
        <linearGradient id="${P}sheenG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".45"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
        <linearGradient id="${P}suit" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.suit[0]}"/><stop offset=".55" stop-color="${p.suit[1]}"/><stop offset="1" stop-color="${p.suit[2]}"/></linearGradient>
        <linearGradient id="${P}suitSleeve" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${p.sleeve[0]}"/><stop offset="1" stop-color="${p.sleeve[1]}"/></linearGradient>
        <linearGradient id="${P}pants" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.pants[0]}"/><stop offset="1" stop-color="${p.pants[1]}"/></linearGradient>
        <linearGradient id="${P}ring" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${p.ring[0]}"/><stop offset=".35" stop-color="${p.ring[1]}"/><stop offset=".7" stop-color="${p.ring[2]}"/><stop offset="1" stop-color="${p.ring[3]}"/></linearGradient>
        <radialGradient id="${P}lensGlass" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".32"/><stop offset=".6" stop-color="#7FE9FF" stop-opacity=".06"/><stop offset="1" stop-color="#7FE9FF" stop-opacity=".2"/></radialGradient>
        <linearGradient id="${P}gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF4C8"/><stop offset=".5" stop-color="#FFE08A"/><stop offset="1" stop-color="#C9962E"/></linearGradient>
        <linearGradient id="${P}holo" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#BFF6FF" stop-opacity=".32"/><stop offset="1" stop-color="${a.hi}" stop-opacity=".14"/></linearGradient>
        <linearGradient id="${P}holoBeam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7FE9FF" stop-opacity="0"/><stop offset=".5" stop-color="#7FE9FF" stop-opacity=".9"/><stop offset="1" stop-color="#7FE9FF" stop-opacity="0"/></linearGradient>
        <linearGradient id="${P}screen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${Dk(a.lo,.45)}"/><stop offset="1" stop-color="#0B1220"/></linearGradient>
        <linearGradient id="${P}visor" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7FE9FF" stop-opacity=".32"/><stop offset=".5" stop-color="${a.hi}" stop-opacity=".18"/><stop offset="1" stop-color="#7FE9FF" stop-opacity=".32"/></linearGradient>
        <linearGradient id="${P}sweep" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#7FE9FF" stop-opacity="0"/><stop offset="1" stop-color="#7FE9FF" stop-opacity=".6"/></linearGradient>
        <clipPath id="${P}faceclip"><path d="M48 21 C 63 21, 72 32, 72 46 C 72 60, 64 72.6, 48 73.4 C 32 72.6, 24 60, 24 46 C 24 32, 33 21, 48 21 Z"/></clipPath>
        <clipPath id="${P}lensclip"><circle cx="57.5" cy="47.3" r="8.9"/></clipPath>
        <clipPath id="${P}hairclip"><path d="${H.front}"/></clipPath>
        <clipPath id="${P}holoclip"><rect x="56" y="97" width="22" height="29" rx="2.4"/></clipPath>
        <clipPath id="${P}screenclip"><rect x="66.5" y="100" width="11.4" height="20" rx="1.4"/></clipPath>
        <clipPath id="${P}visorclip"><rect x="28.4" y="41.4" width="39.2" height="11.6" rx="5.8"/></clipPath>
        <clipPath id="${P}onbclip"><rect x="43.6" y="108.4" width="8.8" height="1.1" rx=".55"/></clipPath>
        <filter id="${P}glow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation=".9" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="${P}soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="1.4"/></filter>
        <filter id="${P}blur3" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"/></filter>
      </defs>

      <rect x="-12" y="-4" width="120" height="200" fill="${u('bg')}"/>
      <rect x="-12" y="-4" width="120" height="200" fill="${u('grid')}" opacity=".16"/>
      <rect x="-12" y="-4" width="120" height="200" fill="${u('bgGlow')}"/>
      <g class="particles"></g>

      <ellipse cx="48" cy="180.5" rx="30" ry="4.6" fill="#7FE9FF" opacity=".14" filter="${u('blur3')}"/>
      <ellipse class="platRing" cx="48" cy="180.5" rx="31" ry="5" fill="none" stroke="#7FE9FF" stroke-width=".5" stroke-dasharray="4 3 1 3" opacity=".7" filter="${u('glow')}"/>
      <ellipse cx="48" cy="180" rx="22" ry="2.8" fill="${Dk(a.lo,.7)}" opacity=".45" filter="${u('soft')}"/>

      <g class="float">
      <g class="body">
        <path d="M33 134 L 34.6 174.5 L 45.4 174.5 L 47.2 134 Z" fill="${u('pants')}"/>
        <path d="M48.8 134 L 50.6 174.5 L 61.4 174.5 L 63 134 Z" fill="${u('pants')}"/>
        <path d="M40 140 L 40.2 173 M56 140 L 55.8 173" stroke="${p.pantsLine}" stroke-width=".5" opacity=".7"/>
        <path d="M30 179 C 30 175, 33.6 173.6, 39 173.6 C 44 173.6, 46.6 175, 46.6 179 Z" fill="${p.shoe}"/>
        <path d="M49.4 179 C 49.4 175, 52 173.6, 57 173.6 C 62.4 173.6, 66 175, 66 179 Z" fill="${p.shoe}"/>
        <path d="M30.4 179 L 46.2 179 M49.8 179 L 65.6 179" stroke="#7FE9FF" stroke-width=".55" stroke-linecap="round" opacity=".8" filter="${u('glow')}"/>
        <ellipse cx="35" cy="175.4" rx="3.6" ry=".9" fill="#fff" opacity=".18"/>
        <ellipse cx="55" cy="175.4" rx="3.6" ry=".9" fill="#fff" opacity=".18"/>

        <g class="armWave">
          <path d="M22 86 C 16 94, 15 108, 17 122 L 24.6 122.5 C 24 110, 25.6 98, 29.4 90 Z" fill="${u('suitSleeve')}"/>
          <path d="M19 104 C 20 100, 22 97, 24.4 95" fill="none" stroke="${p.sleeve[1]}" stroke-width=".5" opacity=".7"/>
          <path d="M16.8 120.6 L 24.8 121" stroke="${p.dark}" stroke-width="1.6" stroke-linecap="round"/>
          <path d="M17.4 122.4 C 16.6 127, 17.6 131, 20.8 131.4 C 24 131.6, 25.2 128.4, 24.8 122.6 Z" fill="${u('skinHand')}"/>
          <ellipse cx="25.4" cy="125.6" rx="1.2" ry="2.4" transform="rotate(-18 25.4 125.6)" fill="${u('skinHand')}"/>
          <path d="M18.6 129 L 18.8 131 M20.6 129.6 L 20.8 131.4 M22.6 129.4 L 22.8 131.2" stroke="${p.finger}" stroke-width=".35" stroke-linecap="round"/>
          <ellipse class="thumbUp" cx="21.6" cy="133.4" rx="1.25" ry="2.7" fill="${u('skinHand')}" stroke="${p.finger}" stroke-width=".25" opacity="0"/>
          ${a.key==='aries'?`<g class="heldStylus" opacity="0"><path d="M21.8 127.4 L 13.2 133.4" stroke="#F7F2EA" stroke-width="1.4" stroke-linecap="round"/><path d="M21.8 127.4 L 19.6 128.9" stroke="${a.lo}" stroke-width="1.5" stroke-linecap="round"/><circle cx="12.8" cy="133.7" r=".9" fill="#7FE9FF" filter="${u('glow')}"/></g>`:''}
          ${a.key==='marlowe'?`<g class="sigPhone" opacity="0">
            <rect x="15.6" y="114.6" width="10.8" height="18.4" rx="2.2" fill="#0B1220" stroke="#F7F2EA" stroke-width=".45"/>
            <rect x="16.5" y="116.6" width="9" height="14.6" rx="1.2" fill="${u('screen')}"/>
            <circle cx="19" cy="119.6" r="1.4" fill="#E9FBFF" opacity=".9"/>
            <rect x="21" y="118.6" width="3.8" height=".8" rx=".4" fill="#E9FBFF"/><rect x="21" y="120.2" width="2.8" height=".6" rx=".3" fill="#BFF6FF" opacity=".7"/>
            <rect x="17.4" y="122.8" width="7.2" height=".6" rx=".3" fill="#BFF6FF" opacity=".6"/><rect x="17.4" y="124.2" width="6" height=".6" rx=".3" fill="#BFF6FF" opacity=".6"/><rect x="17.4" y="125.6" width="6.6" height=".6" rx=".3" fill="#FFE08A"/>
            <rect x="17.6" y="127.6" width="6.8" height="2.2" rx="1.1" fill="#6FE3A1" opacity=".22" stroke="#6FE3A1" stroke-width=".3"/>
            <text x="21" y="129.2" font-family="IBM Plex Mono,monospace" font-size="1.2" fill="#6FE3A1" text-anchor="middle">READY</text>
            <rect x="15.6" y="114.6" width="10.8" height="18.4" rx="2.2" fill="none" stroke="#7FE9FF" stroke-width=".3" opacity=".7" filter="${u('glow')}"/>
          </g>`:''}
        </g>

        <path d="M20 92 C 20 84, 30 80.4, 41 79 L 48 86 L 55 79 C 66 80.4, 76 84, 76 92 L 73.2 128.5 C 72.8 134, 69 137, 64 137 L 32 137 C 27 137, 23.4 134, 23 128.5 Z" fill="${u('suit')}"/>
        <path d="M41.6 79 L 48 96 L 54.4 79 Z" fill="${inn.v}"/>
        <path d="M41 79 L 48 96 L 45 112 L 37.4 106 C 37 96, 38.4 86, 41 79 Z" fill="${p.lapelL}"/>
        <path d="M55 79 L 48 96 L 51 112 L 58.6 106 C 59 96, 57.6 86, 55 79 Z" fill="${p.lapelR}"/>
        <path class="seam" d="M41 79 L 48 96 L 45 112" stroke="${p.seam}" stroke-width=".4" fill="none" opacity=".7"/>
        <path class="seam" d="M55 79 L 48 96 L 51 112" stroke="${p.seam}" stroke-width=".4" fill="none" opacity=".7"/>
        <path d="M48 96 L 48 137" stroke="${p.dark}" stroke-width=".7"/>
        <path d="M27.5 117.5 L 37 117.5" stroke="${p.dark}" stroke-width=".9" stroke-linecap="round"/>
        <circle cx="48" cy="108" r="1.15" fill="#7FE9FF" filter="${u('glow')}"/>
        <circle cx="48" cy="119" r="1.15" fill="#7FE9FF" filter="${u('glow')}"/>
        <path d="M24 90 C 26 85, 32 81.4, 39.6 80" fill="none" stroke="${p.hilite}" stroke-width=".8" stroke-linecap="round" opacity=".5"/>
        <path d="M24 112 C 25.5 120, 27 126, 30 131 M72 112 C 70.5 120, 69 126, 66 131" fill="none" stroke="${p.dark}" stroke-width=".6" opacity=".6"/>
        <ellipse cx="32.1" cy="96.6" rx="7.2" ry="3.4" fill="#7FE9FF" opacity=".18" filter="${u('soft')}"/>
        ${opts.thumb?'':`<image class="logo" x="25.8" y="94.1" width="12.6" height="5" preserveAspectRatio="xMidYMid meet"/>`}

        <path d="M42.2 66 L 42.2 79 L 53.8 79 L 53.8 66 Z" fill="${u('skinNeck')}"/>
        ${inn.neck}
        ${lanyard}

        <g class="armProp">
        <path d="M74 86 C 80 93, 82.6 102, 82 110.4 L 75.6 110.8 C 76.2 102, 73 94, 68 89 Z" fill="${u('suitSleeve')}"/>
        <path d="M75.4 109 L 82.2 108.6" stroke="${p.dark}" stroke-width="1.6" stroke-linecap="round"/>
        ${pr.under}
        <path d="M76.6 110.6 C 76 114, 76.8 117.6, 79.6 118.2 C 82.6 118.6, 83.6 115.4, 82.8 110.4 Z" fill="${u('skinHand')}"/>
        ${pr.over}
        <ellipse cx="76.2" cy="113.2" rx="1.4" ry="2.7" transform="rotate(-14 76.2 113.2)" fill="${u('skinHand')}"/>
        </g>

        <g class="head">
          <g class="tilt">
            <ellipse cx="48" cy="75" rx="12" ry="2.4" fill="${p.headShadow}" opacity=".4" filter="${u('soft')}"/>
            ${fill(H.back)}
            ${a.marlowe?`<path class="chainBack photon" d="M73.6 43.4 C 76 40.6, 76.2 35.6, 73.4 31.4" fill="none" stroke="#FFE08A" stroke-width=".9" stroke-linecap="round" opacity=".9" filter="${u('glow')}"/>`:''}
            <g class="ears">
              <ellipse cx="24.4" cy="50" rx="3.1" ry="5" fill="${u('skinFace')}"/>
              <path d="M24.6 47 C 23 48.4, 23 51.6, 24.8 53" fill="none" stroke="${p.line}" stroke-width=".55" stroke-linecap="round"/>
              <ellipse cx="71.6" cy="50" rx="3.1" ry="5" fill="${u('skinFace')}"/>
              <path d="M71.4 47 C 73 48.4, 73 51.6, 71.2 53" fill="none" stroke="${p.line}" stroke-width=".55" stroke-linecap="round"/>
            </g>
            <path d="M48 21 C 63 21, 72 32, 72 46 C 72 60, 64 72.6, 48 73.4 C 32 72.6, 24 60, 24 46 C 24 32, 33 21, 48 21 Z" fill="${u('skinFace')}"/>

            <g clip-path="${u('faceclip')}"><g class="featuresInner">
              <ellipse cx="48" cy="72" rx="16" ry="5" fill="${p.jaw}" opacity=".22" filter="${u('soft')}"/>
              <g class="mood happy-only">
                <ellipse cx="35.6" cy="57" rx="4.4" ry="2.4" fill="${p.blush}" opacity="${p.blushOp}" filter="${u('soft')}"/>
                <ellipse cx="61" cy="57" rx="4" ry="2.2" fill="${p.blush}" opacity="${p.blushOp-.04}" filter="${u('soft')}"/>
              </g>
              ${beard}
              <g fill="none" stroke="${p.brow}" stroke-width="${browW}" stroke-linecap="round">
                <path class="mood happy-only browL" d="M33 40.6 Q 38.5 37.4 44.2 39.4"/>
                <path class="mood happy-only browR" d="M51.4 38.8 Q 57.2 36 63 39"/>
                <path class="mood sad-only" d="M33 40.4 Q 38.8 40.2 44.2 37.4"/>
                <path class="mood sad-only" d="M51.8 37.4 Q 57.2 40 63 40.6"/>
              </g>
              <g class="eye eyeL">
                <path d="M33 47.6 C 34.6 43.8, 42.6 43.8, 44.2 47.6 C 42.6 51, 34.6 51, 33 47.6 Z" fill="#FFFFFF"/>
                <circle cx="38.8" cy="47.6" r="2.9" fill="${u('iris')}"/>
                <circle cx="38.8" cy="47.6" r="1.35" fill="#150B26"/>
                <circle cx="39.9" cy="46.5" r=".8" fill="#fff"/>
                <circle cx="37.7" cy="48.7" r=".35" fill="#fff" opacity=".8"/>
                <path d="M32.6 47.4 C 34.4 43.2, 42.8 43.2, 44.6 47.2" fill="none" stroke="${p.eyeLine}" stroke-width="1.15" stroke-linecap="round"/>
                ${lashL}
              </g>
              ${a.marlowe?'':`<g class="eye eyeR">${eyeR}</g>`}
              <path class="tear" d="M37.6 51.6 C 37.6 51.6, 36 54, 36 55 A 1.6 1.6 0 0 0 39.2 55 C 39.2 54, 37.6 51.6, 37.6 51.6 Z" fill="#BFF6FF" stroke="#7FB8E6" stroke-width=".3"/>
              <path d="M49 49.6 C 49.8 52.8, 50.6 55, 48.8 56.2 C 48 56.7, 47 56.5, 46.4 56" fill="none" stroke="${p.line}" stroke-width=".85" stroke-linecap="round"/>
              <path d="M48.2 45 C 48.6 47.6, 49 49.6, 49.6 51.4" fill="none" stroke="${p.noseHi}" stroke-width=".5" stroke-linecap="round" opacity=".35"/>
              <ellipse cx="49.6" cy="55.6" rx="1.6" ry=".8" fill="${p.noseShade}" opacity=".45"/>
              <g class="smile mood happy-only">
                <path d="M41.6 61.4 C 44.6 65, 51.4 65, 54.4 61.4 C 51.8 62.4, 44.2 62.4, 41.6 61.4 Z" fill="${p.lips}"/>
                <path d="M41.6 61.4 C 44.6 64.4, 51.4 64.4, 54.4 61.4" fill="none" stroke="${p.lipLine}" stroke-width=".7" stroke-linecap="round"/>
                <path d="M45.6 63.8 C 47 64.3, 49 64.3, 50.4 63.8" fill="none" stroke="#fff" stroke-width=".35" opacity=".45"/>
              </g>
              <path class="mood sad-only" d="M42.6 64.6 C 45 62, 51 62, 53.4 64.6" fill="none" stroke="${p.lipLine}" stroke-width="1.1" stroke-linecap="round"/>
              <g class="mouthOpen" style="transform:scaleY(0)">
                <path d="M42 61.3 C 44.6 62.5, 51.4 62.5, 54 61.3 C 53.4 66.6, 50.6 68.4, 48 68.4 C 45.4 68.4, 42.6 66.6, 42 61.3 Z" fill="#3A1424" stroke="${p.lipLine}" stroke-width=".6"/>
                <rect x="43.8" y="61.7" width="8.4" height="1.6" rx=".8" fill="#FFFDF8"/>
                <ellipse cx="48" cy="66.6" rx="3" ry="1.3" fill="#D9718C"/>
              </g>
              ${a.marlowe?monocle:''}
              ${fa.features}
            </g></g>
            <g class="earsFront">${ea.front}</g>

            <g class="hairGroup">
              ${H.cap?cap:`
              <path d="${H.front}" fill="${u('hairFill')}"/>
              ${curls}
              <g clip-path="${u('hairclip')}"><rect class="hairSheen" x="10" y="10" width="14" height="40" fill="${u('sheenG')}" transform="skewX(-20)"/></g>
              ${texture}
              ${H.strands.map(([d,c,w,o])=>`<path d="${d}" fill="none" stroke="${strandCol(c)}" stroke-width="${w}" stroke-linecap="round" opacity="${o}"/>`).join('')}`}
              ${ea.band}
            </g>
          </g>
        </g>
      </g>
      ${opts.thumb?'':fx(a,P)}
      </g>
    </svg>`;
}

export { agentSVG, palette, HAIR, mix, Lt, Dk, lum };
