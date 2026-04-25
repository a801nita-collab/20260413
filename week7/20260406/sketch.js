let cellSize = 80;
let targetCol, targetRow;
let level = 1;
let gameState = "playing"; // 狀態：playing, result (通關), gameOver (失敗)
let shakeAmount = 0;       // 震動強度
let failFlash = 0;         // 錯誤閃爍亮度
let lives = 3;             // 剩餘鏟子數量
let particles = [];        // 慶祝粒子陣列
let flashR = 0, flashG = 0, flashB = 0; // 配合煙火顏色的閃光分量

function setup() {
  createCanvas(windowWidth, windowHeight);
  initTarget();
  // 禁用右鍵選單，以免影響遊戲操作
  forbidContextMenu();
}

function initTarget() {
  // 隨機設定一個目標方框的座標
  let cols = ceil(width / cellSize);
  let rows = ceil(height / cellSize);
  targetCol = floor(random(cols));
  targetRow = floor(random(rows));
}

// 輔助函式：禁用瀏覽器右鍵選單
function forbidContextMenu() {
  document.oncontextmenu = () => false;
}

function draw() {
  // 背景色會根據錯誤閃爍強度變紅，並加上與煙火同色系的閃光
  let bgR = failFlash + flashR;
  let bgG = flashG;
  let bgB = flashB;
  background(bgR, bgG, bgB);
  
  if (failFlash > 0) failFlash -= 5; // 紅色緩慢褪去
  if (flashR > 0) flashR -= 2; // 顏色閃光緩慢褪去
  if (flashG > 0) flashG -= 2;
  if (flashB > 0) flashB -= 2;

  // 如果在通關畫面狀態
  if (gameState === "result") {
    handleParticles();
    drawResultScreen();
    return;
  }
  
  if (gameState === "gameOver") {
    drawGameOverScreen();
    return;
  }

  push();
  // 處理震動效果
  if (shakeAmount > 0) {
    translate(random(-shakeAmount, shakeAmount), random(-shakeAmount, shakeAmount));
    shakeAmount *= 0.9; // 震動隨時間衰減
    if (shakeAmount < 0.1) shakeAmount = 0;
  }

  // 計算橫向與直向的方框數量，並計算精確的方格寬高以填滿螢幕
  let cols = ceil(width / cellSize);
  let rows = ceil(height / cellSize);
  let w = width / cols;
  let h = height / rows;

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let x = i * w;
      let y = j * h;

      // 繪製格線（將幸運格子隱藏，使其外觀與普通格子一致）
      stroke(40); 
      noFill();
      rect(x, y, w, h);

      // 當滑鼠滑過方框時
      if (mouseX >= x && mouseX < x + w && mouseY >= y && mouseY < y + h) {
        // 計算滑鼠位置與目標方框中心點的「像素距離」，這比原本的「格數距離」更細膩精準
        let targetCenterX = targetCol * w + w / 2;
        let targetCenterY = targetRow * h + h / 2;
        let d = dist(mouseX, mouseY, targetCenterX, targetCenterY);
        
        // 設定雷達感測半徑（以像素為單位，設定為方格寬度的 10 倍）
        let maxRange = w * 10;

        // 根據距離映射圓的大小與顏色：越近 (d 越小) 則越大且越紅
        let circleSize = map(d, 0, maxRange, min(w, h) * 0.95, 2, true);
        let redness = map(d, 0, maxRange, 255, 100, true);
        
        fill(redness, 0, 0);
        noStroke();
        ellipse(x + w / 2, y + h / 2, circleSize);
      }
    }
  }
  
  pop(); // 結束震動影響範圍

  // 在左上角顯示目前的星星數量 (生命值)
  fill(255, 255, 0); // 改為黃色
  noStroke();
  textAlign(LEFT, TOP);
  textSize(48); // 大小放大一倍 (24 -> 48)

  // 設定發光效果
  drawingContext.shadowBlur = 20;
  drawingContext.shadowColor = color(255, 255, 0);

  let starIcons = "";
  for (let i = 0; i < lives; i++) {
    starIcons += "★ ";
  }
  text(starIcons, 20, 20);
  
  // 重置發光效果，以免影響後續繪製的其他文字（如關卡資訊）
  drawingContext.shadowBlur = 0;

  // 在右上角顯示目前的關卡資訊
  fill(255);
  noStroke();
  textAlign(RIGHT, TOP);
  textSize(24);
  text("關卡: " + level + " / 3", width - 20, 20);
}

function drawResultScreen() {
  fill(255);
  textAlign(CENTER, CENTER);
  
  textSize(36);
  text("恭喜你找到幸運色塊!!", width / 2, height / 2 - 20);
  
  textSize(20);
  let msg = level < 3 ? "點擊畫面進入下一關" : "你已通關所有關卡！點擊重新開始遊戲";
  text(msg, width / 2, height / 2 + 40);
  
  textSize(16);
  text("目前關卡: " + level + " / 3", width / 2, height / 2 + 80);
}

