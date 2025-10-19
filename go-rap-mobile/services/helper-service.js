
let TOKEN = null;

const getToken = () => {
    return TOKEN;
}

const setToken = (token) => {
    TOKEN = token;
}

const removeToken = () => {
    TOKEN = null;
}

export const HelperService = {
    getToken,
    setToken,
    removeToken
};