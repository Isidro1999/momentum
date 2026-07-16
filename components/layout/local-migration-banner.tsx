"use client";

import { useState } from "react";
import { useMigration } from "@/providers/migration-provider";

export function LocalMigrationBanner() {
  const {
    phase,
    summary,
    error,
    localCounts,
    canClearLocal,
    importNow,
    skipForNow,
    dismissSummary,
    clearLocalData,
  } = useMigration();
  const [confirmClear, setConfirmClear] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  if (phase === "checking" || phase === "idle") {
    return null;
  }

  if (phase === "prompt" && localCounts) {
    return (
      <div
        role="dialog"
        aria-labelledby="migration-title"
        className="mb-6 rounded-2xl border border-teal-200 bg-teal-50 px-4 py-4 text-sm text-teal-950"
      >
        <h2 id="migration-title" className="text-base font-semibold">
          Encontramos datos guardados en este navegador. ¿Querés importarlos a
          tu cuenta?
        </h2>
        <p className="mt-2 text-teal-900/80">
          Detectamos {localCounts.tasks} tareas, {localCounts.goals} objetivos,{" "}
          {localCounts.milestones} hitos y {localCounts.reviews} registros de
          bitácora. La importación no borra los datos locales.
        </p>
        {error ? (
          <p className="mt-2 text-rose-700" role="alert">
            {error}
          </p>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={isImporting}
            onClick={() => {
              setIsImporting(true);
              void importNow().finally(() => setIsImporting(false));
            }}
            className="rounded-xl bg-teal-700 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
          >
            {isImporting ? "Importando…" : "Importar ahora"}
          </button>
          <button
            type="button"
            disabled={isImporting}
            onClick={skipForNow}
            className="rounded-xl border border-teal-200 bg-white px-3 py-2 text-sm font-medium text-teal-800 hover:bg-teal-50 disabled:opacity-60"
          >
            Omitir por ahora
          </button>
        </div>
      </div>
    );
  }

  if (phase === "importing") {
    return (
      <div
        role="status"
        className="mb-6 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-700"
      >
        Importando datos locales a tu cuenta…
      </div>
    );
  }

  if (phase === "summary" && summary) {
    return (
      <div
        role="status"
        className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-950"
      >
        <h2 className="text-base font-semibold">Resumen de importación</h2>
        <ul className="mt-2 list-inside list-disc space-y-1 text-emerald-900/90">
          <li>Tareas importadas: {summary.tasksImported}</li>
          <li>Objetivos importados: {summary.goalsImported}</li>
          <li>Hitos importados: {summary.milestonesImported}</li>
          <li>Registros diarios importados: {summary.reviewsImported}</li>
          <li>
            Omitidos:{" "}
            {summary.tasksSkipped +
              summary.goalsSkipped +
              summary.milestonesSkipped +
              summary.reviewsSkipped}
          </li>
        </ul>
        {summary.errors.length > 0 ? (
          <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-amber-950">
            <p className="font-medium">
              Hubo {summary.errors.length} problema
              {summary.errors.length === 1 ? "" : "s"}. Podés reintentar; no se
              duplicarán los elementos ya importados.
            </p>
            <ul className="mt-1 list-inside list-disc text-amber-900/80">
              {summary.errors.slice(0, 5).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="mt-2 text-emerald-900/80">
            Importación completada. Los datos locales siguen en este navegador
            hasta que elijas eliminarlos.
          </p>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={dismissSummary}
            className="rounded-xl bg-emerald-800 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-900"
          >
            Entendido
          </button>
          {summary.errors.length > 0 ? (
            <button
              type="button"
              onClick={() => {
                setIsImporting(true);
                void importNow().finally(() => setIsImporting(false));
              }}
              className="rounded-xl border border-emerald-300 bg-white px-3 py-2 text-sm font-medium text-emerald-900 hover:bg-emerald-100"
            >
              Reintentar importación
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  if (phase === "done" && canClearLocal) {
    return (
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-700">
        <p className="font-medium text-slate-900">
          Todavía hay una copia local de tus datos en este navegador.
        </p>
        <p className="mt-1 text-slate-600">
          Ya están en tu cuenta. Podés eliminar la copia local cuando quieras.
        </p>
        {!confirmClear ? (
          <button
            type="button"
            onClick={() => setConfirmClear(true)}
            className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-800 hover:bg-rose-100"
          >
            Eliminar datos locales
          </button>
        ) : (
          <div className="mt-3 space-y-2">
            <p className="text-rose-800">
              ¿Confirmás borrar la copia local de este navegador? Tus datos en
              la cuenta no se tocan.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  clearLocalData();
                  setConfirmClear(false);
                }}
                className="rounded-xl bg-rose-700 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-800"
              >
                Sí, eliminar locales
              </button>
              <button
                type="button"
                onClick={() => setConfirmClear(false)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}
