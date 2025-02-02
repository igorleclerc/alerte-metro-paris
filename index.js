const schedule = require('node-schedule');
const { loginToBlueSky } = require('./blueSky');
const { checkAndPostDisruptions } = require('./disruptions');

console.log('🚀 Lancement du script Alerte Métro Paris avec Firestore et BlueSky Threads !');

schedule.scheduleJob('*/5 * * * *', async () => {
    await loginToBlueSky();
    await checkAndPostDisruptions();
});