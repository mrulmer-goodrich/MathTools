// problems.js
// This file contains all 60 problems across 6 sets
// SETS 1-3 COMPLETE | SET 4 CORRECTED | SET 6 UPDATED

export const problemSets = {
  set1: {
    id: 1,
    title: "Visual Scale Factor",
    description: "Circle the correct scale factor. Original is on the LEFT. ⚠️ NO MISTAKES ALLOWED!",
    type: "multiple-choice",
    questionPrompt: "Scale Factor?",
    codeSequence: ['1', 'h', '3', '@', 'r', 't', 'm', '@', 't', 'h'],
    strictMode: true,
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
      {
        id: 1,
        originalImage: "/assets/set3_p1_orig.png",
        copyImage: "/assets/set3_p1_copy.png",
        choices: ["16", "8", "32", "4"],
        correctAnswer: "16"
      },
      {
        id: 2,
        originalImage: "/assets/set3_p2_orig.png",
        copyImage: "/assets/set3_p2_copy.png",
        choices: ["3", "24", "192", "12"],
        correctAnswer: "3"
      },
      {
        id: 3,
        originalImage: "/assets/set3_p3_orig.png",
        copyImage: "/assets/set3_p3_copy.png",
        choices: ["40", "5", "15", "80"],
        correctAnswer: "40"
      },
      {
        id: 4,
        originalImage: "/assets/set3_p4_orig.png",
        copyImage: "/assets/set3_p4_copy.png",
        choices: ["3", "21", "6", "147"],
        correctAnswer: "3"
      },
      {
        id: 5,
        originalImage: "/assets/set3_p5_orig.png",
        copyImage: "/assets/set3_p5_copy.png",
        choices: ["15", "10", "4", "30"],
        correctAnswer: "15"
      },
      {
        id: 6,
        originalImage: "/assets/set3_p6_orig.png",
        copyImage: "/assets/set3_p6_copy.png",
        choices: ["5", "20", "48", "15"],
        correctAnswer: "5"
      },
      {
        id: 7,
        originalImage: "/assets/set3_p7_orig.png",
        copyImage: "/assets/set3_p7_copy.png",
        choices: ["42", "7", "14", "84"],
        correctAnswer: "42"
      },
      {
        id: 8,
        originalImage: "/assets/set3_p8_orig.png",
        copyImage: "/assets/set3_p8_copy.png",
        choices: ["5", "50", "15", "500"],
        correctAnswer: "5"
      },
      {
        id: 9,
        originalImage: "/assets/set3_p9_orig.png",
        copyImage: "/assets/set3_p9_copy.png",
        choices: ["40", "4", "120", "400"],
        correctAnswer: "40"
      },
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
    title: "Find Area of Copy",
    description: "Find the missing side, then calculate the area of the copy.",
    type: "multiple-choice",
    questionPrompt: "What is the area of the copy?",
    codeSequence: ['m', '@', 't', 'h', 'i', 's', 'c', '0', '0', 'l'],
    problems: [
      {
        id: 1,
        originalImage: "/assets/set4_p1_orig.png",
        copyImage: "/assets/set4_p1_copy.png",
        choices: ["160", "80", "1/160", "320"],
        correctAnswer: "160"
      },
      {
        id: 2,
        originalImage: "/assets/set4_p2_orig.png",
        copyImage: "/assets/set4_p2_copy.png",
        choices: ["108", "54", "1/108", "216"],
        correctAnswer: "108"
      },
      {
        id: 3,
        originalImage: "/assets/set4_p3_orig.png",
        copyImage: "/assets/set4_p3_copy.png",
        choices: ["144", "36", "1/144", "576"],
        correctAnswer: "144"
      },
      {
        id: 4,
        originalImage: "/assets/set4_p4_orig.png",
        copyImage: "/assets/set4_p4_copy.png",
        choices: ["314", "157", "1/314", "628"],
        correctAnswer: "314"
      },
      {
        id: 5,
        originalImage: "/assets/set4_p5_orig.png",
        copyImage: "/assets/set4_p5_copy.png",
        choices: ["24", "48", "1/24", "12"],
        correctAnswer: "24"
      },
      {
        id: 6,
        originalImage: "/assets/set4_p6_orig.png",
        copyImage: "/assets/set4_p6_copy.png",
        choices: ["6", "18", "1/6", "3"],
        correctAnswer: "6"
      },
      {
        id: 7,
        originalImage: "/assets/set4_p7_orig.png",
        copyImage: "/assets/set4_p7_copy.png",
        choices: ["4", "16", "1/4", "2"],
        correctAnswer: "4"
      },
      {
        id: 8,
        originalImage: "/assets/set4_p8_orig.png",
        copyImage: "/assets/set4_p8_copy.png",
        choices: ["3", "15", "1/3", "6"],
        correctAnswer: "3"
      },
      {
        id: 9,
        originalImage: "/assets/set4_p9_orig.png",
        copyImage: "/assets/set4_p9_copy.png",
        choices: ["54", "36", "1/54", "108"],
        correctAnswer: "54"
      },
      {
        id: 10,
        originalImage: "/assets/set4_p10_orig.png",
        copyImage: "/assets/set4_p10_copy.png",
        choices: ["3", "36", "1/3", "6"],
        correctAnswer: "3"
      }
    ]
  },
    set5: {
    id: 5,
    title: "Find Area of Irregular Shapes",
    description: "Find the missing side, then calculate the total area of the copy.",
    type: "multiple-choice",
    questionPrompt: "What is the area of the copy?",
    codeSequence: ['B', '3', 'l', 'i', '3', 'v', '3', '-', 'N', 'U'],
    problems: [
      {
        id: 1,
        originalImage: "/assets/set5_p1_orig.png",
        copyImage: "/assets/set5_p1_copy.png",
        choices: ["144", "72", "36", "288"],
        correctAnswer: "144"
      },
      {
        id: 2,
        originalImage: "/assets/set5_p2_orig.png",
        copyImage: "/assets/set5_p2_copy.png",
        choices: ["270", "90", "30", "540"],
        correctAnswer: "270"
      },
      {
        id: 3,
        originalImage: "/assets/set5_p3_orig.png",
        copyImage: "/assets/set5_p3_copy.png",
        choices: ["11", "44", "22", "5.5"],
        correctAnswer: "11"
      },
      {
        id: 4,
        originalImage: "/assets/set5_p4_orig.png",
        copyImage: "/assets/set5_p4_copy.png",
        choices: ["368", "92", "23", "736"],
        correctAnswer: "368"
      },
      {
        id: 5,
        originalImage: "/assets/set5_p5_orig.png",
        copyImage: "/assets/set5_p5_copy.png",
        choices: ["7", "22", "66", "3.5"],
        correctAnswer: "7"
      }
    ]
  },

    set6: {
    id: 6,
    title: "Conceptual Understanding",
    description: "Answer questions about what happens when shapes are scaled.",
    type: "multiple-choice",
    questionPrompt: "",
    codeSequence: ['U', 'G', 'l', '0', 'v', '3', 's', 'y', '0', 'u'],
    problems: [
      {
        id: 1,
        question: "In the original shape, angle A = 65°. The scale factor is 3. What is angle A in the copy?",
        choices: ["65°", "195°", "22°", "68°"],
        correctAnswer: "65°"
      },
      {
        id: 2,
        question: "In the original shape, a side length is 8 cm. The scale factor is 0.5. What is that side length in the copy?",
        choices: ["4 cm", "16 cm", "8 cm", "2 cm"],
        correctAnswer: "4 cm"
      },
      {
        id: 3,
        question: "In the original shape, the area is 20 ft². The scale factor is 2. What is the area of the copy?",
        choices: ["80 ft²", "40 ft²", "20 ft²", "160 ft²"],
        correctAnswer: "80 ft²"
      },
      {
        id: 4,
        question: "In the original shape, angle B = 90°. The scale factor is 0.25. What is angle B in the copy?",
        choices: ["90°", "23°", "360°", "22.5°"],
        correctAnswer: "90°"
      },
      {
        id: 5,
        question: "In the original shape, a side length is 12 in. The scale factor is 4. What is that side length in the copy?",
        choices: ["48 in", "3 in", "16 in", "192 in"],
        correctAnswer: "48 in"
      },
      {
        id: 6,
        question: "In the original shape, the area is 36 m². The scale factor is 0.5. What is the area of the copy?",
        choices: ["9 m²", "18 m²", "72 m²", "36 m²"],
        correctAnswer: "9 m²"
      },
      {
        id: 7,
        question: "In the original shape, angle C = 120°. The scale factor is 1. What is angle C in the copy?",
        choices: ["120°", "240°", "60°", "121°"],
        correctAnswer: "120°"
      },
      {
        id: 8,
        question: "In the original shape, a side length is 15 mm. The scale factor is 3. What is that side length in the copy?",
        choices: ["45 mm", "5 mm", "18 mm", "135 mm"],
        correctAnswer: "45 mm"
      },
      {
        id: 9,
        question: "In the original shape, the area is 9 cm². The scale factor is 5. What is the area of the copy?",
        choices: ["225 cm²", "45 cm²", "81 cm²", "14 cm²"],
        correctAnswer: "225 cm²"
      },
      {
        id: 10,
        question: "In the original shape, angle D = 45°. The scale factor is 2. What is angle D in the copy?",
        choices: ["45°", "90°", "23°", "47°"],
        correctAnswer: "45°"
      }
    ]
  }};
