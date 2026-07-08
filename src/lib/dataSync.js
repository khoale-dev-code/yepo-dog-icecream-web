const CHANNEL_NAME = "yepo-admin-sync";
const STORAGE_KEY = "yepo:last-data-change";

function createMessage(payload = {}) {
  return {
    type: "DATA_CHANGED",
    resource: payload.resource || "all",
    action: payload.action || "update",
    at: Date.now(),
  };
}

function getBroadcastChannel() {
  if (typeof window === "undefined") return null;
  if (!("BroadcastChannel" in window)) return null;

  return new BroadcastChannel(CHANNEL_NAME);
}

export function notifyDataChanged(payload = {}) {
  if (typeof window === "undefined") return;

  const message = createMessage(payload);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(message));

  const channel = getBroadcastChannel();
  channel?.postMessage(message);
  channel?.close();
}

export function subscribeDataChanged(callback) {
  if (typeof window === "undefined") return () => {};

  const channel = getBroadcastChannel();

  function handleBroadcast(event) {
    if (event.data?.type === "DATA_CHANGED") {
      callback(event.data);
    }
  }

  function handleStorage(event) {
    if (event.key !== STORAGE_KEY || !event.newValue) return;

    try {
      const message = JSON.parse(event.newValue);

      if (message?.type === "DATA_CHANGED") {
        callback(message);
      }
    } catch {
      // Ignore invalid localStorage payload.
    }
  }

  channel?.addEventListener("message", handleBroadcast);
  window.addEventListener("storage", handleStorage);

  return () => {
    channel?.removeEventListener("message", handleBroadcast);
    channel?.close();
    window.removeEventListener("storage", handleStorage);
  };
}


