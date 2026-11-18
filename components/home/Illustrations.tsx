/** Ilustraciones SVG en línea (marcadores de imagen con texto alternativo). */

export function HeroIllustration({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" className={className} role="img" aria-label="Dirigible sobrevolando los acantilados de la Costa Brava al atardecer, con el mar en calma">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c7b8f5" />
          <stop offset="0.38" stopColor="#f9b4d3" />
          <stop offset="0.66" stopColor="#ffd6a0" />
          <stop offset="0.8" stopColor="#ffe7b8" />
        </linearGradient>
        <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6b6c9" />
          <stop offset="0.3" stopColor="#9fb3e0" />
          <stop offset="1" stopColor="#4c66a6" />
        </linearGradient>
        <radialGradient id="sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff6d8" />
          <stop offset="0.6" stopColor="#ffd27a" />
          <stop offset="1" stopColor="#ffd27a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="envelope" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.55" stopColor="#f3eefb" />
          <stop offset="1" stopColor="#c9bfe6" />
        </linearGradient>
      </defs>
      <rect width="1440" height="900" fill="url(#sky)" />
      <circle cx="1060" cy="560" r="190" fill="url(#sun)" />
      <circle cx="1060" cy="560" r="70" fill="#fff1c9" opacity="0.95" />
      {/* nubes */}
      <g fill="#fff" opacity="0.55">
        <ellipse cx="260" cy="210" rx="140" ry="22" />
        <ellipse cx="340" cy="190" rx="90" ry="20" />
        <ellipse cx="1180" cy="250" rx="160" ry="20" />
        <ellipse cx="760" cy="140" rx="110" ry="14" />
      </g>
      {/* mar */}
      <rect y="600" width="1440" height="300" fill="url(#sea)" />
      <g fill="none" stroke="#fff" strokeOpacity="0.45" strokeWidth="3" strokeLinecap="round">
        <path d="M880 640h300M940 670h220M990 700h140M760 720h120M1100 735h160" />
      </g>
      {/* acantilados Costa Brava */}
      <path d="M0 520c70-30 120-10 170-40s90-70 150-50 70 70 120 80 60 40 90 90H0z" fill="#7a5c8f" opacity="0.55" />
      <path d="M0 580c60-20 110 0 160-20s70-60 130-40 90 60 130 60 50 30 80 62L0 660z" fill="#5d4a7a" />
      <path d="M0 640c80-10 140 10 200 0s120-40 180-10 90 40 140 70l20 200H0z" fill="#3f355e" />
      <g fill="#2e7d5b" opacity="0.6">
        <circle cx="120" cy="575" r="14" />
        <circle cx="150" cy="565" r="11" />
        <circle cx="300" cy="600" r="12" />
      </g>
      {/* islas Medes */}
      <path d="M560 640c20-30 50-30 70 0z" fill="#5d4a7a" opacity="0.8" />
      <path d="M640 645c10-16 26-16 36 0z" fill="#5d4a7a" opacity="0.7" />
      {/* dirigible */}
      <g className="animate-float" style={{ transformOrigin: "820px 330px" }}>
        <ellipse cx="820" cy="300" rx="230" ry="78" fill="url(#envelope)" />
        <path d="M600 285c80-34 360-34 440 0" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" opacity="0.9" />
        <path d="M1035 268l70-46v156l-70-42z" fill="#1f3864" />
        <path d="M1035 300h66" fill="none" stroke="#f472b6" strokeWidth="6" />
        <path d="M640 300c120 14 240 14 360 0" fill="none" stroke="#f472b6" strokeWidth="5" opacity="0.8" />
        <path d="M660 318c110 10 230 10 330 0" fill="none" stroke="#f59e0b" strokeWidth="4" opacity="0.7" />
        <rect x="740" y="368" width="150" height="40" rx="20" fill="#1f3864" />
        <g fill="#ffe7b8">
          <rect x="756" y="378" width="18" height="16" rx="5" />
          <rect x="782" y="378" width="18" height="16" rx="5" />
          <rect x="808" y="378" width="18" height="16" rx="5" />
          <rect x="834" y="378" width="18" height="16" rx="5" />
          <rect x="860" y="378" width="18" height="16" rx="5" />
        </g>
        <path d="M770 368v-10M860 368v-10" fill="none" stroke="#1f3864" strokeWidth="5" />
      </g>
      {/* reflejo */}
      <ellipse cx="820" cy="760" rx="160" ry="10" fill="#fff" opacity="0.18" />
    </svg>
  );
}

