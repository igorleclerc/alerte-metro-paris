const { getDisruptions } = require('./api');
const { isDisruptionPublished, markDisruptionAsPublished } = require('./firestore');
const { postToBlueSky } = require('./blueSky');

async function checkAndPostDisruptions() {
    console.log('🔄 Vérification des perturbations...');
    const disruptions = await getDisruptions();

    for (const disruption of disruptions) {
        if (await isDisruptionPublished(disruption.id)) {
            console.log(`⏭ Déjà publiée: ${disruption.title}`);
            continue;
        }

        const messageText = disruption.message.replace(/<\/?[^>]+(>|$)/g, "");

        const lineMatch = disruption.title.match(/Ligne (\d+|[A-Z])/i);
        const lineHashtag = lineMatch ? `#ligne${lineMatch[1]}` : "";

        const hashtags = `#RATP #MétroParis ${lineHashtag}`.trim();

        const message = `🚇 🔴 [Alerte Métro] ${disruption.title}\n${messageText}\n\n${hashtags}`;

        await postToBlueSky(message);
        await markDisruptionAsPublished(disruption.id);
    }
}

module.exports = { checkAndPostDisruptions };