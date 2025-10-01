# END USER LICENSE AGREEMENT (EULA)
## Interactive 3D Globe Application

**Version**: 1.0.0  
**Effective Date**: January 30, 2025  
**Application**: Interactive 3D Globe with Location Management  

---

## 1. LICENSE GRANT

### 1.1 Software License
Subject to the terms and conditions of this Agreement, the Licensor hereby grants you a limited, non-exclusive, non-transferable license to use the Interactive 3D Globe Application ("Software") for personal, educational, and commercial purposes.

### 1.2 License Scope
This license permits you to:
- Install and use the Software on multiple devices
- Create and manage location data within the application
- Export and import location data for backup purposes
- Use the Software for both personal and commercial projects

### 1.3 License Restrictions
You may NOT:
- Reverse engineer, decompile, or disassemble the Software
- Remove or modify any copyright notices or proprietary markings
- Distribute, sublicense, or transfer the Software to third parties
- Use the Software for any illegal or unauthorized purpose

---

## 2. SOFTWARE DESCRIPTION

### 2.1 Application Overview
The Interactive 3D Globe Application is a web-based visualization tool that provides:
- **3D Interactive Globe**: NASA Blue Marble texture with smooth rotation controls
- **Location Management**: Add, edit, delete, and visualize geographic locations
- **Data Import/Export**: CSV and JSON data import with flexible column mapping
- **Dynamic Visualization**: Quantity-based scaling and visual representation
- **Offline Capability**: Works without internet connection using local storage

### 2.2 Technical Features
- **Frontend**: React 18 + TypeScript + Three.js
- **3D Graphics**: React Three Fiber with NASA satellite imagery
- **UI Framework**: Chakra UI v3.27.0
- **Storage**: IndexedDB (primary), localStorage (fallback) for user data; Supabase for authentication only
- **Authentication**: Supabase user authentication with email notifications
- **APIs**: Mapbox Geocoding API integration (local processing)

---

## 3. DATA COLLECTION AND PRIVACY

### 3.1 Data Types Collected
The Software may collect and store the following types of data:

#### **Personal Information Categories (CCPA/CPRA)**
- **Identifiers**: Email address, account username, unique user ID
- **Account Information**: Authentication credentials, account preferences, user settings
- **Commercial Information**: Marketing preferences, communication history
- **Internet/Electronic Activity**: Application usage patterns, technical logs
- **Geolocation Data**: Only if you choose to use location-based features (stored locally)

#### **Data Collection Purposes**
- **User Account Data**: Email address, authentication credentials, and account preferences for user management
- **Marketing Data**: Email address for product updates and marketing communications (with your consent)
- **Technical Data**: Application settings, column mappings, and visualization preferences stored locally
- **Usage Data**: Technical logs for debugging and performance optimization

#### **Data Sources**
- **Direct Collection**: Information you provide when creating an account or using the application
- **Automatic Collection**: Technical data generated through application usage
- **Third-Party Services**: Authentication data through Supabase, geocoding through Mapbox (processed locally)

### 3.2 Data Storage Architecture
- **Local Storage Only**: All user-imported data (locations, datasets, custom data) is stored exclusively on your local device using IndexedDB and localStorage
- **No Cloud Data Storage**: We do not store, process, or transmit any data you import or export through the application
- **Local Processing**: All data processing occurs locally in your browser - no server-side data processing
- **Account Data**: Only authentication and account management data is stored in Supabase cloud storage

### 3.3 Third-Party Services and Data Sharing
The Software integrates with the following third-party services:

#### **Service Providers**
- **Mapbox API**: For address geocoding and location lookup (data processed locally)
- **Supabase**: For user authentication, account management, and email notifications only
- **NASA**: For Blue Marble satellite imagery (public domain)

#### **Data Sharing Practices**
- **No Sale of Personal Information**: We do not sell, rent, or trade your personal information to third parties
- **No Sharing for Commercial Purposes**: We do not share your personal information with third parties for their commercial use
- **Limited Sharing**: We only share personal information with service providers necessary for application functionality
- **Data Processing Agreements**: All service providers are bound by data processing agreements that protect your privacy

#### **Third-Party Data Handling**
- **Mapbox**: Geocoding requests are processed locally; no personal data is transmitted to Mapbox
- **Supabase**: Only authentication and account management data is stored; subject to Supabase's privacy policy
- **NASA**: Public domain imagery; no personal data involved

