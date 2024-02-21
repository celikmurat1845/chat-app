let CLIENT_URL;

if (process.env.NODE_ENV === 'production') {
    CLIENT_URL = process.env.CLIENT_URL_PROD;
} else {
    CLIENT_URL = process.env.CLIENT_URL_DEV;
}

module.exports = CLIENT_URL;
