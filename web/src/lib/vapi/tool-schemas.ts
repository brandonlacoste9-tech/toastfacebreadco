/** OpenAI-style function definitions for the JustBookMe Vapi assistant. */
export const VAPI_TOOL_FUNCTIONS = [
  {
    name: "check_availability",
    description:
      "Check open appointment slots for a service on a preferred date. Always call before offering times.",
    parameters: {
      type: "object",
      properties: {
        service_id: { type: "string", description: "UUID of the service from the services list" },
        service_name: {
          type: "string",
          description:
            "Service name if service_id unknown — match caller intent (e.g. haircut, sink repair, HVAC tune-up, dental cleaning)",
        },
        preferred_date: { type: "string", description: "YYYY-MM-DD in America/Montreal" },
        preferred_time: { type: "string", description: "HH:MM 24h optional" },
      },
      required: ["preferred_date"],
    },
  },
  {
    name: "create_appointment",
    description: "Book a confirmed appointment after the caller agrees to a slot.",
    parameters: {
      type: "object",
      properties: {
        customer_name: { type: "string" },
        customer_phone: { type: "string", description: "E.164 or 10-digit North American" },
        service_id: { type: "string" },
        service_name: { type: "string" },
        starts_at: { type: "string", description: "ISO8601 start time in America/Montreal" },
        locale: { type: "string", enum: ["fr", "en"] },
      },
      required: ["customer_name", "customer_phone", "starts_at"],
    },
  },
  {
    name: "capture_lead",
    description: "Save caller contact info when booking cannot be completed on the call.",
    parameters: {
      type: "object",
      properties: {
        phone: { type: "string" },
        name: { type: "string" },
        intent: { type: "string", description: "What the caller wanted" },
        locale: { type: "string", enum: ["fr", "en"] },
        urgency: { type: "string", enum: ["high", "medium", "low"], description: "Assess urgency based on caller tone and issue" },
        service_needed: { type: "string", description: "The specific service or issue they are calling about" },
        diagnostic_data: { type: "string", description: "Details gathered (e.g. 'Carrier AC leaking inside', 'Pain scale 8/10')" },
      },
      required: ["phone", "intent"],
    },
  },
] as const;

export type VapiToolName = (typeof VAPI_TOOL_FUNCTIONS)[number]["name"];