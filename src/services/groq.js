const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });

const FONTS = ['Inter', 'Space Grotesk', 'Playfair Display', 'Montserrat', 'Poppins', 'Roboto'];

const DESIGN_SYSTEM_PROMPT = `You are an expert print designer AI for PrintOrbit, India's premium printing platform. You create stunning, print-ready designs that compete with top design tools like Canva and Figma.

DESIGN PRINCIPLES:
- Create VISUALLY STUNNING designs with strong visual hierarchy
- Use professional typography: clear heading/subheading/body text hierarchy
- Apply color theory: complementary colors, proper contrast (4.5:1 minimum for text)
- Include visual elements: shapes, lines, decorative accents, brand elements
- Maintain 16px minimum padding from all edges (safe zone)
- Use max 3 font families per design for cohesion
- Add depth with shadows, gradients, and layering
- Every design should feel complete and production-ready

TYPOGRAPHY RULES:
- Headings: Bold, large (10-15% of canvas height), tight letter-spacing
- Subheadings: Medium weight, 60% of heading size
- Body: Regular weight, 12-14px equivalent
- Contact info: Small, clean, well-organized
- Use font hierarchy to guide the eye

COLOR RULES:
- Primary brand color: dominant (60% of design)
- Secondary accent: supporting (30%)
- Neutral: backgrounds and text (10%)
- Ensure text colors have high contrast against backgrounds
- Use white space strategically for breathing room

ELEMENT RICHNESS:
- Include background shapes, decorative lines, accent bars
- Add geometric elements (circles, rectangles, lines) for visual interest
- Use opacity and layering for depth
- Include proper alignment and spacing

Return ONLY valid JSON. No markdown, no explanation.`;

async function generateDesign(prompt, width, height, productType = 'design') {
  const start = Date.now();
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: DESIGN_SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Create a STUNNING, professional print design for a ${productType}.
Canvas dimensions: ${width}x${height}px

User brief: "${prompt}"

Requirements:
- Create AT LEAST 8-12 design elements (background shapes, accent lines, text blocks, decorative elements)
- Include a clear visual hierarchy with title, subtitle, and supporting text
- Add decorative geometric elements (circles, rectangles, lines) for visual interest
- Use proper spacing and alignment
- Make it look like a professional designer created it

Return JSON:
{
  "backgroundColor": "#hex",
  "elements": [
    {
      "type": "text|rect|circle|line",
      "x": number, "y": number,
      "width": number, "height": number,
      "fill": "#hex",
      "text": "string (only for text type)",
      "fontSize": number (for text type, use relative sizing based on canvas),
      "fontFamily": "string (from allowed list)",
      "fontWeight": "normal|bold",
      "rotation": number (0-360),
      "opacity": number (0-1)
    }
  ]
}`,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7,
    max_tokens: 6000,
  });

  const content = response.choices[0]?.message?.content || '{}';
  const design = JSON.parse(content);

  return {
    success: true,
    design: {
      backgroundColor: design.backgroundColor || '#FFFFFF',
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
