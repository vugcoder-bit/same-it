import https from 'https';

interface PushMessage {
    to: string;
    title: string;
    body: string;
    data?: Record<string, any>;
    sound?: 'default' | null;
}

/**
 * Sends push notifications via Expo's push service.
 * Uses Node's built-in https module — no external dependencies needed.
 */
export const sendPushNotification = async (
    tokens: (string | null | undefined)[],
    title: string,
    body: string,
    data?: Record<string, any>
): Promise<void> => {
    const validTokens = tokens.filter(
        (t): t is string => typeof t === 'string' && t.startsWith('ExponentPushToken[')
    );

    if (validTokens.length === 0) return;

    const messages: PushMessage[] = validTokens.map(token => ({
        to: token,
        sound: 'default',
        title,
        body,
        data: data || {},
    }));

    const payload = JSON.stringify(messages);

    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'exp.host',
            path: '/--/api/v2/push/send',
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload),
            },
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => { data += chunk; });
            res.on('end', () => {
                console.log(`[PUSH] Sent "${title}" to ${validTokens.length} device(s). Status: ${res.statusCode}`);
                resolve();
            });
        });

        req.on('error', (err) => {
            console.error('[PUSH] Failed to send push notification:', err.message);
            resolve(); // Don't fail the main request if push fails
        });

        req.write(payload);
        req.end();
    });
};
