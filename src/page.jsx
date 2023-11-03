import React from 'react';

import { Flex, Circle, Absolute, Image, Base, Container, Text } from './components/atoms';

import { board, PIECES } from './libs/images';
import { Chess, match } from './libs/chess';

import { Drag, Drop } from './libs/dnd';

import { History } from './components/history';

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

const ChessBoardView = ({ pieces, circles, onStart, onEnd, isFlip, ...props }) => {
    const [grid, setGrid] = React.useState(1);
    const dropRef = React.useRef(null);

    const flip = React.useCallback(({ x, y }) => {
        return { x: !isFlip ? 7 - x : x, y: isFlip ? 7 - y : y };
    }, [isFlip]);

    React.useEffect(() => {
        setGrid(dropRef.current?.getBoundingClientRect().width / 8);
    }, []);

    const handleDrop = React.useCallback((data, { x, y }) => {
        onEnd?.(data, flip({
            x: Math.floor(x / grid),
            y: Math.floor(y / grid),
        }));
    }, [grid, flip, onEnd]);

    return (
        <Drop ref={dropRef} onDrop={handleDrop} {...props}>
            <Image w="100%" src={board} />

            {pieces.map(({ code, position, id }) => (
                <DraggablePiece
                    key={id}
                    id={id}
                    onStart={onStart}
                    position={flip(position)}
                    code={code}
                />
            ))}

            {circles.map((circle, index) => {
                const h = flip(circle.position);

                return (
                    <Absolute 
                        key={index}
                        w="calc(100% / 8)" 
                        left={`calc((100% / 8) * (${h.x} + 0.5) - 12px)`}
                        top={`calc((100% / 8) * (${h.y} + 0.5) - 12px)`}
                        style={{ zIndex: 1 }}
                    >
                        <Circle w="24px" h="24px" style={{ background: '#9453c9' }} />
                    </Absolute>
                );
            })}
        </Drop>
    );
};

const chess = new Chess();

const ChessBoardWithHistory = () => {
    const [isFlip, setIsFlip] = React.useState(true);

    const restart = React.useCallback(() => {
        // chess.load('r1bqkb1r/pp3p2/2n2n1p/3p2p1/8/2N1P1B1/PPP2PPP/R2QKBNR w KQkq - 1 9');
        chess.load('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
        // chess.load('2r2rk1/ppbQpp1p/6p1/8/4P3/8/P3KPqP/5R2 w - - 0 27');
        // chess.load(`3QQ1Q1/k7/8/1Q6/5Q2/pP6/P7/2R3K1 b - - 0 50`);
    }, []);

    const [history, setHistory] = React.useState([]);
    // const forceUpdate = (([, setState]) => () => setState(($) => !$))(React.useState(false));

    React.useEffect(() => {
        chess.onUpdate = () => {
            setHistory(chess.history.slice());
        };
    }, [setHistory]);

    const [moves, setMoves] = React.useState([]);

    // Load default position on startup
    React.useEffect(() => {
        restart();
    }, []);

    const start = React.useCallback((id) => {
        const possibleMoves = chess.movesById(id);

        setMoves(possibleMoves);     

        return (possibleMoves.length > 0);
    }, [setMoves, chess]);

    // console.log(chess.isCheck());
    // console.log(chess.isGameOver());

    const end = React.useCallback((id, { x, y }) => {
        const possibleMove = moves.find(($) => match($.position, { x, y }));

        if (!!possibleMove) {
            chess.apply(possibleMove);
        }

        setMoves([]);
    }, [moves, setMoves, chess]);

    return (
        <Flex gap="12px">
            <ChessBoardView
                mw="700px" 
                w="100%"
                pieces={chess.pieces}
                circles={moves}
                onStart={start}
                onEnd={end}
                isFlip={isFlip}
            />

            <History 
                history={history} 
                check={chess.isCheck()}
                status={chess.isGameOver()}
                onRestart={restart}
                onFlip={() => setIsFlip($ => !$)}
                mw="300px" 
            />
        </Flex>
    );  
};

export default () => {
    return (
        <Container>
            <Base p="64px 0">
                <Text mb="12px" size="32px" weight="800">Little Chess</Text>
                <Text mb="48px" size="16px" weight="400">Здесь мы будем творить создавать нашу шахматную доску.</Text>

                <ChessBoardWithHistory />
            </Base>
        </Container>
    ); 
};
