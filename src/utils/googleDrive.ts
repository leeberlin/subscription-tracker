// Google Drive API integration for backup/restore
// Uses OAuth 2.0 with refresh token

interface DriveFile {
    id: string;
    name: string;
    mimeType: string;
    modifiedTime: string;
}

interface BackupData {
    subscriptions: any[];
    settings: any;
    exportDate: string;
    version: string;
}

// OAuth 2.0 credentials - users should configure their own in localStorage
// To set up: Go to Google Cloud Console > Create OAuth 2.0 Client ID
// Set redirect URI to: http://localhost:1420/oauth-callback
const getGoogleConfig = () => {
    const stored = localStorage.getItem('subscription-tracker-settings');
    if (stored) {
        const settings = JSON.parse(stored);
        return {
            clientId: settings.googleClientId || '',
            clientSecret: settings.googleClientSecret || '',
            folderId: settings.googleDriveFolderId || ''
        };
    }
    return { clientId: '', clientSecret: '', folderId: '' };
};

const BACKUP_FILE_NAME = 'subscription-tracker-backup.json';

// Storage keys
const TOKEN_STORAGE_KEY = 'subscription-tracker-google-tokens';

interface TokenData {
    access_token: string;
    refresh_token: string;
    expires_at: number;
}

function saveTokens(tokens: TokenData): void {
    localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
}

function loadTokens(): TokenData | null {
    try {
        const stored = localStorage.getItem(TOKEN_STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch {
        // ignore
    }
    return null;
}

function clearTokens(): void {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
}

// Check if tokens are expired
function isTokenExpired(tokens: TokenData): boolean {
    return Date.now() >= tokens.expires_at - 60000; // 1 minute buffer
}

// Generate OAuth authorization URL
export function getAuthUrl(): string {
    const config = getGoogleConfig();
    const redirectUri = 'http://localhost:1420/oauth-callback';
    const scope = 'https://www.googleapis.com/auth/drive.file';

    const params = new URLSearchParams({
        client_id: config.clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: scope,
        access_type: 'offline',
        prompt: 'consent'
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

// Exchange authorization code for tokens
export async function exchangeCodeForTokens(code: string): Promise<boolean> {
    try {
        const config = getGoogleConfig();
        const redirectUri = 'http://localhost:1420/oauth-callback';

        const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                code,
                client_id: config.clientId,
                client_secret: config.clientSecret,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code'
            })
        });

        if (!response.ok) {
            console.error('Token exchange error:', await response.text());
            return false;
        }

        const data = await response.json();

        const tokens: TokenData = {
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            expires_at: Date.now() + (data.expires_in * 1000)
        };

        saveTokens(tokens);
        return true;
    } catch (error) {
        console.error('Exchange code error:', error);
        return false;
    }
}

// Refresh access token
async function refreshAccessToken(refreshToken: string): Promise<string | null> {
    try {
        const config = getGoogleConfig();
        const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                refresh_token: refreshToken,
                client_id: config.clientId,
                client_secret: config.clientSecret,
                grant_type: 'refresh_token'
            })
        });

        if (!response.ok) {
            console.error('Refresh token error:', await response.text());
            return null;
        }

        const data = await response.json();

        const tokens = loadTokens();
        if (tokens) {
            tokens.access_token = data.access_token;
            tokens.expires_at = Date.now() + (data.expires_in * 1000);
            saveTokens(tokens);
        }

        return data.access_token;
    } catch (error) {
        console.error('Refresh access token error:', error);
        return null;
    }
}

// Get valid access token
async function getAccessToken(): Promise<string | null> {
    const tokens = loadTokens();

    if (!tokens) {
        return null;
    }

    if (isTokenExpired(tokens)) {
        return await refreshAccessToken(tokens.refresh_token);
    }

    return tokens.access_token;
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
    const tokens = loadTokens();
    return tokens !== null && tokens.refresh_token !== undefined;
}

// Disconnect Google account
export function disconnectGoogle(): void {
    clearTokens();
}

