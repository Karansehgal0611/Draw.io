import { useRef, useState, useEffect } from "react";
import "./App.css";

export default function DrawingBoard() {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#000000");
  const [lineWidth, setLineWidth] = useState(5);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isErasing, setIsErasing] = useState(false);
  const [shapeSize, setShapeSize] = useState(50);
  const [currentShape, setCurrentShape] = useState(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth * 0.85;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctxRef.current = ctx;
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveHistory();
  }, [bgColor]);

  const startDrawing = (e) => {
    if (currentShape) {
      drawShape(currentShape, e);
      return;
    }
    const ctx = ctxRef.current;
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const ctx = ctxRef.current;
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.strokeStyle = isErasing ? bgColor : color;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  };

  const stopDrawing = () => {
    ctxRef.current.closePath();
    setIsDrawing(false);
    saveHistory();
  };

  const saveHistory = () => {
    const canvas = canvasRef.current;
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(canvas.toDataURL());
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex <= 0) return;
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    const img = new Image();
    img.src = history[historyIndex - 1];
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      setHistoryIndex(historyIndex - 1);
    };
  };

  const clearCanvas = () => {
    const ctx = ctxRef.current;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    saveHistory();
  };

  const drawShape = (shape, e) => {
    const ctx = ctxRef.current;
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;

    if (shape === "rectangle") {
      ctx.fillRect(x - shapeSize / 2, y - shapeSize / 2, shapeSize, shapeSize);
    } else if (shape === "circle") {
      ctx.beginPath();
      ctx.arc(x, y, shapeSize / 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (shape === "triangle") {
      ctx.beginPath();
      ctx.moveTo(x, y - shapeSize / 2);
      ctx.lineTo(x - shapeSize / 2, y + shapeSize / 2);
      ctx.lineTo(x + shapeSize / 2, y + shapeSize / 2);
      ctx.closePath();
      ctx.fill();
    }
    saveHistory();
    setCurrentShape(null);
  };

  return (
    <div className="drawing-board-container">
      <div className="sidebar">
        <h1>Draw.io</h1>
        <label>
          Brush Color:
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
        </label>
        <label>
          Brush Size:
          <input type="range" min="1" max="20" value={lineWidth} onChange={(e) => setLineWidth(e.target.value)} />
        </label>
        <label>
          Background Color:
          <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
        </label>
        <label>
          Shape Size:
          <input type="range" min="10" max="200" value={shapeSize} onChange={(e) => setShapeSize(e.target.value)} />
        </label>
        <button onClick={() => setIsErasing(!isErasing)}>{isErasing ? "Switch to Brush" : "Eraser"}</button>
        <button onClick={() => setCurrentShape("rectangle")}>Rectangle</button>
        <button onClick={() => setCurrentShape("circle")}>Circle</button>
        <button onClick={() => setCurrentShape("triangle")}>Triangle</button>
        <button onClick={undo}>Undo</button>
        <button onClick={clearCanvas}>Clear</button>
      </div>
      <div className="canvas-container">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        ></canvas>
      </div>
    </div>
  );
}
