// High-fidelity SVG-based realistic Government of India and International Document representations
// Features: Ashoka Stambh, Guilloche security patterns, ICAO 9303 MRZ, Bureau of Immigration Seals

export interface SampleDocumentItem {
  id: string;
  name: string;
  type: 'passport' | 'visa' | 'driving_license' | 'national_id' | 'residence_permit';
  description: string;
  country: string;
  countryCode: string;
  documentNumber: string;
  holderName: string;
  previewUrl: string;
  faceCropUrl: string;
  selfieUrl: string;
  isTampered?: boolean;
  tamperReason?: string;
  visaDetails?: {
    visaType: string;
    applicationId: string;
    passportRef: string;
    portOfEntry: string;
    entries: string;
    validity: string;
  };
}

// 1. REPUBLIC OF INDIA PASSPORT SVG (भारत गणराज्य - ICAO 9303 Standard)
const indianPassportSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 530" width="800" height="530">
  <defs>
    <linearGradient id="inBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="%230c2340"/>
      <stop offset="50%" stop-color="%23091b32"/>
      <stop offset="100%" stop-color="%2305101f"/>
    </linearGradient>
    <pattern id="inGuilloche" width="36" height="36" patternUnits="userSpaceOnUse">
      <path d="M0,18 Q9,0 18,18 T36,18" fill="none" stroke="rgba(255,153,51,0.08)" stroke-width="1"/>
      <path d="M0,18 Q9,36 18,18 T36,18" fill="none" stroke="rgba(19,136,8,0.06)" stroke-width="1"/>
    </pattern>
  </defs>

  <!-- Passport Booklet Data Page Frame -->
  <rect width="800" height="530" rx="16" fill="url(%23inBg)" stroke="%23d4af37" stroke-width="2"/>
  <rect width="800" height="530" rx="16" fill="url(%23inGuilloche)"/>

  <!-- Tricolor Micro-security Bar across Top -->
  <rect x="0" y="24" width="800" height="3" fill="%23FF9933"/>
  <rect x="0" y="27" width="800" height="3" fill="%23FFFFFF" opacity="0.9"/>
  <rect x="0" y="30" width="800" height="3" fill="%23138808"/>

  <!-- Government of India Header -->
  <text x="320" y="58" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="%23e2e8f0" letter-spacing="4">भारत गणराज्य / REPUBLIC OF INDIA</text>
  <text x="320" y="78" font-family="Arial, sans-serif" font-size="16" font-weight="800" fill="%23d4af37" letter-spacing="2">PASSPORT / पासपोर्ट</text>

  <!-- Ashoka Stambh Emblem Silhouette in Gold -->
  <g transform="translate(680, 42) scale(0.65)">
    <circle cx="40" cy="40" r="38" fill="none" stroke="%23d4af37" stroke-width="2" opacity="0.6"/>
    <path d="M40,12 L44,28 L36,28 Z M24,24 L36,32 L30,38 Z M56,24 L44,32 L50,38 Z" fill="%23d4af37"/>
    <rect x="25" y="44" width="30" height="6" rx="2" fill="%23d4af37"/>
    <circle cx="40" cy="58" r="8" fill="none" stroke="%23d4af37" stroke-width="1.5"/>
    <text x="40" y="74" font-size="6" fill="%23d4af37" text-anchor="middle" font-family="sans-serif">सत्यमेव जयते</text>
  </g>

  <!-- Left Photo Box -->
  <rect x="45" y="100" width="180" height="230" rx="8" fill="%2316263d" stroke="%23d4af37" stroke-width="1.5"/>
  <!-- Portrait Silhouette -->
  <circle cx="135" cy="180" r="46" fill="%23223552"/>
  <path d="M80,315 C80,245 190,245 190,315 Z" fill="%23223552"/>
  <circle cx="135" cy="175" r="34" fill="%23cbd5e1"/>
  <path d="M95,315 C95,255 175,255 175,315 Z" fill="%2394a3b8"/>
  <!-- Holographic Ghost Seal -->
  <circle cx="195" cy="305" r="24" fill="rgba(212,175,55,0.15)" stroke="rgba(212,175,55,0.5)" stroke-width="1"/>
  <text x="178" y="308" font-family="monospace" font-size="7" fill="%23d4af37" font-weight="bold">INDIA</text>

  <!-- Passport Metadata Fields Column 1 -->
  <g font-family="Arial, sans-serif" fill="%2394a3b8" font-size="9">
    <text x="255" y="112">Type / प्रकार</text>
    <text x="350" y="112">Country Code / देश कोड</text>
    <text x="520" y="112">Passport No. / पासपोर्ट सं.</text>
  </g>
  <g font-family="monospace" fill="%23ffffff" font-weight="bold" font-size="14">
    <text x="255" y="128">P</text>
    <text x="350" y="128">IND</text>
    <text x="520" y="128" fill="%2338bdf8">Z4829105</text>
  </g>

  <!-- Name Fields -->
  <text x="255" y="152" font-family="Arial, sans-serif" fill="%2394a3b8" font-size="9">Surname / उपनाम</text>
  <text x="255" y="168" font-family="monospace" fill="%23ffffff" font-weight="bold" font-size="13">SHARMA</text>

  <text x="255" y="192" font-family="Arial, sans-serif" fill="%2394a3b8" font-size="9">Given Name(s) / दिया गया नाम</text>
  <text x="255" y="208" font-family="monospace" fill="%23ffffff" font-weight="bold" font-size="13">RAJESH KUMAR</text>

  <!-- Nationality & Sex -->
  <g font-family="Arial, sans-serif" fill="%2394a3b8" font-size="9">
    <text x="255" y="232">Nationality / राष्ट्रीयता</text>
    <text x="430" y="232">Sex / लिंग</text>
    <text x="550" y="232">Date of Birth / जन्म तिथि</text>
  </g>
  <g font-family="monospace" fill="%23ffffff" font-weight="bold" font-size="12">
    <text x="255" y="248">INDIAN</text>
    <text x="430" y="248">M</text>
    <text x="550" y="248">14/05/1988</text>
  </g>

  <!-- Place of Birth & Issue -->
  <g font-family="Arial, sans-serif" fill="%2394a3b8" font-size="9">
    <text x="255" y="272">Place of Birth / जन्म स्थान</text>
    <text x="550" y="272">Place of Issue / जारी स्थान</text>
  </g>
  <g font-family="monospace" fill="%23ffffff" font-weight="bold" font-size="12">
    <text x="255" y="288">NEW DELHI</text>
    <text x="550" y="288">DELHI</text>
  </g>

  <!-- Dates of Issue and Expiry -->
  <g font-family="Arial, sans-serif" fill="%2394a3b8" font-size="9">
    <text x="255" y="312">Date of Issue / जारी तिथि</text>
    <text x="550" y="312">Date of Expiry / समाप्ति तिथि</text>
  </g>
  <g font-family="monospace" fill="%23ffffff" font-weight="bold" font-size="12">
    <text x="255" y="328">22/08/2022</text>
    <text x="550" y="328" fill="%234ade80">21/08/2032</text>
  </g>

  <!-- Optical Security Line Divider -->
  <line x1="45" y1="350" x2="755" y2="350" stroke="%23d4af37" stroke-width="1" stroke-dasharray="6 3" opacity="0.4"/>

  <!-- Machine Readable Zone (MRZ 2 Lines) -->
  <g font-family="Courier New, monospace" font-size="15" fill="%23ffffff" letter-spacing="3.5" font-weight="bold">
    <text x="50" y="420">P&lt;INDSHARMA&lt;&lt;RAJESH&lt;KUMAR&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</text>
    <text x="50" y="460">Z4829105&lt;4IND8805142M3208218&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;02</text>
  </g>
