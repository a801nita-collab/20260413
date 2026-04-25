let seagrasses = [];
let bubbles = [];
let fishes = [];
let dust = []; // 懸浮微粒
let floatingBubbles = []; // 新增：用於隨機上升的氣泡
let popSound; // 新增：氣泡破裂音效
let decorations = []; // 新增裝飾物陣列

// 設定作業網址，指向本目錄下的 week1 與 week2
const assignmentUrls = [ // 更新為相對路徑，確保在本地環境中能正確載入
  "./week1/index.html", // 假設第一週作品放在專案的 week1 資料夾中
  "./week2/index.html", // 假設第二週作品放在專案的 week2 資料夾中
  "./week3/index.html", // 假設第三週作品放在專案的 week3 資料夾中
  "./week4/index.html",
  "./week5/index.html",
  "./week6/index.html",
  "./week7/index.html",
  "./week8/index.html"
];

// 預載入資源
function preload() {
  // 請確保 'assets/pop.mp3' 檔案存在於您的專案中
  // 您可能需要建立 'assets' 資料夾並放入一個音效檔，或修改路徑
  popSound = loadSound('音效/pop.mp3'); // 修正路徑與檔名，建議使用 assets 資料夾
}

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent('canvas-container');

  // 初始化海草 (數量隨作業週數增加)
  let numSeagrasses = 60; // 大幅增加數量，營造茂密的叢林感
  for (let i = 0; i < numSeagrasses; i++) {
    // 平均分布：將寬度等分並加入隨機偏移
    let x = map(i, 0, numSeagrasses - 1, 40, width - 40) + random(-30, 30);// 增加隨機偏移，讓海草分布更自然不死板
    let h = random(100, 200) + (assignmentUrls.length * 20); // 創意隱喻：作品愈多長愈高
    seagrasses.push(new Seagrass(x, h));// 每叢海草的高度根據作業週數增加，象徵學習成長與作品累積的豐厚感
  }

  // 初始化氣泡按鈕
  bubbles.push(new Bubble(random(100, width - 100), random(100, height - 200), "第一周作品", assignmentUrls[0]));
  bubbles.push(new Bubble(random(100, width - 100), random(100, height - 200), "第二周作品", assignmentUrls[1]));
  // 新增：雷達找色塊作品氣泡
  bubbles.push(new Bubble(random(100, width - 100), random(100, height - 200), "第三周作品", assignmentUrls[2]));
  // 新增：第 4 至 8 週作品氣泡
  bubbles.push(new Bubble(random(100, width - 100), random(100, height - 200), "第四周作品", assignmentUrls[3]));
  bubbles.push(new Bubble(random(100, width - 100), random(100, height - 200), "第五周作品", assignmentUrls[4]));
  bubbles.push(new Bubble(random(100, width - 100), random(100, height - 200), "第六周作品", assignmentUrls[5]));
  bubbles.push(new Bubble(random(100, width - 100), random(100, height - 200), "第七周作品", assignmentUrls[6]));
  bubbles.push(new Bubble(random(100, width - 100), random(100, height - 200), "第八周作品", assignmentUrls[7]));
  // 新增：期中考筆記氣泡
  bubbles.push(new Bubble(random(100, width - 100), random(100, height - 200), "期中考筆記(與AI的對話)", "https://hackmd.io/@8R3rNBC5Tz2EDJ4XvI1alQ/HknWNCt2Zl"));

  // 初始化一些隨機上升的氣泡
  for (let i = 0; i < 10; i++) {
    floatingBubbles.push(new FloatingBubble(random(width), random(height - 50, height + 50)));
  }

  // 初始化懸浮微粒
  for (let i = 0; i < 50; i++) {
    dust.push({ x: random(width), y: random(height), size: random(1, 3), alpha: random(50, 150) });
  }

  // 初始化魚群
  for (let i = 0; i < 18; i++) {
    fishes.push(new Fish(random(width), random(height * 0.2, height * 0.8), random(1, 3) * (random() > 0.5 ? 1 : -1))); // 隨機初始位置和速度方向
  }

  // 初始化裝飾物 (石頭和海星)
  for (let i = 0; i < 15; i++) {
    let type = random() > 0.5 ? 'rock' : 'starfish';
    let decX = random(width);
    let decY = random(height - 25, height - 5); // 放在沙地附近，避免完全被沙子覆蓋
    let decSize = random(0.5, 1.5);
    let decRotation = random(TWO_PI);

    if (type === 'rock') {
      decorations.push({
        type: 'rock',
        x: decX,
        y: decY,
        size: decSize,
        color: color(random(80, 150), random(70, 140), random(60, 130)), // 大地色系
        rotation: decRotation,
        width: random(20, 60),
        height: random(10, 40)
      });
    } else { // starfish
      decorations.push({ type: 'starfish', x: decX, y: decY, size: decSize, color: color(random(180, 255), random(50, 150), random(50, 150)), rotation: decRotation }); // 鮮豔色系
    }
  }
}

