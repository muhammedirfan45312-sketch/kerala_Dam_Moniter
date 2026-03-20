/* ═══════════════════════════════════════════════════════
   KDM — Kerala Dam Monitor · script.js
   Fixed: dam-card-footer class, gauge null checks,
          duplicate setScenario, goHome view logic,
          DOMContentLoaded timing, search init timing
═══════════════════════════════════════════════════════ */

'use strict';

// ── GLOBALS ──────────────────────────────────────────
let trendsChartInstance = null;
let currentDamName     = "Idukki";
let currentScenario    = "orange";
let currentScenarioType = "orange";
let keralMap           = null;
let mapMarkers         = [];
let allParsedDams      = [];

// ── OPTIMIZATION: DOM CACHE ─────────────────────────
const DOM = {};
function cacheDOM() {
    const ids = [
        'main-dam-title', 'main-dam-desc', 'main-dam-inflow', 'main-dam-outflow',
        'main-dam-level-cl', 'main-dam-level-fl', 'ai-context-text-classic',
        'ai-rec-text-classic', 'warning-malayalam-classic', 'risk-list-classic',
        'engine-status-badge', 'ai-rec-text', 'release-loc-block', 'time-overflow-val',
        'confidence-val', 'comparison-text', 'comparison-fill', 'comparison-desc',
        'alert-chips-container', 'warning-box-malayalam', 'all-dams-container',
        'dam-detail-view', 'all-dams-view', 'back-home-btn', 'scenario-container',
        'mixed-layout-section', 'idukki-intelligence-section', 'dam-search',
        'news-feed-container'
    ];
    ids.forEach(id => DOM[id] = document.getElementById(id));
    DOM.gaugeValue = document.querySelector('.gauge-value');
    DOM.gaugePath = document.querySelector('.gauge-path');
    DOM.alertCard = document.querySelector('.alert-card');
    DOM.alertIcon = document.querySelector('.alert-icon');
    DOM.alertTitle = document.querySelector('.alert-text h3');
    DOM.alertDesc = document.querySelector('.alert-text .stat-label');
}

// ── DARK MODE ────────────────────────────────────────
window.toggleDarkMode = function() {
    const isDark = document.body.classList.toggle('dark');
    localStorage.setItem('kdm_dark', isDark ? '1' : '0');
    const moon = document.getElementById('theme-icon-moon');
    const sun  = document.getElementById('theme-icon-sun');
    if (moon) moon.style.display = isDark ? 'none'  : 'block';
    if (sun)  sun.style.display  = isDark ? 'block' : 'none';
};

function initDarkMode() {
    const saved = localStorage.getItem('kdm_dark');
    if (saved === '1') {
        document.body.classList.add('dark');
        const moon = document.getElementById('theme-icon-moon');
        const sun  = document.getElementById('theme-icon-sun');
        if (moon) moon.style.display = 'none';
        if (sun)  sun.style.display  = 'block';
    }
}

// ── OPTIMIZATION: WEATHER CACHE ──────────────────────
const weatherCache = {};
const WEATHER_CACHE_TTL = 5 * 60 * 1000;

// ── LOCALIZATION ────────────────────────────────────
let currentLang = localStorage.getItem('kdm_lang') || 'en';

const translations = {
    en: {
        total_monitored: "Total Monitored",
        critical: "Critical (>90%)",
        warning: "Warning (>70%)",
        safe: "Safe (<70%)",
        search_placeholder: "Search dams or districts...",
        capacity_title: "Reservoir Capacity",
        flow_title: "Current Flow Dynamics",
        weather_title: "IMD Weather Alert",
        reports_title: "Live Regional Reports",
        map_title: "Interactive Kerala Dam Network",
        all_dams_title: "All Monitored Reservoirs",
        inflow_rate: "Inflow Rate",
        current_release: "Current Release",
        back_to_overview: "← Back to Overview",
        cumecs: "cumecs",
        updating_weather: "UPDATING WEATHER"
    },
    ml: {
        total_monitored: "ആകെ",
        critical: "അതിതീവ്ര ജാഗ്രത (>90%)",
        warning: "ജാഗ്രതാ നിർദ്ദേശം (>70%)",
        safe: "സുരക്ഷിതം (<70%)",
        search_placeholder: "ഡാം അല്ലെങ്കിൽ ജില്ല തിരയുക...",
        capacity_title: "റിസർവോയർ കപ്പാസിറ്റി",
        flow_title: "ഒഴുക്കിന്റെ അവസ്ഥ",
        weather_title: "കാലാവസ്ഥാ മുന്നറിയിപ്പ്",
        reports_title: "പ്രാദേശിക റിപ്പോർട്ടുകൾ",
        map_title: "ഡാം ജലനിരപ്പ് ഭൂപടം",
        all_dams_title: "മറ്റുള്ള ഡാമുകൾ",
        inflow_rate: "നീരൊഴുക്ക്",
        current_release: "പുറത്തേക്കുള്ള ഒഴുക്ക്",
        back_to_overview: "← പഴയ ലിസ്റ്റിലേക്ക്",
        cumecs: "കുമെക്സ്",
        updating_weather: "കാലാവസ്ഥ അപ്‌ഡേറ്റ് ചെയ്യുന്നു"
    }
};

function updateUILanguage() {
    const t = translations[currentLang];
    
    // Update IDs
    const idMap = {
        'sum-total-label': t.total_monitored,
        'sum-critical-label': t.critical,
        'sum-warning-label': t.warning,
        'sum-safe-label': t.safe,
        'capacity-card-title': t.capacity_title,
        'flow-card-title': t.flow_title,
        'weather-card-title': t.weather_title,
        'reports-card-title': t.reports_title,
        'map-section-title': t.map_title,
        'all-dams-section-title': t.all_dams_title,
        'back-home-btn': t.back_to_overview
    };

    Object.entries(idMap).forEach(([id, text]) => {
        const el = document.getElementById(id);
        if (el) {
            if (id === 'back-home-btn') {
                const svg = el.querySelector('svg').outerHTML;
                el.innerHTML = `${svg} ${text}`;
            } else {
                el.innerText = text;
            }
        }
    });

    // Update placeholders
    if (DOM.dam_search) DOM.dam_search.placeholder = t.search_placeholder;

    // Update dynamic labels
    document.querySelectorAll('.inflow-label').forEach(el => el.innerText = t.inflow_rate);
    document.querySelectorAll('.release-label').forEach(el => el.innerText = t.current_release);
    document.querySelectorAll('.cumecs-unit').forEach(el => el.innerText = t.cumecs);

    // Toggle button active state
    document.getElementById('lang-en').classList.toggle('active', currentLang === 'en');
    document.getElementById('lang-ml').classList.toggle('active', currentLang === 'ml');

    // Re-render dam grid to reflect language in search placeholder etc.
    if (allParsedDams.length > 0) renderDamsToGrid(allParsedDams);
}

window.setLanguage = function(lang) {
    currentLang = lang;
    localStorage.setItem('kdm_lang', lang);
    updateUILanguage();
};

const radius       = 110;
const circumference = Math.PI * radius; // ~345.58

// ── SCENARIO DATA ────────────────────────────────────
const scenarios = {
    safe: {
        levelPct: 61, levelFt: "2358.12 ft",
        inflow: "400", release: "0",
        alertTitle: "YELLOW ALERT",
        alertDesc: "Moderate isolated rainfall expected. No immediate threat.",
        alertColor: "var(--accent-green)",
        alertBg: "rgba(16,185,129,0.08)", alertIconBg: "rgba(16,185,129,0.2)",
        aiSummary: "Given 400 cumecs inflow and Yellow Alert forecast, reservoir is well below rule curve and expected to remain stable.",
        aiRec: "No action required. Maintain normal monitoring.",
        badgeText: "STABLE", badgeColor: "var(--accent-green)",
        timeToOverflow: "N/A — Stable",
        confidence: "98% Based on Predictive Models",
        markerText: "Tracking well below historical risk markers.",
        chips: ['Aluva 🟢','Perumbavoor 🟢','Ernakulam 🟢','Kalady 🟢','Angamaly 🟢'],
        riskList: `
            <li><span>Cheruthoni</span><span class="risk-level risk-low">Low</span></li>
            <li><span>Keerithodu</span><span class="risk-level risk-low">Low</span></li>
            <li><span>Perumbavoor</span><span class="risk-level risk-low">Low</span></li>
            <li><span>Aluva</span><span class="risk-level risk-low">Low</span></li>
            <li><span>Kalamassery</span><span class="risk-level risk-low">Low</span></li>`,
        malayalamEn: "Status Normal: Idukki Dam water levels are safe. No immediate release planned.",
        malayalam: "🟢 നിലവിൽ ആശങ്കപ്പെടേണ്ട സാഹചര്യമില്ല. ഇടുക്കി ഡാമിലെ ജലനിരപ്പ് സുരക്ഷിതമാണ്."
    },
    orange: {
        levelPct: 84, levelFt: "2398.54 ft",
        inflow: "1,200", release: "0",
        alertTitle: "ORANGE ALERT",
        alertDesc: "Heavy to Very Heavy Rainfall predicted in catchment area for next 48hrs",
        alertColor: "var(--accent-orange)",
        alertBg: "rgba(249,115,22,0.08)", alertIconBg: "rgba(249,115,22,0.2)",
        aiSummary: "Given 1,200 cumecs inflow and Orange Alert forecast, reservoir is projected to exceed rule curve levels within 36 hours.",
        aiRec: "Initiate Controlled Release — 500 cumecs from 6:00 AM",
        badgeText: "CRITICAL", badgeColor: "var(--accent-red)",
        timeToOverflow: "~14 hours if no action taken",
        confidence: "87% Based on Predictive Models",
        markerText: "Tracking closer to 2018 inflow patterns. Proactive release crucial to avoid simultaneous dam spillage.",
        chips: ['Aluva 🔴','Perumbavoor 🔴','Ernakulam 🟠','Kalady 🟠','Angamaly 🟡'],
        riskList: `
            <li><span>Cheruthoni</span><span class="risk-level risk-high">High</span></li>
            <li><span>Keerithodu</span><span class="risk-level risk-high">High</span></li>
            <li><span>Perumbavoor</span><span class="risk-level risk-medium">Medium</span></li>
            <li><span>Aluva</span><span class="risk-level risk-medium">Medium</span></li>
            <li><span>Kalamassery</span><span class="risk-level risk-low">Low</span></li>`,
        malayalamEn: "Official Warning: Due to rising water levels in Idukki Dam, a controlled release is imminent. Residents along the banks of Periyar must remain vigilant.",
        malayalam: "⚠️ അണക്കെട്ട് ലെവൽ 84% ആണ്. ഉടൻ നിയന്ത്രിത ജലം തുറന്നുവിടൽ ആവശ്യമാണ്."
    },
    red: {
        levelPct: 96, levelFt: "2401.80 ft",
        inflow: "3,800", release: "1,500",
        alertTitle: "RED ALERT",
        alertDesc: "EXTREME DOWNPOUR. All catchment areas exceeding 150mm. Immediate threat to life.",
        alertColor: "var(--accent-red)",
        alertBg: "rgba(239,68,68,0.15)", alertIconBg: "rgba(239,68,68,0.3)",
        aiSummary: "CATASTROPHIC INFLOW: 3,800 cumecs exceeds outlet capacity. Multiple upstream dams opening simultaneously.",
        aiRec: "EVACUATE DOWNSTREAM IMMEDIATELY. Open all 5 shutters incrementally to maximum.",
        badgeText: "EMERGENCY", badgeColor: "var(--accent-red)",
        timeToOverflow: "< 2.5 hours at current inflow",
        confidence: "99% Verification matched",
        markerText: "SURPASSING 2018 HISTORIC HIGHS. Catastrophic flash flood highly likely.",
        chips: ['Aluva ⚫','Perumbavoor ⚫','Ernakulam 🔴','Kalady 🔴','Angamaly 🔴'],
        riskList: `
            <li><span>Cheruthoni</span><span class="risk-level risk-high" style="background:var(--accent-red);color:white">EXTREME</span></li>
            <li><span>Keerithodu</span><span class="risk-level risk-high" style="background:var(--accent-red);color:white">EXTREME</span></li>
            <li><span>Perumbavoor</span><span class="risk-level risk-high">High</span></li>
            <li><span>Aluva</span><span class="risk-level risk-high">High</span></li>
            <li><span>Kalamassery</span><span class="risk-level risk-high">High</span></li>`,
        malayalamEn: "EMERGENCY EVACUATION: Open all 5 shutters. Massive flash flood imminent along Periyar river basin.",
        malayalam: "🚨 അതീവ ജാഗ്രത! വെള്ളപ്പൊക്കം ഉറപ്പാണ്. ഡാമിന്റെ 5 ഷട്ടറുകളും തുറക്കുന്നു. പെരിയാർ തീരത്തുള്ളവർ ഉടൻ സുരക്ഷിത സ്ഥാനങ്ങളിലേക്ക് മാറുക!"
    }
};

