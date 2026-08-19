import React, { useEffect, useState } from "react";
import PerformanceRatedToast from "../notifications/PerformanceRatedToast";
import RateBlockModal, { formatBlockMinutes } from "./RateBlockModal";
import {
  finalizeActivePomodoroSession,
  logBlockRatingForCurrentSession,
  updateExistingBlockRating,
} from "../../services/pomoprogressService";
import { localBlockLoadKey, localBlockWorkTypeKey } from "../../services/pomoprogressService/sessionClientHelpers";
import type { PreviousBlockRating } from "../../lib/previousBlockRating";
import { useSessionStore } from "../../store/sessionStore";
import { minutesPerFocusBlock, type SessionWorkType } from "../sessionSetup/sessionSetupMath";

interface RatingProps {
  editBlock?: PreviousBlockRating | null;
  onCloseEdit?: () => void;
}

function restoreLocalBlockKeys(
  blockNumber: number,
  previousProductivity: string | null,
  previousLoad: string | null,
  previousWorkType: string | null
): void {
  const productivityKey = String(blockNumber);
  const loadKey = localBlockLoadKey(blockNumber);
  const workTypeKey = localBlockWorkTypeKey(blockNumber);
  if (previousProductivity === null) {
    window.localStorage.removeItem(productivityKey);
  } else {
    window.localStorage.setItem(productivityKey, previousProductivity);
  }
  if (previousLoad === null) {
    window.localStorage.removeItem(loadKey);
  } else {
    window.localStorage.setItem(loadKey, previousLoad);
  }
  if (previousWorkType === null) {
    window.localStorage.removeItem(workTypeKey);
  } else {
    window.localStorage.setItem(workTypeKey, previousWorkType);
  }
}

function writeLocalBlockKeys(blockNumber: number, productivity: number, load: number, workType: SessionWorkType): void {
  window.localStorage.setItem(String(blockNumber), String(productivity));
  window.localStorage.setItem(localBlockLoadKey(blockNumber), String(load));
  window.localStorage.setItem(localBlockWorkTypeKey(blockNumber), workType);
}