function draw() {
  // 水底漸層背景
  drawUnderwaterBackground();

  // 繪製懸浮微粒
  drawDust();

  // 繪製裝飾物 (石頭和海星)
  drawDecorations();

  // 繪製海草
  for (let s of seagrasses) {
    s.sway();
    s.display();
  }

  // 繪製魚群
  for (let f of fishes) {
    f.move();
    f.display();
  }

  // 繪製氣泡
  for (let b of bubbles) {
    b.float();
    b.display();
  }

  // 隨機生成新的上升氣泡
  if (frameCount % 90 === 0) { // 大約每 1.5 秒生成一個新氣泡
    floatingBubbles.push(new FloatingBubble(random(width), height + 20)); // 從畫面下方生成
  }

  // 更新並繪製上升氣泡
  for (let i = floatingBubbles.length - 1; i >= 0; i--) {
    let fb = floatingBubbles[i];
    fb.move();
    fb.display();
    if (fb.isOffscreen() || (fb.popping && fb.alpha <= 0)) {
      floatingBubbles.splice(i, 1); // 如果氣泡超出畫面，則移除
    }
  }
  // 繪製水族箱邊框與玻璃反光
  drawAquariumFrame();

  // 在右下角顯示提示文字
  push();
  fill(0); // 改為黑色
  noStroke();
  textAlign(RIGHT, BOTTOM);
  textSize(32); // 放大一倍
  text("滑鼠右靠查看設計理念", width - 20, height - 10);
  pop();
}

