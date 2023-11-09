import React from 'react';

import { Base, Container, Text } from './components/atoms';

export default () => {
    return (
        <Container>
            <Base p="64px 0">
                <Text mb="24px" size="32px" weight="700">
                    Little Chess
                </Text>

                <Text size="16px" weight="400">
                    Здесь мы будем творить создавать нашу шахматную доску.
                </Text>
            </Base>
        </Container>
    ); 
};
