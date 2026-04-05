import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { useTransitionMission } from "@/hooks/use-missions";
import type { Mission, MissionStatus } from "@/types/mission.types";
import { PlayCircle, CheckCircle, XCircle, ClipboardCheck } from "lucide-react";

const TRANSITION_LABELS: Record<string, { title: string; desc: string }> = {
  PRE_FLIGHT_CHECK: {
    title: "Start Pre-Flight Check",
    desc: "This will move the mission to pre-flight check status.",
  },
  IN_PROGRESS: {
    title: "Start Mission",
    desc: "This will start the mission and mark the assigned drone as in use.",
  },
};

function getAvailableTransitions(
  status: MissionStatus,
): { target: MissionStatus; label: string; icon: React.ElementType }[] {
  switch (status) {
    case "PLANNED":
      return [
        {
          target: "PRE_FLIGHT_CHECK",
          label: "Start Pre-Flight",
          icon: ClipboardCheck,
        },
        { target: "ABORTED", label: "Abort", icon: XCircle },
      ];
    case "PRE_FLIGHT_CHECK":
      return [
        { target: "IN_PROGRESS", label: "Start Mission", icon: PlayCircle },
        { target: "ABORTED", label: "Abort", icon: XCircle },
      ];
    case "IN_PROGRESS":
      return [
        { target: "COMPLETED", label: "Complete", icon: CheckCircle },
        { target: "ABORTED", label: "Abort", icon: XCircle },
      ];
    default:
      return [];
  }
}

interface MissionActionsProps {
  mission: Mission;
}

export function MissionActions({ mission }: MissionActionsProps) {
  const transitions = getAvailableTransitions(mission.status);
  const transitionMission = useTransitionMission();
  const [dialogType, setDialogType] = useState<
    "complete" | "abort" | "confirm" | null
  >(null);
  const [pendingTarget, setPendingTarget] = useState<MissionStatus | null>(
    null,
  );
  const [flightHours, setFlightHours] = useState("");
  const [abortReason, setAbortReason] = useState("");
  const [error, setError] = useState("");

  if (transitions.length === 0) return null;

  function handleTransitionClick(target: MissionStatus) {
    if (target === "COMPLETED") {
      setDialogType("complete");
      return;
    }
    if (target === "ABORTED") {
      setDialogType("abort");
      return;
    }
    setPendingTarget(target);
    setDialogType("confirm");
  }

  async function handleConfirmTransition() {
    if (!pendingTarget) return;
    setError("");
    try {
      await transitionMission.mutateAsync({
        id: mission.id,
        data: { status: pendingTarget },
      });
      setDialogType(null);
      setPendingTarget(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transition failed");
      setDialogType(null);
      setPendingTarget(null);
    }
  }

  async function handleComplete(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const hours = parseFloat(flightHours);
    if (isNaN(hours) || hours <= 0) {
      setError("Flight hours must be a positive number");
      return;
    }
    try {
      await transitionMission.mutateAsync({
        id: mission.id,
        data: { status: "COMPLETED", flightHours: hours },
      });
      setDialogType(null);
      setFlightHours("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  }

  async function handleAbort(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!abortReason.trim()) {
      setError("Abort reason is required");
      return;
    }
    try {
      await transitionMission.mutateAsync({
        id: mission.id,
        data: { status: "ABORTED", abortReason },
      });
      setDialogType(null);
      setAbortReason("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  }

  const confirmInfo = pendingTarget
    ? TRANSITION_LABELS[pendingTarget]
    : undefined;

  return (
    <>
      <div className="flex items-center justify-end gap-1">
        {transitions.map((t) => {
          const Icon = t.icon;
          return (
            <Button
              key={t.target}
              variant={t.target === "ABORTED" ? "ghost" : "outline"}
              size="sm"
              disabled={transitionMission.isPending}
              onClick={() => handleTransitionClick(t.target)}
              className={
                t.target === "ABORTED"
                  ? "text-destructive hover:bg-destructive/10"
                  : ""
              }
            >
              <Icon className="mr-1 h-3.5 w-3.5" />
              {t.label}
            </Button>
          );
        })}
      </div>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}

      <ConfirmDialog
        open={dialogType === "confirm" && !!confirmInfo}
        onOpenChange={(open) => {
          if (!open) {
            setDialogType(null);
            setPendingTarget(null);
          }
        }}
        title={confirmInfo?.title ?? ""}
        description={confirmInfo?.desc ?? ""}
        confirmLabel="Proceed"
        onConfirm={() => void handleConfirmTransition()}
        isPending={transitionMission.isPending}
      />

      <DialogPrimitive.Root
        open={dialogType === "complete"}
        onOpenChange={(open) => {
          if (!open) setDialogType(null);
        }}
      >
        <DialogPrimitive.Portal>
          <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/50" />
          <DialogPrimitive.Popup className="fixed top-1/2 left-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-card p-6 shadow-lg">
            <DialogPrimitive.Title className="text-lg font-semibold">
              Complete Mission
            </DialogPrimitive.Title>
            <form
              onSubmit={(e) => void handleComplete(e)}
              className="mt-4 space-y-4"
            >
              <div className="space-y-2">
                <label className="text-sm font-medium">Flight Hours</label>
                <Input
                  type="number"
                  step="0.1"
                  min="0.1"
                  placeholder="e.g. 2.5"
                  value={flightHours}
                  onChange={(e) => setFlightHours(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogType(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={transitionMission.isPending}>
                  Complete
                </Button>
              </div>
            </form>
          </DialogPrimitive.Popup>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>

      <DialogPrimitive.Root
        open={dialogType === "abort"}
        onOpenChange={(open) => {
          if (!open) setDialogType(null);
        }}
      >
        <DialogPrimitive.Portal>
          <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/50" />
          <DialogPrimitive.Popup className="fixed top-1/2 left-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-card p-6 shadow-lg">
            <DialogPrimitive.Title className="text-lg font-semibold">
              Abort Mission
            </DialogPrimitive.Title>
            <form
              onSubmit={(e) => void handleAbort(e)}
              className="mt-4 space-y-4"
            >
              <div className="space-y-2">
                <label className="text-sm font-medium">Reason</label>
                <Input
                  placeholder="e.g. Weather conditions"
                  value={abortReason}
                  onChange={(e) => setAbortReason(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogType(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={transitionMission.isPending}
                >
                  Abort Mission
                </Button>
              </div>
            </form>
          </DialogPrimitive.Popup>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  );
}
