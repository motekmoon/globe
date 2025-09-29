# Time Tracker Extension - API Research & Integration Guide

## 🎯 **Project Overview**
Cursor extension for automatic time tracking with integration to popular project management tools (Linear, Jira, GitHub, etc.).

## 🔧 **Cursor IDE Extension Development**

### **Extension Architecture**
- **Base**: VS Code extension architecture (Cursor is VS Code-based)
- **Extension API**: Standard VS Code extension API
- **File Activity Monitoring**: Track file changes, focus events, workspace switching
- **Status Bar Integration**: Display time tracking info in status bar
- **Command Palette**: Manual time entry and controls

### **Key Capabilities**
- **File Activity Tracking**: Monitor which files are being edited
- **Workspace Events**: Track project switching, file operations
- **Focus Detection**: Detect when Cursor is active/inactive
- **Custom UI**: Create time tracking panels and dialogs
- **Storage**: Local storage for time data

## 📊 **Project Management Tool Integrations**

### **1. Linear API Integration**

#### **Available Endpoints**
- **Issues API**: `/issues` - Get, create, update issues
- **Projects API**: `/projects` - Link time to projects
- **Webhooks**: Real-time issue updates
- **Custom Fields**: Add time tracking fields to issues

#### **Time Tracking Approach**
- **No native time tracking** in Linear
- **Custom fields** for time logging
- **Issue comments** for time entries
- **Webhook integration** for real-time updates

#### **Integration Methods**
```typescript
// Linear API Example
const linearClient = new LinearClient({
  apiKey: 'your-api-key'
});

// Get issue details
const issue = await linearClient.issue('MOT-123');

// Add time tracking comment
await linearClient.commentCreate({
  issueId: 'MOT-123',
  body: `Time logged: 2.5 hours - Development work`
});
```

### **2. Jira API Integration**

#### **Available Endpoints**
- **Worklog API**: `/issue/{issueId}/worklog` - Native time tracking
- **Issue API**: `/issue/{issueId}` - Issue details and updates
- **Project API**: `/project` - Project management
- **Webhooks**: Real-time issue updates

#### **Time Tracking Approach**
- **Native worklog support** - Built-in time tracking
- **Worklog entries** - Log time against specific issues
- **Time tracking fields** - Built-in time tracking fields
- **Reporting** - Native time tracking reports

#### **Integration Methods**
```typescript
// Jira API Example
const jiraClient = new JiraClient({
  baseUrl: 'https://your-domain.atlassian.net',
  username: 'your-email',
  apiToken: 'your-api-token'
});

// Log time to issue
await jiraClient.issue.addWorklog({
  issueIdOrKey: 'PROJ-123',
  worklog: {
    timeSpent: '2h 30m',
    comment: 'Development work on feature X',
    started: '2024-01-15T10:00:00.000+0000'
  }
});
```

### **3. GitHub API Integration**

#### **Available Endpoints**
- **Issues API**: `/repos/{owner}/{repo}/issues` - Issue management
- **Projects API**: `/repos/{owner}/{repo}/projects` - Project management
- **Webhooks**: Real-time issue updates
- **Custom Fields**: Add time tracking via issue comments

#### **Time Tracking Approach**
- **No native time tracking** in GitHub
- **Issue comments** for time logging
- **Custom labels** for time tracking
- **Project milestones** for time organization

#### **Integration Methods**
```typescript
// GitHub API Example
const octokit = new Octokit({
  auth: 'your-github-token'
});

// Add time tracking comment to issue
await octokit.rest.issues.createComment({
  owner: 'username',
  repo: 'repository',
  issue_number: 123,
  body: `⏱️ Time logged: 2.5 hours - Development work`
});
```

### **4. Visual Studio Project Management**

#### **Team Foundation Server (TFS)**
- **Work Items**: Native work item time tracking
- **Time Tracking**: Built-in time tracking fields
- **Reporting**: Native time tracking reports
- **Integration**: Direct integration with Visual Studio

#### **Azure DevOps**
- **Work Items API**: Time tracking via work items
- **Time Tracking**: Built-in time tracking functionality
- **Reporting**: Native time tracking reports
- **Webhooks**: Real-time work item updates

## 🏗️ **Extension Architecture Plan**