function mousePressed() {
  // 確保瀏覽器的音訊環境在使用者點擊後啟動
  userStartAudio();

  for (let b of bubbles) {
    if (b.isClicked(mouseX, mouseY)) {
      // 當點擊作品按鈕氣泡時播放音效
      if (popSound && popSound.isLoaded()) {
        popSound.play();
      }
      // 顯示作品面板並更新 iframe 內容
      let displayArea = document.getElementById('display-area');
      displayArea.style.display = 'flex';
      document.getElementById('work-iframe').src = b.url;
    }
  }

  // 檢查是否點擊了隨機上升的氣泡
  for (let i = floatingBubbles.length - 1; i >= 0; i--) {
    let fb = floatingBubbles[i];
    if (!fb.popping && fb.isClicked(mouseX, mouseY)) {
      // 修正：增加判斷式，確保音效物件存在且已載入才執行 play()
      if (popSound && popSound.isLoaded()) {
        popSound.play();
      }
      fb.popping = true; // 進入破裂狀態
      break; // 每次點擊只破一個氣泡
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// 海草類別
class Seagrass {
  constructor(x, h) {
    this.x = x;
    this.h = h;
    this.noiseOffset = random(1000);
    this.interactionOffset = 0; // 用於儲存滑鼠撥動產生的物理位移
    // 每一叢海草由多片葉子組成，增加層次感
    this.blades = [];
    let numBlades = floor(random(3, 6));
    for (let i = 0; i < numBlades; i++) {
      this.blades.push({
        xOffset: random(-15, 15),
        hFactor: random(0.7, 1.2),
        w: random(4, 10),
        color: color(random(20, 60), random(100, 180), random(40, 90), 180),
        noiseSeed: random(100)
      });
    }
  }

  sway() {
    this.noiseOffset += 0.01; // 減慢速度，讓動作更優雅柔軟

    // 滑鼠撥動偵測：當滑鼠靠近海草水平位置且在水底區域時
    let horizontalDist = mouseX - this.x;
    if (abs(horizontalDist) < 80 && mouseY > height - this.h - 50) {
      // 計算推開的力道：滑鼠在左往右推，在右往左推
      let targetBend = map(horizontalDist, -80, 80, 60, -60);
      this.interactionOffset = lerp(this.interactionOffset, targetBend, 0.15);
    } else {
      // 離開後慢慢恢復垂直狀態
      this.interactionOffset = lerp(this.interactionOffset, 0, 0.05);
    }
  }

  display() {
    push();
    noStroke();
    for (let b of this.blades) {
      fill(b.color);
      beginShape();
      let bladeH = this.h * b.hFactor;
      // 從底部向上繪製葉片右緣，增加頂點密度 (步進由 10 改為 5) 讓曲線更平滑
      for (let i = 0; i <= bladeH; i += 5) {
        let pct = i / bladeH; // 取得目前的百分比 (0 到 1)
        // 越靠近葉尖 (i 越大)，擺動幅度越大
        let swayAmount = map(i, 0, bladeH, 0, 40);
        // 使用 pow(pct, 2) 讓位移呈現二次曲線，根部彎曲小，葉尖彎曲大，感覺更柔軟
        let interactAmount = pow(pct, 2) * this.interactionOffset; 
        let offsetX = (noise(this.noiseOffset + b.noiseSeed, i * 0.01) - 0.5) * swayAmount;
        let taper = map(i, 0, bladeH, b.w, 1); // 葉片由底部的寬度縮減至頂部的尖端
        vertex(this.x + b.xOffset + offsetX + taper + interactAmount, height - 30 - i);
      }
      // 從葉尖回到根部繪製左緣，封閉形狀
      for (let i = bladeH; i >= 0; i -= 5) {
        let pct = i / bladeH;
        let swayAmount = map(i, 0, bladeH, 0, 40);
        let interactAmount = pow(pct, 2) * this.interactionOffset;
        let offsetX = (noise(this.noiseOffset + b.noiseSeed, i * 0.01) - 0.5) * swayAmount;
        let taper = map(i, 0, bladeH, b.w, 1);
        vertex(this.x + b.xOffset + offsetX - taper + interactAmount, height - 30 - i);
      }
      endShape(CLOSE);
    }
    pop();
  }
}

// 氣泡按鈕類別
class Bubble {
  constructor(x, y, label, url) {
    this.x = x;
    this.y = y;
    this.r = 60;
    this.label = label;
    this.url = url;
    // 新增：隨機移動速度向量
    this.vx = random(-2, 2); // 增加基本水平速度
    this.vy = random(-2, 2); // 增加基本垂直速度
    this.noiseSeed = random(1000); // 隨機雜訊起點
  }

  float() {
    // 結合基本速度與雜訊，產生隨機漂浮的動態感 (調高雜訊變化頻率與幅度)
    let driftX = (noise(this.noiseSeed + frameCount * 0.02) - 0.5) * 4;
    let driftY = (noise(this.noiseSeed + 100 + frameCount * 0.02) - 0.5) * 4;
    
    this.x += this.vx + driftX;
    this.y += this.vy + driftY;

    // 邊界檢查：讓作品泡泡在視窗內反彈，避免游出螢幕
    if (this.x < this.r || this.x > width - this.r) { this.vx *= -1; this.x = constrain(this.x, this.r, width - this.r); }
    if (this.y < this.r || this.y > height - this.r) { this.vy *= -1; this.y = constrain(this.y, this.r, height - this.r); }
  }

  display() {
    push();
    // 檢查滑鼠是否懸停在泡泡上，給予視覺提示
    let isHovered = dist(mouseX, mouseY, this.x, this.y) < this.r;
    
    fill(100, 200, 255, isHovered ? 120 : 70); // 改為淺藍色，並提高透明度數值讓它更顯眼
    stroke(180, 230, 255, isHovered ? 255 : 180);
    strokeWeight(isHovered ? 3 : 1);
    
    circle(this.x, this.y, this.r * 2);
    
    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    text(this.label, this.x, this.y);
    pop();
  }

  isClicked(mx, my) {
    let d = dist(mx, my, this.x, this.y);
    return d < this.r;
  }
}

// 魚類別 - 使用 Vertex 勾勒
class Fish {
  constructor(x, y, vx) {
    this.pos = createVector(x, y);
    this.vel = createVector(vx || random(-2, 2), random(-0.5, 0.5));
    this.acc = createVector(0, 0);
    this.maxSpeed = abs(this.vel.x) + 1;
    this.maxForce = 0.2;
    this.size = random(0.4, 1.5);

    // 增加色彩多樣性 (使用 HSB 讓色彩更鮮豔)
    push();
    colorMode(HSB);
    this.color = color(random(360), 70, 90);
    pop();

    // 隨機品種：0 為標準型, 1 為瘦長型, 2 為圓身型
    this.fishType = floor(random(3));
    if (this.fishType === 1) { // 瘦長型
      this.bodyW = 65; this.bodyH = 10;
    } else if (this.fishType === 2) { // 圓身型
      this.bodyW = 40; this.bodyH = 25;
    } else { // 標準型
      this.bodyW = 50; this.bodyH = 15;
    }

    this.tailOffset = random(100); // 讓每條魚的擺尾節奏錯開
  }

  move() {
    // 閃躲鼠標邏輯
    let mouse = createVector(mouseX, mouseY);
    let d = p5.Vector.dist(this.pos, mouse);
    if (d < 150) {
      let flee = p5.Vector.sub(this.pos, mouse);
      flee.setMag(this.maxSpeed * 2);
      let steer = p5.Vector.sub(flee, this.vel);
      steer.limit(this.maxForce * 2);
      this.acc.add(steer);
    }

    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0);

    // 讓魚游出畫面後從另一側重新出現
    if (this.pos.x > width + 50) this.pos.x = -50;
    else if (this.pos.x < -50) this.pos.x = width + 50;
    this.pos.y = constrain(this.pos.y, 50, height - 50);
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y);
    
    // 頭朝向移動方向
    let angle = this.vel.heading();
    rotate(angle);
    scale(-1, 1); // 關鍵修正：將原本向左繪製的魚形翻轉為向右，以對齊速度向量
    if (abs(angle) > HALF_PI) scale(1, -1); // 避免倒著游

    let wagSpeed = this.vel.mag() * 0.2;
    let wag = sin(frameCount * wagSpeed + this.tailOffset) * 8;

    scale(this.size);
    fill(this.color);
    noStroke();

    // 使用 vertex 繪製簡約魚形
    beginShape();
    vertex(0, 0); // 魚頭
    bezierVertex(this.bodyW * 0.4, -this.bodyH, this.bodyW * 0.8, -this.bodyH, this.bodyW, 0); // 背部
    bezierVertex(this.bodyW * 0.8, this.bodyH, this.bodyW * 0.4, this.bodyH, 0, 0); // 腹部
    endShape();
    
    // 魚尾
    beginShape();
    vertex(this.bodyW - 5, 0); // 尾巴連接處稍微往內縮一點
    vertex(this.bodyW + 10, -12 + wag); // 尾巴上頂點受 wag 影響
    vertex(this.bodyW + 10, 12 + wag);  // 尾巴下頂點受 wag 影響
    endShape(CLOSE);

    // 魚眼睛
    fill(255);
    circle(8, -3, 5); // 眼白
    fill(0);
    circle(9, -3, 2); // 瞳孔
    pop();
  }
}

function drawUnderwaterBackground() {
  noFill();
  // 更深邃的漸層色
  for (let i = 0; i <= height; i++) {
    let inter = map(i, 0, height, 0, 1);
    let c = lerpColor(color(10, 80, 130), color(5, 15, 30), inter);
    stroke(c);
    line(0, i, width, i);
  }

  // 模擬動態光線 (God Rays)
  noStroke();
  for (let i = 0; i < 3; i++) {
    // 使用 sin 函數結合 frameCount 產生緩慢的左右擺動位移
    let shift = sin(frameCount * 0.01 + i * 2) * 100;
    fill(255, 255, 255, 12); // 設定微弱的半透明白光
    beginShape();
    // 頂部位置，加入 shift 偏移量
    vertex(width * (0.12 + i * 0.3) + shift, 0);
    vertex(width * (0.28 + i * 0.3) + shift, 0);
    vertex(width * (0.21 + i * 0.3) + shift * 1.2, height);
    vertex(width * (0.19 + i * 0.3) + shift * 1.2, height);
    endShape(CLOSE);
  }

  // 底部沙地
  fill(194, 178, 128);
  rect(0, height - 30, width, 30);
  fill(160, 140, 100);
  for(let i=0; i<width; i+=40) {
    ellipse(i + random(20), height - random(5, 15), 5, 3);
  }
}

function drawDust() {
  noStroke();
  for (let d of dust) {
    fill(255, 255, 255, d.alpha);
    circle(d.x, d.y, d.size);
    d.y += 0.2; // 微粒緩慢下沉
    if (d.y > height) d.y = 0;
  }
}

function drawAquariumFrame() {
  // 玻璃反光感 (左上角斜線)
  stroke(255, 255, 255, 30);
  strokeWeight(20);
  line(0, height * 0.2, width * 0.2, 0);
}

// 繪製裝飾物 (石頭和海星)
function drawDecorations() {
  push();
  noStroke();
  for (let d of decorations) {
    push();
    translate(d.x, d.y);
    scale(d.size);
    rotate(d.rotation);

    fill(d.color);

    if (d.type === 'rock') {
      // 繪製一個不規則的石頭形狀 (使用橢圓模擬)
      ellipse(0, 0, d.width, d.height);
    } else { // starfish
      // 繪製五角星
      let outerRadius = 20;
      let innerRadius = 8;
      beginShape();
      for (let i = 0; i < 5; i++) {
        let angle = TWO_PI / 5 * i;
        vertex(cos(angle) * outerRadius, sin(angle) * outerRadius);
        angle += TWO_PI / 10; // 每個角之間再加一個內凹點
        vertex(cos(angle) * innerRadius, sin(angle) * innerRadius);
      }
      endShape(CLOSE);
    }
    pop();
  }
  pop();
}

// 新增：隨機上升的氣泡類別
class FloatingBubble {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.r = random(10, 30); // 隨機半徑
    this.speed = random(0.5, 2); // 隨機上升速度
    this.xOffset = random(1000); // 用於水平方向的雜訊移動
    this.alpha = random(100, 200); // 隨機透明度
    this.popping = false; // 新增：是否處於破裂動畫中
  }

  move() {
    if (this.popping) {
      // 破裂動畫邏輯：半徑快速變大，透明度快速消失
      this.r += 5;
      this.alpha -= 25;
      this.y -= this.speed * 0.5; // 破掉時稍微減緩上升速度
    } else {
      this.y -= this.speed; // 向上移動
      // 使用 noise 增加一些水平方向的漂移
      this.x += map(noise(this.xOffset), 0, 1, -0.5, 0.5);
      this.xOffset += 0.01;
    }
  }

  display() {
    push();
    noFill();
    stroke(255, 255, 255, this.alpha); // 白色邊框，帶透明度
    strokeWeight(2);
    circle(this.x, this.y, this.r * 2);
    
    // 如果正在破裂，額外畫幾條向外放射的小線條
    if (this.popping) {
      for (let i = 0; i < 6; i++) {
        let angle = TWO_PI / 6 * i;
        let lineStart = this.r * 0.8;
        let lineEnd = this.r * 1.2;
        line(this.x + cos(angle) * lineStart, this.y + sin(angle) * lineStart, 
             this.x + cos(angle) * lineEnd, this.y + sin(angle) * lineEnd);
      }
    }
    pop();
  }

  // 檢查滑鼠是否點擊到氣泡
  isClicked(mx, my) {
    let d = dist(mx, my, this.x, this.y);
    return d < this.r;
  }

  // 檢查氣泡是否超出畫面
  isOffscreen() {
    return this.y < -this.r;
  }
}
