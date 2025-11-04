import { useRef, useEffect, useState } from "react";
import "./Canvas.css";

const Canvas = () => {
  const canvasRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [start, setStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    draw(ctx);
  }, [scale, offset]);

  const draw = (ctx) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(scale, scale);

    // 🔹 Aquí dibujas tu contenido del canvas
    ctx.fillStyle = "#3498db";
    ctx.fillRect(100, 100, 200, 150);

    ctx.restore();
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = 0.1;
    const newScale = e.deltaY < 0 ? scale + zoomFactor : scale - zoomFactor;
    setScale(Math.min(Math.max(newScale, 0.5), 3)); // límites de zoom
  };

  const handleMouseDown = (e) => {
    setDragging(true);
    setStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e) => {
    if (dragging) {
      setOffset({ x: e.clientX - start.x, y: e.clientY - start.y });
    }
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  return (
    <div className="canvas-container">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
    </div>
  );
};

export default Canvas;
