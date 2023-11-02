import React from 'react';

import { Circle, Clickable, Relative, Absolute, Image, Base, Container, Text } from './components/atoms';

import { board, PIECES } from './libs/images';
import { DEFAULT_POSITION,  } from './libs/utils';
import { Chess, useChess, isWhite, match } from './libs/chess';

import { Drag, Drop } from './libs/dnd';

const STOP_DRAG = (e) => {
    e.preventDefault();
    return false;
};

const Piece = React.memo(({ code }) => {
    const src = React.useMemo(() => PIECES[code], [code]);

    return (
        <Image w="100%" onDragStart={STOP_DRAG} src={src} />
    );
});

const DraggablePiece = ({ id, position, code, onStart }) => {
    const grid = `(100% / 8)`;

    const handleStart = React.useCallback(() => {
        return onStart?.(id);
    }, [onStart, id]);

    return (
        <Drag 
            data={id}
            w={`calc${grid}`} 
            left={`calc(${grid} * ${position.x})`}
            top={`calc(${grid} * ${position.y})`}
            style={{ zIndex: 2 }}
            onStart={handleStart}
        >
            <Piece code={code} />
        </Drag>
    )
};

const ChessBoardView = ({ pieces, circles, onStart, onEnd, ...props }) => {
    const [grid, setGrid] = React.useState(1);
    const dropRef = React.useRef(null);

    React.useEffect(() => {
        setGrid(dropRef.current?.getBoundingClientRect().width / 8);
    }, []);

    const handleDrop = React.useCallback((data, { x, y }) => {
        onEnd?.(data, {
            x: Math.floor(x / grid),
            y: Math.floor(y / grid),
        });
    }, [grid, onEnd]);

    return (
        <Drop ref={dropRef} mw="700px" w="100%" onDrop={handleDrop} {...props}>
            <Image w="100%" src={board} />

            {pieces.map(({ code, position, id }) => (
                <DraggablePiece
                    key={id}
                    id={id}
                    onStart={onStart}
                    position={position}
                    code={code}
                />
            ))}

            {circles.map(({ position: h }, index) => (
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
        </Drop>
    );
};

const chess = new Chess();

const ChessBoard = () => {
    const forceUpdate = (([, setState]) => () => setState(($) => !$))(React.useState(false));

    React.useEffect(() => {
        chess.onUpdate = forceUpdate;
    }, [forceUpdate]);

    // Store the game object itself (expressed via hook)
    // const chess = useChess();
    // Store places we should put our highlighs to
    const [moves, setMoves] = React.useState([]);
    // Figure out who is to move
    // const [whiteToMove, setWhiteToMove] = React.useState(true);

    // Load default position on startup
    React.useEffect(() => {
        // chess.load(DEFAULT_POSITION);
        chess.load(`3QQ1Q1/k7/8/1Q6/5Q2/pP6/P7/2R3K1 b - - 0 50`);
        // setWhiteToMove(true);
    }, []);

    const start = React.useCallback((id) => {
        const piece = chess.piece(id);
        const possibleMoves = chess.movesById(id);

        console.log(possibleMoves)

        // if (isWhite(piece) !== whiteToMove) {
        //     return false;
        // }

        if (possibleMoves.length === 0) {
            return false;
        }

        setMoves(possibleMoves);     

        return true;
    }, [setMoves, chess]);

    console.log(chess.isCheck());
    console.log(chess.isGameOver());

    const end = React.useCallback((id, { x, y }) => {
        const possibleMove = moves.find(($) => match($.position, { x, y }));

        if (!!possibleMove) {
            chess.apply(possibleMove);
        }

        setMoves([]);
        // setWhiteToMove(($) => !$);
    }, [moves, setMoves, chess]);

    return (
        <ChessBoardView
            pieces={chess.pieces}
            circles={moves}
            onStart={start}
            onEnd={end}
        />
    );  
};

export default () => {
    return (
        <Container>
            <Base p="64px 0">
                <Text mb="12px" size="32px" weight="800">Little Chess</Text>
                <Text mb="48px" size="16px" weight="400">Здесь мы будем творить создавать нашу шахматную доску.</Text>

                <ChessBoard />
            </Base>
        </Container>
    ); 
};
