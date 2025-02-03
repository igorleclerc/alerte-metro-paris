const { checkAndPostDisruptions } = require('./disruptions');

(async () => {
    try {
        console.log("🚀 Lancement du script Alerte Métro Paris!");
        await checkAndPostDisruptions();
    } catch (error) {
        console.error("❌ Erreur critique:", error);
    }
})();