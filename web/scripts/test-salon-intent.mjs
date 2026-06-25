#!/usr/bin/env node
/**
 * Smoke test for salon-intent-bridge.
 * Run: npx tsx scripts/test-salon-intent.mjs
 */
import { parseSalonBookingIntent } from "../src/lib/intent/salon-intent-bridge.ts";

const NOW = new Date("2026-06-24T12:00:00-04:00");

const expectations = [
  ["Je voudrais une coupe demain à 14h", (r) => r?.action === "booking.create" && r.confidence === "high"],
  ["Book a manicure tomorrow at 2pm", (r) => r?.action === "booking.create"],
  ["Mon lavabo fuit", (r) => r === null],
  ["Je veux parler à quelqu'un svp", (r) => r?.action === "transfer.human"],
  ["Annuler mon rendez-vous de mardi", (r) => r?.action === "booking.cancel"],
  ["Balayage vendredi à 10h30", (r) => r?.action === "booking.create" && r.confidence === "high"],
  ["I need a skin fade tomorrow at 3pm", (r) => r?.action === "booking.create" && r?.service === "coupe"],
];

let passed = 0;
for (const [text, check] of expectations) {
  const result = parseSalonBookingIntent(text, NOW);
  const ok = check(result);
  console.log(`${ok ? "✓" : "✗"} "${text}"`);
  if (!ok) console.log("  ", result);
  if (ok) passed++;
}

console.log(`\n${passed}/${expectations.length} passed`);
process.exit(passed === expectations.length ? 0 : 1);