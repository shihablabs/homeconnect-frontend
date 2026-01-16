importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
firebase.initializeApp({
  apiKey: 'true', // Not required for SW but keeps it happy if referenced
  projectId: 'true',
  messagingSenderId: 'YOUR_SENDER_ID_HERE', // Replaced dynamically or hardcoded if safe. 
  // Ideally, SW should read from some config or just hardcode for this simple test if env vars aren't available in SW context easily without build step injection.
  // For Next.js public folder, we might need to hardcode specific values or just rely on default SW behavior if registered via main thread with config.
  // Actually, standard practice for simple SW:
});

// Since we can't easily access process.env here without a build step for public/,
// we will rely on the main thread registration to pass config or just the simplistic version.
// However, the standard firebase-messaging-sw.js usually needs the config.
// Let's assume the user will replace placeholders or we try to grab from URL if possible, but simplest is providing a generic structure.
// NOTE: For 'messagingSenderId', it is critical. 

// Retrieving background messages
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon-192x192.png' // Customize as needed
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
