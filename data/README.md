# Klondike Solitaire Learning Data

This directory contains the persistent learning data that powers the AI system's continuous improvement.

## 📊 How It Works

### Automatic Learning
- **Every game** (win or loss) is automatically recorded with anonymized patterns
- **AI weights adapt** based on successful vs unsuccessful strategies
- **Move effectiveness** is tracked across different game difficulties
- **Strategic patterns** are identified and reinforced

### Data Storage
- **Local Storage**: Recent games stored in browser localStorage
- **IndexedDB**: Larger datasets stored locally with IndexedDB
- **Remote Storage**: Aggregated learning data stored in this GitHub repository

### Privacy & Anonymization
- ✅ **No personal information** is stored
- ✅ **Game patterns only** - move sequences, timing, effectiveness
- ✅ **Anonymized analytics** - win rates, strategic insights
- ✅ **No identifying data** - random IDs only

## 🔄 Data Updates

### Automatic Generation
Every 25 games, the system generates a downloadable learning data export:
- Check browser Downloads folder for `solitaire-learning-data-[timestamp].json`
- These files contain the latest anonymized learning patterns

### Manual GitHub Updates
To update the shared learning data:

1. **Download** the generated learning data file from your browser
2. **Replace** `learning-data.json` with the new file
3. **Commit** the changes to GitHub
4. **Deploy** - GitHub Pages will automatically update

### File Structure
```
data/
├── learning-data.json     # Main learning database
├── README.md             # This file
└── [future files]        # Additional learning modules
```

## 🧠 Learning Capabilities

### What the AI Learns
- **Opening strategies** that lead to wins vs losses
- **Mid-game tactics** that improve success rates  
- **Endgame optimizations** for difficult positions
- **Stock management** patterns and timing
- **Foundation building** optimal sequences

### Adaptive Improvements
- **Foundation Priority**: Learns when to prioritize foundation moves
- **Revealing Bonus**: Adapts card-revealing strategy effectiveness
- **Sequence Building**: Optimizes tableau building patterns
- **Stock Draw Penalty**: Learns optimal stock cycling strategies

### Performance Tracking
- **Win Rate Trends**: Tracks improvement over time
- **Strategy Effectiveness**: Identifies best approaches
- **Difficulty Analysis**: Adapts to different game complexities
- **Failure Pattern Recognition**: Learns from common mistakes

## 📈 Analytics Dashboard

The system tracks:
- Total games analyzed
- Overall win rate improvements
- Most effective strategies by difficulty
- Common failure points and solutions
- Learning progress metrics

## 🔧 Technical Details

### Data Format
```json
{
  "version": "4.0",
  "metadata": {
    "totalGamesPlayed": 0,
    "totalGamesWon": 0,
    "winRate": 0,
    "lastUpdated": 1234567890
  },
  "adaptiveWeights": {
    "foundationPriority": 1.0,
    "revealingBonus": 1.0,
    "sequenceBuilding": 1.0,
    "stockDrawPenalty": 1.0
  }
}
```

### Storage Hierarchy
1. **IndexedDB** (unlimited) - Complete game history
2. **localStorage** (5-10MB) - Recent games and patterns  
3. **GitHub Pages** (unlimited) - Shared learning database
4. **Auto-downloads** - Periodic exports for manual upload

## 🚀 Benefits

### For Players
- **Smarter AI hints** that improve over time
- **Personalized strategies** based on learning data
- **Better auto-solve** performance with experience
- **Difficulty-aware** recommendations

### For the Community  
- **Shared learning** benefits all players
- **Continuous improvement** of AI algorithms
- **Anonymous contribution** to game intelligence
- **Open source** learning system

## 🔮 Future Enhancements

### Planned Features
- **Pattern recognition** for specific card combinations
- **Seasonal strategy** adaptation
- **Advanced difficulty** assessment
- **Cross-game learning** between different solitaire variants

### Community Contributions
- Learning data can be shared anonymously
- Strategic insights emerge from collective gameplay
- AI improvements benefit all players
- Open source development welcomed

---

*This learning system respects privacy while enabling continuous AI improvement through anonymous gameplay pattern analysis.* 