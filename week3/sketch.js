let inputElem; // 宣告輸入框變數
let slider; // 宣告滑桿變數
let button; // 宣告按鈕變數
let isBouncing = false; // 是否跳動
let iframeDiv; // 宣告 iframe 容器 DIV 變數
let sel; // 宣告下拉式選單變數

function setup() {
  // 1. 建立全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  
  // 2. 建立 DOM 輸入框 (Create Input)
  inputElem = createInput('👾'); // 預設文字
  inputElem.position(20, 20); // 設定輸入框在左上角的位置
  inputElem.size(400, 50);        // 設定輸入框寬度與高度
  inputElem.style('font-size', '24px'); // 設定輸入框內文字大小

  // 建立滑桿：最小值 15, 最大值 80, 預設值 30
  slider = createSlider(15, 80, 30);
  // 將滑桿移動到文字方塊右邊，並使其垂直置中
  const sliderX = inputElem.x + inputElem.width + 20;
  const sliderY = inputElem.y + (inputElem.height - slider.height) / 2;
  slider.position(sliderX, sliderY);

  // 建立按鈕
  button = createButton('跳動');
  const buttonX = slider.x + slider.width + 20;
  const buttonY = inputElem.y + (inputElem.height - button.height) / 2;
  button.position(buttonX, buttonY);
  button.mousePressed(toggleBounce);

  // 建立下拉式選單
  sel = createSelect();
  sel.position(button.x + button.width + 20, button.y); // 設定選單位置
  sel.option('淡江大學', 'https://www.tku.edu.tw');
  sel.option('淡江教科系', 'https://www.et.tku.edu.tw');
  sel.selected('https://www.et.tku.edu.tw'); // 預設選擇淡江教科系
  sel.changed(changeIframeSite);

  // 建立 DIV 並嵌入 iframe 網頁，設定內容與樣式
  iframeDiv = createDiv('<iframe src="https://www.et.tku.edu.tw" style="width:100%; height:100%; border:none;"></iframe>');
  iframeDiv.position(200, 200); // 設定位置：距離左上角各 200px
  iframeDiv.size((windowWidth - 400) , (windowHeight - 400) ); // 調整高度使其四周間距對稱
}

function toggleBounce() {
  isBouncing = !isBouncing;
}

function changeIframeSite() {
  let selectedUrl = sel.value();
  iframeDiv.elt.querySelector('iframe').src = selectedUrl;
}

function draw() {
  // 每次重繪時清除背景，避免文字殘影
  background(240); 
  
  // 取得使用者輸入的內容
  let txt = inputElem.value();
  
  // 如果輸入框是空的，就不執行繪製
  if (txt.length === 0) return;

  // 取得滑桿的值並設定文字大小
  let txtSize = slider.value();
  textSize(txtSize);

  // 設定文字樣式
  textAlign(LEFT, CENTER); // 設定對齊方式：水平靠左，垂直置中
  // 改用更鮮豔的顏色組合
  let palette = ["#ffbe0b", "#fb5607", "#ff006e", "#8338ec", "#3a86ff"];
  
  // 3. 計算單個字串的像素寬度
  let txtW = textWidth(txt);
  
  // 增加一點文字間距
  let spacing = 20; 
  let oneBlockWidth = txtW + spacing;

  let count = 0; // 用於計算文字序號以分配顏色
  // 4. 利用巢狀迴圈重複繪製文字，填滿整個視窗
  // 從 y = 100 開始，每隔 50px 產生一排
  for (let y = 100; y < height; y += 50) {
    // 每一排的初始 x 位置
    let x = 0;
    
    // 當 x 小於視窗寬度時，持續繪製同一排的文字
    while (x < width) {
      let yOffset = 0;
      if (isBouncing) {
        yOffset = sin(frameCount * 0.1 + x * 0.05) * 10;
      }
      fill(palette[count % palette.length]); // 依序設定顏色
      text(txt, x, y + yOffset);
      // 每次繪製後，將 x 座標往右推移
      x += oneBlockWidth; 
      count++;
    }
  }
}

// 當視窗大小改變時，自動調整畫布大小
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // 視窗改變時，同步調整 iframe DIV 的位置與大小
  iframeDiv.position(200, 200);
  iframeDiv.size((windowWidth - 400), (windowHeight - 400));
}
