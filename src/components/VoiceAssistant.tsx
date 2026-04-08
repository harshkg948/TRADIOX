import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2, VolumeX, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "motion/react";
import { processVoiceCommand } from "../lib/gemini";
import { toast } from "sonner";

interface VoiceAssistantProps {
  portfolio: any;
  onAction: (action: any) => void;
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ portfolio, onAction }) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;

        recognitionRef.current.onresult = (event: any) => {
          const current = event.resultIndex;
          const transcriptText = event.results[current][0].transcript;
          setTranscript(transcriptText);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
          if (transcript) {
            handleProcessCommand(transcript);
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
          toast.error("Speech recognition failed: " + event.error);
        };
      }
      synthesisRef.current = window.speechSynthesis;
    }
  }, [transcript]);

  const handleProcessCommand = async (text: string) => {
    setIsProcessing(true);
    try {
      const result = await processVoiceCommand(text, portfolio);
      setResponse(result.response);
      speak(result.response);
      if (result.action && result.action.type !== "none") {
        onAction(result.action);
      }
    } catch (error) {
      console.error("Error processing command", error);
      toast.error("Failed to process command");
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setTranscript("");
      setResponse("");
      stopSpeaking();
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const speak = (text: string) => {
    if (synthesisRef.current) {
      stopSpeaking();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      synthesisRef.current.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if (synthesisRef.current) {
      synthesisRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <Card className="organic-card overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-widest text-muted-foreground">
          <Mic className="w-4 h-4 text-primary" /> Nature AI Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative h-32 leaf-gradient blob-shape flex items-center justify-center overflow-hidden soft-shadow animate-sway">
          {/* Animated background patterns */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--color-accent)_0%,_transparent_70%)] animate-pulse-soft" />
          </div>
          
          <AnimatePresence mode="wait">
            {isListening ? (
              <motion.div 
                key="listening"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="flex items-center gap-1"
              >
                {[1, 2, 3, 4, 5].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ height: [10, 30, 10] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                    className="w-1.5 bg-white rounded-full"
                  />
                ))}
              </motion.div>
            ) : isProcessing ? (
              <motion.div
                key="processing"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              >
                <Loader2 className="w-8 h-8 text-white" />
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-white/80 text-center px-4"
              >
                <p className="text-xs font-medium italic">"How can I help your portfolio grow today?"</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-3">
          {transcript && (
            <div className="p-3 rounded-[16px] bg-muted/50 border border-border">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">You said:</p>
              <p className="text-xs font-medium italic">"{transcript}"</p>
            </div>
          )}
          
          {response && (
            <div className="p-3 rounded-[16px] bg-primary/5 border border-primary/10 animate-in fade-in slide-in-from-top-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Nature AI:</p>
              <p className="text-xs font-medium leading-relaxed">{response}</p>
            </div>
          )}

          <Button 
            onClick={toggleListening}
            variant={isListening ? "destructive" : "default"}
            className="w-full rounded-full h-12 font-bold uppercase tracking-widest soft-shadow"
            disabled={isProcessing}
          >
            {isListening ? "Stop Listening" : "Speak to Assistant"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
