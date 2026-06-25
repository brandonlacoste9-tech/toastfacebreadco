import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { OutboundSmsStatus } from "@/lib/usage/outbound-sms-status";
import { AlertTriangle, MessageSquareOff } from "lucide-react";
import Link from "next/link";

export function OutboundSmsBanner({
  dict,
  status,
}: {
  dict: Dictionary;
  status: OutboundSmsStatus;
}) {
  const t = dict.dashboard.smsStatus;

  if (status.paused) {
    return (
      <div
        className="card mt-6 flex gap-3 border-red-200 bg-red-50 p-4"
        role="alert"
      >
        <MessageSquareOff className="h-5 w-5 shrink-0 text-red-600" aria-hidden />
        <div className="min-w-0 text-sm">
          <p className="font-semibold text-red-800">{t.pausedTitle}</p>
          <p className="mt-1 text-red-700">{t.pausedBody}</p>
          {status.limit !== null && (
            <p className="mt-2 text-red-600">
              {t.usageLine.replace("{used}", String(status.used)).replace("{limit}", String(status.limit))}
            </p>
          )}
          <Link
            href="/dashboard/settings"
            className="mt-2 inline-block font-medium text-red-800 underline-offset-2 hover:underline"
          >
            {t.billingLink}
          </Link>
        </div>
      </div>
    );
  }

  if (status.enforce && status.percent !== null && status.percent >= 80) {
    return (
      <div
        className="card mt-6 flex gap-3 border-amber-200 bg-amber-50 p-4"
        role="status"
      >
        <AlertTriangle className="h-5 w-5 shrink-0 text-amber-700" aria-hidden />
        <div className="min-w-0 text-sm">
          <p className="font-semibold text-amber-900">{t.warnTitle}</p>
          <p className="mt-1 text-amber-800">{t.warnBody}</p>
        </div>
      </div>
    );
  }

  return null;
}