let trendsChartInstance;
let currentDamName = "Idukki";
let currentScenario = "orange";

function updateTrends(damName, scenario) {
    currentDamName = damName;
    currentScenario = scenario;
    const ctx = document.getElementById('trendsChart');
    if (!ctx) return;

    const damSeed = (damName.length * 7) % 5;
    const labels = ["T-72h", "T-60h", "T-48h", "T-36h", "T-24h", "T-12h", "NOW", "T+12h", "T+24h"];
    let currentData = [];
    let peak2018 = [];

    if (scenario === 'safe') {
        currentData = [55, 56, 56.5, 57, 58, 59, 61, 62, 63].map(v => v + damSeed);
        peak2018 = [92, 92, 92, 92, 92, 92, 92, 92, 92];
    } else if (scenario === 'orange') {
        currentData = [72, 74, 76, 78, 80, 82, 84, 87, 89].map(v => v + (damSeed / 2));
        peak2018 = [90, 91, 92, 92.5, 93, 94, 94, 94, 94];
    } else { // red
        currentData = [85, 88, 91, 93, 94, 95, 96, 97, 98];
        peak2018 = [92, 92.5, 93, 94, 95, 96, 97, 98, 99];
    }

    if (trendsChartInstance) trendsChartInstance.destroy();
    trendsChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                { label: 'Predicted Storage %', data: currentData, borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderWidth: 3, fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: '#3b82f6', pointBorderColor: '#fff' },
                { label: '2018 peak level', data: peak2018, borderColor: '#ef4444', borderDash: [5, 5], borderWidth: 2, fill: false, tension: 0, pointRadius: 0 }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: { legend: { display: false }, tooltip: { backgroundColor: '#0f1c35', titleColor: '#60a5fa', bodyColor: '#e2e8f0', borderColor: '#1e3a5f', borderWidth: 1 } },
            scales: {
                y: { min: 40, max: 100, grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8', callback: v => v + '%' } },
                x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
            }
        }
    });
}

function enterDashboard() {
    const landing = document.getElementById('landing-page');
    landing.classList.add('hidden');

    setTimeout(() => {
        if (keralMap) keralMap.invalidateSize();
    }, 800);
}

const timeDisplay = document.getElementById('current-time');
const updateTime = () => {
    const now = new Date();
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    timeDisplay.innerText = `Last updated: ${now.toLocaleDateString('en-IN', options)}`;
};
updateTime();
setInterval(updateTime, 60000);

const radius = 110;
const circumference = Math.PI * radius;

const scenarios = {
    safe: {
        levelPct: 61,
        levelFt: "2358.12 ft",
        inflow: "400",
        release: "0",
        alertTitle: "YELLOW ALERT",
        alertDesc: "Moderate isolated rainfall expected. No immediate threat.",
        alertColor: "var(--accent-green)",
        alertBg: "rgba(16, 185, 129, 0.08)",
        alertIconBg: "rgba(16, 185, 129, 0.2)",
        aiSummary: "Given 400 cumecs inflow and Yellow Alert forecast, reservoir is well below rule curve and expected to remain stable.",
        aiRec: "No action required. Maintain normal monitoring.",
        aiDetail: "Current inflow is easily offset by daily hydro-generation drafts. No spilling necessary.",
        badgeText: "STABLE",
        badgeColor: "var(--accent-green)",
        timeToOverflow: "N/A - Stable",
        confidence: "98% Based on Predictive Models",
        markerText: "Tracking well below historical risk markers.",
        chips: ['Aluva 🟢', 'Perumbavoor 🟢', 'Ernakulam 🟢', 'Kalady 🟢', 'Angamaly 🟢'],
        riskList: `
            <li><span>Cheruthoni</span><span class="risk-level risk-low">Low</span></li>
            <li><span>Keerithodu</span><span class="risk-level risk-low">Low</span></li>
            <li><span>Perumbavoor</span><span class="risk-level risk-low">Low</span></li>
            <li><span>Aluva</span><span class="risk-level risk-low">Low</span></li>
            <li><span>Kalamassery</span><span class="risk-level risk-low">Low</span></li>
        `,
        malayalamEn: "Status Normal: Idukki Dam water levels are safe. No immediate release planned.",
        malayalam: "🟢 നിലവിൽ ആശങ്കപ്പെടേണ്ട സാഹചര്യമില്ല. ഇടുക്കി ഡാമിലെ ജലനിരപ്പ് സുരക്ഷിതമാണ്."
    },
    orange: {
        levelPct: 84,
        levelFt: "2398.54 ft",
        inflow: "1,200",
        release: "0",
        alertTitle: "ORANGE ALERT",
        alertDesc: "Heavy to Very Heavy Rainfall predicted in catchment area for next 48hrs",
        alertColor: "var(--accent-orange)",
        alertBg: "rgba(249, 115, 22, 0.08)",
        alertIconBg: "rgba(249, 115, 22, 0.2)",
        aiSummary: "Given 1,200 cumecs inflow and Orange Alert forecast, reservoir is projected to exceed rule curve levels within 36 hours.",
        aiRec: "Initiate Controlled Release — 500 cumecs from 6:00 AM",
        aiDetail: "Proactive gradual release allows safer assimilation downstream and prevents necessity of abrupt, massive discharges later.",
        badgeText: "CRITICAL",
        badgeColor: "var(--accent-red)",
        timeToOverflow: "~14 hours if no action taken",
        confidence: "87% Based on Predictive Models",
        markerText: "Tracking closer to 2018 inflow patterns. Proactive release crucial to avoid simultaneous dam spillage.",
        chips: ['Aluva 🔴', 'Perumbavoor 🔴', 'Ernakulam 🟠', 'Kalady 🟠', 'Angamaly 🟡'],
        riskList: `
            <li><span>Cheruthoni</span><span class="risk-level risk-high">High</span></li>
            <li><span>Keerithodu</span><span class="risk-level risk-high">High</span></li>
            <li><span>Perumbavoor</span><span class="risk-level risk-medium">Medium</span></li>
            <li><span>Aluva</span><span class="risk-level risk-medium">Medium</span></li>
            <li><span>Kalamassery</span><span class="risk-level risk-low">Low</span></li>
        `,
        malayalamEn: "Official Warning: Due to rising water levels in Idukki Dam, a controlled release is imminent. Residents along the banks of Periyar must remain vigilant.",
        malayalam: "⚠️ അണക്കെട്ട് ലെവൽ 84% ആണ്. ഉടൻ നിയന്ത്രിത ജലം തുറന്നുവിടൽ ആവശ്യമാണ്."
    },
    red: {
        levelPct: 96,
        levelFt: "2401.80 ft",
        inflow: "3,800",
        release: "1,500",
        alertTitle: "RED ALERT",
        alertDesc: "EXTREME DOWNPOUR. All catchment areas exceeding 150mm. Immediate threat to life.",
        alertColor: "var(--accent-red)",
        alertBg: "rgba(239, 68, 68, 0.15)",
        alertIconBg: "rgba(239, 68, 68, 0.3)",
        aiSummary: "CATASTROPHIC INFLOW: 3,800 cumecs exceeds outlet capacity. Multiple upstream dams opening simultaneously.",
        aiRec: "EVACUATE DOWNSTREAM IMMIDIATELY. Open all 5 shutters incrementally to maximum.",
        aiDetail: "Dam structural integrity prioritized. Downstream flooding unavoidable at this stage. Coordinate with NDRF.",
        badgeText: "EMERGENCY",
        badgeColor: "var(--accent-red)",
        timeToOverflow: "< 2.5 hours at current inflow",
        confidence: "99% Verification matched",
        markerText: "SURPASSING 2018 HISTORIC HIGHS. Catastrophic flash flood highly likely.",
        chips: ['Aluva ⚫', 'Perumbavoor ⚫', 'Ernakulam 🔴', 'Kalady 🔴', 'Angamaly 🔴'],
        riskList: `
            <li><span>Cheruthoni</span><span class="risk-level risk-high" style="background:var(--accent-red);color:white">EXTREME</span></li>
            <li><span>Keerithodu</span><span class="risk-level risk-high" style="background:var(--accent-red);color:white">EXTREME</span></li>
            <li><span>Perumbavoor</span><span class="risk-level risk-high">High</span></li>
            <li><span>Aluva</span><span class="risk-level risk-high">High</span></li>
            <li><span>Kalamassery</span><span class="risk-level risk-high">High</span></li>
        `,
        malayalamEn: "EMERGENCY EVACUATION: Open all 5 shutters. Massive flash flood imminent along Periyar river basin.",
        malayalam: "🚨 അതീവ ജാഗ്രത! വെള്ളപ്പൊക്കം ഉറപ്പാണ്. ഡാമിന്റെ 5 ഷട്ടറുകളും തുറക്കുന്നു. പെരിയാർ തീരത്തുള്ളവർ ഉടൻ സുരക്ഷിത സ്ഥാനങ്ങളിലേക്ക് മാറുക!"
    }
};

