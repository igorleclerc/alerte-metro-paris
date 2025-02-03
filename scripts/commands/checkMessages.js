const { loginToBlueSky } = require("../../services/blueSky.js");

let agent = null; // L'agent BlueSky authentifié

// Fonction pour récupérer les conversations
async function getConversations() {
    if (!agent?.session) {
        console.log("🔄 Tentative de reconnexion à BlueSky...");
        agent = await loginToBlueSky();
        if (!agent) {
            console.error("❌ Impossible de se connecter à BlueSky.");
            return [];
        }
    }

    try {
        console.log("📡 Récupération des conversations...");
        console.log("📡 Test des endpoints disponibles...");
        console.log(agent);

        const response = await agent.api.call('chat.bsky.convo.listConvos', {
            limit: 10 // On récupère les 10 dernières conversations
        });

        console.log("✅ Conversations récupérées :", response.data.convos);

        return response.data.convos || [];
    } catch (error) {
        console.error("❌ Erreur lors de la récupération des conversations :", error);
        return [];
    }
}

// Fonction pour récupérer les messages d'une conversation
async function getMessages(convoId) {
    if (!agent?.session) {
        console.log("🔄 Tentative de reconnexion à BlueSky...");
        agent = await loginToBlueSky();
        if (!agent) {
            console.error("❌ Impossible de se connecter à BlueSky.");
            return [];
        }
    }

    try {
        console.log(`📩 Récupération des messages pour la conversation ${convoId}...`);

        const response = await agent.api.call('chat.bsky.convo.getMessages', { convoId });

        return response.data.messages || [];
    } catch (error) {
        console.error(`❌ Erreur lors de la récupération des messages pour ${convoId} :`, error);
        return [];
    }
}

// Fonction pour répondre à un message
async function sendMessage(convoId, text) {
    if (!agent?.session) {
        console.log("🔄 Tentative de reconnexion à BlueSky...");
        agent = await loginToBlueSky();
        if (!agent) {
            console.error("❌ Impossible de se connecter à BlueSky.");
            return;
        }
    }

    try {
        console.log(`✉️ Envoi du message dans la conversation ${convoId}...`);

        await agent.api.call('chat.bsky.convo.sendMessage', {
            convoId,
            message: { text }
        });

        console.log("✅ Réponse envoyée !");
    } catch (error) {
        console.error("❌ Erreur lors de l'envoi du message :", error);
    }
}

// Fonction principale : surveiller les messages entrants
async function checkMessages() {
    console.log("🚀 checkMessages a été appelé !");

    if (!agent) {
        console.log("🔄 Connexion initiale à BlueSky...");
        agent = await loginToBlueSky();
        if (!agent) {
            console.error("❌ Impossible de se connecter à BlueSky.");
            return;
        }
    }

    const conversations = await getConversations();

    // 🔴 Ajout de ce test pour éviter l'erreur
    if (!Array.isArray(conversations)) {
        console.error("❌ Erreur : getConversations() n'a pas retourné une liste.");
        return;
    }

    for (const convo of conversations) {
        const messages = await getMessages(convo.id);

        for (const message of messages) {
            if (!message.text) continue;

            console.log(`📥 Message reçu : "${message.text}" de ${message.sender.handle}`);

            if (message.text.startsWith('/status')) {
                await sendMessage(convo.id, "✅ Le bot est en ligne et opérationnel !");
            }
        }
    }

    console.log("⏳ Attente avant la prochaine vérification...");
}

// Exécuter toutes les 2 minutes
setInterval(checkMessages, 120000);

checkMessages();