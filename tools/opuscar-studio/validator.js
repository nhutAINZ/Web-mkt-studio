// Zod Schema Validator for Storyboard JSON (Single Source of Truth)
// Auto-retry up to 2 times on validation error

const { z } = require('zod');

const ShotSchema = z.object({
  num: z.number().int().min(1).max(6),
  title: z.string().min(3),
  time: z.string(),
  camera: z.string(),
  visual_prompt: z.string().min(5),
  vo: z.string(),
  img: z.string(),
  fallback_img: z.string().optional(),
  status: z.enum(['loading', 'ready', 'error']).optional()
});

const CharacterBibleSchema = z.object({
  name: z.string().default('Main Hero'),
  description: z.string().default('Toy character'),
  reference_image: z.string().nullable().default(null),
  locked_traits: z.array(z.string()).default([])
});

const StoryboardSchema = z.object({
  id: z.string(),
  title: z.string().min(2),
  prompt: z.string().default(''),
  style_lock: z.string().default('brick-toy'),
  aspect: z.string().default('16:9'),
  duration: z.number().default(30),
  character_bible: CharacterBibleSchema.default({}),
  shots: z.array(ShotSchema).length(6),
  version: z.number().int().default(1),
  history: z.array(z.any()).default([])
});

if (require.main === module) {
  const fs = require('fs');
  const filePath = process.argv[2];
  if (!filePath) {
    console.error(JSON.stringify({ valid: false, error: 'No file path provided' }));
    process.exit(1);
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const json = JSON.parse(raw);
    const parsed = StoryboardSchema.parse(json);
    console.log(JSON.stringify({ valid: true, data: parsed }));
  } catch (err) {
    console.error(JSON.stringify({ valid: false, errors: err.errors || err.message }));
    process.exit(2);
  }
}

module.exports = { StoryboardSchema, ShotSchema, CharacterBibleSchema };
