import React from "react";
import { BsClock, BsGrid3X3Gap, BsPerson, BsArrowUpRight } from "react-icons/bs";
import "./HubTodayDashboard.css";

// Static placeholder data — no fetching or session logic yet.
const TODAY_STATS = [
  { id: "time", value: "2h 18m", label: "Time worked", icon: BsClock },
  { id: "sessions", value: "4", label: "Sessions", icon: BsPerson },
  { id: "blocks", value: "8", label: "Blocks", icon: BsGrid3X3Gap },
  { id: "productivity", value: "9.2 /10", label: "Productivity", icon: BsArrowUpRight },
] as const;

const RECENT_SESSIONS = [
  {
    id: "today",
    dotClass: "hubTodayDashboard__dot--green",
    title: "Today",
    timeRange: "9:00 AM – 11:18 AM",
    duration: "2h 18m",
    blocks: "4 blocks",
    score: "9.2",
  },
  {
    id: "yesterday",
    dotClass: "hubTodayDashboard__dot--blue",
    title: "Yesterday",
    timeRange: "9:05 AM – 12:47 PM",
    duration: "3h 42m",
    blocks: "6 blocks",
    score: "9.6",
  },
  {
    id: "may12",
    dotClass: "hubTodayDashboard__dot--purple",
    title: "May 12",
    timeRange: "8:30 AM – 10:25 AM",
    duration: "1h 55m",
    blocks: "3 blocks",
    score: "8.8",
  },
] as const;

/** Today summary + recent sessions panel for the main hub (static UI only). */
export default function HubTodayDashboard() {
  return (
    <section className="hubTodayDashboard" aria-label="Today and recent sessions">
      <article className="hubTodayDashboard__card">
        <h2 className="hubTodayDashboard__heading">Today</h2>
        <div className="hubTodayDashboard__stats">
          {TODAY_STATS.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <React.Fragment key={stat.id}>
                {index > 0 ? <div className="hubTodayDashboard__statDivider" aria-hidden /> : null}
                <div className="hubTodayDashboard__stat">
                  <div className="hubTodayDashboard__statValueRow">
                    {stat.id === "time" ? <Icon className="hubTodayDashboard__statIcon" aria-hidden /> : null}
                    <span className="hubTodayDashboard__statValue">{stat.value}</span>
                    {stat.id !== "time" ? <Icon className="hubTodayDashboard__statIcon" aria-hidden /> : null}
                  </div>
                  <span className="hubTodayDashboard__statLabel">
                    {stat.id === "time" ? <BsClock className="hubTodayDashboard__labelIcon" aria-hidden /> : null}
                    {stat.label}
                  </span>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </article>

      <article className="hubTodayDashboard__card">
        <div className="hubTodayDashboard__recentHeader">
          <h2 className="hubTodayDashboard__heading">Recent sessions</h2>
          <span className="hubTodayDashboard__viewAll">View all</span>
        </div>
        <ul className="hubTodayDashboard__sessionList">
          {RECENT_SESSIONS.map((session) => (
            <li key={session.id} className="hubTodayDashboard__sessionRow">
              <span className={`hubTodayDashboard__dot ${session.dotClass}`} aria-hidden />
              <div className="hubTodayDashboard__sessionMain">
                <div className="hubTodayDashboard__sessionTitleRow">
                  <span className="hubTodayDashboard__sessionTitle">{session.title}</span>
                  <span className="hubTodayDashboard__sessionTime">{session.timeRange}</span>
                </div>
                <div className="hubTodayDashboard__sessionMeta">
                  <span>{session.duration}</span>
                  <span>{session.blocks}</span>
                </div>
              </div>
              <span className="hubTodayDashboard__scoreBadge">{session.score}</span>
            </li>
          ))}
        </ul>
      </article>
    </section>
  );
}
