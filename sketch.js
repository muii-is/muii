// ============================================
// SYMBOL MAKER — 도트 기반 심볼 생성기
// 주제 3개 + 감정 3개 각각 선택
// ============================================

const KW_TOPIC   = ['진로','연애','건강','돈','미래','꿈','독립','가족','공부','일'];
const KW_FEELING = ['불안','그리움','따뜻함','기다림','외로움','기쁨','슬픔','답답함','고마움','설렘'];

const SYMBOLS = {
  진로:   { dots:[[0,-1],[0,0],[0,1],[-0.5,0.5],[0.5,0.5]],   edges:[[0,1],[1,2],[1,3],[1,4]], loops:[] },
  연애:   { dots:[[-0.6,0],[0,0],[0.6,0],[0,-0.7]],            edges:[[0,1],[1,2],[1,3]],       loops:[1] },
  건강:   { dots:[[0,-0.8],[0,0.8],[-0.8,0],[0.8,0]],          edges:[[0,2],[0,3],[1,2],[1,3]], loops:[] },
  돈:     { dots:[[-0.7,-0.7],[0.7,-0.7],[-0.7,0.7],[0.7,0.7],[0,0]], edges:[[0,4],[1,4],[2,4],[3,4]], loops:[] },
  미래:   { dots:[[0,-1],[0.7,-0.3],[-0.7,-0.3],[0.4,0.8],[-0.4,0.8]], edges:[[0,1],[0,2],[1,3],[2,4],[3,4]], loops:[] },
  꿈:     { dots:[[0,-0.9],[0.6,0],[-0.6,0],[0,0.9],[0,0]],    edges:[[0,4],[1,4],[2,4],[3,4]], loops:[4] },
  독립:   { dots:[[0,-1],[0,1],[-0.5,-0.5],[0.5,-0.5]],        edges:[[0,1],[0,2],[0,3]],       loops:[] },
  가족:   { dots:[[-0.8,0],[0,0],[0.8,0],[0,-0.8],[0,0.8]],    edges:[[0,1],[1,2],[1,3],[1,4]], loops:[0,2] },
  공부:   { dots:[[-0.6,-0.6],[0.6,-0.6],[0,0.8]],             edges:[[0,1],[0,2],[1,2]],       loops:[0,1,2] },
  일:     { dots:[[0,-0.8],[0,0.8],[-0.4,0],[0.4,0]],          edges:[[0,1],[2,3]],             loops:[] },
  불안:   { dots:[[0,-1],[0.5,-0.2],[-0.5,-0.2],[0.8,0.6],[-0.8,0.6]], edges:[[0,1],[0,2],[1,3],[2,4]], loops:[] },
  그리움: { dots:[[-0.8,0],[0,0],[0.8,0]],                      edges:[[0,1],[1,2]],             loops:[1] },
  따뜻함: { dots:[[0,-0.7],[0.5,0.3],[-0.5,0.3],[0,0]],        edges:[[0,3],[1,3],[2,3]],       loops:[0,1,2] },
  기다림: { dots:[[-0.9,0],[-0.3,0],[0.3,0],[0.9,0]],          edges:[[0,1],[1,2],[2,3]],       loops:[] },
  외로움: { dots:[[0,0],[0,-0.9]],                              edges:[[0,1]],                   loops:[0] },
  기쁨:   { dots:[[0,-0.9],[0.6,-0.3],[-0.6,-0.3],[0.9,0.4],[-0.9,0.4],[0,0.9]], edges:[[0,1],[0,2],[1,3],[2,4],[3,5],[4,5]], loops:[] },
  슬픔:   { dots:[[-0.5,-0.5],[0.5,-0.5],[0,0.5]],             edges:[[0,1],[0,2],[1,2]],       loops:[2] },
  답답함: { dots:[[-0.8,-0.5],[0.8,-0.5],[-0.8,0.5],[0.8,0.5]], edges:[[0,1],[2,3],[0,2],[1,3]], loops:[] },
  고마움: { dots:[[0,-0.8],[0.6,0.3],[-0.6,0.3],[0,0]],        edges:[[0,3],[1,3],[2,3]],       loops:[0] },
  설렘:   { dots:[[0,-0.9],[0.5,-0.1],[-0.5,-0.1],[0.8,0.7],[-0.8,0.7],[0,0.4]], edges:[[0,1],[0,2],[1,5],[2,5],[3,5],[4,5]], loops:[] },
};

