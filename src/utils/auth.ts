import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import open from 'open';

// OAuth2 configuration
const SCOPES = ['https://www.googleapis.com/auth/drive'];
const TOKEN_PATH = path.join(os.homedir(), '.looker-cli', 'token.json');
const CREDENTIALS_PATH = path.join(os.homedir(), '.looker-cli', 'credentials.json');

interface TokenData {
  access_token: string;
  refresh_token: string;
  scope: string;
  token_type: string;
  expiry_date: number;
}

/**
 * Create an OAuth2 client with the given credentials
 */
function createOAuth2Client(): OAuth2Client {
  const clientId = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    throw new Error('Missing CLIENT_ID or CLIENT_SECRET environment variables. Please check your .env file.');
  }

  const redirectUri = 'urn:ietf:wg:oauth:2.0:oob';
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

/**
 * Get and store new token after prompting for user authorization
 */
async function getNewToken(oAuth2Client: OAuth2Client): Promise<void> {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  console.log('Authorize this app by visiting this URL:', authUrl);
  console.log('Opening browser...');
  
  try {
    await open(authUrl);
  } catch (error) {
    console.log('Could not open browser automatically. Please visit the URL above manually.');
  }

  const readline = require('readline-sync');
  const code = readline.question('Enter the authorization code: ');

  try {
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    
    // Store the token to disk for later program executions
    await storeToken(tokens);
    console.log('Token stored to', TOKEN_PATH);
  } catch (error) {
    console.error('Error retrieving access token:', error);
    throw error;
  }
}

/**
 * Store token to disk
 */
async function storeToken(token: any): Promise<void> {
  try {
    // Ensure directory exists
    const tokenDir = path.dirname(TOKEN_PATH);
    if (!fs.existsSync(tokenDir)) {
      fs.mkdirSync(tokenDir, { recursive: true });
    }
    
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
    
    // Set secure permissions (readable only by owner)
    fs.chmodSync(TOKEN_PATH, 0o600);
  } catch (error) {
    console.error('Error storing token:', error);
    throw error;
  }
}

/**
 * Load token from disk
 */
function loadToken(): TokenData | null {
  try {
    if (fs.existsSync(TOKEN_PATH)) {
      const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
      return token;
    }
  } catch (error) {
    console.error('Error loading token:', error);
  }
  return null;
}

/**
 * Get authenticated OAuth2 client
 */
export async function getAuthClient(): Promise<OAuth2Client> {
  const oAuth2Client = createOAuth2Client();
  
  // Check if we have previously stored a token
  const token = loadToken();
  if (token) {
    oAuth2Client.setCredentials(token);
    
    // Check if token is still valid
    try {
      const tokenInfo = await oAuth2Client.getTokenInfo(token.access_token);
      if (tokenInfo) {
        return oAuth2Client;
      }
    } catch (error) {
      console.log('Stored token is invalid, requesting new token...');
    }
  }
  
  // Get new token
  await getNewToken(oAuth2Client);
  return oAuth2Client;
}

/**
 * Revoke stored token and remove from disk
 */
export async function revokeToken(): Promise<void> {
  try {
    if (fs.existsSync(TOKEN_PATH)) {
      const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
      const oAuth2Client = createOAuth2Client();
      oAuth2Client.setCredentials(token);
      
      await oAuth2Client.revokeToken(token.access_token);
      fs.unlinkSync(TOKEN_PATH);
      console.log('Token revoked and removed successfully');
    }
  } catch (error) {
    console.error('Error revoking token:', error);
    throw error;
  }
}
