export const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
export const choice = (arr) => arr[Math.floor(Math.random() * arr.length)];