// ── 상태 ──────────────────────────────────────
let phase = 'select';
let selTopicA=[], selFeelingA=[], selTopicB=[], selFeelingB=[];
let currentUser = 'A';
let animProgress = 0;
let frameT = 0;
let btnRects=[], confirmRect=null, resetRect=null;

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
}

function draw() {
  background('#1446FF');
  frameT += 0.014;
  if      (phase==='select')  drawSelect();
  else if (phase==='animate') { animProgress+=0.006; if(animProgress>=1){animProgress=1;phase='result';} drawAnimate(); }
  else                         drawResult();
}

// ═══════════════════════════════════════════
// SELECT
// ═══════════════════════════════════════════
function drawSelect() {
  btnRects=[]; confirmRect=null;
  let isA = currentUser==='A';
  let label = isA ? '엄마' : '딸';
  let selTopic   = isA ? selTopicA   : selTopicB;
  let selFeeling = isA ? selFeelingA : selFeelingB;
  let other = isA ? [] : [...selTopicA,...selFeelingA];

  // 헤더
  fill(255); textSize(11); textAlign(LEFT,BASELINE); textStyle(BOLD);
  text('SYMBOL MAKER', 36, 44);
  textAlign(RIGHT,BASELINE); fill(255,255,255,100); textStyle(NORMAL);
  text(isA?'1 / 2':'2 / 2', width-36, 44);

  // 타이틀
  let ts = clamp(width*0.042, 22, 44);
  textAlign(LEFT,BASELINE); textStyle(BOLD); textSize(ts); fill(255);
  text(label+'의 키워드를 골라주세요.', 36, 92);
  textStyle(NORMAL); textSize(11); fill(255,255,255,100);
  text('주제 최대 3개  +  감정 최대 3개', 36, 92+ts*0.7+16);

  let secY = 92+ts*0.7+48;
  secY = drawKwSection('주제', KW_TOPIC, selTopic, 36, secY, false);
  secY += 20;
  secY = drawKwSection('감정', KW_FEELING, selFeeling, 36, secY, true);
  secY += 24;

  // 확인 버튼
  let canGo = selTopic.length>0 || selFeeling.length>0;
  if (canGo) {
    fill(255); rect(36,secY,160,46,2);
    fill(20,70,255); textAlign(CENTER,CENTER); textSize(14); textStyle(BOLD);
    text(isA?'다음 →':'심볼 생성 →', 116, secY+23);
    confirmRect={x:36,y:secY,w:160,h:46};
  } else {
    fill(255,255,255,28); rect(36,secY,160,46,2);
    fill(255,255,255,60); textAlign(CENTER,CENTER); textSize(14); textStyle(NORMAL);
    text(isA?'다음 →':'심볼 생성 →', 116, secY+23);
  }

  // 오른쪽 미리보기
  let allSel = [...selTopic,...selFeeling];
  if (allSel.length>0) {
    let preX = width - clamp(width*0.2,120,190);
    let preY = height*0.5;
    let preR = clamp(min(width,height)*0.1, 50, 90);
    let sym = buildSymbol(allSel, preX, preY, preR);
    drawDotSymbol(sym, 255, false);
    fill(255,255,255,70); textAlign(CENTER,BASELINE); textSize(10); textStyle(NORMAL);
    text(label+'의 심볼', preX, preY+preR+22);
  }
}

