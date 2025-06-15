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
        this.max_completion_tokens = 1000;
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
        
        // Perform initial game analysis after a short delay
        setTimeout(() => {
            this.performInitialAnalysis();
        }, 3000);
    }
    
    /**
     * Perform initial game analysis to understand the board state
     */
    async performInitialAnalysis() {
        try {
            console.log('🔍 o4-mini performing initial game analysis...');
            const gameState = this.serializeGameState();
            console.log('📊 Current game state for AI:', gameState);
            
            const prompt = `
Analyze this Klondike Solitaire game state and identify the best opening strategy:
${gameState}

Provide a brief analysis of:
1. Immediate winning moves available
2. Cards that should be prioritized to reveal
3. Overall strategy for this layout

Keep response under 100 words.
`;
            
            const messages = [
                {
                    role: 'user',
                    content: prompt
                }
            ];
            
            const analysis = await this.makeRequest(messages);
            console.log('🧠 Initial AI analysis:', analysis);
            
            // Store analysis for later reference
            this.initialAnalysis = analysis;
            
        } catch (error) {
            console.error('Initial analysis failed:', error);
        }
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
            max_completion_tokens: this.max_completion_tokens
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
     * Serialize current game state for AI analysis - includes ALL cards
     */
    serializeGameState() {
        const state = this.game.state;
        
        // Stock and waste - show actual cards when possible
        const stockInfo = `Stock: ${state.stock.length} cards remaining`;
        let wasteInfo = 'Waste: empty';
        if (state.waste.length > 0) {
            const visibleWaste = state.waste.slice(-3); // Show last 3 cards
            wasteInfo = `Waste: ${visibleWaste.map(c => `${c.rank}${c.suit}`).join(', ')} (${state.waste.length} total)`;
        }
        
        // Foundations - show current state and what can be placed next
        const foundationInfo = Object.entries(state.foundations)
            .map(([suit, pile]) => {
                if (pile.length === 0) return `${suit}: empty (needs Ace)`;
                const topCard = pile[pile.length - 1];
                const nextRank = topCard.value === 13 ? 'complete' : this.getNextRank(topCard.value);
                return `${suit}: ${topCard.rank}${topCard.suit} (needs ${nextRank})`;
            })
            .join(', ');
        
        // Tableau - detailed view including all face-up cards and strategic info
        const tableauInfo = state.tableau.map((pile, index) => {
            if (pile.length === 0) return `Column ${index + 1}: empty (can place King)`;
            
            const faceDownCount = pile.filter(card => !card.faceUp).length;
            const faceUpCards = pile.filter(card => card.faceUp);
            
            let description = `Column ${index + 1}: `;
            if (faceDownCount > 0) description += `${faceDownCount} face-down, `;
            
            if (faceUpCards.length > 0) {
                // Show all face-up cards in sequence
                description += `face-up: ${faceUpCards.map(card => `${card.rank}${card.suit}`).join('-')}`;
                
                // Add strategic info about what can be placed on top
                const topCard = faceUpCards[faceUpCards.length - 1];
                const canPlace = this.getValidTableauPlacements(topCard);
                if (canPlace.length > 0) {
                    description += ` (can place: ${canPlace.join(' or ')})`;
                }
            } else {
                description += 'no face-up cards';
            }
            
            return description;
        }).join('\n');
        
        // Available moves analysis
        const availableMoves = this.getAvailableMoves();
        const movesInfo = availableMoves.length > 0 ? availableMoves.slice(0, 5).join(', ') : 'No obvious moves';
        
        return `
KLONDIKE SOLITAIRE GAME STATE:
${stockInfo}
${wasteInfo}
Foundations: ${foundationInfo}

TABLEAU COLUMNS:
${tableauInfo}

AVAILABLE MOVES: ${movesInfo}

GAME STATS:
Moves: ${state.gameStats.moves}
Time: ${Math.floor(state.gameStats.time / 60)}:${(state.gameStats.time % 60).toString().padStart(2, '0')}
Score: ${state.gameStats.score}

STRATEGIC PRIORITY: Find moves that reveal face-down cards, build foundations, or create empty columns for Kings.
`;
    }
    
    /**
     * Get next rank for foundation building
     */
    getNextRank(currentValue) {
        const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        return currentValue < 13 ? ranks[currentValue] : 'complete';
    }
    
    /**
     * Get valid cards that can be placed on a tableau card
     */
    getValidTableauPlacements(card) {
        const validCards = [];
        const targetValue = card.value - 1;
        if (targetValue > 0) {
            const isRed = card.suit === '♥' || card.suit === '♦';
            const targetSuits = isRed ? ['♠', '♣'] : ['♥', '♦'];
            const targetRank = this.getNextRank(targetValue - 1);
            targetSuits.forEach(suit => validCards.push(`${targetRank}${suit}`));
        }
        return validCards;
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
                        <small>Powered by o4-mini • ${new Date().toLocaleTimeString()}</small>
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
     * Show move recommendation with enhanced visual hints
     */
    async showMoveRecommendation() {
        try {
            console.log('🤖 Visual Hint requested - calling o4-mini AI...');
            console.log('🔍 Agent initialized:', this.isInitialized);
            console.log('🔑 API key present:', !!this.apiKey);
            
            if (!this.isInitialized) {
                this.game.ui.showNotification('❌ OpenAI Agent not initialized. Please set API key first.', 'error', 4000);
                return;
            }
            
            this.game.ui.showNotification('🧠 o4-mini analyzing best move...', 'info', 2000);
            
            // Get current game state for debugging
            const gameState = this.serializeGameState();
            console.log('📊 Current game state being sent to AI:', gameState);
            
            // Get AI recommendation
            const recommendation = await this.getMoveRecommendation();
            console.log('🎯 AI recommendation received:', recommendation);
            
            if (!recommendation || recommendation.type === 'unknown') {
                this.game.ui.showNotification('🤔 AI suggests: Draw from stock or look for foundation moves', 'hint', 4000);
                return;
            }
            
            // Apply visual highlighting
            this.applyVisualHint(recommendation);
            
            // Show detailed hint text
            const hintText = this.getHintText(recommendation);
            const strategicReason = this.getStrategicReason(recommendation);
            
            this.game.ui.showNotification(`🎯 ${hintText}`, 'hint', 5000);
            
            // Show additional strategic context
            if (strategicReason) {
                setTimeout(() => {
                    this.game.ui.showNotification(`💡 ${strategicReason}`, 'info', 3000);
                }, 1000);
            }
            
        } catch (error) {
            console.error('Error showing AI move recommendation:', error);
            this.game.ui.showNotification('❌ AI hint failed: ' + error.message, 'error', 4000);
        }
    }
    
    /**
     * Get strategic reasoning for the move
     */
    getStrategicReason(recommendation) {
        switch (recommendation.type) {
            case 'stock':
                return 'Drawing reveals new cards and creates opportunities';
            case 'waste_to_foundation':
                return 'Foundation moves are always good - they free up cards';
            case 'tableau_to_foundation':
                return 'Moving to foundation reveals the card underneath';
            case 'tableau_to_tableau':
                return 'This move reveals hidden cards or creates better sequences';
            case 'waste_to_tableau':
                return 'This creates new building opportunities';
            default:
                return null;
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

    // Highlight cards/areas based on recommendation
    applyVisualHint(rec) {
        console.log('🎯 Applying visual hint:', rec);
        
        // Clear previous hints
        this.clearVisualHints();
        
        // Store the hint for the renderer
        this.game.state.currentHint = rec;
        
        // Apply CSS highlighting based on recommendation type
        try {
            switch (rec.type) {
                case 'stock':
                    this.highlightStock();
                    break;
                case 'waste_to_foundation':
                    this.highlightWasteAndFoundation(rec.suit);
                    break;
                case 'tableau_to_foundation':
                    this.highlightTableauAndFoundation(rec.column, rec.suit);
                    break;
                case 'tableau_to_tableau':
                    this.highlightTableauMove(rec.fromColumn, rec.toColumn);
                    break;
                case 'waste_to_tableau':
                    this.highlightWasteAndTableau(rec.column);
                    break;
                default:
                    console.log('Unknown hint type:', rec.type);
            }
        } catch (error) {
            console.error('Error applying visual hint:', error);
        }
        
        // Auto-clear after 8 seconds
        setTimeout(() => this.clearVisualHints(), 8000);
        
        // Re-render the game
        this.game.renderer.render();
    }
    
    highlightStock() {
        const stockElement = document.querySelector('.stock-pile');
        if (stockElement) {
            stockElement.classList.add('ai-hint-highlight');
            console.log('✨ Stock pile highlighted');
        }
    }
    
    highlightWasteAndFoundation(suit) {
        const wasteElement = document.querySelector('.waste-pile');
        if (wasteElement) {
            wasteElement.classList.add('ai-hint-source');
        }
        
        const foundationElement = document.querySelector(`.foundation-${suit}`);
        if (foundationElement) {
            foundationElement.classList.add('ai-hint-target');
        }
        
        console.log(`✨ Waste and ${suit} foundation highlighted`);
    }
    
    highlightTableauAndFoundation(column, suit) {
        const tableauElement = document.querySelector(`.tableau-column[data-column="${column}"]`);
        if (tableauElement) {
            tableauElement.classList.add('ai-hint-source');
        }
        
        const foundationElement = document.querySelector(`.foundation-${suit}`);
        if (foundationElement) {
            foundationElement.classList.add('ai-hint-target');
        }
        
        console.log(`✨ Column ${column + 1} and ${suit} foundation highlighted`);
    }
    
    highlightTableauMove(fromColumn, toColumn) {
        const fromElement = document.querySelector(`.tableau-column[data-column="${fromColumn}"]`);
        if (fromElement) {
            fromElement.classList.add('ai-hint-source');
        }
        
        const toElement = document.querySelector(`.tableau-column[data-column="${toColumn}"]`);
        if (toElement) {
            toElement.classList.add('ai-hint-target');
        }
        
        console.log(`✨ Column ${fromColumn + 1} to column ${toColumn + 1} highlighted`);
    }
    
    highlightWasteAndTableau(column) {
        const wasteElement = document.querySelector('.waste-pile');
        if (wasteElement) {
            wasteElement.classList.add('ai-hint-source');
        }
        
        const tableauElement = document.querySelector(`.tableau-column[data-column="${column}"]`);
        if (tableauElement) {
            tableauElement.classList.add('ai-hint-target');
        }
        
        console.log(`✨ Waste and column ${column + 1} highlighted`);
    }

    clearVisualHints() {
        console.log('🧹 Clearing visual hints');
        
        // Remove all hint classes
        const hintElements = document.querySelectorAll('.ai-hint-highlight, .ai-hint-source, .ai-hint-target');
        hintElements.forEach(element => {
            element.classList.remove('ai-hint-highlight', 'ai-hint-source', 'ai-hint-target');
        });
        
        // Clear the hint state
        if (this.game.state.currentHint) {
            this.game.state.currentHint = null;
            this.game.renderer.render();
        }
    }

    async showWinProbability() {
        try {
            this.game.ui.showNotification('🤖 AI analyzing win probability...', 'info', 1500);
            const res = await this.analyzeWinProbability();
            const html = `
                <div class="ai-win-analysis">
                    <h3>📊 Win Probability Analysis</h3>
                    <div>${res.probability}% chance to win</div>
                    <div><strong>Strategy:</strong> ${res.strategy}</div>
                </div>`;
            this.game.ui.showCustomNotification(html, 'ai-win', 8000);
        } catch (e) {
            console.error(e);
            this.game.ui.showNotification('❌ Win analysis failed: ' + e.message, 'error', 4000);
        }
    }

    isAvailable() {
        return this.isInitialized && !!this.apiKey;
    }
}

// Browser / Node export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OpenAIAgent;
} else if (typeof window !== 'undefined') {
    window.OpenAIAgent = OpenAIAgent;
}