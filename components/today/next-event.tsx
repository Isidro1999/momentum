import { Clock3, MapPin } from "lucide-react";
import type { CalendarEvent } from "@/types";

interface NextEventProps {
  event?: CalendarEvent | null;
}

export function NextEvent({ event = null }: NextEventProps) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          Próximo evento
        </p>
        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">
          Pronto
        </span>
      </div>

      {event ? (
        <>
          <h3 className="mt-2 text-lg font-semibold text-slate-900">
            {event.title}
          </h3>
          <div className="mt-4 space-y-2.5">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Clock3 className="size-4 shrink-0 text-slate-400" aria-hidden />
              <span>
                {event.startTime} a {event.endTime}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <MapPin className="size-4 shrink-0 text-slate-400" aria-hidden />
              <span>{event.location}</span>
            </div>
          </div>
        </>
      ) : (
        <>
          <h3 className="mt-2 text-lg font-semibold text-slate-900">
            Calendario próximamente
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Cuando el módulo esté disponible, acá vas a ver tu próximo evento
            del día.
          </p>
        </>
      )}
    </section>
  );
}
