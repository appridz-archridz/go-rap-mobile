
let TOKEN = null;

const getToken = () => {
    return TOKEN;
}

const setToken = (token) => {
    console.log('setting token', token);
    
    TOKEN = token;
}

export const HelperService = {
    getToken,
    setToken,
};