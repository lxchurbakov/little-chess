import styled from 'styled-components';

export const Base = styled.div`
    padding: ${props => props.p};
    margin: ${props => props.m};
    margin-bottom: ${props => props.mb};
    width: ${props => props.w};
    height: ${props => props.h};
    max-width: ${props => props.mw};
    max-height: ${props => props.mh};
`;

export const Container = styled(Base)`
    padding: 0 20px;
    max-width: 1280px;
    margin: 0 auto;
`;

export const Text = styled(Base)`
    font-family: Raleway, sans-serif;
    font-size: ${props => props.size || '16px'};
    font-weight: ${props => props.weight || '400'};
    color: ${props => props.color || '#333333'};
    text-align: ${props => props.align};
`;

export const Image = styled.img`
    padding: ${props => props.p};
    margin: ${props => props.m};
    margin-bottom: ${props => props.mb};
    width: ${props => props.w};
`;

export const Relative = styled(Base)`
    position: relative;
`;

export const Absolute = styled(Base)`
    position: absolute;
    top: ${props => props.top};
    left: ${props => props.left};
    right: ${props => props.right};
    bottom: ${props => props.bottom};
`;