</svg>`;

// 2. GOVERNMENT OF INDIA e-VISA SVG (भारत सरकार - आव्रजन ब्यूरो / Bureau of Immigration)
const indianVisaSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 550" width="800" height="550">
  <defs>
    <linearGradient id="visaBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="%23fdfcf9"/>
      <stop offset="50%" stop-color="%23f7f5f0"/>
      <stop offset="100%" stop-color="%23efece4"/>
    </linearGradient>
    <pattern id="visaWave" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M0,20 Q10,5 20,20 T40,20" fill="none" stroke="rgba(11,37,69,0.06)" stroke-width="1"/>
      <circle cx="20" cy="20" r="1.5" fill="rgba(243,112,33,0.1)"/>
    </pattern>
  </defs>

  <!-- Official Government Certificate Document Card -->
  <rect width="800" height="550" rx="8" fill="url(%23visaBg)" stroke="%230b2545" stroke-width="2.5"/>
  <rect width="800" height="550" fill="url(%23visaWave)"/>

  <!-- Top Tricolor Border Header -->
  <rect x="0" y="0" width="800" height="5" fill="%23FF9933"/>
  <rect x="0" y="5" width="800" height="4" fill="%23FFFFFF"/>
  <rect x="0" y="9" width="800" height="5" fill="%23138808"/>

  <!-- Emblem & Official Bureau of Immigration Header -->
  <g transform="translate(45, 25)">
    <!-- Ashoka Stambh Silhouette in Deep Navy -->
    <g transform="scale(0.55)">
      <circle cx="35" cy="35" r="30" fill="none" stroke="%230b2545" stroke-width="2"/>
      <path d="M35,10 L39,24 L31,24 Z M22,20 L32,28 L27,33 Z M48,20 L38,28 L43,33 Z" fill="%230b2545"/>
      <rect x="22" y="38" width="26" height="5" fill="%230b2545"/>
      <circle cx="35" cy="50" r="7" fill="none" stroke="%230b2545" stroke-width="1.5"/>
      <text x="35" y="66" font-size="7" fill="%230b2545" text-anchor="middle" font-family="sans-serif">सत्यमेव जयते</text>
    </g>

    <text x="55" y="18" font-family="Arial, sans-serif" font-size="14" font-weight="900" fill="%230b2545" letter-spacing="1">भारत सरकार / GOVERNMENT OF INDIA</text>
    <text x="55" y="34" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="%231e3a8a">गृह मंत्रालय / MINISTRY OF HOME AFFAIRS</text>
    <text x="55" y="48" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="%23c2410c">आव्रजन ब्यूरो / BUREAU OF IMMIGRATION</text>
  </g>

  <!-- Document Title Banner -->
  <rect x="45" y="86" width="710" height="32" rx="4" fill="%230b2545"/>
  <text x="400" y="107" font-family="Arial, sans-serif" font-size="13" font-weight="800" fill="%23ffffff" text-anchor="middle" letter-spacing="2">
    ELECTRONIC TRAVEL AUTHORIZATION (ETA) — e-VISA
  </text>

  <!-- Left: Photo Frame -->
  <rect x="45" y="135" width="150" height="190" rx="4" fill="%23ffffff" stroke="%23cbd5e1" stroke-width="2"/>
  <circle cx="120" cy="205" r="38" fill="%2394a3b8"/>
  <path d="M75,315 C75,260 165,260 165,315 Z" fill="%2364748b"/>
  <circle cx="120" cy="200" r="28" fill="%23e2e8f0"/>
  <path d="M88,315 C88,270 152,270 152,315 Z" fill="%23475569"/>

  <!-- Right: Official Visa Authorization Details Grid -->
  <g font-family="Arial, sans-serif" font-size="10" fill="%23475569">
    <text x="220" y="150">Application ID / आवेदन संख्या:</text>
    <text x="500" y="150">e-Visa Number / वीज़ा संख्या:</text>
  </g>
  <g font-family="monospace" font-size="13" font-weight="bold" fill="%230f172a">
    <text x="220" y="168" fill="%230369a1">IN-2026-984210</text>
    <text x="500" y="168" fill="%23047857">V9842105B</text>
  </g>

  <g font-family="Arial, sans-serif" font-size="10" fill="%23475569">
    <text x="220" y="195">Full Name of Traveler / पूरा नाम:</text>
    <text x="500" y="195">Nationality / राष्ट्रीयता:</text>
  </g>
  <g font-family="monospace" font-size="13" font-weight="bold" fill="%230f172a">
    <text x="220" y="213">DAVID ALEXANDER VANCE</text>
    <text x="500" y="213">UNITED STATES (USA)</text>
  </g>

  <g font-family="Arial, sans-serif" font-size="10" fill="%23475569">
    <text x="220" y="240">Passport Number / पासपोर्ट संख्या:</text>
    <text x="500" y="240">Visa Sub-type / वीज़ा प्रकार:</text>
  </g>
  <g font-family="monospace" font-size="13" font-weight="bold" fill="%230f172a">
    <text x="220" y="258" fill="%23b45309">P948210394</text>
    <text x="500" y="258">e-TOURIST VISA (30 DAYS)</text>
  </g>

  <g font-family="Arial, sans-serif" font-size="10" fill="%23475569">
    <text x="220" y="285">Date of Issue / जारी तिथि:</text>
    <text x="360" y="285">Date of Expiry / समाप्ति तिथि:</text>
    <text x="500" y="285">Number of Entries / प्रविष्टियां:</text>
  </g>
  <g font-family="monospace" font-size="13" font-weight="bold" fill="%230f172a">
    <text x="220" y="303">10/01/2026</text>
    <text x="360" y="303" fill="%2315803d">10/01/2027</text>
    <text x="500" y="303">DOUBLE ENTRY</text>
  </g>

  <g font-family="Arial, sans-serif" font-size="10" fill="%23475569">
    <text x="220" y="330">Designated Port of Arrival / आगमन चेक पोस्ट:</text>
  </g>
  <text x="220" y="348" font-family="monospace" font-size="12" font-weight="bold" fill="%230f172a">
    DELHI AIRPORT (IGI - ICP) / ALL 31 IMMIGRATION CHECK POSTS
  </text>

  <!-- Security Verification Band with Barcode and Official Stamp -->
  <rect x="45" y="375" width="710" height="85" rx="6" fill="%23ffffff" stroke="%23cbd5e1"/>

  <!-- Simulated 2D Barcode -->
  <g transform="translate(60, 390)">
    <rect width="70" height="55" fill="%230b2545"/>
    <rect x="5" y="5" width="18" height="18" fill="%23ffffff"/>
    <rect x="8" y="8" width="12" height="12" fill="%230b2545"/>
    <rect x="47" y="5" width="18" height="18" fill="%23ffffff"/>
    <rect x="50" y="8" width="12" height="12" fill="%230b2545"/>
    <rect x="5" y="32" width="18" height="18" fill="%23ffffff"/>
    <rect x="8" y="35" width="12" height="12" fill="%230b2545"/>
    <circle cx="35" cy="27" r="4" fill="%23ffffff"/>
  </g>

  <text x="145" y="405" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="%230b2545">MHA DIGITAL SECURITY VERIFICATION SEAL</text>
  <text x="145" y="420" font-family="monospace" font-size="9" fill="%2364748b">ECDSA P-256 SHA-256 HASH: 8f9b2d01a4e7c3b9</text>
  <text x="145" y="435" font-family="sans-serif" font-size="9" fill="%2316a34a" font-weight="bold">✓ CRYPTOGRAPHICALLY SIGNED BY BUREAU OF IMMIGRATION (ICP-DELHI)</text>

  <!-- Official Circular Stamp in Maroon -->
  <g transform="translate(670, 417)">
    <circle cx="0" cy="0" r="30" fill="none" stroke="%23991b1b" stroke-width="2" stroke-dasharray="3 1.5"/>
    <circle cx="0" cy="0" r="25" fill="none" stroke="%23991b1b" stroke-width="1"/>
    <text x="0" y="-8" font-family="Arial, sans-serif" font-size="7" font-weight="bold" fill="%23991b1b" text-anchor="middle">GOVT OF INDIA</text>
    <text x="0" y="4" font-family="Arial, sans-serif" font-size="6" font-weight="bold" fill="%23991b1b" text-anchor="middle">IMMIGRATION</text>
    <text x="0" y="14" font-family="Arial, sans-serif" font-size="7" font-weight="bold" fill="%23991b1b" text-anchor="middle">APPROVED</text>
  </g>

  <!-- Bottom Legal Footer -->
  <text x="400" y="500" font-family="Arial, sans-serif" font-size="9" fill="%2364748b" text-anchor="middle">
    This electronic authorization must be carried along with original passport valid for at least 6 months. Subject to Section 14 Foreigners Act 1946.
  </text>
</svg>`;

