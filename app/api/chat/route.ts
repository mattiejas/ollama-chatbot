import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { message, model } = await request.json();

    try {
      const response = await fetch("http://0.0.0.0:11434/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          model: model || "llama3.2",
          prompt: message,
          stream: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get response from Ollama");
      }

      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          const reader = response.body?.getReader();
          if (!reader) {
            controller.close();
            return;
          }

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) {
                controller.close();
                break;
              }

              const text = new TextDecoder().decode(value);
              const lines = text.split("\n").filter(Boolean);

              for (const line of lines) {
                const json = JSON.parse(line);
                if (json.response) {
                  controller.enqueue(encoder.encode(json.response));
                }
              }
            }
          } catch (error) {
            controller.error(error);
          }
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    } catch (error) {
      console.error("Ollama API Error:", error);
      if (error instanceof TypeError && error.message.includes("fetch failed")) {
        return NextResponse.json(
          {
            error:
              "Unable to connect to Ollama. Please ensure Ollama is installed and running on your machine. You can start it by running 'ollama serve' in your terminal.",
          },
          { status: 503 }
        );
      }
      if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
    }
  } catch (error) {
    console.error("Request Error:", error);
    return NextResponse.json({ error: "Failed to process your request" }, { status: 400 });
  }
}

export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    }
  );
}
