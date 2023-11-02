export const isWhite = ({code}) => 'QNRBPK'.includes(code);
export const isPositionValid = (p) => p.x > -1 && p.y > -1 && p.x < 8 && p.y < 8;

export const match = (a, b) => a.x === b.x && a.y === b.y;
export const add = (a, b) => ({ x: a.x + b.x, y: a.y + b.y });
export const sub = (a, b) => ({ x: a.x - b.x, y: a.y - b.y });

export const curry = (predicate, ...args) => (...$args) => predicate(...args.concat($args));

export const flatten = (a) => a.reduce((acc, b) => acc.concat(b), []);
export const zip = (a, b) => flatten(a.map(($a) => b.map(($b) => [$a, $b])));

const isBishop = ({code}) => code.toLowerCase() === 'b';
const isKing = ({code}) => code.toLowerCase() === 'k';
const isQueen = ({code}) => code.toLowerCase() === 'q';
const isKnight = ({code}) => code.toLowerCase() === 'n';
const isPawn = ({code}) => code.toLowerCase() === 'p';
const isRook = ({code}) => code.toLowerCase() === 'r';

export const get = (pieces, pieceToMove) => {
    const isOccupied = (p) => 
        ((piece) => piece ? (isWhite(piece) ? 'white' : 'black') : null)(pieces.find(($) => match($.position, p)));
    
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

            moves.push({ id: pieceToMove.id, position: { ...position }, type: occupancy === null ? 'simple' : 'capture' });

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
            
            return { id: pieceToMove.id, position, type: !!occupancy ? 'capture' : 'simple' };
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
            .filter((p) => !!pieces.find(($) => match($.position, p)));
        
        const captureMoves = enemies.map((position) => {
            const occupancy = isOccupied(position);
            const validity = isPositionValid(position);
            const cannotOccupyPosition = occupancy === null || (occupancy === 'white') === isWhite(pieceToMove);

            return (!validity || cannotOccupyPosition) ? null : position;
        }).filter(Boolean);

        return flatten([
            simpleMoves.map((position) => ({ id: pieceToMove.id, position, type: 'simple' })),
            captureMoves.map((position) => ({ id: pieceToMove.id,  position, type: 'capture' })),
        ]);
    }

    if (isKing(pieceToMove)) {
        return zip([-1, 0, 1], [-1, 0, 1]).map(([x, y]) => {
            const position = add(pieceToMove.position, { x, y })
            const occupancy = isOccupied(position);
            const validity = isPositionValid(position);
            const cannotOccupyPosition = occupancy !== null && (occupancy === 'white') === isWhite(pieceToMove);

            if (!validity || cannotOccupyPosition) {
                return null
            }
            
            return { id: pieceToMove.id, position, type: !!occupancy ? 'capture' : 'simple' };
        }).filter(Boolean);
    }

    return [];
};




    

    

    