const Rating = ({ editBlock = null, onCloseEdit }: RatingProps) => {
  const isEdit = editBlock != null;
  const [modalOpen, setModalOpen] = useState(true);
  const [showRatedToast, setShowRatedToast] = useState(false);
  const [productivity, setProductivity] = useState(editBlock?.rating ?? 7);
  const [load, setLoad] = useState(editBlock?.load ?? 3);
  const [draftWorkType, setDraftWorkType] = useState<SessionWorkType>(editBlock?.workType ?? "Deep Work");

  const blockNum = useSessionStore((state) => state.blockNum);
  const numOfBreaks = useSessionStore((state) => state.numOfBreaks);
  const workMinutes = useSessionStore((state) => state.workMinutes);
  const breakMinutes = useSessionStore((state) => state.breakMinutes);
  const storeWorkType = useSessionStore((state) => state.workType);
  const setWorkType = useSessionStore((state) => state.setWorkType);
  const setHasUserRated = useSessionStore((state) => state.setHasUserRated);
  const activeSupabaseSessionId = useSessionStore((state) => state.activeSupabaseSessionId);
  const bumpChartDataRevision = useSessionStore((state) => state.bumpChartDataRevision);

  const totalBlocks = numOfBreaks + 1;
  const focusMinutes = workMinutes * 60 - numOfBreaks * breakMinutes;
  const currentBlockMinutes = minutesPerFocusBlock(focusMinutes, totalBlocks);
  const workType = isEdit ? draftWorkType : storeWorkType;

  useEffect(() => {
    if (!editBlock) {
      return;
    }
    setProductivity(editBlock.rating);
    setLoad(editBlock.load ?? 3);
    setDraftWorkType(editBlock.workType ?? "Deep Work");
  }, [editBlock]);

  const displayBlockNumber = editBlock?.blockNumber ?? blockNum;
  const displayBlockMinutes =
    editBlock?.durationSeconds != null ? editBlock.durationSeconds / 60 : currentBlockMinutes;
  const blockMetaLabel = editBlock
    ? `Block ${displayBlockNumber} • ${formatBlockMinutes(displayBlockMinutes)}`
    : `Block ${displayBlockNumber} of ${totalBlocks} • ${formatBlockMinutes(displayBlockMinutes)}`;

  const handleWorkTypeChange = (nextWorkType: SessionWorkType) => {
    if (isEdit) {
      setDraftWorkType(nextWorkType);
      return;
    }
    setWorkType(nextWorkType);
  };

  const completeLastBlockIfNeeded = () => {
    const store = useSessionStore.getState();
    if (store.blockNum !== store.numOfBreaks + 1) {
      return;
    }
    void finalizeActivePomodoroSession().then((finalizeResult) => {
      if (finalizeResult.error) {
        console.error("Failed to finalize pomodoro run on the server", finalizeResult.error);
        return;
      }
      const after = useSessionStore.getState();
      after.setSessionComplete(true);
      after.setBlockNum(0);
      after.setHasUserRated(false);
    });
  };

  const handleSave = () => {
    setHasUserRated(true);
    setModalOpen(false);
    setShowRatedToast(true);
    writeLocalBlockKeys(blockNum, productivity, load, workType);
    void logBlockRatingForCurrentSession(blockNum, productivity, load).then((result) => {
      if (result.error) {
        console.error("Failed to log block rating", result.error);
        return;
      }
      completeLastBlockIfNeeded();
    });
  };

  const handleUpdate = () => {
    if (!editBlock) {
      return;
    }

    const shouldWriteLocal = editBlock.sessionId == null || editBlock.sessionId === activeSupabaseSessionId;
    const previousProductivity = shouldWriteLocal ? window.localStorage.getItem(String(editBlock.blockNumber)) : null;
    const previousLoad = shouldWriteLocal ? window.localStorage.getItem(localBlockLoadKey(editBlock.blockNumber)) : null;
    const previousWorkType = shouldWriteLocal
      ? window.localStorage.getItem(localBlockWorkTypeKey(editBlock.blockNumber))
      : null;

    if (shouldWriteLocal) {
      writeLocalBlockKeys(editBlock.blockNumber, productivity, load, workType);
    }

    setModalOpen(false);
    onCloseEdit?.();

    if (editBlock.sessionId == null) {
      bumpChartDataRevision();
      return;
    }

    void updateExistingBlockRating({
      sessionId: editBlock.sessionId,
      blockNumber: editBlock.blockNumber,
      rating: productivity,
      load,
      workType,
    }).then((result) => {
      if (result.error) {
        if (shouldWriteLocal) {
          restoreLocalBlockKeys(editBlock.blockNumber, previousProductivity, previousLoad, previousWorkType);
        }
        return;
      }
      bumpChartDataRevision();
    });
  };

  const handleDismissEdit = () => {
    setModalOpen(false);
    onCloseEdit?.();
  };

  return (
    <div className="rating">
      <div className="ratingdiv">
        <RateBlockModal
          isOpen={modalOpen}
          idPrefix={isEdit ? "update-block" : "rate-block"}
          blockMetaLabel={blockMetaLabel}
          workType={workType}
          onWorkTypeChange={handleWorkTypeChange}
          productivity={productivity}
          onProductivityChange={setProductivity}
          load={load}
          onLoadChange={setLoad}
          submitLabel={isEdit ? "Update" : "Save & Continue"}
          onSubmit={isEdit ? handleUpdate : handleSave}
          allowDismiss={isEdit}
          onDismiss={isEdit ? handleDismissEdit : undefined}
        />
        {isEdit ? null : (
          <PerformanceRatedToast
            show={showRatedToast}
            blockNumber={blockNum}
            onDismiss={() => setShowRatedToast(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Rating;
