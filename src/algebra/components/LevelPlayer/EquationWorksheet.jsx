/ EquationWorksheet.jsx - CLEAN WORKING VERSION
// Location: src/algebra/components/LevelPlayer/EquationWorksheet.jsx

import React, { useState, useEffect } from 'react';
import '../../styles/algebra.css';

const EquationWorksheet = ({
problem,
onComplete,
onWrongAnswer
}) => {
const [currentRowIndex, setCurrentRowIndex] = useState(0);
const [completedRows, setCompletedRows] = useState([]);
const [selectedTerms, setSelectedTerms] = useState({});
const [showVerticalLine, setShowVerticalLine] = useState(false);
const [showFinalAnswer, setShowFinalAnswer] = useState(false);

useEffect(() => {
setCurrentRowIndex(0);
setCompletedRows([]);
setSelectedTerms({});
setShowVerticalLine(false);
setShowFinalAnswer(false);
}, [problem]);

if (!problem.staged || !problem.staged.rows) {
console.error('EquationWorksheet: Invalid staged structure', problem);
return <div className="error">Problem structure invalid</div>;
}

const rows = problem.staged.rows;
const currentRow = rows[currentRowIndex];
const isFinalRow = currentRowIndex === rows.length - 1;
const currentSelections = selectedTerms[currentRow.id] || [];

const stripLeadingPlusForDisplay = (term) => {
const str = String(term).trim();
if (str.startsWith('+') && !str.includes('×') && !str.includes('÷')) {
return str.substring(1);
}
return str;
};

const normalizeForComparison = (term) => {
const str = String(term).trim();
if (str.startsWith('+')) {
return str.substring(1);
}
return str;
};

const formatTermBankDisplay = (term) => {
const str = String(term).trim();
if (str.startsWith('+') || str.startsWith('-')) return str;
if (str.includes(' ')) return str;
if (str.includes('×') || str.includes('÷')) return str;
return '+' + str;
};

const parseProblem = (problemStr) => {
const parts = problemStr.split('=');
if (parts.length !== 2) return { left: problemStr, right: '' };
return {
left: parts[0].trim(),
right: parts[1].trim()
};
};

const problemParts = parseProblem(problem.displayProblem || problem.problem);

const handleDrawLine = () => {
setShowVerticalLine(true);
setCompletedRows(prev => [...prev, currentRow.id]);
setTimeout(() => {
setCurrentRowIndex(prev => prev + 1);
}, 300);
};

const handleBankChipClick = (chip) => {
const rowId = currentRow.id;
const current = selectedTerms[rowId] || [];
const totalBlanks = (currentRow.leftBlanks || 0) + (currentRow.rightBlanks || 0);

if (current.length < totalBlanks) {
setSelectedTerms(prev => ({
...prev,
[rowId]: [...current, chip]
}));
}
};

const handleBlankClick = (index) => {
const rowId = currentRow.id;
const current = selectedTerms[rowId] || [];

setSelectedTerms(prev => ({
...prev,
[rowId]: current.filter((_, i) => i !== index)
}));
};

const handleCheckRow = () => {
const rowId = currentRow.id;
const selected = selectedTerms[rowId] || [];

if (currentRow.type === 'dual_box') {
const leftBlanks = currentRow.leftBlanks || 0;
const leftSelected = selected.slice(0, leftBlanks).map(normalizeForComparison);
const rightSelected = selected.slice(leftBlanks).map(normalizeForComparison);

const leftExpected = currentRow.expectedLeft.map(normalizeForComparison);
const rightExpected = currentRow.expectedRight.map(normalizeForComparison);

const leftCorrect =
leftSelected.length === leftExpected.length &&
leftSelected.every((term, idx) => term === leftExpected[idx]);

const rightCorrect =
rightSelected.length === rightExpected.length &&
rightSelected.every((term, idx) => term === rightExpected[idx]);

if (leftCorrect && rightCorrect) {
setCompletedRows(prev => [...prev, rowId]);

if (isFinalRow) {
setShowFinalAnswer(true);
setTimeout(() => {
onComplete();
}, 1500);
} else {
setTimeout(() => {
setCurrentRowIndex(prev => prev + 1);
}, 300);
}
} else {
const userAnswerLeft = leftSelected.join(' ');
const userAnswerRight = rightSelected.join(' ');
const correctAnswerLeft = leftExpected.join(' ');
const correctAnswerRight = rightExpected.join(' ');

onWrongAnswer({
userAnswer: userAnswerLeft + ' = ' + userAnswerRight,
correctAnswer: correctAnswerLeft + ' = ' + correctAnswerRight,
originalProblem: problem.displayProblem || problem.problem,
rowInstruction: currentRow.instruction
});

setSelectedTerms(prev => ({
...prev,
[rowId]: []
}));
}
}
};

const isRowFilled = () => {
if (currentRow.type === 'single_choice') return true;
if (currentRow.type === 'dual_box') {
const totalBlanks = (currentRow.leftBlanks || 0) + (currentRow.rightBlanks || 0);
return currentSelections.length === totalBlanks;
}
return false;
};

const getCompletedRowsDisplay = () => {
return rows
.filter((row, idx) => idx > 0 && completedRows.includes(row.id))
.map(row => {
const rowSelections = selectedTerms[row.id] || [];
const leftBlanks = row.leftBlanks || 0;
const leftTerms = rowSelections.slice(0, leftBlanks);
const rightTerms = rowSelections.slice(leftBlanks);
const isOperationRow = row.id.includes('row1');

return {
left: leftTerms.map(t => isOperationRow ? t : stripLeadingPlusForDisplay(t)).join(' '),
right: rightTerms.map(t => isOperationRow ? t : stripLeadingPlusForDisplay(t)).join(' '),
isOperationRow
};
});
};

return (
<div className="equation-mode-container">
<div className="equation-content-wrapper">
{showVerticalLine && (
<div className="equation-vertical-line" />
)}

<div className="equation-problem-container">
<div className="equation-row-3col">
<div className="equation-left-side">{problemParts.left}</div>
<div className="equation-equals-col-centered">=</div>
<div className="equation-right-side">{problemParts.right}</div>
</div>

{getCompletedRowsDisplay().map((row, idx) => (
<div
key={idx}
className={'equation-row-3col equation-completed-row' + (row.isOperationRow ? ' operation-row' : ' solution-row')}
>
<div className="equation-left-side">{row.left}</div>
<div className="equation-equals-col-centered">=</div>
<div className="equation-right-side">{row.right}</div>
</div>
))}
</div>

<div className="equation-work-area">
{rows.map((row, index) => {
const isCompleted = completedRows.includes(row.id);
const isActive = index === currentRowIndex;
const isLocked = index > currentRowIndex;

if (isLocked) return null;
if (isCompleted && row.type !== 'single_choice') return null;

return (
<div
key={row.id}
className={'equation-work-row' + (isActive ? ' active' : '')}
>
{row.type === 'single_choice' && isActive && !isCompleted && (
<div className="equation-single-choice-compact">
<div className="equation-instruction">{row.instruction}</div>
{row.choices.map((choice, idx) => (
<button
key={idx}
className="equation-draw-line-btn"
onClick={handleDrawLine}
>
{choice}
</button>
))}
</div>
)}

{row.type === 'dual_box' && isActive && !isCompleted && (
<div className="equation-row-4col">
<div className="equation-left-side">
{Array.from({ length: row.leftBlanks || 0 }).map((_, i) => {
const term = currentSelections[i];
const isOperationRow = row.id.includes('row1');
return (
<button
key={'left-' + i}
className={'equation-blank' + (term ? ' filled' : ' empty')}
onClick={() => term && handleBlankClick(i)}
>
{term ? (isOperationRow ? term : stripLeadingPlusForDisplay(term)) : '___'}
</button>
);
})}
</div>

<div className="equation-equals-col-centered">=</div>

<div className="equation-right-side">
{Array.from({ length: row.rightBlanks || 0 }).map((_, i) => {
const leftBlanks = row.leftBlanks || 0;
const term = currentSelections[leftBlanks + i];
const isOperationRow = row.id.includes('row1');
return (
<button
key={'right-' + i}
className={'equation-blank' + (term ? ' filled' : ' empty')}
onClick={() => term && handleBlankClick(leftBlanks + i)}
>
{term ? (isOperationRow ? term : stripLeadingPlusForDisplay(term)) : '___'}
</button>
);
})}
</div>

<div className="equation-check-col">
{isRowFilled() && !showFinalAnswer && (
<button
className="equation-check-btn"
onClick={handleCheckRow}
>
{isFinalRow ? '✓ Submit' : '✓ Check'}
</button>
)}
</div>
</div>
)}
</div>
);
})}
</div>
</div>

{!completedRows.includes(currentRow.id) && currentRow.bank && currentRow.bank.length > 0 && (
<div className="equation-term-bank">
<div className="term-bank-label">{currentRow.instruction || 'Select term to place:'}</div>
<div className="term-bank-grid-even">
{currentRow.bank.map((chip, index) => {
const isSelected = currentSelections.includes(chip);
const totalBlanks = (currentRow.leftBlanks || 0) + (currentRow.rightBlanks || 0);

return (
<button
key={index}
className={'term-chip' + (isSelected ? ' selected' : '')}
onClick={() => handleBankChipClick(chip)}
disabled={currentSelections.length >= totalBlanks}
>
{formatTermBankDisplay(chip)}
</button>
);
})}
</div>
</div>
)}
</div>
);
};

export default EquationWorksheet;
