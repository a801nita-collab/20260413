let gameState = "START";
let upperPath = [];
let lowerPath = [];
let pathPoints = 15; 
let currentLevel = 1;
const maxLevels = 3; // 改為 3 關
let fireworks = []; // 用於存放煙火物件
let lives = 3; // 生命值
let shakeTimer = 0; // 震動計時器
let invincibleFrames = 0; // 無敵時間（防止連續扣血）
let hitEffectTimer = 0; // 電擊特效計時器

function setup() {
  createCanvas(windowWidth, windowHeight);
  noCursor(); // 隱藏原生鼠標
  generatePath();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  generatePath();
}

function draw() {
  background(30);

  // 更新計時器
  if (invincibleFrames > 0) invincibleFrames--;
  if (hitEffectTimer > 0) hitEffectTimer--;

  // 螢幕震動處理
  if (shakeTimer > 0) {
    push();
    translate(random(-7, 7), random(-7, 7));
    shakeTimer--;
  }
  
  if (gameState === "START") {
    drawPath();
    drawElectricEffect();
    
    push();
    textAlign(CENTER, CENTER);
    // 繪製標題霓虹發光效果
    textSize(80);
    fill(0, 255, 255, random(50, 150));
    text("電流急急棒", width / 2 + random(-3, 3), height / 2 + random(-3, 3));
    fill(255);
    text("電流急急棒", width / 2, height / 2);
    pop();

    fill(0, 255, 150);
    rect(0, height / 2 - 25, 60, 50);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(14);
    text("START", 30, height / 2);
    
    fill(200);
    textSize(18);
    text("請點擊左側 START 按鈕開始遊戲", width / 2, height - 50);
  } else if (gameState === "PLAYING") {
    drawPath();
    checkCollision();
    
    // 檢查是否到達終點
    if (mouseX > width - 20) {
      if (currentLevel < maxLevels) {
        gameState = "LEVEL_WIN";
      } else {
        gameState = "GAME_WIN";
      }
    }
  } else if (gameState === "GAME_OVER") {
    push();
    fill(255, 50, 50);
    textSize(64);
    textAlign(CENTER, CENTER);
    text("通關失敗", width / 2, height / 2);
    textSize(24);
    fill(255);
    text("按 R 重新挑戰", width / 2, height / 2 + 80);
    pop();
  } else if (gameState === "LEVEL_WIN") {
    updateFireworks();
    fill(0, 255, 0);
    textSize(32);
    textAlign(CENTER, CENTER);
    text(`✨ 挑戰成功！完成第 ${currentLevel} 關 ✨`, width / 2, height / 2 - 20);
    textSize(20);
    text("點擊畫面進入下一關", width / 2, height / 2 + 30);
  } else if (gameState === "GAME_WIN") {
    updateFireworks();
    fill(255, 215, 0);
    textSize(48);
    textAlign(CENTER, CENTER);
    text("🏆 恭喜征服所有關卡！ 🏆", width / 2, height / 2 - 20);
    textSize(24);
    text("按 R 重新挑戰", width / 2, height / 2 + 50);
  }

  // 繪製生命值（愛心）
  drawLivesUI();

  // 繪製碰撞電擊特效
  if (hitEffectTimer > 0) {
    drawHitSpark(mouseX, mouseY);
  }

  // 繪製圓形鼠標（無敵時閃爍）
  if (invincibleFrames === 0 || frameCount % 10 < 5) {
    fill(255, 255, 0); 
    noStroke();
    ellipse(mouseX, mouseY, 15, 15);
  }

  if (shakeTimer >= 0) {
    pop(); // 結束震動位移
  }
}

function drawLivesUI() {
  push();
  textSize(30);
  textAlign(LEFT, TOP);
  let heartStr = "";
  for (let i = 0; i < lives; i++) heartStr += "❤️";
  text(heartStr, 20, 20);
  pop();
}

function drawHitSpark(x, y) {
  stroke(255, 255, 0);
  strokeWeight(2);
  for (let i = 0; i < 8; i++) {
    line(x, y, x + random(-40, 40), y + random(-40, 40));
  }
}

