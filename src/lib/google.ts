import { google } from "googleapis";

export function getDriveClient(accessToken: string) {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });
  return google.drive({ version: 'v3', auth: oauth2Client });
}

export function getDocsClient(accessToken: string) {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });
  return google.docs({ version: 'v1', auth: oauth2Client });
}

export function getBackupDriveClient() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.AUTH_GOOGLE_ID,
    process.env.AUTH_GOOGLE_SECRET
  );
  
  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_BACKUP_REFRESH_TOKEN
  });
  
  return google.drive({ version: 'v3', auth: oauth2Client });
}
