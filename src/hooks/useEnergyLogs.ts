import { useCallback, useEffect, useState } from "react";
import type { EnergyLevel } from "../constants/energyLevels";
import { todayLocalISODate } from "../lib/calendarDates";
import { getEnergyLogs, persistEnergyLogForToday, type EnergyLogRecord } from "../services/pomoprogressService";
import { useAuth } from "./useAuth";

export type EnergyLogsStatus = "loading" | "error" | "ready";
export type EnergySaveStatus = "idle" | "saving" | "saved";

export interface UseEnergyLogsResult {
  status: EnergyLogsStatus;
  saveStatus: EnergySaveStatus;
  logs: EnergyLogRecord[];
  todayLog: EnergyLogRecord | null;
  saveToday: (energy: EnergyLevel, note: string) => void;
  reload: () => void;
}

function upsertTodayLog(logs: EnergyLogRecord[], nextLog: EnergyLogRecord): EnergyLogRecord[] {
  const withoutToday = logs.filter((log) => log.date !== nextLog.date);
  return [nextLog, ...withoutToday];
}

export function useEnergyLogs(): UseEnergyLogsResult {
  const { user, loading: authLoading } = useAuth();
  const [status, setStatus] = useState<EnergyLogsStatus>("loading");
  const [saveStatus, setSaveStatus] = useState<EnergySaveStatus>("idle");
  const [logs, setLogs] = useState<EnergyLogRecord[]>([]);

  const reload = useCallback(() => {
    if (authLoading) {
      return;
    }
    if (!user) {
      setLogs([]);
      setStatus("ready");
      return;
    }

    setStatus("loading");
    void getEnergyLogs().then((result) => {
      if (result.error) {
        setLogs([]);
        setStatus("error");
        return;
      }
      setLogs(result.data);
      setStatus("ready");
    });
  }, [authLoading, user]);

  useEffect(() => {
    reload();
  }, [reload]);

  const todayIso = todayLocalISODate();
  const todayLog = logs.find((log) => log.date === todayIso) ?? null;

  const saveToday = (energy: EnergyLevel, note: string) => {
    if (saveStatus === "saving") {
      return;
    }

    const previousLogs = logs;
    const optimistic: EnergyLogRecord = {
      id: todayLog?.id ?? `draft-${todayIso}`,
      date: todayIso,
      energy,
      note: note.trim(),
    };
    setLogs(upsertTodayLog(logs, optimistic));
    setSaveStatus("saving");

    void persistEnergyLogForToday(energy, note).then((result) => {
      if (result.error) {
        setLogs(previousLogs);
        setSaveStatus("idle");
        return;
      }
      setSaveStatus("saved");
      void getEnergyLogs().then((reloadResult) => {
        if (!reloadResult.error) {
          setLogs(reloadResult.data);
        }
      });
    });
  };

  return { status, saveStatus, logs, todayLog, saveToday, reload };
}
