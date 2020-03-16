const TROOPS = [
    { shortName: "C", name: "Coin Purse", percent: 5, xp: 10, value: 0 },
    { shortName: "R", name: "Gold Ring", percent: 10, xp: 25, value: 100 },
    { shortName: "P", name: "Priest's Chalice", percent: 20, xp: 50, value: 1200 },
    { shortName: "K", name: "King's Crown", percent: 25, xp: 100, value: 2500 },
    { shortName: "G", name: "Genie' Lamp", percent: 30, xp: 250, value: 5000 },
    { shortName: "S", name: "Sacred Treasure", percent: 50, xp: 500, value: 15000 }
];

const TEMPLATES_QUICK = [0, 2, 5, 9, 10, 11, 12, 13, 16, 17, 18, 20, 22, 23, 24, 25, 28, 29, 30, 35, 36, 37];
const TEMPLATES = [
[2,2,2,2,2], // 100, 0     0
[3,2,2,2,2], // 105, 1     1
[3,3,2,2,1], // 100, 2     2
[3,3,2,2,2], // 110, 3     3
[3,3,3,2,1], // 105, 4     4
//[3,3,3,2,2], // 115, 5 
[3,3,3,3], // 100, 6       5
[4,2,2,2,1], // 100, 7     6
[3,3,3,3,1], // 110, 8     7
//[4,2,2,2,2], // 110, 9 
[3,3,3,3,2], // 120, 10    8
//[4,3,2,2,1], // 105, 11 
[4,3,3,1,1], // 100, 12    9
//[4,3,2,2,2], // 115, 13 
[3,3,3,3,3], // 125, 14   10
[4,3,3,2], // 100, 15     11
//[4,3,3,2,1], // 110, 16 
//[4,3,3,2,2], // 120, 17
[4,3,3,3], // 105, 18     12
//[4,3,3,3,1], // 115, 19 
//[4,4,2,1,1], // 100, 20 
//[4,3,3,3,2], // 125, 21 
[4,4,2,2], // 100, 22     13
//[5,2,1,1,1], // 100, 23 
//[4,4,2,2,1], // 110, 24
// [5,2,2,1], // 100, 25 
// [5,2,2,1,1], // 110, 26 
// [4,4,3,1,1], // 105, 27 
// [4,4,2,2,2], // 120, 28 
[4,3,3,3,3], // 130, 29   14
[5,2,2,2], // 110, 30     15
[4,4,3,2], // 105, 31     16
// [5,3,1,1,1], // 105, 32 
// [5,2,2,2,1], // 120, 33 
// [4,4,3,2,1], // 115, 34 
// [5,3,2,1], // 105, 35 
// [5,3,2,1,1], // 115, 36 
// [5,2,2,2,2], // 130, 37 
// [4,4,3,2,2], // 125, 38 
// [5,3,2,2], // 115, 39 
[4,4,3,3], // 110, 40      17
[5,3,3], // 100, 41        18
// [5,3,2,2,1], // 125, 42 
[4,4,3,3,1], // 120, 43    19
// [5,3,3,1], // 110, 44 
// [5,3,3,1,1], // 120, 45 
// [5,3,2,2,2], // 135, 46 
// [4,4,3,3,2], // 130, 47 
// [5,3,3,2], // 120, 48 
// [5,3,3,2,1], // 130, 49 
[4,4,4,1], // 100, 50      20
// [5,3,3,2,2], // 140, 51 
// [4,4,4,1,1], // 110, 52 
[4,4,3,3,3], // 135, 53    21
// [5,4,1,1], // 100, 54 
// [5,3,3,3], // 125, 55 
[4,4,4,2], // 110, 56      22
[5,4,2], // 100, 57        23
// [5,4,1,1,1], // 110, 58 
// [5,3,3,3,1], // 135, 59 
// [4,4,4,2,1], // 120, 60 
// [5,4,2,1], // 110, 61 
// [5,4,2,1,1], // 120, 62 
// [5,3,3,3,2], // 145, 63 
// [4,4,4,2,2], // 130, 64 
// [5,4,2,2], // 120, 65 
[4,4,4,3], // 115, 66 x    24
[5,4,3], // 105, 67 x      25
// [5,4,2,2,1], // 130, 68 
[4,4,4,3,1], // 125, 69 y  26
// [5,4,3,1], // 115, 70 
// [5,4,3,1,1], // 125, 71 
// [5,4,2,2,2], // 140, 72 
// [5,3,3,3,3], // 150, 73 
//[4,4,4,3,2], // 135, 74
// [5,4,3,2], // 125, 75 
// [5,4,3,2,1], // 135, 76 
// [5,4,3,2,2], // 145, 77 
[4,4,4,3,3], // 140, 78 y  27
// [5,4,3,3], // 130, 79 
// [5,4,3,3,1], // 140, 80 
// [5,4,3,3,2], // 150, 81 
[4,4,4,4], // 120, 82 x    28
[5,4,4], // 110, 83 x      29
[5,5], // 100, 84 x        30
[4,4,4,4,1], // 130, 85 x  31
// [5,4,4,1], // 120, 86 
[5,5,1], // 110, 87 y      32
// [5,4,4,1,1], // 130, 88 
// [5,4,3,3,3], // 155, 89 
//[4,4,4,4,2], // 140, 90
// [5,5,1,1], // 120, 91 
// [5,4,4,2], // 130, 92 
[5,5,2], // 120, 93 x      33
// [5,5,1,1,1], // 130, 94 
// [5,4,4,2,1], // 140, 95 
// [5,5,2,1], // 130, 96 
// [5,5,2,1,1], // 140, 97 
// [5,4,4,2,2], // 150, 98 
[4,4,4,4,3], // 145, 99 y  34
// [5,5,2,2], // 140, 100 
// [5,4,4,3], // 135, 101 
// [5,5,3], // 125, 102 
// [5,5,2,2,1], // 150, 103 
// [5,4,4,3,1], // 145, 104 
// [5,5,3,1], // 135, 105 
// [5,5,3,1,1], // 145, 106 
// [5,5,2,2,2], // 160, 107 
// [5,4,4,3,2], // 155, 108 
// [5,5,3,2], // 145, 109 
// [5,5,3,2,1], // 155, 110 
// [5,5,3,2,2], // 165, 111 
// [5,4,4,3,3], // 160, 112 
// [5,5,3,3], // 150, 113 
// [5,5,3,3,1], // 160, 114 
// [5,5,3,3,2], // 170, 115 
[4,4,4,4,4], // 150, 116 x  35
[5,4,4,4], // 140, 117 x    36 
[5,5,4], // 130, 118 x      37
// [5,4,4,4,1], // 150, 119 
// [5,5,4,1], // 140, 120 
// [5,5,4,1,1], // 150, 121 
// [5,5,3,3,3], // 175, 122 
//[5,4,4,4,2], // 160, 123 y  38
// [5,5,4,2], // 150, 124 
// [5,5,4,2,1], // 160, 125 
// [5,5,4,2,2], // 170, 126 
//[5,4,4,4,3], // 165, 127 y  39
// [5,5,4,3], // 155, 128 
// [5,5,4,3,1], // 165, 129 
// [5,5,4,3,2], // 175, 130 
// [5,5,4,3,3], // 180, 131
//[5,4,4,4,4], // 170, 132 x  40
//[5,5,4,4], // 160, 133 x    41
//[5,5,5], // 150, 134 x      42
//[5,5,4,4,1], // 170, 135
//[5,5,5,1], // 160, 136  
// [5,5,5,1,1], // 170, 137 
// [5,5,4,4,2], // 180, 138 
// [5,5,5,2], // 170, 139 
// [5,5,5,2,1], // 180, 140 
// [5,5,5,2,2], // 190, 141 
// [5,5,4,4,3], // 185, 142 
//[5,5,5,3], // 175, 143 y    43
// [5,5,5,3,1], // 185, 144 
//[5,5,5,3,2], // 195, 145 y  44
//[5,5,5,3,3], // 200, 146
//[5,5,4,4,4], // 190, 147 x  45
//[5,5,5,4], // 180, 148 x    46
// [5,5,5,4,1], // 190, 149 
// [5,5,5,4,2], // 200, 150 
// [5,5,5,4,3], // 205, 151 
//[5,5,5,4,4], // 210, 152 x  47
//[5,5,5,5], // 200, 153 x    48
];

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function initTable(id, COLUMN_NAMES) {
  let table = document.getElementById(id);
  let thead = document.createElement('thead');
  COLUMN_NAMES.forEach(function (columnName, i) {
    let th = document.createElement('th');
    th.textContent = columnName;
    thead.appendChild(th);
  });
  table.appendChild(thead);
  let tbody = document.createElement('tbody');
  table.appendChild(tbody);
  return tbody;
}

