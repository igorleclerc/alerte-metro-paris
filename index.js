const { checkAndPostDisruptions } = require('./disruptions');
require('./status');

(async () => {
    try {
        console.log("🚀 Lancement du script Alerte Métro Paris!");
        await checkAndPostDisruptions();
    } catch (error) {
        console.error("❌ Erreur critique:", error);
    }
})();