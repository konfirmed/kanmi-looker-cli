import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import * as fs from 'fs';
import * as path from 'path';

interface LookerReport {
  id: string;
  name: string;
  modifiedTime: string;
  size?: string;
  owners?: string[];
  webViewLink?: string;
}

interface ExportOptions {
  format: 'json' | 'pdf';
  outputPath?: string;
}

interface CloneOptions {
  newTitle: string;
}

/**
 * Create Drive API client
 */
function createDriveClient(auth: OAuth2Client) {
  return google.drive({ version: 'v3', auth });
}

/**
 * List all Looker Studio reports accessible to the user
 */
export async function listLookerReports(auth: OAuth2Client): Promise<LookerReport[]> {
  const drive = createDriveClient(auth);
  
  try {
    // Search for files that might be Looker Studio reports
    // Note: Looker Studio reports don't have a specific MIME type in Drive API
    // We'll search for files with 'looker' or 'data studio' in the name
    const response = await drive.files.list({
      q: `(name contains 'looker' or name contains 'data studio' or name contains 'dashboard' or name contains 'report') and trashed=false`,
      fields: 'files(id,name,modifiedTime,size,owners,webViewLink,mimeType)',
      pageSize: 100,
    });

    const files = response.data.files || [];
    
    // Also search for files that might be reports based on MIME type or other criteria
    const reportResponse = await drive.files.list({
      q: `mimeType='application/vnd.google-apps.document' and trashed=false`,
      fields: 'files(id,name,modifiedTime,size,owners,webViewLink,mimeType)',
      pageSize: 50,
    });

    const reportFiles = reportResponse.data.files || [];
    
    // Combine and deduplicate results
    const allFiles = [...files, ...reportFiles];
    const uniqueFiles = allFiles.filter((file, index, self) => 
      index === self.findIndex(f => f.id === file.id)
    );

    return uniqueFiles.map(file => ({
      id: file.id!,
      name: file.name!,
      modifiedTime: file.modifiedTime!,
      size: file.size || undefined,
      owners: file.owners?.map(owner => owner.displayName || owner.emailAddress || 'Unknown'),
      webViewLink: file.webViewLink || undefined,
    }));
  } catch (error) {
    console.error('Error listing Looker reports:', error);
    throw error;
  }
}

/**
 * Export a Looker Studio report
 */
export async function exportLookerReport(
  auth: OAuth2Client,
  fileId: string,
  options: ExportOptions
): Promise<string> {
  const drive = createDriveClient(auth);
  
  try {
    // First, get file metadata to determine the best export approach
    const fileMetadata = await drive.files.get({
      fileId: fileId,
      fields: 'id,name,mimeType,webViewLink',
    });

    const fileName = fileMetadata.data.name || `report_${fileId}`;
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9\-_\s]/g, '_');
    
    let outputPath: string;
    if (options.outputPath) {
      outputPath = options.outputPath;
    } else {
      const ext = options.format === 'pdf' ? 'pdf' : 'json';
      outputPath = path.join(process.cwd(), `${sanitizedFileName}.${ext}`);
    }

    if (options.format === 'pdf') {
      // Try to export as PDF
      try {
        const response = await drive.files.export({
          fileId: fileId,
          mimeType: 'application/pdf',
        }, { responseType: 'stream' });

        const writer = fs.createWriteStream(outputPath);
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
          writer.on('finish', () => resolve(outputPath));
          writer.on('error', reject);
        });
      } catch (exportError) {
        console.log('PDF export failed, trying to download original file...');
        
        // Fallback: download the original file
        const response = await drive.files.get({
          fileId: fileId,
          alt: 'media',
        }, { responseType: 'stream' });

        const writer = fs.createWriteStream(outputPath);
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
          writer.on('finish', () => resolve(outputPath));
          writer.on('error', reject);
        });
      }
    } else {
      // JSON format - get file metadata and content
      const metadata = await drive.files.get({
        fileId: fileId,
        fields: '*',
      });

      const jsonData = {
        metadata: metadata.data,
        exportedAt: new Date().toISOString(),
        note: 'This is metadata only. Looker Studio reports cannot be fully exported as JSON via Drive API.',
      };

      fs.writeFileSync(outputPath, JSON.stringify(jsonData, null, 2));
      return outputPath;
    }
  } catch (error) {
    console.error('Error exporting Looker report:', error);
    throw error;
  }
}

/**
 * Clone a Looker Studio report
 */
export async function cloneLookerReport(
  auth: OAuth2Client,
  fileId: string,
  options: CloneOptions
): Promise<string> {
  const drive = createDriveClient(auth);
  
  try {
    // First, get the original file metadata
    const originalFile = await drive.files.get({
      fileId: fileId,
      fields: 'id,name,mimeType,parents',
    });

    // Copy the file
    const response = await drive.files.copy({
      fileId: fileId,
      requestBody: {
        name: options.newTitle,
        parents: originalFile.data.parents,
      },
    });

    const newFileId = response.data.id!;
    console.log(`Successfully cloned report as "${options.newTitle}"`);
    console.log(`New file ID: ${newFileId}`);
    
    // Get the web view link for the new file
    const newFile = await drive.files.get({
      fileId: newFileId,
      fields: 'webViewLink',
    });

    if (newFile.data.webViewLink) {
      console.log(`View your cloned report: ${newFile.data.webViewLink}`);
    }

    return newFileId;
  } catch (error) {
    console.error('Error cloning Looker report:', error);
    throw error;
  }
}

/**
 * Get detailed information about a specific file
 */
export async function getFileInfo(auth: OAuth2Client, fileId: string): Promise<any> {
  const drive = createDriveClient(auth);
  
  try {
    const response = await drive.files.get({
      fileId: fileId,
      fields: '*',
    });

    return response.data;
  } catch (error) {
    console.error('Error getting file info:', error);
    throw error;
  }
}
