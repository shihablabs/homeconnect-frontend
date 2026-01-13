import { getToken, onMessage } from "firebase/messaging";
import { useEffect, useState } from "react";
import { initializeMessaging } from "../shared/utils/firebaseClient";

export const useFCM = () => {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission>("default");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    try {
      if (typeof window === "undefined") return;

      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission === "granted") {
        const messaging = await initializeMessaging();
        if (messaging) {
          // Get Token
          const token = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
          });
          if (token) {
            console.log("FCM Token:", token);
            setFcmToken(token);
          } else {
            console.log("No registration token available. Request permission to generate one.");
          }
        }
      }
    } catch (error) {
      console.error("An error occurred while retrieving token. ", error);
    }
  };

  useEffect(() => {
    let unsubscribe: null | (() => void) = null;

    const setupListener = async () => {
      const messaging = await initializeMessaging();
      if (messaging) {
        unsubscribe = onMessage(messaging, (payload) => {
          console.log("Foreground Message received. ", payload);
          // Customize UI toast here if needed
          // alert(`New Notification: ${payload.notification?.title}`);
        });
      }
    };

    setupListener();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return { fcmToken, notificationPermission, requestPermission };
};
