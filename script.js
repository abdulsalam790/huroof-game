const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

const size = 35; // حجم السداسي
const rows = 5;
const cols = 5;

function drawHex(x, y, size, text) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const px = x + size * Math.cos(angle);
    const py = y + size * Math.sin(angle);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();

  // شكل السداسي
  ctx.fillStyle = "white";
  ctx.fill();
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 2;
  ctx.stroke();

  // كتابة الحرف
  ctx.fillStyle = "#000";
  ctx.font = "20px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, y);
}

function drawBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const letters = ["ا","ب","ت","ث","ج","ح","خ","د","ذ","ر","ز","س","ش","ص","ض","ط","ظ","ع","غ","ف","ق","ك","ل","م","ن"];

  let index = 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {

      const offsetX = r * (size * 0.9);
      const x = 150 + c * (size * 1.8) + offsetX;
      const y = 120 + r * (size * 1.55);

      drawHex(x, y, size, letters[index]);
      index++;
    }
  }
}

document.getElementById("startBtn").addEventListener("click", () => {
  drawBoard();
});