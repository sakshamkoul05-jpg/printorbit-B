const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });

const FONTS = ['Inter', 'Space Grotesk', 'Playfair Display', 'Montserrat', 'Poppins', 'Roboto'];

const CONTENT_SYSTEM_PROMPT = `You are an expert print content creator for PrintOrbit, India's premium printing platform.

Your job is to extract and create design CONTENT from user prompts. You do NOT create coordinates or positions.

You must return structured JSON with:
- title: The main headline (keep it SHORT, max 5-8 words, powerful and impactful)
- subtitle: Supporting text (one sentence, clear value proposition)
- body: Optional additional details (1-2 short sentences)
- tagline: Optional short phrase or category label (max 3 words)
- contact: Optional contact info placeholder (e.g., "www.printorbit.in | +91 98765 43210")
- cta: Optional call-to-action text (e.g., "Order Now", "Get Started")
- layout: One of "centered", "split", "boldHeader", "grid", "elegant", "asymmetric"
- style: One of "modern", "luxury", "bold", "minimal", "eco", "creative", "corporate", "playful"

RULES:
- Title must be SHORT and PUNCHY (e.g., "Premium Printing", "Design. Print. Delivered.")
- Never write paragraphs - everything must be concise
- Choose the layout that best fits the product type and user's description
- Choose a style that matches the mood described
- For business cards: use "split" or "elegant" layout
- For flyers/banners: use "centered" or "boldHeader"
- For social media: use "asymmetric" or "grid"
- For labels/stickers: use "centered" or "grid"

Return ONLY valid JSON.`;

async function generateDesign(prompt, width, height, productType = 'design') {
  const start = Date.now();
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: CONTENT_SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Create design content for a ${productType} (${width}x${height}px).

User's creative brief: "${prompt}"

Extract/create the text content and choose the best layout and style.

Return JSON:
{
  "title": "short punchy headline",
  "subtitle": "supporting sentence",
  "body": "optional extra details",
  "tagline": "optional short label",
  "contact": "optional contact info",
  "cta": "optional call to action",
  "layout": "centered|split|boldHeader|grid|elegant|asymmetric",
  "style": "modern|luxury|bold|minimal|eco|creative|corporate|playful"
}`,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.6,
    max_tokens: 500,
  });

  const raw = response.choices[0]?.message?.content || '{}';
  const parsed = JSON.parse(raw);

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
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: DESIGN_SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Current design:
Background: ${backgroundColor}
Elements: ${JSON.stringify(currentElements, null, 2)}

User wants to modify: "${command}"

Return the COMPLETE updated design JSON. Preserve all elements not mentioned in the edit.
{
  "backgroundColor": "#hex",
  "elements": [ ... ]
}`,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.5,
    max_tokens: 4000,
  });

  const content = response.choices[0]?.message?.content || '{}';
  const design = JSON.parse(content);

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
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: DESIGN_SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Analyze this print design and suggest improvements:
Background: ${backgroundColor}
Elements: ${JSON.stringify(elements, null, 2)}

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
}

Focus on: color harmony, font pairings, layout balance, contrast issues, spacing.`,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.4,
    max_tokens: 2000,
  });

  const content = response.choices[0]?.message?.content || '{}';
  const result = JSON.parse(content);

  return {
    success: true,
    suggestions: result.suggestions || [],
  };
}

async function generateColorPalette(description) {
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: 'You are a color palette designer. Generate harmonious color palettes as JSON.',
      },
      {
        role: 'user',
        content: `Generate a color palette for: "${description}"

Return JSON:
{
  "name": "palette name",
  "colors": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"],
  "description": "why this palette works"
}`,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.6,
    max_tokens: 500,
  });

  const content = response.choices[0]?.message?.content || '{}';
  return JSON.parse(content);
}

async function enhancePrompt(prompt, productType) {
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: 'You are a design brief expert. Expand short user prompts into detailed design briefs.',
      },
      {
        role: 'user',
        content: `Expand this brief prompt into a detailed design brief for a ${productType}:
"${prompt}"

Return a concise, enhanced version (2-3 sentences). Just the enhanced prompt, nothing else.`,
      },
    ],
    temperature: 0.5,
    max_tokens: 300,
  });

  return {
    success: true,
    enhanced: response.choices[0]?.message?.content || prompt,
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
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: ORBIT_MAGIC_SYSTEM },
      ...(context ? [{ role: 'system', content: `Current page context: ${context}` }] : []),
      { role: 'user', content: message },
    ],
    temperature: 0.7,
    max_tokens: 500,
  });

  return {
    success: true,
    reply: response.choices[0]?.message?.content || "I'm here to help! Ask me anything about printing.",
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
