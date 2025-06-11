// AI Worker for Solitaire - Handles AI analysis in background thread
class SolitaireAIWorker {
    constructor() {
        this.isReady = true;
        console.log('🤖 AI Worker initialized');
    }

    analyzePosition(gameState) {
        try {
            // Clone the game state to avoid any reference issues
            const state = this.cloneGameState(gameState);
            
            // Perform AI analysis
            const analysis = {
                possibleMoves: this.generateAllPossibleMoves(state),
                winProbability: this.calculateWinProbability(state),
                bestMove: null,
                stockRecommendation: this.analyzeStock(state),
                timestamp: Date.now()
            };

            // Find best move
            if (analysis.possibleMoves.length > 0) {
                analysis.bestMove = this.rankMovesByPriority(analysis.possibleMoves, state)[0];
            }

            return analysis;
        } catch (error) {
            console.error('AI Worker analysis error:', error);
            return { error: error.message, timestamp: Date.now() };
        }
    }

    async findWinningPath(gameState, maxDepth = 150) {
        try {
            const startTime = performance.now();
            const result = await this.searchWinningPath(gameState, [], maxDepth);
            const timeTaken = performance.now() - startTime;

            return {
                canWin: result !== null,
                moves: result || [],
                moveCount: result ? result.length : 0,
                timeTaken: Math.round(timeTaken),
                confidence: result ? this.calculatePathConfidence(result) : 0
            };
        } catch (error) {
            console.error('Winning path search error:', error);
            return { canWin: false, error: error.message };
        }
    }

    async searchWinningPath(gameState, moveSequence, depthRemaining) {
        // Check if game is won
        if (this.isGameWon(gameState)) {
            return moveSequence;
        }

        // Depth limit reached
        if (depthRemaining <= 0) {
            return null;
        }

        // Generate and rank possible moves with enhanced prioritization
        const possibleMoves = this.generateAllPossibleMoves(gameState);
        const rankedMoves = this.rankMovesByStrategicValue(possibleMoves, gameState);

        // Adaptive branching factor based on depth
        const maxBranches = depthRemaining > 100 ? 5 : depthRemaining > 50 ? 8 : 12;

        // Try each move with enhanced pruning
        for (let i = 0; i < Math.min(rankedMoves.length, maxBranches); i++) {
            const move = rankedMoves[i];
            
            // Skip obviously bad moves at deep levels
            if (depthRemaining > 75 && this.isProbablyBadMove(move, gameState)) {
                continue;
            }

            const newState = this.applyMoveToState(gameState, move);
            const newSequence = [...moveSequence, move];

            // Early win detection - check if this puts us significantly closer
            const progressScore = this.calculateProgressScore(newState, gameState);
            if (progressScore < -10 && depthRemaining > 50) {
                continue; // Skip moves that make things significantly worse
            }

            // Recursive search
            const winningPath = await this.searchWinningPath(newState, newSequence, depthRemaining - 1);
            if (winningPath) {
                return winningPath;
            }

            // Yield control more frequently for responsiveness
            if (i % 3 === 0) {
                await new Promise(resolve => setTimeout(resolve, 0));
            }
        }

        return null;
    }

    // Enhanced move ranking with strategic lookahead
    rankMovesByStrategicValue(moves, gameState) {
        return moves.map(move => {
            let strategicValue = move.priority || 0;
            
            // Foundation moves get massive priority
            if (move.type === 'tableau_to_foundation' || move.type === 'waste_to_foundation') {
                strategicValue += 1000;
                
                // Extra bonus for low foundation cards (build foundation early)
                if (move.card && move.card.value <= 4) {
                    strategicValue += 200;
                }
            }
            
            // Moves that reveal hidden cards
            if (this.revealsHiddenCard(move, gameState)) {
                strategicValue += 300;
            }
            
            // Kings to empty spaces
            if (move.card && move.card.value === 13 && this.isEmptySpaceMove(move, gameState)) {
                strategicValue += 250;
            }
            
            // Penalize stock cycling without tableau progress
            if (move.type === 'draw_stock') {
                const tableauMoves = moves.filter(m => m.type !== 'draw_stock').length;
                if (tableauMoves > 0) {
                    strategicValue -= 100; // Prefer tableau moves when available
                }
            }
            
            return { ...move, strategicValue };
        }).sort((a, b) => b.strategicValue - a.strategicValue);
    }

