import { useEffect, useRef } from "react";
import { api } from "../../lib/api";
import { useSnackbar } from "../../components/ui/SnackbarProvider";

function getLatestReservationId(reservations = []) {
  return reservations[0]?._id || reservations[0]?.id || "";
}

export function useReservationWatcher({ enabled = true, intervalMs = 18000 } = {}) {
  const toast = useSnackbar();
  const latestReservationIdRef = useRef("");
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!enabled) return undefined;

    let cancelled = false;

    async function checkReservations() {
      try {
        const result = await api.reservations.list();
        const reservations = result.reservations || [];
        const latestId = getLatestReservationId(reservations);
        const latestReservation = reservations[0];

        if (!latestId) return;

        if (!initializedRef.current) {
          initializedRef.current = true;
          latestReservationIdRef.current = latestId;
          return;
        }

        if (latestId !== latestReservationIdRef.current) {
          latestReservationIdRef.current = latestId;

          if (!cancelled) {
            toast.info(
              latestReservation?.customerName
                ? `${latestReservation.customerName} vừa gửi đặt bàn.`
                : "Có khách vừa gửi đặt bàn.",
              "Đặt bàn mới"
            );
          }
        }
      } catch {
        // Không toast lỗi polling để tránh làm phiền admin.
      }
    }

    checkReservations();

    const timer = window.setInterval(checkReservations, intervalMs);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [enabled, intervalMs, toast]);
}
