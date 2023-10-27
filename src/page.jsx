import React from 'react';

import { Circle, Clickable, Relative, Absolute, Image, Base, Container, Text } from './components/atoms';
import { parsefen, createid } from './libs/utils';
import { board, PIECES } from './libs/images';

const match = (a, b) => a.x === b.x && a.y === b.y;
const add = (a, b) => ({ x: a.x + b.x, y: a.y + b.y });
const isWhite = ({code}) => 'QNRBPK'.includes(code);
const isPositionValid = (p) => p.x > -1 && p.y > -1 && p.x < 8 && p.y < 8;

const INITPOS = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

// const movesForBishop = (start)

const useChess = () => {
    const [white, setWhite] = React.useState(true);
    const [pieces, setPieces] = React.useState([]);

    const find = React.useCallback((p) => {
        return pieces.find(($) => match($.position, p));
    }, [pieces]);

    const get = React.useCallback((id) => {
        return pieces.find(($) => $.id === id);
    }, [pieces]);

    const load = React.useCallback((fen) => {
        setPieces(parsefen(fen));
    }, []);

    const move = React.useCallback((id, newposition) => {
        const piece = find(newposition);
        const pieceToMove = get(id);

        if (piece && isWhite(piece) !== isWhite(pieceToMove)) {
            // throw new Error(`cannot_move_here`);
            setPieces(($) => {
                return $.filter(($$) => {
                    return $$.id !== piece.id;
                });
            });
        }

        setPieces(($) => {
            return $.map(($$) => {
                if ($$.id === id) {
                    return { ...$$, position: newposition };
                } else {
                    return $$;
                }
            });
        });

        setWhite(($) => !$);
    }, [setWhite, find, pieces, setPieces]);

    // const can = React.useCallback((id, p) => {
    //     const piece = get(id);

    //     if (!piece) {
    //         throw new Error(`piece_not_found`);
    //     }

    //     if (piece.code.toLowerCase() === 'r') {
    //         return piece.position.x === p.x || piece.position.y === p.y;
    //     }
    // }, [get]);

    const moves = React.useCallback((id) => {
        const piece = pieces.find(($) => $.id === id);

        const check = (position) => {
            if (!isPositionValid(position)) {
                return false;
            }

            const pieceInPosition = find(position);

            if (!pieceInPosition) {
                return 'move';
            } else {
                if (isWhite(pieceInPosition) === isWhite(piece)) {
                    return false;
                } else {
                    return 'capture';
                }
            }
        };

        const walk = (position, predicate) => {
            let result = [];
    
            for (let i = 0; i < 8; ++i) {
                position = predicate(position);

                const checkResult = check(position);

                if (checkResult === false) {
                    break;
                } else if (checkResult === 'capture') {
                    result.push({ position: { ...position }, type: 'capture' });
                    break
                } else if (checkResult === 'move') {
                    result.push({ position: { ...position }, type: 'move' });
                }
            }
    
            return result;
        };

        if (piece.code.toLowerCase() === 'b') {
            return [
                ...walk({ ...piece.position }, (p) => ({ x: p.x - 1, y: p.y - 1 })),
                ...walk({ ...piece.position }, (p) => ({ x: p.x - 1, y: p.y + 1 })),
                ...walk({ ...piece.position }, (p) => ({ x: p.x + 1, y: p.y + 1 })),
                ...walk({ ...piece.position }, (p) => ({ x: p.x + 1, y: p.y - 1 })),
            ];
        }

        if (piece.code.toLowerCase() === 'r') {
            return [
                ...walk({ ...piece.position }, (p) => ({ x: p.x, y: p.y - 1 })),
                ...walk({ ...piece.position }, (p) => ({ x: p.x, y: p.y + 1 })),
                ...walk({ ...piece.position }, (p) => ({ x: p.x - 1, y: p.y })),
                ...walk({ ...piece.position }, (p) => ({ x: p.x + 1, y: p.y })),
            ];
        }
    
        if (piece.code.toLowerCase() === 'q') {
            return [
                ...walk({ ...piece.position }, (p) => ({ x: p.x - 1, y: p.y - 1 })),
                ...walk({ ...piece.position }, (p) => ({ x: p.x - 1, y: p.y + 1 })),
                ...walk({ ...piece.position }, (p) => ({ x: p.x + 1, y: p.y + 1 })),
                ...walk({ ...piece.position }, (p) => ({ x: p.x + 1, y: p.y - 1 })),
                ...walk({ ...piece.position }, (p) => ({ x: p.x, y: p.y - 1 })),
                ...walk({ ...piece.position }, (p) => ({ x: p.x, y: p.y + 1 })),
                ...walk({ ...piece.position }, (p) => ({ x: p.x - 1, y: p.y })),
                ...walk({ ...piece.position }, (p) => ({ x: p.x + 1, y: p.y })),
            ];
        }
    
        const flatten = (a) => a.reduce((acc, group) => acc.concat(group), []);
        const zip = (a, b) => flatten(a.map((va) => b.map((vb) => [va, vb])));

        if (piece.code.toLowerCase() === 'n') {
            return [
                ...zip([2, -2], [-1, 1]).map(([x, y]) => ({ x, y })),
                ...zip([-1, 1], [2, -2]).map(([x, y]) => ({ x, y })),
            ]
                .map((p) => add(p, piece.position))
                .map((p) => check(p) && ({ position: p, type: check(p) }))
                .filter(Boolean);
        }
    
        if (piece.code.toLowerCase() === 'p') {
            const canDoTwo = (piece.code === 'p' && piece.position.y === 1) 
                || (piece.code === 'P' && piece.position.y === 6);
            
            const direction = piece.code === 'P' ? -1 : 1;
    
            const opposites = [-1, 1]
                .map((x) => find({ x: x + piece.position.x, y: piece.position.y + direction }))
                .filter(Boolean)
                .map((p) => ({ ...p.position, canTake: true }));

            return [
                { x: piece.position.x, y: piece.position.y + direction, canTake: false },
                canDoTwo ? { x: piece.position.x, y: piece.position.y + direction * 2, canTake: false } : null,
                ...opposites,
            ].filter(Boolean).map((p) => {
                const checkResult = check(p);

                if (checkResult) {
                    if (checkResult === 'capture' && !p.canTake) {
                        return null;
                    }
                    
                    return { position: p, type: checkResult };
                }
            }).filter(Boolean)
            ;
        }
    
        if (piece.code.toLowerCase() === 'k') {
            const options = [
                { x: -1, y: -1 },
                { x: -1, y: 0 },
                { x: -1, y: 1 },
                { x: 0, y: -1 },
                // { x: 0, y: 0 },
                { x: 0, y: 1 },
                { x: 1, y: -1 },
                { x: 1, y: 0 },
                { x: 1, y: 1 },
            ];
            
            return options.map((p) => add(p, piece.position)).map((p) => {
                const checkResult = check(p);

                if (checkResult) {
                    return { position: p, type: checkResult };
                }
            })
            .filter(Boolean);
        }

        return [];
        // return [{ position: x: piece.position.x, y: piece.position.y - 1 }];
    }, [find, pieces]);

    const check = React.useMemo(() => {
        return ['K', 'k'].map((code) => {
            const king = pieces.find(($) => $.code === code);

            for (let piece of pieces) {
                const pieceMoves = moves(piece.id);
                const threat = pieceMoves.find((move) => match(move.position, king.position));
                
                if (threat) {
                    return code;
                }
            }

            return null;
        }).filter(Boolean).map((code) => isWhite({ code }) ? 'white' : 'black')[0];
    }, [moves, pieces]);

    console.log(check)

    return React.useMemo(() => ({ 
        pieces, move, get, find, load, move, moves, white, check
    }), [pieces, move, get, find, move, load, moves, white, check]);
};


