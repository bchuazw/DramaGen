import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslateText, useGenerateAudio, useGetPresetVoices, useCloneVoice, useSaveToGallery } from "@workspace/api-client-react";
import { Flame, Mic, MicOff, Play, Pause, Download, Copy, Share2, RefreshCw, Volume2, CheckCircle2, Loader2, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

const DRAMA_MODES = [
  { id: "rage", emoji: "🔥", name: "Rage Mode", description: "Full volcanic eruption. No holding back." },
  { id: "passive_aggressive", emoji: "😒", name: "Passive Aggressive", description: "Smile on the outside, daggers on the inside." },
  { id: "disappointed_parent", emoji: "😢", name: "Disappointed Parent", description: "I'm not mad, I'm just disappointed... devastatingly." },
  { id: "telenovela", emoji: "🎭", name: "Telenovela", description: "Betrayal! Dramatic pauses! Thunder in the background!" },
  { id: "tiktok", emoji: "📱", name: "TikTok Fight Starter", description: "If your man does this... it's time to throw hands." },
  { id: "drill_sergeant", emoji: "🎤", name: "Drill Sergeant", description: "DROP AND GIVE ME 20! YOU CALL THAT AN EXCUSE?!" },
  { id: "corporate", emoji: "👔", name: "Corporate Fury", description: "Per my last email, I find this utterly unacceptable." },
  { id: "ice_cold", emoji: "🧊", name: "Ice Cold", description: "Calm, slow, terrifying. Scarier than yelling." },
];

const QUICK_FILLS = [
  "Please do your dishes",
  "You said you'd be here at 7, it's 9",
  "I noticed you didn't reply to my text",
  "Can you please stop chewing so loud",
];

const LOADING_MESSAGES = [
  "Channeling your inner rage...",
  "Translating to maximum drama...",
  "Recording the rant...",
  "Summoning the demons...",
  "Calibrating fury levels...",
  "Preparing the performance...",
];

const SAMPLE_PASSAGE = "I want to thank you all for coming today. The weather has been quite something lately, hasn't it? I've been thinking a lot about how we communicate with each other, and I believe there's always room to improve our relationships.";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

function playClickSound() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  } catch {}
}

function playSuccessSound() {
  try {
    const ctx = new AudioContext();
    const notes = [523.25, 659.25, 783.99];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.3);
      osc.start(ctx.currentTime + i * 0.12);
      osc.stop(ctx.currentTime + i * 0.12 + 0.3);
    });
  } catch {}
}