const gauge = document.querySelector('.gauge-path');
window.allDamsData = []; // Store globally for interaction

const damDescriptions = {
    "Idukki": "Dam Release Decision Support & Early Warning System. One of the highest arch dams in Asia.",
    "Idamalayar": "A multipurpose concrete gravity dam located on the Idamalayar River in Ernakulam.",
    "Kakki": "Built across the Kakki River, this dam is vital for hydroelectric power generation in Pathanamthitta.",
    "Banasura Sagar": "The largest earth dam in India and the second largest of its kind in Asia, located in Wayanad.",
    "Sholayar": "A vital reservoir for the Chalakudy River basin with significant hydro-electric capacity in Thrissur.",
    "Mattupetty": "Concrete gravity dam crucial for water conservation and power generation in Idukki.",
    "Mattupetti": "Concrete gravity dam crucial for water conservation and power generation in Idukki.",
    "Ponmudi": "Masonry gravity dam constructed across the Panniar River in Idukki.",
    "Pamba": "Located in Pathanamthitta district, crucial for the Sabarigiri Hydro Electric Project.",
    "Kallarkutty": "Gravity dam located in the Idukki district across the Muthirapuzha River.",
    "Erattayar": "A small diversion dam across the Erattayar River in Idukki.",
    "Lower Periyar": "Hydroelectric dam built across the Periyar River.",
    "Moozhiyar": "Integral part of the Sabarigiri Hydroelectric Project.",
    "Pambla": "Hydroelectric project dam situated across the Periyar River.",
    "Kakkayam": "Located in Kozhikode, part of the Kuttiyadi Hydro Electric Project.",
    "Anathode": "Flanking dam to the Kakki reservoir in the Pathanamthitta district.",
    "Chenkulam": "Dam built across the Mudirapuzha River for hydroelectric power generation.",
    "Poringalkuthu": "Built across the Chalakudy River for hydro-electric power generation in Thrissur.",
    "Sengulam": "Part of the Sengulam Hydroelectric Project in Idukki.",
    "Neriamangalam": "Hydroelectric project dam built across the Periyar River in Ernakulam.",
    "Panniar": "Dam built across the Panniar River in Idukki.",
    "Sabarigiri": "A major hydroelectric project situated in the Pamba basin.",
    "Kuttiyadi": "Dam in Kozhikode serving the Kuttiyadi irrigation project.",
    "Thariode": "Earth dam forming part of the Banasura Sagar project in Wayanad.",
    "Anayirankal": "Earth dam primarily used for hydroelectric power and water conservation in Idukki.",
    "Kallar": "Small check dam located in the Idukki district."
};

// ── PER-DAM INTELLIGENCE DATABASE ─────────────────────────────────
const damIntelDB = {
    "Idukki": { "river": "Periyar", "releasePoint": "Cheruthoni Dam Shutters (Idukki District)", "travelTime": "4-6 hours to reach Aluva", "via": "Keerithodu → Perumbavoor → Aluva", "mlRiver": "ജലം പെരിയാർ നദിയിലൂടെ ഒഴുകുന്നു", "downstream": [["Cheruthoni", "HIGH"], ["Keerithodu", "HIGH"], ["Perumbavoor", "MEDIUM"], ["Aluva", "MEDIUM"], ["Kalamassery", "LOW"]], "alertZones": ["Aluva", "Perumbavoor", "Ernakulam", "Kalady", "Angamaly"] },
    "Idamalayar": { "river": "Idamalayar River → Periyar", "releasePoint": "Idamalayar Dam Spillway (Ernakulam)", "travelTime": "3-5 hours to reach Ernakulam", "via": "Bhoothathankettu → Kolenchery → Ernakulam", "mlRiver": "ജലം ഇടമലയാർ നദിയിലൂടെ ഒഴുകുന്നു", "downstream": [["Bhoothathankettu", "HIGH"], ["Kolenchery", "HIGH"], ["Kothamangalam", "MEDIUM"], ["Ernakulam", "MEDIUM"], ["Tripunithura", "LOW"]], "alertZones": ["Kothamangalam", "Ernakulam", "Kolenchery", "Piravom", "Aluva"] },
    "Kakki": { "river": "Kakki River → Pamba", "releasePoint": "Kakki Dam Gates (Pathanamthitta)", "travelTime": "5-7 hours to reach Alappuzha", "via": "Ranni → Thiruvalla → Alappuzha", "mlRiver": "ജലം കക്കി നദിയിലൂടെ ഒഴുകുന്നു", "downstream": [["Ranni", "HIGH"], ["Eratupetta", "HIGH"], ["Thiruvalla", "MEDIUM"], ["Chengannur", "MEDIUM"], ["Alappuzha", "LOW"]], "alertZones": ["Ranni", "Thiruvalla", "Chengannur", "Alappuzha", "Kuttanad"] },
    "Banasura Sagar": { "river": "Karamanathodu → Kabani", "releasePoint": "Banasura Sagar Spillway (Wayanad)", "travelTime": "3-4 hours to reach Kalpetta", "via": "Vythiri → Kalpetta → Sulthan Bathery", "mlRiver": "ജലം കബനി നദിയിലൂടെ ഒഴുകുന്നു", "downstream": [["Vythiri", "HIGH"], ["Kalpetta", "HIGH"], ["Sulthan Bathery", "MEDIUM"], ["Mananthavady", "MEDIUM"], ["Perambra", "LOW"]], "alertZones": ["Kalpetta", "Vythiri", "Mananthavady", "Sulthan Bathery", "Nenmeni"] },
    "Sholayar": { "river": "Sholayar River → Chalakudy", "releasePoint": "Sholayar Dam Shutters (Thrissur)", "travelTime": "4-6 hours to reach Chalakudy", "via": "Parambikulam → Chalakudy → Thrissur", "mlRiver": "ജലം ചാലക്കുടി നദിയിലൂടെ ഒഴുകുന്നു", "downstream": [["Parambikulam", "HIGH"], ["Chalakudy", "HIGH"], ["Kodungallur", "MEDIUM"], ["Thrissur", "MEDIUM"], ["Irinjalakuda", "LOW"]], "alertZones": ["Chalakudy", "Kodungallur", "Thrissur", "Irinjalakuda", "Mukundapuram"] },
    "Pamba": { "river": "Pamba River", "releasePoint": "Pamba Dam Spillway (Pathanamthitta)", "travelTime": "6-8 hours to reach Kuttanad", "via": "Ranni → Kozhencherry → Kuttanad", "mlRiver": "ജലം പമ്പ നദിയിലൂടെ ഒഴുകുന്നു", "downstream": [["Ranni", "HIGH"], ["Kozhencherry", "HIGH"], ["Chengannur", "MEDIUM"], ["Kuttanad", "HIGH"], ["Alappuzha", "MEDIUM"]], "alertZones": ["Ranni", "Kuttanad", "Alappuzha", "Chengannur", "Pandanad"] },
    "Poringalkuthu": { "river": "Chalakudy River", "releasePoint": "Poringalkuthu Spillway (Thrissur)", "travelTime": "3-5 hours to reach Chalakudy", "via": "Lower Meenmutty → Chalakudy", "mlRiver": "ജലം ചാലക്കുടി നദിയിലൂടെ ഒഴുകുന്നു", "downstream": [["Lower Meenmutty", "HIGH"], ["Chalakudy", "HIGH"], ["Kodungallur", "MEDIUM"], ["Thrissur", "LOW"], ["Irinjalakuda", "LOW"]], "alertZones": ["Chalakudy", "Kodungallur", "Irinjalakuda", "Thrissur", "Mukundapuram"] },
    "Lower Periyar": { "river": "Periyar River", "releasePoint": "Lower Periyar Dam Shutters (Idukki)", "travelTime": "5-7 hours to reach Aluva", "via": "Bhoothathankettu → Perumbavoor → Aluva", "mlRiver": "ജലം പെരിയാർ നദിയിലൂടെ ഒഴുകുന്നു", "downstream": [["Bhoothathankettu", "HIGH"], ["Perumbavoor", "HIGH"], ["Aluva", "MEDIUM"], ["Ernakulam", "MEDIUM"], ["Kalamassery", "LOW"]], "alertZones": ["Perumbavoor", "Aluva", "Ernakulam", "Kalady", "Angamaly"] },
    "Kallarkutty": { "river": "Muthirapuzha → Periyar", "releasePoint": "Kallarkutty Dam (Idukki)", "travelTime": "4-5 hours to reach Perumbavoor", "via": "Muthirapuzha → Periyar → Perumbavoor", "mlRiver": "ജലം മുതിരപ്പുഴ വഴി പെരിയാറിൽ ചേരുന്നു", "downstream": [["Muthirapuzha Valley", "HIGH"], ["Aluva", "MEDIUM"], ["Perumbavoor", "MEDIUM"], ["Ernakulam", "LOW"], ["Kalady", "LOW"]], "alertZones": ["Muthirapuzha Basin", "Perumbavoor", "Aluva", "Kalady", "Angamaly"] },
    "Kakkayam": { "river": "Kakkayam → Kuttiyadi River", "releasePoint": "Kakkayam Dam Gates (Kozhikode)", "travelTime": "3-4 hours to reach Kozhikode", "via": "Kuttiyadi → Feroke → Kozhikode", "mlRiver": "ജലം കുറ്റ്യാടി നദിയിലൂടെ ഒഴുകുന്നു", "downstream": [["Kuttiyadi", "HIGH"], ["Feroke", "HIGH"], ["Kozhikode", "MEDIUM"], ["Beypore", "MEDIUM"], ["Elathur", "LOW"]], "alertZones": ["Kuttiyadi", "Feroke", "Kozhikode", "Beypore", "Elathur"] },
    "Moozhiyar": { "river": "Moozhiyar River → Pamba", "releasePoint": "Moozhiyar Dam (Pathanamthitta)", "travelTime": "5-8 hours to reach Alappuzha", "via": "Ranni → Kozhencherry → Kuttanad", "mlRiver": "ജലം പമ്പ നദി വഴി ഒഴുകുന്നു", "downstream": [["Ranni", "HIGH"], ["Kozhencherry", "MEDIUM"], ["Kuttanad", "HIGH"], ["Chengannur", "MEDIUM"], ["Alappuzha", "LOW"]], "alertZones": ["Ranni", "Kuttanad", "Alappuzha", "Chengannur", "Pandanad"] },
    "Mattupetti": { "river": "Mattupetti Ar → Periyar", "releasePoint": "Mattupetti Dam Gates (Idukki)", "travelTime": "5-7 hours to reach Aluva", "via": "Munnar → Periyar → Aluva", "mlRiver": "ജലം മൂന്നാർ വഴി പെരിയാറിൽ ചേരുന്നു", "downstream": [["Munnar Town", "MEDIUM"], ["Adimali", "HIGH"], ["Perumbavoor", "MEDIUM"], ["Aluva", "LOW"], ["Ernakulam", "LOW"]], "alertZones": ["Munnar", "Adimali", "Perumbavoor", "Aluva", "Ernakulam"] },
    "Mattupetty": { "river": "Mattupetti Ar → Periyar", "releasePoint": "Mattupetty Dam Gates (Idukki)", "travelTime": "5-7 hours to reach Aluva", "via": "Munnar → Periyar → Aluva", "mlRiver": "ജലം മൂന്നാർ വഴി പെരിയാറിൽ ചേരുന്നു", "downstream": [["Munnar Town", "MEDIUM"], ["Adimali", "HIGH"], ["Perumbavoor", "MEDIUM"], ["Aluva", "LOW"], ["Ernakulam", "LOW"]], "alertZones": ["Munnar", "Adimali", "Perumbavoor", "Aluva", "Ernakulam"] },
    "Erattayar": { "river": "Erattayar River → Periyar", "releasePoint": "Erattayar Dam (Idukki)", "travelTime": "4-6 hours to reach Perumbavoor", "via": "Upper Periyar Basin → Perumbavoor", "mlRiver": "ജലം പെരിയാർ നദിയിലൂടെ ഒഴുകുന്നു", "downstream": [["Upputhodu", "HIGH"], ["Kanjirappally", "MEDIUM"], ["Perumbavoor", "MEDIUM"], ["Aluva", "LOW"], ["Ernakulam", "LOW"]], "alertZones": ["Upputhodu", "Kuttikanam", "Perumbavoor", "Aluva", "Ernakulam"] }
};

