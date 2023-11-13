import React from 'react';
import { Relative, Absolute, Clickable } from '../components/atoms';

const DropContext = React.createContext(null);
const useDrop = () => React.useContext(DropContext);

// If you don't want some kind of effect
// to depend on a callback but wnat the 
// freshest version of a callback to be
// available, this one is fo you
export const useRefCallback = (callback) => {
    const ref = React.useRef(null);
  
    ref.current = callback;
  
    return ref;
};

export const Drop = React.forwardRef(({ children, onDrop, ...props }, rootRef) => {
    const [data, setData] = React.useState(null);

    const start = React.useCallback((e, $) => {
        setData($);
    }, [setData]);

    const end = React.useCallback((e) => {
        const { clientX: x, clientY: y } = e;
        const rect = rootRef.current.getBoundingClientRect();

        onDrop?.(data, { x: x - rect.left, y: y - rect.top });
    }, [onDrop, data]);

    const drop = React.useMemo(() => {
        // console.log('drop udpated', ++value);
        return { start, end, data };
    }, [start, end, data]);

    return (
        <DropContext.Provider value={drop}>
            <Relative ref={rootRef} {...props}>
                {children}
            </Relative>
        </DropContext.Provider>
    );
});

export const Drag = ({ data, children, onStart, onEnd, ...props }) => {
    const drop = useRefCallback(useDrop()); // without this callback captures old `drop` object
    const nodeRef = React.useRef(null);

    const start = React.useCallback((e) => {
        const start = { x: e.clientX, y: e.clientY };

        const mousemove = (e) => {
            nodeRef.current.style.transform = `translateX(${e.clientX - start.x}px) translateY(${e.clientY - start.y}px)`;
        };

        const mouseup = (e) => {
            nodeRef.current.style.transform = `translateX(0px) translateY(0px)`;
            // console.log('call end', drop.current.value)
            drop.current.end(e);
            onEnd?.(e);

            window.removeEventListener('mousemove', mousemove);
            window.removeEventListener('mouseup', mouseup);
        };

        if (onStart?.(data)) {
            drop.current.start(e, data);

            window.addEventListener('mousemove', mousemove);
            window.addEventListener('mouseup', mouseup);
        }
    }, [onStart, data]);

    return (
        <Absolute ref={nodeRef} {...props}>
            <Clickable onMouseDown={start}>
                {children}
            </Clickable>
        </Absolute>
    );
};