export default function Generate() {
  const { toast } = useToast();
  const [text, setText] = useState("");
  const [selectedMode, setSelectedMode] = useState<string>("");
  const [voiceTab, setVoiceTab] = useState("preset");
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>("");
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>("");
  const [voiceType, setVoiceType] = useState<"preset" | "clone">("preset");

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [clonedVoiceId, setClonedVoiceId] = useState<string>(() => localStorage.getItem("dramagen_voice_id") ?? "");
  const [clonedVoiceName, setClonedVoiceName] = useState<string>(() => localStorage.getItem("dramagen_voice_name") ?? "");
  const [audioLevel, setAudioLevel] = useState(0);

  const [translatedText, setTranslatedText] = useState<string>("");
  const [originalText, setOriginalText] = useState<string>("");
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [generationId, setGenerationId] = useState<number | null>(null);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [previewingVoiceId, setPreviewingVoiceId] = useState<string>("");
  const [isPlayingResult, setIsPlayingResult] = useState(false);
  const [sharedToGallery, setSharedToGallery] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const resultAudioRef = useRef<HTMLAudioElement | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  const translateText_ = useTranslateText();
  const generateAudio = useGenerateAudio();
  const cloneVoiceMutation = useCloneVoice();
  const saveToGallery = useSaveToGallery();
  const { data: presetsData } = useGetPresetVoices();

  const isLoading = translateText_.isPending || generateAudio.isPending;

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingMessageIndex((i) => (i + 1) % LOADING_MESSAGES.length);
      }, 1800);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const updateLevel = () => {
        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        setAudioLevel(avg / 128);
        animFrameRef.current = requestAnimationFrame(updateLevel);
      };
      updateLevel();

      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        stream.getTracks().forEach((t) => t.stop());
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        setAudioLevel(0);
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((t) => {
          if (t >= 29) {
            stopRecording();
            return 30;
          }
          return t + 1;
        });
      }, 1000);

    } catch {
      toast({ title: "Microphone access denied", description: "Please allow microphone access to clone your voice.", variant: "destructive" });
    }
  }, [toast]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
  }, []);

  const handleCloneVoice = useCallback(async () => {
    if (!audioBlob) return;
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.webm");
    cloneVoiceMutation.mutate({ data: formData as unknown as { audio: Blob } }, {
      onSuccess: (result) => {
        setClonedVoiceId(result.voice_id);
        setClonedVoiceName(result.name);
        localStorage.setItem("dramagen_voice_id", result.voice_id);
        localStorage.setItem("dramagen_voice_name", result.name);
        setSelectedVoiceId(result.voice_id);
        setSelectedVoiceName(result.name);
        setVoiceType("clone");
        playSuccessSound();
        toast({ title: "Voice cloned!", description: "Your voice has been cloned successfully." });
      },
      onError: () => {
        toast({ title: "Clone failed", description: "Even DramaGen needs a moment to cool down. Try again!", variant: "destructive" });
      },
    });
  }, [audioBlob, cloneVoiceMutation, toast]);

  const handleSelectPresetVoice = (voiceId: string, name: string) => {
    playClickSound();
    setSelectedVoiceId(voiceId);
    setSelectedVoiceName(name);
    setVoiceType("preset");
  };

  const handlePreviewVoice = async (voiceId: string) => {
    if (!voiceId) return;
    setPreviewingVoiceId(voiceId);
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
    }
    const previewUrl = `/api/voices/${voiceId}/preview`;
    const audio = new Audio(previewUrl);
    previewAudioRef.current = audio;
    audio.play().catch(() => {
      toast({ title: "Preview unavailable", description: "Voice preview is not available yet.", variant: "destructive" });
    });
    audio.onended = () => setPreviewingVoiceId("");
  };

  const handleGenerate = async () => {
    if (!text.trim()) {
      toast({ title: "Enter a message", description: "Type something mild to transform into drama.", variant: "destructive" });
      return;
    }
    if (!selectedMode) {
      toast({ title: "Pick a drama mode", description: "Choose how dramatic you want it.", variant: "destructive" });
      return;
    }
    if (!selectedVoiceId) {
      toast({ title: "Choose a voice", description: "Select a character voice or clone your own.", variant: "destructive" });
      return;
    }

    playClickSound();
    setTranslatedText("");
    setAudioUrl("");
    setGenerationId(null);
    setSharedToGallery(false);
    setOriginalText(text);

    translateText_.mutate(
      { data: { text: text.trim(), mode: selectedMode as any } },
      {
        onSuccess: (translated) => {
          setTranslatedText(translated.translated);
          generateAudio.mutate(
            {
              data: {
                text: translated.translated,
                voice_id: selectedVoiceId,
                mode: selectedMode,
                original_text: text.trim(),
                voice_type: voiceType,
                voice_name: selectedVoiceName,
              },
            },
            {
              onSuccess: (result) => {
                setAudioUrl(result.audio_url);
                setGenerationId(result.generation_id ?? null);
                playSuccessSound();
              },
              onError: () => {
                toast({ title: "Generation failed", description: "Even DramaGen needs a moment to cool down. Try again!", variant: "destructive" });
              },
            }
          );
        },
        onError: () => {
          toast({ title: "Translation failed", description: "The drama translator is taking a breather. Try again!", variant: "destructive" });
        },
      }
    );
  };

  const handleDownload = () => {
    if (!audioUrl) return;
    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = `dramagen_${selectedMode}_${Date.now()}.mp3`;
    a.click();
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(translatedText);
    toast({ title: "Copied!", description: "Dramatic text copied to clipboard." });
  };

  const handleShareToGallery = () => {
    if (generationId == null) return;
    saveToGallery.mutate({ data: { generation_id: generationId } }, {
      onSuccess: () => {
        setSharedToGallery(true);
        playSuccessSound();
        toast({ title: "Shared to gallery!", description: "Your rant is now live for everyone to hear." });
      },
    });
  };

  const handleGenerateAnother = () => {
    setText("");
    setTranslatedText("");
    setAudioUrl("");
    setOriginalText("");
    setGenerationId(null);
    setSharedToGallery(false);
  };

  const handleToggleResultPlay = () => {
    if (!resultAudioRef.current) {
      resultAudioRef.current = new Audio(audioUrl);
      resultAudioRef.current.onended = () => setIsPlayingResult(false);
    }
    if (isPlayingResult) {
      resultAudioRef.current.pause();
      setIsPlayingResult(false);
    } else {
      resultAudioRef.current.play();
      setIsPlayingResult(true);
    }
  };

  const readyPresets = presetsData?.voices?.filter((v) => v.ready && v.voice_id) ?? [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen w-full py-8 px-4"
    >
      <div className="max-w-3xl mx-auto space-y-8">
        <motion.div initial="hidden" animate="visible" className="text-center space-y-2">
          <motion.h1 variants={fadeUp} custom={0} className="text-4xl md:text-6xl font-display uppercase tracking-wider text-white">
            Generate <motion.span
              className="text-primary inline-block"
              animate={{ textShadow: ["0 0 20px rgba(255,51,51,0.6)", "0 0 40px rgba(255,51,51,0.8)", "0 0 20px rgba(255,51,51,0.6)"] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Drama
            </motion.span>
          </motion.h1>
          <motion.p variants={fadeUp} custom={1} className="text-muted-foreground">Too tired to yell? We got you.</motion.p>
        </motion.div>

        <motion.section variants={fadeUp} custom={2} initial="hidden" animate="visible" className="space-y-3">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Your Message</h2>
          <div className="relative glass-card rounded-xl overflow-hidden">
            <Textarea
              data-testid="input-message"
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, 500))}
              placeholder="e.g., I asked you three times to take out the trash..."
              className="min-h-[120px] bg-transparent border-0 text-foreground placeholder:text-muted-foreground/50 resize-none text-base focus:ring-0 focus:outline-none"
            />
            <div className="absolute bottom-2 right-3 text-xs text-muted-foreground/50">{text.length}/500</div>
          </div>
          <div className="flex flex-wrap gap-2">
            {QUICK_FILLS.map((fill) => (
              <motion.button
                key={fill}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                data-testid={`btn-quickfill-${fill.slice(0, 10).replace(/\s/g, "-")}`}
                onClick={() => { setText(fill); playClickSound(); }}
                className="text-xs px-3 py-1.5 rounded-full bg-secondary/10 border border-secondary/20 text-secondary hover:bg-secondary/20 transition-colors hover:shadow-[0_0_10px_rgba(139,92,246,0.2)]"
              >
                {fill}
              </motion.button>
            ))}
          </div>
        </motion.section>

        <motion.section variants={fadeUp} custom={3} initial="hidden" animate="visible" className="space-y-3">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pick Your Drama Mode</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {DRAMA_MODES.map((mode, i) => (
              <motion.button
                key={mode.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.05, duration: 0.4 }}
                whileHover={{ scale: 1.03, y: -3 }}
                whileTap={{ scale: 0.97 }}
                data-testid={`btn-mode-${mode.id}`}
                onClick={() => { setSelectedMode(mode.id); playClickSound(); }}
                className={`group relative rounded-xl p-3 border text-left transition-all duration-200 hover-tilt ${
                  selectedMode === mode.id
                    ? "border-primary bg-primary/10 shadow-[0_0_20px_rgba(255,51,51,0.2)] glow-red"
                    : "border-border/50 bg-card/30 hover:border-primary/30 hover:bg-primary/5"
                }`}
              >
                <div className="text-2xl mb-1">{mode.emoji}</div>
                <div className="text-xs font-bold text-foreground leading-tight">{mode.name}</div>
                <div className="text-xs text-muted-foreground/70 mt-0.5 leading-tight">{mode.description}</div>
                {selectedMode === mode.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>
        </motion.section>

        <motion.section variants={fadeUp} custom={4} initial="hidden" animate="visible" className="space-y-3">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Choose Your Voice</h2>
          <Tabs value={voiceTab} onValueChange={setVoiceTab}>
            <TabsList className="w-full bg-card/50 border border-border/50 backdrop-blur-sm">
              <TabsTrigger value="preset" className="flex-1 data-[state=active]:bg-primary/20 data-[state=active]:text-primary transition-all">Character Voice</TabsTrigger>
              <TabsTrigger value="clone" className="flex-1 data-[state=active]:bg-secondary/20 data-[state=active]:text-secondary transition-all">Clone My Voice</TabsTrigger>
            </TabsList>

            <TabsContent value="preset" className="mt-3">
              {readyPresets.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm glass-card rounded-xl">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                  Character voices are being created. This may take a few minutes on first launch.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {readyPresets.map((voice, i) => (
                    <motion.div
                      key={voice.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      data-testid={`btn-voice-${voice.id}`}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleSelectPresetVoice(voice.voice_id!, voice.name)}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleSelectPresetVoice(voice.voice_id!, voice.name); }}
                      className={`group relative rounded-xl p-3 border text-left cursor-pointer transition-all duration-200 ${
                        selectedVoiceId === voice.voice_id && voiceType === "preset"
                          ? "border-secondary bg-secondary/10 glow-purple"
                          : "border-border/50 bg-card/30 hover:border-secondary/30 hover:bg-secondary/5"
                      }`}
                    >
                      <div className="text-2xl mb-1">{voice.emoji}</div>
                      <div className="text-xs font-bold text-foreground">{voice.name}</div>
                      <div className="text-xs text-muted-foreground/70 mt-0.5">{voice.description}</div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handlePreviewVoice(voice.voice_id!); }}
                        className="mt-2 flex items-center gap-1 text-xs text-secondary/70 hover:text-secondary transition-colors"
                      >
                        {previewingVoiceId === voice.voice_id ? <Volume2 className="w-3 h-3 animate-pulse" /> : <Play className="w-3 h-3" />}
                        Preview
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
              {presetsData?.voices && presetsData.voices.filter(v => !v.ready).length > 0 && (
                <p className="text-xs text-muted-foreground/50 mt-2 text-center">
                  {presetsData.voices.filter(v => !v.ready).length} more voices initializing...
                </p>
              )}
            </TabsContent>

            <TabsContent value="clone" className="mt-3">
              <Card className="glass-card border-border/50 overflow-hidden">
                <CardContent className="p-4 space-y-4">
                  <div className="text-xs text-muted-foreground/70 bg-secondary/5 border border-secondary/20 rounded-lg p-3">
                    By recording your voice, you consent to creating an AI voice clone for use within DramaGen.
                  </div>

                  <AnimatePresence>
                    {clonedVoiceId && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg"
                      >
                        <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <div>
                          <div className="text-sm font-medium text-green-400">Voice cloned!</div>
                          <div className="text-xs text-muted-foreground">{clonedVoiceName}</div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="ml-auto border-green-500/30 text-green-400 hover:bg-green-500/10 text-xs"
                          onClick={() => {
                            setSelectedVoiceId(clonedVoiceId);
                            setSelectedVoiceName(clonedVoiceName);
                            setVoiceType("clone");
                            playClickSound();
                            toast({ title: "Voice selected", description: "Your cloned voice is ready to use." });
                          }}
                        >
                          Use This
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">
                      Read this passage aloud for 30 seconds in your normal voice:
                    </div>
                    <div className="p-3 bg-background/50 border border-border/50 rounded-lg text-sm italic text-muted-foreground">
                      "{SAMPLE_PASSAGE}"
                    </div>

                    <AnimatePresence>
                      {isRecording && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-2"
                        >
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-3 bg-muted/30 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                                animate={{ width: `${Math.min(100, audioLevel * 100)}%` }}
                                transition={{ duration: 0.05 }}
                              />
                            </div>
                            <span className="text-xs text-primary font-mono w-8">{recordingTime}s</span>
                          </div>
                          <div className="flex justify-center gap-1 h-8">
                            {Array.from({ length: 20 }).map((_, i) => (
                              <motion.div
                                key={i}
                                className="w-1 rounded-full bg-primary/80"
                                animate={{
                                  height: `${20 + audioLevel * 60 + Math.sin(Date.now() * 0.01 + i) * 20}%`,
                                }}
                                transition={{ duration: 0.1 }}
                              />
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="flex gap-2">
                      {!isRecording ? (
                        <Button
                          data-testid="button-start-recording"
                          onClick={startRecording}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 flex-1 shadow-[0_0_15px_rgba(255,51,51,0.2)] hover:shadow-[0_0_25px_rgba(255,51,51,0.3)] transition-shadow"
                          disabled={cloneVoiceMutation.isPending}
                        >
                          <Mic className="w-4 h-4" />
                          {audioBlob ? "Re-record" : "Start Recording"}
                        </Button>
                      ) : (
                        <motion.div className="flex-1" animate={{ scale: [1, 1.02, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                          <Button
                            data-testid="button-stop-recording"
                            onClick={stopRecording}
                            variant="outline"
                            className="w-full border-primary/50 text-primary hover:bg-primary/10 gap-2"
                          >
                            <MicOff className="w-4 h-4" />
                            Stop ({30 - recordingTime}s left)
                          </Button>
                        </motion.div>
                      )}

                      {audioBlob && !isRecording && (
                        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                          <Button
                            data-testid="button-clone-voice"
                            onClick={handleCloneVoice}
                            disabled={cloneVoiceMutation.isPending}
                            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground gap-2 shadow-[0_0_15px_rgba(139,92,246,0.2)]"
                          >
                            {cloneVoiceMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                            Clone Voice
                          </Button>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.section>

        <motion.section variants={fadeUp} custom={5} initial="hidden" animate="visible">
          <motion.div className="relative group" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
            <div className={`absolute -inset-1 bg-gradient-to-r from-primary to-secondary blur-lg opacity-40 rounded-2xl transition-opacity ${isLoading ? "opacity-70 animate-pulse" : "group-hover:opacity-60"}`} />
            <Button
              data-testid="button-generate"
              onClick={handleGenerate}
              disabled={isLoading}
              className="relative w-full h-16 text-xl font-display uppercase tracking-wider bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-[0_4px_30px_rgba(255,51,51,0.3)]"
            >
              {isLoading ? (
                <span className="flex items-center gap-3">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  {LOADING_MESSAGES[loadingMessageIndex]}
                </span>
              ) : (
                <span className="flex items-center gap-3">
                  <Flame className="w-6 h-6" />
                  Generate Drama
                </span>
              )}
            </Button>
          </motion.div>
        </motion.section>

        <AnimatePresence>
          {isLoading && !audioUrl && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <Card className="glass-card border-primary/20 overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-primary via-secondary to-primary animate-pulse" />
                <CardContent className="p-5 space-y-5">
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Flame className="w-6 h-6 text-primary" />
                    </motion.div>
                    <div>
                      <motion.p
                        key={loadingMessageIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm font-bold text-foreground"
                      >
                        {LOADING_MESSAGES[loadingMessageIndex]}
                      </motion.p>
                      <p className="text-xs text-muted-foreground">This usually takes 5-10 seconds</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-2">
                      <div className="h-3 bg-muted/30 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-primary/60 to-secondary/60 rounded-full"
                          initial={{ width: "0%" }}
                          animate={{ width: translateText_.isPending ? "45%" : "85%" }}
                          transition={{ duration: translateText_.isPending ? 4 : 8, ease: "easeOut" }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span className={translateText_.isPending ? "text-primary" : "text-green-400"}>
                          {translateText_.isPending ? "Translating text..." : "Text ready"}
                        </span>
                        <span className={generateAudio.isPending ? "text-primary" : "text-muted-foreground/50"}>
                          {generateAudio.isPending ? "Generating audio..." : "Waiting..."}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-center gap-0.5 h-10">
                      {Array.from({ length: 24 }).map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-1 rounded-full bg-primary/40"
                          animate={{
                            height: [`${15 + Math.random() * 20}%`, `${40 + Math.random() * 50}%`, `${15 + Math.random() * 20}%`],
                          }}
                          transition={{
                            duration: 0.6 + Math.random() * 0.4,
                            repeat: Infinity,
                            delay: i * 0.05,
                          }}
                          style={{ minHeight: "3px" }}
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.section>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {audioUrl && translatedText && (
            <motion.section
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="space-y-4"
            >
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-secondary/30 blur-xl rounded-2xl" />
                <Card className="relative glass-card border-primary/30 shadow-[0_0_40px_rgba(255,51,51,0.1)]">
                  <CardContent className="p-5 space-y-5">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      <Flame className="w-4 h-4 text-primary" />
                      The Transformation
                    </h3>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="space-y-1.5">
                        <div className="text-xs text-muted-foreground/60 font-medium uppercase tracking-wider">Before</div>
                        <div data-testid="text-original" className="p-3 bg-muted/20 border border-border/40 rounded-lg text-sm text-muted-foreground italic">
                          "{originalText}"
                        </div>
                      </motion.div>
                      <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="space-y-1.5">
                        <div className="text-xs text-primary/80 font-bold uppercase tracking-wider flex items-center gap-1">
                          <Flame className="w-3 h-3" />
                          After ({DRAMA_MODES.find(m => m.id === selectedMode)?.name})
                        </div>
                        <div data-testid="text-translated" className="p-3 bg-primary/10 border border-primary/30 rounded-lg text-sm text-foreground font-medium shadow-[inset_0_0_20px_rgba(255,51,51,0.05)]">
                          "{translatedText}"
                        </div>
                      </motion.div>
                    </div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="space-y-3"
                    >
                      <div className="flex items-center gap-3 p-4 bg-background/50 border border-border/50 rounded-xl">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          data-testid="button-play-audio"
                          onClick={handleToggleResultPlay}
                          className="w-12 h-12 rounded-full bg-primary flex items-center justify-center hover:bg-primary/80 transition-colors flex-shrink-0 shadow-[0_0_20px_rgba(255,51,51,0.3)]"
                        >
                          {isPlayingResult ? <Pause className="w-5 h-5 text-primary-foreground" /> : <Play className="w-5 h-5 text-primary-foreground ml-0.5" />}
                        </motion.button>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-foreground">Your Dramatic Rant</div>
                          <div className="text-xs text-muted-foreground capitalize">{selectedMode?.replace(/_/g, " ")} mode &bull; {selectedVoiceName}</div>
                          <div className="flex items-end gap-0.5 h-8 mt-2">
                            {Array.from({ length: 32 }).map((_, i) => (
                              <motion.div
                                key={i}
                                className={`flex-1 rounded-full ${isPlayingResult ? "bg-primary" : "bg-muted/40"}`}
                                animate={isPlayingResult ? {
                                  height: [`${20 + Math.random() * 30}%`, `${40 + Math.random() * 50}%`, `${20 + Math.random() * 30}%`],
                                } : { height: `${20 + Math.sin(i * 0.7) * 12}%` }}
                                transition={isPlayingResult ? {
                                  duration: 0.4 + Math.random() * 0.3,
                                  repeat: Infinity,
                                  delay: i * 0.03,
                                } : { duration: 0.3 }}
                                style={{ minHeight: "2px" }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { testId: "button-download", onClick: handleDownload, icon: Download, label: "Download", color: "border-primary/30 text-primary hover:bg-primary/10" },
                          { testId: "button-copy-text", onClick: handleCopyText, icon: Copy, label: "Copy Text", color: "border-border/50 text-muted-foreground hover:text-foreground hover:border-border" },
                        ].map((btn) => (
                          <motion.div key={btn.testId} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                            <Button data-testid={btn.testId} onClick={btn.onClick} variant="outline" size="sm" className={`w-full ${btn.color} gap-1.5 text-xs`}>
                              <btn.icon className="w-3.5 h-3.5" /> {btn.label}
                            </Button>
                          </motion.div>
                        ))}
                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                          {!sharedToGallery ? (
                            <Button
                              data-testid="button-share-gallery"
                              onClick={handleShareToGallery}
                              disabled={saveToGallery.isPending}
                              variant="outline"
                              size="sm"
                              className="w-full border-secondary/30 text-secondary hover:bg-secondary/10 gap-1.5 text-xs"
                            >
                              <Share2 className="w-3.5 h-3.5" /> Share
                            </Button>
                          ) : (
                            <Button variant="outline" size="sm" disabled className="w-full border-green-500/30 text-green-400 gap-1.5 text-xs">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Shared
                            </Button>
                          )}
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                          <Button
                            data-testid="button-generate-another"
                            onClick={handleGenerateAnother}
                            variant="outline"
                            size="sm"
                            className="w-full border-border/50 text-muted-foreground hover:text-foreground hover:border-border gap-1.5 text-xs"
                          >
                            <RefreshCw className="w-3.5 h-3.5" /> New Rant
                          </Button>
                        </motion.div>
                      </div>
                    </motion.div>
                  </CardContent>
                </Card>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
