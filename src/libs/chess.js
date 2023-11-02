import React from 'react';

import { parsefen, createid } from './utils';
import { get  }from './moves';

//
export const curry = (predicate, ...args) => (...$args) => predicate(...args.concat($args));

export const flatten = (a) => a.reduce((acc, b) => acc.concat(b), []);
export const zip = (a, b) => flatten(a.map(($a) => b.map(($b) => [$a, $b])));

export const match = (a, b) => a.x === b.x && a.y === b.y;
export const add = (a, b) => ({ x: a.x + b.x, y: a.y + b.y });
export const sub = (a, b) => ({ x: a.x - b.x, y: a.y - b.y });

export const isWhite = ({code}) => 'QNRBPK'.includes(code);
export const isPositionValid = (p) => p.x > -1 && p.y > -1 && p.x < 8 && p.y < 8;

const isBishop = ({code}) => code.toLowerCase() === 'b';
const isKing = ({code}) => code.toLowerCase() === 'k';
const isQueen = ({code}) => code.toLowerCase() === 'q';
const isKnight = ({code}) => code.toLowerCase() === 'n';
const isPawn = ({code}) => code.toLowerCase() === 'p';
const isRook = ({code}) => code.toLowerCase() === 'r';

// const move = React.useCallback((id, newposition) => {
        
//     const pieceToMove = get(id);

//     if (piece && isWhite(piece) !== isWhite(pieceToMove)) {
//         // throw new Error(`cannot_move_here`);
//         setPieces(($) => {
//             return $.filter(($$) => {
//                 return $$.id !== piece.id;
//             });
//         });
//     }

//     setPieces(($) => {
//         return $.map(($$) => {
//             if ($$.id === id) {
//                 return { ...$$, position: { ...newposition } };
//             } else {
//                 return $$;
//             }
//         });
//     });

//     setWhite(($) => !$);
// }, [get, setWhite, find, pieces, setPieces]);

    // const can = React.useCallback((id, p) => {
    //     const piece = get(id);

    //     if (!piece) {
    //         throw new Error(`piece_not_found`);
    //     }

    //     if (piece.code.toLowerCase() === 'r') {
    //         return piece.position.x === p.x || piece.position.y === p.y;
    //     }
    // }, [get]);

export const usePieces = () => {
    const [value, update] = React.useState([]);
    
    const load = React.useCallback((fen) => {
        update(parsefen(fen));
    }, [update]);

    const find = React.useCallback((p) => {
        return value.find(($) => match($.position, p));
    }, [value]);

    const get = React.useCallback((id) => {
        // console.log('get', id, value.find(($) => $.id === id))
        // console.log('usePieces.get (14):', value.find(($) => $.id === 14)?.position);
        return value.find(($) => $.id === id);;
    }, [value]);

    // console.log('usePieces (14):', value.find(($) => $.id === 14)?.position);

    return React.useMemo(() => ({ value, update, load, find, get }), [value, update, load, find, get]);
};

