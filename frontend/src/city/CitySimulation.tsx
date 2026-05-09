import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { useDaoStore } from '../store';

const CitySimulation: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const agentsLayerRef = useRef<PIXI.Container | null>(null);
  const agentSprites = useRef<{ [key: string]: PIXI.Graphics }>({});
  const { agents } = useDaoStore();

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize PixiJS Application
    const app = new PIXI.Application();
    
    (async () => {
        await app.init({
            width: containerRef.current?.clientWidth || 1200,
            height: containerRef.current?.clientHeight || 800,
            backgroundColor: 0x050505,
            antialias: true,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
        });

        if (containerRef.current) {
            containerRef.current.appendChild(app.canvas);
        }

        const resize = () => {
            if (containerRef.current) {
                app.renderer.resize(containerRef.current.clientWidth, containerRef.current.clientHeight);
            }
        };
        window.addEventListener('resize', resize);

        // Draw Background Grid
        const drawGrid = () => {
            const grid = new PIXI.Graphics();
            grid.setStrokeStyle({ width: 1, color: 0x00f3ff, alpha: 0.05 });
            for (let i = 0; i < app.screen.width; i += 40) {
                grid.moveTo(i, 0);
                grid.lineTo(i, app.screen.height);
            }
            for (let i = 0; i < app.screen.height; i += 40) {
                grid.moveTo(0, i);
                grid.lineTo(app.screen.width, i);
            }
            app.stage.addChildAt(grid, 0);
        };
        drawGrid();

        // Agents Layer
        const agentsLayer = new PIXI.Container();
        app.stage.addChild(agentsLayer);
        agentsLayerRef.current = agentsLayer;
        appRef.current = app;

        return () => {
            window.removeEventListener('resize', resize);
        };

        // Animation Loop
        app.ticker.add(() => {
            // Smooth movement interpolation could go here
        });
    })();

    return () => {
      app.destroy(true, { children: true, texture: true, context: true });
    };
  }, []);

  // Update Agent Positions
  useEffect(() => {
    if (!appRef.current || !agentsLayerRef.current) return;

    agents.forEach((agent) => {
      let sprite = agentSprites.current[agent.id];
      
      if (!sprite) {
        sprite = new PIXI.Graphics();
        // Create a holographic diamond shape for agents
        sprite.setStrokeStyle({ width: 2, color: 0x00f3ff, alpha: 0.8 });
        sprite.poly([0, -15, 10, 0, 0, 15, -10, 0], true);
        sprite.fill({ color: 0x00f3ff, alpha: 0.2 });
        
        // Add a glow effect (simple circle)
        const glow = new PIXI.Graphics();
        glow.circle(0, 0, 20);
        glow.fill({ color: 0x00f3ff, alpha: 0.1 });
        sprite.addChild(glow);

        // Name Tag
        const text = new PIXI.Text({
            text: agent.name.toUpperCase(),
            style: {
                fontFamily: 'JetBrains Mono',
                fontSize: 10,
                fill: 0x00f3ff,
                fontWeight: 'bold',
            }
        });
        text.anchor.set(0.5, 2.5);
        sprite.addChild(text);

        agentsLayerRef.current?.addChild(sprite);
        agentSprites.current[agent.id] = sprite;
      }

      // Smoothly update position
      sprite.x = agent.pos.x;
      sprite.y = agent.pos.y;
    });
  }, [agents]);

  return <div ref={containerRef} className="w-full h-full" />;
};

export default CitySimulation;