// 3. TAMPERED INDIAN e-VISA SVG (High-Risk Forged Expiry & Photo Splicing)
const tamperedIndianVisaSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 550" width="800" height="550">
  <defs>
    <linearGradient id="tVisaBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="%23fdfcf9"/>
      <stop offset="50%" stop-color="%23f7f5f0"/>
      <stop offset="100%" stop-color="%23efece4"/>
    </linearGradient>
  </defs>

  <rect width="800" height="550" rx="8" fill="url(%23tVisaBg)" stroke="%23b91c1c" stroke-width="2"/>

  <!-- Top Tricolor Ribbon -->
  <rect x="0" y="0" width="800" height="5" fill="%23FF9933"/>
  <rect x="0" y="5" width="800" height="4" fill="%23FFFFFF"/>
  <rect x="0" y="9" width="800" height="5" fill="%23138808"/>

  <!-- Header -->
  <text x="55" y="42" font-family="Arial, sans-serif" font-size="14" font-weight="900" fill="%230b2545">भारत सरकार / GOVERNMENT OF INDIA</text>
  <text x="55" y="58" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="%231e3a8a">BUREAU OF IMMIGRATION / आव्रजन ब्यूरो</text>

  <!-- Banner -->
  <rect x="45" y="80" width="710" height="30" rx="4" fill="%230b2545"/>
  <text x="400" y="100" font-family="Arial, sans-serif" font-size="13" font-weight="800" fill="%23ffffff" text-anchor="middle">
    ELECTRONIC TRAVEL AUTHORIZATION (ETA) — e-VISA
  </text>

  <!-- Photo Frame (With Visual Digital Splicing Anomaly Artifact) -->
  <rect x="45" y="125" width="150" height="190" rx="4" fill="%23ffffff" stroke="%23ef4444" stroke-width="2" stroke-dasharray="4 2"/>
  <circle cx="120" cy="195" r="38" fill="%23475569"/>
  <path d="M75,305 C75,250 165,250 165,305 Z" fill="%23334155"/>
  <circle cx="120" cy="190" r="28" fill="%23cbd5e1"/>
  <path d="M88,305 C88,260 152,260 152,305 Z" fill="%231e293b"/>
  <!-- Visible Splicing Noise Boundary -->
  <rect x="43" y="123" width="154" height="194" fill="none" stroke="%23ef4444" stroke-width="1.5"/>

  <!-- Data Fields -->
  <g font-family="Arial, sans-serif" font-size="10" fill="%23475569">
    <text x="220" y="145">Application ID:</text>
    <text x="500" y="145">e-Visa Number:</text>
  </g>
  <g font-family="monospace" font-size="13" font-weight="bold" fill="%230f172a">
    <text x="220" y="163">IN-2026-984210</text>
    <text x="500" y="163">V9842105B</text>
  </g>

  <g font-family="Arial, sans-serif" font-size="10" fill="%23475569">
    <text x="220" y="190">Full Name:</text>
    <text x="500" y="190">Nationality:</text>
  </g>
  <g font-family="monospace" font-size="13" font-weight="bold" fill="%230f172a">
    <text x="220" y="208">DAVID ALEXANDER VANCE</text>
    <text x="500" y="208">UNITED STATES (USA)</text>
  </g>

  <g font-family="Arial, sans-serif" font-size="10" fill="%23475569">
    <text x="220" y="235">Passport Number:</text>
    <text x="500" y="235">Visa Sub-type:</text>
  </g>
  <g font-family="monospace" font-size="13" font-weight="bold" fill="%230f172a">
    <text x="220" y="253">P948210394</text>
    <text x="500" y="253">e-TOURIST VISA (30 DAYS)</text>
  </g>

  <!-- Date Fields (TAMPERED Expiry Date with mismatched Font) -->
  <g font-family="Arial, sans-serif" font-size="10" fill="%23475569">
    <text x="220" y="280">Date of Issue:</text>
    <text x="360" y="280" fill="%23b91c1c" font-weight="bold">Date of Expiry [ALTERED]:</text>
  </g>
  <text x="220" y="298" font-family="monospace" font-size="13" font-weight="bold" fill="%230f172a">10/01/2026</text>
  <!-- Altered Expiry with mismatched comic/helvetica font to trigger OCR Tampering -->
  <rect x="355" y="282" width="110" height="24" fill="rgba(239,68,68,0.15)" stroke="%23ef4444" stroke-width="1"/>
  <text x="360" y="298" font-family="Times New Roman, serif" font-size="15" font-weight="900" fill="%23b91c1c">10/01/2030</text>

  <!-- Tampered Barcode with broken checksum -->
  <rect x="45" y="360" width="710" height="75" rx="6" fill="%23fef2f2" stroke="%23f87171"/>
  <text x="65" y="390" font-family="monospace" font-size="11" font-weight="bold" fill="%23b91c1c">
    ⚠ DIGITAL HASH MISMATCH: Checksum does not match MHA Central Immigration Database
  </text>
  <text x="65" y="410" font-family="sans-serif" font-size="10" fill="%237f1d1d">
    Integrity Violation: Expiry period extends beyond statutory limit (Maximum 1 year allowed for e-Tourist Visa).
  </text>
