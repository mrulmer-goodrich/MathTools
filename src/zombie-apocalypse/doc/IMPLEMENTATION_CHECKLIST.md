# 🚀 ZOMBIE APOCALYPSE - QUICK IMPLEMENTATION CHECKLIST

## ✅ **Pre-Flight Check**

Before you start, make sure you have:
- [ ] React project set up
- [ ] Router configured (React Router)
- [ ] All files downloaded from outputs folder

---

## 📂 **Step 1: Copy Files**

Copy the entire `zombie-apocalypse` folder to your project:

```
src/modules/zombie-apocalypse/
```

**Verify all files are present:**
- [ ] ZombieApocalypse.jsx
- [ ] problems.js  
- [ ] components/ (10 files)
- [ ] styles/zombie.css
- [ ] README.md

---

## 🔧 **Step 2: Add Route**

In your main `App.jsx` (or routing file):

```jsx
import ZombieApocalypse from './modules/zombie-apocalypse/ZombieApocalypse';

// In your routes:
<Route path="/zombie-apocalypse" element={<ZombieApocalypse />} />
```

- [ ] Import added
- [ ] Route added
- [ ] Path works (test in browser)

---

## 🎮 **Step 3: Test Play**

Run through the game to verify:

### **Personalization Form:**
- [ ] All fields display correctly
- [ ] Form submits and advances to intro

### **Intro Sequence:**
- [ ] 3 screens display
- [ ] Story text appears with animations
- [ ] Personalized data shows correctly
- [ ] Skip button works
- [ ] Continue buttons work

### **Level 1:**
- [ ] 7 problems appear
- [ ] Timer counts down from 2:00
- [ ] Correct answer advances
- [ ] Wrong answer loses heart
- [ ] 6 correct = level complete
- [ ] Time runs out = death

### **Level 2:**
- [ ] Multiple choice buttons work
- [ ] Problems have "increase" or "decrease"
- [ ] Correct advances
- [ ] Wrong loses heart

### **Level 3:**
- [ ] Calculator appears
- [ ] Calculator is draggable
- [ ] Free response input works
- [ ] Submit button works

### **Level 4:**
- [ ] Notepad appears
- [ ] Notepad is draggable
- [ ] Can type in notepad
- [ ] Clear button works

### **Level 5-6:**
- [ ] Problems display correctly
- [ ] Calculator + Notepad both work

### **Level 7:**
- [ ] ONE problem displays
- [ ] Problem is complex/multi-step
- [ ] Correct answer triggers victory

### **Victory Screen:**
- [ ] Animations play
- [ ] Stats display
- [ ] Final message shows
- [ ] "This is what Mr. UG..." appears
- [ ] Play Again button works

### **Death/Restart:**
- [ ] Wrong answers lose hearts
- [ ] 2 wrong = death screen
- [ ] Death drops back one level
- [ ] Game restarts at correct level

### **Sound:**
- [ ] Sounds play (or don't if muted)
- [ ] Toggle button works

---

## 🐛 **Common Issues & Fixes**

### **Issue: Components not rendering**
✅ **Fix:** Check import paths match your folder structure

### **Issue: CSS not applying**
✅ **Fix:** Verify `zombie.css` is imported in `ZombieApocalypse.jsx`

### **Issue: Calculator/Notepad not draggable**
✅ **Fix:** Make sure `position: fixed` isn't being overridden by global CSS

### **Issue: Random values seem wrong**
✅ **Fix:** Check `problems.js` random ranges - adjust if needed

### **Issue: Victory screen doesn't show**
✅ **Fix:** Verify Level 7 answer is exactly correct (including decimals)

---

## 🎯 **Final Verification**

Before showing to students:

- [ ] Play through entire game once
- [ ] Test with different personalization data
- [ ] Verify all 7 levels work
- [ ] Check victory screen displays
- [ ] Test death/restart flow
- [ ] Confirm calculator works on all operations
- [ ] Verify notepad saves during session
- [ ] Sound toggle functions correctly

---

## 🎓 **Student Instructions Template**

```
ZOMBIE APOCALYPSE: Percent Survival

OBJECTIVE: Survive all 7 levels by solving percentage problems correctly.

RULES:
• You have 2 hearts per level
• One wrong answer = lose 1 heart  
• Two wrong answers = death (restart previous level)
• Use calculator (Level 3+) and notepad (Level 4+) to help
• Level 1 has a 2-minute time limit!
• Round all money answers to nearest cent (e.g., $45.67)

TIPS:
• Read carefully - is it asking for discount AMOUNT or SALE PRICE?
• Use the notepad to save your work between steps
• The calculator doesn't have a % button - you must convert yourself
• If you die, you go back ONE level (not to the beginning)

VICTORY: Complete Level 7 to save the city!
```

---

## ✨ **You're Ready to Deploy!**

Once all checkboxes are complete, the game is ready for your students.

**Good luck surviving the apocalypse!** 🧟‍♂️🔢
