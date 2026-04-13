let seagrasses = [];
let bubbles = [];
let fishes = [];

// 設定作業網址，指向本目錄下的 week1 與 week2
const assignmentUrls = [
  "./week1/index.html", 
  "./week2/index.html"
];

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent('canvas-container');

  // 初始化海草 (數量隨作業週數增加)
  for (let i = 0; i < 15; i++) {
    let h = random(100, 200) + (assignmentUrls.length * 20); // 創意隱喻：作品愈多長愈高
    seagrasses.push(new Seagrass(random(width), h));
  }

  // 初始化氣泡按鈕 (對應兩週作品)
  bubbles.push(new Bubble(width * 0.3, height * 0.4, "第一週作品", assignmentUrls[0]));
  bubbles.push(new Bubble(width * 0.7, height * 0.3, "第二週作品", assignmentUrls[1]));

  // 初始化魚群
  for (let i = 0; i < 5; i++) {
    fishes.push(new Fish(random(width), random(height * 0.2, height * 0.8), random(1, 3) * (random() > 0.5 ? 1 : -1))); // 隨機初始位置和速度方向
  }
}

function draw() {
  // 水底漸層背景
  drawUnderwaterBackground();

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
}

function mousePressed() {
  for (let b of bubbles) {
    if (b.isClicked(mouseX, mouseY)) {
      // 顯示作品面板並更新 iframe 內容
      let displayArea = document.getElementById('display-area');
      displayArea.style.display = 'flex';
      document.getElementById('work-iframe').src = b.url;
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
  }

  sway() {
    this.noiseOffset += 0.02;
  }

  display() {
    push();
    stroke(0, 153, 76, 200);
    strokeWeight(4);
    noFill();
    beginShape();
    for (let i = 0; i <= this.h; i += 20) {
      // 使用 noise 產生自然的搖擺感
      let offsetX = map(noise(this.noiseOffset, i * 0.01), 0, 1, -20, 20);
      vertex(this.x + offsetX, height - i);
    }
    endShape();
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
    this.baseY = y;
  }

  float() {
    this.y = this.baseY + sin(frameCount * 0.05) * 10;
  }

  display() {
    push();
    fill(255, 255, 255, 50);
    stroke(255, 200);
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
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = random(1, 3) * (random() > 0.5 ? 1 : -1); // 隨機速度方向
    this.size = random(0.5, 1.2);
  }

  move() {
    this.x += this.speed;
    // 讓魚游出畫面後從另一側重新出現
    if (this.speed > 0 && this.x > width + 50) { // 往右游，超出右邊界
      this.x = -50;
    } else if (this.speed < 0 && this.x < -50) { // 往左游，超出左邊界
      this.x = width + 50;
    }
  }

  display() {
    push();
    translate(this.x, this.y);
    scale(this.size);
    fill(255, 153, 51);
    noStroke();
    
    // 根據速度方向翻轉魚的圖像，使其頭部朝向移動方向
    if (this.speed < 0) {
      scale(-1, 1); // 水平翻轉
    }

    // 使用 vertex 繪製簡約魚形
    beginShape();
    vertex(0, 0); // 魚頭
    bezierVertex(20, -15, 40, -15, 50, 0); // 背部
    bezierVertex(40, 15, 20, 15, 0, 0); // 腹部
    endShape();
    
    // 魚尾
    beginShape();
    vertex(50, 0);
    vertex(65, -10);
    vertex(65, 10);
    endShape(CLOSE);
    pop();
  }
}

function drawUnderwaterBackground() {
  noFill();
  for (let i = 0; i <= height; i++) {
    let inter = map(i, 0, height, 0, 1);
    let c = lerpColor(color(0, 77, 128), color(0, 13, 26), inter);
    stroke(c);
    line(0, i, width, i);
  }
}