export function RouteMap() {
  return (
    <svg viewBox="0 0 520 560" className="h-auto w-full" role="img" aria-label="Mapa de la ruta: del vertipuerto de Girona, en la Costa Brava, al vertipuerto de Palma de Mallorca, unos 260 km sobre el Mediterráneo en unas 2 horas y 15 minutos">
      <defs>
        <linearGradient id="map-sea" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#eef2fa" />
          <stop offset="1" stopColor="#f5f3ff" />
        </linearGradient>
        <linearGradient id="route" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f472b6" />
          <stop offset="1" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      <rect width="520" height="560" rx="32" fill="url(#map-sea)" />
      {/* costa catalana */}
      <path
        d="M0 0h300c-6 18 4 30-6 46s-26 18-24 38 20 30 10 50-34 14-44 36-4 44-22 62-46 20-62 44-20 56-46 74-60 20-80 40L0 420z"
        fill="#fde7f1"
        stroke="#f472b6"
        strokeOpacity="0.4"
        strokeWidth="2"
      />
      <text x="70" y="250" fill="#be185d" fontSize="15" fontWeight="600" opacity="0.7">
        Catalunya
      </text>
      <text x="200" y="40" fill="#545b72" fontSize="12" fontStyle="italic">
        Costa Brava
      </text>
      {/* Mallorca */}
      <path
        d="M250 430c20-26 70-38 110-30s60-12 90 0 40 40 30 62-40 30-70 36-50 20-84 14-60-16-74-36-20-28-2-46z"
        fill="#fff3d6"
        stroke="#f59e0b"
        strokeOpacity="0.5"
        strokeWidth="2"
      />
      <text x="360" y="470" fill="#b45309" fontSize="15" fontWeight="600" opacity="0.8">
        Mallorca
      </text>
      {/* Menorca */}
      <path d="M470 380c14-8 34-6 44 2s-6 18-24 18-28-12-20-20z" fill="#fff3d6" stroke="#f59e0b" strokeOpacity="0.4" />
      {/* ruta */}
      <path d="M262 106C330 190 336 300 296 448" fill="none" stroke="url(#route)" strokeWidth="4" strokeDasharray="10 10" strokeLinecap="round" />
      <g>
        <circle cx="262" cy="106" r="11" fill="#1f3864" />
        <circle cx="262" cy="106" r="5" fill="#fff" />
        <rect x="132" y="88" width="116" height="38" rx="12" fill="#fff" />
        <text x="190" y="104" textAnchor="middle" fill="#1f3864" fontSize="13" fontWeight="700">
          Girona
        </text>
        <text x="190" y="119" textAnchor="middle" fill="#545b72" fontSize="10">
          GRO · Costa Brava
        </text>
      </g>
      <g>
        <circle cx="296" cy="448" r="11" fill="#1f3864" />
        <circle cx="296" cy="448" r="5" fill="#fff" />
        <rect x="160" y="482" width="116" height="38" rx="12" fill="#fff" />
        <text x="218" y="498" textAnchor="middle" fill="#1f3864" fontSize="13" fontWeight="700">
          Palma
        </text>
        <text x="218" y="513" textAnchor="middle" fill="#545b72" fontSize="10">
          PMI · Mallorca
        </text>
      </g>
      {/* dirigible en ruta */}
      <g transform="translate(316 262) rotate(96)">
        <ellipse rx="26" ry="10" fill="#1f3864" />
        <path d="M22-6l10-6v24l-10-6z" fill="#f472b6" />
      </g>
      <rect x="340" y="236" width="150" height="56" rx="16" fill="#fff" />
      <text x="415" y="259" textAnchor="middle" fill="#1f3864" fontSize="16" fontWeight="700">
        ~260 km
      </text>
      <text x="415" y="279" textAnchor="middle" fill="#545b72" fontSize="12">
        ~2 h 15 min · 300 m
      </text>
      <text x="470" y="40" textAnchor="middle" fill="#545b72" fontSize="12">
        N ↑
      </text>
    </svg>
  );
}