</svg>`;

// 4. INDIAN DRIVING LICENSE SVG (सड़क परिवहन और राजमार्ग मंत्रालय / MoRTH)
const indianDrivingLicenseSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
  <defs>
    <linearGradient id="dlBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="%23f8fafc"/>
      <stop offset="100%" stop-color="%23e2e8f0"/>
    </linearGradient>
  </defs>

  <rect width="800" height="500" rx="16" fill="url(%23dlBg)" stroke="%230b2545" stroke-width="2"/>

  <!-- Top Blue Header Bar -->
  <path d="M0,16 Q0,0 16,0 L784,0 Q800,0 800,16 L800,55 L0,55 Z" fill="%230b2545"/>
  <text x="400" y="26" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="%23f97316" text-anchor="middle" letter-spacing="1">
    UNION OF INDIA / भारतीय संघ
  </text>
  <text x="400" y="44" font-family="Arial, sans-serif" font-size="14" font-weight="900" fill="%23ffffff" text-anchor="middle" letter-spacing="2">
    DRIVING LICENCE — DELHI TRANSPORT DEPARTMENT
  </text>

  <!-- Chip Illustration -->
  <rect x="50" y="75" width="60" height="46" rx="6" fill="%23d4af37" stroke="%23b45309" stroke-width="1.5"/>
  <line x1="50" y1="98" x2="110" y2="98" stroke="%23b45309"/>
  <line x1="80" y1="75" x2="80" y2="121" stroke="%23b45309"/>

  <!-- DL Number -->
  <text x="130" y="92" font-family="Arial, sans-serif" font-size="10" fill="%2364748b" font-weight="bold">LICENCE NO. / लाइसेंस सं.</text>
  <text x="130" y="112" font-family="monospace" font-size="16" font-weight="900" fill="%230b2545">DL-0420220098412</text>

  <!-- Photo Box -->
  <rect x="50" y="145" width="150" height="190" rx="8" fill="%23e2e8f0" stroke="%2394a3b8" stroke-width="1.5"/>
  <circle cx="125" cy="215" r="36" fill="%2364748b"/>
  <path d="M80,320 C80,265 170,265 170,320 Z" fill="%23475569"/>
  <circle cx="125" cy="210" r="26" fill="%23cbd5e1"/>
  <path d="M92,320 C92,275 158,275 158,320 Z" fill="%23334155"/>

  <!-- Holder Details -->
  <g font-family="Arial, sans-serif" font-size="10" fill="%2364748b" font-weight="bold">
    <text x="230" y="160">NAME / नाम:</text>
    <text x="230" y="200">S/W/D OF / पिता/पति:</text>
    <text x="230" y="240">DOB / जन्म तिथि:</text>
    <text x="400" y="240">BLOOD GROUP:</text>
    <text x="230" y="280">VALIDITY (NT) / वैधता:</text>
    <text x="400" y="280">VEHICLE CLASS / श्रेणी:</text>
  </g>
  <g font-family="monospace" font-size="13" font-weight="bold" fill="%230f172a">
    <text x="230" y="178">PRIYA PATEL</text>
    <text x="230" y="218">RAMESH PATEL</text>
    <text x="230" y="258">18/10/1995</text>
    <text x="400" y="258" fill="%23dc2626">B+VE</text>
    <text x="230" y="298" fill="%2315803d">17/10/2035</text>
    <text x="400" y="298">MCWG, LMV</text>
  </g>

  <!-- QR Code representation -->
  <rect x="630" y="160" width="120" height="120" fill="%230b2545"/>
  <rect x="640" y="170" width="30" height="30" fill="%23ffffff"/>
  <rect x="645" y="175" width="20" height="20" fill="%230b2545"/>
  <rect x="710" y="170" width="30" height="30" fill="%23ffffff"/>
  <rect x="715" y="175" width="20" height="20" fill="%230b2545"/>
  <rect x="640" y="240" width="30" height="30" fill="%23ffffff"/>
  <rect x="645" y="245" width="20" height="20" fill="%230b2545"/>
  <text x="690" y="305" font-family="sans-serif" font-size="9" fill="%2364748b" text-anchor="middle">SARATHI MORTH</text>
</svg>`;

