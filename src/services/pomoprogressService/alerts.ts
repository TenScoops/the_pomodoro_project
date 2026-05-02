import { showDataLoggingAlert } from "../../lib/dataLoggingAlerts";

export function alertBlockFailure(detail: string): void {
  showDataLoggingAlert("Block rating not saved", detail);
}

export function alertSessionUpdateFailure(detail: string): void {
  showDataLoggingAlert("Session could not be updated", detail);
}

export function alertSessionFinalizeFailure(detail: string): void {
  showDataLoggingAlert("Session could not be completed", detail);
}

export function alertHoursFailure(detail: string): void {
  showDataLoggingAlert("Hours not saved correctly", detail);
}

export function alertSessionTooEarly(detail: string): void {
  showDataLoggingAlert("Session marked complete too early", detail);
}
