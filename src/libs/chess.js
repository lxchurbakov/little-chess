import { parsefen, createid, isKing } from './utils';
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
