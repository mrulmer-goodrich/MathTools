# 🧟‍♂️ ZOMBIE APOCALYPSE: Percent Survival

A gamified educational React application for teaching 7th grade percentages through an epic survival storyline.

---

## 📁 FILE STRUCTURE

```
zombie-apocalypse/
├── ZombieApocalypse.jsx          # Main component
├── problems.js                   # Random value generators for all 7 levels
├── components/
│   ├── PersonalizationForm.jsx   # Player data collection
│   ├── IntroSequence.jsx         # 3-screen story intro
│   ├── GameScreen.jsx            # Main gameplay component
│   ├── FactionTracker.jsx        # Visual faction tracker
│   ├── Calculator.jsx            # Draggable calculator (Level 3+)
│   ├── Notepad.jsx               # Draggable notepad (Level 4+)
│   ├── ProblemDisplay.jsx        # Problem rendering
│   ├── LevelComplete.jsx         # Level completion screen
│   ├── DeathScreen.jsx           # Death/restart screen
│   └── VictoryScreen.jsx         # Epic final victory screen
└── styles/
    └── zombie.css                # Complete styling (all classes prefixed with 'za-')
```

---

## 🎮 GAME STRUCTURE

### **7 Levels of Survival:**

1. **Level 1: The Outbreak** - Percent ↔ Decimal conversion (7 problems, 6 required, 2-minute limit)
2. **Level 2: Faction Wars Begin** - Increase/Decrease identification (7 problems, 6 required)
3. **Level 3: The Traders Fall** - Calculate amounts (6 problems, 5 required)
4. **Level 4: Scavengers Eliminated** - Final costs/prices (5 problems, 4 required)
5. **Level 5: The Fortress Falls** - Two-step problems (4 problems, 3 required)
6. **Level 6: The Engineers Fail** - Backwards problems (3 problems, 2 required)
7. **Level 7: THE FINAL CALCULATION** - One epic multi-step problem

### **Hearts System:**
- 2 hearts per level
- One wrong answer = lose 1 heart
- Two wrong answers = death → drop back one level

### **Faction Narrative:**
- 7 factions start (player + 6 others)
- Each level eliminates one faction
- Final showdown: Player vs. The Elites

---

## 🚀 INSTALLATION

### **Step 1: Add to Your Project**

Copy the entire `zombie-apocalypse` folder into your `src/modules/` directory:

```
src/
  modules/
    zombie-apocalypse/
      [all files from this package]
```

### **Step 2: Import in Your App**

In your main routing file (e.g., `App.jsx`):

```jsx
import ZombieApocalypse from './modules/zombie-apocalypse/ZombieApocalypse';

// Then in your routing:
<Route path="/zombie-apocalypse" element={<ZombieApocalypse />} />
```

### **Step 3: Add to Menu**

Add a link to `/zombie-apocalypse` in your navigation menu.

---

## 🎨 STYLING NOTES

All CSS classes are prefixed with `za-` to avoid conflicts with global styles:
- `.za-personalization`
- `.za-game-screen`
- `.za-calculator`
- etc.

The CSS file is **self-contained** and won't interfere with your existing styles.

---

## 🎯 FEATURES

### **Personalization:**
- Player name, best friend's name, city, favorite color, favorite subject, dream job, biggest fear, favorite food
- All used to personalize the story throughout

### **Random Value Generation:**
- Every playthrough is different
- Appropriate ranges for 7th grade:
  - Percents: 1%-99%
  - Tax: 1%-25%
  - Discounts: 10%-75%
  - Dollar amounts: $15-$5,000 (varies by context)
  
### **Tools:**
- **Calculator** (appears Level 3+): Draggable, basic 4-function, NO % button
- **Notepad** (appears Level 4+): Draggable scratch work area

### **Sound Effects:**
- Mutable toggle (like VaultHeist)
- Web Audio API for correct/wrong/death/victory sounds

### **No LocalStorage Saves:**
- Must complete in one session (as requested)
- Prevents cheating

---

## 🏆 VICTORY CONDITION

Complete all 7 levels to see the spectacular victory screen featuring:
- Animated particles
- Multi-phase reveal
- Stats display
- Personalized message: "This is what Mr. UG has prepared you for... sort of."

---

## 🔧 CUSTOMIZATION

### **To Change Difficulty:**

Edit `problems.js` - `levelConfig` in `GameScreen.jsx`:
```javascript
const levelConfig = {
  1: { total: 7, required: 6, timeLimit: 120 },
  // Adjust 'required' to change pass threshold
};
```

### **To Change Value Ranges:**

Edit `problems.js` - `random` object:
```javascript
const random = {
  tax: () => Math.floor(Math.random() * 25) + 1, // Currently 1-25%
  // Adjust min/max as needed
};
```

### **To Edit Story Text:**

- **IntroSequence.jsx** - Opening narrative
- **LevelComplete.jsx** - Between-level messages
- **VictoryScreen.jsx** - Final victory message

---

## 📊 TEACHER DASHBOARD

Currently displays:
- Student name (from personalization)
- Current level
- Total time
- Total deaths

**Future Enhancement:** Could add localStorage tracking per student for classroom overview.

---

## 🐛 KNOWN LIMITATIONS

1. **No mobile optimization** - Designed for Chromebooks only
2. **No save system** - Must complete in one session
3. **Answer tolerance** - ±$0.02 for rounding (adjust in `GameScreen.jsx` if needed)

---

## 🎓 EDUCATIONAL ALIGNMENT

### **Standards Covered:**
- 7.RP.3: Use proportional relationships to solve multistep ratio and percent problems
- Percent-decimal conversion
- Percent increase/decrease
- Commission, tax, tips, discounts, markups
- Simple interest
- Multi-step problems
- Backwards/reverse problems

### **Scaffolded Learning:**
- Progresses from conceptual (increase/decrease) to procedural (calculations) to complex (multi-step/backwards)
- Discussion-style prompts encourage metacognition
- Immediate feedback with consequences (hearts system)

---

## 💡 TIPS FOR IMPLEMENTATION

1. **Test thoroughly** - Play through once yourself to catch any bugs
2. **Explain the hearts system** - Students need to understand they get ONE mistake per level
3. **Emphasize rounding** - Answers must be exact (e.g., "$45.67" not "$45.7")
4. **Encourage notepad use** - Many students forget intermediate calculations
5. **Celebrate victories** - The final screen is designed to be EPIC - let kids enjoy it!

---

## 📞 SUPPORT

For questions or issues:
- Check that all files are in correct directories
- Verify imports match your project structure
- Ensure React and dependencies are up to date

---

## 🎉 HAVE FUN!

This game was designed to be engaging, challenging, and educational. Students should feel accomplished when they beat it!

**"This is what Mr. UG has prepared you for... sort of."** 😄

---

**Created by:** UG Math Tools  
**Version:** 1.0  
**Last Updated:** November 29, 2024