// ── DAM DESCRIPTIONS ─────────────────────────────────
const damDescriptions = {
    "Idukki":        "Dam Release Decision Support & Early Warning System. One of the highest arch dams in Asia.",
    "Idamalayar":    "A multipurpose concrete gravity dam located on the Idamalayar River in Ernakulam.",
    "Kakki":         "Built across the Kakki River, vital for hydroelectric power generation in Pathanamthitta.",
    "Banasura Sagar":"The largest earth dam in India and second largest of its kind in Asia, located in Wayanad.",
    "Sholayar":      "A vital reservoir for the Chalakudy River basin with significant hydro-electric capacity in Thrissur.",
    "Mattupetty":    "Concrete gravity dam crucial for water conservation and power generation in Idukki.",
    "Mattupetti":    "Concrete gravity dam crucial for water conservation and power generation in Idukki.",
    "Ponmudi":       "Masonry gravity dam constructed across the Panniar River in Idukki.",
    "Pamba":         "Located in Pathanamthitta district, crucial for the Sabarigiri Hydro Electric Project.",
    "Kallarkutty":   "Gravity dam located in the Idukki district across the Muthirapuzha River.",
    "Erattayar":     "A small diversion dam across the Erattayar River in Idukki.",
    "Lower Periyar": "Hydroelectric dam built across the Periyar River.",
    "Moozhiyar":     "Integral part of the Sabarigiri Hydroelectric Project.",
    "Pambla":        "Hydroelectric project dam situated across the Periyar River.",
    "Kakkayam":      "Located in Kozhikode, part of the Kuttiyadi Hydro Electric Project.",
    "Anathode":      "Flanking dam to the Kakki reservoir in the Pathanamthitta district.",
    "Chenkulam":     "Dam built across the Mudirapuzha River for hydroelectric power generation.",
    "Poringalkuthu": "Built across the Chalakudy River for hydro-electric power generation in Thrissur.",
    "Sengulam":      "Part of the Sengulam Hydroelectric Project in Idukki.",
    "Neriamangalam": "Hydroelectric project dam built across the Periyar River in Ernakulam.",
    "Panniar":       "Dam built across the Panniar River in Idukki.",
    "Sabarigiri":    "A major hydroelectric project situated in the Pamba basin.",
    "Kuttiyadi":     "Dam in Kozhikode serving the Kuttiyadi irrigation project.",
    "Thariode":      "Earth dam forming part of the Banasura Sagar project in Wayanad.",
    "Anayirankal":   "Earth dam primarily used for hydroelectric power and water conservation in Idukki.",
    "Kallar":        "Small check dam located in the Idukki district."
};

