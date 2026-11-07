import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDownRight, ArrowLeft, ArrowRight, AudioLines, Bot, Check, ChevronDown, CircleHelp, Copy, Headphones, LogOut, MessageCircle, Mic, MicOff, MoveUpRight, RotateCcw, Send, Settings2, Sparkles, Users, Volume2, VolumeX, X } from 'lucide-react';
import { TextToSpeechSession } from 'assemblyai';
import './group.css';

type Message = { role: 'user' | 'assistant'; content: string; time: string; spoken?: boolean };
type Mode = { id: string; number: string; title: string; context: string; person: string; color: string; opening: string };
const modes: Mode[] = [
  { id: 'feedback', number: '01', title: 'Ask for a raise', context: 'A thoughtful but budget-conscious manager', person: 'MARA · YOUR MANAGER', color: 'lime', opening: 'Thanks for making time. What did you want to talk about?' },
  { id: 'boundary', number: '02', title: 'Set a boundary', context: 'A close friend who keeps asking for favors', person: 'JULES · YOUR FRIEND', color: 'pink', opening: 'Hey, you sounded serious in your message. Everything okay?' },
  { id: 'interview', number: '03', title: 'Nail an interview', context: 'A curious hiring manager for your dream role', person: 'ALEX · THE INTERVIEWER', color: 'blue', opening: 'Welcome in. To start, tell me a little about yourself.' },
  { id: 'custom', number: '04', title: 'Your own scenario', context: 'A conversation you want to prepare for', person: 'YOUR SCENARIO', color: 'yellow', opening: 'I’m here. What would you like to talk through?' },
];
const voiceOptions = [
  { id: 'aai-sara', name: 'Sara', tone: 'Warm · American' },
  { id: 'aai-peter', name: 'Peter', tone: 'Grounded · American' },
  { id: 'aai-nancy', name: 'Nancy', tone: 'Clear · British' },
];
type ConversationLanguage = 'auto' | 'english' | 'spanish' | 'french' | 'german' | 'italian' | 'portuguese';
const languageOptions: { value: ConversationLanguage; label: string }[] = [
  { value: 'auto', label: 'Auto · follow me' }, { value: 'english', label: 'English' },
  { value: 'spanish', label: 'Español' }, { value: 'french', label: 'Français' },
  { value: 'german', label: 'Deutsch' }, { value: 'italian', label: 'Italiano' },
  { value: 'portuguese', label: 'Português' },
];
const detectedLanguageNames: Record<string, string> = { en: 'english', es: 'spanish', fr: 'french', de: 'german', it: 'italian', pt: 'portuguese', hi: 'Hindi', ur: 'Urdu', ar: 'Arabic', ja: 'Japanese', zh: 'Mandarin', yue: 'Cantonese', ko: 'Korean', mr: 'Marathi', ru: 'Russian', vi: 'Vietnamese', tr: 'Turkish', nl: 'Dutch', sv: 'Swedish', da: 'Danish', fi: 'Finnish', fa: 'Persian', he: 'Hebrew', no: 'Norwegian', nn: 'Norwegian Nynorsk', ro: 'Romanian', ca: 'Catalan', gl: 'Galician', et: 'Estonian', af: 'Afrikaans', xh: 'Xhosa', zu: 'Zulu' };
function LanguageControl({ value, onChange }: { value: ConversationLanguage; onChange: (value: ConversationLanguage) => void }) {
  return <label className="language-control"><span>LANGUAGE</span><select aria-label="Conversation language" value={value} onChange={(event) => onChange(event.target.value as ConversationLanguage)}>{languageOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select></label>;
}

function usePath() {
  const [path, setPath] = useState(window.location.pathname);
  useEffect(() => {
    const update = () => setPath(window.location.pathname);
    window.addEventListener('popstate', update);
    return () => window.removeEventListener('popstate', update);
  }, []);
  const navigate = (to: string) => { window.history.pushState({}, '', to); setPath(to); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  return { path, navigate };
}

function Brand({ onClick }: { onClick: () => void }) {
  return <button className="brand" onClick={onClick} aria-label="Saywell home"><span className="brand-mark"><AudioLines size={20} strokeWidth={2.5} /></span><span>saywell<span className="brand-dot">.</span></span></button>;
}

function Waveform({ className = '' }: { className?: string }) {
  const heights = [15, 27, 40, 22, 54, 31, 18, 44, 58, 24, 35, 17, 48, 29, 61, 38, 21, 47, 28, 56, 16, 34, 51, 24, 43, 19, 57, 31, 44, 18, 36, 53, 23, 45, 16, 34, 55, 28, 42, 19, 50, 31, 57, 21, 38, 48, 24, 40, 17, 54, 29, 45, 20, 36, 58, 25, 42, 18, 50, 32, 55, 21, 39, 47, 28, 53, 17, 36, 48, 23, 41, 57];
  return <div className={`wave-bars ${className}`} aria-hidden="true">{heights.map((height, i) => <span key={i} style={{ '--bar': `${height}%`, '--delay': `${(i % 12) * -0.09}s` } as React.CSSProperties} />)}</div>;
}

function Landing({ onStart, onGroup }: { onStart: () => void; onGroup: () => void }) {
  return <div className="landing">
    <header className="topbar wrap">
      <Brand onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
      <nav className="topnav"><a href="#how">How it works</a><a href="#scenarios">Scenarios</a><span className="nav-divider" /><span className="powered"><span className="live-dot" /> BUILT WITH ASSEMBLYAI</span></nav>
      <button className="button button-ink button-small" onClick={onStart}>Enter studio <ArrowRight size={16} /></button>
    </header>
    <main>
      <section className="hero wrap">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-pin" /> A voice rehearsal studio</div>
          <h1>Say it before<br />it <span className="matters-word">matters<span className="matter-star">✳</span></span></h1>
          <p className="hero-sub">Some conversations deserve a practice run. Meet the other person, find your words, and walk in feeling like you’ve been here before.</p>
          <div className="hero-actions"><button className="button button-lime" onClick={onStart}>Start a rehearsal <MoveUpRight size={17} /></button><button className="group-home-link" onClick={onGroup}><Users size={15} /> Bring everyone in <ArrowRight size={14} /></button><span className="hero-note"><span className="note-line" /> No scripts. No stakes.</span></div>
          <div className="hero-foot"><span><span className="avatar-pair"><span>R</span><span>+</span></span> A little room to find your words</span><span className="mono">01 — 04 / SCENARIOS</span></div>
        </div>
        <div className="hero-art" aria-label="Abstract illustration of a voice wave inside a sunburst">
          <div className="art-label art-label-top">VOICE NOTE 004 <span>● REC</span></div>
          <div className="art-stamp">A<br />SIDE</div>
          <div className="art-sun"><div className="sun-core"><div className="sun-eye eye-one"/><div className="sun-eye eye-two"/><div className="sun-smile"/><div className="sun-cheek cheek-one"/><div className="sun-cheek cheek-two"/></div></div>
          <div className="art-wave"><Waveform /></div>
          <div className="art-note">A pause is part<br />of the conversation.</div>
          <div className="art-label art-label-bottom"><span>00:08</span><span>●━━━━━━━──</span><span>00:24</span></div>
          <span className="art-spark spark-one">✳</span><span className="art-spark spark-two">✴</span>
        </div>
        <div className="hero-index mono">RT—01 <ArrowDownRight size={15} /></div>
      </section>
      <section className="ticker" aria-label="Saywell values"><div className="ticker-track">{Array.from({ length: 4 }, (_, i) => <span key={i}>REAL VOICES <b>✳</b> LOW PRESSURE <b>✳</b> YOUR PACE <b>✳</b> NO PERFECT ANSWERS <b>✳</b> </span>)}</div></section>
      <section className="how-section wrap" id="how">
        <div className="section-kicker"><span>01 / A BETTER KIND OF PRACTICE</span><span>TAKE A BREATH. TAKE YOUR TIME.</span></div>
        <div className="how-grid"><h2>Not another<br />chatbot in a<br /><span>voice costume.</span></h2><div className="how-copy"><p>Saywell gives you a real-feeling conversation partner, not a script to memorize. Say what comes naturally. Try again when it doesn’t.</p><div className="how-steps"><div><span className="step-number">01</span><p><b>Pick the moment</b><small>Choose a conversation that’s been on your mind.</small></p></div><div><span className="step-number">02</span><p><b>Meet your person</b><small>They’ll listen, react, and talk back out loud.</small></p></div><div><span className="step-number">03</span><p><b>Find your own words</b><small>Pause, restart, or change your mind. It’s your room.</small></p></div></div></div></div>
      </section>
      <section className="scenarios-section" id="scenarios"><div className="wrap scenarios-wrap"><div className="section-kicker"><span>02 / THE FIRST TAKE IS YOURS</span><span>SCROLL TO EXPLORE ↓</span></div><div className="scenario-heading"><h2>What’s on<br />your mind?</h2><span>There’s no wrong place<br />to start a conversation.</span></div><div className="scenario-cards">{modes.slice(0, 3).map((mode) => <article className={`scenario-card card-${mode.color}`} key={mode.id}><span className="scenario-number">{mode.number} / 03</span><div className="scenario-icon">{mode.id === 'feedback' ? <MessageCircle /> : mode.id === 'boundary' ? <Headphones /> : <Sparkles />}</div><h3>{mode.title}</h3><p>{mode.context}</p><button aria-label={`Try ${mode.title}`} onClick={onStart}><ArrowRight size={17} /></button></article>)}</div><div className="scenario-bottom"><span>ONE PERSON AT A TIME. ONE BREATH AT A TIME.</span><button className="text-link" onClick={onStart}>Find your scenario <ArrowRight size={16} /></button></div></div></section>
      <section className="closing-section wrap"><div className="closing-mark">“</div><p>You don’t need to get it perfect.<br /><em>You just need a place to begin.</em></p><button className="button button-ink" onClick={onStart}>Take a breath. Let’s practice. <ArrowRight size={17} /></button><span className="closing-caption mono">YOU’RE IN GOOD COMPANY HERE.</span></section>
    </main>
    <footer className="footer wrap"><Brand onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} /><span>Made for the words that matter.</span><span className="powered"><span className="live-dot" /> SPEECH BY ASSEMBLYAI</span><span>© SAYWELL 2026</span></footer>
  </div>;
}

function Studio({ onHome, language, setLanguage }: { onHome: () => void; language: ConversationLanguage; setLanguage: (language: ConversationLanguage) => void }) {
  const [selected, setSelected] = useState(modes[0]);
  const [voice, setVoice] = useState(voiceOptions[0]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [status, setStatus] = useState<'idle' | 'connecting' | 'listening' | 'thinking' | 'speaking' | 'error'>('idle');
  const [partial, setPartial] = useState('');
  const [config, setConfig] = useState({ assemblyReady: false, openRouterReady: false });
  const [showSettings, setShowSettings] = useState(false);
  const [showVoiceMenu, setShowVoiceMenu] = useState(false);
  const [notice, setNotice] = useState('');
  const [started, setStarted] = useState(false);
  const [muted, setMuted] = useState(false);
  const [coach, setCoach] = useState<string | null>(null);
  const [coachLoading, setCoachLoading] = useState(false);
  const mutedRef = useRef(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sttRef = useRef<WebSocket | null>(null);
  const ttsRef = useRef<TextToSpeechSession | null>(null);
  const ttsLanguageRef = useRef('english');
  const detectedLanguageRef = useRef('en');
  const languageRef = useRef(language);
  const audioRef = useRef<AudioContext | null>(null);
  const micRef = useRef<MediaStream | null>(null);
  const workletRef = useRef<AudioWorkletNode | null>(null);
  const sourcesRef = useRef(new Set<AudioBufferSourceNode>());
  const playbackAtRef = useRef(0);
  const streamingRef = useRef(false);
  const turnRef = useRef(0);
  const chatRef = useRef<Message[]>([]);
  const partialRef = useRef('');
  const audioRateRef = useRef(24000);
  const pendingRef = useRef<Int16Array[]>([]);
  const pendingCountRef = useRef(0);
  const keepAliveRef = useRef<number | undefined>(undefined);

  useEffect(() => { fetch('/api/config').then((r) => r.json()).then(setConfig).catch(() => {}); }, []);
  useEffect(() => { chatRef.current = messages; listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' }); }, [messages, partial]);
  useEffect(() => { partialRef.current = partial; }, [partial]);
  useEffect(() => { languageRef.current = language; }, [language]);
  useEffect(() => () => { cleanup(); }, []);

  function flash(text: string) { setNotice(text); window.setTimeout(() => setNotice(''), 4200); }
  function append(role: Message['role'], content: string, spoken = false) {
    setMessages((current) => [...current, { role, content, spoken, time: new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit' }).format(new Date()) }]);
  }
  function cleanup() {
    if (keepAliveRef.current !== undefined) window.clearInterval(keepAliveRef.current);
    keepAliveRef.current = undefined;
    try { if (sttRef.current?.readyState === WebSocket.OPEN) sttRef.current.send(JSON.stringify({ type: 'Terminate' })); } catch { /* socket already closed */ }
    sttRef.current?.close(); sttRef.current = null;
    void ttsRef.current?.close().catch(() => {}); ttsRef.current = null;
    workletRef.current?.disconnect(); workletRef.current = null;
    micRef.current?.getTracks().forEach((track) => track.stop()); micRef.current = null;
    sourcesRef.current.forEach((source) => { try { source.stop(); } catch { /* already ended */ } }); sourcesRef.current.clear();
    void audioRef.current?.close(); audioRef.current = null;
    streamingRef.current = false; playbackAtRef.current = 0;
  }
  function keepTtsSessionAlive(session: TextToSpeechSession) {
    if (keepAliveRef.current !== undefined) window.clearInterval(keepAliveRef.current);
    keepAliveRef.current = window.setInterval(() => {
      try { session.keepAlive(); } catch { /* session has already closed */ }
    }, 60_000);
  }
  async function useTtsLanguage(languageName: string, token?: string) {
    if (ttsRef.current && ttsLanguageRef.current === languageName) return ttsRef.current;
    if (ttsRef.current) { try { await ttsRef.current.close(); } catch { /* session may already be closed */ } }
    const resolvedToken = token || (await getTokens()).tts;
    const session = new TextToSpeechSession({ token: resolvedToken, modelId: 'assemblyai-tts-1', voiceId: voice.id, language: languageName });
    await session.connect(); ttsRef.current = session; ttsLanguageRef.current = languageName; keepTtsSessionAlive(session);
    const sampleRate = (session as unknown as { begin?: { configuration?: { sample_rate?: number } } }).begin?.configuration?.sample_rate;
    if (sampleRate) audioRateRef.current = sampleRate;
    return session;
  }
  function speechLanguage(detectedCode = 'en') {
    if (languageRef.current !== 'auto') return languageRef.current;
    const detected = detectedLanguageNames[detectedCode] || 'english';
    return languageOptions.some((option) => option.value === detected) ? detected : null;
  }
  function stopSpeech(interrupted = false) {
    if (interrupted) turnRef.current++;
    try { ttsRef.current?.cancel(); } catch { /* session can close during cancel */ }
    sourcesRef.current.forEach((source) => { try { source.stop(); } catch { /* already ended */ } }); sourcesRef.current.clear();
    playbackAtRef.current = audioRef.current?.currentTime ?? 0;
    streamingRef.current = false;
    setStatus(sttRef.current?.readyState === WebSocket.OPEN ? 'listening' : 'idle');
  }
  function playChunk(bytes: Int16Array) {
    const ctx = audioRef.current; if (!ctx) return;
    const buffer = ctx.createBuffer(1, bytes.length, audioRateRef.current);
    const channel = buffer.getChannelData(0);
    for (let i = 0; i < bytes.length; i++) channel[i] = bytes[i] / 32768;
    const source = ctx.createBufferSource(); source.buffer = buffer; source.connect(ctx.destination);
    playbackAtRef.current = Math.max(playbackAtRef.current, ctx.currentTime);
    source.start(playbackAtRef.current); playbackAtRef.current += buffer.duration;
    sourcesRef.current.add(source); source.onended = () => { sourcesRef.current.delete(source); if (!sourcesRef.current.size && !streamingRef.current) setStatus(sttRef.current?.readyState === WebSocket.OPEN ? 'listening' : 'idle'); };
  }
  async function speak(text: string, session = ttsRef.current) {
    if (!session) { setStatus('idle'); return; }
    streamingRef.current = true; setStatus('speaking');
    try {
      for await (const chunk of session.speak(text)) {
        if (chunk instanceof Int16Array) playChunk(chunk);
        else if (chunk instanceof ArrayBuffer) playChunk(new Int16Array(chunk));
        else if (ArrayBuffer.isView(chunk)) playChunk(new Int16Array(chunk.buffer.slice(chunk.byteOffset, chunk.byteOffset + chunk.byteLength)));
      }
    } catch (error) {
      if (streamingRef.current) flash(error instanceof Error ? error.message : 'Speech playback stopped.');
    } finally {
      streamingRef.current = false;
      if (!sourcesRef.current.size) setStatus(sttRef.current?.readyState === WebSocket.OPEN ? 'listening' : 'idle');
    }
  }
  async function getTokens() {
    const response = await fetch('/api/tokens'); const body = await response.json();
    if (!response.ok) throw new Error(body.error || 'Could not connect to AssemblyAI.');
    return body as { stt: string; tts: string };
  }
  async function refreshSetup() {
    try {
      const response = await fetch('/api/config', { cache: 'no-store' });
      const fresh = await response.json(); setConfig(fresh);
      if (fresh.assemblyReady) { setShowSettings(false); flash('AssemblyAI is ready. Start a voice rehearsal when you are.'); }
      else flash('AssemblyAI key not found yet. Add it to .env and restart the server.');
    } catch { flash('Could not reach the local app server. Start it with npm run dev.'); }
  }
  async function connectVoice() {
    if (status === 'connecting' || status === 'listening' || status === 'speaking' || status === 'thinking') { cleanup(); setStatus('idle'); return; }
    setStatus('connecting');
    try {
      if (!navigator.mediaDevices?.getUserMedia || !window.AudioWorkletNode) throw new Error('Voice practice needs a modern browser and microphone permission.');
      const tokens = await getTokens();
      const ctx = new AudioContext(); audioRef.current = ctx; await ctx.resume();
      await ctx.audioWorklet.addModule('/pcm-worklet.js');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, echoCancellation: true, autoGainControl: true } }); micRef.current = stream;
      const worklet = new AudioWorkletNode(ctx, 'pcm-worklet'); workletRef.current = worklet;
      ctx.createMediaStreamSource(stream).connect(worklet);
      const tts = await useTtsLanguage(speechLanguage(detectedLanguageRef.current) || 'english', tokens.tts);
      const rate = (tts as unknown as { begin?: { configuration?: { sample_rate?: number } } }).begin?.configuration?.sample_rate;
      if (rate) audioRateRef.current = rate;
      const params = new URLSearchParams({ speech_model: 'universal-3-6-pro', encoding: 'pcm_s16le', sample_rate: '16000', language_detection: 'true', token: tokens.stt });
      const socket = new WebSocket(`wss://streaming.assemblyai.com/v3/ws?${params}`); sttRef.current = socket;
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'Begin') {
          setStatus('listening');
        worklet.port.onmessage = (message) => {
          if (mutedRef.current) return;
            const samples = new Int16Array(message.data); pendingRef.current.push(samples); pendingCountRef.current += samples.length;
            if (pendingCountRef.current < 1600 || socket.readyState !== WebSocket.OPEN) return;
            const packet = new Int16Array(pendingCountRef.current); let offset = 0;
            for (const block of pendingRef.current) { packet.set(block, offset); offset += block.length; }
            pendingRef.current = []; pendingCountRef.current = 0; socket.send(packet.buffer);
          };
          if (!started) { setStarted(true); append('assistant', selected.opening, true); void speak(selected.opening, tts); }
        }
        if (data.type === 'Turn') {
          if (data.language_code) detectedLanguageRef.current = String(data.language_code);
          const transcript = String(data.transcript || '').trim(); setPartial(transcript);
          if (streamingRef.current && transcript.split(/\s+/).filter(Boolean).length >= 2) stopSpeech(true);
          if (data.end_of_turn && transcript) { setPartial(''); void sendTurn(transcript, detectedLanguageRef.current); }
        }
        if (data.type === 'Termination') { cleanup(); setStatus('idle'); }
        if (data.type === 'Error') { cleanup(); setStatus('error'); flash(data.error || 'AssemblyAI audio connection error.'); }
      };
      socket.onerror = () => { setStatus('error'); flash('Could not connect to AssemblyAI streaming audio.'); };
      socket.onclose = (event) => { if (event.code !== 1000) { cleanup(); setStatus('error'); flash(`Voice connection closed (${event.code}).`); } };
    } catch (error) { cleanup(); setStatus('error'); flash(error instanceof Error ? error.message : 'Could not start voice practice.'); }
  }

  async function sendTurn(raw: string, detectedCode = 'en') {
    const content = raw.trim(); if (!content) return;
    turnRef.current++; const turn = turnRef.current;
    append('user', content); setPartial(''); setStatus('thinking');
    const history = [...chatRef.current, { role: 'user' as const, content, time: '' }].map(({ role, content: message }) => ({ role, content: message }));
    try {
      const selectedLanguage = languageRef.current === 'auto' ? (detectedLanguageNames[detectedCode] || 'English') : languageRef.current;
      const response = await fetch('/api/respond', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ scenario: selected.context, messages: history, language: selectedLanguage }) });
      const body = await response.json(); if (!response.ok) throw new Error(body.error || 'The conversation partner could not answer.');
      if (turn !== turnRef.current) return;
      if (body.source === 'demo') flash('Demo partner · add an OpenRouter key for a more adaptive conversation.');
      const spokenLanguage = speechLanguage(detectedCode);
      append('assistant', body.text, Boolean(config.assemblyReady && spokenLanguage));
      if (config.assemblyReady && spokenLanguage) {
        if (!audioRef.current) { audioRef.current = new AudioContext(); await audioRef.current.resume(); }
        await useTtsLanguage(spokenLanguage);
        await speak(body.text);
      } else if (!spokenLanguage) { setStatus(sttRef.current?.readyState === WebSocket.OPEN ? 'listening' : 'idle'); flash('I followed your language in text. AssemblyAI-TTS-1 voice is available in English, Spanish, French, German, Italian, and Portuguese.'); }
      else setStatus(sttRef.current?.readyState === WebSocket.OPEN ? 'listening' : 'idle');
    } catch (error) { setStatus(sttRef.current?.readyState === WebSocket.OPEN ? 'listening' : 'error'); flash(error instanceof Error ? error.message : 'Could not get a response.'); }
  }
  function sendDraft(event: React.FormEvent) { event.preventDefault(); if (!draft.trim()) return; const content = draft; setDraft(''); void sendTurn(content); }
  async function beginScenario(mode = selected) {
    let ready = config;
    if (!ready.assemblyReady) {
      try { const response = await fetch('/api/config', { cache: 'no-store' }); ready = await response.json(); setConfig(ready); } catch { /* setup dialog explains how to start the server */ }
    }
    if (!ready.assemblyReady) { setShowSettings(true); return; }
    if (mode.id !== selected.id) { setSelected(mode); setMessages([]); setStarted(false); chatRef.current = []; }
    setTimeout(() => { void connectVoice(); }, 0);
  }
  async function requestCoach() {
    if (coachLoading || chatRef.current.filter((message) => message.role === 'user').length < 2) return;
    setCoachLoading(true);
    try {
      const target = language === 'auto' ? (detectedLanguageNames[detectedLanguageRef.current] || 'English') : language;
      const response = await fetch('/api/coach', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: chatRef.current.map(({ role, content }) => ({ role, content })), language: target }) });
      const body = await response.json(); if (!response.ok) throw new Error(body.error || 'Could not get practice feedback.');
      setCoach(body.text);
    } catch (error) { flash(error instanceof Error ? error.message : 'Could not get practice feedback.'); }
    finally { setCoachLoading(false); }
  }
  function resetSession() { cleanup(); setMessages([]); setStarted(false); setPartial(''); setStatus('idle'); chatRef.current = []; turnRef.current++; }

  const statusLabel = useMemo(() => ({ idle: 'ready when you are', connecting: 'setting the room...', listening: 'your turn', thinking: 'finding the words...', speaking: 'speaking', error: 'needs a moment' }[status]), [status]);
  return <div className="studio-page">
    <header className="studio-header"><div className="studio-header-inner"><div className="studio-brand-row"><button className="back-button" onClick={onHome} aria-label="Back home"><ArrowLeft size={18} /></button><Brand onClick={onHome} /><span className="studio-divider" /><span className="studio-label">THE PRACTICE ROOM</span></div><div className="studio-header-right"><span className={`connection-pill ${config.assemblyReady ? 'is-ready' : ''}`}><span className="live-dot" /> {config.assemblyReady ? 'ASSEMBLYAI READY' : 'SETUP NEEDED'}</span><button className="icon-button" aria-label="Settings" onClick={() => setShowSettings(true)}><Settings2 size={18} /></button></div></div></header>
    <main className="studio-layout">
      <aside className="studio-rail">
        <div className="rail-intro"><span className="mono">ROOM 01 / PRIVATE</span><h1>A little<br />room to<br /><em>practice.</em></h1><p>Your mic stays off until<br />you choose to talk.</p></div>
        <div className="scenario-selector"><div className="rail-label"><span>CHOOSE A CONVERSATION</span><span>01—04</span></div>{modes.map((mode) => <button key={mode.id} className={`mode-row ${selected.id === mode.id ? 'selected' : ''}`} onClick={() => { if (selected.id !== mode.id) { resetSession(); setSelected(mode); } }}><span className="mode-index mono">{mode.number}</span><span className="mode-info"><b>{mode.title}</b><small>{mode.context}</small></span>{selected.id === mode.id && <span className="mode-check"><Check size={13} /></span>}</button>)}
        </div>
        <div className="rail-note"><div className="note-stamp"><Sparkles size={15} /></div><p><b>A note to self</b><br />You’re allowed to pause.<br />You’re allowed to begin again.</p><span>✳</span></div>
        <div className="rail-footer mono"><span>MADE FOR REAL LIFE</span><span>RT—01</span></div>
      </aside>
      <section className="conversation-panel">
        <div className="conversation-top"><div className="conversation-person"><div className={`person-avatar avatar-${selected.color}`}><span>{selected.person[0]}</span><i /></div><div><span className="person-name">{selected.person}</span><span className="person-sub">{selected.context}</span></div></div><div className="conversation-tools"><LanguageControl value={language} onChange={setLanguage}/><div className="voice-select-wrap"><button className="voice-select" onClick={() => setShowVoiceMenu(!showVoiceMenu)}><Volume2 size={15} /><span>{voice.name}</span><ChevronDown size={14} /></button>{showVoiceMenu && <div className="voice-menu">{voiceOptions.map((option) => <button key={option.id} onClick={() => { setVoice(option); setShowVoiceMenu(false); if (ttsRef.current) { flash('Voice changes apply to the next practice. Restart to hear it.'); } }}><span><b>{option.name}</b><small>{option.tone}</small></span>{voice.id === option.id && <Check size={14} />}</button>)}</div>}</div><button className="icon-button" aria-label="Reset conversation" onClick={resetSession}><RotateCcw size={16} /></button></div></div>
        <div className={`room-status room-${status}`}><span className="status-orb"><span /></span><span>{statusLabel}</span><span className="room-status-line" /><span className="mono">{status === 'listening' ? 'MIC ON' : status === 'speaking' ? 'SAYWELL' : 'TAKE YOUR TIME'}</span></div>
        <div className="conversation-log" ref={listRef}>
          {!messages.length && <div className="empty-state"><div className="empty-art"><div className="empty-orbit orbit-a"/><div className="empty-orbit orbit-b"/><div className="empty-center"><AudioLines size={30} /></div><span className="empty-star">✳</span></div><span className="empty-eyebrow mono">A QUIET PLACE TO START</span><h2>Where do you<br />want to begin?</h2><p>Your conversation partner is here when you’re ready.<br />Talk out loud or type a first line.</p><button className="button button-lime mic-start" onClick={() => beginScenario()}><Mic size={17} /> Start with your voice</button><span className="empty-small mono">YOUR MIC IS ONLY ON DURING A SESSION</span></div>}
          {messages.map((message, index) => <div key={`${message.time}-${index}`} className={`message-row ${message.role === 'user' ? 'from-you' : 'from-them'}`}><div className={`message-avatar ${message.role === 'assistant' ? `avatar-${selected.color}` : 'avatar-you'}`}>{message.role === 'assistant' ? selected.person[0] : 'Y'}</div><div className="message-content"><div className="message-meta"><span>{message.role === 'user' ? 'YOU' : selected.person}</span><span>{message.time}</span></div><div className="message-bubble">{message.content}{message.spoken && <span className="spoken-mark"><AudioLines size={13} /> SPOKEN BY ASSEMBLYAI-TTS-1</span>}</div></div></div>)}
          {partial && <div className="message-row from-you partial-row"><div className="message-avatar avatar-you">Y</div><div className="message-content"><div className="message-meta"><span>YOU · LIVE TRANSCRIPT</span><span><span className="live-dot" /> NOW</span></div><div className="message-bubble">{partial}<span className="cursor-blink">▍</span></div></div></div>}
          {status === 'thinking' && <div className="message-row from-them"><div className={`message-avatar avatar-${selected.color}`}>{selected.person[0]}</div><div className="thinking-bubble"><span/><span/><span/></div></div>}
        </div>
        <div className="composer-wrap"><div className="composer-top"><span>{status === 'listening' ? <><span className="live-dot" /> LISTENING · ASSEMBLYAI REALTIME</> : status === 'speaking' ? <><AudioLines size={13} /> SPEAKING · ASSEMBLYAI TTS</> : status === 'thinking' ? 'A MOMENT, PLEASE' : 'THIS ROOM IS JUST YOURS'}</span><button className="help-button" onClick={() => flash('AssemblyAI processes audio for transcription and speech. Replies use OpenRouter when configured. Press End practice whenever you like.')}><CircleHelp size={14} /> How it works</button></div>
          {status === 'listening' || status === 'speaking' || status === 'thinking' ? <div className="active-composer"><button className={`live-mic ${muted ? 'is-muted' : ''}`} onClick={() => { const next = !muted; mutedRef.current = next; micRef.current?.getAudioTracks().forEach((track) => { track.enabled = !next; }); setMuted(next); }} aria-label={muted ? 'Resume microphone' : 'Pause microphone'}>{muted ? <MicOff size={19} /> : <Mic size={19} />}</button><div className="active-wave"><Waveform className={status === 'listening' ? 'wave-listen' : ''} /><span>{muted ? 'MIC PAUSED' : status === 'thinking' ? 'A LITTLE THINKING SPACE' : status === 'speaking' ? 'TAP TO INTERRUPT' : 'GO AHEAD — I’M LISTENING'}</span></div><button className="end-button" onClick={() => { cleanup(); setStatus('idle'); setMuted(false); mutedRef.current = false; }}>End practice <X size={15} /></button></div> : <form className="text-composer" onSubmit={sendDraft}><input ref={inputRef} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Or start with a line…" aria-label="Write the first line" /><button className="send-button" disabled={!draft.trim()} aria-label="Send message"><Send size={17} /></button><button type="button" className="composer-mic" onClick={() => beginScenario()} aria-label="Start voice practice"><Mic size={17} /><span>VOICE</span></button></form>}
          <div className="composer-foot"><span>REAL CONVERSATION · MADE FOR YOU</span><span><span className="privacy-mark">◈</span> AUDIO PROCESSED BY ASSEMBLYAI</span></div></div>
        <div className="conversation-endcap"><span>✳</span> YOU’RE DOING JUST FINE. <span>✳</span>{messages.filter((message) => message.role === 'user').length >= 2 && <button className="reflect-button" onClick={() => void requestCoach()} disabled={coachLoading}>{coachLoading ? 'FINDING YOUR NEXT STEP…' : 'REFLECT ON THIS TAKE'} <Sparkles size={13}/></button>}</div>
      </section>
    </main>
    {coach && <div className="settings-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setCoach(null); }}><section className="settings-dialog coach-dialog" role="dialog" aria-modal="true" aria-labelledby="coach-title"><button className="dialog-close" onClick={() => setCoach(null)} aria-label="Close feedback"><X size={18}/></button><span className="dialog-kicker mono">SAYWELL / PRACTICE NOTES</span><h2 id="coach-title">Keep what<br/>worked.</h2><p>A small reflection from this rehearsal, based on the words you tried.</p><div className="coach-notes">{coach.split(/\n+/).filter(Boolean).map((line, index) => <div key={index}><span>0{index + 1}</span><p>{line}</p></div>)}</div><button className="button button-ink dialog-done" onClick={() => setCoach(null)}>Back to the conversation <ArrowRight size={15}/></button></section></div>}\n    {showSettings && <div className="settings-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setShowSettings(false); }}><section className="settings-dialog" role="dialog" aria-modal="true" aria-labelledby="setup-title"><button className="dialog-close" onClick={() => setShowSettings(false)} aria-label="Close setup"><X size={18} /></button><span className="dialog-kicker mono">SAYWELL / SETUP</span><h2 id="setup-title">Give your room<br />a voice.</h2><p>Your API keys live on this server in <code>.env</code>. The browser receives short-lived AssemblyAI tokens only—never your key. Audio is sent to AssemblyAI for transcription and speech; conversation replies go to OpenRouter when configured.</p><div className="setup-status"><span className={config.assemblyReady ? 'ready' : ''}><span className="setup-dot" /> AssemblyAI TTS + Realtime {config.assemblyReady ? 'connected' : 'key needed'}</span><span className={config.openRouterReady ? 'ready' : ''}><span className="setup-dot" /> OpenRouter {config.openRouterReady ? 'connected' : 'demo partner active'}</span></div><div className="env-sample"><span>YOUR .env FILE</span><pre>ASSEMBLYAI_API_KEY=your_key_here{`\n`}OPENROUTER_API_KEY=your_key_here</pre></div><a className="setup-link" href="https://www.assemblyai.com/app" target="_blank" rel="noreferrer">Get an AssemblyAI key <MoveUpRight size={14} /></a><div className="setup-actions"><button className="button button-ink dialog-done" onClick={() => setShowSettings(false)}>Got it <Check size={16} /></button><button className="refresh-setup" onClick={() => void refreshSetup()}>Check connection <RotateCcw size={13} /></button></div></section></div>}
    {notice && <div className="notice-toast"><span className="notice-star">✳</span>{notice}<button onClick={() => setNotice('')} aria-label="Dismiss"><X size={15} /></button></div>}
    <div className="studio-mobile-footer"><button onClick={onHome}><ArrowLeft size={15} /> BACK TO HOME</button><span>SAYWELL · RT—01</span></div>
  </div>;
}