function drawKwSection(sectionLabel, list, selected, x, y, isFeel) {
  fill(isFeel?color(255,255,255,130):color(255,255,255,200));
  textAlign(LEFT,BASELINE); textSize(10); textStyle(BOLD);
  text(sectionLabel+' — 최대 3개', x, y);
  y += 14;

  let bw=78, bh=34, gap=8;
  let maxW = width - x - clamp(width*0.25,130,200) - 20;
  let cols = max(2, floor(maxW/(bw+gap)));

  list.forEach((kw,i) => {
    let bx = x + (i%cols)*(bw+gap);
    let by = y + floor(i/cols)*(bh+gap);
    let sel = selected.includes(kw);
    if (sel) { fill(255); rect(bx,by,bw,bh,2); fill(20,70,255); }
    else      { fill(255,255,255,22); rect(bx,by,bw,bh,2); fill(255,255,255,175); }
    textAlign(CENTER,CENTER); textSize(12); textStyle(sel?BOLD:NORMAL);
    text(kw, bx+bw/2, by+bh/2);
    btnRects.push({x:bx,y:by,w:bw,h:bh,kw,isFeel});
  });

  let rows = ceil(list.length/cols);
  return y + rows*(bh+gap);
}

// ═══════════════════════════════════════════
// ANIMATE
// ═══════════════════════════════════════════
function drawAnimate() {
  let cx=width/2, cy=height/2;
  let r=clamp(min(width,height)*0.16, 60,145);
  let e=easeInOut(animProgress);

  let ax=lerp(width*0.18, cx-r*1.12, e);
  let bx=lerp(width*0.82, cx+r*1.12, e);

  let allA=[...selTopicA,...selFeelingA];
  let allB=[...selTopicB,...selFeelingB];

  drawDotSymbol(buildSymbol(allA, ax, cy, r), 255, false);
  drawDotSymbol(buildSymbol(allB, bx, cy, r), 255, true);

  fill(255,255,255,110); textAlign(CENTER,BASELINE); textSize(11); textStyle(BOLD);
  text('엄마', ax, cy+r+22); text('딸', bx, cy+r+22);
  fill(255,255,255,60); textSize(9); textStyle(NORMAL);
  text(allA.join(' · '), ax, cy-r-12);
  text(allB.join(' · '), bx, cy-r-12);

  if (animProgress>0.42) {
    let mp=easeInOut(map(animProgress,0.42,1.0,0,1));
    let shared=allA.filter(k=>allB.includes(k));
    let hasShared=shared.length>0;

    if (hasShared) {
      // 공통 있음: 완전 합성
      drawDotLine(ax,cy,cx,cy,75*mp);
      drawDotLine(bx,cy,cx,cy,75*mp);
      let ptsM = buildMergedAnim(allA, allB, ax, bx, cy, r, mp);
      drawDotSymbol(ptsM, 255*mp, false);
    } else {
      // 공통 없음: 두 심볼이 중앙으로 이동하다가 살짝 맞닿고 멈춤
      let stopDist = r*0.55; // 완전 합쳐지지 않는 거리
      let taxFinal = cx - stopDist;
      let tbxFinal = cx + stopDist;
      let tax = lerp(ax, taxFinal, mp);
      let tbx = lerp(bx, tbxFinal, mp);

      // 심볼 다시 그리기 (이동된 위치에서)
      drawDotSymbol(buildSymbol(allA, tax, cy, r), 255, false);
      drawDotSymbol(buildSymbol(allB, tbx, cy, r), 255, true);

      // 맞닿는 지점에 작은 접촉 표시 (opacity는 mp따라)
      if (mp > 0.8) {
        let touchAlpha = map(mp, 0.8, 1.0, 0, 180);
        noStroke(); fill(255,255,255,touchAlpha);
        ellipse(cx, cy, 6, 6); // 접촉점 도트
      }
    }
  }

  fill(255); textAlign(LEFT,BASELINE); textSize(11); textStyle(BOLD);
  text('SYMBOL MAKER',36,44);
}

