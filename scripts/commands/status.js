async function checkStatus(agent, convoId, sender) {
  console.log(`🔄 Vérification du status pour ${sender}`);

  // Simule 3 pings
  const services = [
      { name: "BlueSky API", status: "🟢 OK" },
      { name: "Firestore DB", status: "🟢 OK" },
      { name: "Disruptions Fetch", status: "🟢 OK" },
  ];

  let responseText = "✅ Statut du bot :\n";
  for (const service of services) {
      responseText += `🔹 ${service.name}: ${service.status}\n`;
  }

  await agent.api.chat.bsky.convo.sendMessage({
      convoId,
      body: { text: responseText },
  });

  console.log(`📤 Réponse envoyée à ${sender}`);
}

module.exports = { checkStatus };