// ── DYNAMIC NEWS FEED ────────────────────────────────
async function fetchNews() {
    const container = DOM.news_feed_container || document.getElementById('news-feed-container');
    if (!container) return;

    // 1. Generate Live System Events (Simulated "Just Now" data)
    const systemEvents = [
        {
            title: `Sensor heartbeat stable across ${currentDamName} telemetry nodes.`,
            author: "System",
            link: "#",
            pubDate: new Date(),
            source: "TELEMETRY"
        },
        {
            title: `Pre-release simulation: Discharge efficiency confirmed at 94%.`,
            author: "AI Engine",
            link: "#",
            pubDate: new Date(Date.now() - 15 * 60 * 1000),
            source: "ANALYSIS"
        }
    ];

    try {
        const query = encodeURIComponent('Kerala Dam reservoir');
        const rssUrl = `https://news.google.com/rss/search?q=${query}&hl=en-IN&gl=IN&ceid=IN:en`;
        const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`);
        
        let newsItems = [];
        if (res.ok) {
            const data = await res.json();
            if (data.status === 'ok' && data.items) {
                newsItems = data.items.slice(0, 4);
            }
        }

        // Combine: System Events at top, then RSS News
        const allItems = [...systemEvents, ...newsItems];
        const fragment = document.createDocumentFragment();

        allItems.forEach(item => {
            const isSystem = item.source === "TELEMETRY" || item.source === "ANALYSIS";
            const newsItem = document.createElement(isSystem ? 'div' : 'a');
            newsItem.className = 'news-item';
            if (!isSystem) {
                newsItem.href = item.link;
                newsItem.target = '_blank';
                newsItem.rel = 'noopener noreferrer';
            }

            const originalDate = new Date(item.pubDate);
            // IMMERSION: Shift date by 2 years to match the 2026 simulation
            const date = new Date(originalDate);
            date.setFullYear(date.getFullYear() + 2);
            
            // If the shifted date is in the future relative to our clock, cap it at 'Just Now'
            const displayDate = date > new Date() ? new Date() : date;
            const timeAgo = formatTimeAgo(displayDate);

            newsItem.innerHTML = `
                <div class="news-time">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    ${timeAgo}
                </div>
                <div class="news-title">${item.title}</div>
                <div class="news-source">
                    <span class="source-tag" style="${isSystem?'background:rgba(16,185,129,0.2);color:#6ee7b7;':''}">${item.author}</span>
                    ${item.source || 'News Feed'}
                </div>
            `;
            fragment.appendChild(newsItem);
        });

        container.innerHTML = '';
        container.appendChild(fragment);
    } catch (e) {
        console.error('News Feed Error:', e);
    }
}

function formatTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
}

// ── DISTRICT MAP ─────────────────────────────────────
const districtMap = {
    "Idukki":"Idukki","Idamalayar":"Ernakulam","Kakki":"Pathanamthitta",
    "Banasura Sagar":"Wayanad","Sholayar":"Thrissur","Mattupetti":"Idukki",
    "Mattupetty":"Idukki","Kundala":"Idukki","Ponmudi":"Idukki",
    "Pamba":"Pathanamthitta","Kallarkutty":"Idukki","Erattayar":"Idukki",
    "Lower Periyar":"Idukki","Moozhiyar":"Pathanamthitta","Pambla":"Idukki",
    "Kakkayam":"Kozhikode","Anathode":"Pathanamthitta","Chenkulam":"Idukki",
    "Poringalkuthu":"Thrissur","Sengulam":"Idukki","Neriamangalam":"Ernakulam",
    "Panniar":"Idukki","Sabarigiri":"Pathanamthitta","Kuttiyadi":"Kozhikode",
    "Thariode":"Wayanad","Anayirankal":"Idukki","Kallar":"Idukki"
};

// ── DAM INTELLIGENCE DATABASE ─────────────────────────
const damIntelDB = {
    "Idukki":       {river:"Periyar",releasePoint:"Cheruthoni Dam Shutters (Idukki District)",travelTime:"4-6 hours to reach Aluva",via:"Keerithodu → Perumbavoor → Aluva",mlRiver:"ജലം പെരിയാർ നദിയിലൂടെ ഒഴുകുന്നു",downstream:[["Cheruthoni","HIGH"],["Keerithodu","HIGH"],["Perumbavoor","MEDIUM"],["Aluva","MEDIUM"],["Kalamassery","LOW"]],alertZones:["Aluva","Perumbavoor","Ernakulam","Kalady","Angamaly"]},
    "Idamalayar":   {river:"Idamalayar River → Periyar",releasePoint:"Idamalayar Dam Spillway (Ernakulam)",travelTime:"3-5 hours to reach Ernakulam",via:"Bhoothathankettu → Kolenchery → Ernakulam",mlRiver:"ജലം ഇടമലയാർ നദിയിലൂടെ ഒഴുകുന്നു",downstream:[["Bhoothathankettu","HIGH"],["Kolenchery","HIGH"],["Kothamangalam","MEDIUM"],["Ernakulam","MEDIUM"],["Tripunithura","LOW"]],alertZones:["Kothamangalam","Ernakulam","Kolenchery","Piravom","Aluva"]},
    "Kakki":        {river:"Kakki River → Pamba",releasePoint:"Kakki Dam Gates (Pathanamthitta)",travelTime:"5-7 hours to reach Alappuzha",via:"Ranni → Thiruvalla → Alappuzha",mlRiver:"ജലം കക്കി നദിയിലൂടെ ഒഴുകുന്നു",downstream:[["Ranni","HIGH"],["Eratupetta","HIGH"],["Thiruvalla","MEDIUM"],["Chengannur","MEDIUM"],["Alappuzha","LOW"]],alertZones:["Ranni","Thiruvalla","Chengannur","Alappuzha","Kuttanad"]},
    "Banasura Sagar":{river:"Karamanathodu → Kabani",releasePoint:"Banasura Sagar Spillway (Wayanad)",travelTime:"3-4 hours to reach Kalpetta",via:"Vythiri → Kalpetta → Sulthan Bathery",mlRiver:"ജലം കബനി നദിയിലൂടെ ഒഴുകുന്നു",downstream:[["Vythiri","HIGH"],["Kalpetta","HIGH"],["Sulthan Bathery","MEDIUM"],["Mananthavady","MEDIUM"],["Perambra","LOW"]],alertZones:["Kalpetta","Vythiri","Mananthavady","Sulthan Bathery","Nenmeni"]},
    "Sholayar":     {river:"Sholayar River → Chalakudy",releasePoint:"Sholayar Dam Shutters (Thrissur)",travelTime:"4-6 hours to reach Chalakudy",via:"Parambikulam → Chalakudy → Thrissur",mlRiver:"ജലം ചാലക്കുടി നദിയിലൂടെ ഒഴുകുന്നു",downstream:[["Parambikulam","HIGH"],["Chalakudy","HIGH"],["Kodungallur","MEDIUM"],["Thrissur","MEDIUM"],["Irinjalakuda","LOW"]],alertZones:["Chalakudy","Kodungallur","Thrissur","Irinjalakuda","Mukundapuram"]},
    "Pamba":        {river:"Pamba River",releasePoint:"Pamba Dam Spillway (Pathanamthitta)",travelTime:"6-8 hours to reach Kuttanad",via:"Ranni → Kozhencherry → Kuttanad",mlRiver:"ജലം പമ്പ നദിയിലൂടെ ഒഴുകുന്നു",downstream:[["Ranni","HIGH"],["Kozhencherry","HIGH"],["Chengannur","MEDIUM"],["Kuttanad","HIGH"],["Alappuzha","MEDIUM"]],alertZones:["Ranni","Kuttanad","Alappuzha","Chengannur","Pandanad"]},
    "Poringalkuthu":{river:"Chalakudy River",releasePoint:"Poringalkuthu Spillway (Thrissur)",travelTime:"3-5 hours to reach Chalakudy",via:"Lower Meenmutty → Chalakudy",mlRiver:"ജലം ചാലക്കുടി നദിയിലൂടെ ഒഴുകുന്നു",downstream:[["Lower Meenmutty","HIGH"],["Chalakudy","HIGH"],["Kodungallur","MEDIUM"],["Thrissur","LOW"],["Irinjalakuda","LOW"]],alertZones:["Chalakudy","Kodungallur","Irinjalakuda","Thrissur","Mukundapuram"]},
    "Lower Periyar":{river:"Periyar River",releasePoint:"Lower Periyar Dam Shutters (Idukki)",travelTime:"5-7 hours to reach Aluva",via:"Bhoothathankettu → Perumbavoor → Aluva",mlRiver:"ജലം പെരിയാർ നദിയിലൂടെ ഒഴുകുന്നു",downstream:[["Bhoothathankettu","HIGH"],["Perumbavoor","HIGH"],["Aluva","MEDIUM"],["Ernakulam","MEDIUM"],["Kalamassery","LOW"]],alertZones:["Perumbavoor","Aluva","Ernakulam","Kalady","Angamaly"]},
    "Kallarkutty":  {river:"Muthirapuzha → Periyar",releasePoint:"Kallarkutty Dam (Idukki)",travelTime:"4-5 hours to reach Perumbavoor",via:"Muthirapuzha → Periyar → Perumbavoor",mlRiver:"ജലം മുതിരപ്പുഴ വഴി പെരിയാറിൽ ചേരുന്നു",downstream:[["Muthirapuzha Valley","HIGH"],["Aluva","MEDIUM"],["Perumbavoor","MEDIUM"],["Ernakulam","LOW"],["Kalady","LOW"]],alertZones:["Muthirapuzha Basin","Perumbavoor","Aluva","Kalady","Angamaly"]},
    "Kakkayam":     {river:"Kakkayam → Kuttiyadi River",releasePoint:"Kakkayam Dam Gates (Kozhikode)",travelTime:"3-4 hours to reach Kozhikode",via:"Kuttiyadi → Feroke → Kozhikode",mlRiver:"ജലം കുറ്റ്യാടി നദിയിലൂടെ ഒഴുകുന്നു",downstream:[["Kuttiyadi","HIGH"],["Feroke","HIGH"],["Kozhikode","MEDIUM"],["Beypore","MEDIUM"],["Elathur","LOW"]],alertZones:["Kuttiyadi","Feroke","Kozhikode","Beypore","Elathur"]},
    "Moozhiyar":    {river:"Moozhiyar River → Pamba",releasePoint:"Moozhiyar Dam (Pathanamthitta)",travelTime:"5-8 hours to reach Alappuzha",via:"Ranni → Kozhencherry → Kuttanad",mlRiver:"ജലം പമ്പ നദി വഴി ഒഴുകുന്നു",downstream:[["Ranni","HIGH"],["Kozhencherry","MEDIUM"],["Kuttanad","HIGH"],["Chengannur","MEDIUM"],["Alappuzha","LOW"]],alertZones:["Ranni","Kuttanad","Alappuzha","Chengannur","Pandanad"]},
    "Mattupetti":   {river:"Mattupetti Ar → Periyar",releasePoint:"Mattupetti Dam Gates (Idukki)",travelTime:"5-7 hours to reach Aluva",via:"Munnar → Periyar → Aluva",mlRiver:"ജലം മൂന്നാർ വഴി പെരിയാറിൽ ചേരുന്നു",downstream:[["Munnar Town","MEDIUM"],["Adimali","HIGH"],["Perumbavoor","MEDIUM"],["Aluva","LOW"],["Ernakulam","LOW"]],alertZones:["Munnar","Adimali","Perumbavoor","Aluva","Ernakulam"]},
    "Mattupetty":   {river:"Mattupetti Ar → Periyar",releasePoint:"Mattupetty Dam Gates (Idukki)",travelTime:"5-7 hours to reach Aluva",via:"Munnar → Periyar → Aluva",mlRiver:"ജലം മൂന്നാർ വഴി പെരിയാറിൽ ചേരുന്നു",downstream:[["Munnar Town","MEDIUM"],["Adimali","HIGH"],["Perumbavoor","MEDIUM"],["Aluva","LOW"],["Ernakulam","LOW"]],alertZones:["Munnar","Adimali","Perumbavoor","Aluva","Ernakulam"]},
    "Erattayar":    {river:"Erattayar River → Periyar",releasePoint:"Erattayar Dam (Idukki)",travelTime:"4-6 hours to reach Perumbavoor",via:"Upper Periyar Basin → Perumbavoor",mlRiver:"ജലം പെരിയാർ നദിയിലൂടെ ഒഴുകുന്നു",downstream:[["Upputhodu","HIGH"],["Kanjirappally","MEDIUM"],["Perumbavoor","MEDIUM"],["Aluva","LOW"],["Ernakulam","LOW"]],alertZones:["Upputhodu","Kuttikanam","Perumbavoor","Aluva","Ernakulam"]}
};

// ── HELPERS ───────────────────────────────────────────
function getIntelForDam(damName, district) {
    return damIntelDB[damName] || {
        river:`${district} River Basin`,
        releasePoint:`${damName} Main Spillway (${district})`,
        travelTime:"3-6 hours (estimated)",
        via:`${district} River → Downstream`,
        mlRiver:`ജലം ${district} ജില്ലയിലൂടെ ഒഴുകുന്നു`,
        downstream:[[`${district} Town`,"MEDIUM"],["Downstream Zone A","MEDIUM"],["Downstream Zone B","LOW"]],
        alertZones:[`${district} Town`,"Downstream Villages","River Belt"]
    };
}

function getRiskClass(level) {
    if (level === 'HIGH' || level === 'EXTREME') return 'risk-high';
    if (level === 'MEDIUM') return 'risk-medium';
    return 'risk-low';
}

function setGauge(pct) {
    const gauge = document.querySelector('.gauge-path');
    if (!gauge) return;
    gauge.style.strokeDasharray  = circumference;
    gauge.style.strokeDashoffset = circumference * (1 - pct / 100);
    gauge.style.stroke = pct >= 90 ? 'var(--accent-red)' : pct >= 80 ? 'var(--accent-orange)' : 'var(--accent-blue)';
}

// ── TIMESTAMP (last successful data fetch, NOT live clock) ───────────────
function updateFetchTimestamp() {
    const el = document.getElementById('current-time');
    if (!el) return;
    const now = new Date();
    el.innerText = `Data fetched: ${now.toLocaleDateString('en-IN', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    })}`;
    localStorage.setItem('kdm_last_fetch', now.toISOString());
}

function showOfflineBanner(lastFetchIso) {
    let banner = document.getElementById('kdm-offline-banner');
    if (!banner) {
        banner = document.createElement('div');
        banner.id = 'kdm-offline-banner';
        banner.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99998;background:#b91c1c;color:#fff;text-align:center;padding:0.55rem 1rem;font-size:0.82rem;font-weight:600;letter-spacing:0.02em;display:flex;align-items:center;justify-content:center;gap:0.5rem;';
        document.body.prepend(banner);
    }
    let msg = '⚠️ Live data unavailable — showing cached data.';
    if (lastFetchIso) {
        const diff = Math.round((Date.now() - new Date(lastFetchIso)) / 60000);
        msg = `⚠️ Live feed offline. Showing cached data from ${diff} min ago. Pull to refresh.`;
    }
    banner.textContent = msg;
    banner.style.display = 'flex';
}

function hideOfflineBanner() {
    const banner = document.getElementById('kdm-offline-banner');
    if (banner) banner.style.display = 'none';
}

// ── TRENDS CHART ──────────────────────────────────────
function updateTrends(damName, scenario) {
    currentDamName  = damName;
    currentScenario = scenario;
    const canvas = document.getElementById('trendsChart');
    if (!canvas) return;

    const seed   = (damName.length * 7) % 5;
    const labels = ["T-72h","T-60h","T-48h","T-36h","T-24h","T-12h","NOW","T+12h","T+24h"];
    let currentData, peak2018;

    if (scenario === 'safe') {
        currentData = [55,56,56.5,57,58,59,61,62,63].map(v => v + seed);
        peak2018    = [92,92,92,92,92,92,92,92,92];
    } else if (scenario === 'orange') {
        currentData = [72,74,76,78,80,82,84,87,89].map(v => v + seed/2);
        peak2018    = [90,91,92,92.5,93,94,94,94,94];
    } else {
        currentData = [85,88,91,93,94,95,96,97,98];
        peak2018    = [92,92.5,93,94,95,96,97,98,99];
    }

    if (trendsChartInstance) trendsChartInstance.destroy();
    trendsChartInstance = new Chart(canvas, {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: 'Predicted Storage %', data: currentData,
                    borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.1)',
                    borderWidth: 3, fill: true, tension: 0.4,
                    pointRadius: 4, pointBackgroundColor: '#3b82f6', pointBorderColor: '#fff',
                    pointHoverRadius: 6
                },
                {
                    label: '2018 Peak Level', data: peak2018,
                    borderColor: '#ef4444', borderDash: [5,5],
                    borderWidth: 2, fill: false, tension: 0, pointRadius: 0
                }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            animation: { duration: 800, easing: 'easeInOutQuart' },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#ffffff', titleColor: '#2563eb',
                    bodyColor: '#0f172a', borderColor: '#cbd5e1', borderWidth: 1,
                    padding: 10, cornerRadius: 8
                }
            },
            scales: {
                y: {
                    min: 40, max: 100,
                    grid: { color: '#e2e8f0' },
                    ticks: { color: '#64748b', callback: v => v + '%' }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#64748b' }
                }
            }
        }
    });
}

// ── LANDING PAGE ──────────────────────────────────────
function enterDashboard() {
    const landing = document.getElementById('landing-page');
    if (landing) landing.classList.add('hidden');
    setTimeout(() => { if (keralMap) keralMap.invalidateSize(); }, 800);
}

// ── SELECT DAM ────────────────────────────────────────
window.allDamsData = [];

window.selectDam = function(damName) {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (DOM.dam_detail_view) { DOM.dam_detail_view.style.display = 'block'; DOM.dam_detail_view.style.opacity = '1'; }
    if (DOM.back_home_btn) DOM.back_home_btn.style.display = 'flex';

    const dam = window.allDamsData.find(d => d.name === damName);
    if (!dam || !dam.data || dam.data.length === 0) return;

    const cl     = parseFloat(dam.data[0].waterLevel);
    const fl     = parseFloat(dam.FRL);
    const pct    = parseFloat(dam.data[0].storagePercentage) || Math.round((cl / fl) * 100);
    const inflow = parseFloat(dam.data[0].inflow) || 0;
    const district = districtMap[damName] || 'Idukki';

    if (DOM.main_dam_title) DOM.main_dam_title.innerText = `${dam.name} Reservoir`;
    if (DOM.main_dam_desc)  DOM.main_dam_desc.innerText  = damDescriptions[dam.name] || `Early warning & telemetry system for ${damName}.`;

    if (DOM.gaugeValue) DOM.gaugeValue.innerText = `${pct.toFixed(1)}%`;
    if (DOM.main_dam_level_cl) DOM.main_dam_level_cl.innerText = `${cl.toFixed(2)} ft`;
    if (DOM.main_dam_level_fl) DOM.main_dam_level_fl.innerText = `Full Reservoir Level: ${fl.toFixed(2)} ft`;
    setGauge(pct);

    // Flow
    if (DOM.main_dam_inflow)  DOM.main_dam_inflow.innerHTML  = `${dam.data[0].inflow || 0} <span style="font-size:1.125rem;color:var(--text-secondary);font-weight:normal;">cumecs</span>`;
    if (DOM.main_dam_outflow) DOM.main_dam_outflow.innerHTML = `${dam.data[0].totalOutflow || dam.data[0].outflow || 0} <span style="font-size:1.125rem;color:var(--text-secondary);font-weight:normal;">cumecs</span>`;

    // Risk classification
    const intel = getIntelForDam(damName, district);
    let riskLevel, badgeText, badgeColor, aiRecText, aiContextText, timeToOverflow, mlWarning, enWarning;

    if (pct >= 90 || inflow > 2000) {
        riskLevel='CRITICAL'; badgeText='CRITICAL'; badgeColor='var(--accent-red)';
        aiRecText=`URGENT: Initiate controlled release — open spillway gates. Evacuate downstream settlements within 5km.`;
        aiContextText=`Storage at ${pct.toFixed(1)}% with ${inflow||'—'} cumecs inflow. Reservoir projected to breach rule curve within hours.`;
        timeToOverflow = pct >= 98 ? '< 2 hours at current inflow' : '~6 hours if no action taken';
        mlWarning=`🚨 ${damName} ഡാം ഗുരുതര സ്ഥിതിയിൽ. ${intel.river} തീരത്തുള്ളവർ ഉടൻ ഒഴിഞ്ഞുമാറുക!`;
        enWarning=`EMERGENCY: ${damName} at critical level. Immediate evacuation required along ${intel.river} banks.`;
    } else if (pct >= 80 || inflow > 800) {
        riskLevel='HIGH'; badgeText='HIGH RISK'; badgeColor='var(--accent-orange)';
        aiRecText=`Initiate gradual controlled release of ${Math.max(100,Math.round(inflow*0.4))} cumecs. Monitor downstream levels hourly.`;
        aiContextText=`Storage at ${pct.toFixed(1)}% with ${inflow||'—'} cumecs inflow. Approaching rule curve limit — proactive release advised.`;
        timeToOverflow='~14-20 hours if no action taken';
        mlWarning=`⚠️ ${damName} ഡാം ലെവൽ ${pct.toFixed(0)}% ആണ്. ഉടൻ നിയന്ത്രിത ജലം തുറന്നുവിടൽ ആവശ്യമാണ്.`;
        enWarning=`Warning: ${damName} at ${pct.toFixed(0)}% capacity. Controlled release imminent. ${intel.river} area stay alert.`;
    } else {
        riskLevel='STABLE'; badgeText='STABLE'; badgeColor='var(--accent-green)';
        aiRecText=`No release required. Maintain standard monitoring schedule. Continue hydro-generation drafts.`;
        aiContextText=`Storage at ${pct.toFixed(1)}% — well within safe operating range. Current inflow is manageable.`;
        timeToOverflow='N/A — Stable conditions';
        mlWarning=`🟢 ${damName} ഡാം സുരക്ഷിത നിലയിൽ. ആശങ്കപ്പെടേണ്ട സാഹചര്യമില്ല.`;
        enWarning=`Status Normal: ${damName} water levels are safe. No immediate release planned.`;
    }

    const riskListHTML = intel.downstream.map(([town, base]) => {
        const eff = pct >= 90 ? (base==='LOW'?'MEDIUM':'HIGH') : pct >= 80 ? base : (base==='HIGH'?'MEDIUM':'LOW');
        return `<li><span>${town}</span><span class="risk-level ${getRiskClass(eff)}">${eff}</span></li>`;
    }).join('');

    const chipEmoji = riskLevel==='CRITICAL' ? '⚫' : riskLevel==='HIGH' ? '🔴' : '🟢';
    const chipsHTML = intel.alertZones.map(z => `<div class="chip">${z} <span style="font-size:1.1rem;">${chipEmoji}</span></div>`).join('');

    if (DOM.scenario_container) DOM.scenario_container.style.display = damName.toLowerCase().includes('idukki') ? 'flex' : 'none';
    if (DOM.mixed_layout_section) DOM.mixed_layout_section.style.display = 'grid';
    if (DOM.idukki_intelligence_section) DOM.idukki_intelligence_section.style.display = 'grid';

    if (DOM.ai_context_text_classic) DOM.ai_context_text_classic.innerText = aiContextText;
    if (DOM.ai_rec_text_classic) DOM.ai_rec_text_classic.innerText = aiRecText;

    if (DOM.warning_malayalam_classic) {
        DOM.warning_malayalam_classic.innerHTML = `<strong>ജാഗ്രതാ നിർദ്ദേശം:</strong><br>${mlWarning}<div class="warning-en" style="margin-top:0.5rem;color:inherit;opacity:0.8;">${enWarning}</div>`;
        const colors = {
            CRITICAL:['rgba(239,68,68,0.15)','var(--accent-red)','#fca5a5'],
            HIGH:    ['rgba(249,115,22,0.1)', 'var(--accent-orange)','#fdba74'],
            STABLE:  ['rgba(16,185,129,0.1)', 'var(--accent-green)','#6ee7b7']
        };
        const [bg, border, color] = colors[riskLevel];
        DOM.warning_malayalam_classic.style.backgroundColor  = bg;
        DOM.warning_malayalam_classic.style.borderLeftColor  = border;
        DOM.warning_malayalam_classic.style.color            = color;
    }

    if (DOM.risk_list_classic) DOM.risk_list_classic.innerHTML = riskListHTML;

    // Engine panel
    if (DOM.engine_status_badge) { DOM.engine_status_badge.innerText = badgeText; DOM.engine_status_badge.style.backgroundColor = badgeColor; }
    if (DOM.ai_rec_text) DOM.ai_rec_text.innerText = aiRecText;

    // Release location block
    if (DOM.release_loc_block) DOM.release_loc_block.innerHTML = `
        <div style="font-weight:600;color:#93c5fd;margin-bottom:0.75rem;display:flex;align-items:center;gap:0.5rem;font-size:0.875rem;text-transform:uppercase;">🌊 RELEASE POINT LOCATION</div>
        <ul style="list-style:none;color:var(--text-primary);font-size:0.875rem;margin-bottom:0.75rem;">
            <li style="margin-bottom:0.35rem;"><span style="color:var(--text-secondary);">Primary Release:</span> <strong>${intel.releasePoint}</strong></li>
            <li style="margin-bottom:0.35rem;"><span style="color:var(--text-secondary);">Water flows into:</span> <strong>${intel.river}</strong></li>
            <li style="margin-bottom:0.35rem;"><span style="color:var(--text-secondary);">First impact zone:</span> <strong>${intel.via}</strong></li>
            <li><span style="color:var(--text-secondary);">Est. travel time:</span> <strong style="color:#fdba74;">${intel.travelTime}</strong></li>
        </ul>
        <div style="padding-top:0.75rem;border-top:1px solid rgba(30,58,95,0.4);font-family:'Noto Sans Malayalam',sans-serif;color:#60a5fa;font-size:1rem;">${intel.mlRiver}</div>`;

    if (DOM.time_overflow_val) { DOM.time_overflow_val.innerText = timeToOverflow; DOM.time_overflow_val.style.color = riskLevel==='STABLE'?'var(--text-secondary)':riskLevel==='HIGH'?'#fca5a5':'var(--accent-red)'; }
    if (DOM.confidence_val) DOM.confidence_val.innerText = `${75+Math.round(pct*0.2)}% Based on Predictive Models`;

    if (DOM.comparison_text) DOM.comparison_text.innerText = `Current: ${pct.toFixed(1)}%`;
    if (DOM.comparison_fill) DOM.comparison_fill.style.width = `${Math.min(100,pct)}%`;
    if (DOM.comparison_desc) DOM.comparison_desc.innerText = pct>=90?'SURPASSING safe thresholds. Immediate action required.':pct>=80?'Approaching critical levels. Proactive release recommended.':'Well within normal operating range. Continue standard monitoring.';

    if (DOM.alert_chips_container) DOM.alert_chips_container.innerHTML = chipsHTML;

    if (DOM.warning_box_malayalam) {
        DOM.warning_box_malayalam.innerText = mlWarning;
        if (riskLevel==='CRITICAL')     { DOM.warning_box_malayalam.style.backgroundColor='var(--accent-red)'; DOM.warning_box_malayalam.style.color='white'; DOM.warning_box_malayalam.style.fontWeight='700'; }
        else if (riskLevel==='HIGH')    { DOM.warning_box_malayalam.style.backgroundColor='rgba(239,68,68,0.15)'; DOM.warning_box_malayalam.style.color='#fca5a5'; DOM.warning_box_malayalam.style.fontWeight=''; }
        else                            { DOM.warning_box_malayalam.style.backgroundColor='rgba(16,185,129,0.1)'; DOM.warning_box_malayalam.style.color='#6ee7b7'; DOM.warning_box_malayalam.style.fontWeight=''; }
    }

    // Weather update for specific dam
    if (dam.latitude && dam.longitude) {
        fetchWeather(dam.latitude, dam.longitude);
    }

    updateTrends(damName, currentScenario);
};

// ── MAP ───────────────────────────────────────────────
function initMap() {
    if (keralMap) return;
    const mapEl = document.getElementById('kerala-map');
    if (!mapEl) return;

    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            const keralaBounds = L.latLngBounds(L.latLng(8.0, 74.8), L.latLng(12.8, 77.6));
            keralMap = L.map('kerala-map', {
                center: [10.3, 76.5], zoom: 7, minZoom: 7, maxZoom: 12,
                maxBounds: keralaBounds, maxBoundsViscosity: 1.0,
                zoomControl: true, scrollWheelZoom: true
            });
            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; OpenStreetMap &copy; CARTO', subdomains: 'abcd', maxZoom: 12
            }).addTo(keralMap);
            
            if (window.pendingMapMarkersData) {
                updateMapMarkers(window.pendingMapMarkersData);
                window.pendingMapMarkersData = null;
            } else if (window.allDamsData && window.allDamsData.length > 0) {
                updateMapMarkers(window.allDamsData);
            }
            observer.unobserve(mapEl);
        }
    }, { threshold: 0.1 });


    observer.observe(mapEl);
}

function updateMapMarkers(damsList) {
    if (!keralMap) {
        window.pendingMapMarkersData = damsList;
        initMap();
        return;
    }
    
    mapMarkers.forEach(m => keralMap.removeLayer(m));
    mapMarkers = [];

    damsList.forEach(d => {

        if (!d.latitude || !d.longitude || !d.data || d.data.length === 0) return;
        const cl  = parseFloat(d.data[0].waterLevel);
        const fl  = parseFloat(d.FRL);
        if (isNaN(cl) || isNaN(fl) || fl <= 0) return;

        const pct = parseFloat(d.data[0].storagePercentage) || Math.round((cl/fl)*100);

        const color       = pct>=90?'#ef4444':pct>=70?'#f97316':'#10b981';
        const statusLabel = pct>=90?'CRITICAL':pct>=70?'WARNING':'SAFE';

        if (pct >= 90) {
            const ring = L.circleMarker([d.latitude,d.longitude],{radius:17,fillColor:'transparent',color:'#ef4444',weight:1.5,opacity:0.35,fillOpacity:0}).addTo(keralMap);
            mapMarkers.push(ring);
        }

        const marker = L.circleMarker([d.latitude,d.longitude],{radius:10,fillColor:color,color:'rgba(255,255,255,0.4)',weight:2,opacity:1,fillOpacity:0.9});
        const inflow  = d.data[0].inflow || '–';
        const outflow = d.data[0].totalOutflow || d.data[0].outflow || '–';

        marker.bindPopup(`
            <div class="map-popup-name">${d.name} Reservoir</div>
            <div class="map-popup-pct" style="color:${color}">${pct.toFixed(1)}%</div>
            <div style="font-size:0.78rem;color:#94a3b8;margin-top:3px;">Storage Capacity</div>
            <div class="map-popup-meta">Inflow: <b>${inflow}</b> cumecs &nbsp;|&nbsp; Outflow: <b>${outflow}</b> cumecs</div>
            <div class="map-popup-meta" style="margin-top:2px;">Status: <b style="color:${color}">${statusLabel}</b></div>
            <button class="map-popup-btn" onclick="selectDam('${d.name.replace(/'/g,"\\'")}');this.closest('.leaflet-popup').remove();">View Full Details →</button>
        `,{maxWidth:220});

        marker.addTo(keralMap);
        mapMarkers.push(marker);
    });
}

// ── GO HOME ───────────────────────────────────────────
function goHome() {
    const detailView = document.getElementById('dam-detail-view');
    const allView    = document.getElementById('all-dams-view');

    if (detailView) { detailView.style.opacity = '0'; }
    setTimeout(() => {
        if (detailView) detailView.style.display = 'none';
        if (allView)    { allView.style.display = 'block'; allView.style.opacity = '1'; }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 300);

    const backBtn = document.getElementById('back-home-btn');
    if (backBtn) backBtn.style.display = 'none';

    // Restore Idukki defaults
    const idukki = window.allDamsData.find(d => d.name && d.name.toLowerCase().includes('idukki'));
    if (idukki && idukki.data && idukki.data.length > 0) {
        const cl  = parseFloat(idukki.data[0].waterLevel);
        const fl  = parseFloat(idukki.FRL);
        const pct = parseFloat(idukki.data[0].storagePercentage) || Math.round((cl/fl)*100);
        const titleEl = document.getElementById('main-dam-title');
        if (titleEl) titleEl.innerText = 'Idukki Reservoir';
        const descEl  = document.getElementById('main-dam-desc');
        if (descEl)  descEl.innerText  = 'Dam Release Decision Support & Early Warning System. One of the highest arch dams in Asia.';
        if (gaugeValEl) {
            gaugeValEl.innerText = `${pct.toFixed(1)}%`;
            gaugeValEl.title = `Current storage level for ${dam.name} Reservoir relative to its Full Reservoir Level.`;
        }
        const clEl = document.getElementById('main-dam-level-cl');
        if (clEl) clEl.innerText = `${cl.toFixed(2)} ft`;
        const flEl = document.getElementById('main-dam-level-fl');
        if (flEl) flEl.innerText = `Full Reservoir Level: ${fl.toFixed(2)} ft`;
        setGauge(pct);
    }

    const scBtn = document.getElementById('scenario-container');
    if (scBtn) scBtn.style.display = 'flex';
    const mixedLayout = document.getElementById('mixed-layout-section');
    if (mixedLayout) mixedLayout.style.display = 'grid';
    const idukkiIntel = document.getElementById('idukki-intelligence-section');
    if (idukkiIntel) idukkiIntel.style.display = 'grid';
}

// ── FETCH LIVE DATA ───────────────────────────────────
const KDM_CACHE_KEY = 'kdm_live_data';

async function fetchLiveData() {
    let usedLiveLevel = false;
    let fetchedFresh  = false;

    try {
        const damRes = await fetch('https://raw.githubusercontent.com/amith-vp/Kerala-Dam-Water-Levels/main/live.json');
        if (damRes.ok) {
            const payload = await damRes.json();
            const dams = payload.dams;
            window.allDamsData = dams;

            // ── Cache the fresh payload ──
            try { localStorage.setItem(KDM_CACHE_KEY, JSON.stringify(dams)); } catch(_) {}
            updateFetchTimestamp();
            hideOfflineBanner();
            fetchedFresh = true;

            renderAllDamsGrid(dams);

            const idukki = dams.find(d => d.name && d.name.toLowerCase().includes('idukki'));
            if (idukki && idukki.data && idukki.data.length > 0) {
                const cl  = parseFloat(idukki.data[0].waterLevel);
                const fl  = parseFloat(idukki.FRL);
                if (!isNaN(cl) && !isNaN(fl) && fl > 0) {
                    const pct = parseFloat(idukki.data[0].storagePercentage) || Math.round((cl/fl) * 100);
                    const gaugeValEl = document.querySelector('.gauge-value');
                    if (gaugeValEl) gaugeValEl.innerText = `${pct}%`;
                    const gaugeLbEl  = document.querySelector('.gauge-label div:first-child');
                    if (gaugeLbEl)  gaugeLbEl.innerText  = `${cl.toFixed(2)} ft`;
                    const gaugeStEl  = document.querySelector('.gauge-subtext');
                    if (gaugeStEl)  gaugeStEl.innerText  = `Full Reservoir Level: ${fl.toFixed(2)} ft`;
                    setGauge(pct);

                    const compText = document.getElementById('comparison-text');
                    if (compText) compText.innerText = `Current: ${pct}%`;
                    const compFill = document.getElementById('comparison-fill');
                    if (compFill) compFill.style.width = `${pct}%`;

                    if (idukki.latitude && idukki.longitude) {
                        fetchWeather(idukki.latitude, idukki.longitude);
                    }
                    usedLiveLevel = true;
                }
            }
        }
    } catch(e) {
        console.warn('Dam data fetch failed, trying cache.', e);
    }

    // ── Fallback: load from localStorage cache ──
    if (!fetchedFresh) {
        const lastFetch = localStorage.getItem('kdm_last_fetch');
        showOfflineBanner(lastFetch);

        try {
            const cached = localStorage.getItem(KDM_CACHE_KEY);
            if (cached) {
                const dams = JSON.parse(cached);
                window.allDamsData = dams;
                renderAllDamsGrid(dams);
                usedLiveLevel = true;
                console.info('KDM: Loaded from localStorage cache.');
            }
        } catch(_) {}
    }

    if (!usedLiveLevel) {
        setScenario('orange');
        fetchWeather(9.85, 77.1);
    }
}

async function fetchWeather(lat, lon) {
    const cacheKey = `${lat.toFixed(2)},${lon.toFixed(2)}`;
    const now = Date.now();
    
    if (weatherCache[cacheKey] && (now - weatherCache[cacheKey].timestamp < WEATHER_CACHE_TTL)) {
        const cached = weatherCache[cacheKey].data;
        updateAlertCard(cached.type, cached.precip, cached.temp);
        return;
    }

    if (DOM.alertTitle) DOM.alertTitle.innerHTML = '<span class="loading-dots">UPDATING WEATHER</span>';

    try {
        const rainRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=precipitation_sum&current_weather=true&timezone=auto&forecast_days=1`);
        if (rainRes.ok) {
            const rainData = await rainRes.json();
            const precip = rainData?.daily?.precipitation_sum?.[0];
            const currentTemp = rainData?.current_weather?.temperature;
            
            if (precip !== undefined) {
                const type = precip > 115 ? 'red' : precip > 64 ? 'orange' : precip > 6.4 ? 'yellow' : 'green';
                weatherCache[cacheKey] = {
                    timestamp: now,
                    data: { type, precip, temp: currentTemp }
                };
                updateAlertCard(type, precip, currentTemp);
            }
        }
    } catch(e) { 
        console.warn('Weather fetch failed.', e);
        if (DOM.alertTitle) DOM.alertTitle.innerText = 'WEATHER OFFLINE';
    }
}

