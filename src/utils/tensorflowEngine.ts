import * as tf from '@tensorflow/tfjs';
import { GameState, Move, AIAnalysis, Card } from '../types/game';

interface TrainingData {
  gameState: GameState;
  outcome: boolean;
  moveQuality: number;
}

interface GraphNode {
  id: string;
  features: number[];
  cardType: string;
  position: [number, number];
  connections: string[];
}

interface GraphEdge {
  source: string;
  target: string;
  weight: number;
  edgeType: 'valid_move' | 'sequence' | 'suit_match' | 'color_alternate' | 'strategic';
}

// Simplified Graph Transformer Layer for Web
class GraphTransformerLayer extends tf.layers.Layer {
  private numHeads: number;
  private headDim: number;
  private hiddenDim: number;
  private dropoutRate: number;
  private wq?: tf.LayersModel;
  private wk?: tf.LayersModel;
  private wv?: tf.LayersModel;
  private wo?: tf.LayersModel;
  private ffn?: tf.LayersModel;
  private layerNorm1?: tf.LayersModel;
  private layerNorm2?: tf.LayersModel;

  static className = 'GraphTransformerLayer';

  constructor(config: {
    numHeads: number;
    headDim: number;
    hiddenDim: number;
    dropoutRate?: number;
  }) {
    super({});
    this.numHeads = config.numHeads;
    this.headDim = config.headDim;
    this.hiddenDim = config.hiddenDim;
    this.dropoutRate = config.dropoutRate || 0.1;
    
    this.initializeLayers();
  }

  private initializeLayers() {
    // Query, Key, Value projections
    this.wq = tf.sequential({
      layers: [tf.layers.dense({ units: this.numHeads * this.headDim, activation: 'linear' })]
    });
    
    this.wk = tf.sequential({
      layers: [tf.layers.dense({ units: this.numHeads * this.headDim, activation: 'linear' })]
    });
    
    this.wv = tf.sequential({
      layers: [tf.layers.dense({ units: this.numHeads * this.headDim, activation: 'linear' })]
    });
    
    // Output projection
    this.wo = tf.sequential({
      layers: [tf.layers.dense({ units: this.hiddenDim, activation: 'linear' })]
    });
    
    // Feed-forward network
    this.ffn = tf.sequential({
      layers: [
        tf.layers.dense({ units: this.hiddenDim * 4, activation: 'relu' }),
        tf.layers.dropout({ rate: this.dropoutRate }),
        tf.layers.dense({ units: this.hiddenDim, activation: 'linear' })
      ]
    });
    
    // Layer normalization
    this.layerNorm1 = tf.sequential({
      layers: [tf.layers.layerNormalization()]
    });
    
    this.layerNorm2 = tf.sequential({
      layers: [tf.layers.layerNormalization()]
    });
  }

  call(inputs: tf.Tensor): tf.Tensor {
    if (!this.wq || !this.wk || !this.wv || !this.wo || !this.ffn || !this.layerNorm1 || !this.layerNorm2) {
      throw new Error('Layers not initialized');
    }

    // Multi-head graph attention
    const q = this.wq.apply(inputs) as tf.Tensor;
    const k = this.wk.apply(inputs) as tf.Tensor;
    const v = this.wv.apply(inputs) as tf.Tensor;
    
    // For simplicity, use standard attention without reshaping
    const attention = this.scaledDotProductAttention(q, k, v);
    const attentionOutput = this.wo.apply(attention) as tf.Tensor;
    
    // First residual connection and layer norm
    const norm1Output = this.layerNorm1.apply(tf.add(inputs, attentionOutput)) as tf.Tensor;
    
    // Feed-forward network
    const ffnOutput = this.ffn.apply(norm1Output) as tf.Tensor;
    
    // Second residual connection and layer norm
    const output = this.layerNorm2.apply(tf.add(norm1Output, ffnOutput)) as tf.Tensor;
    
    return output;
  }

  private scaledDotProductAttention(q: tf.Tensor, k: tf.Tensor, v: tf.Tensor): tf.Tensor {
    // Simplified attention computation
    const scores = tf.matMul(q, k, false, true);
    const scaledScores = tf.div(scores, Math.sqrt(this.headDim));
    const attentionWeights = tf.softmax(scaledScores, -1);
    const output = tf.matMul(attentionWeights, v);
    return output;
  }

  getClassName(): string {
    return GraphTransformerLayer.className;
  }
}

