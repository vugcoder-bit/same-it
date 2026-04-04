import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { apiClient } from '../api/apiClient';
import { useAuthStore } from '../store/authStore';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function usePushNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
  const [notification, setNotification] = useState<Notifications.Notification | undefined>();
  const notificationListener = useRef<Notifications.EventSubscription | undefined>(undefined);
  const responseListener = useRef<Notifications.EventSubscription | undefined>(undefined);

  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    // Only register for push notifications if the admin is authenticated
    if (!token) return;

    registerForPushNotificationsAsync()
      .then(async (pushToken) => {
        if (pushToken) {
          setExpoPushToken(pushToken);
          try {
            await apiClient.post('/auth/update-token', { pushToken });
            console.log('Successfully registered admin push token with backend');
          } catch (error) {
            console.error('Failed to update push token on backend:', error);
          }
        }
      })
      .catch((err) => console.log('Push Token Registration Error:', err));

    notificationListener.current = Notifications.addNotificationReceivedListener((notif) => {
      setNotification(notif);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Notification Response:', response);
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [token]);

  return { expoPushToken, notification };
}

async function registerForPushNotificationsAsync() {
  let pushToken: string | undefined;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return undefined;
    }

    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      if (!projectId) {
        console.log('Project ID not found in app configuration.');
        pushToken = (await Notifications.getExpoPushTokenAsync()).data;
      } else {
        pushToken = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      }
    } catch (e) {
      pushToken = (await Notifications.getExpoPushTokenAsync()).data;
    }

    console.log('Expo Push Token generated:', pushToken);
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return pushToken;
}
