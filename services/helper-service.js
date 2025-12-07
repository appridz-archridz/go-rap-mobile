let TOKEN = null;
let REFRESH_TOKEN = null;

const getToken = () => {
    return TOKEN;
}

const setToken = (token) => {
    TOKEN = token;
}

const removeToken = () => {
    TOKEN = null;
}

// 👉 Added refresh token functions
const getRefreshToken = () => {
    return REFRESH_TOKEN;
}

const setRefreshToken = (token) => {
    REFRESH_TOKEN = token;
}

const removeRefreshToken = () => {
    REFRESH_TOKEN = null;
}

export const HelperService = {
    getToken,
    setToken,
    removeToken,
    
    getRefreshToken,
    setRefreshToken,
    removeRefreshToken
};