### **Core Components**
1. **Time Tracker Core**: Main time tracking logic
2. **File Activity Monitor**: Track file changes and focus
3. **Integration Layer**: Connect to project management tools
4. **Storage Layer**: Local time data storage
5. **UI Layer**: Time tracking interface

### **Data Flow**
```
File Activity → Time Tracker → Storage → Integration → Project Management
```

### **Key Features**
- **Automatic Tracking**: Track time based on file activity
- **Manual Entry**: Override automatic tracking
- **Project Correlation**: Link time to specific issues/tasks
- **Real-time Sync**: Sync with project management tools
- **Reporting**: Generate time reports and analytics

## 🔌 **Integration Strategies**

### **1. Webhook Integration**
- **Real-time updates** from project management tools
- **Issue status changes** trigger time tracking updates
- **Project switching** based on active issues

### **2. API Integration**
- **REST API calls** to project management tools
- **Authentication** via API keys and OAuth
- **Rate limiting** and error handling

### **3. Local Storage**
- **Time data** stored locally
- **Sync queue** for offline work
- **Backup and restore** functionality

## 📋 **Implementation Roadmap**

### **Phase 1: Core Extension**
- [ ] Basic Cursor extension setup
- [ ] File activity monitoring
- [ ] Local time storage
- [ ] Basic UI for time tracking

### **Phase 2: Linear Integration**
- [ ] Linear API integration
- [ ] Issue linking
- [ ] Time logging to Linear
- [ ] Webhook support

### **Phase 3: Additional Integrations**
- [ ] Jira integration
- [ ] GitHub integration
- [ ] Visual Studio integration
- [ ] Multi-tool support

### **Phase 4: Advanced Features**
- [ ] Time reporting
- [ ] Analytics dashboard
- [ ] Team collaboration
- [ ] Export capabilities

## 🛠️ **Technical Requirements**

### **Development Stack**
- **TypeScript**: Extension development
- **VS Code Extension API**: Core functionality
- **Node.js**: Backend services
- **React**: UI components (if needed)

### **Dependencies**
- **Linear SDK**: Linear API integration
- **Jira SDK**: Jira API integration
- **GitHub SDK**: GitHub API integration
- **Local Storage**: Time data persistence

### **Authentication**
- **API Keys**: For project management tools
- **OAuth**: For secure authentication
- **Token Management**: Secure token storage

## 📊 **Time Tracking Features**

### **Automatic Tracking**
- **File Activity**: Track time spent on specific files
- **Project Switching**: Track time per project
- **Focus Detection**: Track active vs. inactive time
- **Break Detection**: Automatically detect breaks

### **Manual Tracking**
- **Time Entry**: Manual time entry for meetings, research
- **Task Association**: Link time to specific tasks
- **Category Tagging**: Categorize time (development, testing, etc.)
- **Note Taking**: Add notes to time entries

### **Reporting**
- **Daily Reports**: Time spent per day
- **Project Reports**: Time per project/issue
- **Team Reports**: Team time analytics
- **Export**: CSV, JSON, PDF exports

## 🎯 **Success Metrics**

### **User Experience**
- **Seamless Integration**: No disruption to workflow
- **Accurate Tracking**: Reliable time tracking
- **Easy Reporting**: Simple time reports
- **Multi-tool Support**: Works with preferred tools

### **Technical Goals**
- **Performance**: Minimal impact on Cursor performance
- **Reliability**: Consistent time tracking
- **Scalability**: Support for large projects
- **Maintainability**: Clean, documented code

## 🔍 **Research Notes**

### **Cursor Extension Development**
- **VS Code Extension API**: Standard extension development
- **File Activity Monitoring**: Track file changes and focus
- **Status Bar Integration**: Display time tracking info
- **Command Palette**: Manual time entry controls

### **Project Management Tool APIs**
- **Linear**: No native time tracking, use comments/custom fields
- **Jira**: Native worklog support, built-in time tracking
- **GitHub**: No native time tracking, use issue comments
- **Visual Studio**: Native time tracking via TFS/Azure DevOps

### **Integration Challenges**
- **Authentication**: API keys and OAuth for different tools
- **Rate Limiting**: Handle API rate limits gracefully
- **Offline Support**: Queue time entries when offline
- **Data Sync**: Keep time data synchronized across tools

---

**This document serves as the foundation for developing the Cursor Time Tracker Extension with comprehensive project management tool integration.**
