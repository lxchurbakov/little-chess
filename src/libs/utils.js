let _id = 1;
export const createid = () => _id++;

export const parsefen = (v) => {
    let x = 0;
    let y = 0;
    let result = [];

    v.split('').forEach((value) => {
        if ('rnbqkpRNBQKP'.includes(value) && x < 8 && y < 8) {
            result.push({ id: createid(), position: { x, y }, code: value });
        }

        if (value === '/') {
            x = 0;
            y++;
        } else {
            x++;
        }
    });

    return result;
};