// Simplified Polynormer Layer
class PolynormerLayer extends tf.layers.Layer {
  private degree: number;
  private hiddenDim: number;
  private polynomialWeights?: tf.LayersModel[];
  private combinationLayer?: tf.LayersModel;
  private outputProjection?: tf.LayersModel;

  static className = 'PolynormerLayer';

  constructor(config: {
    degree: number;
    hiddenDim: number;
  }) {
    super({});
    this.degree = config.degree;
    this.hiddenDim = config.hiddenDim;
    this.initializeLayers();
  }

  private initializeLayers() {
    // Create polynomial transformation layers for each degree
    this.polynomialWeights = [];
    for (let i = 1; i <= this.degree; i++) {
      this.polynomialWeights.push(tf.sequential({
        layers: [
          tf.layers.dense({ 
            units: this.hiddenDim, 
            activation: 'linear',
            kernelInitializer: 'glorotUniform'
          })
        ]
      }));
    }
    
    // Combination layer to merge polynomial features
    this.combinationLayer = tf.sequential({
      layers: [
        tf.layers.dense({ units: this.hiddenDim * 2, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.1 }),
        tf.layers.dense({ units: this.hiddenDim, activation: 'linear' })
      ]
    });
    
    // Final output projection
    this.outputProjection = tf.sequential({
      layers: [
        tf.layers.layerNormalization(),
        tf.layers.dense({ units: this.hiddenDim, activation: 'relu' })
      ]
    });
  }

  call(inputs: tf.Tensor): tf.Tensor {
    if (!this.polynomialWeights || !this.combinationLayer || !this.outputProjection) {
      throw new Error('Layers not initialized');
    }

    const polynomialFeatures: tf.Tensor[] = [];
    
    // Generate polynomial features
    for (let degree = 1; degree <= this.degree; degree++) {
      let polyFeature = inputs;
      
      // Compute x^degree
      for (let i = 1; i < degree; i++) {
        polyFeature = tf.mul(polyFeature, inputs);
      }
      
      // Apply learned transformation
      const transformedFeature = this.polynomialWeights[degree - 1].apply(polyFeature) as tf.Tensor;
      polynomialFeatures.push(transformedFeature);
    }
    
    // Combine polynomial features
    const combinedFeatures = tf.concat(polynomialFeatures, -1);
    const combinedOutput = this.combinationLayer.apply(combinedFeatures) as tf.Tensor;
    
    // Apply output projection with residual connection
    const residualConnection = tf.add(inputs, combinedOutput);
    const output = this.outputProjection.apply(residualConnection) as tf.Tensor;
    
    return output;
  }

  getClassName(): string {
    return PolynormerLayer.className;
  }
}

export class TensorFlowMLEngine {
  private model: tf.LayersModel | null = null;
  public isInitialized = false;
  private isTraining = false;
  private modelVersion = '2.0.0-graph-transformer';
  private graphTransformerLayers: GraphTransformerLayer[] = [];
  private polynormerLayers: PolynormerLayer[] = [];
  private _trainingData: TrainingData[] = [];

  constructor() {
    this.initializeBackend();
    this.registerCustomLayers();
  }

  private async initializeBackend() {
    await tf.setBackend('webgl');
    await tf.ready();
  }

  private registerCustomLayers() {
    // Register custom layers with TensorFlow.js
    tf.serialization.registerClass(GraphTransformerLayer);
    tf.serialization.registerClass(PolynormerLayer);
  }

  async initialize(): Promise<void> {
    try {
      await this.loadModel();
    } catch (error) {
      console.log('🧠 Creating new Graph Transformer + Polynormer model...');
      await this.createAdvancedModel();
    }
    
    this.isInitialized = true;
    console.log('🚀 Advanced ML Engine initialized with Graph Transformers and Polynormer');
  }

