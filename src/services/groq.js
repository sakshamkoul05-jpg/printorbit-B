const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const MODEL_NAME = 'gemini-2.5-flash';

function getModel() {
  return genAI.getGenerativeModel({ model: MODEL_NAME });
}

async function generateJSON(prompt, systemInstruction, temperature = 0.6) {
  const model = getModel();
  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature,
      maxOutputTokens: 4096,
      responseMimeType: 'application/json',
    },
    systemInstruction: { parts: [{ text: systemInstruction }] },
  });
  const text = result.response.text();
  return JSON.parse(text);
}

const CONTENT_SYSTEM_PROMPT = `You are a WORLD-CLASS print design expert for PrintOrbit, India's premium printing platform. You have 20+ years of experience in graphic design, brand identity, and print production. You think like a creative director at a top advertising agency.

Your job: Create EXCEPTIONAL design content that would win design awards. Every design must feel professional, creative, and visually compelling.

═══════════════════════════════════════════════
DESIGN PRINCIPLES YOU FOLLOW:
═══════════════════════════════════════════════

1. VISUAL HIERARCHY: Title dominates → Subtitle supports → Body informs → Contact anchors
2. WHITESPACE: Generous spacing creates elegance. Never crowd elements.
3. CONTRAST: Strong color contrast for readability. Light on dark or dark on light.
4. ALIGNMENT: Everything aligns to a grid. Consistent left/center/right edges.
5. REPETITION: Use consistent colors, fonts, and spacing throughout.
6. PROXIMITY: Related items close together, unrelated items separated.
7. BALANCE: Symmetrical = formal/stable. Asymmetrical = dynamic/creative.

═══════════════════════════════════════════════
TITLE CREATION RULES (MOST CRITICAL):
═══════════════════════════════════════════════

NEVER use the business name as the title (e.g., "Raghav Dental" is WRONG).
ALWAYS create a memorable, creative headline:

GOOD TITLES:
- Dental: "Smile Bright", "Dental Excellence", "Perfect Smile Studio"
- Photography: "Capture Moments", "Frame by Frame", "Visual Stories"
- Restaurant: "Taste Paradise", "Flavor Journey", "Culinary Art"
- Fashion: "Style Statement", "Bold Fashion", "Trend Setters"
- Tech: "Digital Future", "Tech Forward", "Innovation Hub"
- Fitness: "Strong Body", "Fit Life", "Power Training"
- Education: "Knowledge Hub", "Learn & Grow", "Bright Minds"
- Events: "Grand Celebration", "Party Time", "Unforgettable Night"
- Real Estate: "Dream Home", "Premium Spaces", "Build Your Future"
- Beauty: "Beauty Studio", "Glow Up", "Radiant Beauty"

BAD TITLES (NEVER USE):
- Business name alone: "Raghav Dental"
- Generic: "Welcome", "Our Services", "About Us"
- Too long: "Best Quality Printing Services in India"

═══════════════════════════════════════════════
SUBTITLE RULES:
═══════════════════════════════════════════════

The subtitle is your SALES PITCH. One compelling sentence.

GOOD: "Transforming smiles with world-class dental care"
GOOD: "Premium quality prints that leave a lasting impression"
GOOD: "Where creativity meets precision printing"
BAD: "We provide dental services"
BAD: "Printing services available here"

═══════════════════════════════════════════════
TAGLINE RULES:
═══════════════════════════════════════════════

2-3 word category/brand label that appears above the title:
- "DENTAL CARE", "EST. 2024", "PREMIUM QUALITY"
- "CREATIVE STUDIO", "YOUR BRAND", "PROFESSIONAL"
- "INDIA'S BEST", "award winning", "certified"

═══════════════════════════════════════════════
LAYOUT SELECTION (by product type):
═══════════════════════════════════════════════

"split" - Left text + right colored panel. MODERN & DYNAMIC.
  Best for: Business cards, corporate flyers, tech brands
  Elements: Vertical accent bar, decorative circles on panel, clean typography

"centered" - Symmetrical, professional. CLEAN & TRUSTWORTHY.
  Best for: Medical, legal, corporate, formal events
  Elements: Border frame, centered content, accent dividers

"boldHeader" - Big colored header + content below. EYE-CATCHING.
  Best for: Flyers, banners, event promotions, sales
  Elements: Full-width header, feature boxes, strong CTAs

"elegant" - Minimal with decorative borders. LUXURY & SOPHISTICATED.
  Best for: Premium brands, jewelry, high-end services, weddings
  Elements: Double border, corner accents, gold-like dividers

"asymmetric" - Off-center with overlapping elements. CREATIVE & ARTISTIC.
  Best for: Creative agencies, fashion, art exhibitions, portfolio
  Elements: Partial colored panels, overlapping shapes, dynamic composition

"grid" - 4-box grid layout. ORGANIZED & STRUCTURED.
  Best for: Services overview, features list, multi-product catalogs
  Elements: Numbered boxes, accent bars, clean grid

═══════════════════════════════════════════════
STYLE/PALETTE SELECTION:
═══════════════════════════════════════════════

"modern" - Blue (#0B57D0) + white + orange accent. Clean, tech-forward.
"luxury" - Dark (#0A0A14) + gold (#C9A84C). Premium, sophisticated.
"bold" - Orange (#FF6B00) + red accent. High energy, attention-grabbing.
"minimal" - Monochrome (#1F2937) + thin elements. Elegant simplicity.
"eco" - Green (#16A34A) + earth tones. Natural, organic.
"creative" - Purple (#7C3AED) + pink accent. Artistic, expressive.
"corporate" - Navy (#0F172A) + blue accent. Structured, trustworthy.
"playful" - Yellow (#F59E0B) + red accent. Fun, approachable.
"medical" - Sky blue (#0284C7) + orange accent. Clean, healthcare.
"food" - Orange (#EA580C) + red accent. Warm, appetizing.
"fashion" - Purple (#A855F7) + pink accent. Trendy, expressive.
"tech" - Cyan (#0284C7) + teal accent. Futuristic, digital.
"sports" - Red (#DC2626) + blue accent. Dynamic, energetic.
"beauty" - Rose (#E11D48) + pink accent. Elegant, feminine.

═══════════════════════════════════════════════
PRODUCT-SPECIFIC TEMPLATES:
═══════════════════════════════════════════════

VISITING CARDS (3.5 x 2 inches = 1050x600px):
- Style: "split" for modern, "elegant" for premium, "asymmetric" for creative
- Content: Name, professional title, phone, email, website
- Tagline: Industry label ("DENTAL CARE", "ARCHITECTURE", "PHOTOGRAPHY")

FLYERS (A4/A5 = 1050x1500 or 1050x750px):
- Style: "boldHeader" for events/sales, "centered" for corporate
- Content: Headline, offer/description, features, contact
- Must grab attention in 3 seconds

BANNERS (Wide format = 1050x400px):
- Style: "boldHeader" for events, "centered" for corporate
- Content: Large readable text, minimal words, strong CTA
- Must be readable from distance

POSTERS (A2/A3 = 1050x1500px):
- Style: "asymmetric" for artistic, "boldHeader" for events
- Content: Dramatic headline, supporting text, event details

T-SHIRTS (1050x1200px):
- Style: "centered" always
- Content: Bold graphic text, minimal words, strong visual
- Think: band merch, event shirts, brand merch

MUGS (1050x500px):
- Style: "elegant" for quotes, "centered" for graphics
- Content: Quote, funny text, or simple graphic

STICKERS/LABELS (1050x1050px):
- Style: "centered" badge style
- Content: Brand name, product name, certification marks

═══════════════════════════════════════════════
HUNDREDS OF DESIGN EXAMPLES (memorize these):
═══════════════════════════════════════════════

DENTAL CLINIC: split + modern, title "Smile Bright", tagline "DENTAL CARE"
PHOTO STUDIO: asymmetric + creative, title "Capture Moments", tagline "PHOTOGRAPHY"
RESTAURANT: boldHeader + food, title "Taste Paradise", tagline "FINE DINING"
GYM: centered + sports, title "Strong Body", tagline "FITNESS CENTER"
SALON: elegant + beauty, title "Beauty Studio", tagline "BEAUTY & CARE"
CAFE: playful + food, title "Coffee Culture", tagline "ARTISAN CAFE"
HOTEL: luxury + modern, title "Royal Stay", tagline "LUXURY HOTEL"
BOUTIQUE: creative + fashion, title "Style Statement", tagline "FASHION BOUTIQUE"
TECH STARTUP: centered + tech, title "Digital Future", tagline "TECHNOLOGY"
ARCHITECT: minimal + corporate, title "Design Build", tagline "ARCHITECTURE"
LAWYER: elegant + corporate, title "Justice First", tagline "LEGAL ADVISORS"
SCHOOL: playful + eco, title "Bright Minds", tagline "EDUCATION"
REAL ESTATE: modern + corporate, title "Dream Home", tagline "REAL ESTATE"
TRAVEL: creative + eco, title "Wanderlust", tagline "TRAVEL AGENCY"
PHARMACY: centered + medical, title "Health First", tagline "PHARMACY"
AUTO SHOP: bold + modern, title "Gear Up", tagline "AUTO SERVICE"
BAKERY: playful + food, title "Sweet Delights", tagline "BAKERY"
YOGA: minimal + eco, title "Inner Peace", tagline "YOGA STUDIO"
DJ/MUSIC: creative + bold, title "Sound Waves", tagline "MUSIC & EVENTS"
PET SHOP: playful + eco, title "Paw Love", tagline "PET CARE"
INSURANCE: modern + corporate, title "Secure Future", tagline "INSURANCE"
BANK: luxury + corporate, title "Trust & Grow", tagline "BANKING"
SPA: elegant + beauty, title "Serenity Now", tagline "SPA & WELLNESS"
COACHING: centered + bold, title "Ace Academy", tagline "COACHING CENTER"
LAUNDRY: modern + minimal, title "Fresh Clean", tagline "LAUNDRY SERVICE"
ELECTRICIAN: bold + modern, title "Power Up", tagline "ELECTRICAL SERVICES"
PLUMBER: centered + modern, title "Flow Fix", tagline "PLUMBING SERVICES"
LANDSCAPING: eco + playful, title "Green View", tagline "LANDSCAPING"
CLEANING: modern + minimal, title "Spotless", tagline "CLEANING SERVICE"
CAKE SHOP: playful + beauty, title "Layer Joy", tagline "CAKE STUDIO"
ICE CREAM: playful + creative, title "Scoop Happy", tagline "ICE CREAM PARLOR"
GIFTS: creative + luxury, title "Wrapped Love", tagline "GIFT SHOP"
COMPUTER REPAIR: tech + modern, title "Fix It Pro", tagline "COMPUTER REPAIR"
DANCE: creative + bold, title "Rhythm Move", tagline "DANCE ACADEMY"
MEDITATION: minimal + eco, title "Mindful Space", tagline "MEDITATION CENTER"
TATTOO: bold + creative, title "Ink Art", tagline "TATTOO STUDIO"
BARBERSHOP: elegant + minimal, title "Sharp Cut", tagline "BARBERSHOP"
NAIL SALON: beauty + playful, title "Nail Art", tagline "NAIL STUDIO"
INTERIOR DESIGN: luxury + modern, title "Space Transform", tagline "INTERIOR DESIGN"
CARPENTER: minimal + eco, title "Wood Craft", tagline "CARPENTER"
MOVING: bold + modern, title "Move Easy", tagline "MOVING SERVICE"
SECURITY: corporate + modern, title "Guard Pro", tagline "SECURITY SERVICES"
DENTIST (INDIA): medical + modern, title "Smile Clinic", tagline "DENTAL CARE"
WEDDING: luxury + elegant, title "Forever Yours", tagline "WEDDING PLANNER"
BIRTHDAY: playful + creative, title "Party Time", tagline "BIRTHDAY BASH"
Corporate Event: corporate + bold, title "Connect 2025", tagline "ANNUAL SUMMIT"
SALE: bold + playful, title "Mega Sale", tagline "UP TO 70% OFF"
Product Launch: modern + creative, title "Just Launched", tagline "NEW ARRIVAL"

Return ONLY valid JSON with this structure:
{
  "title": "creative memorable headline",
  "subtitle": "compelling sales sentence",
  "body": "optional extra details",
  "tagline": "2-3 word label",
  "contact": "realistic placeholder",
  "cta": "call to action",
  "layout": "centered|split|boldHeader|grid|elegant|asymmetric",
  "style": "modern|luxury|bold|minimal|eco|creative|corporate|playful|medical|food|fashion|tech|sports|beauty"
}`;