function updateAlertCard(type, precip, temp) {
    if (!DOM.alertCard || !DOM.alertIcon || !DOM.alertTitle || !DOM.alertDesc) return;

    const cfg = {
        red:    {color:'var(--accent-red)',   bg:'rgba(239,68,68,0.15)',  iconBg:'rgba(239,68,68,0.3)',  title:'RED ALERT',    desc:`Extreme Rainfall: ${precip}mm forecast. Local Temp: ${temp || '--'}°C.`},
        orange: {color:'var(--accent-orange)',bg:'rgba(249,115,22,0.08)', iconBg:'rgba(249,115,22,0.2)', title:'ORANGE ALERT', desc:`Heavy Rainfall: ${precip}mm forecast. Local Temp: ${temp || '--'}°C.`},
        yellow: {color:'#eab308',             bg:'rgba(234,179,8,0.08)',  iconBg:'rgba(234,179,8,0.2)',  title:'YELLOW ALERT', desc:`Moderate Rainfall: ${precip}mm. Local Temp: ${temp || '--'}°C.`},
        green:  {color:'var(--accent-green)', bg:'rgba(16,185,129,0.08)', iconBg:'rgba(16,185,129,0.2)',title:'SAFE',         desc:`Light/No Rainfall: ${precip}mm. Local Temp: ${temp || '--'}°C.`}
    };
    const c = cfg[type] || cfg.green;
    DOM.alertCard.style.borderColor        = c.color;
    DOM.alertCard.style.background         = `linear-gradient(135deg,${c.bg} 0%,var(--card-bg) 100%)`;
    DOM.alertIcon.style.color              = c.color;
    DOM.alertIcon.style.backgroundColor    = c.iconBg;
    DOM.alertTitle.innerHTML               = `<span class="live-blink" style="display:inline-block; width:8px; height:8px; background:${c.color}; border-radius:50%; margin-right:8px;"></span>${c.title}`;
    DOM.alertTitle.style.color             = c.color;
    DOM.alertDesc.innerText                = c.desc;
}