function generatePath() {
  upperPath = [];
  lowerPath = [];
  
  // 顯著增加難度梯度：
  pathPoints = 10 + currentLevel * 8; // 關卡越高，點數越多（L1:18, L5:50）
  let baseGap = map(currentLevel, 1, maxLevels, 130, 40); // 關卡越高，路徑越窄（L1:130, L5:40）
  let baseAmplitude = map(currentLevel, 1, maxLevels, 30, 200); // 關卡越高，起伏越劇烈（L1:30, L5:200）

  let spacing = width / (pathPoints - 1);
  for (let i = 0; i < pathPoints; i++) {
    let x = i * spacing;
    let baseY = height / 2;
    
    // 起點(i=0)不設定偏移，確保玩家在安全範圍
    let offset = (i === 0) ? 0 : random(-baseAmplitude, baseAmplitude);
    let currentGap = (i === 0) ? 120 : random(baseGap * 0.8, baseGap);

    upperPath.push({x: x, y: baseY - currentGap / 2 + offset});
    lowerPath.push({x: x, y: baseY + currentGap / 2 + offset});
  }
}

// 煙火與粒子類別實作
class Firework {
  constructor(x, y) {
    this.firework = new Particle(x, y, true);
    this.exploded = false;
    this.particles = [];
  }
  done() { return this.exploded && this.particles.length === 0; }
  update() {
    if (!this.exploded) {
      this.firework.applyForce(createVector(0, 0.15));
      this.firework.update();
      if (this.firework.vel.y >= 0) {
        this.exploded = true;
        this.explode();
      }
    }
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].applyForce(createVector(0, 0.1));
      this.particles[i].update();
      if (this.particles[i].done()) this.particles.splice(i, 1);
    }
  }
  explode() {
    let col = color(random(150, 255), random(150, 255), random(150, 255));
    for (let i = 0; i < 50; i++) {
      this.particles.push(new Particle(this.firework.pos.x, this.firework.pos.y, false, col));
    }
  }
  display() {
    if (!this.exploded) this.firework.display();
    for (let p of this.particles) p.display();
  }
}

class Particle {
  constructor(x, y, isFirework, col) {
    this.pos = createVector(x, y);
    this.isFirework = isFirework;
    this.lifespan = 255;
    this.col = col || color(255, 255, 200);
    this.vel = isFirework ? createVector(0, random(-12, -8)) : p5.Vector.random2D().mult(random(2, 6));
    this.acc = createVector(0, 0);
  }
  applyForce(force) { this.acc.add(force); }
  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
    if (!this.isFirework) this.lifespan -= 4;
  }
  done() { return this.lifespan < 0; }
  display() {
    strokeWeight(this.isFirework ? 4 : 2);
    stroke(red(this.col), green(this.col), blue(this.col), this.lifespan);
    point(this.pos.x, this.pos.y);
  }
}

function drawPath() {
  // 1. 繪製安全區域填充（綠色）
  noStroke();
  fill(0, 255, 0, 40); // 使用半透明綠色 (Alpha = 40)
  beginShape();
  if (upperPath.length > 0) {
    // 上邊界路徑
    curveVertex(upperPath[0].x, upperPath[0].y);
    for (let p of upperPath) curveVertex(p.x, p.y);
    curveVertex(upperPath[upperPath.length - 1].x, upperPath[upperPath.length - 1].y);
    
    // 接續下邊界（反向繪製以形成封閉區塊）
    curveVertex(lowerPath[lowerPath.length - 1].x, lowerPath[lowerPath.length - 1].y);
    for (let i = lowerPath.length - 1; i >= 0; i--) {
      curveVertex(lowerPath[i].x, lowerPath[i].y);
    }
    curveVertex(lowerPath[0].x, lowerPath[0].y);
  }
  endShape(CLOSE);

  // 2. 繪製線條邊界
  stroke(0, 255, 200);
  strokeWeight(3);
  noFill();
  
  // 畫上邊界
  beginShape();
  if (upperPath.length > 0) {
    // 重複第一個與最後一個點，確保曲線從頭繪製到尾
    curveVertex(upperPath[0].x, upperPath[0].y);
  }
  for (let p of upperPath) curveVertex(p.x, p.y);
  if (upperPath.length > 0) {
    curveVertex(upperPath[upperPath.length - 1].x, upperPath[upperPath.length - 1].y);
  }
  endShape();
  
  // 畫下邊界
  beginShape();
  if (lowerPath.length > 0) {
    curveVertex(lowerPath[0].x, lowerPath[0].y);
  }
  for (let p of lowerPath) curveVertex(p.x, p.y);
  if (lowerPath.length > 0) {
    curveVertex(lowerPath[lowerPath.length - 1].x, lowerPath[lowerPath.length - 1].y);
  }
  endShape();
}

