const axios = require('axios');
const { API_KEY, API_URL } = require('./config');

async function getDisruptions() {
    try {
        const response = await axios.get(API_URL, {
            headers: {
                'apiKey': API_KEY,
            },
        });

        if (!response.data || !Array.isArray(response.data.disruptions)) {
            console.error('❌ Format de réponse inattendu:', JSON.stringify(response.data, null, 2));
            return [];
        }

        console.log('✅ Données API reçues:', response.data.disruptions.length, "perturbations.");

        return response.data.disruptions.filter(disruption =>
            disruption.title.includes('Métro') && disruption.severity === 'BLOQUANTE'
        );
    } catch (error) {
        console.error('❌ Erreur API IDFM:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
        return [];
    }
}

module.exports = { getDisruptions };