function getIntelForDam(damName, district) {
    if (damIntelDB[damName]) return damIntelDB[damName];
    return { river: `${district} River Basin`, releasePoint: `${damName} Main Spillway (${district})`, travelTime: "3-6 hours (estimated)", via: `${district} River → Downstream`, mlRiver: `ജലം ${district} ജില്ലയിലൂടെ ഒഴുകുന്നു`, downstream: [[`${district} Town`, "MEDIUM"], ["Downstream Zone A", "MEDIUM"], ["Downstream Zone B", "LOW"]], alertZones: [`${district} Town`, "Downstream Villages", "River Belt"] };
}
function getRiskClass(level) {
    if (level === 'HIGH' || level === 'EXTREME') return 'risk-high';
    if (level === 'MEDIUM') return 'risk-medium';
    return 'risk-low';
}

window.selectDam = function (damName) {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const backBtn = document.getElementById('back-home-btn');
    if (backBtn) backBtn.style.display = 'flex';

    const dam = window.allDamsData.find(d => d.name === damName);
    if (!dam || !dam.data || dam.data.length === 0) return;

    const cl = parseFloat(dam.data[0].waterLevel);
    const fl = parseFloat(dam.FRL);
    const pct = parseFloat(dam.data[0].storagePercentage) || Math.round((cl / fl) * 100);
    const inflow = parseFloat(dam.data[0].inflow) || 0;
    const districtMap2 = { "Idamalayar": "Ernakulam", "Kakki": "Pathanamthitta", "Banasura Sagar": "Wayanad", "Sholayar": "Thrissur", "Pamba": "Pathanamthitta", "Poringalkuthu": "Thrissur", "Kakkayam": "Kozhikode", "Moozhiyar": "Pathanamthitta", "Kuttiyadi": "Kozhikode", "Thariode": "Wayanad" };
    const district = districtMap2[damName] || 'Idukki';

    // ─ Header ─────────────────────────────────────
    const mainDamTitle = document.getElementById('main-dam-title');
    if (mainDamTitle) mainDamTitle.innerText = `${dam.name} Reservoir`;
    const mainDamDesc = document.getElementById('main-dam-desc');
    if (mainDamDesc) mainDamDesc.innerText = damDescriptions[dam.name] || `Early warning & telemetry system for ${damName}.`;

    // ─ Gauge ──────────────────────────────────────
    const gaugeValueEl = document.querySelector('.gauge-value');
    if (gaugeValueEl) gaugeValueEl.innerText = `${pct.toFixed(1)}%`;
    const clEl = document.getElementById('main-dam-level-cl');
    if (clEl) clEl.innerText = `${cl.toFixed(2)} ft`;
    const flEl = document.getElementById('main-dam-level-fl');
    if (flEl) flEl.innerText = `Full Reservoir Level: ${fl.toFixed(2)} ft`;

    const gaugeOff = circumference * (1 - (pct / 100));
    if (gauge) {
        gauge.style.strokeDashoffset = gaugeOff;
        gauge.style.stroke = pct >= 90 ? 'var(--accent-red)' : pct >= 80 ? 'var(--accent-orange)' : 'var(--accent-blue)';
    }

    // ─ Flow ───────────────────────────────────────
    const inflowEl = document.getElementById('main-dam-inflow');
    const outflowEl = document.getElementById('main-dam-outflow');
    if (inflowEl) inflowEl.innerHTML = `${dam.data[0].inflow} <span style="font-size:1.125rem;color:var(--text-secondary);font-weight:normal;">cumecs</span>`;
    if (outflowEl) outflowEl.innerHTML = `${dam.data[0].totalOutflow || dam.data[0].outflow} <span style="font-size:1.125rem;color:var(--text-secondary);font-weight:normal;">cumecs</span>`;

    // ─ Risk classification from live data ─────────
    const intel = getIntelForDam(damName, district);
    let riskLevel, badgeText, badgeColor, aiRecText, aiContextText, timeToOverflow, mlWarning, enWarning;

    if (pct >= 90 || inflow > 2000) {
        riskLevel = 'CRITICAL'; badgeText = 'CRITICAL'; badgeColor = 'var(--accent-red)';
        aiRecText = `URGENT: Initiate controlled release — open spillway gates. Evacuate downstream settlements within 5km.`;
        aiContextText = `Storage at ${pct.toFixed(1)}% with ${inflow || '—'} cumecs inflow. Reservoir projected to breach rule curve within hours.`;
        timeToOverflow = pct >= 98 ? '< 2 hours at current inflow' : '~6 hours if no action taken';
        mlWarning = `🚨 ${damName} ഡാം ഗുരുതര സ്ഥിതിയിൽ. ${intel.river} തീരത്തുള്ളവർ ഉടൻ ഒഴിഞ്ഞുമാറുക!`;
        enWarning = `EMERGENCY: ${damName} at critical level. Immediate evacuation required along ${intel.river} banks.`;
    } else if (pct >= 80 || inflow > 800) {
        riskLevel = 'HIGH'; badgeText = 'HIGH RISK'; badgeColor = 'var(--accent-orange)';
        aiRecText = `Initiate gradual controlled release of ${Math.max(100, Math.round(inflow * 0.4))} cumecs. Monitor downstream levels hourly.`;
        aiContextText = `Storage at ${pct.toFixed(1)}% with ${inflow || '—'} cumecs inflow. Approaching rule curve limit — proactive release advised.`;
        timeToOverflow = '~14-20 hours if no action taken';
        mlWarning = `⚠️ ${damName} ഡാം ലെവൽ ${pct.toFixed(0)}% ആണ്. ഉടൻ നിയന്ത്രിത ജലം തുറന്നുവിടൽ ആവശ്യമാണ്.`;
        enWarning = `Warning: ${damName} at ${pct.toFixed(0)}% capacity. Controlled release imminent. ${intel.river} area stay alert.`;
    } else {
        riskLevel = 'STABLE'; badgeText = 'STABLE'; badgeColor = 'var(--accent-green)';
        aiRecText = `No release required. Maintain standard monitoring schedule. Continue hydro-generation drafts.`;
        aiContextText = `Storage at ${pct.toFixed(1)}% — well within safe operating range. Current inflow is manageable.`;
        timeToOverflow = 'N/A — Stable conditions';
        mlWarning = `🟢 ${damName} ഡാം സുരക്ഷിത നിലയിൽ. ആശങ്കപ്പെടേണ്ട സാഹചര്യമില്ല.`;
        enWarning = `Status Normal: ${damName} water levels are safe. No immediate release planned.`;
    }

    const riskListHTML = intel.downstream.map(([town, base]) => {
        const eff = pct >= 90 ? (base === 'LOW' ? 'MEDIUM' : 'HIGH') : pct >= 80 ? base : (base === 'HIGH' ? 'MEDIUM' : 'LOW');
        return `<li><span>${town}</span><span class="risk-level ${getRiskClass(eff)}">${eff}</span></li>`;
    }).join('');

    const chipEmoji = riskLevel === 'CRITICAL' ? '⚫' : riskLevel === 'HIGH' ? '🔴' : '🟢';
    const chipsHTML = intel.alertZones.map(z => `<div class="chip">${z} <span style="font-size:1.1rem;">${chipEmoji}</span></div>`).join('');

    const scenarioContainer = document.getElementById('scenario-container');
    const mixedLayout = document.getElementById('mixed-layout-section');
    const idukkiIntel = document.getElementById('idukki-intelligence-section');
    if (scenarioContainer) scenarioContainer.style.display = damName.toLowerCase().includes('idukki') ? 'flex' : 'none';
    if (mixedLayout) mixedLayout.style.display = 'grid';
    if (idukkiIntel) idukkiIntel.style.display = 'grid';

    const aiCtxEl = document.getElementById('ai-context-text-classic');
    if (aiCtxEl) aiCtxEl.innerText = aiContextText;
    const aiRecEl = document.getElementById('ai-rec-text-classic');
    if (aiRecEl) aiRecEl.innerText = aiRecText;
    const mlBoxEl = document.getElementById('warning-malayalam-classic');
    if (mlBoxEl) {
        mlBoxEl.innerHTML = `<strong>ജാഗ്രതാ നിർദ്ദേശം:</strong><br>${mlWarning}<div class="warning-en" style="margin-top:0.5rem;color:inherit;opacity:0.8;">${enWarning}</div>`;
        if (riskLevel === 'CRITICAL') { mlBoxEl.style.backgroundColor = 'rgba(239,68,68,0.15)'; mlBoxEl.style.borderLeftColor = 'var(--accent-red)'; mlBoxEl.style.color = '#fca5a5'; }
        else if (riskLevel === 'HIGH') { mlBoxEl.style.backgroundColor = 'rgba(249,115,22,0.1)'; mlBoxEl.style.borderLeftColor = 'var(--accent-orange)'; mlBoxEl.style.color = '#fdba74'; }
        else { mlBoxEl.style.backgroundColor = 'rgba(16,185,129,0.1)'; mlBoxEl.style.borderLeftColor = 'var(--accent-green)'; mlBoxEl.style.color = '#6ee7b7'; }
    }

    const riskListEl = document.getElementById('risk-list-classic');
    if (riskListEl) riskListEl.innerHTML = riskListHTML;

    const engineBadge = document.getElementById('engine-status-badge');
    if (engineBadge) { engineBadge.innerText = badgeText; engineBadge.style.backgroundColor = badgeColor; }
    const aiRecEngine = document.getElementById('ai-rec-text');
    if (aiRecEngine) aiRecEngine.innerText = aiRecText;

    const relLocBlock = document.getElementById('release-loc-block');
    if (relLocBlock) relLocBlock.innerHTML = `
        <div style="font-weight:600;color:#93c5fd;margin-bottom:0.75rem;display:flex;align-items:center;gap:0.5rem;font-size:0.875rem;text-transform:uppercase;"><span>🌊 RELEASE POINT LOCATION</span></div>
        <ul style="list-style:none;color:var(--text-primary);font-size:0.875rem;margin-bottom:0.75rem;">
            <li style="margin-bottom:0.35rem;"><span style="color:var(--text-secondary);">Primary Release:</span> <span style="font-weight:500;">${intel.releasePoint}</span></li>
            <li style="margin-bottom:0.35rem;"><span style="color:var(--text-secondary);">Water flows into:</span> <span style="font-weight:500;">${intel.river}</span></li>
            <li style="margin-bottom:0.35rem;"><span style="color:var(--text-secondary);">First impact zone:</span> <span style="font-weight:500;">${intel.via}</span></li>
            <li><span style="color:var(--text-secondary);">Estimated travel time:</span> <span style="font-weight:500;color:#fdba74;">${intel.travelTime}</span></li>
        </ul>
        <div style="padding-top:0.75rem;border-top:1px solid rgba(30,58,95,0.4);font-family:'Noto Sans Malayalam',sans-serif;color:#60a5fa;font-size:1rem;">${intel.mlRiver}</div>`;

    const timeEl = document.getElementById('time-overflow-val');
    if (timeEl) { timeEl.innerText = timeToOverflow; timeEl.style.color = riskLevel === 'STABLE' ? 'var(--text-secondary)' : riskLevel === 'HIGH' ? '#fca5a5' : 'var(--accent-red)'; }
    const confEl = document.getElementById('confidence-val');
    if (confEl) confEl.innerText = `${75 + Math.round(pct * 0.2)}% Based on Predictive Models`;
    const compText = document.getElementById('comparison-text');
    if (compText) compText.innerText = `Current: ${pct.toFixed(1)}%`;
    const compFill = document.getElementById('comparison-fill');
    if (compFill) compFill.style.width = `${Math.min(100, pct)}%`;
    const compDesc = document.getElementById('comparison-desc');
    if (compDesc) compDesc.innerText = pct >= 90 ? `SURPASSING safe thresholds. Immediate action required.` : pct >= 80 ? `Approaching critical levels. Proactive release recommended.` : `Well within normal operating range. Continue standard monitoring.`;

    const chipContainer = document.getElementById('alert-chips-container');
    if (chipContainer) chipContainer.innerHTML = chipsHTML;
    const warnBox = document.getElementById('warning-box-malayalam');
    if (warnBox) {
        warnBox.innerText = mlWarning;
        if (riskLevel === 'CRITICAL') { warnBox.style.backgroundColor = 'var(--accent-red)'; warnBox.style.color = 'white'; warnBox.style.fontWeight = '700'; }
        else if (riskLevel === 'HIGH') { warnBox.style.backgroundColor = 'rgba(239,68,68,0.15)'; warnBox.style.color = '#fca5a5'; warnBox.style.fontWeight = ''; }
        else { warnBox.style.backgroundColor = 'rgba(16,185,129,0.1)'; warnBox.style.color = '#6ee7b7'; warnBox.style.fontWeight = ''; }
    }
    updateTrends(damName, currentScenario);
};

