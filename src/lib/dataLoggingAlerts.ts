import { useSessionStore } from "../store/sessionStore";

/** Persistent (manual dismiss) error surfaced when DB logging fails or looks inconsistent. */
export function showDataLoggingAlert(title: string, body: string): void {
  useSessionStore.getState().setDataLoggingAlert({ title, body });
}

export function clearDataLoggingAlert(): void {
  useSessionStore.getState().setDataLoggingAlert(null);
}
