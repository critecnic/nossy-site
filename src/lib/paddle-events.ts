// ─── Paddle.js v2 event bus (site-wide) ─────────────────────────────────
// Paddle.js v2 does NOT expose Paddle.on(). Events are delivered ONLY via
// the `eventCallback` option passed to Paddle.Initialize(). Since both
// PaddleAutoOpen (root layout) and PaddlePayment (job page) can be the one
// to initialize, they share this tiny window-level registry so handlers
// registered anywhere receive every checkout event.

export interface PaddleEvent {
  name: string;
  data?: any;
  error?: any;
}

type PaddleEventHandler = (event: PaddleEvent) => void;

function registry(): PaddleEventHandler[] {
  if (typeof window === 'undefined') return [];
  const w = window as any;
  if (!Array.isArray(w.__nossyPaddleHandlers)) w.__nossyPaddleHandlers = [];
  return w.__nossyPaddleHandlers;
}

/** eventCallback passed to Paddle.Initialize() — dispatches to the registry. */
export function paddleEventCallback(event: PaddleEvent): void {
  for (const fn of registry()) {
    try {
      fn(event);
    } catch {
      /* a broken handler must never break the checkout */
    }
  }
}

/**
 * Registers a checkout event handler.
 * Returns an unsubscribe function (call after the event you wait for fires,
 * or on cleanup, so repeated "Pay" clicks don't accumulate handlers).
 */
export function addPaddleHandler(fn: PaddleEventHandler): () => void {
  const list = registry();
  list.push(fn);
  return () => {
    const i = list.indexOf(fn);
    if (i >= 0) list.splice(i, 1);
  };
}
