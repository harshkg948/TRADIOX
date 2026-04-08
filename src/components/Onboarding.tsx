import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GraduationCap, BookOpen, ShieldCheck, TrendingUp, ChevronRight, ChevronLeft } from "lucide-react";
import { getEducationalContent } from "../lib/gemini";
import { motion, AnimatePresence } from "motion/react";

export const Onboarding: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [content, setContent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const hasOnboarded = localStorage.getItem("tradiox_onboarded");
    if (!hasOnboarded) {
      setIsOpen(true);
    }
  }, []);

  const steps = [
    {
      title: "Welcome to TRADIOX",
      description: "Your AI-powered companion for intelligent trading.",
      icon: <TrendingUp className="w-12 h-12 text-primary" />,
      text: "TRADIOX uses advanced Gemini AI to analyze markets, assess risks, and help you make informed decisions. Whether you're a pro or a beginner, we've got you covered."
    },
    {
      title: "Learn the Basics",
      description: "AI-curated learning materials just for you.",
      icon: <BookOpen className="w-12 h-12 text-primary" />,
      topic: "Stock Market Basics"
    },
    {
      title: "Risk Management",
      description: "Protecting your capital is our priority.",
      icon: <ShieldCheck className="w-12 h-12 text-primary" />,
      topic: "Risk Management Strategies"
    }
  ];

  const handleNext = async () => {
    if (step < steps.length - 1) {
      const nextStep = step + 1;
      setStep(nextStep);
      if (steps[nextStep].topic) {
        setIsLoading(true);
        try {
          const data = await getEducationalContent(steps[nextStep].topic!);
          setContent(data);
        } catch (error) {
          console.error("Error fetching educational content", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setContent(null);
      }
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    localStorage.setItem("tradiox_onboarded", "true");
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px] organic-card border-primary/20 p-8">
        <DialogHeader>
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 leaf-gradient blob-shape flex items-center justify-center soft-shadow animate-float">
              {React.cloneElement(steps[step].icon as React.ReactElement, { className: "w-10 h-10 text-white" })}
            </div>
          </div>
          <DialogTitle className="text-3xl text-center font-serif font-bold text-primary">{steps[step].title}</DialogTitle>
          <DialogDescription className="text-center text-muted-foreground font-medium italic mt-2">
            {steps[step].description}
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 min-h-[200px]">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-full space-y-4"
              >
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-muted-foreground">AI is preparing your lesson...</p>
              </motion.div>
            ) : content ? (
              <motion.div
                key="content"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <h4 className="font-bold text-primary">{content.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{content.content}</p>
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Key Tips:</p>
                  <ul className="space-y-1">
                    {content.tips.map((tip: string, i: number) => (
                      <li key={i} className="text-xs flex items-start gap-2">
                        <span className="text-primary">•</span> {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="intro"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-sm text-muted-foreground leading-relaxed"
              >
                {steps[step].text}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <DialogFooter className="flex justify-between sm:justify-between items-center">
          <div className="flex gap-1">
            {steps.map((_, i) => (
              <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === step ? 'bg-primary' : 'bg-muted'}`} />
            ))}
          </div>
          <div className="flex gap-2">
            {step > 0 && (
              <Button variant="ghost" className="rounded-full font-serif text-lg" onClick={() => setStep(step - 1)}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </Button>
            )}
            <Button className="rounded-full font-serif text-lg px-8" onClick={handleNext}>
              {step === steps.length - 1 ? "Get Started" : "Next"} <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
