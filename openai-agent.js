/**
 * OpenAI-Powered Solitaire AI Agent
 * Provides intelligent game analysis and hints using GPT-4o-mini
 */

class OpenAIAgent {
    constructor(gameInstance) {
        this.game = gameInstance;
        this.apiKey = null;
        this.baseURL = 'https://api.openai.com/v1/chat/completions';
        this.model = 'o4-mini';
        this.maxTokens = 1000; // o1-mini needs higher token limit
        // Note: o1-mini doesn't use temperature parameter
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
            
            const prompt = `
Current Klondike Solitaire game state:
${gameState}

Recommend the BEST single move. Respond with ONLY one of these formats:

STOCK: Draw from deck
WASTE_TO_FOUNDATION: [suit] (♠/♥/♦/♣)
TABLEAU_TO_FOUNDATION: [column] [suit] (column 1-7, suit ♠/♥/♦/♣)
TABLEAU_TO_TABLEAU: [from_column] [to_column] (columns 1-7)
WASTE_TO_TABLEAU: [column] (column 1-7)

Example responses:
STOCK: Draw from deck
WASTE_TO_FOUNDATION: ♠
TABLEAU_TO_FOUNDATION: 3 ♥
TABLEAU_TO_TABLEAU: 5 2
WASTE_TO_TABLEAU: 4

Be concise - only the action format above.
`;
            
            const messages = [
                {
                    role: 'system',
                    content: 'You are a Klondike Solitaire expert. Respond with ONLY the move format requested - no explanations.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ];
            
            const response = await this.makeRequest(messages);
            return this.parseVisualMoveRecommendation(response);
            
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
            
            const prompt = `
I'm stuck in this Klondike Solitaire game. Help me find the next moves:
${gameState}

What should I do? Look for:
1. Hidden cards that can be revealed
2. Foundation moves I might have missed
3. Tableau rearrangements that open up new possibilities
4. Whether I should cycle through the stock pile

Give me 2-3 specific actionable suggestions.
`;
            
            const messages = [
                {
                    role: 'system',
                    content: 'You are a helpful Klondike Solitaire coach. Give practical, specific advice to help players when they\'re stuck.'
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
     * Auto-solve the game using GPT AI
     */
    async autoSolveGame() {
        if (!this.isInitialized) {
            throw new Error('OpenAI Agent not initialized. Please provide API key.');
        }
        
        console.log('🧠 GPT AI Auto-Solve starting...');
        const startTime = Date.now();
        const maxMoves = 200; // Prevent infinite loops
        let moveCount = 0;
        const executedMoves = [];
        
        try {
            while (!this.game.gameWon && moveCount < maxMoves) {
                // Get the next best move from GPT
                const recommendation = await this.getMoveRecommendation();
                
                if (!recommendation || !recommendation.action) {
                    console.log('❌ GPT AI could not find a valid move');
                    break;
                }
                
                // Execute the recommended move
                const moveExecuted = await this.executeMove(recommendation);
                
                if (!moveExecuted) {
                    console.log('❌ Failed to execute GPT recommended move:', recommendation);
                    break;
                }
                
                executedMoves.push(recommendation);
                moveCount++;
                
                // Small delay to prevent overwhelming the API
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Check if game is won
                if (this.game.gameWon) {
                    console.log('🎉 GPT AI successfully completed the game!');
                    return {
                        success: true,
                        moves: executedMoves,
                        moveCount: moveCount,
                        timeTaken: Date.now() - startTime,
                        confidence: 0.95
                    };
                }
                
                // Progress check - if no progress in last 10 moves, try different strategy
                if (moveCount > 10 && moveCount % 10 === 0) {
                    const foundationCards = Object.values(this.game.state.foundations)
                        .reduce((sum, pile) => sum + pile.length, 0);
                    
                    if (foundationCards < moveCount / 4) {
                        console.log('⚠️ GPT AI making slow progress, may need different strategy');
                    }
                }
            }
            
            // If we exit the loop without winning
            if (this.game.gameWon) {
                return {
                    success: true,
                    moves: executedMoves,
                    moveCount: moveCount,
                    timeTaken: Date.now() - startTime,
                    confidence: 0.9
                };
            } else {
                return {
                    success: false,
                    reason: moveCount >= maxMoves ? 'Max moves reached' : 'No valid moves found',
                    moves: executedMoves,
                    moveCount: moveCount,
                    timeTaken: Date.now() - startTime
                };
            }
            
        } catch (error) {
            console.error('❌ GPT AI auto-solve error:', error);
            return {
                success: false,
                error: error.message,
                moves: executedMoves,
                moveCount: moveCount,
                timeTaken: Date.now() - startTime
            };
        }
    }
    
    /**
     * Execute a move recommendation
     */
    async executeMove(recommendation) {
        try {
            if (!recommendation || !recommendation.action) {
                return false;
            }
            
            const action = recommendation.action.toUpperCase();
            
            if (action === 'STOCK') {
                // Draw from stock
                this.game.ai.flipStock();
                return true;
            }
            
            if (action === 'WASTE_TO_FOUNDATION') {
                // Move top waste card to foundation
                if (this.game.state.waste.length > 0) {
                    const card = this.game.state.waste[this.game.state.waste.length - 1];
                    if (this.game.rules.canPlaceOnFoundation(card)) {
                        this.game.state.waste.pop();
                        this.game.state.foundations[card.suit].push(card);
                        this.game.state.gameStats.moves++;
                        this.game.state.updateScore('foundation');
                        this.game.state.checkWinCondition();
                        this.game.renderer.render();
                        return true;
                    }
                }
                return false;
            }
            
            if (action === 'TABLEAU_TO_FOUNDATION') {
                // Move tableau card to foundation
                const column = recommendation.column - 1; // Convert to 0-based
                if (column >= 0 && column < 7 && this.game.state.tableau[column].length > 0) {
                    const pile = this.game.state.tableau[column];
                    const card = pile[pile.length - 1];
                    if (card.faceUp && this.game.rules.canPlaceOnFoundation(card)) {
                        pile.pop();
                        this.game.state.foundations[card.suit].push(card);
                        this.game.state.gameStats.moves++;
                        this.game.state.updateScore('foundation');
                        
                        // Flip next card if needed
                        if (pile.length > 0 && !pile[pile.length - 1].faceUp) {
                            pile[pile.length - 1].faceUp = true;
                        }
                        
                        this.game.state.checkWinCondition();
                        this.game.renderer.render();
                        return true;
                    }
                }
                return false;
            }
            
            if (action === 'TABLEAU_TO_TABLEAU') {
                // Move cards between tableau columns
                const fromCol = recommendation.fromColumn - 1;
                const toCol = recommendation.toColumn - 1;
                
                if (fromCol >= 0 && fromCol < 7 && toCol >= 0 && toCol < 7 && fromCol !== toCol) {
                    const fromPile = this.game.state.tableau[fromCol];
                    const toPile = this.game.state.tableau[toCol];
                    
                    if (fromPile.length > 0) {
                        // Find the sequence to move (all face-up cards from the bottom)
                        let moveIndex = fromPile.length - 1;
                        while (moveIndex > 0 && fromPile[moveIndex - 1].faceUp) {
                            moveIndex--;
                        }
                        
                        const cardToMove = fromPile[moveIndex];
                        if (this.game.rules.canPlaceOnTableau(cardToMove, toPile)) {
                            const cardsToMove = fromPile.splice(moveIndex);
                            toPile.push(...cardsToMove);
                            this.game.state.gameStats.moves++;
                            
                            // Flip next card in source pile if needed
                            if (fromPile.length > 0 && !fromPile[fromPile.length - 1].faceUp) {
                                fromPile[fromPile.length - 1].faceUp = true;
                            }
                            
                            this.game.renderer.render();
                            return true;
                        }
                    }
                }
                return false;
            }
            
            if (action === 'WASTE_TO_TABLEAU') {
                // Move waste card to tableau
                const column = recommendation.column - 1;
                if (column >= 0 && column < 7 && this.game.state.waste.length > 0) {
                    const card = this.game.state.waste[this.game.state.waste.length - 1];
                    const pile = this.game.state.tableau[column];
                    
                    if (this.game.rules.canPlaceOnTableau(card, pile)) {
                        this.game.state.waste.pop();
                        pile.push(card);
                        this.game.state.gameStats.moves++;
                        this.game.state.updateScore('waste_to_tableau');
                        this.game.renderer.render();
                        return true;
                    }
                }
                return false;
            }
            
            return false;
            
        } catch (error) {
            console.error('Error executing move:', error);
            return false;
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
            max_completion_tokens: this.maxTokens,
            temperature: this.temperature ?? 0.3,
            top_p: 1
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
    parseVisualMoveRecommendation(response) {
        const cleanResponse = response.trim().toUpperCase();
        
        if (cleanResponse.includes('STOCK')) {
            return {
                type: 'stock',
                action: 'draw',
                visual: 'highlight_stock'
            };
        }
        
        if (cleanResponse.includes('WASTE_TO_FOUNDATION')) {
            const suitMatch = cleanResponse.match(/[♠♥♦♣]/);
            return {
                type: 'waste_to_foundation',
                suit: suitMatch ? suitMatch[0] : null,
                visual: 'highlight_waste_and_foundation'
            };
        }
        
        if (cleanResponse.includes('TABLEAU_TO_FOUNDATION')) {
            const matches = cleanResponse.match(/(\d+)\s*([♠♥♦♣])/);
            return {
                type: 'tableau_to_foundation',
                column: matches ? parseInt(matches[1]) - 1 : null, // Convert to 0-based
                suit: matches ? matches[2] : null,
                visual: 'highlight_tableau_and_foundation'
            };
        }
        
        if (cleanResponse.includes('TABLEAU_TO_TABLEAU')) {
            const matches = cleanResponse.match(/(\d+)\s+(\d+)/);
            return {
                type: 'tableau_to_tableau',
                fromColumn: matches ? parseInt(matches[1]) - 1 : null, // Convert to 0-based
                toColumn: matches ? parseInt(matches[2]) - 1 : null,
                visual: 'highlight_tableau_move'
            };
        }
        
        if (cleanResponse.includes('WASTE_TO_TABLEAU')) {
            const match = cleanResponse.match(/(\d+)/);
            return {
                type: 'waste_to_tableau',
                column: match ? parseInt(match[1]) - 1 : null, // Convert to 0-based
                visual: 'highlight_waste_and_tableau'
            };
        }
        
        // Fallback
        return {
            type: 'unknown',
            action: 'no_move',
            visual: 'no_highlight',
            rawResponse: response
        };
    }
    
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
            this.game.ui.showNotification('🤖 AI analyzing best move...', 'info', 1500);
            
            const recommendation = await this.getMoveRecommendation();
            
            // Apply visual highlighting based on recommendation
            this.applyVisualHint(recommendation);
            
            // Show minimal notification
            let hintText = this.getHintText(recommendation);
            this.game.ui.showNotification(`🎯 ${hintText}`, 'hint', 4000);
            
        } catch (error) {
            console.error('Error showing move recommendation:', error);
            this.game.ui.showNotification('❌ AI hint failed: ' + error.message, 'error', 3000);
        }
    }
    
    getHintText(recommendation) {
        switch (recommendation.type) {
            case 'stock':
                return 'Draw from deck';
            case 'waste_to_foundation':
                return `Move waste card to ${recommendation.suit} foundation`;
            case 'tableau_to_foundation':
                return `Move column ${recommendation.column + 1} card to ${recommendation.suit} foundation`;
            case 'tableau_to_tableau':
                return `Move from column ${recommendation.fromColumn + 1} to column ${recommendation.toColumn + 1}`;
            case 'waste_to_tableau':
                return `Move waste card to column ${recommendation.column + 1}`;
            default:
                return 'No clear move found';
        }
    }
    
    applyVisualHint(recommendation) {
        // Clear any existing hints
        this.clearVisualHints();
        
        // Store hint for renderer
        this.game.state.currentHint = recommendation;
        
        // Auto-clear after 5 seconds
        setTimeout(() => this.clearVisualHints(), 5000);
        
        // Trigger render
        this.game.renderer.render();
    }
    
    clearVisualHints() {
        if (this.game.state.currentHint) {
            this.game.state.currentHint = null;
            this.game.renderer.render();
        }
    }
    
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
    
    isAvailable() {
        return this.isInitialized && this.apiKey;
    }
}

// Export for environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OpenAIAgent;
} else if (typeof window !== 'undefined') {
    window.OpenAIAgent = OpenAIAgent;
}