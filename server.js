import 'dotenv/config';
import express from 'express';
import { createServer } from 'node:http';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { AssemblyAI } from 'assemblyai';
import { WebSocket, WebSocketServer } from 'ws';

const app = express();
const port = Number(process.env.PORT || 3001);
const root = path.dirname(fileURLToPath(import.meta.url));
const aai = process.env.ASSEMBLYAI_API_KEY
  ? new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY })
  : null;

app.disable('x-powered-by');
app.use(express.json({ limit: '64kb' }));

app.get('/api/config', (_req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json({ assemblyReady: Boolean(aai), openRouterReady: Boolean(process.env.OPENROUTER_API_KEY), groupChatReady: true, pipVoice: process.env.PIP_VOICE || 'aai-sara' });
});

const roomState = new Map();
const roomQueues = new Map();
function sendRoom(roomName, packet) {
  const room = roomState.get(roomName);
  if (!room) return;
  const data = JSON.stringify(packet);
  for (const client of room.clients) if (client.readyState === WebSocket.OPEN) client.send(data);
}
function peopleIn(room) { return [...room.clients].map((client) => ({ id: client.identity, name: client.displayName })); }
function pushRoomHistory(room, packet) {
  room.history.push(packet);
  if (room.history.length > 100) room.history.splice(0, room.history.length - 100);
  sendRoom(room.name, packet);
}
const speechLanguageNames = { en: 'English', es: 'Spanish', fr: 'French', de: 'German', it: 'Italian', pt: 'Portuguese' };
const languageNames = { ...speechLanguageNames, hi: 'Hindi', ur: 'Urdu', ar: 'Arabic', ja: 'Japanese', zh: 'Mandarin', yue: 'Cantonese', ko: 'Korean', mr: 'Marathi', ru: 'Russian', vi: 'Vietnamese', tr: 'Turkish', nl: 'Dutch', sv: 'Swedish', da: 'Danish', fi: 'Finnish', fa: 'Persian', he: 'Hebrew', no: 'Norwegian', nn: 'Norwegian Nynorsk', ro: 'Romanian', ca: 'Catalan', gl: 'Galician', et: 'Estonian', af: 'Afrikaans', xh: 'Xhosa', zu: 'Zulu' };
const languageNamesByLower = Object.fromEntries(Object.values(languageNames).map((name) => [name.toLowerCase(), name]));
Object.entries(speechLanguageNames).forEach(([code, name]) => { languageNamesByLower[code] = name; });
function targetLanguage(preference, detectedCode) {
  if (typeof preference === 'string' && preference.toLowerCase() !== 'auto') return languageNamesByLower[preference.toLowerCase()] || 'English';
  return languageNames[String(detectedCode || 'en').slice(0, 8)] || 'English';
}
function openRouterFailure(error, feature) {
  if (/insufficient credits|purchase more|not enough credits/i.test(String(error?.message || ''))) return 'Your OpenRouter account needs credits before Saywell can generate AI responses.';
  return `OpenRouter could not ${feature}. Check OPENROUTER_API_KEY and OPENROUTER_MODEL.`;
}
async function answerForRoom(room, sourceMessage) {
  if (!process.env.OPENROUTER_API_KEY) {
    pushRoomHistory(room, { type: 'chat', id: randomUUID(), name: 'Pip', text: 'I need my OpenRouter connection before I can help. Add OPENROUTER_API_KEY to the server .env file.', at: Date.now(), assistant: true });
    return;
  }
  const messages = room.history.slice(-24).filter((item) => item.id !== sourceMessage.id).map((item) => ({ role: item.assistant ? 'assistant' : 'user', content: `${item.name}: ${item.text}` }));
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`, 'Content-Type': 'application/json', 'HTTP-Referer': 'http://localhost:5173', 'X-Title': 'Saywell · Pip' },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini',
        temperature: 0.65,
        max_tokens: 220,
        messages: [
          { role: 'system', content: `You are Pip, Saywell's friendly, practical group conversation helper. Room: ${room.name}. Help the group solve the question together. Reply in ${targetLanguage(sourceMessage.language, sourceMessage.detectedLanguage)}. Be warm, concise, and useful; when helpful, summarize the group's options or suggest one next step. Speak naturally because your reply will also be read aloud. Do not say your own name, introduce yourself, or prefix the reply with "Pip:". Return only the words you would say directly. Do not claim you took external actions.` },
          ...messages,
          { role: 'user', content: `Help the group with this request from ${sourceMessage.name}: ${sourceMessage.text}. Give a direct spoken reply in 1–3 short sentences, with no speaker label.` },
        ],
      }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result?.error?.message || `OpenRouter returned ${response.status}`);
    const text = result?.choices?.[0]?.message?.content;
    if (typeof text !== 'string' || !text.trim()) throw new Error('Pip received an empty response.');
    const reply = text.trim().replace(/^(?:\*{0,2}pip\*{0,2}\s*[:—-]\s*)+/i, '').trim();
    if (!reply) throw new Error('Pip received an empty response.');
    pushRoomHistory(room, { type: 'chat', id: randomUUID(), name: 'Pip', text: reply, at: Date.now(), assistant: true, language: sourceMessage.language, detectedLanguage: sourceMessage.detectedLanguage });
  } catch (error) {
    console.error('Room assistant request failed:', error.message);
    pushRoomHistory(room, { type: 'chat', id: randomUUID(), name: 'Pip', text: 'I hit a little snag. Try asking me again in a moment.', at: Date.now(), assistant: true });
  }
}

const server = createServer(app);
const webSockets = new WebSocketServer({ noServer: true, maxPayload: 8192 });
server.on('upgrade', (request, socket, head) => {
  if (new URL(request.url, 'http://localhost').pathname !== '/ws') { socket.destroy(); return; }
  webSockets.handleUpgrade(request, socket, head, (client) => webSockets.emit('connection', client, request));
});
webSockets.on('connection', (client) => {
  client.identity = randomUUID();
  client.roomName = '';
  client.displayName = '';
  client.on('message', (raw) => {
    let packet;
    try { packet = JSON.parse(raw.toString()); } catch { return; }
    if (packet.type === 'join') {
      const roomName = String(packet.room ?? '').trim().replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 48);
      const displayName = String(packet.name ?? '').trim().replace(/[<>\n\r]/g, '').slice(0, 32);
      if (!roomName || !displayName) { client.send(JSON.stringify({ type: 'error', message: 'Add a room name and your name to join.' })); return; }
      client.roomName = roomName;
      client.displayName = displayName;
      if (!roomState.has(roomName)) roomState.set(roomName, { name: roomName, clients: new Set(), history: [] });
      const room = roomState.get(roomName);
      room.clients.add(client);
      client.send(JSON.stringify({ type: 'joined', room: roomName, identity: client.identity, history: room.history, people: peopleIn(room) }));
      sendRoom(roomName, { type: 'presence', people: peopleIn(room) });
      return;
    }
    if (packet.type !== 'chat' || !client.roomName) return;
    const room = roomState.get(client.roomName);
    if (!room) return;
    const text = String(packet.text ?? '').trim().slice(0, 2000);
    if (!text) return;
    const askPip = Boolean(packet.askPip) || /(^|[^a-z0-9_])@pip\b/i.test(text);
    const preference = ['auto', 'english', 'spanish', 'french', 'german', 'italian', 'portuguese'].includes(packet.language) ? packet.language : 'auto';
    const detectedLanguage = String(packet.detectedLanguage || 'en').slice(0, 8);
    const message = { type: 'chat', id: randomUUID(), name: client.displayName, text, at: Date.now(), askPip, identity: client.identity, language: preference, detectedLanguage };
    pushRoomHistory(room, message);
    if (message.askPip) {
      const queue = (roomQueues.get(room.name) || Promise.resolve()).then(() => answerForRoom(room, message));
      roomQueues.set(room.name, queue.catch((error) => console.error('Pip queue failed:', error.message)));
    }
  });
  client.on('close', () => {
    if (!client.roomName) return;
    const room = roomState.get(client.roomName);
    if (!room) return;
    room.clients.delete(client);
    sendRoom(room.name, { type: 'presence', people: peopleIn(room) });
  });
});

app.get('/api/tokens', async (_req, res) => {
  if (!aai) return res.status(503).json({ error: 'Add ASSEMBLYAI_API_KEY to .env, then restart the server.' });
  try {
    const [stt, tts] = await Promise.all([
      aai.streaming.createTemporaryToken({ expires_in_seconds: 60 }),
      aai.tts.createTemporaryToken({ expires_in_seconds: 60 }),
    ]);
    res.set('Cache-Control', 'no-store').json({ stt, tts });
  } catch (error) {
    console.error('AssemblyAI token request failed:', error.message);
    res.status(502).json({ error: 'Could not start AssemblyAI audio. Check the server key and account access.' });
  }
});

app.post('/api/respond', async (req, res) => {
  const { messages, scenario, language = 'English' } = req.body ?? {};
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > 24) {
    return res.status(400).json({ error: 'Send between 1 and 24 conversation turns.' });
  }
  const clipped = messages.map(({ role, content }) => ({
    role: role === 'assistant' ? 'assistant' : 'user',
    content: String(content ?? '').slice(0, 1200),
  }));
  if (process.env.OPENROUTER_API_KEY) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:5173',
          'X-Title': 'Saywell Voice Practice',
        },
        body: JSON.stringify({
          model: process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini',
          temperature: 0.82,
          max_tokens: 140,
          messages: [
            { role: 'system', content: `You are playing the other person in a realistic conversation rehearsal. Scenario: ${String(scenario || 'a difficult conversation').slice(0, 180)}. Reply in ${targetLanguage(language, 'en')}. Stay in character, respond naturally in one or two short spoken sentences, ask realistic follow-up questions, and never narrate stage directions. Do not coach unless the user asks for feedback.` },
            ...clipped,
          ],
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error?.message || `OpenRouter returned ${response.status}`);
      const text = data?.choices?.[0]?.message?.content;
      if (typeof text !== 'string' || !text.trim()) throw new Error('The model returned an empty reply.');
      return res.json({ text: text.trim(), source: 'openrouter' });
    } catch (error) {
      console.error('OpenRouter request failed:', error.message);
      return res.status(502).json({ error: openRouterFailure(error, 'respond') });
    }
  }
  // A deterministic demo partner keeps the rehearsal usable while OpenRouter is unconfigured.
  const last = clipped.at(-1)?.content || '';
  const replies = [
    `I hear you. Can you tell me a little more about what would make this feel fair?`,
    `That makes sense. What would you like me to do next?`,
    `I hadn't thought of it that way. What feels like the most important part to solve first?`,
    `Thanks for being direct with me. Is there one specific change you'd like to see?`,
  ];
  const n = [...last].reduce((sum, char) => sum + char.charCodeAt(0), 0) % replies.length;
  res.json({ text: replies[n], source: 'demo' });
});

