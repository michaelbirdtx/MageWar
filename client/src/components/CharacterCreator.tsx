import { useState } from "react";
import { Specialization } from "@shared/schema";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Minus, Plus, Flame, Droplet } from "lucide-react";

interface CharacterCreatorProps {
  open: boolean;
  onComplete: (character: {
    name: string;
    intellect: number;
    stamina: number;
    wisdom: number;
    specialization: Specialization;
  }) => void;
}

const BASE_ATTRIBUTE = 10;
const MIN_ATTRIBUTE = 6;
const FREE_POINTS = 6;
const MAX_ATTRIBUTE = BASE_ATTRIBUTE + FREE_POINTS; // 16 max per attribute
const MAX_TOTAL_ATTRIBUTES = (3 * BASE_ATTRIBUTE) + FREE_POINTS; // 36 total points

export default function CharacterCreator({ open, onComplete }: CharacterCreatorProps) {
  const [name, setName] = useState("");
  const [intellect, setIntellect] = useState(BASE_ATTRIBUTE);
  const [stamina, setStamina] = useState(BASE_ATTRIBUTE);
  const [wisdom, setWisdom] = useState(BASE_ATTRIBUTE);
  const [specialization, setSpecialization] = useState<Specialization>("pyromancer");

  const totalAttributes = intellect + stamina + wisdom;
  const totalSpent = totalAttributes - (3 * BASE_ATTRIBUTE);
  const availablePoints = FREE_POINTS - totalSpent;

  const canIncrease = (attribute: number) => {
    // Can increase if attribute won't exceed max AND total won't exceed max
    return attribute < MAX_ATTRIBUTE && totalAttributes < MAX_TOTAL_ATTRIBUTES;
  };

  const canDecrease = (attribute: number) => {
    return attribute > MIN_ATTRIBUTE;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    // Ensure player hasn't exceeded total attribute limit
    if (totalAttributes > MAX_TOTAL_ATTRIBUTES) {
      return; // This should never happen with proper UI controls, but safety check
    }
    
    onComplete({
      name: name.trim(),
      intellect,
      stamina,
      wisdom,
      specialization,
    });
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md" data-testid="dialog-character-creator">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Create Your Mage</DialogTitle>
          <DialogDescription>
            Customize your mage's attributes and choose a specialization
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Mage Name</Label>
            <Input
              id="name"
              data-testid="input-mage-name"
              placeholder="Enter your mage's name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 pb-2 border-b">
              <span className="font-semibold">Attributes</span>
              <span className="text-sm text-muted-foreground" data-testid="text-available-points">
                Available Points: {availablePoints}
              </span>
            </div>

            <AttributeRocker
              label="Intellect"
              description="Affects maximum Mana"
              value={intellect}
              onIncrease={() => canIncrease(intellect) && setIntellect(intellect + 1)}
              onDecrease={() => canDecrease(intellect) && setIntellect(intellect - 1)}
              canIncrease={canIncrease(intellect)}
              canDecrease={canDecrease(intellect)}
              testId="intellect"
            />

            <AttributeRocker
              label="Stamina"
              description="Affects maximum Health"
              value={stamina}
              onIncrease={() => canIncrease(stamina) && setStamina(stamina + 1)}
              onDecrease={() => canDecrease(stamina) && setStamina(stamina - 1)}
              canIncrease={canIncrease(stamina)}
              canDecrease={canDecrease(stamina)}
              testId="stamina"
            />

            <AttributeRocker
              label="Wisdom"
              description="Affects Mana Regeneration"
              value={wisdom}
              onIncrease={() => canIncrease(wisdom) && setWisdom(wisdom + 1)}
              onDecrease={() => canDecrease(wisdom) && setWisdom(wisdom - 1)}
              canIncrease={canIncrease(wisdom)}
              canDecrease={canDecrease(wisdom)}
              testId="wisdom"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialization">Specialization</Label>
            <Select
              value={specialization}
              onValueChange={(value) => setSpecialization(value as Specialization)}
            >
              <SelectTrigger id="specialization" data-testid="select-specialization">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pyromancer" data-testid="option-pyromancer">
                  Pyromancer
                </SelectItem>
                <SelectItem value="aquamancer" data-testid="option-aquamancer">
                  Aquamancer
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {specialization === "pyromancer" 
                ? "Increased fire damage and reduced fire component costs"
                : "Increased water damage and reduced water component costs"}
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            data-testid="button-start-game"
            disabled={!name.trim() || totalAttributes > MAX_TOTAL_ATTRIBUTES}
          >
            Start Game
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface AttributeRockerProps {
  label: string;
  description: string;
  value: number;
  onIncrease: () => void;
  onDecrease: () => void;
  canIncrease: boolean;
  canDecrease: boolean;
  testId: string;
}

function AttributeRocker({
  label,
  description,
  value,
  onIncrease,
  onDecrease,
  canIncrease,
  canDecrease,
  testId,
}: AttributeRockerProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1">
        <div className="font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="icon"
          variant="outline"
          onClick={onDecrease}
          disabled={!canDecrease}
          data-testid={`button-decrease-${testId}`}
        >
          <Minus className="w-4 h-4" />
        </Button>
        <span className="w-8 text-center font-semibold" data-testid={`text-${testId}-value`}>
          {value}
        </span>
        <Button
          type="button"
          size="icon"
          variant="outline"
          onClick={onIncrease}
          disabled={!canIncrease}
          data-testid={`button-increase-${testId}`}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
