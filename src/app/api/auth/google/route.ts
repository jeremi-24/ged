import { NextResponse } from "next/dist/server/web/spec-extension/response";


export async function GET() {
  const client_id = process.env.GOOGLE_CLIENT_ID;
  const redirect_uri = process.env.GOOGLE_REDIRECT_URI;
  const scope = encodeURIComponent('https://www.googleapis.com/auth/drive');

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=token&client_id=${client_id}&redirect_uri=${redirect_uri}&scope=${scope}`;

  return NextResponse.redirect(googleAuthUrl);
}
