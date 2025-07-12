self.addEventListener('push', event => {
  const payload = event.data.json();
  self.registration.showNotification(payload.title, {
    body: payload.body,
    icon: payload.icon
  });
});