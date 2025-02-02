const { BskyAgent } = require('@atproto/api');
const { BLUESKY_EMAIL, BLUESKY_PASSWORD } = require('./config');

const agent = new BskyAgent({ service: 'https://bsky.social' });

async function loginToBlueSky() {
    try {
        await agent.login({ identifier: BLUESKY_EMAIL, password: BLUESKY_PASSWORD });
        console.log('✅ Connecté à BlueSky');
    } catch (error) {
        console.error('❌ Erreur de connexion BlueSky:', error.message);
    }
}

// 📢 Publier une alerte en **thread** si nécessaire
async function postToBlueSky(message) {
    try {
        let parentPost = null;

        if (message.length > 300) {
            const parts = message.match(/.{1,280}/g);
            for (let i = 0; i < parts.length; i++) {
                const partMessage = `${parts[i]} (${i + 1}/${parts.length})`;

                const post = await agent.post({
                    text: partMessage,
                    reply: parentPost ? { root: parentPost, parent: parentPost } : undefined
                });

                console.log('✅ Post publié:', partMessage);
                parentPost = post.uri;
            }
        } else {
            const post = await agent.post({ text: message });
            console.log('✅ Alerte publiée sur BlueSky:', message);
            parentPost = post.uri;
        }

        return parentPost;
    } catch (error) {
        console.error('❌ Erreur de publication sur BlueSky:', error.message);
    }
}

module.exports = { loginToBlueSky, postToBlueSky };