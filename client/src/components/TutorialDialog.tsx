import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Flame, Droplet, Mountain, Wind } from "lucide-react";

interface TutorialDialogProps {
  open: boolean;
  onClose: () => void;
}

const tutorialSteps = [
  {
    title: "Welcome to Mage War!",
    description: "Learn how to craft powerful spells by combining elemental components. Let's start with the basics.",
    content: (
      <div className="flex flex-col gap-3">
        <p className="text-sm">In Mage War, you build custom spells using four elemental types:</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
            <Flame className="w-5 h-5 text-red-600 dark:text-red-400" />
            <span className="font-medium text-sm">Fire</span>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
            <Droplet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="font-medium text-sm">Water</span>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
            <Mountain className="w-5 h-5 text-amber-700 dark:text-amber-500" />
            <span className="font-medium text-sm">Earth</span>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800">
            <Wind className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            <span className="font-medium text-sm">Air</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Building a Fireball",
    description: "Create your first spell by combining components in the right order.",
    content: (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium">To craft a Fireball spell:</p>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>Drag <strong>Air Sphere</strong> (container) to the spell builder</li>
          <li>Drag <strong>Sulfur</strong> (earth material) into the Air Sphere</li>
          <li>Add <strong>Spark</strong> (fire action) to ignite it</li>
          <li>Add <strong>Gust</strong> (air action) to propel it forward</li>
        </ol>
        <p className="text-sm text-muted-foreground mt-2">
          The spell builder will automatically calculate damage and mana cost based on your components!
        </p>
      </div>
    ),
  },
  {
    title: "Combat Basics",
    description: "Use your crafted spells to defeat your opponent in turn-based combat.",
    content: (
      <div className="flex flex-col gap-3">
        <p className="text-sm">Once you've built a spell:</p>
        <ul className="list-disc list-inside space-y-2 text-sm">
          <li>Click <strong>Cast Spell</strong> if you have enough mana</li>
          <li>Watch the spell animation in the Battle Arena</li>
          <li>Damage is dealt to your opponent</li>
          <li>Turns alternate between you and the opponent</li>
        </ul>
        <p className="text-sm text-muted-foreground mt-2">
          Victory is achieved when your opponent's health reaches zero!
        </p>
      </div>
    ),
  },
];

export default function TutorialDialog({ open, onClose }: TutorialDialogProps) {
  const [currentStep, setCurrentStep] = useState(0);
  
  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
      setCurrentStep(0);
    }
  };
  
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const step = tutorialSteps[currentStep];
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" data-testid="dialog-tutorial">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">{step.title}</DialogTitle>
          <DialogDescription>{step.description}</DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {step.content}
        </div>
        
        <DialogFooter className="flex items-center justify-between">
          <div className="flex gap-1">
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentStep ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
          
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button variant="outline" onClick={handleBack} data-testid="button-tutorial-back">
                Back
              </Button>
            )}
            <Button onClick={handleNext} data-testid="button-tutorial-next">
              {currentStep < tutorialSteps.length - 1 ? "Next" : "Start Playing"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
