import React from 'react';

import { Circle, Absolute, Base, Container, Text, Image } from './components/atoms';

import { Drag, Drop } from './libs/dnd';
import { Chess } from './libs/chess';

import board from './assets/board.png';

import bn from './assets/bn.png';
import wn from './assets/wn.png';
import bb from './assets/bb.png';
import bk from './assets/bk.png';
import bp from './assets/bp.png';
import bq from './assets/bq.png';
import br from './assets/br.png';
import wb from './assets/wb.png';
import wk from './assets/wk.png';
import wp from './assets/wp.png';
import wq from './assets/wq.png';
import wr from './assets/wr.png';

export const PIECES = {
    N: wn,
    n: bn,
    B: wb,
    b: bb,
    K: wk,
    k: bk,
    P: wp,
    p: bp,
    Q: wq,
    q: bq,
    R: wr,
    r: br,
};

const STOP_DRAG = (e) => e.preventDefault();

const Piece = React.memo(({ code }) => {
    const src = React.useMemo(() => PIECES[code], [code]);

    return (
        <Image w="100%" onDragStart={STOP_DRAG} src={src} />
    );
});

const DraggablePiece = ({ id, position, code, onStart }) => {
    const grid = `(100% / 8)`;

    const handleStart = React.useCallback(() => {
        return onStart?.(id) || true;
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

const chess = new Chess();

const ChessBoard = ({ ...props }) => {
    const [grid, setGrid] = React.useState(1);
    const dropRef = React.useRef(null);

    const [pieces, setPieces] = React.useState(chess.pieces);
    const [moves, setMoves] = React.useState([]);

    React.useEffect(() => {
        chess.onUpdate = setPieces;
    }, [setPieces]);

    React.useEffect(() => {
        setGrid(dropRef.current?.getBoundingClientRect().width / 8);
    }, []);

    const start = React.useCallback((id) => {
        setMoves(chess.movesById(id));
    }, [setMoves]);

    const end = React.useCallback((id, { x, y }) => {
        const move = moves.find(($) => $.id === id);

        if (move) {
            chess.apply(move);
        }

        setMoves([]);
    }, [moves, grid, setPieces]);

    return (
        <Drop ref={dropRef} onDrop={end} {...props}>
            <Image w="100%" src={board} />

            {pieces.map(({ code, position, id }) => (
                <DraggablePiece
                    key={id}
                    id={id}
                    position={position}
                    code={code}
                    onStart={start}
                />
            ))}

            {moves.map((move, index) => {
                const h = move.position;

                return (
                    <Absolute
                        key={index}
                        w="calc(100% / 8)" 
                        left={`calc((100% / 8) * (${h.x} + 0.5) - 12px)`}
                        top={`calc((100% / 8) * (${h.y} + 0.5) - 12px)`}
                        style={{ zIndex: 1 }}
                    >
                        <Circle w="24px" h="24px" color="blue" />
                    </Absolute>
                );
            })}
        </Drop>
    );
};

export default () => {
    return (
        <Container>
            <Base p="64px 0">
                <Text mb="24px" size="32px" weight="700">
                    Little Chess
                </Text>

                <Text mb="48px" size="16px" weight="400">
                    Здесь мы будем творить создавать нашу шахматную доску.
                </Text>

                <ChessBoard mw="700px" />
            </Base>
        </Container>
    ); 
};
