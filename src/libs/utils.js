export const isBishop = ({code}) => code.toLowerCase() === 'b';
export const isKing = ({code}) => code.toLowerCase() === 'k';
export const isQueen = ({code}) => code.toLowerCase() === 'q';
export const isKnight = ({code}) => code.toLowerCase() === 'n';
export const isPawn = ({code}) => code.toLowerCase() === 'p';
export const isRook = ({code}) => code.toLowerCase() === 'r';

export const parsefen = (fen) => {
    const [pieces, whoToMove, castling] = fen.split(' ');

    let x = 0;
    let y = 0;

    let result = [];
    let id = 1;

    for (let value of pieces.split('')) {
        if ('12345678'.includes(value)) {
            x += Number(value);
        } else if ('rnbqkpRNBQKP'.includes(value)) {
            result.push({ id: id++, position: { x: x++, y }, code: value });
        } else if (value === '/') {
            x = 0;
            y++;
        }
    }

    return {
        pieces: result.map((r) => ({ ...r, position: {x:r.position.x, y: 7 - r.position.y } })),
        whiteToMove: whoToMove === 'w',
        castle: {
            K: castling.includes('K'),
            Q: castling.includes('Q'),
            k: castling.includes('k'),
            q: castling.includes('q'),
        },
    };
};
