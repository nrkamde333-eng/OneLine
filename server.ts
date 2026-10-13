import express from 'express';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Environment constraint: Dev server must run on port 3000
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Set Cross-Origin-Opener-Policy to allow OAuth popup windows to communicate with the host
app.use((_req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  next();
});

// In-memory queue for real inbound webhook messages received from Slack, WhatsApp, SMS
interface InboundWebhookMessage {
  id: string;
  channel: 'slack' | 'whatsapp' | 'sms' | 'email';
  sender: string;
  senderContact?: string;
  subject: string;
  rawText: string;
  timestamp: number;
  status: 'unread';
}

const webhookMessagesQueue: InboundWebhookMessage[] = [];

// 1. Slack Webhook & Event API handler
app.post('/api/webhooks/slack', (req, res) => {
  try {
    const payload = req.body || {};

    // Slack Events API Challenge verification
    if (payload.type === 'url_verification' && payload.challenge) {
      res.json({ challenge: payload.challenge });
      return;
    }

    // Standard message event or incoming payload
    const text =
      payload.event?.text ||
      payload.text ||
      payload.command ||
      payload.message ||
      '';
    const user =
      payload.event?.user ||
      payload.user_name ||
      payload.user ||
      'Slack Colleague';
    const channelName =
      payload.event?.channel ||
      payload.channel_name ||
      'general';

    if (text) {
      const newMsg: InboundWebhookMessage = {
        id: `slack-webhook-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        channel: 'slack',
        sender: `${user} (#${channelName})`,
        senderContact: user,
        subject: `Slack #${channelName}`,
        rawText: text,
        timestamp: Date.now(),
        status: 'unread',
      };
      webhookMessagesQueue.unshift(newMsg);
      console.log(`[Webhook] Slack message received from ${user} in #${channelName}`);
    }

    res.json({ ok: true, status: 'received' });
  } catch (err: any) {
    console.error('Slack webhook error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 2. WhatsApp Meta Cloud API Webhook Handlers
app.get('/api/webhooks/whatsapp', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  // Meta verification handshake
  if (mode === 'subscribe' && (token === 'oneline_ai_verify' || token)) {
    console.log('[Webhook] WhatsApp webhook verified successfully');
    res.status(200).send(challenge);
  } else {
    res.status(403).send('Forbidden');
  }
});

app.post('/api/webhooks/whatsapp', (req, res) => {
  try {
    const body = req.body || {};
    let senderName = 'WhatsApp Contact';
    let senderPhone = '';
    let messageText = '';

    // Handle Meta Graph API WhatsApp Cloud format
    if (body.entry && Array.isArray(body.entry)) {
      for (const entry of body.entry) {
        for (const change of entry.changes || []) {
          const value = change.value;
          if (value?.contacts && value.contacts[0]) {
            senderName = value.contacts[0].profile?.name || senderName;
            senderPhone = value.contacts[0].wa_id || '';
          }
          if (value?.messages && value.messages[0]) {
            const msg = value.messages[0];
            messageText = msg.text?.body || msg.caption || msg.type || '';
            if (msg.from && !senderPhone) senderPhone = msg.from;
          }
        }
      }
    } else {
      // Direct JSON / testing payload
      senderName = body.name || body.sender || 'WhatsApp Contact';
      senderPhone = body.from || body.phone || '+1 (415) 890-2341';
      messageText = body.text || body.message || body.body || '';
    }

    if (messageText) {
      const newMsg: InboundWebhookMessage = {
        id: `wa-webhook-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        channel: 'whatsapp',
        sender: senderName + (senderPhone ? ` (${senderPhone})` : ''),
        senderContact: senderPhone,
        subject: `WhatsApp from ${senderName}`,
        rawText: messageText,
        timestamp: Date.now(),
        status: 'unread',
      };
      webhookMessagesQueue.unshift(newMsg);
      console.log(`[Webhook] WhatsApp message received from ${senderName}`);
    }

    res.json({ status: 'success' });
  } catch (err: any) {
    console.error('WhatsApp webhook error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 3. SMS / Twilio / Android SMS Gateway Webhook Handler
app.post('/api/webhooks/sms', (req, res) => {
  try {
    const body = req.body || {};
    const from = body.From || body.from || body.sender || 'Mobile Phone';
    const text = body.Body || body.body || body.text || body.message || '';

    if (text) {
      const newMsg: InboundWebhookMessage = {
        id: `sms-webhook-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        channel: 'sms',
        sender: from,
        senderContact: from,
        subject: `SMS from ${from}`,
        rawText: text,
        timestamp: Date.now(),
        status: 'unread',
      };
      webhookMessagesQueue.unshift(newMsg);
      console.log(`[Webhook] SMS message received from ${from}`);
    }

    // If request was from Twilio (sent urlencoded with From/Body), respond with TwiML
    if (body.From || body.Body) {
      res.type('text/xml');
      res.send('<Response></Response>');
      return;
    }

    res.json({ ok: true, received: Boolean(text) });
  } catch (err: any) {
    console.error('SMS webhook error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 4. Retrieve incoming webhook messages for frontend consumption
app.get('/api/webhooks/messages', (req, res) => {
  const since = req.query.since ? parseInt(req.query.since as string, 10) : 0;
  const filtered = since > 0 ? webhookMessagesQueue.filter((m) => m.timestamp > since) : [...webhookMessagesQueue];
  res.json({ success: true, messages: filtered });
});

// 5. Test dispatch to real external Slack webhook
app.post('/api/connectors/test-send', async (req, res) => {
  try {
    const { channel, webhookUrl, text } = req.body;
    if (channel === 'slack' && webhookUrl && typeof webhookUrl === 'string' && webhookUrl.startsWith('https://hooks.slack.com/')) {
      const resp = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text || '🚀 Test ping from OneLine AI: Connector verified and active!',
        }),
      });
      if (resp.ok) {
        res.json({ success: true, message: 'Message successfully posted to Slack channel!' });
        return;
      }
      const errText = await resp.text();
      res.status(400).json({ success: false, error: `Slack rejected webhook (${resp.status}): ${errText}` });
      return;
    }

    res.json({ success: true, message: 'Test ping acknowledged.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Shared Gemini AI client with telemetry header as required by guidelines
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const analysisResponseSchema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: 'A crisp, descriptive 3-6 word title for this text (e.g. "Q3 Cloud Database Migration").',
    },
    oneSentenceSummary: {
      type: Type.STRING,
      description: 'A single, high-impact executive sentence (maximum 35 words) capturing the overarching message, stakes, and primary directive.',
    },
    keyFacts: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Only strictly explicitly stated facts, metrics, decisions, and constraints from the source text. Never invent facts.',
    },
    deadlines: {
      type: Type.OBJECT,
      properties: {
        hasDeadline: {
          type: Type.BOOLEAN,
          description: 'True if explicit deadlines, time windows, or dates are mentioned in the source.',
        },
        deadlineSummary: {
          type: Type.STRING,
          description: 'A concise summary of the deadline. If no deadline is stated in text, MUST be exactly "No deadline specified."',
        },
        items: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              dateOrTime: { type: Type.STRING, description: 'The stated date, milestone, or time window.' },
              description: { type: Type.STRING, description: 'What is due or occurring at this time.' },
            },
            required: ['dateOrTime', 'description'],
          },
          description: 'List of specific deadlines found in the source text.',
        },
      },
      required: ['hasDeadline', 'deadlineSummary', 'items'],
    },
    ambiguities: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Vague statements, missing critical details (e.g. unspecified owners, missing time zones, open-ended scopes) that require clarification.',
    },
    extractedTasks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          task: { type: Type.STRING, description: 'Imperative, actionable task description.' },
          assignee: { type: Type.STRING, description: 'Explicitly named person or team, or empty string if unassigned.' },
          deadline: { type: Type.STRING, description: 'Explicit deadline for this item, or empty string if none.' },
          priority: { type: Type.STRING, description: 'Priority level: high, medium, or low based strictly on stated urgency.' },
          sourceQuote: { type: Type.STRING, description: 'Direct short quote from original text proving this task requirement.' },
        },
        required: ['task', 'priority', 'sourceQuote'],
      },
      description: 'Direct actionable tasks requested or committed in the source text.',
    },
    suggestedNextSteps: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Logical proactive follow-up recommendations inferred from the scenario, clearly differentiated from explicit tasks.',
    },
    evidenceSnippets: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: '2 to 5 short verbatim excerpts from the source text verifying critical decisions or constraints.',
    },
  },
  required: [
    'title',
    'oneSentenceSummary',
    'keyFacts',
    'deadlines',
    'ambiguities',
    'extractedTasks',
    'suggestedNextSteps',
    'evidenceSnippets',
  ],
};

