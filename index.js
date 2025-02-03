const { checkAndPostDisruptions } = require('./disruptions');
const { checkMessages } = require('./scripts/commands/checkMessages');

(async () => {
    try {
        console.log("🚀 Lancement du script Alerte Métro Paris!");
        await checkAndPostDisruptions();
        checkMessages();
    } catch (error) {
        console.error("❌ Erreur critique:", error);
    }
})();