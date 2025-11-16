import { Flame, Droplet, Mountain, Wind } from "lucide-react";
import { ElementType } from "@shared/schema";

interface ElementIconProps {
  element: ElementType;
  className?: string;
}

export default function ElementIcon({ element, className = "w-4 h-4" }: ElementIconProps) {
  const icons = {
    fire: Flame,
    water: Droplet,
    earth: Mountain,
    air: Wind,
  };
  
  const Icon = icons[element];
  return <Icon className={className} />;
}
