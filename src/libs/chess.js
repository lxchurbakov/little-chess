const DEFAULT_BOARD = [
    { id: 1, code: 'Q', position: { x: 0, y : 0 } },
    { id: 2, code: 'K', position: { x: 2, y : 0 } },
];

export class Chess {
    constructor (
        pieces = DEFAULT_BOARD
    ) {
        this.pieces = pieces;
    }

    piece = (id) => 
        this.pieces.find(($) => $.id === id) || null

    update = (id, predicate) => {
        this.pieces = this.pieces.map(($) => $.id === id ? predicate($) : $);
    };

    remove = (id) => {
        this.pieces = this.pieces.filter(($) => $.id !== id);
    };

    movesById = (id) => {
        const piece = this.pieces.find(($) => $.id === id);

        return [
            { x: piece.position.x, y: piece.position.y + 1 },
        ].filter((move) => {
            return move.x >= 0 && move.x < 8 && move.y >= 0 && move.y < 8;
        }).map(({ x, y }) => {
            return { id, position: { x, y } };
        });
    };

    apply = (move) => { 
        this.update(move.id, ($) => ({ ...$, position: move.position }));
        this.onUpdate?.(this.pieces);
    };
};