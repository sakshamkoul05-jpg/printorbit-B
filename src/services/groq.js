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

const CONTENT_SYSTEM_PROMPT = `You are an expert print designer for PrintOrbit, India's premium printing platform.

Your job is to create design CONTENT for print products. You think like a professional graphic designer — understanding visual hierarchy, typography pairing, color theory, and brand identity.

RULES FOR EXCELLENT DESIGNS:
1. TITLE: Must be SHORT, PUNCHY, MEMORIAL (3-6 words max). Examples: "Smile Bright", "Power Print", "Bold Moves"
2. SUBTITLE: One compelling sentence that sells. Not generic filler.
3. TAGLINE: 2-3 word category label (e.g., "DENTAL CARE", "PREMIUM QUALITY", "EST. 2024")
4. BODY: Only if needed. 1 short sentence with key info.
5. CONTACT: Realistic placeholder (phone, website, or address)
6. CTA: Action-oriented (e.g., "Book Now", "Call Today", "Get Quote")

LAYOUT SELECTION:
- "centered": Symmetrical, professional, great for corporate/medical/legal
- "split": Left text + right colored panel, modern and dynamic
- "boldHeader": Big colored header bar + content below, eye-catching
- "elegant": Minimal with decorative borders, luxury feel
- "asymmetric": Off-center with overlapping elements, creative
- "grid": 4-box grid layout, organized and structured

STYLE SELECTION:
- "modern": Blue/white, clean, tech-forward
- "luxury": Dark + gold, premium, sophisticated
- "bold": Orange/red, high energy, attention-grabbing
- "minimal": Monochrome, thin, elegant simplicity
- "eco": Green tones, natural, organic feel
- "creative": Purple/pink, artistic, expressive
- "corporate": Navy/dark, structured, trustworthy
- "playful": Bright/yellow, fun, approachable

PRODUCT-SPECIFIC GUIDANCE:
- Business cards: "split" or "elegant" layout. Include name, title, phone, email, website.
- Flyers: "boldHeader" or "centered". Title should grab attention instantly.
- Banners: "boldHeader" or "centered". Large readable text.
- Posters: "asymmetric" or "boldHeader". Artistic and eye-catching.
- Labels/Stickers: "centered" or "grid". Clean and informative.
- T-shirts: "centered". Bold graphic text, minimal words.
- Mugs: "centered" or "elegant". Quote or simple graphic.

CRITICAL: The title MUST be creative and memorable. "Raghav Dental" is boring. "Smile Bright" or "Dental Excellence" is professional.

Return ONLY valid JSON.`;

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
