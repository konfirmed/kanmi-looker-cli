# kanmi-looker-cli

A powerful command-line interface for managing Looker Studio reports via Google Drive API. Perfect for SEO/performance consultants, dev teams, and dashboard automation workflows.

## 🚀 Features

- **List Reports**: View all accessible Looker Studio reports
- **Export Reports**: Download reports as PDF or JSON
- **Clone Reports**: Create copies of existing reports
- **OAuth2 Authentication**: Secure Google Drive API access
- **Cross-platform**: Works on macOS, Linux, and Windows

## 📋 Prerequisites

Before using looker-cli, you need to:

1. **Create Google Cloud Project & Enable Drive API**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the Google Drive API
   - Create OAuth 2.0 credentials (Desktop application)

2. **Get OAuth Credentials**:
   - Go to APIs & Services > Credentials
   - Create credentials > OAuth client ID
   - Application type: Desktop application
   - Download the credentials JSON file

## 🔧 Installation

### Install from npm (Coming Soon)
```bash
npm install -g looker-cli
```

### Install from Source
```bash
git clone <repository-url>
cd looker-cli
npm install
npm run build
npm link
```

## ⚙️ Setup

1. **Configure Environment Variables**:
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` file**:
   ```env
   CLIENT_ID=your-google-client-id
   CLIENT_SECRET=your-google-client-secret
   ```

3. **First Run Authentication**:
   ```bash
   looker-cli list
   ```
   This will open your browser for OAuth authentication and store the token securely.

## 🎯 Usage

### List All Reports
```bash
looker-cli list
```

**Sample Output:**
```
🔍 Listing Looker Studio reports...

Found 3 report(s):

┌─────────────────────────────────────────────────────────────────────────────┐
│ TITLE                           │ FILE ID                    │ LAST MODIFIED │
├─────────────────────────────────────────────────────────────────────────────┤
│ SEO Performance Dashboard       │ 1ABC123DEF456GHI789JKL012... │ 12/15/2024   │
├─────────────────────────────────────────────────────────────────────────────┤
│ Monthly Analytics Report        │ 2BCD234EFG567HIJ890KLM123... │ 12/10/2024   │
├─────────────────────────────────────────────────────────────────────────────┤
│ Client Campaign Dashboard       │ 3CDE345FGH678IJK901LMN234... │ 12/08/2024   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Export Reports
```bash
# Export as PDF (default)
looker-cli export --id 1ABC123DEF456GHI789JKL012MNO345PQR

# Export as JSON metadata
looker-cli export --id 1ABC123DEF456GHI789JKL012MNO345PQR --format json

# Specify output path
looker-cli export --id 1ABC123DEF456GHI789JKL012MNO345PQR --output ./reports/dashboard.pdf
```

### Clone Reports
```bash
looker-cli clone --id 1ABC123DEF456GHI789JKL012MNO345PQR --name "My Client Report Copy"
```

## 🔐 Authentication & Security

- **Token Storage**: Tokens are stored securely in `~/.looker-cli/token.json` with 600 permissions
- **OAuth2 Flow**: Uses Google's installed application OAuth2 flow
- **Scope**: Requests minimal required permissions (`https://www.googleapis.com/auth/drive.readonly`)

### Token Management
```bash
# Tokens are automatically refreshed
# To manually revoke and re-authenticate, delete the token file:
rm ~/.looker-cli/token.json
```

## 🛠️ Development

### Build from Source
```bash
npm install
npm run build
```

### Run in Development Mode
```bash
npm run dev -- list
npm run dev -- export --id YOUR_FILE_ID
```

### Project Structure
```
src/
├── commands/
│   ├── list.ts      # List reports command
│   ├── export.ts    # Export reports command
│   └── clone.ts     # Clone reports command
├── utils/
│   ├── auth.ts      # OAuth2 authentication
│   └── drive.ts     # Google Drive API integration
└── index.ts         # CLI entry point
```

## 🔍 API Limitations

### Looker Studio & Drive API
- **Report Detection**: Looker Studio reports don't have a specific MIME type in Drive API
- **Search Strategy**: Uses keyword matching (`looker`, `data studio`, `dashboard`, `report`)
- **Export Limitations**: 
  - PDF export works for most Google Drive files
  - JSON export provides metadata only
  - Full report data extraction requires Looker Studio's native export

### Workarounds
1. **Better Report Detection**: Name your reports with clear keywords
2. **Full Data Export**: Use Looker Studio's built-in export for complete data
3. **Automation**: Combine with other tools for complete workflow automation

## 🚨 Troubleshooting

### Common Issues

**1. "CLIENT_ID or CLIENT_SECRET missing"**
- Ensure `.env` file exists with correct credentials
- Check that environment variables are set properly

**2. "Token invalid or expired"**
- Delete token file: `rm ~/.looker-cli/token.json`
- Run any command to re-authenticate

**3. "File not found or not accessible"**
- Verify file ID is correct
- Ensure you have access to the file
- Check if file was moved or deleted

**4. "No reports found"**
- Make sure your reports contain keywords like "looker", "dashboard", "report"
- Check if reports are in your Google Drive account
- Verify Drive API permissions

### Debug Mode
```bash
# Enable verbose logging
DEBUG=* looker-cli list
```

## 📊 Use Cases

### For SEO/Performance Consultants
- Export client reports for offline analysis
- Create template reports for new clients
- Automate report generation workflows

### For Development Teams
- Clone dashboard templates for different environments
- Export reports for version control
- Integrate with CI/CD pipelines

### For Dashboard Automation
- Batch export reports for archiving
- Create backup copies of important dashboards
- Migrate reports between accounts

## 🔄 Roadmap

- [ ] **Audit Command**: Summary of all reports with metadata
- [ ] **Open Command**: Open reports in browser
- [ ] **Diff Command**: Compare two reports
- [ ] **Batch Operations**: Process multiple reports
- [ ] **Output Formats**: CSV, Markdown support
- [ ] **Report Templates**: Create from templates
- [ ] **Scheduling**: Cron-like report exports

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details

## 🔗 Links

- [Google Drive API Documentation](https://developers.google.com/drive/api)
- [Looker Studio Help](https://support.google.com/looker-studio)
- [OAuth2 Setup Guide](https://developers.google.com/identity/protocols/oauth2)

## 📞 Support

For issues and feature requests, please use the GitHub issue tracker.

---

**Happy reporting! 📊✨**