### 3.4 Data Privacy and Local Processing
- **Local-First Architecture**: All your imported data remains on your device and is never transmitted to our servers
- **Email Communications**: We may send product updates and marketing emails to your registered email address (you can opt-out at any time)
- **No Data Mining**: We do not analyze, process, or monetize your imported data
- **Full Data Control**: You retain complete control over your data - it's stored locally and can be exported/deleted at any time
- **Privacy by Design**: Your location data, datasets, and custom information never leave your device

### 3.5 California Privacy Rights (CCPA/CPRA Compliance)
If you are a California resident, you have the following rights regarding your personal information:

#### **Right to Know**
- You have the right to know what personal information we collect, use, and share
- You can request details about the categories and specific pieces of personal information we have collected about you
- You can request information about the sources from which we collect personal information

#### **Right to Delete**
- You have the right to request deletion of your personal information
- You can request deletion of your account and associated data at any time
- Note: Some information may be retained for legal or security purposes

#### **Right to Opt-Out**
- You have the right to opt-out of the sale or sharing of your personal information
- We do not sell or share your personal information with third parties for commercial purposes
- You can opt-out of marketing communications through your account settings

#### **Right to Correct**
- You have the right to request correction of inaccurate personal information
- You can update your account information through your account settings
- You can contact us to request corrections to any personal information we maintain

#### **Right to Limit Sensitive Personal Information**
- You have the right to limit the use and disclosure of sensitive personal information
- We only use sensitive personal information for essential business purposes
- You can request limitations on how we use your sensitive personal information

#### **Exercising Your Rights**
To exercise any of these rights, please contact us at:
- **Email**: [Contact information to be provided]
- **Response Time**: We will respond to your request within 45 days
- **Verification**: We may need to verify your identity before processing your request

### 3.6 California Online Privacy Protection Act (CalOPPA) Compliance

#### **Do Not Track (DNT) Signals**
- **DNT Response**: Our application does not respond to Do Not Track signals from web browsers
- **Local Processing**: Since all data processing occurs locally in your browser, DNT signals do not affect our data collection practices
- **No Cross-Site Tracking**: We do not track users across different websites or services

#### **Privacy Policy Requirements**
- **Conspicuous Posting**: This privacy policy is prominently displayed and easily accessible
- **Effective Date**: This policy was last updated on January 30, 2025
- **Contact Information**: Clear contact information is provided for privacy-related inquiries
- **Data Collection Disclosure**: All data collection practices are clearly disclosed in this agreement

### 3.7 Data Retention and Security

#### **Data Retention**
- **Account Data**: Retained for the duration of your account plus 30 days after account deletion
- **Local Data**: Stored on your device until you delete it or clear your browser data
- **Marketing Data**: Retained until you opt-out or request deletion
- **Technical Logs**: Retained for up to 12 months for debugging and performance optimization

#### **Security Measures**
- **Encryption**: All data transmission is encrypted using industry-standard protocols
- **Access Controls**: Limited access to personal information on a need-to-know basis
- **Regular Security Audits**: Periodic review of security practices and systems
- **Incident Response**: Procedures in place for handling potential data breaches

#### **Data Breach Notification**
- **Timeline**: We will notify affected users within 72 hours of discovering a data breach
- **Method**: Notification will be sent via email to your registered email address
- **Information**: Notification will include details about the breach and steps you can take to protect yourself

---

## 4. EMAIL COMMUNICATIONS AND MARKETING

### 4.1 Email Notifications
By creating an account, you consent to receive the following types of email communications:
- **Product Updates**: Information about new features, improvements, and software updates
- **Marketing Communications**: Promotional content, tips, and educational materials about the Software
- **Account Management**: Password reset notifications, security alerts, and account-related communications

### 4.2 Email Preferences
- You can opt-out of marketing emails at any time through your account settings
- Account-related and security emails cannot be disabled as they are essential for service operation
- Email preferences are managed through your Supabase account settings

### 4.3 Data Usage for Communications
- We use your email address solely for the purposes described above
- We do not share your email address with third parties for marketing purposes
- Email communications are managed through Supabase's email service

---

## 5. INTELLECTUAL PROPERTY

