import ElementIcon from "../ElementIcon";

export default function ElementIconExample() {
  return (
    <div className="flex gap-4 p-4">
      <ElementIcon element="fire" />
      <ElementIcon element="water" />
      <ElementIcon element="earth" />
      <ElementIcon element="air" />
    </div>
  );
}