// ═══════════════════════════════════════════
// RESULT
// ═══════════════════════════════════════════
function drawResult() {
  resetRect=null;
  let cx=width/2, cy=height/2;
  let r=clamp(min(width,height)*0.17, 68,155);
  let sr=r*0.5;
  let ax=cx-r*1.5, bx=cx+r*1.5;

  let allA=[...selTopicA,...selFeelingA];
  let allB=[...selTopicB,...selFeelingB];
  let allM=getMerged();

  let shared=allA.filter(k=>allB.includes(k));

  if (shared.length>0) {
    // 공통 있음: 사이드 심볼 + 중앙 합성 심볼
    drawDotSymbol(buildSymbol(allA, ax, cy, sr), 155, false);
    drawDotSymbol(buildSymbol(allB, bx, cy, sr), 155, true);
    drawDotLine(ax+sr*0.65,cy,cx-r*0.7,cy,60);
    drawDotLine(bx-sr*0.65,cy,cx+r*0.7,cy,60);
    drawDotSymbol(buildSymbol(getMerged(), cx, cy, r*1.05), 255, false);

    fill(255,255,255,85); textAlign(CENTER,BASELINE); textSize(10); textStyle(BOLD);
    text('엄마',ax,cy+sr+20); text('딸',bx,cy+sr+20);
    fill(255,255,255,50); textSize(9); textStyle(NORMAL);
    text(allA.join(' · '),ax,cy-sr-12);
    text(allB.join(' · '),bx,cy-sr-12);

    fill(255); textSize(12); textStyle(BOLD); textAlign(CENTER,BASELINE);
    text('우리의 심볼', cx, cy+r*1.05+28);
    fill(255,255,255,125); textSize(10); textStyle(NORMAL);
    text('둘 다  '+shared.join(' · '), cx, cy+r*1.05+48);

  } else {
    // 공통 없음: 두 심볼이 살짝 맞닿은 채로 나란히, 중앙에 작은 접촉점만
    let stopDist = r*0.55;
    let tax = cx - stopDist;
    let tbx = cx + stopDist;

    drawDotSymbol(buildSymbol(allA, tax, cy, r), 220, false);
    drawDotSymbol(buildSymbol(allB, tbx, cy, r), 220, true);

    // 접촉점
    noStroke(); fill(255,255,255,200);
    ellipse(cx, cy, 7, 7);

    fill(255,255,255,85); textAlign(CENTER,BASELINE); textSize(10); textStyle(BOLD);
    text('엄마', tax, cy+r+22); text('딸', tbx, cy+r+22);
    fill(255,255,255,50); textSize(9); textStyle(NORMAL);
    text(allA.join(' · '), tax, cy-r-12);
    text(allB.join(' · '), tbx, cy-r-12);

    fill(255,255,255,100); textSize(11); textStyle(NORMAL); textAlign(CENTER,BASELINE);
    text('연결되어 있지만, 다른 존재', cx, cy+r+52);
  }

  fill(255); textAlign(LEFT,BASELINE); textSize(11); textStyle(BOLD);
  text('SYMBOL MAKER',36,44);

  let rw=108,rh=36,rx=width-36-rw,ry=26;
  fill(255,255,255,25); rect(rx,ry,rw,rh,2);
  fill(255,255,255,148); textAlign(CENTER,CENTER); textSize(11); textStyle(NORMAL);
  text('다시 시작',rx+rw/2,ry+rh/2);
  resetRect={x:rx,y:ry,w:rw,h:rh};
}

