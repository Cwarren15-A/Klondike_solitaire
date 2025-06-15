/**
 * Solver Worker for Klondike Solitaire
 * Implements backtracking algorithm to determine solvability and find optimal moves
 * Based on solitaired_ai_steps.md specification
 */

class KlondikeSolver {
    constructor() {
        this.maxDepth = 200;
        this.maxTime = 10000; // 10 seconds max
        this.visitedStates = new Set();
    }

    /**
     * Main solver function - returns { solvable, bestMoves, minMoves }
     */
    solve(gameState, maxDepth = 200) {
        console.log('🔍 Starting Klondike solver...');
        const startTime = Date.now();
        
        this.maxDepth = maxDepth;
        this.visitedStates.clear();
        
        try {
            const result = this.search(gameState, [], 0, startTime);
            
            if (result.solvable) {
                console.log(`✅ Game is solvable in ${result.bestMoves.length} moves`);
                return {
                    solvable: true,
                    bestMoves: result.bestMoves,
                    minMoves: result.bestMoves.length
                };
            } else {
                console.log('❌ Game appears unsolvable or timeout reached');
                return {
                    solvable: false,
                    bestMoves: [],
                    minMoves: -1
                };
            }
        } catch (error) {
            console.error('❌ Solver error:', error);
            return {
                solvable: false,
                bestMoves: [],
                minMoves: -1,
                error: error.message
            };
        }
    }

    /**
     * Recursive backtracking search
     */
    search(gameState, moveSequence, depth, startTime) {
        // Time limit check
        if (Date.now() - startTime > this.maxTime) {
            return { solvable: false, bestMoves: [] };
        }

        // Depth limit check
        if (depth >= this.maxDepth) {
            return { solvable: false, bestMoves: [] };
        }

        // Win condition check
        if (this.isGameWon(gameState)) {
            return { solvable: true, bestMoves: moveSequence };
        }

        // State cycle detection
        const stateHash = this.hashGameState(gameState);
        if (this.visitedStates.has(stateHash)) {
            return { solvable: false, bestMoves: [] };
        }
        this.visitedStates.add(stateHash);

        // Generate and try all possible moves
        const possibleMoves = this.generateAllMoves(gameState);
        const rankedMoves = this.rankMoves(possibleMoves, gameState);

        for (const move of rankedMoves) {
            const newState = this.applyMove(gameState, move);
            if (newState) {
                const result = this.search(
                    newState, 
                    [...moveSequence, move], 
                    depth + 1, 
                    startTime
                );
                
                if (result.solvable) {
                    return result;
                }
            }
        }

        // Remove from visited states to allow different paths
        this.visitedStates.delete(stateHash);
        return { solvable: false, bestMoves: [] };
    }

    /**
     * Check if game is won (all cards in foundations)
     */
    isGameWon(gameState) {
        const foundationCount = Object.values(gameState.foundations)
            .reduce((sum, pile) => sum + pile.length, 0);
        return foundationCount === 52;
    }

    /**
     * Generate all possible moves from current state
     */
    generateAllMoves(gameState) {
        const moves = [];

        // Stock to waste moves
        if (gameState.stock.length > 0) {
            moves.push({ type: 'stock_to_waste', from: 'stock', to: 'waste' });
        }

        // Waste to foundation moves
        if (gameState.waste.length > 0) {
            const wasteCard = gameState.waste[gameState.waste.length - 1];
            if (this.canPlaceOnFoundation(wasteCard, gameState.foundations)) {
                moves.push({
                    type: 'waste_to_foundation',
                    from: 'waste',
                    to: wasteCard.suit,
                    card: wasteCard
                });
            }
        }

        // Waste to tableau moves
        if (gameState.waste.length > 0) {
            const wasteCard = gameState.waste[gameState.waste.length - 1];
            for (let col = 0; col < 7; col++) {
                if (this.canPlaceOnTableau(wasteCard, gameState.tableau[col])) {
                    moves.push({
                        type: 'waste_to_tableau',
                        from: 'waste',
                        to: col,
                        card: wasteCard
                    });
                }
            }
        }

        // Tableau to foundation moves
        for (let col = 0; col < 7; col++) {
            const pile = gameState.tableau[col];
            if (pile.length > 0) {
                const topCard = pile[pile.length - 1];
                if (topCard.faceUp && this.canPlaceOnFoundation(topCard, gameState.foundations)) {
                    moves.push({
                        type: 'tableau_to_foundation',
                        from: col,
                        to: topCard.suit,
                        card: topCard
                    });
                }
            }
        }

        // Tableau to tableau moves
        for (let fromCol = 0; fromCol < 7; fromCol++) {
            const fromPile = gameState.tableau[fromCol];
            if (fromPile.length === 0) continue;

            // Find sequences of face-up cards that can be moved
            const faceUpCards = [];
            for (let i = fromPile.length - 1; i >= 0; i--) {
                if (fromPile[i].faceUp) {
                    faceUpCards.unshift(fromPile[i]);
                } else {
                    break;
                }
            }

            for (let seqLen = 1; seqLen <= faceUpCards.length; seqLen++) {
                const cardToMove = faceUpCards[0];
                
                for (let toCol = 0; toCol < 7; toCol++) {
                    if (fromCol === toCol) continue;
                    
                    if (this.canPlaceOnTableau(cardToMove, gameState.tableau[toCol])) {
                        moves.push({
                            type: 'tableau_to_tableau',
                            from: fromCol,
                            to: toCol,
                            card: cardToMove,
                            sequenceLength: seqLen
                        });
                    }
                }
            }
        }

        return moves;
    }