function drawStartButton() {
  push();
  fill(0, 255, 150);
  // 繪製帶圓角的按鈕
  rect(0, height / 2 - 30, 75, 60, 0, 15, 15, 0);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(18);
  textStyle(BOLD);
  text("START", 37, height / 2);
  pop();
}

function mousePressed() {
  if (gameState === "START" && mouseX < 75 && mouseY > height/2 - 30 && mouseY < height/2 + 30) {
    gameState = "PLAYING";
    fireworks = []; // 開始時清空煙火
  } else if (gameState === "LEVEL_WIN") {
    currentLevel++;
    generatePath();
    gameState = "START";
    fireworks = [];
  }
}

function keyPressed() {
  if (key === 'r' || key === 'R') {
    currentLevel = 1;
    lives = 3;
    gameState = "START";
    generatePath();
  }
}

function updateFireworks() {
  if (random(1) < 0.08) {
    fireworks.push(new Firework(random(width), height));
  }
  for (let i = fireworks.length - 1; i >= 0; i--) {
    fireworks[i].update();
    fireworks[i].display();
    if (fireworks[i].done()) {
      fireworks.splice(i, 1);
    }
  }
}

function drawElectricEffect() {
  push();
  stroke(0, 255, 255, random(100, 255));
  strokeWeight(random(1, 3));
  noFill();
  // 在標題周圍隨機產生電擊折線
  if (frameCount % 3 === 0) {
    let x = width / 2 + random(-250, 250);
    let y = height / 2 + random(-150, 150);
    beginShape();
    for (let i = 0; i < 6; i++) {
      vertex(x, y);
      x += random(-40, 40);
      y += random(-40, 40);
    }
    endShape();
  }
  pop();
}

function checkCollision() {
  // 遊戲中且非無敵狀態才偵測碰撞
  if (gameState !== "PLAYING" || invincibleFrames > 0) return;

  let spacing = width / (pathPoints - 1);
  // 找出滑鼠目前位於哪兩個頂點之間
  let i = floor(mouseX / spacing);
  i = constrain(i, 0, pathPoints - 2);

  // 計算在該段落中的比例 (0 ~ 1)
  let t = (mouseX - i * spacing) / spacing;

  // 取得四個點來計算 Catmull-Rom 曲線上的精確位置
  let p0 = max(0, i - 1);
  let p1 = i;
  let p2 = i + 1;
  let p3 = min(pathPoints - 1, i + 2);

  // 使用 curvePoint 取得當前 X 對應的上下邊界 Y 座標
  let uy = curvePoint(upperPath[p0].y, upperPath[p1].y, upperPath[p2].y, upperPath[p3].y, t);
  let ly = curvePoint(lowerPath[p0].y, lowerPath[p1].y, lowerPath[p2].y, lowerPath[p3].y, t);

  let playerRadius = 7.5; // 圓形直徑 15 的一半
  let margin = playerRadius + 1.5; // 圓形半徑 + 線條粗細的一半 (strokeWeight 3 / 2)

  // 檢查是否碰到上邊界或下邊界
  if (mouseY - margin < uy || mouseY + margin > ly) {
    lives--;
    shakeTimer = 15; // 觸發震動
    hitEffectTimer = 15; // 觸發電擊特效
    invincibleFrames = 60; // 給予約 1 秒無敵時間
    
    if (lives <= 0) {
      gameState = "GAME_OVER";
    }
  }
}
