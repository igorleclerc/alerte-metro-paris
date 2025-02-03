const { BskyAgent } = require('@atproto/api');
const { BLUESKY_EMAIL, BLUESKY_PASSWORD } = require('../config');

const agent = new BskyAgent({ service: 'https://bsky.social' });

/**
 * 🔑 Connexion à BlueSky
 */
async function loginToBlueSky() {
    try {
        console.log("🔄 Tentative de connexion à BlueSky...");
        await agent.login({
            identifier: process.env.BLUESKY_EMAIL, // Utilise l'email
            password: process.env.BLUESKY_PASSWORD
        });
        console.log("✅ Connexion réussie !");
        return agent;
    } catch (error) {
        console.error("❌ Erreur lors de la connexion à BlueSky:", error);
        return null;
    }
}

/**
 * 📝 Fonction pour extraire et formater les hashtags pour BlueSky
 */
function extractHashtags(message) {
    const hashtagRegex = /#(\w+)/g;
    let match;
    const facets = [];
    let buffer = Buffer.from(message, 'utf8');

    while ((match = hashtagRegex.exec(message)) !== null) {
        let byteStart = Buffer.byteLength(message.substring(0, match.index), 'utf8');
        let byteEnd = byteStart + Buffer.byteLength(match[0], 'utf8');

        facets.push({
            index: {
                byteStart,
                byteEnd
            },
            features: [{ $type: "app.bsky.richtext.facet#tag", tag: match[1] }]
        });
    }

    return facets.length > 0 ? facets : undefined;
}

/**
 * 📝 Publier une alerte sur BlueSky (avec gestion des threads et hashtags cliquables)
 */
async function postToBlueSky(message) {
    try {
        if (!agent.session) {
            await loginToBlueSky();
        }

        const MAX_LENGTH = 300; // Limite de caractères par post
        let parentPost = null;
        let rootPost = null;

        if (message.length > MAX_LENGTH) {
            const parts = message.match(/.{1,280}/g); // Découpage en parties de 280 caractères
            for (let i = 0; i < parts.length; i++) {
                const partMessage = `${parts[i]} (${i + 1}/${parts.length})`;

                const post = await agent.post({
                    $type: 'app.bsky.feed.post',
                    text: partMessage,
                    facets: extractHashtags(partMessage),
                    createdAt: new Date().toISOString(),
                    reply: parentPost ? {
                        root: { uri: rootPost.uri, cid: rootPost.cid },
                        parent: { uri: parentPost.uri, cid: parentPost.cid }
                    } : undefined
                });

                console.log('✅ Post publié:', partMessage);
                if (!rootPost) {
                    rootPost = post;
                }
                parentPost = post;
            }
        } else {
            const post = await agent.post({
                $type: 'app.bsky.feed.post',
                text: message,
                facets: extractHashtags(message),
                createdAt: new Date().toISOString()
            });

            console.log('✅ Alerte publiée sur BlueSky:', message);
            parentPost = post;
        }

        return parentPost;
    } catch (error) {
        console.error('❌ Erreur de publication sur BlueSky:', error.response?.data || error.message);
        return null;
    }

}

module.exports = { loginToBlueSky, postToBlueSky };