    revealsHiddenCard(move, gameState) {
        if (move.type === 'tableau_to_foundation' || move.type === 'tableau_to_tableau') {
            const pile = gameState.tableau[move.from?.index];
            return pile && pile.length > 1 && !pile[pile.length - 2].faceUp;
        }
        return false;
    }

    isEmptySpaceMove(move, gameState) {
        if (move.type === 'tableau_to_tableau' || move.type === 'waste_to_tableau') {
            const targetPile = gameState.tableau[move.to?.index];
            return targetPile && targetPile.length === 0;
        }
        return false;
    }

    isProbablyBadMove(move, gameState) {
        // Avoid moving aces away from foundation areas
        if (move.card && move.card.value === 1 && move.type === 'tableau_to_tableau') {
            return true;
        }
        
        // Avoid breaking good sequences unless necessary
        if (move.type === 'tableau_to_tableau' && this.breaksGoodSequence(move, gameState)) {
            return true;
        }
        
        return false;
    }

    breaksGoodSequence(move, gameState) {
        // Simple check for breaking good sequences
        const pile = gameState.tableau[move.from?.index];
        if (pile && pile.length >= 3) {
            const topCards = pile.slice(-3);
            if (this.isGoodSequence(topCards)) {
                return true;
            }
        }
        return false;
    }

    isGoodSequence(cards) {
        if (cards.length < 2) return false;
        
        for (let i = 1; i < cards.length; i++) {
            const curr = cards[i];
            const prev = cards[i-1];
            
            if (!curr.faceUp || !prev.faceUp) return false;
            if (curr.value !== prev.value - 1) return false;
            
            const currColor = (curr.suit === '♠' || curr.suit === '♣') ? 'black' : 'red';
            const prevColor = (prev.suit === '♠' || prev.suit === '♣') ? 'black' : 'red';
            if (currColor === prevColor) return false;
        }
        
        return true;
    }

    calculateProgressScore(newState, oldState) {
        const oldFoundationCards = Object.values(oldState.foundations).reduce((sum, pile) => sum + pile.length, 0);
        const newFoundationCards = Object.values(newState.foundations).reduce((sum, pile) => sum + pile.length, 0);
        
        const oldHiddenCards = oldState.tableau.reduce((sum, pile) => sum + pile.filter(c => !c.faceUp).length, 0);
        const newHiddenCards = newState.tableau.reduce((sum, pile) => sum + pile.filter(c => !c.faceUp).length, 0);
        
        const foundationProgress = (newFoundationCards - oldFoundationCards) * 10;
        const hiddenCardProgress = (oldHiddenCards - newHiddenCards) * 5;
        
        return foundationProgress + hiddenCardProgress;
    }

    cloneGameState(state) {
        return {
            tableau: state.tableau.map(pile => 
                pile.map(card => ({
                    id: card.id,
                    suit: card.suit,
                    value: card.value,
                    faceUp: card.faceUp
                }))
            ),
            foundations: Object.fromEntries(
                Object.entries(state.foundations).map(([suit, pile]) => [
                    suit,
                    pile.map(card => ({
                        id: card.id,
                        suit: card.suit,
                        value: card.value,
                        faceUp: card.faceUp
                    }))
                ])
            ),
            stock: state.stock.map(card => ({
                id: card.id,
                suit: card.suit,
                value: card.value,
                faceUp: card.faceUp
            })),
            waste: state.waste.map(card => ({
                id: card.id,
                suit: card.suit,
                value: card.value,
                faceUp: card.faceUp
            })),
            drawMode: state.drawMode || 3
        };
    }

