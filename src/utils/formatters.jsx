export const formatStrokeCount = (count) => {
    if (count === 1) return '1 úder';
    if (count >= 2 && count <= 4) return `${count} údery`;
    return `${count} úderů`;
};