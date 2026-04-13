// 修正 FastClick is not defined 的錯誤，若環境中缺少此函式庫則建立一個空的物件以避免報錯
if (typeof window.FastClick === 'undefined') {
  window.FastClick = {
    attach: () => { }
  };
}

let grasses = [];
let bubbles = [];
let iframe;

function setup() {
  let cnv = createCanvas(windowWidth, windowHeight);
  // 設定 Canvas 不接收滑鼠事件(讓點擊穿透到 iframe)，並調整層級在最上層
  cnv.style('pointer-events', 'none');
  cnv.style('z-index', '1');

  // 建立 iframe 顯示網頁，設定為全螢幕並置於背景
  iframe = createElement('iframe');
  iframe.attribute('src', 'https://www.et.tku.edu.tw');
  iframe.position(0, 0);
  iframe.size(windowWidth, windowHeight);
  iframe.style('border', 'none');
  iframe.style('z-index', '-1');

  let colors = ['#d8f3dc', '#b7e4c7', '#95d5b2', '#74c69d', '#52b788', '#40916c', '#2d6a4f', '#1b4332', '#081c15'];
  
  for (let i = 0; i < 50; i++) {
    grasses.push({
      x: random(width), // 改為亂數位置，允許重疊
      h: random(height * 0.2, height * 2 / 3), // 高度
      w: random(30, 60), // 粗細
      c: random(colors), // 隨機顏色
      offset: random(1000), // 獨立的雜訊偏移
      swayFreq: random(0.005, 0.02), // 搖晃的頻率
      swayAmp: random(40, 90) // 搖晃的幅度
    });
  }
}

function draw() {
  clear();
  noStroke();
  blendMode(BLEND); // 確保混合模式為 BLEND，產生重疊透明感

  let segments = 40; // 分段數量，越多越平滑

  for (let g of grasses) {
    let c = color(g.c); // 將顏色字串轉為 p5 color 物件
    c.setAlpha(150); // 設定透明度 (0-255)，讓水草重疊時有層次感
    fill(c);
    beginShape();
    // 左側邊緣 (由底部往上長)
    for (let i = 0; i <= segments; i++) {
      let t = i / segments; // 正規化高度 0.0 ~ 1.0
      let y = map(t, 0, 1, height, height - g.h);
      // 使用 noise 產生擺動，加上 offset 讓每根草獨立擺動
      let xOff = map(noise(t * 3 + g.offset, frameCount * g.swayFreq + g.offset), 0, 1, -g.swayAmp, g.swayAmp) * t;
      let w = map(t, 0, 1, g.w / 2, 0); // 寬度隨高度變窄，基底為總寬度的一半
      curveVertex(g.x + xOff - w, y);
    }
    // 右側邊緣 (由頂部往下回到底部)
    for (let i = segments; i >= 0; i--) {
      let t = i / segments;
      let y = map(t, 0, 1, height, height - g.h);
      let xOff = map(noise(t * 3 + g.offset, frameCount * g.swayFreq + g.offset), 0, 1, -g.swayAmp, g.swayAmp) * t;
      let w = map(t, 0, 1, g.w / 2, 0);
      curveVertex(g.x + xOff + w, y);
    }
    endShape(CLOSE);
  }

  // --- 氣泡邏輯 ---
  // 隨機產生新的氣泡
  if (random() < 0.03) {
    bubbles.push(new Bubble());
  }

  // 更新並顯示氣泡
  for (let i = bubbles.length - 1; i >= 0; i--) {
    let b = bubbles[i];
    b.update();
    b.display();
    // 如果氣泡完全消失(破掉動畫結束)，將其從陣列移除
    if (b.isDead()) {
      bubbles.splice(i, 1);
    }
  }
}

// 定義氣泡類別
class Bubble {
  constructor() {
    this.x = random(width);
    this.y = height + 10; // 從視窗底部下方生成
    this.d = random(10, 30); // 氣泡大小
    this.speed = random(1, 3); // 上升速度
    this.popHeight = random(height * 0.2, height * 0.8); // 設定破掉的高度界線
    this.popping = false; // 是否正在破掉
    this.alpha = 255; // 透明度
  }

  update() {
    if (this.popping) {
      this.d += 1.5; // 破掉時直徑迅速變大
      this.alpha -= 10; // 破掉時迅速變透明
    } else {
      this.y -= this.speed; // 往上升
      this.x += sin(frameCount * 0.05 + this.y) * 0.5; // 微微左右搖擺
      if (this.y < this.popHeight) {
        this.popping = true; // 到達高度，開始破掉
      }
    }
  }

  display() {
    noStroke();
    // 水泡本體：白色，透明度 0.5 (約 127)，隨生命週期淡出
    fill(255, 127 * (this.alpha / 255));
    circle(this.x, this.y, this.d);
    // 水泡上的亮點：白色，透明度 0.7 (約 178)，加上高光效果
    fill(255, 178 * (this.alpha / 255));
    circle(this.x - this.d * 0.25, this.y - this.d * 0.25, this.d * 0.3);
  }

  isDead() {
    return this.alpha <= 0;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  if (iframe) {
    iframe.size(windowWidth, windowHeight);
  }
}
