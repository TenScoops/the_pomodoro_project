import React from "react";

type TimerSessionSummaryProps = {
  showData: boolean;
  totalWorkTimeMinutes: number;
  totalBreakTimeMinutes: number;
  totalBlocks: number;
  perBlockTimeLabel: string;
};

export default function TimerSessionSummary({
  showData,
  totalWorkTimeMinutes,
  totalBreakTimeMinutes,
  totalBlocks,
  perBlockTimeLabel,
}: TimerSessionSummaryProps) {
  if (!showData) {
    return null;
  }

  return (
    <div
      className="showUserData"
      style={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}
    >
      <div className="blockdiv">
        <p>&nbsp;Your session &nbsp;</p>
      </div>
      <div className="blockdiv">
        <p>&nbsp;Will have {totalWorkTimeMinutes} minutes of worktime&nbsp;</p>
      </div>
      <div className="blockdiv">
        <p>&nbsp;And {totalBreakTimeMinutes} minutes of breaktime&nbsp;</p>
      </div>
      <div style={{ marginLeft: "15px" }} className="blockdiv">
        <p style={{ color: "black", backgroundColor: "white" }}>
          &nbsp;Session will be completed in {totalBlocks} block(s)&nbsp;
        </p>
      </div>
      <div className="blockdiv">
        <p>&nbsp;With {perBlockTimeLabel} minutes per block&nbsp;</p>
      </div>
    </div>
  );
}