    /**
     * Rank moves by strategic value (foundation > reveal > sequence building)
     */
    rankMoves(moves, gameState) {
        return moves.sort((a, b) => {
            const scoreA = this.getMoveScore(a, gameState);
            const scoreB = this.getMoveScore(b, gameState);
            return scoreB - scoreA; // Higher score first
        });
    }

    /**
     * Score moves for ranking
     */
    getMoveScore(move, gameState) {
        let score = 0;

        // Foundation moves are highest priority
        if (move.type.includes('foundation')) {
            score += 1000;
            // Lower cards get higher priority
            if (move.card) {
                score += (14 - move.card.value) * 10;
            }
        }

        // Moves that reveal cards
        if (move.type === 'tableau_to_foundation' || move.type === 'tableau_to_tableau') {
            const fromPile = gameState.tableau[move.from];
            if (fromPile && fromPile.length > 1) {
                const cardBelow = fromPile[fromPile.length - 2];
                if (!cardBelow.faceUp) {
                    score += 500; // Reveals hidden card
                }
            }
        }

        // King to empty column
        if (move.card && move.card.value === 13 && 
            gameState.tableau[move.to] && gameState.tableau[move.to].length === 0) {
            score += 300;
        }

        return score;
    }

    /**
     * Apply move to game state (returns new state or null if invalid)
     */
    applyMove(gameState, move) {
        const newState = this.cloneGameState(gameState);

        try {
            switch (move.type) {
                case 'stock_to_waste':
                    if (newState.stock.length > 0) {
                        const card = newState.stock.pop();
                        newState.waste.push(card);
                    }
                    break;

                case 'waste_to_foundation':
                    if (newState.waste.length > 0) {
                        const card = newState.waste.pop();
                        newState.foundations[move.to].push(card);
                    }
                    break;

                case 'waste_to_tableau':
                    if (newState.waste.length > 0) {
                        const card = newState.waste.pop();
                        newState.tableau[move.to].push(card);
                    }
                    break;

                case 'tableau_to_foundation':
                    const fromPile = newState.tableau[move.from];
                    if (fromPile.length > 0) {
                        const card = fromPile.pop();
                        newState.foundations[move.to].push(card);
                        
                        // Flip next card if it exists and is face down
                        if (fromPile.length > 0 && !fromPile[fromPile.length - 1].faceUp) {
                            fromPile[fromPile.length - 1].faceUp = true;
                        }
                    }
                    break;

                case 'tableau_to_tableau':
                    const sourcePile = newState.tableau[move.from];
                    const targetPile = newState.tableau[move.to];
                    const seqLen = move.sequenceLength || 1;
                    
                    if (sourcePile.length >= seqLen) {
                        const cardsToMove = sourcePile.splice(-seqLen);
                        targetPile.push(...cardsToMove);
                        
                        // Flip next card if it exists and is face down
                        if (sourcePile.length > 0 && !sourcePile[sourcePile.length - 1].faceUp) {
                            sourcePile[sourcePile.length - 1].faceUp = true;
                        }
                    }
                    break;

                default:
                    return null;
            }

            return newState;
        } catch (error) {
            return null;
        }
    }

    /**
     * Check if card can be placed on foundation
     */
    canPlaceOnFoundation(card, foundations) {
        const foundationPile = foundations[card.suit];
        if (!foundationPile) return false;

        if (foundationPile.length === 0) {
            return card.value === 1; // Ace
        }

        const topCard = foundationPile[foundationPile.length - 1];
        return card.value === topCard.value + 1;
    }

    /**
     * Check if card can be placed on tableau pile
     */
    canPlaceOnTableau(card, pile) {
        if (pile.length === 0) {
            return card.value === 13; // King only
        }

        const topCard = pile[pile.length - 1];
        if (!topCard.faceUp) return false;

        const isOppositeColor = (card.suit === '♠' || card.suit === '♣') !== 
                               (topCard.suit === '♠' || topCard.suit === '♣');
        
        return isOppositeColor && card.value === topCard.value - 1;
    }

    /**
     * Create hash for game state (for cycle detection)
     */
    hashGameState(gameState) {
        const tableau = gameState.tableau.map(pile => 
            pile.map(card => `${card.value}${card.suit}${card.faceUp ? 'U' : 'D'}`).join(',')
        ).join('|');
        
        const foundations = Object.entries(gameState.foundations)
            .map(([suit, pile]) => `${suit}:${pile.length}`)
            .join(',');
        
        const waste = gameState.waste.length > 0 ? 
            gameState.waste[gameState.waste.length - 1].value + gameState.waste[gameState.waste.length - 1].suit : 
            'empty';
        
        return `T:${tableau}|F:${foundations}|W:${waste}|S:${gameState.stock.length}`;
    }

    /**
     * Deep clone game state
     */
    cloneGameState(gameState) {
        return {
            tableau: gameState.tableau.map(pile => pile.map(card => ({ ...card }))),
            foundations: Object.fromEntries(
                Object.entries(gameState.foundations).map(([suit, pile]) => 
                    [suit, pile.map(card => ({ ...card }))]
                )
            ),
            stock: gameState.stock.map(card => ({ ...card })),
            waste: gameState.waste.map(card => ({ ...card })),
            moves: [...(gameState.moves || [])],
            startTs: gameState.startTs
        };
    }
}

// Worker message handling
self.onmessage = function(e) {
    const { action, gameState, maxDepth } = e.data;
    
    if (action === 'solve') {
        const solver = new KlondikeSolver();
        const result = solver.solve(gameState, maxDepth);
        
        self.postMessage({
            action: 'solve_result',
            result: result
        });
    }
}; 