import React from 'react';

import { Relative, Absolute, Base, Container, Text, Image } from './components/atoms';

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

const ChessBoard = ({ ...props }) => {
    const grid = `(100% / 8)`;

    const [pieces, setPieces] = React.useState([
        { code: 'q', position: { x: 2, y: 1 } },
        { code: 'N', position: { x: 3, y: 1 } },
    ]);

    return (
        <Relative {...props}>
            <Image w="100%" src={board} />

            {pieces.map((piece) => (
                <Absolute
                    w={`calc${grid}`} 
                    left={`calc(${grid} * ${piece.position.x})`}
                    top={`calc(${grid} * ${piece.position.y})`}
                    style={{ zIndex: 2 }}
                >
                    <Image w="100%" src={PIECES[piece.code]} />
                </Absolute>
            ))}
        </Relative>
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