    generateAllPossibleMoves(state) {
        const moves = [];

        // Tableau to foundation moves
        for (let i = 0; i < state.tableau.length; i++) {
            const pile = state.tableau[i];
            if (pile.length > 0) {
                const topCard = pile[pile.length - 1];
                if (topCard.faceUp) {
                    Object.keys(state.foundations).forEach(suit => {
                        if (this.canPlaceOnFoundation(topCard, state.foundations[suit])) {
                            moves.push({
                                type: 'tableau_to_foundation',
                                from: { source: 'tableau', index: i },
                                to: { source: 'foundation', suit: suit },
                                card: topCard,
                                priority: 1000 + topCard.value
                            });
                        }
                    });
                }
            }
        }

        // Waste to foundation moves
        if (state.waste.length > 0) {
            const topCard = state.waste[state.waste.length - 1];
            Object.keys(state.foundations).forEach(suit => {
                if (this.canPlaceOnFoundation(topCard, state.foundations[suit])) {
                    moves.push({
                        type: 'waste_to_foundation',
                        from: { source: 'waste' },
                        to: { source: 'foundation', suit: suit },
                        card: topCard,
                        priority: 900 + topCard.value
                    });
                }
            });
        }

        // Tableau to tableau moves
        for (let i = 0; i < state.tableau.length; i++) {
            const fromPile = state.tableau[i];
            if (fromPile.length > 0) {
                const topCard = fromPile[fromPile.length - 1];
                if (topCard.faceUp) {
                    for (let j = 0; j < state.tableau.length; j++) {
                        if (i !== j && this.canPlaceOnTableau(topCard, state.tableau[j])) {
                            let priority = 200;
                            // Bonus for revealing hidden cards
                            if (fromPile.length > 1 && !fromPile[fromPile.length - 2].faceUp) {
                                priority += 300;
                            }
                            // Bonus for kings to empty spaces
                            if (topCard.value === 13 && state.tableau[j].length === 0) {
                                priority += 200;
                            }
                            
                            moves.push({
                                type: 'tableau_to_tableau',
                                from: { source: 'tableau', index: i },
                                to: { source: 'tableau', index: j },
                                card: topCard,
                                priority: priority
                            });
                        }
                    }
                }
            }
        }

        // Stock draw move with AI recommendation
        if (state.stock.length > 0 || state.waste.length > 0) {
            const stockAnalysis = this.analyzeStock(state);
            moves.push({
                type: 'draw_stock',
                from: { source: 'stock' },
                to: { source: 'waste' },
                priority: stockAnalysis.shouldDraw ? 15 : 5,
                drawsNeeded: stockAnalysis.drawsNeeded || 1,
                stockRecommendation: stockAnalysis
            });
        }

        return moves;
    }

    rankMovesByPriority(moves, state) {
        return moves.sort((a, b) => b.priority - a.priority);
    }

    canPlaceOnFoundation(card, foundationPile) {
        if (foundationPile.length === 0) {
            return card.value === 1; // Ace
        }
        const topCard = foundationPile[foundationPile.length - 1];
        return topCard.suit === card.suit && topCard.value === card.value - 1;
    }

    canPlaceOnTableau(card, tableauPile) {
        if (tableauPile.length === 0) {
            return card.value === 13; // King
        }
        const topCard = tableauPile[tableauPile.length - 1];
        if (!topCard.faceUp) return false;

        const cardColor = (card.suit === '♠' || card.suit === '♣') ? 'black' : 'red';
        const topColor = (topCard.suit === '♠' || topCard.suit === '♣') ? 'black' : 'red';

        return cardColor !== topColor && card.value === topCard.value - 1;
    }

