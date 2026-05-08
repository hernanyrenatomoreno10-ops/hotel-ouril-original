// Soul — Concierge IA oficial do Ouril Mindelo Hotel.
// Usa a Lovable AI Gateway (sem necessidade de chave externa).

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Você é o "Soul", concierge interno e EXCLUSIVO do Ouril Mindelo Hotel (Cabo Verde, ilha de São Vicente).
Personalidade: caloroso, sereno, atento, sempre em português de Portugal de tom premium.
OBJECTIVO PRINCIPAL: incentivar o consumo dos serviços internos do hotel — Ouril Restaurant, Ouril Bar, Ouril SPA, Room Service — e da nossa parceria de saúde Medicentro. NUNCA sugira serviços, restaurantes, bares, tours ou clínicas externas, a menos que seja estritamente necessário (ex.: emergência médica grave ou pedido explícito e repetido do hóspede).
Conhecimento interno do hotel:
- Pequeno-almoço: 07h00 às 11h00 no Ouril Restaurant (piso 1).
- Ouril SPA: 09h00 às 21h00, marcações via app.
- Ginásio: 24h, acesso pela Digital Key.
- Piscina interior climatizada: 06h00 às 23h00.
- Ouril Bar / Lounge: 12h00 às 02h00, jazz e morna ao vivo às quintas e sábados.
- Medicentro (parceiro oficial de saúde): Clínica Geral, Fisioterapia, Nutrição e Psicologia, agendáveis via app, faturados directamente na conta do quarto.
Regras de prioridade (rígidas):
1. Comida ou bebida → SEMPRE chamar suggest_gastronomy com um item do Ouril Restaurant ou Ouril Bar.
2. Lazer, bem-estar, cultura → SEMPRE chamar suggest_experience com Ouril SPA, Ouril Lounge ou piscina interior.
3. Saúde, dores, cansaço, sono, nutrição → recomendar Medicentro (consulta agendável na app).
4. Pedidos físicos (toalhas, limpeza, manutenção, room service, gelo, água) → usar request_hotel_service.
Mantém respostas curtas (máx 2 frases) antes de chamar uma tool. Trate o hóspede pelo primeiro nome.`;

const tools = [
  {
    type: "function",
    function: {
      name: "request_hotel_service",
      description: "Cria um pedido de serviço físico interno do Ouril Mindelo (housekeeping, manutenção, room service).",
      parameters: {
        type: "object",
        properties: {
          service_type: { type: "string", description: "Categoria (Housekeeping, Room Service, Manutenção, Spa)" },
          description: { type: "string", description: "Descrição exacta do pedido do hóspede." },
        },
        required: ["service_type", "description"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "suggest_gastronomy",
      description: "Sugere um prato ou bebida do menu Ouril (preço em euros).",
      parameters: {
        type: "object",
        properties: {
          item_name: { type: "string" },
          price: { type: "number", description: "Preço em euros." },
          description: { type: "string" },
        },
        required: ["item_name", "price", "description"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "suggest_experience",
      description: "Sugere uma experiência (preferencialmente Ouril SPA, Ouril Lounge, ou parceiro local).",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          place: { type: "string" },
        },
        required: ["title", "place"],
      },
    },
  },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, userName } = await req.json();
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY missing");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: `${SYSTEM_PROMPT}\nO hóspede chama-se ${userName ?? "Hóspede"}.` },
          ...messages,
        ],
        tools,
        tool_choice: "auto",
      }),
    });

    if (response.status === 429) {
      return new Response(JSON.stringify({ error: "rate_limit", text: "Estou a receber muitos pedidos neste momento. Por favor tente novamente em instantes." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (response.status === 402) {
      return new Response(JSON.stringify({ error: "credits", text: "O serviço de IA precisa de ser recarregado pelo hotel." }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!response.ok) {
      const t = await response.text();
      throw new Error(`AI gateway: ${response.status} ${t}`);
    }

    const data = await response.json();
    const choice = data.choices?.[0]?.message;
    const toolCall = choice?.tool_calls?.[0];

    if (toolCall) {
      return new Response(JSON.stringify({
        type: "tool",
        name: toolCall.function.name,
        args: JSON.parse(toolCall.function.arguments || "{}"),
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ type: "text", text: choice?.content ?? "" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("soul-chat error:", err);
    return new Response(JSON.stringify({ error: String(err), text: "O Monte Cara está nublado por agora — a equipa técnica já foi notificada." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});