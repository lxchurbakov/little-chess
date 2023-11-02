import React from 'react';

import { Clickable, Base, Flex, Text, Card } from './atoms';

const formatPosition = ({ x, y }) => {
    return `${'abcdefgh'[x]}${y + 1}`;
};

const formatCode = (code, from, to) => {
    if (code.toLowerCase() === 'p') {
        if (from.x !== to.x) {
            return formatPosition(from)[0];
        } else {
            return '';
        }
    }

    return {
        'K': '♔',
        'Q': '♕',
        'R': '♖',
        'B': '♗',
        'N': '♘',
        'P': '♙',
        'k': '♚',
        'q': '♛',
        'r': '♜',
        'b': '♝',
        'n': '♞',
        'p': '♟︎',
    }[code];
};

const format = ({ code, from, to, type }) => {
    if (type === 'castle-short') {
        return 'O-O'
    }

    if (type === 'castle-long') {
        return 'O-O-O'
    }

    return `${formatCode(code, from, to)}${type === 'capture' ? 'x' : ''}${formatPosition(to)}`;
};

export const History = ({ history, check, status, onRestart, onFlip, ...props }) => {
    const rows = React.useMemo(() => {
        return history.reduce((acc, entry) => {
            if (acc.length === 0) {
                return [[entry]];
            } else {
                const last = acc[acc.length - 1];

                if (last.length === 1) {
                    return acc.map(($, i) => i === acc.length - 1 ? $.concat([entry]) : $);
                } else {
                    return acc.concat([[entry]]);
                }
            }
        }, [])
    }, [history]);

    return (
        <Card r="4px" background="#cddae0" w="100%" {...props}>
            <Base p="4px 0" mb="12px">
                <Text mb="12px" align="center" size="18px" weight="800" color="#333">Moves History</Text>

                <Flex w="100%" align="center" justify="center">
                    <Clickable onClick={onFlip}>
                        <Card w="auto" p="8px 12px" r="4px" background="#191919">
                            <Text size="14px" weight="800" color="white">Flip Board</Text>
                        </Card>
                    </Clickable>
                </Flex>
            </Base>

            <Base mb="12px" mh="360px" style={{ overflowY: 'auto', borderTop: '1px solid #333' }}>
                {rows.map((row, i) => (
                    <Flex style={{ borderBottom: '1px solid #333' }} w="100%" key={i}>
                        <Card style={{ flexShrink: 0 }} w="24px" p="4px">
                            <Text color="#777">{i + 1}</Text>
                        </Card>

                        {row.map((move, j) => (
                            <Card key={j} w="100%" p="4px 2px">
                                <Text color="#333">{format(move)}</Text>
                            </Card>
                        ))}
                    </Flex>
                ))}
            </Base>

            {status !== false && (
                <Base>
                    {status === 'checkmate' && (
                        <Flex align="center" justify="center" dir="column">
                            <Text mb="12px" align="center" weight="800">Game is over. Checkmate.</Text>

                            <Clickable onClick={onRestart}>
                                <Card p="8px 12px" r="4px" background="#191919">
                                    <Text weight="800" color="white">Restart</Text>
                                </Card>
                            </Clickable>
                        </Flex>
                    )}

                    {status === 'stalemate' && (
                        <Flex align="center" justify="center" dir="column">
                            <Text mb="12px" align="center" weight="800">Game is over. Stalemate.</Text>

                            <Clickable onClick={onRestart}>
                                <Card p="8px 12px" r="4px" background="#191919">
                                    <Text weight="800" color="white">Restart</Text>
                                </Card>
                            </Clickable>
                        </Flex>
                    )}
                </Base>
            )}
        </Card>
    );
};