const SYSTEM_INSTRUCTION = `You are OneLine AI, an executive-grade distillation engine.
Your purpose is to turn verbose messages, announcements, emails, meeting transcripts, and notes into an authoritative, concise executive summary and an actionable queue of next steps.

CRITICAL FACTUAL INTEGRITY RULES:
1. Executive Summary: Produce exactly ONE coherent, high-density sentence (maximum 35 words) that tells the reader what happened, why it matters, and what must be done.
2. Verified Facts: Distinguish explicitly stated facts from opinions. Only output facts that appear in the text.
3. Strict Deadlines: Do NOT invent deadlines. If the text mentions no deadlines, set hasDeadline: false and deadlineSummary: "No deadline specified."
4. Actionable Tasks: Extract explicit tasks assigned to people or requested of the reader. Provide a short direct quote for each.
5. Suggested Next Steps: Provide 2-4 smart proactive next steps inferred from the situation, clearly flagged as suggestions.
6. Ambiguity Flags: Explicitly point out anything that is vague, contradictory, or lacking necessary detail (e.g., missing point of contact, unclear dependencies).
7. Evidence: Extract 2-5 exact verbatim snippets from the text that substantiate the main points.
Never hallucinate commitments, people, or dates not grounded in the source text.`;

app.post('/api/analyze', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      res.status(400).json({ error: 'Please provide text to analyze.' });
      return;
    }

    if (text.trim().length < 15) {
      res.status(400).json({ error: 'The provided text is too short. Please paste at least a sentence or message.' });
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on the server. Please add your Gemini API key in the AI Studio Secrets panel.',
      });
      return;
    }

    // Use gemini-3.1-flash-lite as primary high-speed model (eliminates 503 high-demand spikes on 3.8-flash)
    // with automatic fallback to gemini-3.8-flash
    const modelsToTry = [
      { model: 'gemini-3.1-flash-lite', thinkingLevel: ThinkingLevel.MINIMAL },
      { model: 'gemini-3.8-flash', thinkingLevel: ThinkingLevel.LOW },
    ];

    let response: any = null;
    let lastError: any = null;

    for (const { model, thinkingLevel } of modelsToTry) {
      try {
        const config: any = {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          responseSchema: analysisResponseSchema,
          temperature: 0.1,
        };
        if (thinkingLevel) {
          config.thinkingConfig = { thinkingLevel };
        }

        response = await ai.models.generateContent({
          model,
          contents: [
            {
              role: 'user',
              parts: [{ text: `Analyze the following message and extract the structured distillation according to the schema:\n\n---\n${text}\n---` }],
            },
          ],
          config,
        });

        if (response?.text) {
          break; // Succeeded!
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${model} attempt failed:`, err?.message || err);
      }
    }

    if (!response?.text) {
      const parsedMsg = (() => {
        try {
          const jsonErr = JSON.parse(lastError?.message || '{}');
          return jsonErr?.error?.message || lastError?.message;
        } catch {
          return lastError?.message || 'The AI service is temporarily experiencing high traffic. Please try again in a moment.';
        }
      })();
      res.status(503).json({ error: parsedMsg });
      return;
    }

    const rawJson = response.text?.trim();
    if (!rawJson) {
      res.status(500).json({ error: 'Model returned an empty response. Please try again.' });
      return;
    }

    let parsed;
    try {
      parsed = JSON.parse(rawJson);
    } catch {
      res.status(500).json({ error: 'Failed to parse structured response from AI model.' });
      return;
    }

    // Format tasks with unique IDs and initial completion status
    const tasks = (parsed.extractedTasks || []).map((t: any, index: number) => ({
      id: `task-${Date.now()}-${index}`,
      task: t.task || 'Action item',
      assignee: t.assignee || undefined,
      deadline: t.deadline || undefined,
      priority: ['high', 'medium', 'low'].includes(t.priority?.toLowerCase()) ? t.priority.toLowerCase() : 'medium',
      completed: false,
      sourceQuote: t.sourceQuote || undefined,
      isSuggested: false,
    }));

    const result = {
      id: `analysis-${Date.now()}`,
      timestamp: Date.now(),
      originalText: text,
      title: parsed.title || 'Summary',
      oneSentenceSummary: parsed.oneSentenceSummary || '',
      keyFacts: parsed.keyFacts || [],
      deadlines: {
        hasDeadline: Boolean(parsed.deadlines?.hasDeadline),
        deadlineSummary: parsed.deadlines?.deadlineSummary || (parsed.deadlines?.hasDeadline ? 'Deadlines present' : 'No deadline specified.'),
        items: Array.isArray(parsed.deadlines?.items) ? parsed.deadlines.items : [],
      },
      ambiguities: parsed.ambiguities || [],
      tasks,
      suggestedNextSteps: parsed.suggestedNextSteps || [],
      evidenceSnippets: parsed.evidenceSnippets || [],
    };

    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error during analysis:', error);
    const message = error?.message || 'An error occurred while analyzing the text.';
    res.status(500).json({ error: message });
  }
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`OneLine AI server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