// ── MAP ───────────────────────────────────────
let keralMap = null;
let mapMarkers = [];

function initMap() {
    if (keralMap) return; // already initialised

    // Kerala bounding box: SW(8.0, 74.8) → NE(12.8, 77.6)
    const keralaBounds = L.latLngBounds(
        L.latLng(8.0, 74.8),   // SW corner
        L.latLng(12.8, 77.6)    // NE corner
    );

    keralMap = L.map('kerala-map', {
        center: [10.3, 76.5],   // geographic centre of Kerala
        zoom: 7,
        minZoom: 7,              // don't allow zooming out past Kerala
        maxZoom: 12,
        maxBounds: keralaBounds,
        maxBoundsViscosity: 1.0,          // hard-stop at bounds
        zoomControl: true,
        scrollWheelZoom: true
    });

    // Dark tile layer (CartoDB Dark Matter)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 12
    }).addTo(keralMap);
}

function updateMapMarkers(damsList) {
    if (!keralMap) initMap();

    // Clear old markers
    mapMarkers.forEach(m => keralMap.removeLayer(m));
    mapMarkers = [];

    damsList.forEach(d => {
        if (!d.latitude || !d.longitude) return;
        const cl = parseFloat(d.data[0].waterLevel);
        const fl = parseFloat(d.FRL);
        const pct = parseFloat(d.data[0].storagePercentage) || Math.round((cl / fl) * 100);

        let color, statusLabel;
        if (pct >= 90) { color = '#ef4444'; statusLabel = 'CRITICAL'; }
        else if (pct >= 70) { color = '#f97316'; statusLabel = 'WARNING'; }
        else { color = '#10b981'; statusLabel = 'SAFE'; }

        const marker = L.circleMarker([d.latitude, d.longitude], {
            radius: 10,
            fillColor: color,
            color: 'rgba(255,255,255,0.4)',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.9
        });

        const inflow = d.data[0].inflow || '–';
        const outflow = d.data[0].totalOutflow || d.data[0].outflow || '–';

        marker.bindPopup(`
            <div class="map-popup-name">${d.name} Reservoir</div>
            <div class="map-popup-pct" style="color:${color}">${pct.toFixed(1)}%</div>
            <div style="font-size:0.78rem;color:#94a3b8;margin-top:3px;">Storage Capacity</div>
            <div class="map-popup-meta">
                Inflow: <b>${inflow}</b> cumecs &nbsp;|&nbsp; Outflow: <b>${outflow}</b> cumecs
            </div>
            <div class="map-popup-meta" style="margin-top:2px;">Status: <b style="color:${color}">${statusLabel}</b></div>
            <button class="map-popup-btn" onclick="selectDam('${d.name.replace(/'/g, "\\'")}'); this.closest('.leaflet-popup').remove();">View Full Details →</button>
        `, { maxWidth: 220 });

        // Pulsing ring for critical dams
        if (pct >= 90) {
            const pulse = L.circleMarker([d.latitude, d.longitude], {
                radius: 16,
                fillColor: 'transparent',
                color: '#ef4444',
                weight: 1.5,
                opacity: 0.4,
                fillOpacity: 0
            }).addTo(keralMap);
            mapMarkers.push(pulse);
        }

        marker.addTo(keralMap);
        mapMarkers.push(marker);
    });
}