function drawGameOverScreen() {
  fill(255, 50, 50);
  textAlign(CENTER, CENTER);
  
  textSize(48);
  text("遊戲結束", width / 2, height / 2 - 20);
  
  fill(255);
  textSize(20);
  text("鏟子用完了！點擊畫面重新開始", width / 2, height / 2 + 40);
}

function keyPressed() { } // 移除原本的鍵盤偵測

function mousePressed() {
  if (gameState === "result" || gameState === "gameOver") {
    // 結算或失敗畫面時，點擊左鍵處理
    if (gameState === "gameOver") {
      resetGame();
    } else if (mouseButton === LEFT) {
      advanceLevel();
    }
  } else if (gameState === "playing") {
    // 遊戲中時，按下滑鼠右鍵檢查是否找到幸運格子
    if (mouseButton === RIGHT) {
      checkWinCondition();
    }
  }
}

function resetGame() {
  level = 1;
  cellSize = 80;
  lives = 3;
  particles = [];
  initTarget();
  gameState = "playing";
}

function advanceLevel() {
  if (level < 3) {
      level++;
      cellSize /= 2; // 增加難度
      lives = 3;     // 進入下一關恢復鏟子
      particles = [];
    } else {
      resetGame();
      return;
    }
    initTarget();
    gameState = "playing";
}

function checkWinCondition() {
  let cols = ceil(width / cellSize);
  let rows = ceil(height / cellSize);
  let w = width / cols;
  let h = height / rows;

  let currentCol = floor(mouseX / w);
  let currentRow = floor(mouseY / h);

  // 檢查目前滑鼠所在的格子是否為幸運格子
  if (currentCol === targetCol && currentRow === targetRow) {
    gameState = "result";
  } else {
    // 點錯了：觸發震動與閃爍
    shakeAmount = 15;
    failFlash = 100;
    lives--;
    if (lives <= 0) {
      gameState = "gameOver";
    }
  }
}

function handleParticles() {
  // 縮短間隔，讓煙火更密集 (每 15 幀一波)
  if (frameCount % 15 === 0) {
    spawnFirework(random(width), random(height / 2));
  }
  
  // 更新與繪製所有粒子
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].display();
    if (particles[i].alpha <= 0) {
      particles.splice(i, 1);
    }
  }
}

function spawnFirework(x, y) {
  // 增加粒子數量到 80 個，並產生隨機鮮豔色
  let baseHue = random(360);

  // 設定與煙火顏色一致的背景閃光
  colorMode(HSB, 360, 100, 100);
  let c = color(baseHue, 80, 40); // 取得飽和度 80, 亮度 40 的色彩
  flashR = red(c);
  flashG = green(c);
  flashB = blue(c);
  colorMode(RGB, 255); // 切換回預設 RGB 模式

  for (let i = 0; i < 80; i++) {
    particles.push(new Particle(x, y, baseHue));
  }
}

class Particle {
  constructor(x, y, col) {
    this.x = x;
    this.y = y;
    this.history = []; // 儲存過去的位置以建立尾巴
    
    // 使用 HSB 顏色
    colorMode(HSB, 360, 100, 100, 255);
    this.color = color(col, random(60, 100), 100);
    colorMode(RGB, 255);

    // 爆炸速度與角度
    let angle = random(TWO_PI);
    let speed = random(2, 10);
    this.vx = cos(angle) * speed;
    this.vy = sin(angle) * speed;
    
    this.alpha = 255;
    this.size = random(2, 7);
    this.friction = 0.95; // 空氣阻力，讓煙火有層次感
    this.decay = random(2, 5); // 隨機消失速度
  }
  update() {
    // 紀錄當前位置到歷史中
    this.history.push({ x: this.x, y: this.y });
    if (this.history.length > 15) this.history.shift(); // 限制尾巴長度

    this.vx *= this.friction;
    this.vy *= this.friction;
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.15; // 重力
    this.alpha -= this.decay;
  }
  display() {
    noStroke();
    
    // 繪製淡淡的長尾巴
    for (let i = 0; i < this.history.length; i++) {
      let p = this.history[i];
      // 越舊的點越透明、越小
      let tAlpha = map(i, 0, this.history.length, 0, this.alpha * 0.3);
      fill(red(this.color), green(this.color), blue(this.color), tAlpha);
      ellipse(p.x, p.y, this.size * (i / this.history.length));
    }

    let c = color(red(this.color), green(this.color), blue(this.color), this.alpha);
    fill(c);
    // 加入隨機閃爍感 (Twinkle)
    let s = this.size * (random(1) > 0.8 ? 1.5 : 1);
    ellipse(this.x, this.y, s);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initTarget();
}
