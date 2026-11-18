export interface PushNotificationPayload {
  residentId: string;
  title: string;
  body: string;
  payload?: Record<string, unknown>;
  expoPushToken?: string;
}

export interface ExpoPushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: 'default';
  priority?: 'default' | 'normal' | 'high';
  /** Canal Android para alertas críticas (suena aunque el teléfono esté en silencio si el usuario lo permite) */
  channelId?: string;
}
