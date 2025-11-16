import ComponentCard from "../ComponentCard";

export default function ComponentCardExample() {
  const sampleComponent = {
    id: "spark",
    name: "Spark",
    element: "fire" as const,
    type: "action" as const,
    description: "Ignites flammable materials",
    manaCost: 5,
  };
  
  return (
    <div className="p-4 max-w-xs">
      <ComponentCard component={sampleComponent} />
    </div>
  );
}