type GroupMessage = { type: 'chat'; id: string; identity?: string; name: string; text: string; at: number; assistant?: boolean; askPip?: boolean; language?: ConversationLanguage; detectedLanguage?: string };
type RoomPerson = { id: string; name: string };
type GroupVoiceStatus = 'idle' | 'connecting' | 'listening' | 'thinking' | 'speaking' | 'error';

function GroupRoom({ onHome, roomFromPath, language, setLanguage }: { onHome: () => void; roomFromPath: string; language: ConversationLanguage; setLanguage: (language: ConversationLanguage) => void }) {
  const [roomName, setRoomName] = useState(roomFromPath || new URLSearchParams(window.location.search).get('room') || '');
  const [displayName, setDisplayName] = useState(localStorage.getItem('saywell-name') || '');
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [participants, setParticipants] = useState<RoomPerson[]>([]);
  const [draft, setDraft] = useState('');
  const [pipVoice, setPipVoice] = useState(true);
  const [voiceStatus, setVoiceStatus] = useState<GroupVoiceStatus>('idle');
  const [voicePartial, setVoicePartial] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [notice, setNotice] = useState('');
  const [copyLabel, setCopyLabel] = useState('Copy invite');
  const [config, setConfig] = useState({ assemblyReady: false, openRouterReady: false, groupChatReady: true, pipVoice: 'aai-sara' });
  const pipVoiceRef = useRef(pipVoice);
  const configRef = useRef(config);
  const messagesRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const identityRef = useRef('');
  const ttsRef = useRef<TextToSpeechSession | null>(null);
  const detectedLanguageRef = useRef('en');
  const sttRef = useRef<WebSocket | null>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const micRef = useRef<MediaStream | null>(null);
  const workletRef = useRef<AudioWorkletNode | null>(null);
  const sourcesRef = useRef(new Set<AudioBufferSourceNode>());
  const playbackAtRef = useRef(0);
  const pendingPcmRef = useRef<Int16Array[]>([]);
  const pendingPcmCountRef = useRef(0);
  const [isJoined, setIsJoined] = useState(false);

  useEffect(() => { fetch('/api/config', { cache: 'no-store' }).then((r) => r.json()).then(setConfig).catch(() => {}); }, []);
  useEffect(() => { pipVoiceRef.current = pipVoice; }, [pipVoice]);
  useEffect(() => { configRef.current = config; }, [config]);
  useEffect(() => { messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: 'smooth' }); }, [messages]);
  useEffect(() => () => { stopGroupVoice(false); socketRef.current?.close(); socketRef.current = null; void ttsRef.current?.close().catch(() => {}); void audioRef.current?.close(); }, []);
  useEffect(() => { if (roomFromPath) setRoomName(roomFromPath); }, [roomFromPath]);

  function showNotice(text: string) { setNotice(text); window.setTimeout(() => setNotice(''), 4200); }
  async function speakPip(text: string, preference: ConversationLanguage = language, detectedCode = 'en') {
    if (!pipVoiceRef.current || !configRef.current.assemblyReady) return;
    const selectedLanguage = preference === 'auto' ? (detectedLanguageNames[detectedCode] || 'english') : preference;
    if (!languageOptions.some((option) => option.value === selectedLanguage)) { showNotice(`${selectedLanguage} text is ready. Pip voice replies use AssemblyAI-TTS-1’s six supported languages.`); return; }
    try {
      if (sttRef.current?.readyState === WebSocket.OPEN) setVoiceStatus('speaking');
      const response = await fetch('/api/tokens');
      const tokens = await response.json();
      if (!response.ok) throw new Error(tokens.error || 'AssemblyAI TTS is not available.');
      const context = audioRef.current || new AudioContext(); audioRef.current = context; await context.resume();
      const session = new TextToSpeechSession({ token: tokens.tts, modelId: 'assemblyai-tts-1', voiceId: configRef.current.pipVoice, language: selectedLanguage }); ttsRef.current = session;
      await session.connect();
      const sampleRate = (session as unknown as { begin?: { configuration?: { sample_rate?: number } } }).begin?.configuration?.sample_rate || 24000;
      for await (const chunk of session.speak(text)) {
        const samples = chunk instanceof Int16Array ? chunk : chunk instanceof ArrayBuffer ? new Int16Array(chunk) : ArrayBuffer.isView(chunk) ? new Int16Array(chunk.buffer.slice(chunk.byteOffset, chunk.byteOffset + chunk.byteLength)) : null;
        if (!samples?.length) continue;
        const buffer = context.createBuffer(1, samples.length, sampleRate); const channel = buffer.getChannelData(0);
        for (let index = 0; index < samples.length; index++) channel[index] = samples[index] / 32768;
        const source = context.createBufferSource(); source.buffer = buffer; source.connect(context.destination);
        playbackAtRef.current = Math.max(playbackAtRef.current, context.currentTime); source.start(playbackAtRef.current); playbackAtRef.current += buffer.duration;
        sourcesRef.current.add(source);
        source.onended = () => { sourcesRef.current.delete(source); if (!sourcesRef.current.size && sttRef.current?.readyState === WebSocket.OPEN) setVoiceStatus('listening'); };
      }
      await session.close(); if (ttsRef.current === session) ttsRef.current = null;
      if (!sourcesRef.current.size && sttRef.current?.readyState === WebSocket.OPEN) setVoiceStatus('listening');
    } catch (error) { if (sttRef.current?.readyState === WebSocket.OPEN) setVoiceStatus('listening'); showNotice(error instanceof Error ? error.message : 'Pip could not speak that reply.'); }
  }
  function interruptPipSpeech() {
    try { ttsRef.current?.cancel(); } catch { /* the speech session may already be closing */ }
    sourcesRef.current.forEach((source) => { try { source.stop(); } catch { /* already ended */ } });
    sourcesRef.current.clear(); playbackAtRef.current = audioRef.current?.currentTime ?? 0;
  }
  function stopGroupVoice(updateUI = true) {
    const socket = sttRef.current; sttRef.current = null;
    try { if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ type: 'Terminate' })); } catch { /* the stream may already be closed */ }
    socket?.close();
    workletRef.current?.disconnect(); workletRef.current = null;
    micRef.current?.getTracks().forEach((track) => track.stop()); micRef.current = null;
    pendingPcmRef.current = []; pendingPcmCountRef.current = 0;
    interruptPipSpeech();
    if (updateUI) { setVoicePartial(''); setVoiceStatus('idle'); }
  }
  async function toggleGroupVoice() {
    if (voiceStatus !== 'idle' && voiceStatus !== 'error') { stopGroupVoice(); return; }
    if (!config.assemblyReady) { showNotice('Add ASSEMBLYAI_API_KEY to the server .env file, then restart Saywell.'); return; }
    setVoiceStatus('connecting');
    try {
      if (!navigator.mediaDevices?.getUserMedia || !window.AudioWorkletNode) throw new Error('Voice chat needs a modern browser and microphone permission.');
      const response = await fetch('/api/tokens'); const tokens = await response.json();
      if (!response.ok) throw new Error(tokens.error || 'Could not start AssemblyAI voice.');
      const context = audioRef.current || new AudioContext(); audioRef.current = context; await context.resume();
      await context.audioWorklet.addModule('/pcm-worklet.js');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, echoCancellation: true, autoGainControl: true } }); micRef.current = stream;
      const worklet = new AudioWorkletNode(context, 'pcm-worklet'); workletRef.current = worklet;
      context.createMediaStreamSource(stream).connect(worklet);
      const params = new URLSearchParams({ speech_model: 'universal-3-6-pro', encoding: 'pcm_s16le', sample_rate: '16000', language_detection: 'true', token: tokens.stt });
      const sttSocket = new WebSocket(`wss://streaming.assemblyai.com/v3/ws?${params}`); sttRef.current = sttSocket;
      worklet.port.onmessage = (event) => {
        if (sttSocket.readyState !== WebSocket.OPEN) return;
        const samples = new Int16Array(event.data); pendingPcmRef.current.push(samples); pendingPcmCountRef.current += samples.length;
        if (pendingPcmCountRef.current < 1600) return;
        const packet = new Int16Array(pendingPcmCountRef.current); let offset = 0;
        for (const block of pendingPcmRef.current) { packet.set(block, offset); offset += block.length; }
        pendingPcmRef.current = []; pendingPcmCountRef.current = 0; sttSocket.send(packet.buffer);
      };
      sttSocket.onmessage = (event) => {
        let data: { type?: string; transcript?: string; end_of_turn?: boolean; error?: string; language_code?: string };
        try { data = JSON.parse(String(event.data)); } catch { return; }
        if (data.type === 'Begin') setVoiceStatus('listening');
        if (data.type === 'Turn') {
          if (data.language_code) detectedLanguageRef.current = data.language_code;
          const transcript = String(data.transcript || '').trim(); setVoicePartial(transcript);
          if (sourcesRef.current.size && transcript.split(/\s+/).filter(Boolean).length >= 2) interruptPipSpeech();
          if (data.end_of_turn && transcript) {
            setVoicePartial(''); setVoiceStatus('thinking');
            const roomSocket = socketRef.current;
            if (roomSocket?.readyState === WebSocket.OPEN) roomSocket.send(JSON.stringify({ type: 'chat', text: transcript, askPip: true, language, detectedLanguage: detectedLanguageRef.current }));
            else { setVoiceStatus('error'); showNotice('The shared room disconnected. Rejoin and try your voice message again.'); }
          }
        }
        if (data.type === 'Error') { stopGroupVoice(); setVoiceStatus('error'); showNotice(data.error || 'AssemblyAI could not process the microphone audio.'); }
        if (data.type === 'Termination' && sttRef.current === sttSocket) stopGroupVoice();
      };
      sttSocket.onerror = () => { stopGroupVoice(); setVoiceStatus('error'); showNotice('Could not connect to AssemblyAI Realtime.'); };
      sttSocket.onclose = (event) => { if (event.code !== 1000 && sttRef.current === sttSocket) { stopGroupVoice(); setVoiceStatus('error'); showNotice(`Voice connection closed (${event.code}).`); } };
    } catch (error) { stopGroupVoice(); setVoiceStatus('error'); showNotice(error instanceof Error ? error.message : 'Could not start group voice.'); }
  }
  async function joinRoom(event: React.FormEvent) {
    event.preventDefault();
    const cleanRoom = roomName.trim().replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 48);
    const cleanName = displayName.trim().slice(0, 32);
    if (!cleanRoom || !cleanName || connecting) return;
    setConnecting(true);
    try {
      localStorage.setItem('saywell-name', cleanName);
      if (config.assemblyReady && !audioRef.current) audioRef.current = new AudioContext();
      if (audioRef.current) void audioRef.current.resume();
      const socket = new WebSocket(`${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`);
      socketRef.current = socket;
      socket.onopen = () => socket.send(JSON.stringify({ type: 'join', room: cleanRoom, name: cleanName }));
      socket.onmessage = (event) => {
        let packet: { type: string; room?: string; identity?: string; message?: string; history?: GroupMessage[]; people?: RoomPerson[]; name?: string; text?: string; at?: number; id?: string; assistant?: boolean; askPip?: boolean; language?: ConversationLanguage; detectedLanguage?: string };
        try { packet = JSON.parse(String(event.data)); } catch { return; }
        if (packet.type === 'error') { showNotice(packet.message || 'Could not join the group room.'); setConnecting(false); socket.close(); return; }
        if (packet.type === 'joined') {
          identityRef.current = packet.identity || '';
          setMessages(packet.history || []); setParticipants(packet.people || []); setRoomName(cleanRoom); setIsJoined(true); setConnecting(false);
          window.history.replaceState({}, '', `/room/${encodeURIComponent(cleanRoom)}`);
          showNotice('You’re in. Share the room link and bring your people along.'); return;
        }
        if (packet.type === 'presence') { setParticipants(packet.people || []); return; }
        if (packet.type === 'chat' && packet.id && packet.name && packet.text) {
          const message: GroupMessage = { type: 'chat', id: packet.id, identity: packet.identity, name: packet.name, text: packet.text, at: packet.at || Date.now(), assistant: packet.assistant, askPip: packet.askPip, language: packet.language, detectedLanguage: packet.detectedLanguage };
          setMessages((current) => current.some((item) => item.id === message.id) ? current : [...current, message]);
          if (message.assistant) void speakPip(message.text, message.language || 'auto', message.detectedLanguage || 'en');
        }
      };
      socket.onerror = () => { setConnecting(false); showNotice('Could not connect to group chat. Check that the Saywell server is running.'); };
      socket.onclose = () => { if (socketRef.current === socket) { socketRef.current = null; identityRef.current = ''; setIsJoined(false); setParticipants([]); } };
      setRoomName(cleanRoom);
    } catch (error) {
      showNotice(error instanceof Error ? error.message : 'Could not join this room.');
      setConnecting(false);
    } finally { setConnecting(false); }
  }
  async function sendMessage(event: React.FormEvent, askPip = false) {
    event.preventDefault();
    const text = draft.trim();
    const socket = socketRef.current;
    if (!text || !socket || socket.readyState !== WebSocket.OPEN) { if (text) showNotice('This room connection closed. Rejoin to continue.'); return; }
    setDraft('');
    socket.send(JSON.stringify({ type: 'chat', text, askPip, language, detectedLanguage: 'en' }));
    if (askPip) showNotice('Pip is thinking with the group.');
  }
  async function copyInvite() {
    const link = `${window.location.origin}/room/${encodeURIComponent(roomName)}`;
    try { await navigator.clipboard.writeText(link); setCopyLabel('Copied!'); window.setTimeout(() => setCopyLabel('Copy invite'), 1800); }
    catch { showNotice(`Share this link: ${link}`); }
  }
  function leaveRoom() { socketRef.current?.close(); socketRef.current = null; identityRef.current = ''; setIsJoined(false); setParticipants([]); }

  if (!isJoined) return <div className="group-page group-lobby">
    <header className="studio-header"><div className="studio-header-inner"><div className="studio-brand-row"><button className="back-button" onClick={onHome} aria-label="Back home"><ArrowLeft size={18} /></button><Brand onClick={onHome} /><span className="studio-divider" /><span className="studio-label">THE COMMON ROOM</span></div><span className="group-built"><span className="live-dot" /> LIVE GROUP CHAT · PIP VOICE BY ASSEMBLYAI</span></div></header>
    <main className="group-lobby-content"><div className="group-lobby-art"><div className="group-orbit orbit-one"/><div className="group-orbit orbit-two"/><div className="group-sun"><span>✳</span><i>pip</i></div><div className="group-float float-left"><Users size={16}/><span>YOUR PEOPLE</span></div><div className="group-float float-right"><AudioLines size={17}/><span>ONE ROOM</span></div><div className="group-art-caption mono">SAYWELL / A PLACE TO THINK OUT LOUD</div></div>
      <div className="group-lobby-copy"><span className="mono group-kicker">ROOM 02 / TOGETHER</span><h1>Good ideas<br />sound better<br /><em>together.</em></h1><p>Bring your people into a shared chat. Work through the context together, then ask Pip to help find a useful next step.</p><form className="group-join-form" onSubmit={joinRoom}><label><span>YOUR NAME</span><input value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={32} required placeholder="What should we call you?" /></label><label><span>ROOM NAME</span><input value={roomName} onChange={(e) => setRoomName(e.target.value)} maxLength={48} required placeholder="e.g. project-sunrise" /></label><button className="button button-lime group-join-button" disabled={connecting || !displayName.trim() || !roomName.trim()}>{connecting ? 'Opening your room…' : 'Open the room'} {connecting ? <span className="button-spinner"/> : <ArrowRight size={17}/>}</button></form><div className="group-lobby-notes"><span><MessageCircle size={14}/> Shared room chat</span><span><AudioLines size={14}/> Pip speaks with AssemblyAI</span></div>{!config.openRouterReady && <p className="group-setup-note">Pip needs <code>OPENROUTER_API_KEY</code> in the server <code>.env</code> file to help the group.</p>}</div>
    </main><footer className="group-lobby-footer"><button onClick={onHome}><ArrowLeft size={14}/> BACK TO SAYWELL</button><span>GROUP CHAT · PIP’S SPOKEN REPLIES ARE OPTIONAL.</span></footer>{notice && <div className="notice-toast"><span className="notice-star">✳</span>{notice}<button onClick={() => setNotice('')} aria-label="Dismiss"><X size={15}/></button></div>}
  </div>;

  return <div className="group-page group-live">
    <header className="studio-header"><div className="studio-header-inner"><div className="studio-brand-row"><button className="back-button" onClick={onHome} aria-label="Back home"><ArrowLeft size={18}/></button><Brand onClick={onHome}/><span className="studio-divider"/><span className="studio-label">THE COMMON ROOM</span></div><div className="group-live-head"><span className="group-live-badge"><span className="live-dot"/> ROOM IS OPEN</span><span className="group-people-head"><Users size={14}/> {participants.length}</span></div></div></header>
    <main className="group-live-layout"><aside className="group-room-rail"><span className="mono">ROOM 02 / LIVE</span><h1>{roomName}</h1><p>A shared chat for all the moving pieces. Say hello, bring context, and make a plan together.</p><div className="group-rail-label"><span>IN THE ROOM</span><span>{String(participants.length).padStart(2,'0')}</span></div><div className="group-people-list">{participants.map((person, index) => <div className="group-person" key={person.id}><div className={`group-person-avatar person-color-${index % 4}`}>{person.name.trim().charAt(0).toUpperCase() || 'G'}</div><div><b>{person.name}{person.id === identityRef.current ? <small> · YOU</small> : null}</b><span>{person.id === identityRef.current ? 'In the conversation' : 'Room member'}</span></div><span className="person-presence"/></div>)}</div><div className="pip-card"><div className="pip-card-icon"><Bot size={19}/></div><div><b>Meet Pip</b><p>Your cheerful group co-pilot. Ask a question and Pip will find a next step with you.</p></div><span>✳</span></div><div className="group-rail-actions"><button className="group-invite-button" onClick={() => void copyInvite()}><Copy size={15}/>{copyLabel}</button><button className="group-leave-button" onClick={leaveRoom}><LogOut size={15}/> Leave room</button></div></aside>
      <section className="group-chat-panel"><div className="group-chat-top"><div><span className="mono">SAYWELL GROUP CHAT</span><h2>Think out loud<span>.</span></h2></div><div className="group-chat-tools"><LanguageControl value={language} onChange={setLanguage}/><span className="group-transport"><Users size={14}/> GROUP</span><button className={`group-voice-button ${pipVoice ? 'pip-voice-active' : ''}`} onClick={() => setPipVoice((value) => !value)} aria-label={pipVoice ? 'Mute Pip voice replies' : 'Enable Pip voice replies'}>{pipVoice ? <Volume2 size={16}/> : <VolumeX size={16}/>}<span>{pipVoice ? 'PIP VOICE ON' : 'PIP VOICE OFF'}</span></button></div></div><div className="group-chat-subline"><span><span className="live-dot"/> SHARED ROOM · {participants.length} HERE</span><span>{voiceStatus === 'idle' ? 'PRESS THE MIC TO TALK WITH PIP' : `VOICE · ${voiceStatus.toUpperCase()}`}</span></div>
        <div className="group-chat-log" ref={messagesRef}>{!messages.length && <div className="group-empty"><div className="group-empty-art"><span>✳</span><i>pip</i></div><span className="mono">A FRESH PAGE FOR THE WHOLE GROUP</span><h3>What are we<br/>figuring out?</h3><p>Drop the first thought in chat, or ask Pip to help your group find a way through.</p><div className="group-starters"><button onClick={() => setDraft('Help us compare our options and choose a first step.')}>Compare options <ArrowRight size={13}/></button><button onClick={() => setDraft('Can you summarize what our group has decided so far?')}>Find the thread <ArrowRight size={13}/></button></div></div>}
          {messages.map((message) => <article className={`group-message ${message.assistant ? 'pip-message' : ''} ${message.identity === identityRef.current ? 'own-message' : ''}`} key={message.id}><div className={`group-message-avatar ${message.assistant ? 'pip-message-avatar' : ''}`}>{message.assistant ? <Bot size={16}/> : message.name.trim().charAt(0).toUpperCase()}</div><div className="group-message-body"><div className="group-message-meta"><b>{message.assistant ? 'Pip' : message.name}</b><time>{new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit' }).format(message.at || Date.now())}</time>{message.askPip && <span>ASKED PIP</span>}</div><div className="group-message-bubble">{message.text}{message.assistant && <small><AudioLines size={12}/> VOICE REPLY · ASSEMBLYAI-TTS-1</small>}</div></div></article>)}
        </div>{voicePartial && <div className="group-voice-partial"><span className="live-dot"/> ASSEMBLYAI HEARD: {voicePartial}<i>▍</i></div>}<form className="group-composer" onSubmit={(event) => void sendMessage(event)}><button type="button" className={`group-talk-button talk-${voiceStatus}`} onClick={() => void toggleGroupVoice()} aria-pressed={voiceStatus !== 'idle' && voiceStatus !== 'error'} aria-label={voiceStatus === 'idle' || voiceStatus === 'error' ? 'Start voice conversation with Pip' : 'Stop voice conversation'}>{voiceStatus === 'idle' || voiceStatus === 'error' ? <Mic size={16}/> : voiceStatus === 'connecting' ? <span className="button-spinner"/> : <MicOff size={16}/>}<span>{voiceStatus === 'idle' ? 'TALK' : voiceStatus === 'connecting' ? 'CONNECT' : voiceStatus === 'listening' ? 'LISTENING' : voiceStatus === 'thinking' ? 'THINKING' : voiceStatus === 'speaking' ? 'PIP SPEAKING' : 'RETRY VOICE'}</span></button><input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Message the group or mention @pip…" aria-label="Message your group"/><button type="button" className="ask-pip-button" disabled={!draft.trim()} onClick={(event) => void sendMessage(event as unknown as React.FormEvent, true)}><Sparkles size={15}/><span>Ask Pip</span></button><button className="group-send-button" disabled={!draft.trim()} aria-label="Send message"><Send size={16}/></button></form><div className="group-composer-foot"><span>MENTION @PIP ANYWHERE TO INVITE PIP INTO THE CHAT.</span><span>PIP VOICE {pipVoice ? 'ON' : 'OFF'}</span></div>
      </section></main><footer className="group-lobby-footer"><button onClick={onHome}><ArrowLeft size={14}/> BACK TO SAYWELL</button><span>LIVE GROUP CHAT · SPOKEN REPLIES BY ASSEMBLYAI</span></footer>{notice && <div className="notice-toast"><span className="notice-star">✳</span>{notice}<button onClick={() => setNotice('')} aria-label="Dismiss"><X size={15}/></button></div>}
  </div>;
}

export default function App() {
  const { path, navigate } = usePath();
  const [language, setLanguage] = useState<ConversationLanguage>(() => {
    const saved = localStorage.getItem('saywell-language') as ConversationLanguage | null;
    return languageOptions.some((option) => option.value === saved) ? saved! : 'auto';
  });
  const studio = path === '/studio';
  const roomPath = path.match(/^\/room\/([^/]+)/);
  const roomName = roomPath ? decodeURIComponent(roomPath[1]) : '';
  const group = path === '/room' || Boolean(roomPath);
  useEffect(() => { localStorage.setItem('saywell-language', language); }, [language]);
  useEffect(() => { document.title = studio ? 'Practice room — Saywell' : group ? 'Group room — Saywell' : 'Saywell — say it before it matters'; }, [studio, group]);
  return studio ? <Studio onHome={() => navigate('/')} language={language} setLanguage={setLanguage} /> : group ? <GroupRoom roomFromPath={roomName} onHome={() => navigate('/')} language={language} setLanguage={setLanguage} /> : <Landing onStart={() => navigate('/studio')} onGroup={() => navigate('/room')} />;
}
