import React, { useEffect, useRef, useState } from "react";
import { HiOutlineLockClosed, HiOutlineSparkles, HiOutlineXMark } from "react-icons/hi2";
import { useAuth } from "../../hooks/useAuth";
import { requestAiAnalysis } from "../../services/aiAnalyzeClient";
import type { AnalysisMode } from "../../types/aiAnalysis";
import type { CompactPeriodMetrics } from "../../types/aiMetrics";
import AiActionCards from "./AiActionCards";
import AiAnalysisResult, { type AiAnalysisViewStatus } from "./AiAnalysisResult";
import "./AiAssistantPanel.css";

interface AiAssistantPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

export default function AiAssistantPanel({ isOpen, onClose }: AiAssistantPanelProps) {
  const { session } = useAuth();
  const [askOpen, setAskOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [status, setStatus] = useState<AiAnalysisViewStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [text, setText] = useState("");
  const [metrics, setMetrics] = useState<CompactPeriodMetrics | null>(null);
  const [interpretationError, setInterpretationError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!isOpen) {
      abortRef.current?.abort();
    }
    return () => abortRef.current?.abort();
  }, [isOpen]);

  if (!isOpen) return null;

  const runAnalysis = async (mode: AnalysisMode, askQuestion?: string) => {
    const accessToken = session?.access_token;
    if (!accessToken) {
      setStatus("error");
      setErrorMessage("Sign in to analyze your data.");
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setStatus("loading");
    setErrorMessage("");
    setText("");
    setMetrics(null);
    setInterpretationError(null);

    try {
      const result = await requestAiAnalysis({
        mode,
        accessToken,
        question: askQuestion,
        signal: controller.signal,
      });
      if (result.status === "ok") {
        setText(result.text);
        setMetrics(result.metrics);
        setInterpretationError(result.interpretationError);
        setStatus("data");
        return;
      }
      if (result.status === "empty") {
        setStatus("empty");
        return;
      }
      setErrorMessage(result.message);
      setStatus("error");
    } catch (unknownError: unknown) {
      if (isAbortError(unknownError)) {
        return;
      }
      setErrorMessage("Analysis failed.");
      setStatus("error");
    }
  };

  const handleCardClick = (mode: AnalysisMode) => {
    if (mode === "ask") {
      setAskOpen(true);
      return;
    }
    setAskOpen(false);
    void runAnalysis(mode);
  };

  const handleAskSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = question.trim();
    if (!trimmed) {
      setStatus("error");
      setErrorMessage("Enter a question first.");
      return;
    }
    void runAnalysis("ask", trimmed);
  };

  return (
    <aside className="aiAssistant" aria-label="AI Assistant">
      <div className="aiAssistant__handle" aria-hidden />

      <header className="aiAssistant__header">
        <div className="aiAssistant__heading">
          <div className="aiAssistant__titleRow">
            <HiOutlineSparkles className="aiAssistant__sparkle" aria-hidden />
            <h2 className="aiAssistant__title">AI Assistant</h2>
          </div>
          <p className="aiAssistant__subtitle">Get insights and answers from your data.</p>
        </div>
        <button
          type="button"
          className="aiAssistant__close"
          aria-label="Close AI Assistant"
          onClick={onClose}
        >
          <HiOutlineXMark aria-hidden />
        </button>
      </header>

      <AiActionCards disabled={status === "loading"} onSelect={handleCardClick} />

      {askOpen && (
        <form className="aiAssistant__ask" onSubmit={handleAskSubmit}>
          <label className="aiAssistant__askLabel" htmlFor="ai-ask-question">
            Question
          </label>
          <textarea
            id="ai-ask-question"
            className="aiAssistant__askInput"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            maxLength={500}
            rows={3}
            placeholder="Ask about your productivity, energy, or load…"
            disabled={status === "loading"}
          />
          <button type="submit" className="aiAssistant__askSend" disabled={status === "loading"}>
            Ask
          </button>
        </form>
      )}

      <AiAnalysisResult
        status={status}
        errorMessage={errorMessage}
        text={text}
        metrics={metrics}
        interpretationError={interpretationError}
      />

      <div className="aiAssistant__privacy">
        <HiOutlineLockClosed className="aiAssistant__privacyIcon" aria-hidden />
        <p className="aiAssistant__privacyText">
          AI uses your data privately and securely. Your data is never shared.
        </p>
      </div>
    </aside>
  );
}
