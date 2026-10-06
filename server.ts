import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google GenAI on the server side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Production Plan JSON Schema Definition for Gemini Structured Outputs
const productionPlanResponseSchema = {
  type: Type.OBJECT,
  properties: {
    version: { type: Type.STRING },
    projectName: { type: Type.STRING },
    genre: { type: Type.STRING },
    tempo: { type: Type.INTEGER },
    timeSignature: {
      type: Type.OBJECT,
      properties: {
        numerator: { type: Type.INTEGER },
        denominator: { type: Type.INTEGER },
      },
      required: ['numerator', 'denominator'],
    },
    key: { type: Type.STRING },
    scale: { type: Type.STRING },
    rackType: { type: Type.STRING },
    rackName: { type: Type.STRING },
    description: { type: Type.STRING },
    userLibraryTargetSubfolder: { type: Type.STRING },
    macros: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.INTEGER },
          name: { type: Type.STRING },
          value: { type: Type.NUMBER },
          defaultValue: { type: Type.NUMBER },
          min: { type: Type.NUMBER },
          max: { type: Type.NUMBER },
          color: { type: Type.STRING },
        },
        required: ['id', 'name', 'value'],
      },
    },
    chains: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          name: { type: Type.STRING },
          volumeDb: { type: Type.NUMBER },
          pan: { type: Type.NUMBER },
          muted: { type: Type.BOOLEAN },
          solo: { type: Type.BOOLEAN },
          devices: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                type: { type: Type.STRING },
                name: { type: Type.STRING },
                enabled: { type: Type.BOOLEAN },
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    lowCutFreq: { type: Type.NUMBER },
                    midFreq: { type: Type.NUMBER },
                    midGain: { type: Type.NUMBER },
                    highFreq: { type: Type.NUMBER },
                    highGain: { type: Type.NUMBER },
                    thresholdDb: { type: Type.NUMBER },
                    ratio: { type: Type.NUMBER },
                    attackMs: { type: Type.NUMBER },
                    releaseMs: { type: Type.NUMBER },
                    makeupGainDb: { type: Type.NUMBER },
                    driveDb: { type: Type.NUMBER },
                    outputDb: { type: Type.NUMBER },
                    decayTimeSec: { type: Type.NUMBER },
                    preDelayMs: { type: Type.NUMBER },
                    roomSize: { type: Type.NUMBER },
                    dryWet: { type: Type.NUMBER },
                    cutoffFreq: { type: Type.NUMBER },
                    resonance: { type: Type.NUMBER },
                    width: { type: Type.NUMBER },
                    gainDb: { type: Type.NUMBER },
                    ceilingDb: { type: Type.NUMBER },
                  },
                },
              },
              required: ['id', 'type', 'name', 'enabled'],
            },
          },
        },
        required: ['id', 'name', 'volumeDb', 'pan', 'muted', 'solo', 'devices'],
      },
    },
    markers: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          timeInBeats: { type: Type.INTEGER },
          name: { type: Type.STRING },
          color: { type: Type.STRING },
        },
        required: ['timeInBeats', 'name'],
      },
    },
    chords: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          timeInBeats: { type: Type.INTEGER },
          durationInBeats: { type: Type.INTEGER },
          chordName: { type: Type.STRING },
          notes: {
            type: Type.ARRAY,
            items: { type: Type.INTEGER },
          },
          velocity: { type: Type.INTEGER },
        },
        required: ['timeInBeats', 'durationInBeats', 'chordName', 'notes', 'velocity'],
      },
    },
  },
  required: [
    'version',
    'projectName',
    'genre',
    'tempo',
    'timeSignature',
    'key',
    'scale',
    'rackType',
    'rackName',
    'description',
    'macros',
    'chains',
    'markers',
    'chords',
  ],
};

// API Endpoint to generate custom production plan via Gemini
app.post('/api/generate-plan', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'A text prompt is required.' });
    }

    const systemInstruction = `
You are a Grammy-nominated professional music producer and Ableton Live sound design engineer.
Your job is to generate a comprehensive, highly realistic production plan for Ableton Live (production_plan.json).
You will configure:
1. Master Project Metadata (BPM, Key, Scale, Time Signature, Genre)
2. Ableton Audio Effect Rack with 4 to 8 Macro Controls (with informative names, standard 0.0-1.0 normalized values, and colors)
3. 2 to 4 parallel or serial Processing Chains (e.g., Dry Lead, Parallel Compression/NYC Slam, Space Reverb, Ping-Pong Delay, Telephone Bandpass, Widener)
4. Ableton native devices inside each chain: 'Eq8', 'Compressor2', 'Saturator', 'Reverb', 'Delay', 'AutoFilter', 'Utility', 'Limiter'
5. Song structure markers (Intro, Verse, Pre-Chorus, Chorus/Drop, Bridge, Outro) with beat positions (each 4 beats = 1 bar)
6. Harmonic MIDI chord progression with exact MIDI note numbers (e.g. middle C = 60, A4 = 69) and voicing durations.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Generate a detailed production plan for the following request: "${prompt}"`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: productionPlanResponseSchema,
        temperature: 0.7,
      },
    });

    const responseText = response.text?.trim() || '{}';
    const plan = JSON.parse(responseText);

    return res.json({ success: true, plan });
  } catch (error: unknown) {
    console.error('Gemini Plan Generation Error:', error);
    return res.status(500).json({
      error: 'Failed to generate production plan with Gemini AI.',
      details: (error as Error).message,
    });
  }
});

// Setup Vite development middlewares or serve static build
async function setupServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, '../dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, '../dist/index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, () => {
    console.log(`Ableton Builder Studio running at http://localhost:${PORT}`);
  });
}

setupServer();
