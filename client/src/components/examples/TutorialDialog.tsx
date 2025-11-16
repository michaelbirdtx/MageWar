import { useState } from "react";
import TutorialDialog from "../TutorialDialog";
import { Button } from "@/components/ui/button";

export default function TutorialDialogExample() {
  const [open, setOpen] = useState(false);
  
  return (
    <div className="p-4">
      <Button onClick={() => setOpen(true)}>Open Tutorial</Button>
      <TutorialDialog open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
