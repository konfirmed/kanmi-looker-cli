import { getAuthClient } from '../utils/auth';
import { cloneLookerReport, getFileInfo } from '../utils/drive';

interface CloneOptions {
  id: string;
  name: string;
}

/**
 * Clone command implementation
 */
export async function cloneCommand(options: CloneOptions): Promise<void> {
  try {
    console.log(`🔄 Cloning Looker Studio report...`);
    console.log(`   Source File ID: ${options.id}`);
    console.log(`   New Name: ${options.name}`);
    console.log('');
    
    // Validate inputs
    if (!options.id) {
      console.error('❌ File ID is required');
      process.exit(1);
    }
    
    if (!options.name || options.name.trim().length === 0) {
      console.error('❌ Report name is required');
      process.exit(1);
    }
    
    // Get authenticated client
    const auth = await getAuthClient();
    
    // Get file info first to validate the file exists
    console.log('🔍 Checking source file information...');
    try {
      const fileInfo = await getFileInfo(auth, options.id);
      console.log(`   Source File: ${fileInfo.name}`);
      console.log(`   Type: ${fileInfo.mimeType}`);
      console.log(`   Size: ${fileInfo.size || 'Unknown'} bytes`);
      console.log('');
    } catch (error) {
      console.error('❌ Source file not found or not accessible. Please check the file ID and your permissions.');
      process.exit(1);
    }
    
    // Clone the report
    console.log(`🚀 Creating clone...`);
    const newFileId = await cloneLookerReport(auth, options.id, {
      newTitle: options.name,
    });
    
    console.log(`✅ Clone completed successfully!`);
    console.log(`   New File ID: ${newFileId}`);
    console.log(`   New Name: ${options.name}`);
    console.log('');
    
    // Get info about the new file
    try {
      const newFileInfo = await getFileInfo(auth, newFileId);
      if (newFileInfo.webViewLink) {
        console.log(`🔗 View your cloned report: ${newFileInfo.webViewLink}`);
      }
    } catch (error) {
      console.log('ℹ️  Clone created but unable to retrieve view link.');
    }
    
    console.log('');
    console.log('💡 You can now:');
    console.log(`   • Edit the cloned report in Looker Studio`);
    console.log(`   • Export it: looker-cli export --id ${newFileId} --format pdf`);
    console.log(`   • List all reports: looker-cli list`);
    
  } catch (error) {
    console.error('❌ Error cloning report:', error);
    
    // Provide helpful error messages for common issues
    if (error instanceof Error) {
      if (error.message.includes('insufficient permissions')) {
        console.log('');
        console.log('💡 Common solutions:');
        console.log('   • Make sure you have edit access to the source report');
        console.log('   • Check that the report owner has enabled copying');
        console.log('   • Try refreshing your authentication token');
      } else if (error.message.includes('not found')) {
        console.log('');
        console.log('💡 The file might be:');
        console.log('   • Deleted or moved');
        console.log('   • Not shared with your account');
        console.log('   • The file ID might be incorrect');
      }
    }
    
    process.exit(1);
  }
}