// ── SEARCH LOGIC ──
let allParsedDams = [];
const searchInput = document.getElementById('dam-search');
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = allParsedDams.filter(d =>
            d.name.toLowerCase().includes(term) ||
            d.district.toLowerCase().includes(term)
        );
        renderDamsToGrid(filtered);
    });
}

// Back to Top Logic
const bttBtn = document.createElement('button');
bttBtn.id = 'back-to-top';
bttBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="18 15 12 9 6 15"></polyline></svg>';
document.body.appendChild(bttBtn);
window.addEventListener('scroll', () => {
    if (window.scrollY > 500) bttBtn.style.display = 'flex';
    else bttBtn.style.display = 'none';
});
bttBtn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });

function goHome() {
    const detailView = document.getElementById('dam-detail-view');
    const allView = document.getElementById('all-dams-view');

    // Fade out detail, fade in all
    detailView.style.opacity = '0';
    setTimeout(() => {
        detailView.style.display = 'none';
        allView.style.display = 'block';
        allView.style.opacity = '1';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 300);

    // Hide back button
    const backBtn = document.getElementById('back-home-btn');
    if (backBtn) backBtn.style.display = 'none';
    // Reset to default Idukki view
    const idukki = window.allDamsData.find(d => d.name && d.name.toLowerCase().includes('idukki'));
    if (idukki) {
        const cl = parseFloat(idukki.data[0].waterLevel);
        const fl = parseFloat(idukki.FRL);
        const pct = parseFloat(idukki.data[0].storagePercentage) || Math.round((cl / fl) * 100);
        document.getElementById('main-dam-title').innerText = 'Idukki Reservoir';
        document.getElementById('main-dam-desc').innerText = 'Dam Release Decision Support & Early Warning System. One of the highest arch dams in Asia.';
        const gaugeEl = document.querySelector('.gauge-value');
        if (gaugeEl) gaugeEl.innerText = `${pct.toFixed(1)}%`;
        const clEl = document.getElementById('main-dam-level-cl');
        if (clEl) clEl.innerText = `${cl.toFixed(2)} ft`;
        const flEl = document.getElementById('main-dam-level-fl');
        if (flEl) flEl.innerText = `Full Reservoir Level: ${fl.toFixed(2)} ft`;
        const offsetValue = circumference * (1 - (pct / 100));
        if (gauge) {
            gauge.style.strokeDashoffset = offsetValue;
            if (pct >= 90) gauge.style.stroke = 'var(--accent-red)';
            else if (pct >= 80) gauge.style.stroke = 'var(--accent-orange)';
            else gauge.style.stroke = 'var(--accent-blue)';
        }
    }
    // Show Idukki intelligence sections
    const scenarioContainer = document.getElementById('scenario-container');
    const mixedLayout = document.getElementById('mixed-layout-section');
    const idukkiIntel = document.getElementById('idukki-intelligence-section');
    if (scenarioContainer) scenarioContainer.style.display = 'flex';
    if (mixedLayout) mixedLayout.style.display = 'grid';
    if (idukkiIntel) idukkiIntel.style.display = 'grid';
}

// Fetch Live Data function
async function fetchLiveData() {
    let usedLiveLevel = false;
    let currentLevelPct = 84;

    try {
        // 1. Fetch Dam Level
        const damRes = await fetch('https://raw.githubusercontent.com/amith-vp/Kerala-Dam-Water-Levels/main/live.json');
        if (damRes.ok) {
            const payload = await damRes.json();
            const dams = payload.dams;
            window.allDamsData = dams; // save globally

            console.log("Raw API Response:", payload);

            // Render All Dams Grid
            renderAllDamsGrid(dams);

            const idukki = dams.find(d => d.name && d.name.toLowerCase().includes('idukki'));
            if (idukki && idukki.data && idukki.data.length > 0) {
                const cl = parseFloat(idukki.data[0].waterLevel);
                const fl = parseFloat(idukki.FRL);
                if (!isNaN(cl) && !isNaN(fl) && fl > 0) {
                    currentLevelPct = parseFloat(idukki.data[0].storagePercentage);

                    // Update Live Gauge Data
                    const gaugeValEl = document.querySelector('.gauge-value');
                    if (gaugeValEl) gaugeValEl.innerText = `${currentLevelPct}%`;
                    const gaugeLbEl = document.querySelector('.gauge-label div:first-child');
                    if (gaugeLbEl) gaugeLbEl.innerText = `${cl.toFixed(2)} ft`;
                    const gaugeStEl = document.querySelector('.gauge-subtext');
                    if (gaugeStEl) gaugeStEl.innerText = `Full Reservoir Level: ${fl.toFixed(2)} ft`;

                    const offset = circumference * (1 - (currentLevelPct / 100));
                    if (gauge) {
                        gauge.style.strokeDashoffset = offset;
                        if (currentLevelPct >= 90) gauge.style.stroke = 'var(--accent-red)';
                        else if (currentLevelPct >= 80) gauge.style.stroke = 'var(--accent-orange)';
                        else gauge.style.stroke = 'var(--accent-blue)';
                    }

                    const compStatVal = document.querySelector('.comparison-section .engine-stat-val');
                    if (compStatVal) compStatVal.innerText = `Current: ${currentLevelPct}%`;
                    const compBarFill = document.querySelector('.comparison-bar-fill');
                    if (compBarFill) compBarFill.style.width = `${currentLevelPct}%`;

                    usedLiveLevel = true;
                }
            }
        }
    } catch (e) {
        console.error("Failed to fetch Dam level, using fallback.", e);
    }

    try {
        // 2. Fetch Rain Forecast
        const rainRes = await fetch('https://api.open-meteo.com/v1/forecast?latitude=9.85&longitude=77.1&daily=precipitation_sum&forecast_days=1');
        if (rainRes.ok) {
            const rainData = await rainRes.json();
            if (rainData.daily && rainData.daily.precipitation_sum && rainData.daily.precipitation_sum.length > 0) {
                const precip = rainData.daily.precipitation_sum[0];
                let alertType = 'green';
                if (precip > 115) alertType = 'red';
                else if (precip > 64) alertType = 'orange';
                else if (precip > 6.4) alertType = 'yellow';

                updateAlertCard(alertType, precip);
            }
        }
    } catch (e) {
        console.error("Failed to fetch Rainfall forecast, using fallback.", e);
    }

    // If API fetch failed for dam completely, default to orange mock data
    if (!usedLiveLevel) {
        setScenario('orange');
    }
}

function updateAlertCard(type, precip) {
    const alertCard = document.querySelector('.alert-card');
    const alertIcon = document.querySelector('.alert-icon');
    const alertTitle = document.querySelector('.alert-text h3');
    const alertDesc = document.querySelector('.alert-text .stat-label');
    if (!alertCard || !alertIcon || !alertTitle || !alertDesc) return;

    let color, bg, iconBg, title, desc;

    if (type === 'red') {
        color = 'var(--accent-red)';
        bg = 'rgba(239, 68, 68, 0.15)';
        iconBg = 'rgba(239, 68, 68, 0.3)';
        title = 'RED ALERT';
        desc = `Extreme Rainfall Forecast: ${precip}mm expected in next 24hrs in catchment area.`;
    } else if (type === 'orange') {
        color = 'var(--accent-orange)';
        bg = 'rgba(249, 115, 22, 0.08)';
        iconBg = 'rgba(249, 115, 22, 0.2)';
        title = 'ORANGE ALERT';
        desc = `Heavy Rainfall Forecast: ${precip}mm expected in next 24hrs in catchment area.`;
    } else if (type === 'yellow') {
        color = '#eab308'; // yellow
        bg = 'rgba(234, 179, 8, 0.08)';
        iconBg = 'rgba(234, 179, 8, 0.2)';
        title = 'YELLOW ALERT';
        desc = `Moderate Rainfall Forecast: ${precip}mm expected in next 24hrs.`;
    } else {
        color = 'var(--accent-green)';
        bg = 'rgba(16, 185, 129, 0.08)';
        iconBg = 'rgba(16, 185, 129, 0.2)';
        title = 'NORMAL';
        desc = `Light/No Rainfall Forecast: ${precip}mm expected in next 24hrs.`;
    }

    alertCard.style.borderColor = color;
    alertCard.style.background = `linear-gradient(135deg, ${bg} 0%, var(--card-bg) 100%)`;
    alertIcon.style.color = color;
    alertIcon.style.backgroundColor = iconBg;
    alertTitle.innerText = title;
    alertTitle.style.color = color;
    alertDesc.innerText = desc;
}

function renderAllDamsGrid(damsList) {
    const container = document.getElementById('all-dams-container');
    if (!container) return;
    container.innerHTML = ''; // clear loading text

    let metrics = { total: 0, critical: 0, warning: 0, safe: 0 };
    const parsedDams = [];

    const districtMap = {
        "Idukki": "Idukki", "Idamalayar": "Ernakulam", "Kakki": "Pathanamthitta", "Banasura Sagar": "Wayanad", "Sholayar": "Thrissur", "Mattupetti": "Idukki", "Mattupetty": "Idukki", "Kundala": "Idukki", "Ponmudi": "Idukki", "Pamba": "Pathanamthitta", "Kallarkutty": "Idukki", "Erattayar": "Idukki", "Lower Periyar": "Idukki", "Moozhiyar": "Pathanamthitta", "Pambla": "Idukki", "Kakkayam": "Kozhikode", "Anathode": "Pathanamthitta", "Chenkulam": "Idukki", "Poringalkuthu": "Thrissur", "Sengulam": "Idukki", "Neriamangalam": "Ernakulam", "Panniar": "Idukki", "Sabarigiri": "Pathanamthitta", "Kuttiyadi": "Kozhikode", "Thariode": "Wayanad", "Anayirankal": "Idukki", "Kallar": "Idukki"
    };

    damsList.forEach(d => {
        if (d.name && d.data && d.data.length > 0) {
            const cl = parseFloat(d.data[0].waterLevel);
            const fl = parseFloat(d.FRL);

            if (!isNaN(cl) && !isNaN(fl) && fl > 0) {
                metrics.total++;
                let pctStr = d.data[0].storagePercentage;
                let pct = pctStr ? parseFloat(pctStr) : Math.round((cl / fl) * 100);
                const barPct = Math.min(100, Math.max(0, pct));

                let status = 'safe';
                if (pct >= 90) { status = 'critical'; metrics.critical++; }
                else if (pct >= 70) { status = 'warning'; metrics.warning++; }
                else { metrics.safe++; }

                let districtName = districtMap[d.name] || 'Kerala District';

                parsedDams.push({
                    name: d.name, district: districtName, cl: cl, fl: fl, pct: pct.toFixed(1), barPct: barPct, status: status
                });
            }
        }
    });

    allParsedDams = parsedDams;
    renderDamsToGrid(parsedDams);
    initMap();
    updateMapMarkers(damsList);

    const sumTotal = document.getElementById('sum-total');
    if (sumTotal) sumTotal.innerText = metrics.total;
    const sumCritical = document.getElementById('sum-critical');
    if (sumCritical) sumCritical.innerText = metrics.critical;
    const sumWarning = document.getElementById('sum-warning');
    if (sumWarning) sumWarning.innerText = metrics.warning;
    const sumSafe = document.getElementById('sum-safe');
    if (sumSafe) sumSafe.innerText = metrics.safe;
}

function renderDamsToGrid(dList) {
    const container = document.getElementById('all-dams-container');
    if (!container) return;
    container.innerHTML = '';

    if (dList.length === 0) {
        container.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-secondary);">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="margin-bottom: 1rem; opacity: 0.5;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <p>No dams match your search term.</p>
         </div>`;
        return;
    }

    dList.forEach(d => {
        const card = document.createElement('div');
        card.className = 'dam-card';
        card.setAttribute('onclick', `selectDam('${d.name.replace("'", "\\'")}')`);

        let badgeClass = 'badge-safe';
        let barColor = 'var(--accent-green)';
        let badgeText = 'SAFE';

        if (d.status === 'critical') {
            badgeClass = 'badge-danger'; barColor = 'var(--accent-red)'; badgeText = 'CRITICAL';
        } else if (d.status === 'warning') {
            badgeClass = 'badge-warning'; barColor = 'var(--accent-orange)'; badgeText = 'WARNING';
        }

        card.innerHTML = `
            <div class="dam-card-header">
                <div class="dam-name">
                    ${d.name}
                    <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.25rem; font-weight: 500;">
                        📍 ${d.district}
                    </div>
                </div>
                <div class="dam-badge ${badgeClass}">${badgeText}</div>
            </div>
            <div style="font-size: 1.5rem; font-weight: 700;">${d.pct}%</div>
            <div class="dam-progress-container">
                <div class="dam-progress-fill" style="width: ${d.barPct}%; background-color: ${barColor};"></div>
            </div>
            <div class="dam-card-footer">
                <span>${d.cl.toFixed(1)} / ${d.fl.toFixed(0)} ft</span>
                <span style="color:var(--accent-blue)">View Details →</span>
            </div>
        `;
        container.appendChild(card);
    });
}

// ── ALERT SIMULATOR ────────────────────────────
let currentScenarioType = 'orange';

function openAlertSimulator() {
    const overlay = document.getElementById('alert-modal-overlay');
    if (!overlay) return;
    overlay.classList.add('open');

    ['collector', 'ndrf', 'police', 'dam', 'village', 'fire'].forEach(id => {
        const row = document.getElementById(`r-${id}`);
        const status = document.getElementById(`rs-${id}`);
        if (row) row.className = 'recipient-row';
        if (status) { status.textContent = 'QUEUED'; status.style.color = ''; }
    });
    const smsBadge = document.getElementById('sms-sent-badge');
    if (smsBadge) smsBadge.style.display = 'none';
    const sendSum = document.getElementById('send-summary');
    if (sendSum) sendSum.style.display = 'none';
    const sendBtn = document.getElementById('send-alert-btn');
    if (sendBtn) {
        sendBtn.disabled = false;
        sendBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> BROADCAST EMERGENCY ALERT`;
    }

    const data = scenarios[currentScenarioType];
    const gaugeValueLabel = document.querySelector('.gauge-value');
    const pct = gaugeValueLabel ? gaugeValueLabel.innerText : (data ? `${data.levelPct}%` : '?%');
    const titleEl = document.getElementById('main-dam-title');
    const damName = titleEl ? titleEl.innerText : 'Idukki Reservoir';
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    let alertTag, action, mlMsg;
    if (currentScenarioType === 'red') {
        alertTag = '🔴 RED ALERT — EMERGENCY';
        action = 'MANDATORY IMMEDIATE EVACUATION required for all areas within 5km of Periyar River banks.';
        mlMsg = 'അടിയന്തര മുന്നറിയിപ്പ്: പെരിയാർ നദിതീരത്തുള്ളവർ ഉടൻ മാറുക.';
    } else if (currentScenarioType === 'orange') {
        alertTag = '🟠 ORANGE ALERT — HIGH RISK';
        action = 'Controlled release of 500 cumecs to begin at 06:00 IST. Low-lying areas must prepare for evacuation.';
        mlMsg = 'ഓറഞ്ച് അലർട്ട്: ഡാം തുറക്കാൻ സാധ്യത. ജനങ്ങൾ ജാഗ്രത പാലിക്കുക.';
    } else {
        alertTag = '🟡 YELLOW ALERT — MONITOR';
        action = 'No immediate release planned. Continue monitoring. Avoid river banks during heavy rainfall.';
        mlMsg = 'മഞ്ഞ അലർട്ട്: ഡാം ലെവൽ നിരീക്ഷണത്തിലാണ്. ആശങ്കപ്പെടേണ്ടതില്ല.';
    }

    const smsText = `${alertTag}\n\n[KDM SYSTEM — ${dateStr} ${timeStr}]\n\nDam: ${damName}\nStorage: ${pct} of capacity\n\nAction Required:\n${action}\n\n${mlMsg}\n\nDo not reply. For queries: 1800-425-1550\nKerala DEOC`;

    const smsPreview = document.getElementById('sms-preview-text');
    if (smsPreview) smsPreview.innerText = smsText;
    const smsStamp = document.getElementById('sms-time-stamp');
    if (smsStamp) smsStamp.innerText = `${timeStr} · KDM Gov Alert`;
}

