async function run() {
  const apiKey = 'AIzaSyDWkAfP85Gj8gz9PjAnhlCAM1CKAq9ExWE';
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const text = "Adicione uma despesa de 50 reais no Ifood";
  const prompt = `Você é um assistente financeiro de um aplicativo. Você deve analisar a frase do usuário e extrair a intenção retornando APENAS um objeto JSON válido (sem formatação markdown como \`\`\`json).
Ações possíveis:
1. createTransaction: { "action": "createTransaction", "type": "income" ou "expense", "amount": numero, "category": string, "description": string, "installments": numero (opcional, default 1) }
2. createBill: { "action": "createBill", "name": string, "amount": numero, "dueDay": numero, "type": "assinatura" ou "boleto" }
3. chat: { "action": "chat", "message": string } (Para conversas normais ou perguntas fora do escopo de adição)

Categorias possíveis para despesas: 'Alimentação', 'Compras', 'Transporte', 'Lazer', 'Assinaturas', 'Moradia', 'Investimento', 'Outros'.
Categorias para receitas: 'Salário', 'Investimento', 'Outros'.`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt + '\nFrase: "' + text + '"' }] }],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: "application/json",
      }
    })
  });

  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  console.log("Raw text:", rawText);
}
run();
