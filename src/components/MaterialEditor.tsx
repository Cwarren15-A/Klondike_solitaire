import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PBRRenderer, AIAssetConfig } from '../utils/pbrRenderer';

interface MaterialProperties {
  albedo: [number, number, number, number];
  metallic: number;
  roughness: number;
  emission: [number, number, number];
  ao: number;
  ior: number;
}

interface MaterialEditorProps {
  onMaterialChange?: (material: MaterialProperties) => void;
  initialMaterial?: MaterialProperties;
}

export const MaterialEditor: React.FC<MaterialEditorProps> = ({
  onMaterialChange,
  initialMaterial = {
    albedo: [0.8, 0.8, 0.8, 1.0],
    metallic: 0.0,
    roughness: 0.5,
    emission: [0, 0, 0],
    ao: 1.0,
    ior: 1.5
  }
}) => {
  const [material, setMaterial] = useState<MaterialProperties>(initialMaterial);
  const [aiConfig, setAiConfig] = useState<AIAssetConfig>({
    style: 'modern',
    complexity: 'detailed',
    cardTheme: 'luxury',
    animationLevel: 'dynamic'
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewMode, setPreviewMode] = useState<'sphere' | 'card' | 'cube'>('sphere');
  const [lightingMode, setLightingMode] = useState<'studio' | 'outdoor' | 'dramatic'>('studio');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pbrRendererRef = useRef<PBRRenderer | null>(null);

  // Update material and notify parent
  const updateMaterial = useCallback((newMaterial: Partial<MaterialProperties>) => {
    const updatedMaterial = { ...material, ...newMaterial };
    setMaterial(updatedMaterial);
    onMaterialChange?.(updatedMaterial);
  }, [material, onMaterialChange]);

  // AI-powered material generation
  const generateAIMaterial = useCallback(async () => {
    setIsGenerating(true);
    
    try {
      // Simulate AI material generation based on style
      let generatedMaterial: Partial<MaterialProperties> = {};
      
      switch (aiConfig.style) {
        case 'classic':
          generatedMaterial = {
            albedo: [0.9, 0.85, 0.8, 1.0],
            metallic: 0.1,
            roughness: 0.6,
            emission: [0, 0, 0]
          };
          break;
        case 'modern':
          generatedMaterial = {
            albedo: [0.2, 0.2, 0.2, 1.0],
            metallic: 0.8,
            roughness: 0.2,
            emission: [0.1, 0.1, 0.2]
          };
          break;
        case 'fantasy':
          generatedMaterial = {
            albedo: [0.6, 0.3, 0.8, 1.0],
            metallic: 0.4,
            roughness: 0.3,
            emission: [0.2, 0.0, 0.3]
          };
          break;
        case 'cyberpunk':
          generatedMaterial = {
            albedo: [0.1, 0.8, 0.9, 1.0],
            metallic: 0.9,
            roughness: 0.1,
            emission: [0, 0.5, 0.8]
          };
          break;
        case 'art_deco':
          generatedMaterial = {
            albedo: [0.9, 0.7, 0.2, 1.0],
            metallic: 0.7,
            roughness: 0.4,
            emission: [0.1, 0.1, 0]
          };
          break;
      }
      
      // Add some randomization for uniqueness
      if (generatedMaterial.albedo) {
        generatedMaterial.albedo = generatedMaterial.albedo.map(
          (val, i) => i < 3 ? Math.max(0, Math.min(1, val + (Math.random() - 0.5) * 0.2)) : val
        ) as [number, number, number, number];
      }
      
      updateMaterial(generatedMaterial);
      
      // Generate textures if PBR renderer is available
      if (pbrRendererRef.current) {
        await pbrRendererRef.current.generateCardAssets(aiConfig);
      }
      
    } catch (error) {
      console.error('AI material generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [aiConfig, updateMaterial]);

  // Initialize PBR renderer for preview
  useEffect(() => {
    const initRenderer = async () => {
      if (!canvasRef.current || !navigator.gpu) return;
      
      try {
        const adapter = await navigator.gpu.requestAdapter();
        if (!adapter) return;
        
        const device = await adapter.requestDevice();
        const context = canvasRef.current.getContext('webgpu') as GPUCanvasContext;
        const format = navigator.gpu.getPreferredCanvasFormat();
        
        context.configure({ device, format });
        
        pbrRendererRef.current = new PBRRenderer(device, context, format);
        await pbrRendererRef.current.init();
        
        console.log('🎨 Material Editor PBR renderer initialized');
      } catch (error) {
        console.warn('Failed to initialize PBR renderer for material editor:', error);
      }
    };
    
    initRenderer();
    
    return () => {
      pbrRendererRef.current?.destroy();
    };
  }, []);

  // Real-time preview updates
  useEffect(() => {
    // Update the preview when material changes
    // This would trigger a re-render of the preview sphere/card
    console.log('Material updated:', material);
  }, [material]);

  return (
    <div className="material-editor">
      <div className="material-editor-header">
        <h3>🎨 AI-Powered Material Editor</h3>
        <div className="preview-controls">
          <select 
            value={previewMode} 
            onChange={(e) => setPreviewMode(e.target.value as any)}
            className="preview-mode-select"
          >
            <option value="sphere">Sphere Preview</option>
            <option value="card">Card Preview</option>
            <option value="cube">Cube Preview</option>
          </select>
          
          <select 
            value={lightingMode} 
            onChange={(e) => setLightingMode(e.target.value as any)}
            className="lighting-select"
          >
            <option value="studio">Studio Lighting</option>
            <option value="outdoor">Outdoor Lighting</option>
            <option value="dramatic">Dramatic Lighting</option>
          </select>
        </div>
      </div>

      <div className="material-editor-content">
        {/* Real-time PBR Preview */}
        <div className="material-preview">
          <canvas 
            ref={canvasRef}
            width={300}
            height={300}
            className="material-preview-canvas"
          />
          <div className="preview-info">
            <span className="preview-label">Real-time PBR Preview</span>
            <span className="preview-mode">{previewMode} • {lightingMode}</span>
          </div>
        </div>

        {/* AI Configuration Panel */}
        <div className="ai-config-panel">
          <h4>🤖 AI Generation Settings</h4>
          
          <div className="config-row">
            <label>Style:</label>
            <select 
              value={aiConfig.style} 
              onChange={(e) => setAiConfig({...aiConfig, style: e.target.value as any})}
            >
              <option value="classic">Classic</option>
              <option value="modern">Modern</option>
              <option value="fantasy">Fantasy</option>
              <option value="cyberpunk">Cyberpunk</option>
              <option value="art_deco">Art Deco</option>
            </select>
          </div>
          
          <div className="config-row">
            <label>Complexity:</label>
            <select 
              value={aiConfig.complexity} 
              onChange={(e) => setAiConfig({...aiConfig, complexity: e.target.value as any})}
            >
              <option value="simple">Simple</option>
              <option value="detailed">Detailed</option>
              <option value="ultra">Ultra Detailed</option>
            </select>
          </div>
          
          <div className="config-row">
            <label>Card Theme:</label>
            <select 
              value={aiConfig.cardTheme} 
              onChange={(e) => setAiConfig({...aiConfig, cardTheme: e.target.value as any})}
            >
              <option value="traditional">Traditional</option>
              <option value="luxury">Luxury</option>
              <option value="minimal">Minimal</option>
              <option value="ornate">Ornate</option>
            </select>
          </div>
          
          <button 
            onClick={generateAIMaterial}
            disabled={isGenerating}
            className="ai-generate-btn"
          >
            {isGenerating ? '🔄 Generating...' : '🎲 Generate AI Material'}
          </button>
        </div>

        {/* Manual Material Controls */}
        <div className="material-controls">
          <h4>🔧 Manual Controls</h4>
          
          {/* Albedo Color */}
          <div className="control-group">
            <label>Albedo (Base Color)</label>
            <div className="color-control">
              <input
                type="color"
                value={`#${Math.round(material.albedo[0] * 255).toString(16).padStart(2, '0')}${Math.round(material.albedo[1] * 255).toString(16).padStart(2, '0')}${Math.round(material.albedo[2] * 255).toString(16).padStart(2, '0')}`}
                onChange={(e) => {
                  const hex = e.target.value.slice(1);
                  const r = parseInt(hex.slice(0, 2), 16) / 255;
                  const g = parseInt(hex.slice(2, 4), 16) / 255;
                  const b = parseInt(hex.slice(4, 6), 16) / 255;
                  updateMaterial({ albedo: [r, g, b, material.albedo[3]] });
                }}
                className="color-picker"
              />
              <span className="color-value">
                RGB({Math.round(material.albedo[0] * 255)}, {Math.round(material.albedo[1] * 255)}, {Math.round(material.albedo[2] * 255)})
              </span>
            </div>
          </div>

          {/* Metallic */}
          <div className="control-group">
            <label>Metallic</label>
            <div className="slider-control">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={material.metallic}
                onChange={(e) => updateMaterial({ metallic: parseFloat(e.target.value) })}
                className="material-slider"
              />
              <span className="slider-value">{material.metallic.toFixed(2)}</span>
            </div>
          </div>

          {/* Roughness */}
          <div className="control-group">
            <label>Roughness</label>
            <div className="slider-control">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={material.roughness}
                onChange={(e) => updateMaterial({ roughness: parseFloat(e.target.value) })}
                className="material-slider"
              />
              <span className="slider-value">{material.roughness.toFixed(2)}</span>
            </div>
          </div>

          {/* Emission */}
          <div className="control-group">
            <label>Emission</label>
            <div className="emission-controls">
              {['R', 'G', 'B'].map((channel, index) => (
                <div key={channel} className="emission-channel">
                  <span>{channel}</span>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.01"
                    value={material.emission[index]}
                    onChange={(e) => {
                      const newEmission = [...material.emission] as [number, number, number];
                      newEmission[index] = parseFloat(e.target.value);
                      updateMaterial({ emission: newEmission });
                    }}
                    className="emission-slider"
                  />
                  <span className="emission-value">{material.emission[index].toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Ambient Occlusion */}
          <div className="control-group">
            <label>Ambient Occlusion</label>
            <div className="slider-control">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={material.ao}
                onChange={(e) => updateMaterial({ ao: parseFloat(e.target.value) })}
                className="material-slider"
              />
              <span className="slider-value">{material.ao.toFixed(2)}</span>
            </div>
          </div>

          {/* Index of Refraction */}
          <div className="control-group">
            <label>IOR (Index of Refraction)</label>
            <div className="slider-control">
              <input
                type="range"
                min="1.0"
                max="3.0"
                step="0.01"
                value={material.ior}
                onChange={(e) => updateMaterial({ ior: parseFloat(e.target.value) })}
                className="material-slider"
              />
              <span className="slider-value">{material.ior.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Material Presets */}
        <div className="material-presets">
          <h4>📋 Material Presets</h4>
          <div className="preset-buttons">
            <button onClick={() => updateMaterial({
              albedo: [0.9, 0.9, 0.9, 1.0], metallic: 0.9, roughness: 0.1, emission: [0, 0, 0], ao: 1.0, ior: 1.5
            })}>Chrome</button>
            
            <button onClick={() => updateMaterial({
              albedo: [1.0, 0.7, 0.3, 1.0], metallic: 1.0, roughness: 0.2, emission: [0, 0, 0], ao: 1.0, ior: 0.5
            })}>Gold</button>
            
            <button onClick={() => updateMaterial({
              albedo: [0.8, 0.8, 0.9, 1.0], metallic: 0.0, roughness: 0.7, emission: [0, 0, 0], ao: 1.0, ior: 1.5
            })}>Paper</button>
            
            <button onClick={() => updateMaterial({
              albedo: [0.1, 0.1, 0.3, 1.0], metallic: 0.0, roughness: 0.9, emission: [0, 0, 0], ao: 0.8, ior: 1.5
            })}>Fabric</button>
            
            <button onClick={() => updateMaterial({
              albedo: [0.2, 0.8, 0.2, 1.0], metallic: 0.0, roughness: 0.0, emission: [0.1, 0.5, 0.1], ao: 1.0, ior: 1.5
            })}>Neon</button>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="material-export">
        <h4>💾 Export Material</h4>
        <div className="export-buttons">
          <button onClick={() => {
            const json = JSON.stringify(material, null, 2);
            navigator.clipboard.writeText(json);
            alert('Material copied to clipboard!');
          }}>
            📋 Copy JSON
          </button>
          
          <button onClick={() => {
            const blob = new Blob([JSON.stringify(material, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `material_${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);
          }}>
            💾 Download JSON
          </button>
        </div>
      </div>
    </div>
  );
};

export default MaterialEditor; 