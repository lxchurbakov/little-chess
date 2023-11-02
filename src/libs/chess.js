import { parsefen, createid, isKing, isRook } from './utils';
import { get  }from './moves';

export const curry = (predicate, ...args) => (...$args) => predicate(...args.concat($args));

export const flatten = (a) => a.reduce((acc, b) => acc.concat(b), []);
export const zip = (a, b) => flatten(a.map(($a) => b.map(($b) => [$a, $b])));

export const match = (a, b) => a.x === b.x && a.y === b.y;
export const add = (a, b) => ({ x: a.x + b.x, y: a.y + b.y });
export const sub = (a, b) => ({ x: a.x - b.x, y: a.y - b.y });

export const isWhite = ({code}) => 'QNRBPK'.includes(code);
export const isPositionValid = (p) => p.x > -1 && p.y > -1 && p.x < 8 && p.y < 8;

let _id = 1;
export const createid = () => _id++;

const CAN_CASTLE = { K: true, Q: true, k: true, q: true };

export class Chess {
    constructor (
        pieces = [], whiteToMove = true, history = [], castle = { ...CAN_CASTLE }
    ) {
        this.pieces = pieces;
        this.whiteToMove = whiteToMove;
        this.history = history;
        this.castle = castle;
    }

    clone = () => {
        return new Chess(this.pieces.slice(), this.whiteToMove, this.history.slice(), { ...this.castle });
    };

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
        const result = parsefen(fen);

        this.pieces = result.pieces;
        this.whiteToMove = result.whiteToMove;;
        this.history = [];
        this.castle = result.castle;

        this.onUpdate?.();
    };

    // Moves related stuff

    _moves = () => {
        let moves = [];

        for (let piece of this.pieces) {
            moves = moves.concat(get(this.pieces, piece));
        }

        // Castle moves are special

        // Add here castle moves
        this.pieces.filter(($) => isKing($)).forEach((king) => {
            const kbishop = this.find(add(king.position, { x: 1, y : 0 }));
            const kknight = this.find(add(king.position, { x: 2, y : 0 }));

            const queen = this.find(add(king.position, { x: -1, y : 0 }));
            const qbishop = this.find(add(king.position, { x: -2, y : 0 }));
            const qknight = this.find(add(king.position, { x: -3, y : 0 }));

            // Check if king can castle short side
            const canCastleShortSide = !kbishop && !kknight && (isWhite(king) && this.castle.K) || (!isWhite(king) && this.castle.k);
            const canCastleLongSide = !queen && !qbishop && !qknight && (isWhite(king) && this.castle.Q) || (!isWhite(king) && this.castle.q);

            if (canCastleShortSide) {
                moves.push({ id: king.id, position: add(king.position, { x: 2, y: 0 }), type: 'castle-short' });
            }

            if (canCastleLongSide) {
                moves.push({ id: king.id, position: add(king.position, { x: -2, y: 0 }), type: 'castle-long' });
            }
        });
        

        return moves;
    };

    moves = () => {
        // Take all moves
        const unsafeMoves = this._moves();

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
        const piece = this.piece(move.id);

        this.history.push({ code: piece.code, from: piece.position, to: move.position, type: move.type });

        if (move.type === 'capture') {
            const pieceToCapture = this.find(move.position);

            if (pieceToCapture) {
                this.remove(pieceToCapture.id);
            }
        }    

        if (move.type === 'castle-short') {
            const rook = this.find(add(piece.position, { x: 3, y: 0 }));

            this.update(rook.id, ($) => ({ ...$, position: add(piece.position, { x: 1, y: 0 }) }))

            if (isWhite(piece)) {
                this.castle.K = false;
                this.castle.Q = false;
            } else {
                this.castle.k = false;
                this.castle.q = false;
            }
        }

        if (move.type === 'castle-long') {
            const rook = this.find(add(piece.position, { x: -4, y: 0 }));

            this.update(rook.id, ($) => ({ ...$, position: add(piece.position, { x: -1, y: 0 }) }))
            
            if (isWhite(piece)) {
                this.castle.K = false;
                this.castle.Q = false;
            } else {
                this.castle.k = false;
                this.castle.q = false;
            }
        }
        
        if (isKing(piece)) {
            if (isWhite(piece)) {
                this.castle.K = false;
                this.castle.Q = false;
            }

            if (!isWhite(piece)) {
                this.castle.k = false;
                this.castle.q = false;
            }
        }

        if (isRook(piece)) {
            if (isWhite(piece)) {
                if (piece.position.x === 7) {
                    this.castle.K = false;
                }

                if (piece.position.x === 0) {
                    this.castle.Q = false;
                }
            }

            if (!isWhite(piece)) {
                if (piece.position.x === 7) {
                    this.castle.k = false;
                }

                if (piece.position.x === 0) {
                    this.castle.q = false;
                }
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
