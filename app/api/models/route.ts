import { fetchFreeModels } from "@/app/arena/models";

export async function GET() {
  try {
    const models = await fetchFreeModels();
    return Response.json({ models });
  } catch (error) {
    console.error("Failed to fetch OpenRouter models:", error);
    return Response.json(
      { error: "Could not load the model list. Please try again." },
      { status: 502 },
    );
  }
}
