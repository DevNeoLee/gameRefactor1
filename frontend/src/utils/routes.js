let HOST;
if (process.env.NODE_ENV === 'production') {
    HOST = process.env.REACT_APP_URL_PROD
} else {
    HOST = process.env.REACT_APP_URL_DEV
}

export default HOST;
