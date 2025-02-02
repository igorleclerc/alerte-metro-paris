require('dotenv').config();

module.exports = {
    API_KEY: process.env.IDFM_API_KEY,
    BLUESKY_EMAIL: process.env.BLUESKY_EMAIL,
    BLUESKY_PASSWORD: process.env.BLUESKY_PASSWORD,
    FIREBASE_CREDENTIALS: process.env.FIREBASE_CREDENTIALS,
    API_URL: 'https://prim.iledefrance-mobilites.fr/marketplace/disruptions_bulk/disruptions/v2'
};