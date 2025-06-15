/**
 * OpenAI-Powered Solitaire AI Agent
 * Provides intelligent game analysis and hints using GPT-4o-mini
 */

class OpenAIAgent {
    constructor(gameInstance) {
        this.game = gameInstance;
        this.apiKey = null;
        this.baseURL = 'https://api.openai.com/v1/chat/completions';
        this.model = 'gpt-4o-mini';
        this.maxTokens = 500;
        this.temperature = 0.3; // Lower temperature for more consistent strategic advice
        this.isInitialized = false;
        this.requestQueue = [];
        this.isProcessing = false;
        this.rateLimitDelay = 1000; // 1 second between requests to respect rate limits
        this.lastRequestTime = 0;
        
        console.log('🤖 OpenAI Agent initialized (API key required)');
    }
    
    /**
     * Initialize the OpenAI agent with API key
     */
    initialize(apiKey) {
        if (!apiKey || typeof apiKey !== 'string') {
            throw new Error('Valid OpenAI API key is required');
        }
        
        this.apiKey = apiKey;
        this.isInitialized = true;
        console.log('✅ OpenAI Agent initialized with API key');
        
        // Test the connection
        this.testConnection();
    }
    
    /**
     * Test the OpenAI API connection
     */
    async testConnection() {
        try {
            const response = await this.makeRequest([
                {
                    role: 'user',
                    content: 'Respond with "OpenAI connection successful" if you can read this.'
                }
            ]);
            
            console.log('🔗 OpenAI Connection Test:', response);
            this.game.ui.showNotification('🤖 OpenAI AI Agent Connected!', 'success', 3000);
        } catch (error) {
            console.error('❌ OpenAI connection test failed:', error);
            this.game.ui.showNotification('❌ OpenAI connection failed. Check API key.', 'error', 5000);
        }
    }
    
    /**
     * Get intelligent game analysis and hints
     */
    async getGameAnalysis() {
        if (!this.isInitialized) {
            throw new Error('OpenAI Agent not initialized. Please provide API key.');
        }
        
        try {
            const gameState = this.serializeGameState();
            const prompt = this.buildAnalysisPrompt(gameState);
            
            const messages = [
                {
                    role: 'system',
                    content: `You are an expert Klondike Solitaire AI assistant. Analyze the game state and provide strategic advice. Be concise but insightful. Focus on the most important moves and explain your reasoning.`
                },
                {
                    role: 'user',
                    content: prompt
                }
            ];
            
            const response = await this.makeRequest(messages);
            return this.parseAnalysisResponse(response);
            
        } catch (error) {
            console.error('Error getting game analysis:', error);
            throw error;
        }
    }
    
