import Chat from "./components/Chat";

async function getModels() {
  const response = await fetch("http://0.0.0.0:11434/api/tags");
  if (!response.ok) {
    throw new Error("Failed to fetch models");
  }
  const data = await response.json();
  return data.models.map((model: { name: string }) => ({
    name: model.name,
    value: model.name,
  }));
}

export default async function Home() {
  const models = await getModels();

  return (
    <div className="min-h-screen bg-gray-50">
      <Chat models={models} />
    </div>
  );
}
