import ComponentCard from "../ComponentCard";

export default function ComponentCardExample() {
  const sampleComponent = {
    id: "spark",
    name: "Spark",
    element: "fire" as const,
    type: "action" as const,
    role: "activation" as const,
    description: "Ignites flammable materials",
    manaCost: 5,
    baseDamage: 1,
    damageMultiplier: 1,
  };
  
  return (
    <div className="p-4 max-w-xs">
      <ComponentCard component={sampleComponent} />
    </div>
  );
}