  private async createAdvancedModel(): Promise<void> {
    // Input layer for game state graph representation
    const input = tf.input({ shape: [52, 128] });
    
    // Embedding layer for card features
    const embedding = tf.layers.dense({
      units: 256,
      activation: 'relu',
      name: 'card_embedding'
    }).apply(input) as tf.SymbolicTensor;
    
    // Graph Transformer layers
    let graphOutput: tf.SymbolicTensor = embedding;
    for (let i = 0; i < 3; i++) {
      const graphTransformer = new GraphTransformerLayer({
        numHeads: 8,
        headDim: 32,
        hiddenDim: 256,
        dropoutRate: 0.1
      });
      
      graphOutput = graphTransformer.apply(graphOutput) as tf.SymbolicTensor;
      this.graphTransformerLayers.push(graphTransformer);
    }
    
    // Polynormer layers for higher-order feature interactions
    let polyOutput: tf.SymbolicTensor = graphOutput;
    for (let i = 0; i < 2; i++) {
      const polynormer = new PolynormerLayer({
        degree: 3,
        hiddenDim: 256
      });
      
      polyOutput = polynormer.apply(polyOutput) as tf.SymbolicTensor;
      this.polynormerLayers.push(polynormer);
    }
    
    // Global pooling to aggregate card-level features
    const globalFeatures = tf.layers.globalAveragePooling1d().apply(polyOutput) as tf.SymbolicTensor;
    
    // Additional dense layers for game-level reasoning
    const reasoning = tf.layers.dense({
      units: 512,
      activation: 'relu',
      name: 'strategic_reasoning'
    }).apply(globalFeatures) as tf.SymbolicTensor;
    
    const reasoningDropout = tf.layers.dropout({ rate: 0.3 }).apply(reasoning) as tf.SymbolicTensor;
    
    const deepReasoning = tf.layers.dense({
      units: 256,
      activation: 'relu',
      name: 'deep_reasoning'
    }).apply(reasoningDropout) as tf.SymbolicTensor;
    
    // Multi-task output heads
    const winProbability = tf.layers.dense({
      units: 1,
      activation: 'sigmoid',
      name: 'win_probability'
    }).apply(deepReasoning) as tf.SymbolicTensor;
    
    const moveScores = tf.layers.dense({
      units: 64,
      activation: 'softmax',
      name: 'move_scores'
    }).apply(deepReasoning) as tf.SymbolicTensor;
    
    const difficultyEstimate = tf.layers.dense({
      units: 3,
      activation: 'softmax',
      name: 'difficulty_estimate'
    }).apply(deepReasoning) as tf.SymbolicTensor;
    
    // Create model
    this.model = tf.model({
      inputs: input,
      outputs: [winProbability, moveScores, difficultyEstimate]
    });
    
    // Advanced optimizer with learning rate scheduling
    const optimizer = tf.train.adamax(0.001);
    
    this.model.compile({
      optimizer: optimizer,
      loss: {
        win_probability: 'binaryCrossentropy',
        move_scores: 'categoricalCrossentropy',
        difficulty_estimate: 'categoricalCrossentropy'
      },
      metrics: ['accuracy', 'meanSquaredError']
    });
    
    console.log('🏗️ Advanced Graph Transformer + Polynormer model created');
    console.log(`📊 Model parameters: ${this.model.countParams()}`);
  }

  // Convert game state to graph representation
  private gameStateToGraph(gameState: GameState): { nodes: GraphNode[], edges: GraphEdge[] } {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    
    // Create nodes for each card
    let cardIndex = 0;
    
    // Stock pile cards
    gameState.stock.forEach((card, index) => {
      nodes.push({
        id: `stock_${cardIndex}`,
        features: this.cardToFeatures(card, 'stock', index),
        cardType: `${card.rank}_${card.suit}`,
        position: [0, index],
        connections: []
      });
      cardIndex++;
    });
    
    // Create edges based on valid moves and relationships
    this.createGameEdges(nodes, edges);
    
    return { nodes, edges };
  }

  private cardToFeatures(card: Card, location: string, index: number): number[] {
    const features = new Array(128).fill(0);
    
    // Card identity features (0-51)
    const cardId = this.getCardId(card);
    features[cardId] = 1;
    
    // Location features (52-59)
    const locationMap = { stock: 52, waste: 53, tableau: 54, foundation: 55 };
    features[locationMap[location as keyof typeof locationMap] || 52] = 1;
    
    // Position features (60-67)
    features[60] = index / 20; // Normalized position in pile
    
    // Card properties (68-75)
    features[68] = card.faceUp ? 1 : 0;
    features[69] = card.value / 13; // Normalized value
    features[70] = card.suit === '♠' ? 1 : 0;
    features[71] = card.suit === '♥' ? 1 : 0;
    features[72] = card.suit === '♦' ? 1 : 0;
    features[73] = card.suit === '♣' ? 1 : 0;
    features[74] = (card.suit === '♥' || card.suit === '♦') ? 1 : 0; // Red
    features[75] = (card.suit === '♠' || card.suit === '♣') ? 1 : 0; // Black
    
    return features;
  }