// ═══════════════════════════════════════════
// 심볼 빌드
// ═══════════════════════════════════════════
function buildSymbol(kws, cx, cy, r) {
  if (!kws||kws.length===0) kws=['미래'];
  let valid=kws.filter(k=>SYMBOLS[k]);
  if (valid.length===0) valid=['미래'];

  // 첫 번째 키워드 기준으로 시작
  let sym=SYMBOLS[valid[0]];
  let allDots=[...sym.dots];
  let allEdges=[...sym.edges];
  let allLoops=[...(sym.loops||[])];

  // 나머지 키워드에서 도트 1~2개씩 추가
  valid.slice(1).forEach((kw,ki) => {
    let s2=SYMBOLS[kw];
    if (!s2) return;
    let base=allDots.length;
    // 도트 1개 추가 (스케일 줄여서)
    let d=s2.dots[0];
    allDots.push([d[0]*0.55, d[1]*0.55]);
    // 기존 가장 가까운 도트에 연결
    allEdges.push([base, 0]);
    if (s2.loops&&s2.loops.length>0) allLoops.push(base);
  });

  let pts=allDots.map((d,i)=>({
    x: cx + d[0]*r + sin(frameT*0.9+i*1.3)*r*0.022,
    y: cy + d[1]*r + cos(frameT*0.7+i*0.9)*r*0.022,
  }));

  return {pts, edges:allEdges, loops:allLoops, cx, cy, r};
}

// 두 심볼의 도트가 중앙으로 끌려와 합체되는 애니메이션
function buildMergedAnim(allA, allB, ax, bx, cy, r, progress) {
  let cx=(ax+bx)/2;
  let allM=getMerged();
  let target=buildSymbol(allM, cx, cy, r*1.1);

  let srcA=buildSymbol(allA, ax, cy, r);
  let srcB=buildSymbol(allB, bx, cy, r);

  let merged={...target};
  merged.pts=target.pts.map((p,i)=>{
    let half=floor(target.pts.length/2);
    let src=i<half ? srcA.pts[i%srcA.pts.length] : srcB.pts[i%srcB.pts.length];
    return {
      x: lerp(src.x, p.x, easeInOut(progress)),
      y: lerp(src.y, p.y, easeInOut(progress)),
    };
  });
  return merged;
}

function getMerged() {
  let allA=[...selTopicA,...selFeelingA];
  let allB=[...selTopicB,...selFeelingB];
  let shared=allA.filter(k=>allB.includes(k));
  if (shared.length>0) return shared;
  // 공통 없으면 각 측에서 1개씩
  let pick=[];
  if (allA.length>0) pick.push(allA[0]);
  if (allB.length>0) pick.push(allB[0]);
  return pick.length>0 ? pick : ['미래'];
}