// Biometric Face Representations
export const sampleFaces = {
  rajeshDoc: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240" width="200" height="240">
    <rect width="200" height="240" fill="%230c2340"/>
    <circle cx="100" cy="95" r="50" fill="%23d4af37" opacity="0.3"/>
    <circle cx="100" cy="95" r="46" fill="%23cbd5e1"/>
    <path d="M35,240 C35,165 165,165 165,240 Z" fill="%23334155"/>
    <circle cx="82" cy="90" r="5" fill="%231e293b"/>
    <circle cx="118" cy="90" r="5" fill="%231e293b"/>
    <path d="M90,118 Q100,125 110,118" stroke="%231e293b" stroke-width="2.5" fill="none"/>
    <text x="20" y="30" font-family="monospace" font-size="9" fill="%23d4af37">ICAO: Z4829105</text>
  </svg>`,

  rajeshSelfie: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240" width="200" height="240">
    <rect width="200" height="240" fill="%23081a30"/>
    <circle cx="100" cy="95" r="46" fill="%23cbd5e1"/>
    <path d="M35,240 C35,165 165,165 165,240 Z" fill="%23334155"/>
    <circle cx="82" cy="90" r="5" fill="%231e293b"/>
    <circle cx="118" cy="90" r="5" fill="%231e293b"/>
    <path d="M90,118 Q100,125 110,118" stroke="%231e293b" stroke-width="2.5" fill="none"/>
    <circle cx="25" cy="25" r="4" fill="%2310b981"/>
    <text x="36" y="29" font-family="monospace" font-size="9" fill="%2310b981">3D LIVENESS OK</text>
  </svg>`,

  davidDoc: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240" width="200" height="240">
    <rect width="200" height="240" fill="%231e293b"/>
    <circle cx="100" cy="95" r="46" fill="%23e2e8f0"/>
    <path d="M35,240 C35,165 165,165 165,240 Z" fill="%23475569"/>
    <circle cx="82" cy="90" r="5" fill="%230f172a"/>
    <circle cx="118" cy="90" r="5" fill="%230f172a"/>
    <path d="M90,120 Q100,125 110,120" stroke="%230f172a" stroke-width="2.5" fill="none"/>
    <text x="20" y="30" font-family="monospace" font-size="9" fill="%2338bdf8">VISA: V9842105B</text>
  </svg>`,

  davidSelfie: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240" width="200" height="240">
    <rect width="200" height="240" fill="%230f172a"/>
    <circle cx="100" cy="95" r="46" fill="%23e2e8f0"/>
    <path d="M35,240 C35,165 165,165 165,240 Z" fill="%23475569"/>
    <circle cx="82" cy="90" r="5" fill="%230f172a"/>
    <circle cx="118" cy="90" r="5" fill="%230f172a"/>
    <path d="M90,120 Q100,125 110,120" stroke="%230f172a" stroke-width="2.5" fill="none"/>
    <circle cx="25" cy="25" r="4" fill="%2310b981"/>
    <text x="36" y="29" font-family="monospace" font-size="9" fill="%2310b981">LIVE DEPTH OK</text>
  </svg>`,
};

