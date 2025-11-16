import ComponentLibrary from "../ComponentLibrary";

export default function ComponentLibraryExample() {
  return (
    <div className="p-4 max-w-2xl">
      <ComponentLibrary onComponentSelect={(comp) => console.log("Selected:", comp)} />
    </div>
  );
}