// ═══════════════════════════════════════════
// 심볼 드로우
// ═══════════════════════════════════════════
function drawDotSymbol(sym, alpha, invert) {
  if (!sym||!sym.pts) return;
  let {pts,edges,loops,r,cx,cy}=sym;
  let dotSz=clamp(r*0.14, 6, 15);
  let lw=clamp(r*0.028, 1.5, 3.5);
  let lc=invert ? color(20,70,255,alpha*0.65) : color(255,255,255,alpha*0.65);
  let dc=invert ? color(20,70,255,alpha)       : color(255,255,255,alpha);

  if (invert) {
    noStroke(); fill(255,255,255,alpha*0.12);
    ellipse(cx,cy,r*2.35,r*2.35);
  }

  // 엣지 — 베지어 곡선 경로 위에 도트를 찍되
  // 끝점(메인 도트)에서 크고, 중간에서 가장 작게 → 유기적 굵기 변화
  noStroke(); fill(dc);
  edges.forEach(e=>{
    if (!pts[e[0]]||!pts[e[1]]) return;
    let x1=pts[e[0]].x, y1=pts[e[0]].y;
    let x2=pts[e[1]].x, y2=pts[e[1]].y;
    let dx=x2-x1, dy=y2-y1;
    let dist=sqrt(dx*dx+dy*dy);
    // 제어점 (살짝 휘는 베지어)
    let cpx1=x1+dx*0.35 - dy*0.18;
    let cpy1=y1+dy*0.35 + dx*0.18;
    let cpx2=x2-dx*0.35 - dy*0.18;
    let cpy2=y2-dy*0.35 + dx*0.18;
    let steps=max(6, floor(dist/(dotSz*0.38)));
    for (let s=0; s<=steps; s++){
      let t2=s/steps;
      // cubic bezier 위치
      let bx=pow(1-t2,3)*x1 + 3*pow(1-t2,2)*t2*cpx1 + 3*(1-t2)*t2*t2*cpx2 + pow(t2,3)*x2;
      let by=pow(1-t2,3)*y1 + 3*pow(1-t2,2)*t2*cpy1 + 3*(1-t2)*t2*t2*cpy2 + pow(t2,3)*y2;
      // 크기: 끝점에서 dotSz, 중간(t=0.5)에서 dotSz*0.35로 줄었다가 다시 커짐
      // sin 곡선으로 자연스럽게 → 양 끝 크고 중간 작음
      let sizeT = 1 - sin(t2 * PI) * 0.65;
      ellipse(bx, by, dotSz*sizeT, dotSz*sizeT);
    }
  });

  // 루프 원 — 같은 방식으로 크기 변화
  let lr=clamp(r*0.17, 7, 19);
  (loops||[]).forEach(li=>{
    if (!pts[li]) return;
    let steps=40;
    for (let s=0; s<steps; s++){
      let t2=s/steps;
      let a=(TWO_PI/steps)*s;
      // 루프도 위치마다 살짝 크기 변화 (덜 단조롭게)
      let sizeT = 1 - sin(t2*TWO_PI*2)*0.2;
      ellipse(pts[li].x+cos(a)*lr, pts[li].y+sin(a)*lr, dotSz*0.65*sizeT, dotSz*0.65*sizeT);
    }
  });

  // 메인 도트 — 끝점 위에 크게 덮어서 마감
  pts.forEach(p=>ellipse(p.x, p.y, dotSz, dotSz));
}

// ── 유틸 ──────────────────────────────────────
function drawDotLine(x1,y1,x2,y2,alpha) {
  noStroke();
  for (let i=0;i<=20;i++){
    let t=i/20;
    fill(255,255,255,alpha*sin(t*PI));
    ellipse(lerp(x1,x2,t),lerp(y1,y2,t),2.5,2.5);
  }
}

function easeInOut(x){ return x<0.5?2*x*x:1-pow(-2*x+2,2)/2; }
function clamp(v,lo,hi){ return max(lo,min(hi,v)); }

// ── 인터랙션 ──────────────────────────────────
function mousePressed() {
  if (phase==='select') {
    for (let b of btnRects) {
      if (inRect(mouseX,mouseY,b)) {
        let isA=currentUser==='A';
        let selArr=b.isFeel ? (isA?selFeelingA:selFeelingB) : (isA?selTopicA:selTopicB);
        let idx=selArr.indexOf(b.kw);
        if (idx>=0) selArr.splice(idx,1);
        else if (selArr.length<3) selArr.push(b.kw);
        return;
      }
    }
    if (confirmRect&&inRect(mouseX,mouseY,confirmRect)) {
      if (currentUser==='A') currentUser='B';
      else { phase='animate'; animProgress=0; }
    }
  } else if (phase==='result') {
    if (resetRect&&inRect(mouseX,mouseY,resetRect)) resetAll();
  }
}

function keyPressed(){ if(key==='r'||key==='R') resetAll(); }
function resetAll(){
  phase='select';
  selTopicA=[]; selFeelingA=[]; selTopicB=[]; selFeelingB=[];
  currentUser='A'; animProgress=0; frameT=0;
}
function inRect(mx,my,r){ return mx>=r.x&&mx<=r.x+r.w&&my>=r.y&&my<=r.y+r.h; }
function windowResized(){ resizeCanvas(windowWidth,windowHeight); } 
