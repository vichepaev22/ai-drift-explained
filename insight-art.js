/* Original symbolic science artwork for editorial insight cards.
   These vectors are illustrations, not GPT-rendered photographs or evidence charts. */
const motifs={
  "reasoning": "<path d=\"M29 31c-14-14-30 6-17 19-7 13 4 27 17 22 11 14 28 2 25-11 12-7 8-24-4-27-1-17-18-19-21-3Z\"/><path d=\"M29 31v41m0-25-10-7m10 21 12-7m13-19-13 9m13 17-12-7\"/>",
  "multimodal": "<rect x=\"7\" y=\"18\" width=\"46\" height=\"42\" rx=\"5\"/><circle cx=\"20\" cy=\"32\" r=\"5\"/><path d=\"m13 52 13-12 10 8 8-11 9 11\"/><path d=\"M63 25h31v33H63zM68 68h26M68 76h17\"/><circle cx=\"78\" cy=\"42\" r=\"8\"/>",
  "agents": "<circle cx=\"15\" cy=\"52\" r=\"9\"/><circle cx=\"50\" cy=\"23\" r=\"10\"/><circle cx=\"83\" cy=\"52\" r=\"9\"/><circle cx=\"50\" cy=\"80\" r=\"10\"/><path d=\"m23 45 20-17m15 0 18 18m0 12-19 17m-15 0-20-17\"/><path d=\"m46 23 4 4 7-9\"/>",
  "efficiency": "<rect x=\"19\" y=\"16\" width=\"61\" height=\"68\" rx=\"10\"/><path d=\"M31 31h37M31 44h22M31 57h14M31 70h8\"/><path d=\"m70 39-13 20h13l-8 19\"/><path d=\"M40 8v8M60 8v8M40 84v8M60 84v8\"/>",
  "rag": "<path d=\"M21 14h44l13 13v55H21z\"/><path d=\"M65 14v13h13M31 40h27M31 50h19M31 60h13\"/><circle cx=\"72\" cy=\"67\" r=\"17\"/><path d=\"m84 79 12 12\"/>",
  "diffusion": "<circle cx=\"50\" cy=\"50\" r=\"9\"/><circle cx=\"50\" cy=\"50\" r=\"23\" stroke-dasharray=\"5 8\"/><circle cx=\"50\" cy=\"50\" r=\"39\" stroke-dasharray=\"2 13\"/><circle cx=\"88\" cy=\"39\" r=\"4\"/><circle cx=\"19\" cy=\"72\" r=\"5\"/><path d=\"m25 15 13 15m41 44-14-10\"/>",
  "bio": "<path d=\"M22 8c56 25 56 59 0 84M78 8C22 33 22 67 78 92\"/><path d=\"M28 20h44M37 31h26M42 43h16M42 57h16M37 69h26M28 80h44\"/>",
  "code": "<path d=\"m30 27-22 23 22 23m40-46 22 23-22 23m-11-58-20 70\"/><circle cx=\"50\" cy=\"8\" r=\"3\"/><circle cx=\"50\" cy=\"92\" r=\"3\"/>",
  "reliability": "<path d=\"M50 7 82 21v24c0 24-17 39-32 48-15-9-32-24-32-48V21Z\"/><path d=\"M50 28v30m0 13v2\"/><circle cx=\"50\" cy=\"22\" r=\"1\"/>",
  "language": "<circle cx=\"50\" cy=\"50\" r=\"39\"/><path d=\"M11 50h78M50 11c-24 20-24 58 0 78m0-78c24 20 24 58 0 78M19 29h62M19 70h62\"/>",
  "classic": "<rect x=\"16\" y=\"13\" width=\"67\" height=\"77\" rx=\"6\"/><path d=\"M27 29h45M27 42h41M27 55h31M27 68h24\"/><path d=\"m56 75 8 8 15-19\"/>",
  "foundations": "<path d=\"m50 6 32 16v17L50 55 18 39V22Z\"/><path d=\"m18 39 32 16 32-16M50 55v20m-32-8 32 17 32-17M18 55v12m64-12v12\"/>",
  "robots": "<rect x=\"17\" y=\"27\" width=\"66\" height=\"52\" rx=\"14\"/><path d=\"M50 27V13m-7 0h14M12 49H5m90 0h-7\"/><circle cx=\"36\" cy=\"49\" r=\"5\"/><circle cx=\"64\" cy=\"49\" r=\"5\"/><path d=\"M35 67h30\"/>",
  "benchmarks": "<path d=\"M13 86h75M18 65h15v21H18zm24-19h15v40H42zm24-28h15v68H66z\"/><path d=\"m18 41 20-9 18 8 22-26\"/>",
  "audio": "<path d=\"M7 48h8l7-20 9 46 10-62 9 73 11-54 8 34 9-25 6 10h9\"/><circle cx=\"50\" cy=\"50\" r=\"40\" stroke-dasharray=\"3 12\"/>",
  "spatial": "<path d=\"m50 9 38 20v42L50 92 12 71V29zM12 29l38 22 38-22M50 51v41\"/><circle cx=\"50\" cy=\"9\" r=\"4\"/>",
  "alignment": "<circle cx=\"50\" cy=\"50\" r=\"38\"/><circle cx=\"50\" cy=\"50\" r=\"22\"/><circle cx=\"50\" cy=\"50\" r=\"7\"/><path d=\"m55 45 32-32m-11 0h11v11\"/>",
  "science": "<path d=\"M9 81h84M15 15v70\"/><path d=\"M17 56c12-32 25-32 35 0s25 32 39 0\"/><path d=\"M20 75c14-17 29-22 42-18 10 3 18 11 29 14\" stroke-dasharray=\"5 5\"/>",
  "medical": "<path d=\"M35 12h30v24h23v28H65v24H35V64H12V36h23z\"/><path d=\"m19 78 16-15 12 10 15-20 19 21\"/>",
  "timeseries": "<path d=\"M12 13v74h78\"/><polyline points=\"16,64 29,51 41,60 56,33 69,40 87,15\"/><path d=\"M16 76h72\" stroke-dasharray=\"4 9\"/>",
  "prompts": "<path d=\"M11 19h78v51H41L24 87V70H11z\"/><path d=\"m32 44 10 9 25-24M32 61h35\"/>",
  "privacy": "<rect x=\"21\" y=\"42\" width=\"58\" height=\"47\" rx=\"8\"/><path d=\"M33 42V28a17 17 0 0 1 34 0v14\"/><circle cx=\"50\" cy=\"62\" r=\"5\"/><path d=\"M50 67v10\"/>",
  "video": "<rect x=\"10\" y=\"22\" width=\"80\" height=\"56\" rx=\"5\"/><path d=\"M25 22v56M75 22v56M10 39h80M10 61h80\"/><path d=\"m40 39 21 11-21 11z\"/>",
  "visionclassic": "<path d=\"M12 33V15h18M70 15h18v18M88 67v18H70M30 85H12V67\"/><circle cx=\"50\" cy=\"50\" r=\"17\"/><circle cx=\"50\" cy=\"50\" r=\"5\"/>",
  "attacks": "<path d=\"M50 7 84 20v28c0 20-13 34-34 45-21-11-34-25-34-45V20z\"/><path d=\"m26 59 17-21 12 12 18-23m-7 0h7v7\"/>",
  "uncertainty": "<circle cx=\"50\" cy=\"50\" r=\"40\" stroke-dasharray=\"4 5\"/><path d=\"M35 36c0-23 32-24 32-3 0 11-17 12-17 28M50 77v3\"/>",
  "watermarks": "<circle cx=\"50\" cy=\"50\" r=\"37\"/><path d=\"m31 51 13 13 26-28\"/><circle cx=\"50\" cy=\"50\" r=\"26\" stroke-dasharray=\"2 8\"/><path d=\"M50 3v10M50 87v10M3 50h10M87 50h10\"/>",
  "memory": "<path d=\"M33 13c-19-1-25 19-16 30-11 14-1 31 14 30 8 15 28 12 30-1 16 0 22-18 12-29 9-14-2-31-17-28-7-10-20-10-23-2z\"/><path d=\"M33 13v60m0-40 14-8m-14 29 18 7m10-42-14 20m14 33-14-20\"/>",
  "brain": "<path d=\"M10 70h12l9-30 10 45 11-61 10 47 10-20 9 19h11\"/><path d=\"M22 26c7-13 19-13 28-5 9-8 21-8 28 5\" stroke-dasharray=\"5 5\"/>",
  "motion": "<path d=\"M12 79c23-61 38-15 52-48 7-16 16-16 24-17\" stroke-dasharray=\"7 6\"/><circle cx=\"12\" cy=\"79\" r=\"6\"/><circle cx=\"88\" cy=\"14\" r=\"8\"/><path d=\"m76 10 12 4-7 11\"/>"
};
const colors=["#5cebd4","#84b8ff","#d69fff","#f7c96b","#6bdfd7","#fc96a3","#81c5ff","#a5a7ff"];
const keys=["reasoning","multimodal","agents","efficiency","rag","diffusion","bio","code","reliability","language","classic","foundations","robots","benchmarks","audio","spatial","alignment","science","medical","timeseries","prompts","privacy","video","visionclassic","attacks","uncertainty","watermarks","memory","brain","motion"];
const escapeAttr = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function insightArt(id,title){
  const at=keys.indexOf(id);
  const n=Math.max(0,at);
  const c=colors[n%colors.length], b=colors[(n+3)%colors.length];
  const safe=(id in motifs)?id:'reasoning';
  const stars=Array.from({length:43},(_,i)=>{
    const x=(i*173+n*59+31)%1190+6, y=(i*67+n*23+13)%334+3, r=i%5===0?1.7:.9;
    return '<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="#c9e4f7" opacity="'+(i%3===0?.72:.24)+'"/>';
  }).join('');
  const circuits=Array.from({length:7},(_,i)=>{
    const y=47+i*41, end=390+i%3*40;
    return '<path d="M0 '+y+'h'+(96+i*25)+'l44 '+(i%2?16:-16)+'h'+(end-140-i*25)+'" stroke="'+(i%2?c:b)+'" stroke-width="1.1" opacity=".24" fill="none"/><circle cx="'+end+'" cy="'+(y+(i%2?16:-16))+'" r="3" fill="'+c+'" opacity=".55"/>';
  }).join('');
  return '<figure class="insight-art" role="img" aria-label="'+escapeAttr('Тематическая иллюстрация: '+title)+'">'+
   '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 340" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">'+
   '<defs><linearGradient id="ib-'+safe+'" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#0c1328"/><stop offset="55%" stop-color="#132c40"/><stop offset="100%" stop-color="#17162f"/></linearGradient>'+
   '<radialGradient id="ir-'+safe+'"><stop stop-color="'+c+'" stop-opacity=".24"/><stop offset="100%" stop-color="'+c+'" stop-opacity="0"/></radialGradient>'+
   '<linearGradient id="is-'+safe+'" x1="0" y1="0" x2="1" y2="1"><stop stop-color="'+c+'"/><stop offset="100%" stop-color="'+b+'"/></linearGradient></defs>'+
   '<rect width="1200" height="340" fill="url(#ib-'+safe+')"/>'+
   '<circle cx="850" cy="170" r="230" fill="url(#ir-'+safe+')"/>'+
   '<path d="M-10 275Q270 200 510 250T1210 235M-20 310Q260 230 560 300T1220 265" stroke="'+b+'" opacity=".22" fill="none" stroke-width="2"/>'+
   '<g>'+stars+'</g><g>'+circuits+'</g>'+
   '<g fill="none" stroke="'+c+'" opacity=".29"><ellipse cx="843" cy="166" rx="194" ry="116" transform="rotate(-22 843 166)"/><ellipse cx="845" cy="170" rx="165" ry="133" transform="rotate(27 845 170)"/></g>'+
   '<circle cx="850" cy="170" r="112" fill="#122539" stroke="url(#is-'+safe+')" stroke-width="1.5" opacity=".94"/>'+
   '<circle cx="850" cy="170" r="93" fill="'+c+'" opacity=".035"/>'+
   '<g transform="translate(783 103) scale(1.35)" fill="none" stroke="url(#is-'+safe+')" stroke-width="2.7" stroke-linecap="round" stroke-linejoin="round">'+motifs[safe]+'</g>'+
   '<circle cx="1033" cy="107" r="4" fill="'+b+'"/><circle cx="648" cy="232" r="3" fill="'+c+'"/>'+
   '<path d="M655 90h56m-30-20v40M1000 260h85" stroke="'+c+'" opacity=".5"/>'+
   '</svg><figcaption>Тематическая иллюстрация · не схема из научной статьи</figcaption></figure>';
}