export const useMoves = (pieces) => {
    const get = React.useCallback((id) => {
        const pieceToMove = pieces.get(id);

        const isOccupied = (p) => 
            ((piece) => piece ? (isWhite(piece) ? 'white' : 'black') : null)(pieces.find(p));
        
        const walk = (predicate, position = { ...pieceToMove.position }) => {
            let moves = [];

            for (let i = 0; i < 8; ++i) {
                position = predicate(position);

                const validity = isPositionValid(position);
                const occupancy = isOccupied(position);
                const cannotOccupyPosition = occupancy !== null && (occupancy === 'white') === isWhite(pieceToMove);

                if (!validity || cannotOccupyPosition) {
                    break;
                }

                moves.push({ position: { ...position }, type: occupancy === null ? 'simple' : 'capture' });

                if (occupancy !== null) {
                    break
                }
            }

            return moves;
        };  

        const diagonalSteps = zip([-1, 1], [-1, 1]);
        const verticalSteps = zip([0], [-1, 1]);
        const horizontalSteps = zip([-1, 1], [0]);

        if (isBishop(pieceToMove)) {
            return flatten(
                diagonalSteps
                    .map(([x, y]) => walk(curry(add, { x, y })))
            );
        }

        if (isRook(pieceToMove)) {
            return flatten(
                flatten([horizontalSteps, verticalSteps])
                    .map(([x, y]) => walk(curry(add, { x, y })))
            );
        }

        if (isQueen(pieceToMove)) {
            return flatten(
                flatten([diagonalSteps, horizontalSteps, verticalSteps])
                    .map(([x, y]) => walk(curry(add, { x, y })))
            );
        }

        if (isKnight(pieceToMove)) {
            return flatten([
                zip([2, -2], [-1, 1]),
                zip([-1, 1], [2, -2]),
            ]).map(([x, y]) => add(pieceToMove.position, { x, y })).map((position) => {
                const occupancy = isOccupied(position);
                const validity = isPositionValid(position);
                const cannotOccupyPosition = occupancy !== null && (occupancy === 'white') === isWhite(pieceToMove);

                if (!validity || cannotOccupyPosition) {
                    return null
                }
                
                return { position, type: !!occupancy ? 'capture' : 'simple' };
            }).filter(Boolean);
        }

        if (isPawn(pieceToMove)) {
            const direction = isWhite(pieceToMove) ? -1 : 1;
            const canDoTwo = pieceToMove.position.y === (3.5 - (direction * 2.5));

            const simpleMoves = [
                add(pieceToMove.position, { x: 0, y: direction }),
                canDoTwo ? add(pieceToMove.position, { x: 0, y: direction * 2 }) : null,
            ].filter(Boolean).map((position) => {
                const occupancy = isOccupied(position);
                const validity = isPositionValid(position);

                return (!validity || !!occupancy) ? null : position;
            }).filter(Boolean);
            
            const enemies = [-1, 1]
                .map((x) => add(pieceToMove.position, { x, y: direction }))
                .filter((p) => !!pieces.find(p));
            
            const captureMoves = enemies.map((position) => {
                const occupancy = isOccupied(position);
                const validity = isPositionValid(position);
                const cannotOccupyPosition = occupancy === null || (occupancy === 'white') === isWhite(pieceToMove);

                return (!validity || cannotOccupyPosition) ? null : position;
            }).filter(Boolean);

            return flatten([
                simpleMoves.map((position) => ({ position, type: 'simple' })),
                captureMoves.map((position) => ({ position, type: 'capture' })),
            ]);
        }
    
        // if (piece.code.toLowerCase() === 'k') {
        //     const options = [
        //         { x: -1, y: -1 },
        //         { x: -1, y: 0 },
        //         { x: -1, y: 1 },
        //         { x: 0, y: -1 },
        //         // { x: 0, y: 0 },
        //         { x: 0, y: 1 },
        //         { x: 1, y: -1 },
        //         { x: 1, y: 0 },
        //         { x: 1, y: 1 },
        //     ];
            
        //     return options.map((p) => add(p, piece.position)).map((p) => {
        //         const checkResult = check(p);

        //         if (checkResult) {
        //             return { position: p, type: checkResult };
        //         }
        //     })
        //     .filter(Boolean);
        // }

        // return [];
        return [
            { position: add(pieceToMove.position, { x: 0, y : 1 }), type: 'simple' },
        ];
    }, [pieces]);

    const apply = React.useCallback((id, p) => {
        const pieceToMove = pieces.get(id);
        const pieceInPosition = pieces.find(p);
        
        if (pieceInPosition) {
            if (isWhite(pieceInPosition) !== isWhite(pieceToMove)) {
                pieces.update(($) => {
                    return $   
                        .filter(($$) => $$.id !== pieceInPosition.id)
                        .map(($$) => {
                            return $$.id === pieceToMove.id
                                ? { ...pieceToMove, position: { ...p } }
                                : $$;
                        });
                });
            } else {
                throw new Error(`cannot_move_here`);
            }
        } else {
            pieces.update(($) => {
                return $   
                    .map(($$) => {
                        return $$.id === pieceToMove.id
                            ? { ...pieceToMove, position: { ...p } }
                            : $$;
                    });
            });
        }
    }, [pieces]);

    return React.useMemo(() => ({ get, apply }), [get, apply]);
};