// Find existing backup file in folder
async function findBackupFile(accessToken: string): Promise<DriveFile | null> {
    try {
        const config = getGoogleConfig();
        const query = `name='${BACKUP_FILE_NAME}' and '${config.folderId}' in parents and trashed=false`;

        const response = await fetch(
            `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,modifiedTime)`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            }
        );

        if (!response.ok) {
            const error = await response.text();
            console.error('Search error:', error);
            return null;
        }

        const data = await response.json();
        return data.files?.[0] || null;
    } catch (error) {
        console.error('Find file error:', error);
        return null;
    }
}

// Upload backup to Google Drive
export async function uploadBackupToDrive(backupData: BackupData): Promise<{ success: boolean; fileId?: string; error?: string; needsAuth?: boolean }> {
    try {
        const accessToken = await getAccessToken();

        if (!accessToken) {
            return { success: false, error: 'Chưa đăng nhập Google. Vui lòng kết nối tài khoản Google.', needsAuth: true };
        }

        // Check if backup file already exists
        const existingFile = await findBackupFile(accessToken);

        const fileContent = JSON.stringify(backupData, null, 2);
        const boundary = '-------' + Date.now().toString(16);

        const config = getGoogleConfig();
        const metadata = {
            name: BACKUP_FILE_NAME,
            mimeType: 'application/json',
            ...(existingFile ? {} : { parents: [config.folderId] })
        };

        const body =
            `--${boundary}\r\n` +
            `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
            `${JSON.stringify(metadata)}\r\n` +
            `--${boundary}\r\n` +
            `Content-Type: application/json\r\n\r\n` +
            `${fileContent}\r\n` +
            `--${boundary}--`;

        let url = 'https://www.googleapis.com/upload/drive/v3/files';
        let method = 'POST';

        if (existingFile) {
            url = `https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}`;
            method = 'PATCH';
        }

        const response = await fetch(`${url}?uploadType=multipart`, {
            method,
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': `multipart/related; boundary=${boundary}`
            },
            body
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('Upload error:', error);

            if (response.status === 401) {
                clearTokens();
                return { success: false, error: 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.', needsAuth: true };
            }

            return { success: false, error: 'Không thể tải lên Google Drive' };
        }

        const result = await response.json();
        return { success: true, fileId: result.id };
    } catch (error) {
        console.error('Upload backup error:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

// Download backup from Google Drive
export async function downloadBackupFromDrive(): Promise<{ success: boolean; data?: BackupData; error?: string; lastModified?: string; needsAuth?: boolean }> {
    try {
        const accessToken = await getAccessToken();

        if (!accessToken) {
            return { success: false, error: 'Chưa đăng nhập Google', needsAuth: true };
        }

        const existingFile = await findBackupFile(accessToken);

        if (!existingFile) {
            return { success: false, error: 'Không tìm thấy backup trên Google Drive' };
        }

        const response = await fetch(
            `https://www.googleapis.com/drive/v3/files/${existingFile.id}?alt=media`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            }
        );

        if (!response.ok) {
            const error = await response.text();
            console.error('Download error:', error);
            return { success: false, error: 'Không thể tải xuống backup' };
        }

        const data = await response.json();
        return {
            success: true,
            data,
            lastModified: existingFile.modifiedTime
        };
    } catch (error) {
        console.error('Download backup error:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

// Check if backup exists on Drive
export async function checkDriveBackup(): Promise<{ exists: boolean; lastModified?: string; error?: string; needsAuth?: boolean }> {
    try {
        const accessToken = await getAccessToken();

        if (!accessToken) {
            return { exists: false, needsAuth: true };
        }

        const existingFile = await findBackupFile(accessToken);

        if (existingFile) {
            return {
                exists: true,
                lastModified: existingFile.modifiedTime
            };
        }

        return { exists: false };
    } catch (error) {
        console.error('Check backup error:', error);
        return { exists: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

// Create backup data structure
export function createBackupData(subscriptions: any[], settings: any): BackupData {
    return {
        subscriptions,
        settings,
        exportDate: new Date().toISOString(),
        version: '1.0.0'
    };
}
