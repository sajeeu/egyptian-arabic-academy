/* Service worker for the Conversation Translator: it only shows the "Translation ready" notification and opens the
   Translator page when it is tapped. It does not handle page requests or cache anything. */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const d = e.notification.data || {}, page = d.url || self.registration.scope;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    const c = list.find(x => new URL(x.url).pathname === page);
    if (c){ if (d.id) c.postMessage({ trOpen: d.id }); return c.focus(); }
    return self.clients.openWindow(page + (d.id ? '?tr=' + encodeURIComponent(d.id) : ''));
  }));
});
