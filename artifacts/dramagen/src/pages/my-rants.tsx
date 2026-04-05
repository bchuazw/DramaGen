import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useGetMyRants } from "@workspace/api-client-react";
import { formatDistanceToNow } from "date-fns";
import { Play, Pause, AlertCircle, Download, Share2, Trash2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function MyRants() {
  const { data, isLoading, error } = useGetMyRants({ limit: 50, offset: 0 });
  const { toast } = useToast();

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Failed to load your rants. Please try again later.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8 sm:py-12 max-w-5xl"
    >
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="mb-8 sm:mb-12 text-center space-y-3 sm:space-y-4"
      >
        <h1 className="text-3xl sm:text-5xl font-display uppercase tracking-widest">
          <motion.span
            className="text-secondary inline-block"
            animate={{ textShadow: ["0 0 15px rgba(139,92,246,0.4)", "0 0 30px rgba(139,92,246,0.6)", "0 0 15px rgba(139,92,246,0.4)"] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            My
          </motion.span>{" "}
          <span className="text-foreground">Rants</span>
        </h1>
        <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto">
          Your personal collection of dramatic outbursts.
        </p>
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="bg-card/50 border-border/50">
              <CardContent className="p-4 sm:p-6 space-y-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {data?.entries.map((entry, i) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
            >
              <MyRantCard entry={entry} />
            </motion.div>
          ))}

          {data?.entries.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full text-center py-16 sm:py-20 text-muted-foreground border border-dashed border-border rounded-xl glass-card space-y-4"
            >
              <p className="text-lg">No rants yet.</p>
              <p className="text-sm">Head to the Generate page and unleash some drama!</p>
            </motion.div>
          )}
        </div>
      )}

      {data && data.total > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8 text-xs text-muted-foreground"
        >
          {data.total} total rant{data.total !== 1 ? 's' : ''}
        </motion.div>
      )}
    </motion.div>
  );
}

function MyRantCard({ entry }: { entry: any }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio] = useState(() => new Audio(entry.audio_url));
  const { toast } = useToast();

  const togglePlay = () => {
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  audio.onended = () => setIsPlaying(false);

  const handleDownload = () => {
    if (!entry.audio_url) return;
    const a = document.createElement("a");
    a.href = entry.audio_url;
    a.download = `dramagen_${entry.mode}_${entry.id}.mp3`;
    a.click();
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}${entry.audio_url}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Link copied!", description: "Audio link copied to clipboard." });
  };

  return (
    <motion.div whileHover={{ y: -3 }} transition={{ type: "spring", stiffness: 300 }}>
      <Card className="glass-card hover:border-secondary/20 transition-all duration-300 overflow-hidden flex flex-col group">
        <div className="p-1 bg-gradient-to-r from-secondary/50 to-primary/50 w-full transition-opacity group-hover:opacity-100 opacity-70" />
        <CardContent className="p-4 sm:p-6 flex flex-col flex-1 space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-xs uppercase tracking-wider text-primary border-primary/30 bg-primary/5">
              {entry.mode.replace('_', ' ')}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
            </span>
          </div>

          <div className="space-y-3 flex-1">
            <div className="space-y-1">
              <p className="text-xs font-bold text-muted-foreground uppercase">Original</p>
              <p className="text-sm text-muted-foreground line-clamp-2 italic">"{entry.original_text}"</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-bold text-secondary uppercase">Dramatic Version</p>
              <p className="text-base sm:text-lg font-medium leading-tight text-foreground line-clamp-4">
                "{entry.translated_text}"
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-border/50 mt-auto">
            <div className="flex items-center gap-2 flex-wrap">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="default"
                  size="sm"
                  className={`${isPlaying ? "bg-secondary text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]" : "bg-secondary/20 text-secondary hover:bg-secondary hover:text-white"} transition-all`}
                  onClick={togglePlay}
                >
                  {isPlaying ? <Pause className="w-4 h-4 mr-1.5" /> : <Play className="w-4 h-4 mr-1.5" />}
                  {isPlaying ? "Playing" : "Listen"}
                </Button>
              </motion.div>

              <Button variant="outline" size="sm" className="h-8 px-2 text-xs" onClick={handleDownload}>
                <Download className="w-3.5 h-3.5 mr-1" /> Save
              </Button>

              <Button variant="outline" size="sm" className="h-8 px-2 text-xs" onClick={handleCopyLink}>
                <Share2 className="w-3.5 h-3.5 mr-1" /> Link
              </Button>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Voice: {entry.voice_name || 'Preset'}</span>
              {entry.voice_type === 'clone' && (
                <Badge variant="outline" className="text-xs border-green-500/30 text-green-400 bg-green-500/5">Cloned</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