function closeAlertModal() {
    const overlay = document.getElementById('alert-modal-overlay');
    if (overlay) overlay.classList.remove('open');
}

async function sendAlerts() {
    const btn = document.getElementById('send-alert-btn');
    if (!btn) return;
    btn.disabled = true;
    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg> Broadcasting...`;

    const recipients = ['collector', 'ndrf', 'police', 'dam', 'village', 'fire'];
    const delays = [600, 900, 1200, 1500, 2100, 2700];

    recipients.forEach((id, i) => {
        setTimeout(() => {
            const row = document.getElementById(`r-${id}`);
            const status = document.getElementById(`rs-${id}`);
            if (row) row.className = 'recipient-row sending';
            if (status) status.textContent = 'SENDING…';

            setTimeout(() => {
                if (row) row.className = 'recipient-row sent';
                if (status) { status.textContent = '✓ SENT'; }

                if (i === recipients.length - 1) {
                    const smsBadge = document.getElementById('sms-sent-badge');
                    if (smsBadge) smsBadge.style.display = 'block';
                    const now = new Date();
                    const sendTime = document.getElementById('send-timestamp');
                    if (sendTime) sendTime.innerText = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                    const sendSum = document.getElementById('send-summary');
                    if (sendSum) sendSum.style.display = 'block';
                    btn.innerHTML = `✅ Broadcast Complete`;
                }
            }, 500);
        }, delays[i]);
    });
}

// ── AI AUTONOMOUS CONTROL LOGIC ───────────────────────────────────
function addTerminalLine(msg, color = "#10b981") {
    const term = document.getElementById('ai-auto-terminal');
    if (!term) return;
    const line = document.createElement('div');
    line.className = 'terminal-line';
    line.style.color = color;
    line.innerText = `> ${msg}`;
    term.appendChild(line);
    term.scrollTop = term.scrollHeight;
}

async function initializeAiAutomation() {
    const btn = document.getElementById('ai-init-btn');
    if (!btn) return;
    btn.disabled = true;
    btn.innerHTML = '<span class="blink">⏳</span> RUNNING NEURAL ANALYSIS...';

    const term = document.getElementById('ai-auto-terminal');
    if (term) term.innerHTML = '';
    addTerminalLine("DANGER ASSESSMENT PROTOCOL INITIATED...");

    await new Promise(r => setTimeout(r, 800));
    addTerminalLine("FETCHING REAL-TIME TELEMETRY...");
    const titleEl = document.getElementById('main-dam-title');
    addTerminalLine(`SCANNING ${titleEl ? titleEl.innerText : 'Reservoir'}...`);

    await new Promise(r => setTimeout(r, 1200));
    addTerminalLine("ANALYZING PRECIPITATION CLUSTERS...");
    addTerminalLine("MODELING DOWNSTREAM HYDRODYNAMICS...");

    await new Promise(r => setTimeout(r, 1500));
    const gaugeValueLabel = document.querySelector('.gauge-value');
    const pct = gaugeValueLabel ? parseFloat(gaugeValueLabel.innerText) : 0;
    addTerminalLine(`RESERVOIR CAPACITY: ${pct}%`, pct >= 80 ? "#ef4444" : "#10b981");

    if (pct >= 80) {
        addTerminalLine("CRITICAL RISK DETECTED.", "#ef4444");
        addTerminalLine("CALCULATING OPTIMAL DISCHARGE PATH...", "#3b82f6");
        await new Promise(r => setTimeout(r, 1000));
        addTerminalLine("CONSULTING DAM OPERATOR FOR AUTHORIZATION...", "#f97316");

        const consultPanel = document.getElementById('operator-consult-panel');
        if (consultPanel) consultPanel.style.display = 'block';
        btn.style.display = 'none';
    } else {
        addTerminalLine("RISK LEVEL: LOW. SYSTEM STABLE.");
        addTerminalLine("ABORTING AUTONOMOUS PROTOCOL.");
        btn.disabled = false;
        btn.innerText = 'RE-RUN DANGER ASSESSMENT';
    }
}

function authorizeAiRelease(granted) {
    const panel = document.getElementById('operator-consult-panel');
    if (panel) panel.style.display = 'none';

    if (granted) {
        addTerminalLine("AUTHORIZATION GRANTED. OPERATOR ID: 2948-ADMIN", "#6ee7b7");
        addTerminalLine("EXECUTING DAM GATE PROTOCOL...", "#6ee7b7");
        startGateOperation();
    } else {
        addTerminalLine("AUTHORIZATION DENIED BY OPERATOR.", "#ef4444");
        addTerminalLine("SYSTEM RETURNING TO PASSIVE MONITORING.");
        const btn = document.getElementById('ai-init-btn');
        if (btn) {
            btn.style.display = 'flex';
            btn.disabled = false;
            btn.innerText = 'RE-RUN DANGER ASSESSMENT';
        }
    }
}

async function startGateOperation() {
    const visual = document.getElementById('gate-ops-visual');
    if (visual) visual.style.display = 'block';

    const statusText = document.getElementById('gate-status-text');
    const fills = [document.getElementById('g-fill-1'), document.getElementById('g-fill-2'), document.getElementById('g-fill-3')];

    for (let i = 0; i <= 100; i += 2) {
        if (statusText) statusText.innerText = `GATES OPENING: ${i}%`;
        if (i === 40) {
            fills.forEach(f => { if (f) f.classList.add('open'); });
            addTerminalLine("SPILLWAY GATES BREACHED. WATER RELEASING.", "#3b82f6");
        }
        await new Promise(r => setTimeout(r, 50));
    }

    if (statusText) statusText.innerText = "GATES OPENED. DISCHARGE IN PROGRESS.";
    addTerminalLine("AUTONOMOUS CONTROL SUCCESSFUL. MONITORING FLOW RATE.");

    await new Promise(r => setTimeout(r, 2000));
    addTerminalLine("LIVE TELEMETRY: OUTFLOW SET TO 500 CUMECS.", "#3b82f6");
    const outflowEl = document.getElementById('main-dam-outflow');
    if (outflowEl) {
        outflowEl.innerHTML = `500 <span style="font-size: 1.125rem; color: var(--text-secondary); font-weight: normal;">cumecs</span>`;
        outflowEl.style.color = "#f97316";
    }
}

// ── INITIALIZATION ──
window.addEventListener('DOMContentLoaded', () => {
    if (gauge) {
        gauge.style.strokeDasharray = circumference;
        gauge.style.strokeDashoffset = circumference;
    }

    setScenario('orange');
    updateTrends('Idukki', 'orange');

    setTimeout(() => {
        fetchLiveData();
    }, 300);
});

// The Switcher Function
window.setScenario = function (type) {
    currentScenarioType = type; // Track for simulator
    const data = scenarios[type];
    if (!data) return;

    document.querySelectorAll('.scenario-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.style.backgroundColor && btn.style.backgroundColor.includes('0.2')) {
            if (btn.innerText.includes('Safe')) btn.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
            if (btn.innerText.includes('Orange')) btn.style.backgroundColor = 'rgba(249, 115, 22, 0.1)';
            if (btn.innerText.includes('Red')) btn.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
        }
    });

    const scenarioBtns = document.querySelectorAll('.scenario-btn');
    scenarioBtns.forEach(btn => {
        if (btn.getAttribute('onclick')?.includes(type)) {
            btn.classList.add('active');
            if (type === 'safe') btn.style.backgroundColor = 'rgba(16, 185, 129, 0.2)';
            if (type === 'orange') btn.style.backgroundColor = 'rgba(249, 115, 22, 0.2)';
            if (type === 'red') btn.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
        }
    });

    const gaugeValLabel = document.querySelector('.gauge-value');
    if (gaugeValLabel) gaugeValLabel.innerText = `${data.levelPct}%`;

    const gaugeLabel = document.querySelector('.gauge-label div:first-child');
    if (gaugeLabel) gaugeLabel.innerText = data.levelFt;

    const offset = circumference * (1 - (data.levelPct / 100));
    if (gauge) {
        gauge.style.strokeDashoffset = offset;
        if (data.levelPct >= 90) gauge.style.stroke = 'var(--accent-red)';
        else if (data.levelPct >= 80) gauge.style.stroke = 'var(--accent-orange)';
        else gauge.style.stroke = 'var(--accent-blue)';
    }

    const statValues = document.querySelectorAll('.stat-value');
    if (statValues.length >= 2) {
        statValues[0].innerHTML = `${data.inflow} <span style="font-size: 1.125rem; color: var(--text-secondary); font-weight: normal;">cumecs</span>`;
        statValues[1].innerHTML = `${data.release} <span style="font-size: 1.125rem; color: var(--text-secondary); font-weight: normal;">cumecs</span>`;
        if (parseFloat(data.release.replace(/,/g, '')) > 0) statValues[1].style.color = 'var(--accent-red)';
        else statValues[1].style.color = 'var(--text-secondary)';
    }

    const alertCard = document.querySelector('.alert-card');
    if (alertCard) {
        alertCard.style.borderColor = data.alertColor;
        alertCard.style.background = `linear-gradient(135deg, ${data.alertBg} 0%, var(--card-bg) 100%)`;
    }

    const alertIcon = document.querySelector('.alert-icon');
    if (alertIcon) {
        alertIcon.style.color = data.alertColor;
        alertIcon.style.backgroundColor = data.alertIconBg;
    }

    const alertTitle = document.querySelector('.alert-text h3');
    if (alertTitle) {
        alertTitle.innerText = data.alertTitle;
        alertTitle.style.color = data.alertColor;
    }

    const alertDesc = document.querySelector('.alert-text .stat-label');
    if (alertDesc) alertDesc.innerText = data.alertDesc;

    const contextClassic = document.getElementById('ai-context-text-classic');
    if (contextClassic) contextClassic.innerText = data.aiSummary;

    const recClassic = document.getElementById('ai-rec-text-classic');
    if (recClassic) recClassic.innerText = data.aiRec;

    const warningMalayalam = document.getElementById('warning-malayalam-classic');
    if (warningMalayalam) {
        warningMalayalam.innerHTML = `<strong>ജാഗ്രതാ നിർദ്ദേശം:</strong><br>${data.malayalam} <div class="warning-en" style="margin-top:0.5rem; color:inherit; opacity:0.8;">${data.malayalamEn}</div>`;
        if (type === 'safe') {
            warningMalayalam.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
            warningMalayalam.style.borderColor = 'rgba(16, 185, 129, 0.3)';
            warningMalayalam.style.borderLeftColor = 'var(--accent-green)';
            warningMalayalam.style.color = '#6ee7b7';
        } else if (type === 'orange') {
            warningMalayalam.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
            warningMalayalam.style.borderColor = 'rgba(239, 68, 68, 0.3)';
            warningMalayalam.style.borderLeftColor = 'var(--accent-red)';
            warningMalayalam.style.color = '#fca5a5';
        } else {
            warningMalayalam.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
            warningMalayalam.style.borderColor = 'var(--accent-red)';
            warningMalayalam.style.borderLeftColor = 'var(--accent-red)';
            warningMalayalam.style.color = 'white';
        }
    }

    const riskListClassic = document.getElementById('risk-list-classic');
    if (riskListClassic) riskListClassic.innerHTML = data.riskList;

    const engineBadge = document.getElementById('engine-status-badge');
    if (engineBadge) {
        engineBadge.innerText = data.badgeText;
        engineBadge.style.backgroundColor = data.badgeColor;
    }

    const aiRecTextEl = document.getElementById('ai-rec-text');
    if (aiRecTextEl) aiRecTextEl.innerText = data.aiRec;

    const timeOflow = document.getElementById('time-overflow-val');
    if (timeOflow) {
        timeOflow.innerText = data.timeToOverflow;
        if (type === 'safe') timeOflow.style.color = 'var(--text-secondary)';
        else if (type === 'orange') timeOflow.style.color = '#fca5a5';
        else timeOflow.style.color = 'var(--accent-red)';
    }

    const confVal = document.getElementById('confidence-val');
    if (confVal) confVal.innerText = data.confidence;

    const compText = document.getElementById('comparison-text');
    if (compText) compText.innerText = `Current: ${data.levelPct}%`;

    const compFill = document.getElementById('comparison-fill');
    if (compFill) compFill.style.width = `${data.levelPct}%`;

    const compDesc = document.getElementById('comparison-desc');
    if (compDesc) compDesc.innerText = data.markerText;

    const chipContainer = document.getElementById('alert-chips-container');
    if (chipContainer) {
        chipContainer.innerHTML = '';
        data.chips.forEach(c => {
            const parts = c.split(' ');
            const emoji = parts.pop();
            const name = parts.join(' ');
            const chip = document.createElement('div');
            chip.className = 'chip';
            chip.innerHTML = `${name} <span style="font-size: 1.2rem; transform: translateY(-1px); display: inline-block;">${emoji}</span>`;
            chipContainer.appendChild(chip);
        });
    }

    const strictWarning = document.getElementById('warning-box-malayalam');
    if (strictWarning) {
        strictWarning.innerText = data.malayalam;
        if (type === 'safe') {
            strictWarning.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
            strictWarning.style.borderColor = 'var(--accent-green)';
            strictWarning.style.color = '#6ee7b7';
        } else if (type === 'orange') {
            strictWarning.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
            strictWarning.style.borderColor = 'var(--accent-red)';
            strictWarning.style.color = '#fca5a5';
        } else {
            strictWarning.style.backgroundColor = 'var(--accent-red)';
            strictWarning.style.borderColor = 'white';
            strictWarning.style.color = 'white';
            strictWarning.style.fontWeight = '700';
        }
    }
    updateTrends(currentDamName, type);
};
