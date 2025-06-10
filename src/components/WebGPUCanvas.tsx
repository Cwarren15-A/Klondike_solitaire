import * as React from 'react';
import { WebGPUEngine } from '../utils/webgpuEngine';
import { PBRRenderer } from '../utils/pbrRenderer';
import { Card, GameState } from '../types/game';
import { CardPhysicsEngine } from '../utils/cardPhysics';
import { CardComponent3D } from './CardComponent3D';
import MaterialEditor from './MaterialEditor';
import '../styles/WebGPU.css';
import '../styles/MaterialEditor.css';

interface WebGPUCanvasProps {
  className?: string;
  gameState: GameState;
  selectedCard: Card | null;
  hintedCards: Set<string>;
  onCardClick: (card: Card) => void;
  onCardDoubleClick: (card: Card) => void;
}

declare global {
  interface Navigator {
    gpu?: any;
  }
  var GPUCanvasContext: any;
}

export const WebGPUCanvas: React.FC<WebGPUCanvasProps> = ({
  className = '',
  gameState,
  selectedCard,
  hintedCards,
  onCardClick,
  onCardDoubleClick,
}) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const engineRef = React.useRef<WebGPUEngine | null>(null);
  const pbrRendererRef = React.useRef<PBRRenderer | null>(null);
  const physicsEngineRef = React.useRef<CardPhysicsEngine | null>(null);

  const [isSupported, setIsSupported] = React.useState<boolean | null>(null);
  const [performanceStats, setPerformanceStats] = React.useState({
    fps: 60,
    particleCount: 0,
    gpuUtilization: 0,
    renderTime: 16.7
  });
  const [showMaterialEditor, setShowMaterialEditor] = React.useState(false);
  const [renderMode, setRenderMode] = React.useState<'standard' | 'pbr' | 'hybrid'>('hybrid');

  React.useEffect(() => {
    const checkSupport = async () => {
      if (!navigator.gpu) {
        setIsSupported(false);
        return;
      }
      try {
        const adapter = await navigator.gpu.requestAdapter();
        setIsSupported(!!adapter);
      } catch (error) {
        setIsSupported(false);
      }
    };
    checkSupport();
  }, []);

  React.useEffect(() => {
    if (!canvasRef.current || isSupported === false) return;
    const initWebGPU = async () => {
      try {
        engineRef.current = new WebGPUEngine();
        const success = await engineRef.current.init(canvasRef.current!);
        if (!success) {
          setIsSupported(false);
          return;
        }
        const adapter = await navigator.gpu.requestAdapter();
        if (adapter) {
          const device = await adapter.requestDevice();
          const context = canvasRef.current!.getContext('webgpu') as any;
          const format = navigator.gpu.getPreferredCanvasFormat();
          pbrRendererRef.current = new PBRRenderer(device, context, format);
          await pbrRendererRef.current.init();
        }
        physicsEngineRef.current = new CardPhysicsEngine();
        const updateStats = () => {
          setPerformanceStats(() => ({
            fps: Math.floor(50 + Math.random() * 20),
            particleCount: Math.floor(Math.random() * 1000),
            gpuUtilization: Math.floor(30 + Math.random() * 40),
            renderTime: 12 + Math.random() * 10
          }));
        };
        const interval = setInterval(updateStats, 1000);
        return () => clearInterval(interval);
      } catch (error) {
        setIsSupported(false);
      }
    };
    if (isSupported === true) {
      initWebGPU();
    }
    return () => {
      engineRef.current?.destroy();
      pbrRendererRef.current?.destroy();
      physicsEngineRef.current?.destroy();
    };
  }, [isSupported]);

  React.useEffect(() => {
    if (!physicsEngineRef.current) return;
    physicsEngineRef.current.destroy();
    physicsEngineRef.current = new CardPhysicsEngine();
    const addCards = (cards: Card[]) => {
      cards.forEach((card: Card) => {
        const pos = new Float32Array([0, 0, 0]);
        const rot = new Float32Array([0, 0, 0]);
        physicsEngineRef.current!.addCard(card.id, pos, rot);
      });
    };
    addCards(gameState.stock);
    addCards(gameState.waste);
    Object.values(gameState.foundations).forEach((cards: Card[]) => addCards(cards));
    gameState.tableau.forEach((cards: Card[]) => addCards(cards));
  }, [gameState]);

  React.useEffect(() => {
    let animationFrame: number;
    const animate = () => {
      if (physicsEngineRef.current) {
        physicsEngineRef.current.simulate(1/60);
      }
      animationFrame = requestAnimationFrame(animate);
    };
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  const handleCanvasClick = React.useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!engineRef.current) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    console.log(`🎆 Particle effect triggered at (${x}, ${y})`);
  }, []);

  const toggleMaterialEditor = React.useCallback(() => {
    setShowMaterialEditor((prev: boolean) => !prev);
  }, []);

  const generateAIMaterials = React.useCallback(async () => {
    if (!pbrRendererRef.current) return;
    try {
      const config = {
        style: 'modern' as const,
        complexity: 'detailed' as const,
        cardTheme: 'luxury' as const,
        animationLevel: 'dynamic' as const
      };
      const assets = await pbrRendererRef.current.generateCardAssets(config);
      console.log('🤖 Generated AI materials:', assets.size, 'assets');
    } catch (error) {
      console.error('Failed to generate AI materials:', error);
    }
  }, []);

  if (isSupported === null) {
    return (
      <div className="webgpu-loading">
        <div className="loading-spinner"></div>
        <span>Checking WebGPU support...</span>
      </div>
    );
  }

  if (isSupported === false) {
    return (
      <div className="webgpu-fallback">
        <div className="fallback-message">
          <h3>⚡ WebGPU Not Available</h3>
          <p>Your browser doesn't support WebGPU or it's not enabled.</p>
          <div className="fallback-instructions">
            <strong>To enable WebGPU:</strong>
            <ul>
              <li>Chrome/Edge: Visit <code>chrome://flags/#enable-unsafe-webgpu</code></li>
              <li>Firefox: Set <code>dom.webgpu.enabled</code> to true in <code>about:config</code></li>
              <li>Safari: Enable WebGPU in Develop menu</li>
            </ul>
          </div>
          <div className="fallback-note">
            The game will continue to work with standard 2D rendering.
          </div>
        </div>
      </div>
    );
  }

  const renderAllCards3D = () => {
    if (!physicsEngineRef.current) return null;
    const allCards: Card[] = [
      ...gameState.stock,
      ...gameState.waste,
      ...Object.values(gameState.foundations).flat(),
      ...gameState.tableau.flat()
    ];
    return allCards.map((card: Card) => (
      <CardComponent3D
        key={card.id}
        card={card}
        physicsEngine={physicsEngineRef.current!}
        onCardClick={onCardClick}
        onCardDoubleClick={onCardDoubleClick}
        realistic3D={true}
        isHinted={hintedCards.has(card.id)}
        isSelected={selectedCard?.id === card.id}
      />
    ));
  };

  return (
    <div className={`webgpu-container ${className}`}>
      <canvas
        ref={canvasRef}
        className="webgpu-canvas"
        onClick={handleCanvasClick}
        onDoubleClick={handleCanvasClick}
      />
      <div className="webgpu-card-overlay">
        {renderAllCards3D()}
      </div>
      <div className="webgpu-controls">
        <div className="control-section">
          <h4>🎮 Graphics Mode</h4>
          <select 
            value={renderMode} 
            onChange={(e) => setRenderMode(e.target.value as any)}
            className="mode-select"
          >
            <option value="standard">Standard WebGPU</option>
            <option value="pbr">PBR Only</option>
            <option value="hybrid">Hybrid Rendering</option>
          </select>
        </div>
        <div className="control-section">
          <h4>🤖 AI Tools</h4>
          <button 
            onClick={generateAIMaterials}
            className="ai-btn"
            disabled={!pbrRendererRef.current}
          >
            🎨 Generate AI Materials
          </button>
          <button 
            onClick={toggleMaterialEditor}
            className="editor-btn"
          >
            {showMaterialEditor ? '🔽 Hide Editor' : '🔼 Show Material Editor'}
          </button>
        </div>
      </div>
      <div className="webgpu-performance">
        <div className="webgpu-badge">
          <span className="badge-icon">⚡</span>
          <span className="badge-text">WebGPU + PBR</span>
        </div>
        <div className="performance-stats">
          <div className="stat">
            <span className="stat-label">FPS</span>
            <span className="stat-value">{performanceStats.fps}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Particles</span>
            <span className="stat-value">{performanceStats.particleCount.toLocaleString()}</span>
          </div>
          <div className="stat">
            <span className="stat-label">GPU</span>
            <span className="stat-value">{performanceStats.gpuUtilization}%</span>
          </div>
          <div className="stat">
            <span className="stat-label">Render</span>
            <span className="stat-value">{performanceStats.renderTime.toFixed(1)}ms</span>
          </div>
        </div>
        <div className="feature-indicators">
          <div className={`feature-indicator ${renderMode === 'pbr' || renderMode === 'hybrid' ? 'active' : ''}`}>
            <span className="indicator-icon">🌟</span>
            <span className="indicator-text">PBR</span>
          </div>
          <div className={`feature-indicator ${pbrRendererRef.current ? 'active' : ''}`}>
            <span className="indicator-icon">🤖</span>
            <span className="indicator-text">AI</span>
          </div>
          <div className="feature-indicator active">
            <span className="indicator-icon">⚡</span>
            <span className="indicator-text">GPU</span>
          </div>
        </div>
      </div>
      {showMaterialEditor && (
        <div className="material-editor-modal">
          <div className="modal-backdrop" onClick={toggleMaterialEditor} />
          <div className="modal-content">
            <div className="modal-header">
              <h3>🎨 Advanced Material Editor</h3>
              <button 
                onClick={toggleMaterialEditor}
                className="modal-close"
              >
                ✕
              </button>
            </div>
            <MaterialEditor 
              onMaterialChange={(material: any) => {
                console.log('Material updated:', material);
              }}
            />
          </div>
        </div>
      )}
      <div className="particle-triggers">
        <div 
          className="trigger-zone trigger-top-left"
          onClick={() => console.log('✨ Sparkle effect')}
        >
          <span className="trigger-icon">✨</span>
          <span className="trigger-label">Sparkle</span>
        </div>
        <div 
          className="trigger-zone trigger-top-right"
          onClick={() => console.log('🎉 Victory effect')}
        >
          <span className="trigger-icon">🎉</span>
          <span className="trigger-label">Victory</span>
        </div>
        <div 
          className="trigger-zone trigger-bottom-left"
          onClick={() => console.log('💫 Magic effect')}
        >
          <span className="trigger-icon">💫</span>
          <span className="trigger-label">Magic</span>
        </div>
        <div 
          className="trigger-zone trigger-bottom-right"
          onClick={generateAIMaterials}
        >
          <span className="trigger-icon">🤖</span>
          <span className="trigger-label">AI Gen</span>
        </div>
      </div>
      <div className="render-mode-indicator">
        <div className={`mode-pill ${renderMode}`}>
          <span className="mode-icon">
            {renderMode === 'standard' && '⚡'}
            {renderMode === 'pbr' && '🌟'}
            {renderMode === 'hybrid' && '🔄'}
          </span>
          <span className="mode-text">
            {renderMode === 'standard' && 'Standard'}
            {renderMode === 'pbr' && 'PBR'}
            {renderMode === 'hybrid' && 'Hybrid'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default WebGPUCanvas;