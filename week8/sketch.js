let capture, pg;

function setup() {
  createCanvas(windowWidth, windowHeight);
  // 建立攝影機擷取
  capture = createCapture(VIDEO);
  // 隱藏預設在畫布下方生成的 HTML video 元素
  capture.hide();
}

function draw() {
  background('#e7c6ff');

  // 當攝影機成功啟動並取得尺寸後，建立一個同尺寸的離屏畫布 (pg)
  if (!pg && capture.width > 0) {
    pg = createGraphics(capture.width, capture.height);
  }

  // 如果 pg 已建立且攝影機有畫面，則進行像素處理
  if (pg && capture.width > 0) {
    pg.clear(); // 每一幀清空內容重新繪製
    capture.loadPixels(); // 載入攝影機像素資料
    pg.textAlign(CENTER, CENTER);
    pg.textSize(8);
    pg.fill(255); // 設定文字顏色為白色

    let step = 20; // 設定單位大小為 20x20
    for (let y = 0; y < capture.height; y += step) {
      for (let x = 0; x < capture.width; x += step) {
        let index = (x + y * capture.width) * 4; // 計算像素在陣列中的位置
        let r = capture.pixels[index];
        let g = capture.pixels[index + 1];
        let b = capture.pixels[index + 2];
        let avg = Math.floor((r + g + b) / 3); // 計算平均亮度
        pg.text(avg, x + step/2, y + step/2); // 在該單位中心顯示數值
      }
    }
  }

  // 計算影像寬高為全螢幕的 60%
  let vW = windowWidth * 0.6;
  let vH = windowHeight * 0.6;

  // 計算置中座標
  let x = (windowWidth - vW) / 2;
  let y = (windowHeight - vH) / 2;

  // 修正左右顛倒問題（鏡像處理）
  push();
  // 先移動到畫布右側，再將水平比例設為 -1 進行翻轉
  translate(windowWidth, 0);
  scale(-1, 1);

  // 顯示攝影機影像
  image(capture, x, y, vW, vH);

  // 將內容顯示在視訊畫面上方
  if (pg) {
    image(pg, x, y, vW, vH);
  }
  pop();
}

function windowResized() {
  // 當視窗大小改變時，自動調整畫布大小
  resizeCanvas(windowWidth, windowHeight);
}
