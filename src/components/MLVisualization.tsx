import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GameState } from '../types/game';
import './MLVisualization.css';

interface MLVisualizationProps {
  gameState: GameState;
  analysis: {
    graphMetrics: {
      winProbability: number;
      moveQuality: number;
      gameProgress: number;
    };
    polynomialFeatures: number[];
    modelMetrics: {
      accuracy: number;
      precision: number;
      recall: number;
    };
    performanceMetrics: {
      inferenceTime: number;
      memoryUsage: number;
      gpuUtilization: number;
    };
  };
}

const MLVisualization: React.FC<MLVisualizationProps> = ({ analysis }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'graph' | 'polynomial' | 'metrics'>('overview');

  return (
    <motion.div
      className="ml-visualization"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="tabs">
        <button
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={activeTab === 'graph' ? 'active' : ''}
          onClick={() => setActiveTab('graph')}
        >
          Graph
        </button>
        <button
          className={activeTab === 'polynomial' ? 'active' : ''}
          onClick={() => setActiveTab('polynomial')}
        >
          Polynomial
        </button>
        <button
          className={activeTab === 'metrics' ? 'active' : ''}
          onClick={() => setActiveTab('metrics')}
        >
          Metrics
        </button>
      </div>

      <div className="content">
        {activeTab === 'overview' && (
          <div className="overview">
            <h3>Game Analysis</h3>
            <div className="metrics-grid">
              <div className="metric">
                <span>Win Probability</span>
                <span>{(analysis.graphMetrics.winProbability * 100).toFixed(1)}%</span>
              </div>
              <div className="metric">
                <span>Move Quality</span>
                <span>{(analysis.graphMetrics.moveQuality * 100).toFixed(1)}%</span>
              </div>
              <div className="metric">
                <span>Game Progress</span>
                <span>{(analysis.graphMetrics.gameProgress * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'graph' && (
          <div className="graph">
            <h3>Performance Graph</h3>
            {/* Add graph visualization here */}
          </div>
        )}

        {activeTab === 'polynomial' && (
          <div className="polynomial">
            <h3>Polynomial Features</h3>
            <div className="features-grid">
              {analysis.polynomialFeatures.map((feature, index) => (
                <div key={index} className="feature">
                  <span>Feature {index + 1}</span>
                  <span>{feature.toFixed(3)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'metrics' && (
          <div className="metrics">
            <h3>Model Metrics</h3>
            <div className="metrics-grid">
              <div className="metric">
                <span>Accuracy</span>
                <span>{(analysis.modelMetrics.accuracy * 100).toFixed(1)}%</span>
              </div>
              <div className="metric">
                <span>Precision</span>
                <span>{(analysis.modelMetrics.precision * 100).toFixed(1)}%</span>
              </div>
              <div className="metric">
                <span>Recall</span>
                <span>{(analysis.modelMetrics.recall * 100).toFixed(1)}%</span>
              </div>
            </div>
            <h3>Performance Metrics</h3>
            <div className="metrics-grid">
              <div className="metric">
                <span>Inference Time</span>
                <span>{analysis.performanceMetrics.inferenceTime.toFixed(2)}ms</span>
              </div>
              <div className="metric">
                <span>Memory Usage</span>
                <span>{analysis.performanceMetrics.memoryUsage.toFixed(2)}MB</span>
              </div>
              <div className="metric">
                <span>GPU Utilization</span>
                <span>{(analysis.performanceMetrics.gpuUtilization * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MLVisualization; 