// ── RENDER ALL DAMS GRID ──────────────────────────────
function renderAllDamsGrid(damsList) {
    const container = document.getElementById('all-dams-container');
    if (!container) return;
    container.innerHTML = '';

    const metrics = { total:0, critical:0, warning:0, safe:0 };
    const parsedDams = [];

    damsList.forEach(d => {
        if (!d.name || !d.data || d.data.length === 0) return;
        const cl = parseFloat(d.data[0].waterLevel);
        const fl = parseFloat(d.FRL);
        if (isNaN(cl) || isNaN(fl) || fl <= 0) return;

        metrics.total++;
        const pct    = parseFloat(d.data[0].storagePercentage) || Math.round((cl/fl)*100);
        const barPct = Math.min(100, Math.max(0, pct));
        let status   = 'safe';
        if (pct >= 90)      { status='critical'; metrics.critical++; }
        else if (pct >= 70) { status='warning';  metrics.warning++; }
        else                 { metrics.safe++; }

        parsedDams.push({
            name: d.name,
            district: districtMap[d.name] || 'Kerala District',
            cl, fl, pct: pct.toFixed(1), barPct, status
        });
    });

    allParsedDams = parsedDams;
    renderDamsToGrid(parsedDams);
    
    // Ensure summary bar is explicitly updated 
    const sumTotal = document.getElementById('sum-total');
    const sumCrit  = document.getElementById('sum-critical');
    const sumWarn  = document.getElementById('sum-warning');
    const sumSafe  = document.getElementById('sum-safe');

    if (sumTotal) sumTotal.innerText = metrics.total;
    if (sumCrit)  sumCrit.innerText  = metrics.critical;
    if (sumWarn)  sumWarn.innerText  = metrics.warning;
    if (sumSafe)  sumSafe.innerText  = metrics.safe;

    // Update plain-language alert bar
    const alertText = document.getElementById('plain-alert-text');
    const alertDot  = document.getElementById('plain-alert-dot');
    if (alertText && alertDot) {
        const idukki = parsedDams.find(d => d.name.toLowerCase().includes('idukki'));
        let idukkiStr = '';
        if (idukki) {
            const levelStr = idukki.status === 'critical' ? 'Red Alert' : (idukki.status === 'warning' ? 'Orange Alert' : 'Safe Level');
            idukkiStr = `Idukki Reservoir is ${idukki.pct}% full — ${levelStr}. `;
        }
        
        if (metrics.critical > 0) {
            alertText.innerText = `${idukkiStr}${metrics.critical} critical dams being monitored. Extreme caution advised.`;
            alertDot.style.background = 'var(--accent-red)';
            alertDot.style.animation = 'pulseDot 1.5s infinite';
        } else if (metrics.warning > 0) {
            alertText.innerText = `${idukkiStr}${metrics.warning} dams at warning levels (>70%). Please monitor closely.`;
            alertDot.style.background = 'var(--accent-orange)';
            alertDot.style.animation = 'none';
        } else {
            alertText.innerText = `${idukkiStr}All ${metrics.total} monitored dams are within safe operating levels.`;
            alertDot.style.background = 'var(--accent-green)';
            alertDot.style.animation = 'none';
        }
    }

    initMap();
    updateMapMarkers(damsList);
}