    applyMoveToState(state, move) {
        const newState = this.cloneGameState(state);

        try {
            switch (move.type) {
                case 'tableau_to_foundation':
                    const tableauPile = newState.tableau[move.from.index];
                    const card = tableauPile.pop();
                    newState.foundations[move.to.suit].push(card);
                    // Flip hidden card if revealed
                    if (tableauPile.length > 0 && !tableauPile[tableauPile.length - 1].faceUp) {
                        tableauPile[tableauPile.length - 1].faceUp = true;
                    }
                    break;

                case 'waste_to_foundation':
                    const wasteCard = newState.waste.pop();
                    newState.foundations[move.to.suit].push(wasteCard);
                    break;

                case 'tableau_to_tableau':
                    const fromPile = newState.tableau[move.from.index];
                    const toPile = newState.tableau[move.to.index];
                    const movingCard = fromPile.pop();
                    toPile.push(movingCard);
                    // Flip hidden card if revealed
                    if (fromPile.length > 0 && !fromPile[fromPile.length - 1].faceUp) {
                        fromPile[fromPile.length - 1].faceUp = true;
                    }
                    break;

                case 'draw_stock':
                    if (newState.stock.length > 0) {
                        const drawCount = Math.min(newState.drawMode || 3, newState.stock.length);
                        const drawnCards = newState.stock.splice(-drawCount);
                        newState.waste.push(...drawnCards);
                    } else if (newState.waste.length > 0) {
                        newState.stock = newState.waste.reverse();
                        newState.waste = [];
                    }
                    break;
            }
        } catch (error) {
            console.error('Error applying move in worker:', error);
            return state; // Return original state on error
        }

        return newState;
    }

    isGameWon(state) {
        return Object.values(state.foundations).every(pile => pile.length === 13);
    }

    calculateWinProbability(state) {
        let score = 0;
        
        // Foundation progress (most important)
        const foundationCards = Object.values(state.foundations).reduce((sum, pile) => sum + pile.length, 0);
        score += (foundationCards / 52) * 60;

        // Hidden cards (less is better)
        let hiddenCards = 0;
        state.tableau.forEach(pile => {
            pile.forEach(card => {
                if (!card.faceUp) hiddenCards++;
            });
        });
        score += (1 - hiddenCards / 28) * 25;

        // Empty tableau spaces
        const emptySpaces = state.tableau.filter(pile => pile.length === 0).length;
        score += (emptySpaces / 7) * 15;

        return Math.min(100, Math.max(0, score));
    }

    calculatePathConfidence(winningPath) {
        const lengthFactor = Math.max(20, 100 - winningPath.length * 2);
        const foundationMoves = winningPath.filter(move => move.type.includes('foundation')).length;
        const foundationFactor = foundationMoves * 5;
        return Math.min(95, lengthFactor + foundationFactor);
    }

    analyzeStock(state) {
        const stockCards = state.stock.length;
        const wasteCards = state.waste.length;
        const drawMode = state.drawMode || 3;
        
        if (stockCards === 0 && wasteCards === 0) {
            return {
                shouldDraw: false,
                drawsNeeded: 0,
                reason: 'No cards in stock or waste',
                priority: 'low'
            };
        }

        // Simulate upcoming cards to give specific draw recommendations
        const upcomingCards = this.simulateStockDraws(state, 10);
        const nextUsefulCard = upcomingCards.find(item => item.useful);

        const availableMoves = this.generateAllPossibleMoves(state);
        const tableauMoves = availableMoves.filter(move => 
            move.type === 'tableau_to_foundation' || move.type === 'tableau_to_tableau'
        );

        if (tableauMoves.length === 0) {
            if (nextUsefulCard) {
                return {
                    shouldDraw: true,
                    drawsNeeded: nextUsefulCard.drawNumber,
                    reason: `No tableau moves available. Draw ${nextUsefulCard.drawNumber} time${nextUsefulCard.drawNumber > 1 ? 's' : ''} to get ${nextUsefulCard.card.value}${nextUsefulCard.card.suit}`,
                    priority: 'high'
                };
            }
            return {
                shouldDraw: true,
                drawsNeeded: 1,
                reason: 'No tableau moves available, try drawing from stock',
                priority: 'high'
            };
        }

        if (tableauMoves.length < 2 && nextUsefulCard && nextUsefulCard.drawNumber <= 3) {
            return {
                shouldDraw: true,
                drawsNeeded: nextUsefulCard.drawNumber,
                reason: `Limited tableau options. Draw ${nextUsefulCard.drawNumber} time${nextUsefulCard.drawNumber > 1 ? 's' : ''} to get useful ${nextUsefulCard.card.value}${nextUsefulCard.card.suit}`,
                priority: 'medium'
            };
        }

        if (nextUsefulCard && nextUsefulCard.drawNumber <= 5) {
            return {
                shouldDraw: false,
                drawsNeeded: nextUsefulCard.drawNumber,
                reason: `Focus on ${tableauMoves.length} tableau moves first. (Useful card in ${nextUsefulCard.drawNumber} draws)`,
                priority: 'low'
            };
        }

        return {
            shouldDraw: false,
            drawsNeeded: 0,
            reason: `Focus on ${tableauMoves.length} available tableau moves first`,
            priority: 'low'
        };
    }

