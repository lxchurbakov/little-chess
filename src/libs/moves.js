// export const context = () => {
//     return 
// };


// // const positionValid = (p) => 
// //     start.x < 0 || start.y < 0 || start.x > 7 || start.y > 7;

// // const color = (n) => n.toLowerCase() === n ? 'black' : 'white';

// // //
// // //
// // const walk = (position, predicate, find, color) => {
// //     let values = [];

// //     for (let i = 0; i < 8; ++i) {
// //         position = predicate(position);

// //         const piece = find(position);

// //         if (find(start) || ) {
// //             break
// //         }

// //         values.push({ ...start});
// //     }

// //     return values;
// // };

// // if (piece.code.toLowerCase() === 'b') {
// //     return [
// //         ...walk({ ...piece.position }, (p) => ({ x: p.x - 1, y: p.y - 1 })),
// //         ...walk({ ...piece.position }, (p) => ({ x: p.x - 1, y: p.y + 1 })),
// //         ...walk({ ...piece.position }, (p) => ({ x: p.x + 1, y: p.y + 1 })),
// //         ...walk({ ...piece.position }, (p) => ({ x: p.x + 1, y: p.y - 1 })),
// //     ];
// // }

// // if (piece.code.toLowerCase() === 'r') {
// //     return [
// //         ...walk({ ...piece.position }, (p) => ({ x: p.x, y: p.y - 1 })),
// //         ...walk({ ...piece.position }, (p) => ({ x: p.x, y: p.y + 1 })),
// //         ...walk({ ...piece.position }, (p) => ({ x: p.x - 1, y: p.y })),
// //         ...walk({ ...piece.position }, (p) => ({ x: p.x + 1, y: p.y })),
// //     ];
// // }

// // if (piece.code.toLowerCase() === 'q') {
// //     return [
// //         ...walk({ ...piece.position }, (p) => ({ x: p.x - 1, y: p.y - 1 })),
// //         ...walk({ ...piece.position }, (p) => ({ x: p.x - 1, y: p.y + 1 })),
// //         ...walk({ ...piece.position }, (p) => ({ x: p.x + 1, y: p.y + 1 })),
// //         ...walk({ ...piece.position }, (p) => ({ x: p.x + 1, y: p.y - 1 })),
// //         ...walk({ ...piece.position }, (p) => ({ x: p.x, y: p.y - 1 })),
// //         ...walk({ ...piece.position }, (p) => ({ x: p.x, y: p.y + 1 })),
// //         ...walk({ ...piece.position }, (p) => ({ x: p.x - 1, y: p.y })),
// //         ...walk({ ...piece.position }, (p) => ({ x: p.x + 1, y: p.y })),
// //     ];
// // }

// // if (piece.code.toLowerCase() === 'n') {
// //     const options = [
// //         { x: -1, y: 2 },
// //         { x: -1, y: -2 },
// //         { x: 1, y: 2 },
// //         { x: 1, y: -2 },
// //         { x: -2, y: 1 },
// //         { x: -2, y: -1 },
// //         { x: 2, y: 1 },
// //         { x: 2, y: -1 },
// //     ];
    
// //     return options.map((p) => add(p, piece.position)).filter((p) => {
// //         return p.x >= 0 && p.x <= 7 && p.y >= 0 && p.y <= 7;
// //     }).filter((p) => !find(p));
// // }

// // if (piece.code.toLowerCase() === 'p') {
// //     const canDoTwo = (piece.code === 'p' && piece.position.y === 1) 
// //         || (piece.code === 'P' && piece.position.y === 6);
    
// //     const direction = piece.code === 'P' ? -1 : 1;

// //     return [
// //         { x: piece.position.x, y: piece.position.y + direction },
// //         canDoTwo ? { x: piece.position.x, y: piece.position.y + direction * 2 } : null,
// //     ].filter(Boolean).filter((p) => !find(p));
// // }

// // if (piece.code.toLowerCase() === 'k') {
// //     const options = [
// //         { x: -1, y: -1 },
// //         { x: -1, y: 0 },
// //         { x: -1, y: 1 },
// //         { x: 0, y: -1 },
// //         // { x: 0, y: 0 },
// //         { x: 0, y: 1 },
// //         { x: 1, y: -1 },
// //         { x: 1, y: 0 },
// //         { x: 1, y: 1 },
// //     ];
    
// //     return options.map((p) => add(p, piece.position)).filter((p) => {
// //         return p.x >= 0 && p.x <= 7 && p.y >= 0 && p.y <= 7;
// //     }).filter((p) => !find(p));
// // }

// // return [{ x: piece.position.x, y: piece.position.y - 1 }];