import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslateText, useGenerateAudio, useGetPresetVoices, useCloneVoice, useSaveToGallery } from "@workspace/api-client-react";
import { Flame, Mic, MicOff, Play, Pause, Download, Copy, Share2, RefreshCw, Volume2, CheckCircle2, Loader2, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

  const translateText = useTranslateText();
  const generateAudio = useGenerateAudio();
  const cloneVoiceMutation = useCloneVoice();
  const saveToGallery = useSaveToGallery();
  const { data: presetsData } = useGetPresetVoices();

  const isLoading = translateText.isPending || generateAudio.isPending;

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
        toast({ title: "Voice cloned!", description: "Your voice has been cloned successfully." });
      },
      onError: () => {
        toast({ title: "Clone failed", description: "Even DramaGen needs a moment to cool down. Try again!", variant: "destructive" });
      },
    });
  }, [audioBlob, cloneVoiceMutation, toast]);

  const handleSelectPresetVoice = (voiceId: string, name: string) => {
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

    setTranslatedText("");
    setAudioUrl("");
    setGenerationId(null);
    setSharedToGallery(false);
    setOriginalText(text);

    translateText.mutate(
      { data: { text: text.trim(), mode: selectedMode as "rage" | "passive_aggressive" | "disappointed_parent" | "telenovela" | "tiktok" | "drill_sergeant" | "corporate" | "ice_cold" } },
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
    <div className="min-h-screen w-full py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-6xl font-display uppercase tracking-wider text-white">
            Generate <span className="text-primary drop-shadow-[0_0_20px_rgba(255,51,51,0.6)]">Drama</span>
          </h1>
          <p className="text-muted-foreground">Too tired to yell? We got you.</p>
        </div>

        {/* Section A: Message */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Your Message</h2>
          <div className="relative">
            <Textarea
              data-testid="input-message"
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, 500))}
              placeholder="e.g., I asked you three times to take out the trash..."
              className="min-h-[120px] bg-card/50 border-border/50 text-foreground placeholder:text-muted-foreground/50 resize-none text-base focus:border-primary/50 focus:ring-primary/20"
            />
            <div className="absolute bottom-2 right-3 text-xs text-muted-foreground/50">{text.length}/500</div>
          </div>
          <div className="flex flex-wrap gap-2">
            {QUICK_FILLS.map((fill) => (
              <button
                key={fill}
                data-testid={`btn-quickfill-${fill.slice(0, 10).replace(/\s/g, "-")}`}
                onClick={() => setText(fill)}
                className="text-xs px-3 py-1.5 rounded-full bg-secondary/10 border border-secondary/20 text-secondary hover:bg-secondary/20 transition-colors"
              >
                {fill}
              </button>
            ))}
          </div>
        </section>

        {/* Section B: Drama Mode */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pick Your Drama Mode</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {DRAMA_MODES.map((mode) => (
              <button
                key={mode.id}
                data-testid={`btn-mode-${mode.id}`}
                onClick={() => setSelectedMode(mode.id)}
                className={`group relative rounded-xl p-3 border text-left transition-all duration-200 ${
                  selectedMode === mode.id
                    ? "border-primary bg-primary/10 shadow-[0_0_15px_rgba(255,51,51,0.15)]"
                    : "border-border/50 bg-card/30 hover:border-primary/30 hover:bg-primary/5"
                }`}
              >
                <div className="text-2xl mb-1">{mode.emoji}</div>
                <div className="text-xs font-bold text-foreground leading-tight">{mode.name}</div>
                <div className="text-xs text-muted-foreground/70 mt-0.5 leading-tight">{mode.description}</div>
                {selectedMode === mode.id && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Section C: Voice */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Choose Your Voice</h2>
          <Tabs value={voiceTab} onValueChange={setVoiceTab}>
            <TabsList className="w-full bg-card/50 border border-border/50">
              <TabsTrigger value="preset" className="flex-1 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Character Voice</TabsTrigger>
              <TabsTrigger value="clone" className="flex-1 data-[state=active]:bg-secondary/20 data-[state=active]:text-secondary">Clone My Voice</TabsTrigger>
            </TabsList>

            <TabsContent value="preset" className="mt-3">
              {readyPresets.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                  Character voices are being created. This may take a few minutes on first launch.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {readyPresets.map((voice) => (
                    <div
                      key={voice.id}
                      data-testid={`btn-voice-${voice.id}`}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleSelectPresetVoice(voice.voice_id!, voice.name)}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleSelectPresetVoice(voice.voice_id!, voice.name); }}
                      className={`group relative rounded-xl p-3 border text-left cursor-pointer transition-all duration-200 ${
                        selectedVoiceId === voice.voice_id && voiceType === "preset"
                          ? "border-secondary bg-secondary/10 shadow-[0_0_15px_rgba(139,92,246,0.15)]"
                          : "border-border/50 bg-card/30 hover:border-secondary/30 hover:bg-secondary/5"
                      }`}
                    >
                      <div className="text-2xl mb-1">{voice.emoji}</div>
                      <div className="text-xs font-bold text-foreground">{voice.name}</div>
                      <div className="text-xs text-muted-foreground/70 mt-0.5">{voice.description}</div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handlePreviewVoice(voice.voice_id!); }}
                        className="mt-2 flex items-center gap-1 text-xs text-secondary/70 hover:text-secondary"
                      >
                        {previewingVoiceId === voice.voice_id ? <Volume2 className="w-3 h-3 animate-pulse" /> : <Play className="w-3 h-3" />}
                        Preview
                      </button>
                    </div>
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
              <Card className="bg-card/30 border-border/50">
                <CardContent className="p-4 space-y-4">
                  <div className="text-xs text-muted-foreground/70 bg-secondary/5 border border-secondary/20 rounded-lg p-3">
                    By recording your voice, you consent to creating an AI voice clone for use within DramaGen.
                  </div>

                  {clonedVoiceId ? (
                    <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
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
                          toast({ title: "Voice selected", description: "Your cloned voice is ready to use." });
                        }}
                      >
                        Use This
                      </Button>
                    </div>
                  ) : null}

                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">
                      Read this passage aloud for 30 seconds in your normal voice:
                    </div>
                    <div className="p-3 bg-background/50 border border-border/50 rounded-lg text-sm italic text-muted-foreground">
                      "{SAMPLE_PASSAGE}"
                    </div>

                    {/* Audio level meter */}
                    {isRecording && (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-muted/30 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-75 rounded-full"
                            style={{ width: `${Math.min(100, audioLevel * 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-primary font-mono">{recordingTime}s</span>
                      </div>
                    )}

                    <div className="flex gap-2">
                      {!isRecording ? (
                        <Button
                          data-testid="button-start-recording"
                          onClick={startRecording}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 flex-1"
                          disabled={cloneVoiceMutation.isPending}
                        >
                          <Mic className="w-4 h-4" />
                          {audioBlob ? "Re-record" : "Start Recording"}
                        </Button>
                      ) : (
                        <Button
                          data-testid="button-stop-recording"
                          onClick={stopRecording}
                          variant="outline"
                          className="border-primary/50 text-primary hover:bg-primary/10 gap-2 flex-1 animate-pulse"
                        >
                          <MicOff className="w-4 h-4" />
                          Stop ({30 - recordingTime}s left)
                        </Button>
                      )}

                      {audioBlob && !isRecording && (
                        <Button
                          data-testid="button-clone-voice"
                          onClick={handleCloneVoice}
                          disabled={cloneVoiceMutation.isPending}
                          className="bg-secondary hover:bg-secondary/90 text-secondary-foreground gap-2"
                        >
                          {cloneVoiceMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                          Clone Voice
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>

        {/* Section D: Generate Button */}
        <section>
          <div className="relative group">
            <div className={`absolute -inset-1 bg-gradient-to-r from-primary to-secondary blur opacity-40 rounded-2xl transition-opacity ${isLoading ? "opacity-60 animate-pulse" : "group-hover:opacity-60"}`} />
            <Button
              data-testid="button-generate"
              onClick={handleGenerate}
              disabled={isLoading}
              className="relative w-full h-16 text-xl font-display uppercase tracking-wider bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
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
          </div>
        </section>

        {/* Section E: Result */}
        {audioUrl && translatedText && (
          <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-secondary/30 blur rounded-2xl" />
            <Card className="relative bg-card/50 border border-primary/30 shadow-[0_0_30px_rgba(255,51,51,0.1)]">
              <CardContent className="p-5 space-y-5">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Flame className="w-4 h-4 text-primary" />
                  The Transformation
                </h3>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <div className="text-xs text-muted-foreground/60 font-medium uppercase tracking-wider">Before</div>
                    <div data-testid="text-original" className="p-3 bg-muted/20 border border-border/40 rounded-lg text-sm text-muted-foreground italic">
                      "{originalText}"
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="text-xs text-primary/80 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Flame className="w-3 h-3" />
                      After ({DRAMA_MODES.find(m => m.id === selectedMode)?.name})
                    </div>
                    <div data-testid="text-translated" className="p-3 bg-primary/10 border border-primary/30 rounded-lg text-sm text-foreground font-medium">
                      "{translatedText}"
                    </div>
                  </div>
                </div>

                {/* Audio Player */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-4 bg-background/50 border border-border/50 rounded-xl">
                    <button
                      data-testid="button-play-audio"
                      onClick={handleToggleResultPlay}
                      className="w-12 h-12 rounded-full bg-primary flex items-center justify-center hover:bg-primary/80 transition-colors flex-shrink-0"
                    >
                      {isPlayingResult ? <Pause className="w-5 h-5 text-primary-foreground" /> : <Play className="w-5 h-5 text-primary-foreground ml-0.5" />}
                    </button>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-foreground">Your Dramatic Rant</div>
                      <div className="text-xs text-muted-foreground capitalize">{selectedMode?.replace(/_/g, " ")} mode • {selectedVoiceName}</div>
                      {/* Waveform visualization */}
                      <div className="flex items-end gap-0.5 h-8 mt-2">
                        {Array.from({ length: 32 }).map((_, i) => (
                          <div
                            key={i}
                            className={`flex-1 rounded-full transition-all duration-300 ${isPlayingResult ? "bg-primary animate-pulse" : "bg-muted/40"}`}
                            style={{
                              height: `${20 + Math.sin(i * 0.7 + Date.now() * 0.001) * 12}%`,
                              animationDelay: `${i * 0.05}s`,
                              minHeight: "2px",
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <Button
                      data-testid="button-download"
                      onClick={handleDownload}
                      variant="outline"
                      size="sm"
                      className="border-primary/30 text-primary hover:bg-primary/10 gap-1.5 text-xs"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </Button>
                    <Button
                      data-testid="button-copy-text"
                      onClick={handleCopyText}
                      variant="outline"
                      size="sm"
                      className="border-border/50 text-muted-foreground hover:text-foreground hover:border-border gap-1.5 text-xs"
                    >
                      <Copy className="w-3.5 h-3.5" /> Copy Text
                    </Button>
                    {!sharedToGallery ? (
                      <Button
                        data-testid="button-share-gallery"
                        onClick={handleShareToGallery}
                        disabled={saveToGallery.isPending}
                        variant="outline"
                        size="sm"
                        className="border-secondary/30 text-secondary hover:bg-secondary/10 gap-1.5 text-xs"
                      >
                        <Share2 className="w-3.5 h-3.5" /> Share
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" disabled className="border-green-500/30 text-green-400 gap-1.5 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Shared
                      </Button>
                    )}
                    <Button
                      data-testid="button-generate-another"
                      onClick={handleGenerateAnother}
                      variant="outline"
                      size="sm"
                      className="border-border/50 text-muted-foreground hover:text-foreground hover:border-border gap-1.5 text-xs"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> New Rant
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        )}
      </div>
    </div>
  );
}
