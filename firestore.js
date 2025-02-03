const admin = require('firebase-admin');
const { FIREBASE_CREDENTIALS } = require('./config');

// Initialisation propre de Firebase (évite l'erreur de double initialisation)
if (!admin.apps.length) {
    const serviceAccount = require(`./${FIREBASE_CREDENTIALS}`);

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();
const disruptionsCollection = db.collection('published_disruptions');

/**
 * Vérifie si une perturbation a déjà été publiée.
 */
async function isDisruptionPublished(disruptionId) {
    const doc = await disruptionsCollection.doc(disruptionId).get();
    return doc.exists;
}

/**
 * Marque une perturbation comme publiée (seulement après un post réussi).
 */
async function markDisruptionAsPublished(disruptionId) {
    await disruptionsCollection.doc(disruptionId).set({ 
        published: true, 
        timestamp: admin.firestore.FieldValue.serverTimestamp() 
    });
}

module.exports = { isDisruptionPublished, markDisruptionAsPublished };