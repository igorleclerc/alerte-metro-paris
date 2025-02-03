const admin = require('firebase-admin');

// Vérifie si la variable d'environnement est définie
if (!process.env.FIREBASE_CREDENTIALS) {
    throw new Error("❌ La variable d'environnement FIREBASE_CREDENTIALS est manquante !");
}

// Convertir la variable d'environnement JSON en objet
const firebaseCredentials = JSON.parse(process.env.FIREBASE_CREDENTIALS);

// Initialisation propre de Firebase (évite l'erreur de double initialisation)
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(firebaseCredentials),
    });
}

const db = admin.firestore();
const disruptionsCollection = db.collection('published_disruptions');

/**
 * Vérifie si une perturbation a déjà été publiée.
 * @param {string} disruptionId - L'ID unique de la perturbation
 * @returns {Promise<boolean>} - True si elle a déjà été publiée, False sinon
 */
async function isDisruptionPublished(disruptionId) {
    const doc = await disruptionsCollection.doc(disruptionId).get();
    return doc.exists;
}

/**
 * Marque une perturbation comme publiée (seulement après un post réussi).
 * @param {string} disruptionId - L'ID unique de la perturbation
 */
async function markDisruptionAsPublished(disruptionId) {
    await disruptionsCollection.doc(disruptionId).set({
        published: true,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
}

module.exports = { isDisruptionPublished, markDisruptionAsPublished };