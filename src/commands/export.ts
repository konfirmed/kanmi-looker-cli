import { getAuthClient } from '../utils/auth';
import { exportLookerReport, getFileInfo } from '../utils/drive';

interface ExportOptions {
  id: string;
  format: 'json' | 'pdf';
  output?: string;
}

/**
 * Export command implementation
 */
export async function exportCommand(options: ExportOptions): Promise<void> {
  try {
    console.log(`📤 Exporting Looker Studio report...`);
    console.log(`   File ID: ${options.id}`);
    console.log(`   Format: ${options.format.toUpperCase()}`);
    
    if (options.output) {
      console.log(`   Output: ${options.output}`);
    }
    console.log('');
    
    // Validate format
    if (!['json', 'pdf'].includes(options.format)) {
      console.error('❌ Invalid format. Supported formats: json, pdf');
      process.exit(1);
    }
    
    // Get authenticated client
    const auth = await getAuthClient();
    
    // Get file info first to validate the file exists
    console.log('🔍 Checking file information...');
    try {
      const fileInfo = await getFileInfo(auth, options.id);
      console.log(`   File: ${fileInfo.name}`);
      console.log(`   Type: ${fileInfo.mimeType}`);
      console.log('');
    } catch (error) {
      console.error('❌ File not found or not accessible. Please check the file ID and your permissions.');
      process.exit(1);
    }
    
    // Export the report
    console.log(`🚀 Starting export...`);
    const outputPath = await exportLookerReport(auth, options.id, {
      format: options.format,
      outputPath: options.output,
    });
    
    console.log(`✅ Export completed successfully!`);
    console.log(`   Output file: ${outputPath}`);
    
    if (options.format === 'json') {
      console.log('');
      console.log('ℹ️  Note: JSON export contains metadata only.');
      console.log('   Looker Studio reports cannot be fully exported as JSON via the Drive API.');
      console.log('   For complete data export, use the PDF format or export directly from Looker Studio.');
    }
    
  } catch (error) {
    console.error('❌ Error exporting report:', error);
    process.exit(1);
  }
}
