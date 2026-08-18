import React from "react";
import {
  HiOutlineArrowTrendingUp,
  HiOutlineCalendarDays,
  HiOutlineChatBubbleLeftRight,
  HiOutlineChevronRight,
} from "react-icons/hi2";
import type { AnalysisMode } from "../../types/aiAnalysis";

type AiActionTone = "purple" | "blue" | "green";

interface AiActionCard {
  id: AnalysisMode;
  title: string;
  description: string;
  tone: AiActionTone;
}

const ACTION_CARDS: AiActionCard[] = [
  {
    id: "today",
    title: "Analyze Today",
    description: "Get a detailed breakdown and insights about your productivity for today.",
    tone: "purple",
  },
  {
    id: "week",
    title: "Analyze This Week",
    description: "See your weekly summary and how each day compares.",
    tone: "blue",
  },
  {
    id: "trends",
    title: "Analyze Trends",
    description: "Discover patterns and trends across weeks and months.",
    tone: "green",
  },
  {
    id: "ask",
    title: "Ask About My Data",
    description: "Ask any question about your productivity, energy, load, or anything else.",
    tone: "purple",
  },
];

function ActionIcon({ cardId }: { cardId: AnalysisMode }) {
  if (cardId === "today" || cardId === "week") return <HiOutlineCalendarDays aria-hidden />;
  if (cardId === "trends") return <HiOutlineArrowTrendingUp aria-hidden />;
  return <HiOutlineChatBubbleLeftRight aria-hidden />;
}

interface AiActionCardsProps {
  disabled: boolean;
  onSelect: (mode: AnalysisMode) => void;
}

export default function AiActionCards({ disabled, onSelect }: AiActionCardsProps) {
  return (
    <div className="aiAssistant__cards">
      {ACTION_CARDS.map((card) => (
        <button
          key={card.id}
          type="button"
          className="aiAssistant__card"
          disabled={disabled}
          onClick={() => onSelect(card.id)}
        >
          <span className={`aiAssistant__cardIcon aiAssistant__cardIcon--${card.tone}`}>
            <ActionIcon cardId={card.id} />
          </span>
          <span className="aiAssistant__cardCopy">
            <span className="aiAssistant__cardTitle">{card.title}</span>
            <span className="aiAssistant__cardDescription">{card.description}</span>
          </span>
          <HiOutlineChevronRight className="aiAssistant__cardChevron" aria-hidden />
        </button>
      ))}
    </div>
  );
}