const Chess = ({ ...props }) => {
    const { moves, load, pieces, move, white } = useChess();

    React.useEffect(() => load(INITPOS), []);

    const [highlight, setHightlight] = React.useState([]);

    const start = (id) => (e) => {
        const { clientX: x, clientY: y } = e;

        const node = e.target;
        const parent = e.target.parentElement.parentElement.parentNode;
        const rect = parent.getBoundingClientRect();
        const grid = rect.width / 8;
        const start = { x, y };

        // TODO export somehow paths where can be moved
        const options = moves(id);
        setHightlight([...options]);

        // console.log({options})

        // console.log(rect, grid)

        const mousemove = ({ clientX: x, clientY: y }) => {
            const offsetx = x - start.x;
            const offsety = y - start.y;

            node.style.transform = `translateX(${offsetx}px) translateY(${offsety}px)`;
        };

        const mouseup = ({ clientX: x, clientY: y }) => {
            // TODO check if can be moved here
            const newx = Math.floor((x - rect.left) / grid);
            const newy = Math.floor((y - rect.top) / grid);

            if (!!options.find(($) => {
                return $.position.x === newx && $.position.y === newy;
            })) {
                move(id, {
                    x: newx,
                    y: newy,
                });
            }      
            
            setHightlight([])

            node.style.transform = `none`;

            window.removeEventListener('mousemove', mousemove);
            window.removeEventListener('mouseup', mouseup);
        };

        window.addEventListener('mousemove', mousemove);
        window.addEventListener('mouseup', mouseup);

        const piece = pieces.find(($) => $.id === id);

        if (isWhite(piece) && !white) {
            mouseup(e);
        } else if (!isWhite(piece) && white) {
            mouseup(e);
        } else if (options.length === 0) {
            mouseup(e)
        }
    };

    // console.log(highlight)

    return (
        <Relative mw="700px" w="100%" {...props}>
            <Image w="100%" src={board} />

            {pieces.map((piece, index) => (
                <Absolute 
                    key={index}
                    w="calc(100% / 8)" 
                    left={`calc((100% / 8) * ${piece.position.x})`}
                    top={`calc((100% / 8) * ${piece.position.y})`}
                    style={{ zIndex: 2 }}
                >
                    <Clickable onMouseDown={start(piece.id)}>
                        <Image w="100%" onDragStart={e => e.preventDefault()} src={PIECES[piece.code]} />
                    </Clickable>
                </Absolute>
            ))}

            {highlight.map(({ position: h }, index) => (
                <Absolute 
                    key={index}
                    w="calc(100% / 8)" 
                    left={`calc((100% / 8) * (${h.x} + 0.5) - 12px)`}
                    top={`calc((100% / 8) * (${h.y} + 0.5) - 12px)`}
                    style={{ zIndex: 1 }}
                >
                    <Circle w="24px" h="24px" style={{ background: '#9453c9' }} />
                </Absolute>
            ))}
        </Relative>
    );
};

export default () => {
    return (
        <Container>
            <Base p="64px 0">
                <Text mb="12px" size="32px" weight="800">Little Chess</Text>

                <Text mb="48px" size="16px" weight="400">Здесь мы будем творить создавать нашу шахматную доску.</Text>

                <Chess />
            </Base>
        </Container>
    ); 
};