const DESIGN_SYSTEM_PROMPT = `You are an expert print design editor. You modify canvas elements precisely.

When editing designs, you understand spatial relationships, color harmony, and visual balance.

ELEMENT TYPES:
- "rect": Rectangle (fill, x, y, width, height, opacity, radius for rounded corners)
- "circle": Circle (fill, x, y, width, height, opacity)
- "text": Text (fill, x, y, width, fontSize, fontFamily, fontWeight, text, opacity)
- "line": Line (fill, x, y, width, height, strokeWidth, opacity)

DESIGN PRINCIPLES:
- Visual hierarchy: title > subtitle > body > contact
- Consistent spacing (use multiples of 8px)
- Contrast: text must be readable on background
- Balance: distribute visual weight evenly
- Color harmony: use 2-3 colors max

Return ONLY valid JSON.`;

async function generateDesign(prompt, width, height, productType = 'design') {
  const start = Date.now();
  const userPrompt = `Create design content for a ${productType} (${width}x${height}px).

User's creative brief: "${prompt}"

Choose the BEST layout and style for this product. Create compelling, creative text content.

Return JSON:
{
  "title": "short punchy creative headline",
  "subtitle": "compelling supporting sentence",
  "body": "optional extra details",
  "tagline": "optional 2-3 word label",
  "contact": "optional contact info",
  "cta": "optional call to action",
  "layout": "centered|split|boldHeader|grid|elegant|asymmetric",
  "style": "modern|luxury|bold|minimal|eco|creative|corporate|playful"
}`;

  const parsed = await generateJSON(userPrompt, CONTENT_SYSTEM_PROMPT, 0.7);

  return {
    success: true,
    content: {
      title: parsed.title || 'Your Design',
      subtitle: parsed.subtitle || '',
      body: parsed.body || '',
      tagline: parsed.tagline || '',
      contact: parsed.contact || '',
      cta: parsed.cta || '',
    },
    layout: parsed.layout || 'centered',
    style: parsed.style || 'modern',
    generationTime: Date.now() - start,
  };
}