// ── OPTIMIZATION: FRAGMENT RENDERING ──────────────────
function renderDamsToGrid(dList) {
    if (!DOM.all_dams_container) DOM.all_dams_container = document.getElementById('all-dams-container');
    if (!DOM.all_dams_container) return;
    
    DOM.all_dams_container.innerHTML = '';

    if (dList.length === 0) {
        DOM.all_dams_container.innerHTML = `
            <div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--text-secondary);">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="margin-bottom:1rem;opacity:0.4;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <p>No dams match your search term.</p>
            </div>`;
        return;
    }

    const fragment = document.createDocumentFragment();
    dList.forEach(d => {
        const badgeClass = d.status==='critical'?'badge-danger':d.status==='warning'?'badge-warning':'badge-safe';
        const barColor   = d.status==='critical'?'var(--accent-red)':d.status==='warning'?'var(--accent-orange)':'var(--accent-green)';
        const badgeText  = d.status==='critical'?'CRITICAL':d.status==='warning'?'WARNING':'SAFE';

        const card = document.createElement('div');
        card.className = 'dam-card';
        card.setAttribute('onclick', `selectDam('${d.name.replace(/'/g, "\\'")}')`);
        card.innerHTML = `
            <div class="dam-card-header">
                <div class="dam-name">
                    ${d.name}
                    <div style="font-size:0.75rem;color:var(--text-secondary);margin-top:0.2rem;font-weight:500;">📍 ${d.district}</div>
                </div>
                <div class="dam-badge ${badgeClass}">${badgeText}</div>
            </div>
            <div style="font-family:'Syne',sans-serif;font-size:1.5rem;font-weight:700;">${d.pct}%</div>
            <div class="dam-progress-container">
                <div class="dam-progress-fill" style="width:${d.barPct}%;background-color:${barColor};"></div>
            </div>
            <div class="dam-stats">
                <span>${d.cl.toFixed(1)} / ${d.fl.toFixed(0)} ft</span>
                <span style="color:var(--accent-blue);font-weight:600;">View Details →</span>
            </div>`;
        fragment.appendChild(card);
    });
    DOM.all_dams_container.appendChild(fragment);
}

