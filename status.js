import { BskyAgent } from '@atproto/api';
import dotenv from 'dotenv';
import axios from 'axios';
import admin from 'firebase-admin';

dotenv.config();

// Initialisation Firebase
const serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// Connexion au compte BlueSky
const agent = new BskyAgent({ service: 'https://bsky.social' });

async function checkMessages() {
  await agent.login({ identifier: process.env.BLUESKY_EMAIL, password: process.env.BLUESKY_PASSWORD });

  // Récupérer les derniers messages
  const messages = await agent.api.app.bsky.graph.getList({ limit: 10 });

  for (const msg of messages.data.lists) {
    const sender = msg.author.did;
    const content = msg.text.trim().toLowerCase();

    console.log(`📩 Message reçu de ${sender}: ${content}`);

    if (content === '/status') {
      const statusMessage = await checkStatus();
      await sendReply(sender, statusMessage);
    }
  }
}

// Fonction pour envoyer une réponse
async function sendReply(userDid, message) {
  await agent.api.app.bsky.graph.post({
    reply: { root: userDid },
    text: message,
  });
  console.log(`✅ Réponse envoyée à ${userDid}: ${message}`);
}

// Vérifie l'état du bot en effectuant 3 pings
async function checkStatus() {
  let blueskyStatus = '🟢 BlueSky : OK';
  let apiStatus = '🟢 API : OK';
  let firestoreStatus = '🟢 Firestore : OK';

  // 1️⃣ Test de connexion à BlueSky
  try {
    await agent.api.app.bsky.feed.getTimeline();
  } catch (error) {
    blueskyStatus = '🔴 BlueSky : Erreur';
  }

  // 2️⃣ Test de l'API des perturbations
  try {
    const response = await axios.get('https://api-ratp-idfm.com/perturbations');
    if (!response.data || response.status !== 200) throw new Error();
  } catch (error) {
    apiStatus = '🔴 API : Erreur';
  }

  // 3️⃣ Test de connexion à Firestore
  try {
    const db = admin.firestore();
    await db.collection('test').doc('ping').set({ timestamp: Date.now() });
  } catch (error) {
    firestoreStatus = '🔴 Firestore : Erreur';
  }

  return `🔍 **Status du bot :**\n${blueskyStatus}\n${apiStatus}\n${firestoreStatus}`;
}

// Vérifie les messages toutes les 5 minutes
setInterval(checkMessages, 300000);