export const useChess = () => {
    const pieces = usePieces();
    const moves = useMoves(pieces);

    // const [whiteToMove, setWhiteToMove] = React.useState(true);
    return React.useMemo(() => ({ pieces, moves }), [pieces, moves]);
};

// const check = React.useMemo(() => {
//     return ['K', 'k'].map((code) => {
//         const king = pieces.find(($) => $.code === code);

//         for (let piece of pieces) {
//             const pieceMoves = moves(piece.id);
//             const threat = pieceMoves.find((move) => match(move.position, king.position));
            
//             if (threat) {
//                 return code;
//             }
//         }

//         return null;
//     }).filter(Boolean).map((code) => isWhite({ code }) ? 'white' : 'black')[0];
// }, [moves, pieces]);

    

    





    // console.log(check)

//     return React.useMemo(() => ({ 
//         pieces, move, get, find, load, move, moves, white, check
//     }), [pieces, move, get, find, move, load, moves, white, check]);
// };

let _id = 1;
export const createid = () => _id++;

export class Chess {
    constructor (pieces = [], whiteToMove = true) {
        this.pieces = pieces;
        this.whiteToMove = whiteToMove;
    }

    clone = () =>
        new Chess(this.pieces.slice(), this.whiteToMove);

    // Pieces management stuff

    piece = (id) => 
        this.pieces.find(($) => $.id === id) || null

    find = (p) =>
        this.pieces.find(($) => match($.position, p));

    update = (id, predicate) => {
        this.pieces = this.pieces.map(($) => $.id === id ? predicate($) : $);
    };

    remove = (id) => {
        this.pieces = this.pieces.filter(($) => $.id !== id);
    };

    // Import and export

    load = (fen) => {
        this.pieces = parsefen(fen);
        this.whiteToMove = true;
        this.onUpdate?.();
    };

    // Moves related stuff

    _moves = () => {
        let moves = [];

        for (let piece of this.pieces) {
            moves = moves.concat(get(this.pieces, piece));
        }

        return moves;
    };

    moves = () => {
        // Take all moves
        const unsafeMoves = this._moves();

        // console.log({ unsafeMoves })

        // Here we filter out moves that are not for current
        const turnMoves = unsafeMoves.filter(($) => {
            return isWhite(this.piece($.id)) === this.whiteToMove;
        });

        // here we filter out moves that lead to check for the one that moves
        const safeMoves = turnMoves.filter(($) => {
            const wtf = this.clone();

            wtf.apply($);
            wtf.whiteToMove = !wtf.whiteToMove;

            return !wtf.isCheck();
        });
        
        return safeMoves;
    };

    movesById = (id) => {
        return this.moves().filter(($) => $.id === id);
    };

    apply = (move) => { 
        if (move.type === 'capture') {
            const pieceToCapture = this.find(move.position);

            if (pieceToCapture) {
                this.remove(pieceToCapture.id);
            }
        }        

        this.update(move.id, ($) => ({ ...$, position: move.position }));

        this.whiteToMove = !this.whiteToMove;
        this.onUpdate?.();
    };

    // There cannot be 2 checks at the same time
    // so we simply check whoever is moving right now
    isCheck = () => {
        const king = this.pieces.find(($) => isKing($) && (isWhite($) === this.whiteToMove));

        if (!king) {
            return false;
        }

        const moves = this._moves();
        const threat = moves.find(($) => match($.position, king.position));

        // find all possible moves for all the figures
        // see if there is a threat for u

        return !!threat;
    };

    // //
    // //
    // //
    // isMate = () => {
    //     // const king = this.pieces.find(($) => isKing($) && (isWhite($) === this.whiteToMove));
    //     // Find all possible moves for us
    //     // if there is none and we are at check it's check mate
    //     const moves = this.moves();

    //     return thi
    // };

    isGameOver = () => {
        if (this.pieces.length < 2) {
            return 'invalid_state';
        }

        if (this.isCheck() && this.moves().length === 0) {
            return 'checkmate';
        }

        if (this.moves().length === 0 && !this.isCheck()) {
            return 'stalemate';
        }

        return false;
    };
};
