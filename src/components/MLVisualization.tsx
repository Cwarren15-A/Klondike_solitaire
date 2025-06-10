import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AIAnalysis } from '../types/game';
import { useGameStore } from '../stores/gameStore';
import './MLVisualization.css';

export const MLVisualization: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'graph' | 'polynomial' | 'metrics'>('overview');
  const { mlAnalysis, getMLAnalysis } = useGameStore();

  useEffect(() => {
    const updateAnalysis = async () => {
      await getMLAnalysis();
    };
    updateAnalysis();
  }, [getMLAnalysis]);

  if (!mlAnalysis) {
    return (
      <div className="ml-visualization loading">
        <div className="loading-spinner">Loading AI Analysis...</div>
      </div>
    );
  }

  const renderOverview = () => (
    <div className="ml-overview">
      <div className="analysis-card">
        <h3>🎯 Win Probability</h3>
        <div className="probability-display">
          <div className="probability-bar">
            <div 
              className="probability-fill"
              style={{ width: `${(mlAnalysis.winProbability || 0) * 100}%` }}
            />
          </div>
          <span className="probability-text">
            {((mlAnalysis.winProbability || 0) * 100).toFixed(1)}%
          </span>
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
            <span className="metric-value">{mlAnalysis.graphMetrics?.connectivity || 0}%</span>
          </div>
          <div className="metric">
            <span className="metric-label">Critical Paths:</span>
            <span className="metric-value">{mlAnalysis.graphMetrics?.criticalPaths || 0}</span>
          </div>
          <div className="metric">
            <span className="metric-label">Bottlenecks:</span>
            <span className="metric-value">{mlAnalysis.graphMetrics?.bottlenecks || 0}</span>
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
          {mlAnalysis.polynomialFeatures?.degrees.map((degree, index) => (
            <div key={index} className="degree-item">
              <span className="degree-label">{degree.name}:</span>
              <div className="degree-bar">
                <div 
                  className="degree-fill" 
                  style={{ width: `${degree.value * 100}%` }} 
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="analysis-card">
        <h3>🧮 Feature Interactions</h3>
        <div className="interactions">
          <div className="interaction-metric">
            <span className="metric-label">Complexity Score:</span>
            <span className="metric-value">{mlAnalysis.polynomialFeatures?.complexityScore.toFixed(2)}</span>
          </div>
          <div className="interaction-metric">
            <span className="metric-label">Non-linear Patterns:</span>
            <span className="metric-value">{mlAnalysis.polynomialFeatures?.nonLinearPatterns}</span>
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
            <span className="arch-value">{mlAnalysis.modelMetrics?.type}</span>
          </div>
          <div className="arch-item">
            <span className="arch-label">Parameters:</span>
            <span className="arch-value">{mlAnalysis.modelMetrics?.parameters}</span>
          </div>
          <div className="arch-item">
            <span className="arch-label">Layers:</span>
            <span className="arch-value">{mlAnalysis.modelMetrics?.layers}</span>
          </div>
        </div>
      </div>

      <div className="analysis-card">
        <h3>⚡ Performance</h3>
        <div className="performance-metrics">
          <div className="perf-item">
            <span className="perf-label">Inference Time:</span>
            <span className="perf-value">{mlAnalysis.performanceMetrics?.inferenceTime}</span>
          </div>
          <div className="perf-item">
            <span className="perf-label">Confidence:</span>
            <span className="perf-value">{((mlAnalysis.confidence || 0) * 100).toFixed(1)}%</span>
          </div>
          <div className="perf-item">
            <span className="perf-label">Memory Usage:</span>
            <span className="perf-value">{mlAnalysis.performanceMetrics?.memoryUsage}</span>
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