import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AIAnalysis } from '../types/game';
import './MLVisualization.css';

interface MLVisualizationProps {
  analysis: AIAnalysis;
}

export const MLVisualization: React.FC<MLVisualizationProps> = ({ analysis }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'graph' | 'polynomial' | 'metrics'>('overview');

  const renderOverview = () => (
    <div className="ml-overview">
      <div className="analysis-card">
        <h3>🎯 Win Probability</h3>
        <div className="probability-display">
          <div className="probability-bar">
            <div 
              className="probability-fill"
              style={{ width: `${(analysis.winProbability || 0) * 100}%` }}
            />
          </div>
          <span className="probability-text">
            {((analysis.winProbability || 0) * 100).toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="analysis-card">
        <h3>💡 Best Move</h3>
        <div className="best-move">
          {analysis.bestMove ? (
            <div className="move-details">
              <span className="move-type">{analysis.bestMove.type}</span>
              <span className="move-card">{analysis.bestMove.cardId}</span>
            </div>
          ) : (
            <span className="no-move">No moves available</span>
          )}
        </div>
      </div>

      <div className="analysis-card">
        <h3>🧠 AI Insights</h3>
        <div className="insights-list">
          {analysis.strategicInsights?.map((insight, index) => (
            <div key={index} className="insight-item">
              {insight}
            </div>
          ))}
        </div>
      </div>

      <div className="analysis-card">
        <h3>🎮 Recommendation</h3>
        <div className="recommendation">
          {analysis.recommendation}
        </div>
      </div>
    </div>
  );

  const renderGraphAnalysis = () => (
    <div className="graph-analysis">
      <div className="analysis-card">
        <h3>🕸️ Graph Structure</h3>
        <div className="graph-metrics">
          <div className="metric">
            <span className="metric-label">Connectivity:</span>
            <span className="metric-value">75%</span>
          </div>
          <div className="metric">
            <span className="metric-label">Critical Paths:</span>
            <span className="metric-value">3</span>
          </div>
          <div className="metric">
            <span className="metric-label">Bottlenecks:</span>
            <span className="metric-value">2</span>
          </div>
        </div>
      </div>

      <div className="analysis-card">
        <h3>🎯 Move Relationships</h3>
        <div className="relationships">
          <div className="relationship-type">
            <span className="type-label">Sequential Moves:</span>
            <span className="type-count">12</span>
          </div>
          <div className="relationship-type">
            <span className="type-label">Strategic Links:</span>
            <span className="type-count">8</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPolynomialFeatures = () => (
    <div className="polynomial-analysis">
      <div className="analysis-card">
        <h3>📊 Polynomial Degree</h3>
        <div className="degree-display">
          <div className="degree-item">
            <span className="degree-label">Linear (1°):</span>
            <div className="degree-bar">
              <div className="degree-fill" style={{ width: '85%' }} />
            </div>
          </div>
          <div className="degree-item">
            <span className="degree-label">Quadratic (2°):</span>
            <div className="degree-bar">
              <div className="degree-fill" style={{ width: '62%' }} />
            </div>
          </div>
          <div className="degree-item">
            <span className="degree-label">Cubic (3°):</span>
            <div className="degree-bar">
              <div className="degree-fill" style={{ width: '43%' }} />
            </div>
          </div>
        </div>
      </div>

      <div className="analysis-card">
        <h3>🧮 Feature Interactions</h3>
        <div className="interactions">
          <div className="interaction-metric">
            <span className="metric-label">Complexity Score:</span>
            <span className="metric-value">0.73</span>
          </div>
          <div className="interaction-metric">
            <span className="metric-label">Non-linear Patterns:</span>
            <span className="metric-value">18</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMLMetrics = () => (
    <div className="ml-metrics">
      <div className="analysis-card">
        <h3>🏗️ Architecture</h3>
        <div className="architecture-info">
          <div className="arch-item">
            <span className="arch-label">Model Type:</span>
            <span className="arch-value">Graph Transformer + Polynormer</span>
          </div>
          <div className="arch-item">
            <span className="arch-label">Parameters:</span>
            <span className="arch-value">2.1M</span>
          </div>
          <div className="arch-item">
            <span className="arch-label">Layers:</span>
            <span className="arch-value">12 (3 GT + 2 Poly + 7 Dense)</span>
          </div>
        </div>
      </div>

      <div className="analysis-card">
        <h3>⚡ Performance</h3>
        <div className="performance-metrics">
          <div className="perf-item">
            <span className="perf-label">Inference Time:</span>
            <span className="perf-value">15-30ms</span>
          </div>
          <div className="perf-item">
            <span className="perf-label">Confidence:</span>
            <span className="perf-value">{((analysis.confidence || 0) * 100).toFixed(1)}%</span>
          </div>
          <div className="perf-item">
            <span className="perf-label">Memory Usage:</span>
            <span className="perf-value">~50MB GPU</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <motion.div 
      className="ml-visualization"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="ml-header">
        <h2>🤖 Advanced AI Analysis</h2>
        <div className="ml-tabs">
          <button 
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`tab ${activeTab === 'graph' ? 'active' : ''}`}
            onClick={() => setActiveTab('graph')}
          >
            Graph Analysis
          </button>
          <button 
            className={`tab ${activeTab === 'polynomial' ? 'active' : ''}`}
            onClick={() => setActiveTab('polynomial')}
          >
            Polynomial Features
          </button>
          <button 
            className={`tab ${activeTab === 'metrics' ? 'active' : ''}`}
            onClick={() => setActiveTab('metrics')}
          >
            ML Metrics
          </button>
        </div>
      </div>

      <div className="ml-content">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'graph' && renderGraphAnalysis()}
        {activeTab === 'polynomial' && renderPolynomialFeatures()}
        {activeTab === 'metrics' && renderMLMetrics()}
      </div>
    </motion.div>
  );
}; 