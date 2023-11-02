let _id = 1;
export const createid = () => _id++;

export const parsefen = (v) => {
    let x = 0;
    let y = 0;

    let result = [];

    for (let value of v.split('')) {
        if ('12345678'.includes(value)) {
            x += Number(value);
        } else if ('rnbqkpRNBQKP'.includes(value)) {
            result.push({ id: createid(), position: { x: x++, y }, code: value });
        } else if (value === '/') {
            x = 0;
            y++;
        } if (value === ' ') {
            break;
        }
    }

    // v.split('').forEach((value) => {
        
    // });

    return result;
};

export const DEFAULT_POSITION = 
    'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

// 3QQ1Q1/k7/8/1Q6/5Q2/pP6/P7/2R3K1 b - - 0 50