    simulateStockDraws(state, maxDraws) {
        const stockCopy = [...state.stock];
        const wasteCopy = [...state.waste];
        const drawMode = state.drawMode || 3;
        const upcomingCards = [];

        for (let draw = 0; draw < maxDraws && (stockCopy.length > 0 || wasteCopy.length > 0); draw++) {
            if (stockCopy.length === 0) {
                // Reset stock from waste
                stockCopy.push(...wasteCopy.reverse());
                wasteCopy.length = 0;
            }

            const cardsDrawn = stockCopy.splice(-Math.min(drawMode, stockCopy.length));
            if (cardsDrawn.length > 0) {
                const topCard = cardsDrawn[cardsDrawn.length - 1];
                upcomingCards.push({
                    card: topCard,
                    drawNumber: draw + 1,
                    useful: this.isCardUsefulInPosition(topCard, state)
                });
                wasteCopy.push(...cardsDrawn);
            }
        }

        return upcomingCards;
    }

    isCardUsefulInPosition(card, state) {
        // Check if can go to foundation
        for (const [suit, foundationPile] of Object.entries(state.foundations)) {
            if (this.canPlaceOnFoundation(card, foundationPile)) {
                return true;
            }
        }

        // Check if can go to tableau
        for (let i = 0; i < state.tableau.length; i++) {
            if (this.canPlaceOnTableau(card, state.tableau[i])) {
                return true;
            }
        }

        return false;
    }

    // Generate a strategic plan looking ahead several moves
    async generateStrategicPlan(gameState, lookAheadDepth = 5) {
        const plan = {
            immediateMove: null,
            futureSequence: [],
            reasoning: [],
            stockStrategy: null,
            analysis: ''
        };

        try {
            // Find best immediate move
            const analysis = this.analyzePosition(gameState);
            plan.immediateMove = analysis.bestMove;
            plan.stockStrategy = analysis.stockRecommendation;

            if (plan.immediateMove) {
                // Simulate the immediate move and look ahead
                const afterFirstMove = this.applyMoveToState(gameState, plan.immediateMove);
                
                // Look for follow-up opportunities
                const futureAnalysis = this.analyzePosition(afterFirstMove);
                
                if (futureAnalysis.bestMove) {
                    plan.futureSequence.push(futureAnalysis.bestMove);
                    
                    // Look one more move ahead if it's promising
                    if (futureAnalysis.bestMove.type === 'tableau_to_foundation' || 
                        this.revealsHiddenCard(futureAnalysis.bestMove, afterFirstMove)) {
                        const afterSecondMove = this.applyMoveToState(afterFirstMove, futureAnalysis.bestMove);
                        const thirdAnalysis = this.analyzePosition(afterSecondMove);
                        if (thirdAnalysis.bestMove) {
                            plan.futureSequence.push(thirdAnalysis.bestMove);
                        }
                    }
                }

                // Generate strategic reasoning
                plan.reasoning = this.generateStrategicReasoning(plan.immediateMove, plan.futureSequence, gameState);
                plan.analysis = this.generateAnalysisText(plan, gameState);
            }

        } catch (error) {
            console.error('Strategic plan generation error:', error);
            plan.analysis = 'Unable to generate strategic plan';
        }

        return plan;
    }

