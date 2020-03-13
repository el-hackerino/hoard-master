const TROOPS = [
    { shortName: "C", name: "Coin Purse", percent: 5, xp: 10 },
    { shortName: "R", name: "Gold Ring", percent: 10, xp: 25 },
    { shortName: "P", name: "Priest's Chalice", percent: 20, xp: 50 },
    { shortName: "K", name: "King's Crown", percent: 25, xp: 100 },
    { shortName: "G", name: "Genie' Lamp", percent: 30, xp: 250 },
    { shortName: "S", name: "Sacred Treasure", percent: 50, xp: 500 }
];
const TEMPLATES = [
    [2, 2, 2, 2, 2], // 100, 0
    [3, 2, 2, 2, 2], // 105, 1
    [3, 3, 2, 2, 1], // 100, 2
    [3, 3, 3, 2, 1], // 105, 3
    [3, 3, 3, 2, 2], // 115, 4
    [3, 3, 3, 3],    // 100, 5
    [4, 2, 2, 2, 1], // 100, 6
    [4, 3, 2, 2, 1], // 105, 7
    [4, 3, 3, 1, 1], // 100, 8
    [4, 3, 3, 2],    // 100, 9
    [4, 3, 3, 3],    // 105, 10
    [4, 4, 2, 1, 1], // 100, 11
    [4, 4, 2, 2],    // 100, 12
    [5, 2, 1, 1, 1], // 100, 13
    [5, 2, 2, 1],    // 100, 14
    [4, 4, 3, 1, 1], // 105, 15
    [4, 4, 3, 2],    // 105, 16
    [5, 3, 1, 1, 1], // 105, 17
    [4, 4, 3, 3],    // 110, 18
    [5, 3, 3],       // 100, 19
    [4, 4, 4, 1],    // 100, 20
    [5, 4, 1, 1],    // 100, 21
    [4, 4, 4, 2],    // 110, 22
    [5, 4, 2],       // 100, 23
    [4, 4, 4, 3],    // 115, 24
    [5, 4, 3],       // 105, 25
    [4, 4, 4, 4],    // 120, 26
    [5, 4, 4],       // 110, 27
    [5, 5],          // 100, 28
];
//const TEMPLATES_USELESS = [3, 8, 11, 19, 22, 23];
const TEMPLATES_QUICK = [0, 3, 4, 5, 9, 10, 12, 16, 18, 19, 20, 23, 24, 26, 27, 28];