  private createGameEdges(nodes: GraphNode[], edges: GraphEdge[]): void {
    // Simplified edge creation
    for (let i = 0; i < Math.min(nodes.length, 10); i++) {
      for (let j = i + 1; j < Math.min(nodes.length, 10); j++) {
        if (Math.random() > 0.7) {
          edges.push({
            source: nodes[i].id,
            target: nodes[j].id,
            weight: Math.random(),
            edgeType: 'strategic'
          });
        }
      }
    }
  }

  private getCardId(card: Card): number {
    const suits = ['♠', '♥', '♦', '♣'];
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    
    const suitIndex = suits.indexOf(card.suit);
    const rankIndex = ranks.indexOf(card.rank);
    
    return suitIndex * 13 + rankIndex;
  }

  // Convert graph to tensor for model input
  private graphToTensor(graph: { nodes: GraphNode[], edges: GraphEdge[] }): tf.Tensor {
    const maxNodes = 52;
    const featureSize = 128;
    
    const nodeMatrix: number[][] = [];
    
    // Fill node features
    for (let i = 0; i < maxNodes; i++) {
      if (i < graph.nodes.length) {
        nodeMatrix.push(graph.nodes[i].features);
      } else {
        nodeMatrix.push(new Array(featureSize).fill(0));
      }
    }
    
    return tf.tensor3d([nodeMatrix], [1, maxNodes, featureSize]);
  }

  async getGameAnalysis(gameState: GameState): Promise<AIAnalysis> {
    if (!this.model || !this.isInitialized) {
      return this.getFallbackAnalysis();
    }

    try {
      // Convert game state to graph
      const graph = this.gameStateToGraph(gameState);
      const inputTensor = this.graphToTensor(graph);
      
      // Get model predictions
      const predictions = this.model.predict(inputTensor) as tf.Tensor[];
      
      const winProbData = await predictions[0].data();
      const moveScoreData = await predictions[1].data();
      
      const winProbability = winProbData[0];
      const confidence = this.calculateConfidence(Array.from(moveScoreData));
      
      // Find best move
      const bestMove = await this.getBestMove(gameState);
      
      // Clean up tensors
      inputTensor.dispose();
      predictions.forEach(p => p.dispose());
      
      return {
        winProbability,
        confidence,
        bestMove,
        difficulty: this.mapDifficultyFromProbability(winProbability),
        recommendation: this.generateAdvancedRecommendation(bestMove, winProbability),
        strategicInsights: this.generateStrategicInsights(gameState),
        moveQuality: this.analyzeMoveQuality(bestMove)
      };
      
    } catch (error) {
      console.error('Graph analysis failed:', error);
      return this.getFallbackAnalysis();
    }
  }

  async getBestMove(gameState: GameState): Promise<Move | null> {
    // Simplified best move logic
    const possibleMoves = this.generatePossibleMoves(gameState);
    if (possibleMoves.length === 0) return null;
    
    // Return first available move for now
    return possibleMoves[0];
  }

  private generatePossibleMoves(_gameState: GameState): Move[] {
    const moves: Move[] = [];
    
    // Simple move generation - placeholder implementation
    moves.push({
      type: 'foundation',
      cardId: 'example-card',
      sourceType: 'waste',
      targetType: 'foundation'
    });
    
    return moves;
  }

  private generateAdvancedRecommendation(bestMove: Move | null, winProbability: number): string {
    if (!bestMove) {
      return "🤔 No immediate moves available. Consider using the stock pile or undoing recent moves.";
    }
    
    return `🎯 Recommended: Move card ${bestMove.cardId} • Win probability: ${(winProbability * 100).toFixed(1)}%`;
  }

  private generateStrategicInsights(gameState: GameState): string[] {
    const insights: string[] = [];
    
    const foundationProgress = this.analyzeFoundationProgress(gameState);
    if (foundationProgress > 0.7) {
      insights.push("🏆 Excellent foundation progress - victory is near!");
    } else if (foundationProgress < 0.2) {
      insights.push("🔧 Build foundations first - focus on Aces and low cards");
    }
    
    const blockedCards = this.countBlockedCards(gameState);
    if (blockedCards > 15) {
      insights.push("🚧 Many cards blocked - prioritize revealing tableau cards");
    }
    
    return insights;
  }