    generateStrategicReasoning(immediateMove, futureSequence, gameState) {
        const reasoning = [];

        if (immediateMove.type === 'tableau_to_foundation' || immediateMove.type === 'waste_to_foundation') {
            reasoning.push('Foundation building is the primary path to victory');
            if (immediateMove.card && immediateMove.card.value <= 4) {
                reasoning.push('Early foundation cards create more opportunities');
            }
        }

        if (this.revealsHiddenCard(immediateMove, gameState)) {
            reasoning.push('This move reveals a hidden card, expanding options');
        }

        if (immediateMove.card && immediateMove.card.value === 13) {
            reasoning.push('Kings to empty spaces create new building opportunities');
        }

        if (futureSequence.length > 0) {
            const foundationMoves = futureSequence.filter(m => 
                m.type === 'tableau_to_foundation' || m.type === 'waste_to_foundation'
            ).length;
            
            if (foundationMoves > 0) {
                reasoning.push(`This sequence enables ${foundationMoves} foundation move${foundationMoves > 1 ? 's' : ''}`);
            }
        }

        if (immediateMove.type === 'draw_stock') {
            const upcomingCards = this.simulateStockDraws(gameState, 5);
            const nextUseful = upcomingCards.find(item => item.useful);
            if (nextUseful) {
                reasoning.push(`Drawing reveals ${nextUseful.card.value}${nextUseful.card.suit} which can be played immediately`);
            }
        }

        return reasoning;
    }

    generateAnalysisText(plan, gameState) {
        let text = '';

        if (plan.immediateMove) {
            const moveDescription = this.describeMoveForAnalysis(plan.immediateMove);
            text += `Best move: ${moveDescription}. `;

            if (plan.reasoning.length > 0) {
                text += `Strategy: ${plan.reasoning[0]}. `;
            }

            if (plan.futureSequence.length > 0) {
                text += `This sets up ${plan.futureSequence.length} follow-up move${plan.futureSequence.length > 1 ? 's' : ''}. `;
            }

            if (plan.stockStrategy && plan.stockStrategy.shouldDraw && plan.stockStrategy.drawsNeeded > 0) {
                text += `Stock strategy: Draw ${plan.stockStrategy.drawsNeeded} time${plan.stockStrategy.drawsNeeded > 1 ? 's' : ''} when needed.`;
            }
        }

        return text || 'Continue with available moves to progress the game.';
    }

    describeMoveForAnalysis(move) {
        if (!move) return 'No move available';
        
        switch (move.type) {
            case 'tableau_to_foundation':
                return `Place ${move.card.value}${move.card.suit} on foundation`;
            case 'waste_to_foundation':
                return `Move ${move.card.value}${move.card.suit} from waste to foundation`;
            case 'tableau_to_tableau':
                return `Move ${move.card.value}${move.card.suit} to tableau`;
            case 'draw_stock':
                return 'Draw from stock pile';
            default:
                return 'Unknown move';
        }
    }
}

// Worker message handling
const aiWorker = new SolitaireAIWorker();

self.onmessage = async function(event) {
    const { type, data, requestId } = event.data;
    
    try {
        let result;
        
        switch (type) {
            case 'test':
                result = { message: 'Worker is responsive', timestamp: Date.now() };
                break;
                
            case 'analyzePosition':
                result = aiWorker.analyzePosition(data.gameState);
                break;
                
            case 'findWinningPath':
                result = await aiWorker.findWinningPath(data.gameState, data.maxDepth || 150);
                break;
                
            case 'getHint':
                const analysis = aiWorker.analyzePosition(data.gameState);
                const strategicPlan = await aiWorker.generateStrategicPlan(data.gameState, 5);
                result = {
                    bestMove: analysis.bestMove,
                    winProbability: analysis.winProbability,
                    stockRecommendation: analysis.stockRecommendation,
                    strategicPlan: strategicPlan,
                    multiMoveAnalysis: strategicPlan.analysis
                };
                break;
                
            default:
                result = { error: 'Unknown request type: ' + type };
        }
        
        self.postMessage({
            type: 'response',
            requestId,
            success: true,
            data: result
        });
        
    } catch (error) {
        self.postMessage({
            type: 'response',
            requestId,
            requestType: type,
            success: false,
            error: error.message
        });
    }
}; 