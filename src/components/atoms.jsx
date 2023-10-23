import styled from 'styled-components';

export const Base = styled.div`
    padding: ${props => props.p};
    margin: ${props => props.m};
    margin-bottom: ${props => props.mb};
`;

export const Container = styled(Base)`
    padding: 0 20px;
    max-width: 1280px;
    margin: 0 auto;
`;

export const Text = styled(Base)`
    font-family: Manrope, sans;
    font-size: ${props => props.size || '16px'};
    font-weight: ${props => props.weight || '400'};
    color: ${props => props.weight || '#333333'};
`;