    /**
     * Get specific move recommendations
     */
    async getMoveRecommendation() {
        if (!this.isInitialized) {
            throw new Error('OpenAI Agent not initialized. Please provide API key.');
        }
        
        try {
            const gameState = this.serializeGameState();
            const availableMoves = this.getAvailableMoves();
            
            const prompt = `
Current Klondike Solitaire game state:
${gameState}

Available moves:
${availableMoves.map((move, i) => `${i + 1}. ${move}`).join('\n')}

Which move would you recommend and why? Consider:
- Foundation building opportunities
- Revealing hidden cards
- Creating empty tableau columns
- Long-term strategic value

Provide your recommendation in this format:
RECOMMENDED MOVE: [move description]
REASONING: [brief explanation]
PRIORITY: [High/Medium/Low]
`;
            
            const messages = [
                {
                    role: 'system',
                    content: 'You are a Klondike Solitaire expert. Analyze the available moves and recommend the best one with clear reasoning.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ];
            
            const response = await this.makeRequest(messages);
            return this.parseMoveRecommendation(response);
            
        } catch (error) {
            console.error('Error getting move recommendation:', error);
            throw error;
        }
    }
    
    /**
     * Analyze if the game is winnable
     */
    async analyzeWinProbability() {
        if (!this.isInitialized) {
            throw new Error('OpenAI Agent not initialized. Please provide API key.');
        }
        
        try {
            const gameState = this.serializeGameState();
            
            const prompt = `
Analyze this Klondike Solitaire game state for winnability:
${gameState}

Assess:
1. Current win probability (0-100%)
2. Key obstacles to winning
3. Critical moves needed
4. Alternative strategies if current approach fails

Provide analysis in this format:
WIN PROBABILITY: [percentage]%
KEY OBSTACLES: [list main challenges]
CRITICAL MOVES: [essential moves to make progress]
STRATEGY: [recommended approach]
`;
            
            const messages = [
                {
                    role: 'system',
                    content: 'You are a Klondike Solitaire expert analyzing game winnability. Be realistic but encouraging.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ];
            
            const response = await this.makeRequest(messages);
            return this.parseWinProbabilityResponse(response);
            
        } catch (error) {
            console.error('Error analyzing win probability:', error);
            throw error;
        }
    }
    
    /**
     * Get help when player is stuck
     */
    async getUnstuckAdvice() {
        if (!this.isInitialized) {
            throw new Error('OpenAI Agent not initialized. Please provide API key.');
        }
        
        try {
            const gameState = this.serializeGameState();
            const recentMoves = this.getRecentMoves();
            
            const prompt = `
Player seems stuck in this Klondike Solitaire game:
${gameState}

Recent moves: ${recentMoves.join(', ')}

The player hasn't made progress recently. Provide:
1. Immediate actionable advice
2. Alternative strategies to try
3. What to look for that they might have missed
4. Encouragement and next steps

Be supportive and practical.
`;
            
            const messages = [
                {
                    role: 'system',
                    content: 'You are a helpful Klondike Solitaire coach. The player is stuck and needs encouragement and practical advice.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ];
            
            const response = await this.makeRequest(messages);
            return response;
            
        } catch (error) {
            console.error('Error getting unstuck advice:', error);
            throw error;
        }
    }
    
    /**
     * Make API request to OpenAI
     */
    async makeRequest(messages) {
        if (!this.isInitialized) {
            throw new Error('OpenAI Agent not initialized');
        }
        
        // Rate limiting
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        if (timeSinceLastRequest < this.rateLimitDelay) {
            await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay - timeSinceLastRequest));
        }
        
        const requestBody = {
            model: this.model,
            messages: messages,
            max_tokens: this.maxTokens,
            temperature: this.temperature,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0
        };
        
        const response = await fetch(this.baseURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify(requestBody)
        });
        
        this.lastRequestTime = Date.now();
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
        }
        
        const data = await response.json();
        return data.choices[0]?.message?.content || 'No response received';
    }
    
    /**
     * Serialize current game state for AI analysis
     */
    serializeGameState() {
        const state = this.game.state;
        
        // Stock and waste
        const stockInfo = `Stock: ${state.stock.length} cards remaining`;
        const wasteInfo = state.waste.length > 0 
            ? `Waste: ${state.waste[state.waste.length - 1].rank}${state.waste[state.waste.length - 1].suit} (top card)`
            : 'Waste: empty';
        
        // Foundations
        const foundationInfo = Object.entries(state.foundations)
            .map(([suit, pile]) => {
                if (pile.length === 0) return `${suit}: empty`;
                const topCard = pile[pile.length - 1];
                return `${suit}: ${topCard.rank}${topCard.suit}`;
            })
            .join(', ');
        
        // Tableau
        const tableauInfo = state.tableau.map((pile, index) => {
            if (pile.length === 0) return `Column ${index + 1}: empty`;
            
            const faceDownCount = pile.filter(card => !card.faceUp).length;
            const faceUpCards = pile.filter(card => card.faceUp);
            
            let description = `Column ${index + 1}: `;
            if (faceDownCount > 0) description += `${faceDownCount} face-down, `;
            if (faceUpCards.length > 0) {
                description += faceUpCards.map(card => `${card.rank}${card.suit}`).join('-');
            } else {
                description += 'no face-up cards';
            }
            
            return description;
        }).join('\n');
        
        return `
GAME STATE:
${stockInfo}
${wasteInfo}
Foundations: ${foundationInfo}

TABLEAU:
${tableauInfo}

GAME STATS:
Moves: ${state.gameStats.moves}
Time: ${Math.floor(state.gameStats.time / 60)}:${(state.gameStats.time % 60).toString().padStart(2, '0')}
Score: ${state.gameStats.score}
`;
    }
    
    /**
     * Get available moves for analysis
     */
    getAvailableMoves() {
        const moves = [];
        
        // Check stock
        if (this.game.state.stock.length > 0) {
            moves.push('Draw from stock pile');
        }
        
        // Check waste to foundation
        if (this.game.state.waste.length > 0) {
            const wasteCard = this.game.state.waste[this.game.state.waste.length - 1];
            if (this.game.rules.canPlaceOnFoundation(wasteCard)) {
                moves.push(`Move ${wasteCard.rank}${wasteCard.suit} from waste to foundation`);
            }
        }
        
        // Check tableau to foundation
        this.game.state.tableau.forEach((pile, index) => {
            if (pile.length > 0) {
                const topCard = pile[pile.length - 1];
                if (topCard.faceUp && this.game.rules.canPlaceOnFoundation(topCard)) {
                    moves.push(`Move ${topCard.rank}${topCard.suit} from column ${index + 1} to foundation`);
                }
            }
        });
        
        // Check tableau moves
        this.game.state.tableau.forEach((sourcePile, sourceIndex) => {
            if (sourcePile.length > 0) {
                const faceUpCards = sourcePile.filter(card => card.faceUp);
                faceUpCards.forEach((card, cardIndex) => {
                    this.game.state.tableau.forEach((targetPile, targetIndex) => {
                        if (sourceIndex !== targetIndex && this.game.rules.canPlaceOnTableau(card, targetPile)) {
                            const cardPosition = sourcePile.length - faceUpCards.length + cardIndex;
                            const cardsToMove = sourcePile.length - cardPosition;
                            moves.push(`Move ${cardsToMove} card(s) from column ${sourceIndex + 1} to column ${targetIndex + 1}`);
                        }
                    });
                });
            }
        });
        
        return moves.length > 0 ? moves : ['No obvious moves available - consider drawing from stock or looking for hidden opportunities'];
    }
    
    /**
     * Get recent moves for context
     */
    getRecentMoves() {
        // This would need to be implemented based on your game's move history
        // For now, return a placeholder
        return ['Recent move history not available'];
    }
    
    /**
     * Parse AI analysis response
     */
    parseAnalysisResponse(response) {
        return {
            analysis: response,
            timestamp: new Date().toISOString(),
            confidence: 'high' // Could be enhanced to parse confidence from response
        };
    }
    
    /**
     * Parse move recommendation response
     */
    parseMoveRecommendation(response) {
        const lines = response.split('\n');
        const result = {
            move: 'No specific move recommended',
            reasoning: 'Analysis not available',
            priority: 'Medium',
            fullResponse: response
        };
        
        lines.forEach(line => {
            if (line.startsWith('RECOMMENDED MOVE:')) {
                result.move = line.replace('RECOMMENDED MOVE:', '').trim();
            } else if (line.startsWith('REASONING:')) {
                result.reasoning = line.replace('REASONING:', '').trim();
            } else if (line.startsWith('PRIORITY:')) {
                result.priority = line.replace('PRIORITY:', '').trim();
            }
        });
        
        return result;
    }
    
    /**
     * Parse win probability response
     */
    parseWinProbabilityResponse(response) {
        const lines = response.split('\n');
        const result = {
            probability: 50,
            obstacles: [],
            criticalMoves: [],
            strategy: 'Continue playing strategically',
            fullResponse: response
        };
        
        lines.forEach(line => {
            if (line.startsWith('WIN PROBABILITY:')) {
                const match = line.match(/(\d+)%/);
                if (match) result.probability = parseInt(match[1]);
            } else if (line.startsWith('KEY OBSTACLES:')) {
                result.obstacles = line.replace('KEY OBSTACLES:', '').trim().split(',').map(s => s.trim());
            } else if (line.startsWith('CRITICAL MOVES:')) {
                result.criticalMoves = line.replace('CRITICAL MOVES:', '').trim().split(',').map(s => s.trim());
            } else if (line.startsWith('STRATEGY:')) {
                result.strategy = line.replace('STRATEGY:', '').trim();
            }
        });
        
        return result;
    }
    
    /**
     * Integration methods for the main game
     */
    
    /**
     * Show AI analysis in game UI
     */
    async showAnalysis() {
        try {
            this.game.ui.showNotification('🤖 AI analyzing game state...', 'info', 2000);
            
            const analysis = await this.getGameAnalysis();
            
            // Create analysis display
            const analysisHTML = `
                <div class="ai-analysis">
                    <h3>🤖 OpenAI Game Analysis</h3>
                    <div class="analysis-content">
                        ${analysis.analysis.replace(/\n/g, '<br>')}
                    </div>
                    <div class="analysis-footer">
                        <small>Powered by GPT-4o-mini • ${new Date().toLocaleTimeString()}</small>
                    </div>
                </div>
            `;
            
            this.game.ui.showCustomNotification(analysisHTML, 'ai-analysis', 10000);
            
        } catch (error) {
            console.error('Error showing AI analysis:', error);
            this.game.ui.showNotification('❌ AI analysis failed: ' + error.message, 'error', 5000);
        }
    }
    
    /**
     * Show move recommendation
     */
    async showMoveRecommendation() {
        try {
            this.game.ui.showNotification('🤖 AI calculating best move...', 'info', 2000);
            
            const recommendation = await this.getMoveRecommendation();
            
            const recommendationHTML = `
                <div class="ai-recommendation">
                    <h3>🎯 AI Move Recommendation</h3>
                    <div class="recommended-move">
                        <strong>Recommended:</strong> ${recommendation.move}
                    </div>
                    <div class="reasoning">
                        <strong>Why:</strong> ${recommendation.reasoning}
                    </div>
                    <div class="priority priority-${recommendation.priority.toLowerCase()}">
                        Priority: ${recommendation.priority}
                    </div>
                </div>
            `;
            
            this.game.ui.showCustomNotification(recommendationHTML, 'ai-recommendation', 8000);
            
        } catch (error) {
            console.error('Error showing move recommendation:', error);
            this.game.ui.showNotification('❌ Move recommendation failed: ' + error.message, 'error', 5000);
        }
    }
    
    /**
     * Show win probability analysis
     */
    async showWinProbability() {
        try {
            this.game.ui.showNotification('🤖 AI analyzing win probability...', 'info', 2000);
            
            const analysis = await this.analyzeWinProbability();
            
            const probabilityHTML = `
                <div class="ai-win-analysis">
                    <h3>📊 Win Probability Analysis</h3>
                    <div class="probability-meter">
                        <div class="probability-bar">
                            <div class="probability-fill" style="width: ${analysis.probability}%"></div>
                        </div>
                        <div class="probability-text">${analysis.probability}% chance to win</div>
                    </div>
                    <div class="analysis-details">
                        <div><strong>Strategy:</strong> ${analysis.strategy}</div>
                        ${analysis.obstacles.length > 0 ? `<div><strong>Obstacles:</strong> ${analysis.obstacles.join(', ')}</div>` : ''}
                        ${analysis.criticalMoves.length > 0 ? `<div><strong>Critical moves:</strong> ${analysis.criticalMoves.join(', ')}</div>` : ''}
                    </div>
                </div>
            `;
            
            this.game.ui.showCustomNotification(probabilityHTML, 'ai-win-analysis', 10000);
            
        } catch (error) {
            console.error('Error showing win probability:', error);
            this.game.ui.showNotification('❌ Win analysis failed: ' + error.message, 'error', 5000);
        }
    }
}

// Export for use in main game
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OpenAIAgent;
} else if (typeof window !== 'undefined') {
    window.OpenAIAgent = OpenAIAgent;
} 