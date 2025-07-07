import { getAuthClient } from '../utils/auth';
import { listLookerReports } from '../utils/drive';

/**
 * List command implementation
 */
export async function listCommand(): Promise<void> {
  try {
    console.log('🔍 Listing Looker Studio reports...\n');
    
    // Get authenticated client
    const auth = await getAuthClient();
    
    // List reports
    const reports = await listLookerReports(auth);
    
    if (reports.length === 0) {
      console.log('No Looker Studio reports found.');
      console.log('Make sure you have reports in your Google Drive that contain keywords like:');
      console.log('- "looker"');
      console.log('- "data studio"');
      console.log('- "dashboard"');
      console.log('- "report"');
      return;
    }
    
    // Display reports in a table format
    console.log(`Found ${reports.length} report(s):\n`);
    
    // Print header
    console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
    console.log('│ TITLE                           │ FILE ID                    │ LAST MODIFIED │');
    console.log('├─────────────────────────────────────────────────────────────────────────────┤');
    
    // Print each report
    reports.forEach((report, index) => {
      const title = report.name.length > 30 ? report.name.substring(0, 27) + '...' : report.name;
      const fileId = report.id.substring(0, 25) + '...';
      const modifiedDate = new Date(report.modifiedTime).toLocaleDateString();
      
      console.log(`│ ${title.padEnd(30)} │ ${fileId.padEnd(25)} │ ${modifiedDate.padEnd(12)} │`);
      
      if (index < reports.length - 1) {
        console.log('├─────────────────────────────────────────────────────────────────────────────┤');
      }
    });
    
    console.log('└─────────────────────────────────────────────────────────────────────────────┘\n');
    
    // Show detailed information
    console.log('📋 Detailed Information:\n');
    reports.forEach((report, index) => {
      console.log(`${index + 1}. ${report.name}`);
      console.log(`   📁 File ID: ${report.id}`);
      console.log(`   📅 Modified: ${new Date(report.modifiedTime).toLocaleString()}`);
      if (report.size) {
        console.log(`   📦 Size: ${report.size} bytes`);
      }
      if (report.owners && report.owners.length > 0) {
        console.log(`   👤 Owners: ${report.owners.join(', ')}`);
      }
      if (report.webViewLink) {
        console.log(`   🔗 Link: ${report.webViewLink}`);
      }
      console.log('');
    });
    
    console.log('💡 Use these File IDs with the export and clone commands:');
    console.log('   looker-cli export --id <FILE_ID> --format pdf');
    console.log('   looker-cli clone --id <FILE_ID> --name "My New Report"');
    
  } catch (error) {
    console.error('❌ Error listing reports:', error);
    process.exit(1);
  }
}
