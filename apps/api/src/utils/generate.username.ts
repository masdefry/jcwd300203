export const generateUsername = (name: string) => {
    const randomNum = Math.floor(Math.random() * 1000); // Random number between 0 and 999
    const username = `${name.toLowerCase().replace(/\s+/g, '')}${randomNum}`; // Remove spaces and add random number
    return username;
};