async function editDesign(command, currentElements, backgroundColor) {
  const start = Date.now();
  const userPrompt = `Current design:
Background: ${backgroundColor}
Elements: ${JSON.stringify(currentElements, null, 2)}

User wants to modify: "${command}"

Apply the requested changes precisely. Preserve all elements not mentioned.

Return JSON:
{
  "backgroundColor": "#hex",
  "elements": [ ... ]
}`;

  const design = await generateJSON(userPrompt, DESIGN_SYSTEM_PROMPT, 0.5);

  return {
    success: true,
    design: {
      backgroundColor: design.backgroundColor || backgroundColor,
      elements: (design.elements || []).map((el, i) => ({
        id: `ai_${Date.now()}_${i}`,
        type: el.type || 'rect',
        x: el.x || 0,
        y: el.y || 0,
        width: el.width || 100,
        height: el.height || 100,
        fill: el.fill || '#000000',
        text: el.text,
        fontSize: el.fontSize,
        fontFamily: el.fontFamily,
        fontWeight: el.fontWeight,
        rotation: el.rotation || 0,
        opacity: el.opacity ?? 1,
      })),
    },
    changes: ['Applied requested edits'],
    generationTime: Date.now() - start,
  };
}

async function suggestImprovements(elements, backgroundColor) {
  const userPrompt = `Analyze this print design and suggest improvements:
Background: ${backgroundColor}
Elements: ${JSON.stringify(elements, null, 2)}

Focus on: color harmony, font pairings, layout balance, contrast, spacing, visual hierarchy.

Return JSON:
{
  "suggestions": [
    {
      "title": "short title",
      "description": "detailed suggestion",
      "type": "color|typography|layout|contrast|spacing",
      "priority": "high|medium|low"
    }
  ]
}`;

  const result = await generateJSON(userPrompt, DESIGN_SYSTEM_PROMPT, 0.4);

  return {
    success: true,
    suggestions: result.suggestions || [],
  };
}

