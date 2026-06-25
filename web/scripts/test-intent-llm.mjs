#!/usr/bin/env node
/**
 * Test LLM intent fallback via Ollama/Gemma4.
 * Requires Ollama running locally with gemma4 pulled.
 * Run: npx tsx scripts/test-intent-llm.mjs
 */
import { parseSalonBookingIntentWithFallback } from "../src/lib/intent/salon-intent-bridge.ts";
import { ollamaHealth } from "../src/lib/llm/ollama.ts";

const health = await ollamaHealth();
if (!health.ok) {
  console.error("✗ Ollama not reachable — start Ollama and run: ollama pull gemma4");
  process.exit(1);
}
console.log(`✓ Ollama OK — models: ${health.models?.join(", ")}\n`);

const cases = [
  {
    text: "chu chaud pour faire beau mes cheveux jeudi en après-midi",
    check: (r) => r.intent?.action === "booking.create" && r.source === "llm",
  },
  {
    text: "Je voudrais une coupe demain à 14h",
    check: (r) => r.intent?.action === "booking.create" && r.source === "regex",
  },
];

let passed = 0;
for (const { text, check } of cases) {
  const result = await parseSalonBookingIntentWithFallback(text);
  const ok = check(result);
  console.log(`${ok ? "✓" : "✗"} [${result.source ?? "null"}] "${text}"`);
  if (!ok) console.log("   ", result);
  if (ok) passed++;
}

console.log(`\n${passed}/${cases.length} passed`);
process.exit(passed === cases.length ? 0 : 1);