// Helpers PWA: registo do Service Worker + Push Notifications.
// O registo automático é feito pelo vite-plugin-pwa (injectRegister: "auto"),
// mas evitamos qualquer activação dentro de iframes/preview do Lovable.

const isInIframe = (() => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
})();

const isPreviewHost =
  typeof window !== "undefined" &&
  (window.location.hostname.includes("id-preview--") ||
    window.location.hostname.includes("lovableproject.com") ||
    window.location.hostname.includes("lovable.app"));

export const isPWAEligible = () =>
  typeof window !== "undefined" && "serviceWorker" in navigator && !isInIframe;

export const cleanupServiceWorkersInPreview = async () => {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  if (!(isPreviewHost || isInIframe)) return;
  try {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(regs.map((r) => r.unregister()));
  } catch {
    /* noop */
  }
};

/**
 * Pede permissão de notificações e regista a subscrição Push.
 * Aceita uma VAPID public key (configurar via VITE_VAPID_PUBLIC_KEY).
 * Devolve a PushSubscription serializável, pronta para enviar ao backend.
 */
export const subscribeToPush = async (): Promise<PushSubscription | null> => {
  if (!isPWAEligible() || !("PushManager" in window) || !("Notification" in window)) {
    return null;
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return null;

  const registration = await navigator.serviceWorker.ready;
  const existing = await registration.pushManager.getSubscription();
  if (existing) return existing;

  const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;
  if (!vapidKey) {
    console.warn("[PWA] VITE_VAPID_PUBLIC_KEY não definida — push subscription não criada.");
    return null;
  }

  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidKey),
  });
};

const urlBase64ToUint8Array = (base64String: string): Uint8Array<ArrayBuffer> => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const buffer = new ArrayBuffer(raw.length);
  const out = new Uint8Array(buffer);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
};