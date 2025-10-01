# Authentication System - Quick Reference

## 🚀 Quick Start

### **1. Start the Application**
```bash
cd "/Users/zinchiang/DJ HEL1X Website/interactive-globe"
npm start
```

### **2. Test Authentication**
- Visit `http://localhost:3000`
- Click "Sign In" button
- Try signing up with a test email
- Test the user profile and analytics

## 🔧 Configuration

### **Environment Variables**
```bash
# Required for authentication
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### **Database Setup**
1. Run the SQL script in Supabase dashboard:
   ```sql
   -- Copy contents from supabase_setup.sql
   ```

## 📁 Key Files

### **Authentication Components**
- `src/contexts/AuthContext.tsx` - Authentication state management
- `src/components/auth/AuthModal.tsx` - Sign in/up modal
- `src/components/auth/UserProfile.tsx` - User profile dropdown
- `src/components/auth/UserAnalytics.tsx` - Analytics dashboard

### **Configuration Files**
- `src/lib/supabase.ts` - Supabase client configuration
- `supabase_setup.sql` - Database schema and policies

## 🎯 Key Features

### **Authentication Flow**
1. **Sign Up** - Create new account
2. **Sign In** - Authenticate existing user
3. **Session Management** - Automatic token refresh
4. **Sign Out** - Clean session termination

### **User Analytics**
- **Total locations** created
- **Total actions** performed
- **Activity level** calculation
- **Last activity** timestamp
- **Member since** date

### **Data Architecture**
- **Local-first** - All data stored locally
- **Optional cloud** - Authentication and analytics only
- **Export/Import** - Full data portability
- **Offline support** - Works without internet

## 🔒 Security Features

### **Data Privacy**
- ✅ **Local storage** - Data stays on device
- ✅ **Optional cloud** - User controls sharing
- ✅ **No auto-upload** - Manual export only
- ✅ **User consent** - Clear opt-in for cloud features

### **Authentication Security**
- ✅ **Supabase Auth** - Industry-standard security
- ✅ **JWT tokens** - Secure session management
- ✅ **Row Level Security** - Database-level access control
- ✅ **HTTPS only** - Secure data transmission

## 🚨 Troubleshooting

### **Common Issues**

#### **Port 3000 Already in Use**
```bash
# Kill existing processes
lsof -ti:3000 | xargs kill -9
# Or use different port
PORT=3001 npm start
```

#### **Authentication Not Working**
1. Check environment variables
2. Verify Supabase configuration
3. Check browser console for errors
4. Test in incognito mode

#### **Database Connection Issues**
1. Verify Supabase URL and key
2. Check RLS policies
3. Test database connection
4. Review error logs

### **Debug Commands**
```bash
# Check if server is running
lsof -i :3000

# Check environment variables
echo $REACT_APP_SUPABASE_URL

# Test Supabase connection
# Check browser network tab for API calls
```

## 📊 Analytics Tracking

### **Tracked Actions**
- **Location creation** - New data points
- **Visualization changes** - Column mappings
- **Project operations** - Save/load projects
- **Authentication events** - Sign in/out

### **Analytics Dashboard**
- **User statistics** - Locations, actions, activity
- **Activity level** - Usage patterns
- **Time tracking** - Last activity, member since
- **Progress metrics** - User engagement

## 🔄 Data Flow

### **Local Storage (Primary)**
```
User Action → Local Storage → Immediate Response
     ↓              ↓              ↓
  Fast Access    No Network    Offline Support
```

### **Cloud Features (Optional)**
```
User Action → Local Storage → Cloud Sync
     ↓              ↓              ↓
  Immediate      Fast Access    Analytics
  Response       No Network     Tracking
```

## 🎯 Next Steps

### **Immediate Actions**
1. **Test authentication** - Sign up/sign in flow
2. **Set up database** - Run Supabase SQL script
3. **Test analytics** - Check user dashboard
4. **Deploy to production** - Use Vercel

### **Future Enhancements**
- **Real-time collaboration** - Share projects
- **Advanced analytics** - Detailed insights
- **Mobile support** - Responsive design
- **API integrations** - External data sources

## 📚 Documentation Links

- [Full Architecture Documentation](./Authentication-System-Architecture.md)
- [Local Database Architecture](./Local-Database-Architecture.md)
- [Globe Filter Implementation](./Globe-Filter-Implementation.md)
- [Dataset Import Guide](./DATASET_IMPORT_GUIDE.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)

---

**Quick Reference** - Last Updated: January 2025