// ── ALERT SIMULATOR ───────────────────────────────────
function openAlertSimulator() {
    const overlay = document.getElementById('alert-modal-overlay');
    if (!overlay) return;
    overlay.classList.add('open');

    ['collector','ndrf','police','dam','village','fire'].forEach(id => {
        const row    = document.getElementById(`r-${id}`);
        const status = document.getElementById(`rs-${id}`);
        if (row)    row.className      = 'recipient-row';
        if (status) { status.textContent = 'QUEUED'; status.style.color = ''; }
    });

    const smsBadge = document.getElementById('sms-sent-badge');
    const sendSum  = document.getElementById('send-summary');
    const sendBtn  = document.getElementById('send-alert-btn');
    if (smsBadge) smsBadge.style.display = 'none';
    if (sendSum)  sendSum.style.display  = 'none';
    if (sendBtn)  {
        sendBtn.disabled  = false;
        sendBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> BROADCAST EMERGENCY ALERT`;
    }

    const data    = scenarios[currentScenarioType];
    const pct     = document.querySelector('.gauge-value')?.innerText ?? `${data?.levelPct ?? '?'}%`;
    const damName = document.getElementById('main-dam-title')?.innerText ?? 'Idukki Reservoir';
    const now     = new Date();
    const timeStr = now.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'});
    const dateStr = now.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'});

    const msgs = {
        red:    {tag:'🔴 RED ALERT — EMERGENCY',    action:'MANDATORY IMMEDIATE EVACUATION required for all areas within 5km of Periyar River banks.', ml:'അടിയന്തര മുന്നറിയിപ്പ്: പെരിയാർ നദിതീരത്തുള്ളവർ ഉടൻ മാറുക.'},
        orange: {tag:'🟠 ORANGE ALERT — HIGH RISK', action:'Controlled release of 500 cumecs to begin at 06:00 IST. Low-lying areas must prepare for evacuation.', ml:'ഓറഞ്ച് അലർട്ട്: ഡാം തുറക്കാൻ സാധ്യത. ജനങ്ങൾ ജാഗ്രത പാലിക്കുക.'},
        safe:   {tag:'🟡 YELLOW ALERT — MONITOR',   action:'No immediate release planned. Continue monitoring. Avoid river banks during heavy rainfall.', ml:'മഞ്ഞ അലർട്ട്: ഡാം ലെവൽ നിരീക്ഷണത്തിലാണ്. ആശങ്കപ്പെടേണ്ടതില്ല.'}
    };
    const m = msgs[currentScenarioType] || msgs.safe;

    const smsText = `${m.tag}\n\n[KDM SYSTEM — ${dateStr} ${timeStr}]\n\nDam: ${damName}\nStorage: ${pct} of capacity\n\nAction Required:\n${m.action}\n\n${m.ml}\n\nDo not reply. Helpline: 1800-425-1550\nKerala DEOC`;

    const smsPreview = document.getElementById('sms-preview-text');
    const smsStamp   = document.getElementById('sms-time-stamp');
    if (smsPreview) smsPreview.innerText = smsText;
    if (smsStamp)   smsStamp.innerText   = `${timeStr} · KDM Gov Alert`;
}

function closeAlertModal() {
    const overlay = document.getElementById('alert-modal-overlay');
    if (overlay) overlay.classList.remove('open');
}

async function sendAlerts() {
    const btn = document.getElementById('send-alert-btn');
    if (!btn) return;
    btn.disabled  = true;
    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg> Broadcasting...`;

    const recipients = ['collector','ndrf','police','dam','village','fire'];
    const delays     = [600,900,1200,1500,2100,2700];

    recipients.forEach((id, i) => {
        setTimeout(() => {
            const row    = document.getElementById(`r-${id}`);
            const status = document.getElementById(`rs-${id}`);
            if (row)    row.className      = 'recipient-row sending';
            if (status) status.textContent = 'SENDING…';
            setTimeout(() => {
                if (row)    row.className      = 'recipient-row sent';
                if (status) status.textContent = '✓ SENT';
                if (i === recipients.length - 1) {
                    const smsBadge = document.getElementById('sms-sent-badge');
                    const sendSum  = document.getElementById('send-summary');
                    const sendTime = document.getElementById('send-timestamp');
                    if (smsBadge) smsBadge.style.display = 'block';
                    if (sendTime) sendTime.innerText = new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
                    if (sendSum)  sendSum.style.display  = 'block';
                    btn.innerHTML = `✅ Broadcast Complete`;
                }
            }, 500);
        }, delays[i]);
    });
}

// ── AI TERMINAL ───────────────────────────────────────
function addTerminalLine(msg, color = '#10b981') {
    const term = document.getElementById('ai-auto-terminal');
    if (!term) return;
    const line       = document.createElement('div');
    line.className   = 'terminal-line';
    line.style.color = color;
    line.innerText   = `> ${msg}`;
    term.appendChild(line);
    term.scrollTop   = term.scrollHeight;
}

async function initializeAiAutomation() {
    const btn = document.getElementById('ai-init-btn');
    if (!btn) return;
    btn.disabled  = true;
    btn.innerHTML = '<span class="blink">⏳</span> RUNNING NEURAL ANALYSIS...';

    const term = document.getElementById('ai-auto-terminal');
    if (term) term.innerHTML = '';

    addTerminalLine('DANGER ASSESSMENT PROTOCOL INITIATED...');
    await delay(800);
    addTerminalLine('FETCHING REAL-TIME TELEMETRY...');
    addTerminalLine(`SCANNING ${document.getElementById('main-dam-title')?.innerText ?? 'Reservoir'}...`);
    await delay(1200);
    addTerminalLine('ANALYZING PRECIPITATION CLUSTERS...');
    addTerminalLine('MODELING DOWNSTREAM HYDRODYNAMICS...');
    await delay(1500);

    const pct = parseFloat(document.querySelector('.gauge-value')?.innerText ?? '0');
    addTerminalLine(`RESERVOIR CAPACITY: ${pct}%`, pct>=80?'#ef4444':'#10b981');

    if (pct >= 80) {
        addTerminalLine('CRITICAL RISK DETECTED.', '#ef4444');
        addTerminalLine('CALCULATING OPTIMAL DISCHARGE PATH...', '#3b82f6');
        await delay(1000);
        addTerminalLine('CONSULTING DAM OPERATOR FOR AUTHORIZATION...', '#f97316');
        const panel = document.getElementById('operator-consult-panel');
        if (panel) panel.style.display = 'block';
        btn.style.display = 'none';
    } else {
        addTerminalLine('RISK LEVEL: LOW. SYSTEM STABLE.');
        addTerminalLine('ABORTING AUTONOMOUS PROTOCOL.');
        btn.disabled  = false;
        btn.innerText = 'RE-RUN DANGER ASSESSMENT';
    }
}

function authorizeAiRelease(granted) {
    const panel = document.getElementById('operator-consult-panel');
    if (panel) panel.style.display = 'none';

    if (granted) {
        addTerminalLine('AUTHORIZATION GRANTED. OPERATOR ID: 2948-ADMIN', '#6ee7b7');
        addTerminalLine('EXECUTING DAM GATE PROTOCOL...', '#6ee7b7');
        startGateOperation();
    } else {
        addTerminalLine('AUTHORIZATION DENIED BY OPERATOR.', '#ef4444');
        addTerminalLine('SYSTEM RETURNING TO PASSIVE MONITORING.');
        const btn = document.getElementById('ai-init-btn');
        if (btn) { btn.style.display='flex'; btn.disabled=false; btn.innerText='RE-RUN DANGER ASSESSMENT'; }
    }
}

async function startGateOperation() {
    const visual = document.getElementById('gate-ops-visual');
    if (visual) visual.style.display = 'block';
    const statusText = document.getElementById('gate-status-text');
    const fills = ['g-fill-1','g-fill-2','g-fill-3'].map(id => document.getElementById(id));

    for (let i = 0; i <= 100; i += 2) {
        if (statusText) statusText.innerText = `GATES OPENING: ${i}%`;
        if (i === 40) {
            fills.forEach(f => { if(f) f.classList.add('open'); });
            addTerminalLine('SPILLWAY GATES BREACHED. WATER RELEASING.', '#3b82f6');
        }
        await delay(50);
    }
    if (statusText) statusText.innerText = 'GATES OPENED. DISCHARGE IN PROGRESS.';
    addTerminalLine('AUTONOMOUS CONTROL SUCCESSFUL. MONITORING FLOW RATE.');
    await delay(2000);
    addTerminalLine('LIVE TELEMETRY: OUTFLOW SET TO 500 CUMECS.', '#3b82f6');
    const outflowEl = document.getElementById('main-dam-outflow');
    if (outflowEl) {
        outflowEl.innerHTML  = `500 <span style="font-size:1.125rem;color:var(--text-secondary);font-weight:normal;">cumecs</span>`;
        outflowEl.style.color = '#f97316';
    }
}

// ── SCENARIO SWITCHER ─────────────────────────────────
window.setScenario = function(type) {
    currentScenarioType = type;
    currentScenario     = type;
    const data = scenarios[type];
    if (!data) return;

    // Buttons
    document.querySelectorAll('.scenario-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.style.backgroundColor = '';
    });
    document.querySelectorAll('.scenario-btn').forEach(btn => {
        const onclick = btn.getAttribute('onclick') || '';
        if (onclick.includes(`'${type}'`) || onclick.includes(`"${type}"`)) {
            btn.classList.add('active');
            const bgMap = {safe:'rgba(16,185,129,0.2)',orange:'rgba(249,115,22,0.2)',red:'rgba(239,68,68,0.2)'};
            btn.style.backgroundColor = bgMap[type] || '';
        }
    });

    // Gauge
    const gaugeValEl = document.querySelector('.gauge-value');
    if (gaugeValEl) gaugeValEl.innerText = `${data.levelPct}%`;
    const gaugeLabel = document.querySelector('.gauge-label div:first-child');
    if (gaugeLabel) gaugeLabel.innerText = data.levelFt;
    setGauge(data.levelPct);

    // Flow stats
    const statValues = document.querySelectorAll('.stat-value');
    if (statValues.length >= 2) {
        statValues[0].innerHTML = `${data.inflow} <span style="font-size:1.125rem;color:var(--text-secondary);font-weight:normal;">cumecs</span>`;
        statValues[1].innerHTML = `${data.release} <span style="font-size:1.125rem;color:var(--text-secondary);font-weight:normal;">cumecs</span>`;
        statValues[1].style.color = parseFloat(data.release.replace(/,/g,''))>0 ? 'var(--accent-red)' : 'var(--text-secondary)';
    }

    // Alert card
    const alertCard  = document.querySelector('.alert-card');
    const alertIcon  = document.querySelector('.alert-icon');
    const alertTitle = document.querySelector('.alert-text h3');
    const alertDesc  = document.querySelector('.alert-text .stat-label');
    if (alertCard)  { alertCard.style.borderColor = data.alertColor; alertCard.style.background = `linear-gradient(135deg,${data.alertBg} 0%,var(--card-bg) 100%)`; }
    if (alertIcon)  { alertIcon.style.color = data.alertColor; alertIcon.style.backgroundColor = data.alertIconBg; }
    if (alertTitle) { alertTitle.innerText = data.alertTitle; alertTitle.style.color = data.alertColor; }
    if (alertDesc)  alertDesc.innerText = data.alertDesc;

    // AI sections
    const ctxEl = document.getElementById('ai-context-text-classic');
    if (ctxEl) ctxEl.innerText = data.aiSummary;
    const recEl = document.getElementById('ai-rec-text-classic');
    if (recEl) recEl.innerText = data.aiRec;

    const mlBox = document.getElementById('warning-malayalam-classic');
    if (mlBox) {
        mlBox.innerHTML = `<strong>ജാഗ്രതാ നിർദ്ദേശം:</strong><br>${data.malayalam}<div class="warning-en" style="margin-top:0.5rem;color:inherit;opacity:0.8;">${data.malayalamEn}</div>`;
        const styleMap = {
            safe:  ['rgba(16,185,129,0.1)','rgba(16,185,129,0.3)','var(--accent-green)','#6ee7b7'],
            orange:['rgba(239,68,68,0.1)', 'rgba(239,68,68,0.3)', 'var(--accent-red)',  '#fca5a5'],
            red:   ['rgba(239,68,68,0.2)', 'var(--accent-red)',   'var(--accent-red)',  'white']
        };
        const [bg,bc,blc,col] = styleMap[type] || styleMap.orange;
        mlBox.style.backgroundColor = bg;
        mlBox.style.borderColor     = bc;
        mlBox.style.borderLeftColor = blc;
        mlBox.style.color           = col;
    }

    const riskList = document.getElementById('risk-list-classic');
    if (riskList) riskList.innerHTML = data.riskList;

    const engineBadge = document.getElementById('engine-status-badge');
    if (engineBadge) { engineBadge.innerText = data.badgeText; engineBadge.style.backgroundColor = data.badgeColor; }
    const aiRecText = document.getElementById('ai-rec-text');
    if (aiRecText) aiRecText.innerText = data.aiRec;

    const timeEl = document.getElementById('time-overflow-val');
    if (timeEl) { timeEl.innerText = data.timeToOverflow; timeEl.style.color = type==='safe'?'var(--text-secondary)':type==='orange'?'#fca5a5':'var(--accent-red)'; }
    const confEl = document.getElementById('confidence-val');
    if (confEl) confEl.innerText = data.confidence;

    const compText = document.getElementById('comparison-text');
    if (compText) compText.innerText = `Current: ${data.levelPct}%`;
    const compFill = document.getElementById('comparison-fill');
    if (compFill) compFill.style.width = `${data.levelPct}%`;
    const compDesc = document.getElementById('comparison-desc');
    if (compDesc) compDesc.innerText = data.markerText;

    // Chips
    const chipContainer = document.getElementById('alert-chips-container');
    if (chipContainer) {
        chipContainer.innerHTML = '';
        data.chips.forEach(c => {
            const parts = c.split(' ');
            const emoji = parts.pop();
            const chip  = document.createElement('div');
            chip.className = 'chip';
            chip.innerHTML = `${parts.join(' ')} <span style="font-size:1.2rem;">${emoji}</span>`;
            chipContainer.appendChild(chip);
        });
    }

    const strictWarn = document.getElementById('warning-box-malayalam');
    if (strictWarn) {
        strictWarn.innerText = data.malayalam;
        const warnMap = {
            safe:  ['rgba(16,185,129,0.1)','var(--accent-green)','#6ee7b7',''],
            orange:['rgba(239,68,68,0.15)','var(--accent-red)',  '#fca5a5',''],
            red:   ['var(--accent-red)',    'white',             'white',  '700']
        };
        const [bg,bc,col,fw] = warnMap[type] || warnMap.orange;
        strictWarn.style.backgroundColor = bg;
        strictWarn.style.borderColor     = bc;
        strictWarn.style.color           = col;
        strictWarn.style.fontWeight      = fw;
    }

    updateTrends(currentDamName, type);
};

