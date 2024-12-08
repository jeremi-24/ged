import { google } from 'googleapis';

export const loadDriveFiles = async (accessToken: string) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  oauth2Client.setCredentials({ access_token: accessToken });
  const drive = google.drive({ version: 'v3', auth: oauth2Client });

  const response = await drive.files.list({
    q: "mimeType != 'application/vnd.google-apps.folder'",
    fields: 'nextPageToken, files(id, name, mimeType, webContentLink, createdTime)',
    pageSize: 10,
  });

  return response.data.files;
};
