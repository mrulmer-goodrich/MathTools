// problems.js
// This file contains all 60 problems across 6 sets
// Replace sample data with your actual problem images and answers after review

export const problemSets = {
  // ========================================
// SETS 1, 2, 3 - COMPLETE FIXES
// ========================================
// Set 1: Decimals → Fractions, 3-strike rule (instant reset on ANY error)
// Set 2: Remove letter labels from choices (just numbers)
// Set 3: Problem 2 changed to Square, Problem 1 with bigger size difference

  set1: {
    id: 1,
    title: "Visual Scale Factor",
    description: "Circle the correct scale factor. Original is on the LEFT. ⚠️ NO MISTAKES ALLOWED!",
    type: "multiple-choice",
    questionPrompt: "Scale Factor?",
    codeSequence: ['1', 'h', '3', '@', 'r', 't', 'm', '@', 't', 'h'],
    strictMode: true, // NEW: Any wrong answer = instant 3 strikes
    problems: [
      {
        id: 1,
        originalImage: "/assets/set1_p1_orig.png",
        copyImage: "/assets/set1_p1_copy.png",
        choices: ["1/2", "2"],
        correctAnswer: "2"
      },
      {
        id: 2,
        originalImage: "/assets/set1_p2_orig.png",
        copyImage: "/assets/set1_p2_copy.png",
        choices: ["3/4", "4/3"],
        correctAnswer: "3/4"
      },
      {
        id: 3,
        originalImage: "/assets/set1_p3_orig.png",
        copyImage: "/assets/set1_p3_copy.png",
        choices: ["1/4", "4"],
        correctAnswer: "1/4"
      },
      {
        id: 4,
        originalImage: "/assets/set1_p4_orig.png",
        copyImage: "/assets/set1_p4_copy.png",
        choices: ["1/3", "3"],
        correctAnswer: "3"
      },
      {
        id: 5,
        originalImage: "/assets/set1_p5_orig.png",
        copyImage: "/assets/set1_p5_copy.png",
        choices: ["4/5", "5/4"],
        correctAnswer: "4/5"
      },
      {
        id: 6,
        originalImage: "/assets/set1_p6_orig.png",
        copyImage: "/assets/set1_p6_copy.png",
        choices: ["1", "2"],
        correctAnswer: "1"
      },
      {
        id: 7,
        originalImage: "/assets/set1_p7_orig.png",
        copyImage: "/assets/set1_p7_copy.png",
        choices: ["2/3", "3/2"],
        correctAnswer: "3/2"
      },
      {
        id: 8,
        originalImage: "/assets/set1_p8_orig.png",
        copyImage: "/assets/set1_p8_copy.png",
        choices: ["1/2", "2"],
        correctAnswer: "1/2"
      },
      {
        id: 9,
        originalImage: "/assets/set1_p9_orig.png",
        copyImage: "/assets/set1_p9_copy.png",
        choices: ["3/10", "10/3"],
        correctAnswer: "3/10"
      },
      {
        id: 10,
        originalImage: "/assets/set1_p10_orig.png",
        copyImage: "/assets/set1_p10_copy.png",
        choices: ["1/2", "2"],
        correctAnswer: "2"
      }
    ]
  },

  set2: {
    id: 2,
    title: "Calculate Scale Factor",
    description: "One measurement on the original and one on the copy. Choose the correct scale factor (copy ÷ original).",
    type: "multiple-choice",
    questionPrompt: "What is the scale factor?",
    codeSequence: ['R', '.', 'U', '.', 'h', 'A', 'p', 'p', 'Y', '?'],
    problems: [
      {
        id: 1,
        originalImage: "/assets/set2_p1_orig.png",
        copyImage: "/assets/set2_p1_copy.png",
        choices: ["7", "28", "4", "1/4"],
        correctAnswer: "4"
      },
      {
        id: 2,
        originalImage: "/assets/set2_p2_orig.png",
        copyImage: "/assets/set2_p2_copy.png",
        choices: ["1/5", "5", "15", "3"],
        correctAnswer: "1/5"
      },
      {
        id: 3,
        originalImage: "/assets/set2_p3_orig.png",
        copyImage: "/assets/set2_p3_copy.png",
        choices: ["18", "2", "9", "1/9"],
        correctAnswer: "9"
      },
      {
        id: 4,
        originalImage: "/assets/set2_p4_orig.png",
        copyImage: "/assets/set2_p4_copy.png",
        choices: ["12", "6", "1/2", "2"],
        correctAnswer: "1/2"
      },
      {
        id: 5,
        originalImage: "/assets/set2_p5_orig.png",
        copyImage: "/assets/set2_p5_copy.png",
        choices: ["3", "1/3", "8", "24"],
        correctAnswer: "3"
      },
      {
        id: 6,
        originalImage: "/assets/set2_p6_orig.png",
        copyImage: "/assets/set2_p6_copy.png",
        choices: ["5", "15", "1/3", "3"],
        correctAnswer: "1/3"
      },
      {
        id: 7,
        originalImage: "/assets/set2_p7_orig.png",
        copyImage: "/assets/set2_p7_copy.png",
        choices: ["7", "1/7", "3", "21"],
        correctAnswer: "7"
      },
      {
        id: 8,
        originalImage: "/assets/set2_p8_orig.png",
        copyImage: "/assets/set2_p8_copy.png",
        choices: ["1/6", "6", "18", "3"],
        correctAnswer: "1/6"
      },
      {
        id: 9,
        originalImage: "/assets/set2_p9_orig.png",
        copyImage: "/assets/set2_p9_copy.png",
        choices: ["4", "20", "5", "1/5"],
        correctAnswer: "5"
      },
      {
        id: 10,
        originalImage: "/assets/set2_p10_orig.png",
        copyImage: "/assets/set2_p10_copy.png",
        choices: ["1/4", "4", "16", "4/1"],
        correctAnswer: "1/4"
      }
    ]
  },

  set3: {
    id: 3,
    title: "Find Missing Side Length",
    description: "Find the missing measurement on the copy. Use the scale factor!",
    type: "multiple-choice",
    questionPrompt: "What is the missing side length?",
    codeSequence: ['P', '3', 'r', 's', '3', 'v', '3', 'r', '3', '!'],
    problems: [
      // P1: SF=2, Triangle, Orig 5,8 → Copy 10,16 (FIXED: more size difference)
      {
        id: 1,
        originalImage: "/assets/set3_p1_orig.png",
        copyImage: "/assets/set3_p1_copy.png",
        choices: ["16", "8", "32", "4"],
        correctAnswer: "16"
      },
      // P2: SF=1/8, Square (CHANGED FROM OCTAGON), Orig 16,24 → Copy 2,3
      {
        id: 2,
        originalImage: "/assets/set3_p2_orig.png",
        copyImage: "/assets/set3_p2_copy.png",
        choices: ["3", "24", "192", "12"],
        correctAnswer: "3"
      },
      // P3: SF=8, Rectangle, Orig 3,5 → Copy 24,40
      {
        id: 3,
        originalImage: "/assets/set3_p3_orig.png",
        copyImage: "/assets/set3_p3_copy.png",
        choices: ["40", "5", "15", "80"],
        correctAnswer: "40"
      },
      // P4: SF=1/7, Pentagon, Orig 14,21 → Copy 2,3
      {
        id: 4,
        originalImage: "/assets/set3_p4_orig.png",
        copyImage: "/assets/set3_p4_copy.png",
        choices: ["3", "21", "6", "147"],
        correctAnswer: "3"
      },
      // P5: SF=1.5, Square, Orig 6,10 → Copy 9,15
      {
        id: 5,
        originalImage: "/assets/set3_p5_orig.png",
        copyImage: "/assets/set3_p5_copy.png",
        choices: ["15", "10", "4", "30"],
        correctAnswer: "15"
      },
      // P6: SF=0.25, Trapezoid, Orig 12,20 → Copy 3,5
      {
        id: 6,
        originalImage: "/assets/set3_p6_orig.png",
        copyImage: "/assets/set3_p6_copy.png",
        choices: ["5", "20", "48", "15"],
        correctAnswer: "5"
      },
      // P7: SF=6, Parallelogram, Orig 2,7 → Copy 12,42
      {
        id: 7,
        originalImage: "/assets/set3_p7_orig.png",
        copyImage: "/assets/set3_p7_copy.png",
        choices: ["42", "7", "14", "84"],
        correctAnswer: "42"
      },
      // P8: SF=1/10, Octagon, Orig 30,50 → Copy 3,5
      {
        id: 8,
        originalImage: "/assets/set3_p8_orig.png",
        copyImage: "/assets/set3_p8_copy.png",
        choices: ["5", "50", "15", "500"],
        correctAnswer: "5"
      },
      // P9: SF=10, Rhombus, Orig 3,4 → Copy 30,40
      {
        id: 9,
        originalImage: "/assets/set3_p9_orig.png",
        copyImage: "/assets/set3_p9_copy.png",
        choices: ["40", "4", "120", "400"],
        correctAnswer: "40"
      },
      // P10: SF=0.4, Circle, Orig 5,10 → Copy 2,4
      {
        id: 10,
        originalImage: "/assets/set3_p10_orig.png",
        copyImage: "/assets/set3_p10_copy.png",
        choices: ["4", "10", "25", "8"],
        correctAnswer: "4"
      }
    ]
  },
  set4: {
    id: 4,
    title: "Find Missing Area (Regular)",
    description: "Find the area of the copy. Use the scale factor!",
    type: "text-input",
    questionPrompt: "Area of Copy?",
    problems: [
      {
        id: 1,
        originalImage: "/assets/set4_p1_orig.png",
        copyImage: "/assets/set4_p1_copy.png",
        correctAnswer: "48",
        acceptableAnswers: ["48", "48 cm²", "48 cm^2"],
        unit: "cm²"
      },
      {
        id: 2,
        originalImage: "/assets/set4_p2_orig.png",
        copyImage: "/assets/set4_p2_copy.png",
        correctAnswer: "3",
        acceptableAnswers: ["3", "3 in²", "3 in^2"],
        unit: "in²"
      },
      {
        id: 3,
        originalImage: "/assets/set4_p3_orig.png",
        copyImage: "/assets/set4_p3_copy.png",
        correctAnswer: "50.24",
        acceptableAnswers: ["50.24", "50.24 ft²", "50.24 ft^2"],
        unit: "ft²"
      },
      {
        id: 4,
        originalImage: "/assets/set4_p4_orig.png",
        copyImage: "/assets/set4_p4_copy.png",
        correctAnswer: "40",
        acceptableAnswers: ["40", "40 m²", "40 m^2"],
        unit: "m²"
      },
      {
        id: 5,
        originalImage: "/assets/set4_p5_orig.png",
        copyImage: "/assets/set4_p5_copy.png",
        correctAnswer: "3",
        acceptableAnswers: ["3", "3 cm²", "3 cm^2"],
        unit: "cm²"
      },
      {
        id: 6,
        originalImage: "/assets/set4_p6_orig.png",
        copyImage: "/assets/set4_p6_copy.png",
        correctAnswer: "28.26",
        acceptableAnswers: ["28.26", "28.26 in²", "28.26 in^2"],
        unit: "in²"
      },
      {
        id: 7,
        originalImage: "/assets/set4_p7_orig.png",
        copyImage: "/assets/set4_p7_copy.png",
        correctAnswer: "216",
        acceptableAnswers: ["216", "216 ft²", "216 ft^2"],
        unit: "ft²"
      },
      {
        id: 8,
        originalImage: "/assets/set4_p8_orig.png",
        copyImage: "/assets/set4_p8_copy.png",
        correctAnswer: "5",
        acceptableAnswers: ["5", "5 mm²", "5 mm^2"],
        unit: "mm²"
      },
      {
        id: 9,
        originalImage: "/assets/set4_p9_orig.png",
        copyImage: "/assets/set4_p9_copy.png",
        correctAnswer: "12.56",
        acceptableAnswers: ["12.56", "12.56 cm²", "12.56 cm^2"],
        unit: "cm²"
      },
      {
        id: 10,
        originalImage: "/assets/set4_p10_orig.png",
        copyImage: "/assets/set4_p10_copy.png",
        correctAnswer: "36",
        acceptableAnswers: ["36", "36 in²", "36 in^2"],
        unit: "in²"
      }
    ]
  },
  
  set5: {
    id: 5,
    title: "Find Missing Area (Irregular)",
    description: "Find the area of the copy. Use the scale factor!",
    type: "text-input",
    questionPrompt: "Area of Copy?",
    problems: [
      {
        id: 1,
        originalImage: "/assets/set5_p1_orig.png",
        copyImage: "/assets/set5_p1_copy.png",
        correctAnswer: "64",
        acceptableAnswers: ["64", "64 cm²", "64 cm^2"],
        unit: "cm²"
      },
      {
        id: 2,
        originalImage: "/assets/set5_p2_orig.png",
        copyImage: "/assets/set5_p2_copy.png",
        correctAnswer: "4",
        acceptableAnswers: ["4", "4 ft²", "4 ft^2"],
        unit: "ft²"
      },
      {
        id: 3,
        originalImage: "/assets/set5_p3_orig.png",
        copyImage: "/assets/set5_p3_copy.png",
        correctAnswer: "8",
        acceptableAnswers: ["8", "8 in²", "8 in^2"],
        unit: "in²"
      },
      {
        id: 4,
        originalImage: "/assets/set5_p4_orig.png",
        copyImage: "/assets/set5_p4_copy.png",
        correctAnswer: "297",
        acceptableAnswers: ["297", "297 m²", "297 m^2"],
        unit: "m²"
      },
      {
        id: 5,
        originalImage: "/assets/set5_p5_orig.png",
        copyImage: "/assets/set5_p5_copy.png",
        correctAnswer: "55",
        acceptableAnswers: ["55", "55 cm²", "55 cm^2"],
        unit: "cm²"
      },
      {
        id: 6,
        originalImage: "/assets/set5_p6_orig.png",
        copyImage: "/assets/set5_p6_copy.png",
        correctAnswer: "100",
        acceptableAnswers: ["100", "100 ft²", "100 ft^2"],
        unit: "ft²"
      },
      {
        id: 7,
        originalImage: "/assets/set5_p7_orig.png",
        copyImage: "/assets/set5_p7_copy.png",
        correctAnswer: "4",
        acceptableAnswers: ["4", "4 in²", "4 in^2"],
        unit: "in²"
      },
      {
        id: 8,
        originalImage: "/assets/set5_p8_orig.png",
        copyImage: "/assets/set5_p8_copy.png",
        correctAnswer: "16",
        acceptableAnswers: ["16", "16 mm²", "16 mm^2"],
        unit: "mm²"
      },
      {
        id: 9,
        originalImage: "/assets/set5_p9_orig.png",
        copyImage: "/assets/set5_p9_copy.png",
        correctAnswer: "26.67",
        acceptableAnswers: ["26.67", "26.66", "26.7", "26.67 cm²"],
        unit: "cm²"
      },
      {
        id: 10,
        originalImage: "/assets/set5_p10_orig.png",
        copyImage: "/assets/set5_p10_copy.png",
        correctAnswer: "26.25",
        acceptableAnswers: ["26.25", "26.25 ft²", "26.25 ft^2"],
        unit: "ft²"
      }
    ]
  },
  
  set6: {
    id: 6,
    title: "Conceptual Understanding",
    description: "Answer questions about what happens when shapes are scaled.",
    type: "conceptual",
    questionPrompt: "",
    problems: [
      {
        id: 1,
        question: "In the original shape, angle A = 65°. The scale factor is 3. What is angle A in the copy?",
        correctAnswer: "65",
        acceptableAnswers: ["65", "65°", "65 degrees"],
        unit: "°"
      },
      {
        id: 2,
        question: "In the original shape, a side length is 8 cm. The scale factor is 0.5. What is that side length in the copy?",
        correctAnswer: "4",
        acceptableAnswers: ["4", "4 cm"],
        unit: "cm"
      },
      {
        id: 3,
        question: "In the original shape, the area is 20 ft². The scale factor is 2. What is the area of the copy?",
        correctAnswer: "80",
        acceptableAnswers: ["80", "80 ft²", "80 ft^2"],
        unit: "ft²"
      },
      {
        id: 4,
        question: "In the original shape, angle B = 90°. The scale factor is 0.25. What is angle B in the copy?",
        correctAnswer: "90",
        acceptableAnswers: ["90", "90°", "90 degrees"],
        unit: "°"
      },
      {
        id: 5,
        question: "In the original shape, a side length is 12 in. The scale factor is 4. What is that side length in the copy?",
        correctAnswer: "48",
        acceptableAnswers: ["48", "48 in"],
        unit: "in"
      },
      {
        id: 6,
        question: "In the original shape, the area is 36 m². The scale factor is 0.5. What is the area of the copy?",
        correctAnswer: "9",
        acceptableAnswers: ["9", "9 m²", "9 m^2"],
        unit: "m²"
      },
      {
        id: 7,
        question: "In the original shape, angle C = 120°. The scale factor is 1. What is angle C in the copy?",
        correctAnswer: "120",
        acceptableAnswers: ["120", "120°", "120 degrees"],
        unit: "°"
      },
      {
        id: 8,
        question: "In the original shape, a side length is 15 mm. The scale factor is 3. What is that side length in the copy?",
        correctAnswer: "45",
        acceptableAnswers: ["45", "45 mm"],
        unit: "mm"
      },
      {
        id: 9,
        question: "In the original shape, the area is 9 cm². The scale factor is 5. What is the area of the copy?",
        correctAnswer: "225",
        acceptableAnswers: ["225", "225 cm²", "225 cm^2"],
        unit: "cm²"
      },
      {
        id: 10,
        question: "In the original shape, angle D = 45°. The scale factor is 2. What is angle D in the copy?",
        correctAnswer: "45",
        acceptableAnswers: ["45", "45°", "45 degrees"],
        unit: "°"
      }
    ]
  }
};
