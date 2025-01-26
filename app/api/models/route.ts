import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch("http://0.0.0.0:11434/api/tags");

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to get models from Ollama");
    }

    const data = await response.json();
    const models = data.models.map((model: { name: string }) => ({
      name: model.name,
      value: model.name,
    }));

    return NextResponse.json({ models });
  } catch (error) {
    console.error("Ollama API Error:", error);
    if (error instanceof TypeError && error.message.includes("fetch failed")) {
      return NextResponse.json(
        {
          error: "Unable to connect to Ollama. Please ensure Ollama is installed and running on your machine.",
        },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: "Failed to fetch available models" }, { status: 500 });
  }
}