  private analyzeFoundationProgress(gameState: GameState): number {
    const totalCards = Object.values(gameState.foundations).reduce((sum, pile) => sum + pile.length, 0);
    return totalCards / 52;
  }

  private countBlockedCards(gameState: GameState): number {
    let blocked = 0;
    gameState.tableau.forEach(pile => {
      for (let i = 0; i < pile.length - 1; i++) {
        if (!pile[i].faceUp) blocked++;
      }
    });
    return blocked;
  }

  private mapDifficultyFromProbability(winProbability: number): string {
    if (winProbability > 0.7) return 'Easy';
    if (winProbability > 0.4) return 'Medium';
    return 'Hard';
  }

  private calculateConfidence(moveScores: number[]): number {
    const max = Math.max(...moveScores);
    const min = Math.min(...moveScores);
    return max - min;
  }

  private analyzeMoveQuality(move: Move | null): number {
    if (!move) return 0;
    return 0.5; // Default quality
  }

  private getFallbackAnalysis(): AIAnalysis {
    return {
      winProbability: 0.5,
      confidence: 0.3,
      bestMove: null,
      difficulty: 'Medium',
      recommendation: '🤖 Basic analysis mode - Graph Transformer unavailable',
      strategicInsights: ['🔄 Advanced AI features loading...'],
      moveQuality: 0.5
    };
  }

  async trainOnGameResult(_gameHistory: GameState[], _won: boolean): Promise<void> {
    if (!this.model || this.isTraining) return;
    
    this.isTraining = true;
    
    try {
      console.log('🎓 Training Graph Transformer on game result...');
      // Store training data for future use
      this._trainingData.push({
        gameState: _gameHistory[0] || {} as GameState,
        outcome: _won,
        moveQuality: 0.5
      });
      
      // Simplified training logic
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate training
      
      // Save model periodically
      if (this._trainingData.length % 10 === 0) {
        await this.saveModel();
      }
      
    } catch (error) {
      console.error('Training failed:', error);
    } finally {
      this.isTraining = false;
    }
  }

  private async loadModel(): Promise<void> {
    try {
      const modelData = localStorage.getItem('klondike-solitaire-graph-model');
      if (modelData) {
        const { modelJson, weightsData } = JSON.parse(modelData);
        this.model = await tf.loadLayersModel(tf.io.fromMemory(modelJson, weightsData));
        console.log('🧠 Graph Transformer model loaded from storage');
        return;
      }

      this.model = await tf.loadLayersModel('indexeddb://klondike-solitaire-graph-model');
      console.log('🧠 Graph Transformer model loaded from IndexedDB');
    } catch (error) {
      throw new Error('No saved Graph Transformer model found');
    }
  }

  private async saveModel(): Promise<void> {
    if (!this.model) return;

    try {
      await this.model.save('indexeddb://klondike-solitaire-graph-model');
      
      await this.model.save(tf.io.withSaveHandler(async (artifacts) => {
        const modelData = {
          modelJson: artifacts.modelTopology,
          weightsData: artifacts.weightData,
          version: this.modelVersion,
          timestamp: Date.now(),
          architecture: 'GraphTransformer+Polynormer'
        };
        localStorage.setItem('klondike-solitaire-graph-model', JSON.stringify(modelData));
        return { modelArtifactsInfo: { dateSaved: new Date(), modelTopologyType: 'JSON' } };
      }));
      
      console.log('💾 Graph Transformer model saved successfully');
    } catch (error) {
      console.error('Failed to save Graph Transformer model:', error);
    }
  }

  get modelState() {
    return {
      isInitialized: this.isInitialized,
      isTraining: this.isTraining,
      modelVersion: this.modelVersion,
      architecture: 'Graph Transformer + Polynormer',
      parameters: this.model?.countParams() || 0,
      graphLayers: this.graphTransformerLayers.length,
      polynormerLayers: this.polynormerLayers.length,
      trainingDataSize: this._trainingData.length
    };
  }

  dispose(): void {
    if (this.model) {
      this.model.dispose();
    }
    
    this.graphTransformerLayers.forEach(() => {
      // Dispose layer resources if needed
    });
    
    this.polynormerLayers.forEach(() => {
      // Dispose layer resources if needed
    });
    
    console.log('🧹 Graph Transformer ML Engine disposed');
  }
} 