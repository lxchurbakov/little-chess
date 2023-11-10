import React from 'react';

import { Relative, Absolute, Base, Container, Text, Image } from './components/atoms';

import { Drag, Drop } from './libs/dnd';

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
        return true;
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

const ChessBoard = ({ ...props }) => {
    const [grid, setGrid] = React.useState(1);
    const dropRef = React.useRef(null);

    const [pieces, setPieces] = React.useState([
        { id: 1, code: 'Q', position: { x: 0, y: 0 }},
        { id: 2, code: 'N', position: { x: 0, y: 1 }},
    ])

    React.useEffect(() => {
        setGrid(dropRef.current?.getBoundingClientRect().width / 8);
    }, []);

    const handleDrop = React.useCallback((data, { x, y }) => {
        setPieces(($) => {
            return $.map(($$) => {
                return $$.id === data ? {
                    ...$$, position: {
                        x: Math.floor(x / grid),
                        y: Math.floor(y / grid),
                    },
                } : $$;
            });
        });
    }, [grid, setPieces]);

    return (
        <Drop ref={dropRef} onDrop={handleDrop} {...props}>
            <Image w="100%" src={board} />

            {pieces.map(({ code, position, id }) => (
                <DraggablePiece
                    key={id}
                    id={id}
                    position={position}
                    code={code}
                />
            ))}
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