// ── BACK TO TOP ───────────────────────────────────────
function initBackToTop() {
    const btn = document.createElement('button');
    btn.id        = 'back-to-top';
    btn.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="18 15 12 9 6 15"></polyline></svg>';
    btn.setAttribute('aria-label', 'Back to top');
    document.body.appendChild(btn);
    window.addEventListener('scroll', () => {
        btn.style.display = window.scrollY > 500 ? 'flex' : 'none';
    }, { passive: true });
    btn.onclick = () => window.scrollTo({ top:0, behavior:'smooth' });
}

// ── OPTIMIZATION: DEBOUNCED SEARCH ───────────────────
function debounce(func, timeout = 150) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
}

function initSearch() {
    // ── Wire both search inputs to the same debounced filter ──
    const handleSearch = debounce(e => {
        const term = e.target.value.toLowerCase().trim();

        // Mirror value to the other search box for consistency
        const otherSearch = e.target.id === 'dam-search'
            ? document.getElementById('header-dam-search')
            : document.getElementById('dam-search');
        if (otherSearch && otherSearch.value !== e.target.value) {
            otherSearch.value = e.target.value;
        }

        // If we are in the detail view, switch to All Dams view first
        const allView    = document.getElementById('all-dams-view');
        const detailView = document.getElementById('dam-detail-view');
        if (term && allView && allView.style.display === 'none') {
            if (detailView) detailView.style.display = 'none';
            allView.style.display = 'block';
            allView.style.opacity = '1';
            const backBtn = document.getElementById('back-home-btn');
            if (backBtn) backBtn.style.display = 'none';
        }

        const filtered = term
            ? allParsedDams.filter(d => d.name.toLowerCase().includes(term) || d.district.toLowerCase().includes(term))
            : allParsedDams;
        renderDamsToGrid(filtered);
    });

    // Attach to the inline All-Dams search
    const inlineSearch = document.getElementById('dam-search');
    if (inlineSearch) {
        DOM.dam_search = inlineSearch;
        inlineSearch.addEventListener('input', handleSearch);
    }

    // Attach to the sticky header search
    const headerSearch = document.getElementById('header-dam-search');
    if (headerSearch) {
        headerSearch.addEventListener('input', handleSearch);
        // Keyboard shortcut: Cmd/Ctrl+K focuses header search
        document.addEventListener('keydown', ev => {
            if ((ev.metaKey || ev.ctrlKey) && ev.key === 'k') {
                ev.preventDefault();
                headerSearch.focus();
                headerSearch.select();
            }
        });
    }
}

// ── UTILITY ───────────────────────────────────────────
const delay = ms => new Promise(r => setTimeout(r, ms));

window.refreshData = async function() {
    const btn = document.getElementById('refresh-btn');
    if (btn) btn.style.transform = 'rotate(360deg)';
    await Promise.all([fetchLiveData(), fetchNews()]);
    setTimeout(() => { if (btn) btn.style.transform = 'rotate(0deg)'; }, 600);
}

// ── INIT ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    cacheDOM();
    initDarkMode();
    updateUILanguage();
    initBackToTop();
    initSearch();
    initMap();

    // Show placeholder timestamp until first fetch completes
    const timeEl = document.getElementById('current-time');
    if (timeEl) timeEl.innerText = 'Fetching live data…';

    // Init gauge with empty state then animate in
    setGauge(0);
    setTimeout(() => setGauge(84), 100);

    setScenario('orange');
    updateTrends('Idukki', 'orange');

    setTimeout(fetchLiveData, 400);
    setTimeout(fetchNews, 800);
    setInterval(fetchNews, 2 * 60 * 1000);
    setInterval(fetchLiveData, 5 * 60 * 1000);

    // ── SYSTEM READY ──
    setTimeout(() => {
        document.body.classList.add('loaded');
        document.body.classList.remove('loading');
    }, 600);
});
