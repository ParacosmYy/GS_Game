const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

canvas.width = 800;
canvas.height = 600;

// Black background
ctx.fillStyle = "#000";
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Blue rectangle centered on canvas
ctx.fillStyle = "#00f";
ctx.fillRect(350, 250, 100, 100);

console.log("KOF 2002 POC initialized");