app.post('/api/coach', async (req, res) => {
  const { messages, language = 'English' } = req.body ?? {};
  if (!Array.isArray(messages) || messages.length < 2 || messages.length > 48) return res.status(400).json({ error: 'A practice needs at least two conversation turns for feedback.' });
  if (!process.env.OPENROUTER_API_KEY) return res.status(503).json({ error: 'Add OPENROUTER_API_KEY to the server .env file to get practice feedback.' });
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST', headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`, 'Content-Type': 'application/json', 'HTTP-Referer': 'http://localhost:5173', 'X-Title': 'Saywell Conversation Coach' },
      body: JSON.stringify({ model: process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini', temperature: 0.35, max_tokens: 180, messages: [
        { role: 'system', content: `You are a kind, specific conversation skills coach. Reply in ${targetLanguage(language, 'en')}. Review the user's side of this rehearsal. Give exactly three short lines with these labels: WHAT WORKED: one specific observable strength; TRY NEXT: one small actionable improvement; PRACTICE LINE: a natural sentence they can try. Be encouraging without generic praise. Do not diagnose personality.` },
        ...messages.slice(-24).map(({ role, content }) => ({ role: role === 'assistant' ? 'assistant' : 'user', content: String(content || '').slice(0, 1200) })),
      ] }),
    });
    const data = await response.json(); if (!response.ok) throw new Error(data?.error?.message || `OpenRouter returned ${response.status}`);
    const text = data?.choices?.[0]?.message?.content;
    if (typeof text !== 'string' || !text.trim()) throw new Error('The coach returned an empty reply.');
    return res.json({ text: text.trim() });
  } catch (error) { console.error('Conversation coach failed:', error.message); return res.status(502).json({ error: openRouterFailure(error, 'create practice feedback') }); }
});

app.get('/vendor/assemblyai.mjs', (_req, res) => {
  res.sendFile(path.join(root, 'node_modules/assemblyai/dist/browser.mjs'));
});

app.use(express.static(path.join(root, 'dist')));
app.get('*path', (_req, res, next) => {
  res.sendFile(path.join(root, 'dist/index.html'), (error) => {
    if (error) next();
  });
});

server.listen(port, () => console.log(`Saywell API and group chat listening on http://localhost:${port}`));