export const sampleDocumentsList: SampleDocumentItem[] = [
  {
    id: 'sample-doc-passport-ind',
    name: 'Republic of India Passport (भारत गणराज्य)',
    type: 'passport',
    description: 'ICAO 9303 compliant Republic of India biometric passport with Ashoka Stambh, 2-line MRZ & optical security pattern',
    country: 'India',
    countryCode: 'IND',
    documentNumber: 'Z4829105',
    holderName: 'Rajesh Kumar Sharma',
    previewUrl: indianPassportSvg,
    faceCropUrl: sampleFaces.rajeshDoc,
    selfieUrl: sampleFaces.rajeshSelfie,
    isTampered: false,
  },
  {
    id: 'sample-doc-visa-ind',
    name: 'Government of India e-Visa (आव्रजन ब्यूरो)',
    type: 'visa',
    description: 'Bureau of Immigration / MHA electronic travel authorization with ECDSA SHA-256 digital signature seal and QR payload',
    country: 'India',
    countryCode: 'IND',
    documentNumber: 'V9842105B',
    holderName: 'David Alexander Vance',
    previewUrl: indianVisaSvg,
    faceCropUrl: sampleFaces.davidDoc,
    selfieUrl: sampleFaces.davidSelfie,
    isTampered: false,
    visaDetails: {
      visaType: 'e-Tourist Visa (30 Days)',
      applicationId: 'IN-2026-984210',
      passportRef: 'P948210394',
      portOfEntry: 'Delhi Airport (IGI - ICP)',
      entries: 'Double Entry',
      validity: '10/01/2026 to 10/01/2027',
    },
  },
  {
    id: 'sample-doc-visa-tampered',
    name: 'Tampered Indian e-Visa (जालसाजी वीज़ा - High Risk)',
    type: 'visa',
    description: 'Flagged for forgery: expiry date altered with mismatched typography, photo perimeter digitally spliced, hash broken',
    country: 'India',
    countryCode: 'IND',
    documentNumber: 'V9842105B',
    holderName: 'David Alexander Vance',
    previewUrl: tamperedIndianVisaSvg,
    faceCropUrl: sampleFaces.davidDoc,
    selfieUrl: sampleFaces.davidSelfie,
    isTampered: true,
    tamperReason: 'Typographic kerning alteration detected in expiry date (2030) and perimeter splicing detected around photo',
    visaDetails: {
      visaType: 'e-Tourist Visa (Forged Validity)',
      applicationId: 'IN-2026-984210',
      passportRef: 'P948210394',
      portOfEntry: 'Delhi Airport (ICP)',
      entries: 'Forged Double Entry',
      validity: 'Tampered: 2030 (Overstay Fraud)',
    },
  },
  {
    id: 'sample-doc-dl-ind',
    name: 'Indian Smart Driving Licence (सारथी - MoRTH)',
    type: 'driving_license',
    description: 'Ministry of Road Transport & Highways standard smart card driving license with QR payload & chip verification',
    country: 'India',
    countryCode: 'IND',
    documentNumber: 'DL-0420220098412',
    holderName: 'Priya Patel',
    previewUrl: indianDrivingLicenseSvg,
    faceCropUrl: sampleFaces.rajeshDoc,
    selfieUrl: sampleFaces.rajeshSelfie,
    isTampered: false,
  },
];
