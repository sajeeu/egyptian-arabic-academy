/* Service worker for the Conversation Translator: it only shows the "Translation ready" notification and opens the
   app when it is tapped. It does not handle page requests or cache anything, so the rest of the app works as before. */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const id = e.notification.data && e.notification.data.id;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    const c = list.find(x => x.url.startsWith(self.registration.scope)) || list[0];
    if (c){ if (id) c.postMessage({ trOpen: id }); return c.focus(); }
    return self.clients.openWindow(self.registration.scope + (id ? '?tr=' + encodeURIComponent(id) : ''));
  }));
});
