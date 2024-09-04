// app/api/generateToken/route.js
import { RtcTokenBuilder, RtcRole } from 'agora-access-token';
import { NextResponse } from 'next/server';

export async function GET(request: any) {
  const { searchParams } = new URL(request.url);
  const channelName = searchParams.get('channelName');
  const uidString = searchParams.get('uid');
  
  // Validate the request
  if (!channelName || !uidString) {
    return NextResponse.json({ error: 'channelName and uid are required' }, { status: 400 });
  }

  // Convert the uid to a number
  const uid = parseInt(uidString, 10);

  // Check if uid is a valid number
  if (isNaN(uid)) {
    return NextResponse.json({ error: 'uid must be a valid number' }, { status: 400 });
  }

  const appId = process.env.APP_ID;
  const appCertificate = process.env.APP_CERTIFICATE;

  // Validate environment variables
  if (!appId || !appCertificate) {
    throw new Error('APP_ID and APP_CERTIFICATE must be defined in the environment variables');
  }

  const expirationTimeInSeconds = 3600; // 1 hour
  const currentTime = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTime + expirationTimeInSeconds;

  try {
    // Generate the Agora token
    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      uid,
      RtcRole.PUBLISHER,
      privilegeExpiredTs
    );

    return NextResponse.json({ token }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 });
  }
}