function clearTable(id) {
  const table = document.getElementById(id);
  if (table.hasChildNodes()) {
    table.removeChild(table.lastChild);
  }
  return table;
}

// const TEMPLATES = [
//     [2, 2, 2, 2, 2], // 100, 0
//     [3, 2, 2, 2, 2], // 105, 1
//     [3, 3, 2, 2, 1], // 100, 2
//     [3, 3, 3, 2, 1], // 105, 3
//     [3, 3, 3, 2, 2], // 115, 4
//     [3, 3, 3, 3],    // 100, 5
//     [4, 2, 2, 2, 1], // 100, 6
//     [4, 3, 2, 2, 1], // 105, 7
//     [4, 3, 3, 1, 1], // 100, 8
// [3,3,3,3,3], // 125, 14 x
//     [4, 3, 3, 2],    // 100, 9
//     [4, 3, 3, 3],    // 105, 10
//     [4, 4, 2, 1, 1], // 100, 11
//     [4, 4, 2, 2],    // 100, 12
//     [5, 2, 1, 1, 1], // 100, 13
//     [5, 2, 2, 1],    // 100, 14
//     [4, 4, 3, 1, 1], // 105, 15
//     [4, 4, 3, 2],    // 105, 16
//     [5, 3, 1, 1, 1], // 105, 17
//     [4, 4, 3, 3],    // 110, 18
//     [5, 3, 3],       // 100, 19
//     [4, 4, 4, 1],    // 100, 20
//     [5, 4, 1, 1],    // 100, 21
//     [4, 4, 4, 2],    // 110, 22
//     [5, 4, 2],       // 100, 23
//     [4, 4, 4, 3],    // 115, 24
//     [5, 4, 3],       // 105, 25
//     [4, 4, 4, 4],    // 120, 26
//     [5, 4, 4],       // 110, 27
//     [5, 5],          // 100, 28
// [5,5,2], // 120, 78 x
// [5,5,3], // 125, 80 x
// [5,5,4], // 130, 82 x
// [5,5,5], // 150, 83 x
// ];
//const TEMPLATES_USELESS = [3, 8, 11, 19, 22, 23];
//const TEMPLATES_QUICK = [0, 3, 4, 5, 10, 11, 13, 17, 19, 20, 21, 24, 25, 27, 28, 29]; // Reevaluate if we go back to this set
