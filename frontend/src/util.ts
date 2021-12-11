
export const ENDPOINT = () => {
    const port = +window.location.port - (process.env.NODE_ENV === 'production' ? 0 : 1);
    return `http://${process.env.REACT_APP_BACK_END_ADDRESS}:${port}`
}