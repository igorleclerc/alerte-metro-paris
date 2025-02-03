const { getDisruptions } = require('./api');
const { isDisruptionPublished, markDisruptionAsPublished } = require('./firestore');
const { postToBlueSky } = require('./blueSky');

const CHECK_INTERVAL = 90 * 1000; // 90 secondes

/**
 * 📝 Formatage du message d'une perturbation en fonction de son type
 */
function formatDisruptionMessage(disruption) {
    if (!disruption || !disruption.id || !disruption.title || !disruption.message) {
        console.error("❌ Erreur : Données de perturbation invalides:", disruption);
        return null;
    }

    let messageText = disruption.message.replace(/<\/?[^>]+(>|$)/g, "").trim();

    if (!messageText) {
        console.error(`❌ Erreur : Contenu vide après nettoyage pour la perturbation ID: ${disruption.id}`);
        return null;
    }

    // Détection du type d'alerte
    const isWorkRelated = disruption.title.includes("Travaux");
    const isIncident = disruption.title.match(/incident|panne|suspendu|indisponible|problème|retard|fermé/i);

    let alertType;
    if (isWorkRelated) {
        alertType = "🛠️ [Travaux] ";
    } else if (isIncident) {
        alertType = "🚨 [Incident] ";
    } else {
        alertType = "⚠️ [Perturbation] ";
    }

    // Suppression de la date si ce n'est pas des travaux
    if (!isWorkRelated) {
        messageText = messageText.replace(/📅.*?\n\n/, "");
    }

    const lineMatch = disruption.title.match(/Ligne (\d+|[A-Z])/i);
    const lineHashtag = lineMatch ? `#Ligne${lineMatch[1]}` : "";

    const hashtags = `#RATP #MetroParis #idfm #metro ${lineHashtag}`.trim().replace(/\s+/g, ' ');

    return `${alertType}${disruption.title}\n\n${messageText}\n\n${hashtags}`;
}

/**
 * 🚨 Vérification et publication des perturbations toutes les 90 secondes
 */
async function checkAndPostDisruptions() {
    while (true) {
        try {
            console.log('🔄 Vérification des perturbations...');
            const disruptions = await getDisruptions();

            if (!disruptions || disruptions.length === 0) {
                console.log("✅ Aucune perturbation trouvée.");
            } else {
                for (const disruption of disruptions) {
                    if (await isDisruptionPublished(disruption.id)) {
                        console.log(`⏭ Déjà publiée: ${disruption.title}`);
                        continue;
                    }

                    const message = formatDisruptionMessage(disruption);
                    if (!message) {
                        console.error(`❌ Erreur : Impossible de générer un message valide pour la perturbation ID: ${disruption.id}`);
                        continue;
                    }

                    console.log(`📢 Vérification de la perturbation reçue: "${message}"`);

                    const postSuccess = await postToBlueSky(message);
                    if (postSuccess) {
                        await markDisruptionAsPublished(disruption.id);
                        console.log(`✅ Perturbation publiée et enregistrée: ${disruption.id}`);
                    } else {
                        console.error(`❌ Échec de publication pour la perturbation: ${disruption.id}`);
                    }
                }
            }
        } catch (error) {
            console.error("❌ Erreur lors de la vérification des perturbations:", error);
        }

        console.log(`⏳ Attente de 90 secondes avant la prochaine vérification...\n`);
        await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL));
    }
}

module.exports = { checkAndPostDisruptions };