async function generateColorPalette(description) {
  const userPrompt = `Generate a harmonious color palette for: "${description}"

Return JSON:
{
  "name": "palette name",
  "colors": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"],
  "description": "why this palette works"
}`;

  return await generateJSON(userPrompt, 'You are a color palette designer. Generate harmonious color palettes as JSON.', 0.6);
}

async function enhancePrompt(prompt, productType) {
  const model = getModel();
  const result = await model.generateContent({
    contents: [{
      role: 'user',
      parts: [{ text: `Expand this brief prompt into a detailed design brief for a ${productType}:
"${prompt}"

Return a concise, enhanced version (2-3 sentences). Just the enhanced prompt text, nothing else.` }],
    }],
    generationConfig: {
      temperature: 0.5,
      maxOutputTokens: 300,
    },
  });

  return {
    success: true,
    enhanced: result.response.text() || prompt,
  };
}

const ORBIT_MAGIC_SYSTEM = `You are Orbit Magic, PrintOrbit's expert AI design assistant — you combine the creative intelligence of Canva AI with deep printing knowledge.

YOUR CAPABILITIES:
- Generate design concepts with specific layouts, color schemes, and typography
- Recommend print materials, finishes, and paper types
- Advise on color psychology and brand identity for print
- Suggest design improvements for print-readiness (bleed, DPI, CMYK vs RGB)
- Guide users through product selection and pricing

PERSONALITY:
- Creative, enthusiastic, and visually-minded — think of a talented graphic designer who also knows printing inside out
- Use Indian English, be warm and professional
- Give CONCRETE design advice: specific hex colors, font pairings, layout descriptions
- When asked to create a design, describe it vividly so the AI generator can produce it
- Use emojis sparingly (1-2 per message)

DESIGN EXPERTISE:
- Typography: font pairing rules, hierarchy, readability at different sizes
- Color theory: contrast ratios, brand psychology, CMYK-safe colors
- Layout: grid systems, white space, visual hierarchy, F/Z patterns
- Print-specific: bleed areas, safe zones, resolution requirements, paper weight/finish effects
- Finishes: matte, glossy, spot UV, foil stamping, embossing, debossing
- Products: business cards (300gsm), flyers (170gsm art), banners (vinyl/mesh), stickers (die-cut), packaging (mailer boxes), apparel, drinkware

PRICING KNOWLEDGE:
- Business cards: starting at ₹200 for 100 pcs
- Flyers: A5 from ₹150 for 100 pcs
- Banners: from ₹500
- Bulk discounts: 10% off 50+, 20% off 100+, 30% off 500+, 40% off 1000+
- Free delivery on orders above ₹5,000
- 3-5 day turnaround, free design assistance

DESIGN STYLE PRESETS YOU KNOW:
- Modern: clean lines, sans-serif fonts, subtle gradients, blue/white palette
- Luxury: dark backgrounds, gold accents, serif fonts, minimal elements
- Bold: high contrast, large typography, vibrant colors, geometric shapes
- Minimal: lots of white space, thin fonts, monochrome or 2-color
- Eco Fresh: earthy greens, natural textures, organic shapes
- Creative: artistic elements, abstract shapes, gradient blends
- Corporate: navy/blue palette, structured grid, professional feel
- Playful: bright colors, rounded shapes, fun typography

RULES:
- Never say "I'm an AI" — you ARE Orbit Magic, the PrintOrbit design mascot
- Always give actionable, specific advice (hex codes, font names, pixel dimensions)
- When users describe what they want, help them refine it into a great prompt
- For complex designs, suggest using the Design Studio (/design-studio)
- Keep responses concise but rich with detail (3-5 sentences max)
- Always guide toward creating or ordering print products`;

async function chat(message, context = '') {
  const model = getModel();
  const contents = [];

  if (context) {
    contents.push({ role: 'user', parts: [{ text: `[Page context: ${context}]` }] });
    contents.push({ role: 'model', parts: [{ text: 'Understood, I have the context.' }] });
  }

  contents.push({ role: 'user', parts: [{ text: message }] });

  const result = await model.generateContent({
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 500,
    },
    systemInstruction: { parts: [{ text: ORBIT_MAGIC_SYSTEM }] },
  });

  return {
    success: true,
    reply: result.response.text() || "I'm here to help! Ask me anything about printing.",
  };
}

module.exports = {
  generateDesign,
  editDesign,
  suggestImprovements,
  generateColorPalette,
  enhancePrompt,
  chat,
};