### 5.1 Software License
The Software is licensed under the MIT License, which permits:
- Free use, modification, and distribution
- Commercial use without restrictions
- Private use and study

### 5.2 Third-Party Components
The Software includes the following open-source components:
- **React**: MIT License
- **Three.js**: MIT License
- **Chakra UI**: MIT License
- **Heroicons**: MIT License
- **Framer Motion**: MIT License

### 5.3 NASA Imagery
- NASA Blue Marble texture is in the public domain
- No copyright restrictions on NASA imagery usage
- Attribution recommended but not required

---

## 6. LIMITATIONS AND DISCLAIMERS

### 6.1 Software Limitations
- The Software is provided "as is" without warranties of any kind
- Geographic accuracy depends on third-party API services
- 3D rendering performance may vary based on device capabilities
- Offline functionality is limited to locally stored data

### 6.2 Technical Requirements
- Modern web browser with WebGL support
- JavaScript enabled
- Minimum 4GB RAM recommended for optimal performance
- Internet connection required for geocoding and cloud features

### 6.3 Data Accuracy
- Geographic coordinates are provided for informational purposes only
- Location accuracy depends on third-party geocoding services
- Users are responsible for verifying location data accuracy

---

## 7. USER RESPONSIBILITIES

### 7.1 Acceptable Use
You agree to use the Software only for lawful purposes and in accordance with this Agreement. You are responsible for:
- Ensuring your use complies with applicable laws and regulations
- Respecting third-party intellectual property rights
- Maintaining the security of your data and account information

### 7.2 Data Management
- You are responsible for backing up your location data using the built-in export functionality
- All your imported data is stored locally on your device - we do not have access to it
- Data loss prevention is your responsibility through regular local backups
- Your account data (email, authentication) is managed through Supabase and subject to their privacy policy

### 7.3 System Requirements
- Keep your web browser updated for optimal performance
- Ensure adequate system resources for 3D rendering
- Internet connectivity required for user authentication and email notifications
- Local processing capabilities for data visualization (no server requirements for data processing)

---

## 8. TERMINATION

### 8.1 License Termination
This license is effective until terminated. You may terminate this license at any time by:
- Uninstalling the Software from your devices
- Clearing all application data from your browser
- Discontinuing use of the Software

### 8.2 Effect of Termination
Upon termination:
- Your right to use the Software ceases immediately
- Your locally stored data remains on your device and can be exported
- Your account data will be handled according to Supabase's data retention policies
- You may opt-out of email communications at any time through your account settings
- No refunds or compensation for termination

---

## 9. LIMITATION OF LIABILITY

### 9.1 Disclaimer of Warranties
THE SOFTWARE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NONINFRINGEMENT.

### 9.2 Limitation of Damages
IN NO EVENT SHALL THE LICENSOR BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR RELATING TO YOUR USE OF THE SOFTWARE.

### 9.3 Maximum Liability
The Licensor's total liability for any claims arising from this Agreement shall not exceed the amount you paid for the Software (if any).

---

## 10. GOVERNING LAW

### 10.1 Jurisdiction
This Agreement shall be governed by and construed in accordance with the laws of the jurisdiction where the Licensor is located, without regard to conflict of law principles.

### 10.2 Dispute Resolution
Any disputes arising from this Agreement shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association.

---

## 11. GENERAL PROVISIONS

### 11.1 Entire Agreement
This Agreement constitutes the entire agreement between you and the Licensor regarding the Software and supersedes all prior agreements.

### 11.2 Severability
If any provision of this Agreement is held to be invalid or unenforceable, the remaining provisions shall remain in full force and effect.

### 11.3 Amendments
The Licensor reserves the right to modify this Agreement at any time. Continued use of the Software after modifications constitutes acceptance of the updated terms.

### 11.4 Contact Information
For questions regarding this Agreement or the Software, please contact:
- **Email**: [Contact information to be provided]
- **Website**: [Website URL to be provided]

---

## 12. ACKNOWLEDGMENT

By using the Interactive 3D Globe Application, you acknowledge that you have read, understood, and agree to be bound by the terms and conditions of this End User License Agreement.

**Last Updated**: January 30, 2025  
**Version**: 1.0.0

---

*This EULA is specifically tailored for the Interactive 3D Globe Application v1.0.0 and reflects its current production-ready state with all implemented features, data handling practices, and technical architecture.*
