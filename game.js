canMoveToFoundation(card) {
    if (!card || !card.isFaceUp) return false;
    
    // Find the appropriate foundation pile
    const foundationPile = this.foundationPiles[card.suit];
    if (!foundationPile) return false;
    
    // If foundation is empty, only Ace can be placed
    if (foundationPile.length === 0) {
        return card.rank === 1; // Ace
    }
    
    // Get the top card of the foundation pile
    const topCard = foundationPile[foundationPile.length - 1];
    
    // Card must be same suit and one rank higher
    return card.suit === topCard.suit && card.rank === topCard.rank + 1;
}; 