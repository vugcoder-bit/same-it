import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { apiClient } from '../api/apiClient';
import { getDeviceId } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import { Toast } from 'toastify-react-native';

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
  const _hasHydrated = useAuthStore((state) => state._hasHydrated);
  const isDeviceSynced = useAuthStore(state => state.isDeviceSynced);
  const setIsDeviceSynced = useAuthStore(state => state.setIsDeviceSynced);

  useEffect(() => {
    // Only register/sync if authenticated, hydrated, and not already synced in this session
    if (!_hasHydrated || !token || isDeviceSynced) return;

    // Always sync deviceId if authenticated, regardless of push token success
    const syncDeviceMetadata = async (capturedPushToken?: string) => {
        try {
            const deviceId = await getDeviceId();
            console.log('Syncing device metadata...', { deviceId, pushToken: capturedPushToken });
            await apiClient.post('/auth/update-token', { 
                pushToken: capturedPushToken, 
                deviceId 
            });
            console.log('Successfully synchronized device metadata with backend');
            setIsDeviceSynced(true);
        } catch (error: any) {
            console.error('Failed to sync device metadata:', error);
        }
    };

    registerForPushNotificationsAsync()
      .then(async (pushToken) => {
        if (pushToken) {
          setExpoPushToken(pushToken);
          await syncDeviceMetadata(pushToken);
        } else {
          // No push token (e.g. emulator), but still sync deviceId
          await syncDeviceMetadata();
        }
      })
      .catch(async (err) => {
          console.log('Push Token Registration Error (Skipped Token Update):', err);
          Toast.error("Push Registration Failed: Check Firebase Config");
          // Still try to sync the deviceId even if Firebase crashes
          await syncDeviceMetadata();
      });

    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Notification Response:', response);
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [_hasHydrated, token]);

  return { expoPushToken, notification };
}

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
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
            // Development fallback
            token = (await Notifications.getExpoPushTokenAsync()).data;
        } else {
             token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
        }
    } catch (e) {
        token = (await Notifications.getExpoPushTokenAsync()).data;
    }
    
    console.log('Expo Push Token generated:', token);
  } else {
    console.log('Must use physical device for Push Notifications');
    // For debugging, we can return a mock token in dev if needed, 
    // but the user says they are using APK on device.
  }

  if (!token) {
      console.log('PUSH_TOKEN_WARNING: Token generated is null or undefined');
  }

  return token;
}
