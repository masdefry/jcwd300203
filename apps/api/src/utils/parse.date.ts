export const parseCustomDate = (date: string): Date => {
    const [day, month, year] = date.split('/').map(Number);
    return new Date(year, month - 1, day);
}
