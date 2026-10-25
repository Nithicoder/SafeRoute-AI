import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AgentState,
  AlgorithmResult,
  CellType,
  Coordinate,
  Exit,
  ToolMode,
} from '../types';
import { coordKey, getCellCost, isValidCoord } from '../utils/gridHelpers';

interface SimulationGridProps {
  grid: CellType[][];
  start: Coordinate;
  exits: Exit[];
  agent: AgentState;
  pathResult: AlgorithmResult | null;
  activeTool: ToolMode;
  onCellClick: (c: Coordinate) => void;
  onCellDrag: (c: Coordinate) => void;
  onAddExit: (c: Coordinate) => void;
  onSetStart: (c: Coordinate) => void;
}

export const SimulationGrid: React.FC<SimulationGridProps> = ({
  grid,
  start,
  exits,
  agent,
  pathResult,
  activeTool,
  onCellClick,
  onCellDrag,
  onAddExit,
  onSetStart,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [hoveredCoord, setHoveredCoord] = useState<Coordinate | null>(null);

  const rows = grid.length;
  const cols = grid[0]?.length || 0;

  // Compute cell size dynamically based on container size
  const [cellSize, setCellSize] = useState<number>(36);

  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current || cols === 0) return;
      const containerWidth = containerRef.current.clientWidth - 32;
      const targetSize = Math.max(22, Math.min(48, Math.floor(containerWidth / cols)));
      setCellSize(targetSize);
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [cols]);

  const width = cols * cellSize;
  const height = rows * cellSize;

  // Coordinate conversion from mouse event
  const getCoordFromEvent = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>): Coordinate | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      const clientX = (e.clientX - rect.left) * scaleX;
      const clientY = (e.clientY - rect.top) * scaleY;

      const x = Math.floor(clientX / cellSize);
      const y = Math.floor(clientY / cellSize);

      if (x >= 0 && x < cols && y >= 0 && y < rows) {
        return { x, y };
      }
      return null;
    },
    [cellSize, cols, rows]
  );

  // Render Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High-DPI sharp rendering
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Clear background to clean white
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    // Fast lookup sets
    const exitMap = new Map<string, Exit>();
    for (const e of exits) {
      exitMap.set(coordKey(e), e);
    }

    const exploredSet = new Set<string>();
    if (pathResult?.exploredNodes) {
      for (const node of pathResult.exploredNodes) {
        exploredSet.add(coordKey(node));
      }
    }

    const frontierSet = new Set<string>();
    if (pathResult?.frontierNodes) {
      for (const node of pathResult.frontierNodes) {
        frontierSet.add(coordKey(node));
      }
    }

    const currentRoute = agent.currentRoute.length > 0 ? agent.currentRoute : (pathResult?.path || []);

    // 1. Draw Grid Cells
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * cellSize;
        const y = r * cellSize;
        const key = `${c},${r}`;
        const cell = grid[r][c];

        // Base cell colors (Light Theme)
        let bg = '#F8FAFC'; // Clean off-white
        let stroke = '#E2E8F0'; // Subtle light gray border

        // Explored & Frontier highlights
        if (exploredSet.has(key)) {
          bg = '#E0F2FE'; // Soft light sky blue
          stroke = '#BAE6FD';
        }
        if (frontierSet.has(key)) {
          bg = '#EEF2FF'; // Soft indigo tint
          stroke = '#C7D2FE';
        }

        // Cell types
        if (cell === 'wall') {
          bg = '#64748B'; // Medium slate gray
          stroke = '#475569';
        } else if (cell === 'hazard') {
          bg = '#FEE2E2'; // Soft light red
          stroke = '#EF4444';
        } else if (cell === 'weight') {
          bg = '#FEF3C7'; // Soft light amber
          stroke = '#F59E0B';
        }

        ctx.fillStyle = bg;
        ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);

        // Grid border
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, y + 0.5, cellSize, cellSize);

        // Wall Texture (subtle diagonal line)
        if (cell === 'wall') {
          ctx.strokeStyle = '#94A3B8';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(x + 4, y + cellSize - 4);
          ctx.lineTo(x + cellSize - 4, y + 4);
          ctx.stroke();
        }

        // Hazard Fire Icon
        if (cell === 'hazard') {
          ctx.font = `bold ${Math.floor(cellSize * 0.44)}px system-ui`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🔥', x + cellSize / 2, y + cellSize / 2);
        }

        // Debris Weight Icon
        if (cell === 'weight') {
          ctx.font = `bold ${Math.floor(cellSize * 0.42)}px system-ui`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('⚠️', x + cellSize / 2, y + cellSize / 2);
        }

        // Frontier border highlight
        if (frontierSet.has(key) && cell !== 'wall') {
          ctx.strokeStyle = '#6366F1';
          ctx.lineWidth = 2;
          ctx.setLineDash([2, 2]);
          ctx.strokeRect(x + 2, y + 2, cellSize - 4, cellSize - 4);
          ctx.setLineDash([]);
        }
      }
    }

    // 2. Draw Active Path Route (High-visibility Teal/Cyan line with directional waypoints)
    if (currentRoute.length > 1) {
      ctx.save();
      ctx.shadowColor = 'rgba(8, 145, 178, 0.35)';
      ctx.shadowBlur = 6;
      ctx.strokeStyle = '#0891B2'; // Primary accent teal/cyan
      ctx.lineWidth = Math.max(3, Math.floor(cellSize * 0.16));
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      for (let i = 0; i < currentRoute.length; i++) {
        const pt = currentRoute[i];
        const px = pt.x * cellSize + cellSize / 2;
        const py = pt.y * cellSize + cellSize / 2;
        if (i === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.stroke();
      ctx.restore();

      // Path Waypoint Dots
      for (let i = 1; i < currentRoute.length - 1; i++) {
        const pt = currentRoute[i];
        const px = pt.x * cellSize + cellSize / 2;
        const py = pt.y * cellSize + cellSize / 2;

        ctx.fillStyle = '#0E7490';
        ctx.beginPath();
        ctx.arc(px, py, Math.max(2.5, cellSize * 0.08), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 3. Draw Exits (Light green background, bold green border, distinct icon)
    for (const exit of exits) {
      const ex = exit.x * cellSize;
      const ey = exit.y * cellSize;

      ctx.save();
      ctx.fillStyle = exit.isBlocked ? '#FEE2E2' : '#DCFCE7';
      ctx.fillRect(ex + 2, ey + 2, cellSize - 4, cellSize - 4);

      ctx.strokeStyle = exit.isBlocked ? '#DC2626' : '#16A34A';
      ctx.lineWidth = 2;
      ctx.strokeRect(ex + 2, ey + 2, cellSize - 4, cellSize - 4);
      ctx.restore();

      // Icon & Label
      ctx.font = `bold ${Math.floor(cellSize * 0.38)}px system-ui`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(exit.isBlocked ? '🚫' : '🚪', ex + cellSize / 2, ey + cellSize / 2);

      // Exit name tag
      ctx.fillStyle = exit.isBlocked ? '#991B1B' : '#15803D';
      ctx.font = `bold ${Math.max(8, Math.floor(cellSize * 0.22))}px system-ui`;
      ctx.fillText(exit.name.split(' ')[0] || 'EXIT', ex + cellSize / 2, ey + cellSize - 4);
    }

    // 4. Draw Start Marker
    const sx = start.x * cellSize;
    const sy = start.y * cellSize;
    ctx.strokeStyle = '#0284C7';
    ctx.lineWidth = 2;
    ctx.strokeRect(sx + 3, sy + 3, cellSize - 6, cellSize - 6);

    // 5. Draw Active Evacuee / Agent Token
    const agentPos = agent.position;
    const ax = agentPos.x * cellSize + cellSize / 2;
    const ay = agentPos.y * cellSize + cellSize / 2;
    const agentRadius = cellSize * 0.38;

    ctx.save();
    ctx.shadowColor = 'rgba(8, 145, 178, 0.4)';
    ctx.shadowBlur = 8;

    ctx.fillStyle = '#0891B2';
    ctx.beginPath();
    ctx.arc(ax, ay, agentRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Agent Avatar Icon
    ctx.font = `bold ${Math.floor(cellSize * 0.42)}px system-ui`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🏃', ax, ay);
    ctx.restore();

    // 6. Draw Hover Reticle
    if (hoveredCoord) {
      const hx = hoveredCoord.x * cellSize;
      const hy = hoveredCoord.y * cellSize;
      ctx.strokeStyle = '#0891B2';
      ctx.lineWidth = 2;
      ctx.strokeRect(hx + 1, hy + 1, cellSize - 2, cellSize - 2);
    }
  }, [
    grid,
    rows,
    cols,
    cellSize,
    width,
    height,
    start,
    exits,
    agent,
    pathResult,
    hoveredCoord,
  ]);

  // Mouse Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsMouseDown(true);
    const coord = getCoordFromEvent(e);
    if (!coord) return;

    if (activeTool === 'start') {
      onSetStart(coord);
    } else if (activeTool === 'exit') {
      onAddExit(coord);
    } else {
      onCellClick(coord);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coord = getCoordFromEvent(e);
    setHoveredCoord(coord);

    if (isMouseDown && coord) {
      if (activeTool === 'wall' || activeTool === 'hazard' || activeTool === 'weight' || activeTool === 'eraser') {
        onCellDrag(coord);
      }
    }
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  const handleMouseLeave = () => {
    setIsMouseDown(false);
    setHoveredCoord(null);
  };

  const hoveredCell = hoveredCoord && isValidCoord(grid, hoveredCoord)
    ? grid[hoveredCoord.y][hoveredCoord.x]
    : null;

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center w-full bg-white border border-slate-200 rounded-xl p-4 shadow-xs text-slate-800"
    >
      <div className="w-full flex items-center justify-between mb-2 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-800">Interactive Evacuation Facility Map</span>
          <span className="text-[11px] bg-slate-100 px-2 py-0.5 rounded text-cyan-800 font-mono font-medium">
            {cols} × {rows} Grid
          </span>
        </div>

        {hoveredCoord && hoveredCell && (
          <div className="flex items-center gap-2 font-mono text-[11px] text-slate-600">
            <span>Pos: ({hoveredCoord.x}, {hoveredCoord.y})</span>
            <span>•</span>
            <span className="capitalize">Cell: {hoveredCell}</span>
            <span>•</span>
            <span>Cost: {getCellCost(hoveredCell)}</span>
          </div>
        )}
      </div>

      {/* Canvas Wrapper */}
      <div className="overflow-auto max-w-full rounded-lg border border-slate-200 shadow-2xs bg-slate-50/50 p-1 flex justify-center">
        <canvas
          ref={canvasRef}
          style={{ width: `${width}px`, height: `${height}px` }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          className="cursor-crosshair block select-none touch-none"
        />
      </div>
    </div>
  );
};
