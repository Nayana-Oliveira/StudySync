const webpush = require('web-push');

webpush.setVapidDetails(
  'mailto:contato@studysync.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

exports.sendNotification = (subscription, payload) => {
  webpush.sendNotification(subscription, JSON.stringify(payload))
    .catch(err => console.error('Erro ao enviar notificação:', err));
};