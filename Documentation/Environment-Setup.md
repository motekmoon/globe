# Environment Setup Guide

## 🔧 Development vs Production Authentication

### **Current Status: Development Mode**
The application is currently running in **development mode** with **mock authentication**. This means:

- ✅ **UI works perfectly** - Tab switching and forms display correctly
- ✅ **Mock accounts created** - For testing purposes only
- ❌ **No real Supabase accounts** - Not persisted to database
- ❌ **No email confirmation** - Mock authentication only

### **To Enable Real Authentication:**

#### **1. Create Supabase Project**
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Get your project URL and anon key from Settings > API

#### **2. Set Environment Variables**
Create a `.env` file in the project root:

```bash
# .env file
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### **3. Run Database Setup**
Execute the SQL script in your Supabase dashboard:
```sql
-- Copy contents from supabase_setup.sql
```

#### **4. Restart Development Server**
```bash
npm start
```

### **Development Mode Features**

#### **Mock Authentication**
- **Sign up** - Creates mock user account (not persisted)
- **Sign in** - Uses mock authentication
- **User data** - Stored locally only
- **Analytics** - Mock data for testing

#### **Visual Indicators**
- **Yellow banner** in authentication modal
- **Console logs** showing development mode
- **Mock user creation** messages

### **Testing Authentication Flow**

#### **With Mock Authentication (Current)**
1. **Open modal** → See development mode banner
2. **Sign up** → Mock account created, modal closes
3. **Sign in** → Mock authentication works
4. **User profile** → Shows mock user data

#### **With Real Supabase (After Setup)**
1. **Open modal** → No development banner
2. **Sign up** → Real account created in Supabase
3. **Email confirmation** → Supabase sends verification email
4. **Sign in** → Real authentication with Supabase
5. **User profile** → Shows real user data

### **Security Considerations**

#### **Development Mode**
- ✅ **No real data exposure** - Mock authentication only
- ✅ **Local testing** - Safe for development
- ✅ **No external dependencies** - Works offline

#### **Production Mode**
- ✅ **Real authentication** - Supabase handles security
- ✅ **Email verification** - Supabase sends confirmation emails
- ✅ **Data persistence** - User accounts stored in Supabase
- ✅ **Row Level Security** - Database-level access control

### **Troubleshooting**

#### **Authentication Not Working**
1. **Check environment variables** - Ensure REACT_APP_SUPABASE_URL is set
2. **Check console logs** - Look for development mode messages
3. **Check Supabase dashboard** - Verify project is active
4. **Check database setup** - Ensure SQL script was run

#### **Mock Authentication Issues**
1. **Clear browser data** - Reset local storage
2. **Check console logs** - Look for error messages
3. **Restart development server** - Reload environment variables

### **Next Steps**

1. **Test current mock authentication** - Verify UI works correctly
2. **Set up Supabase project** - For real authentication
3. **Configure environment variables** - Enable production mode
4. **Test real authentication** - Verify account creation and email verification

---

**Environment Setup** - Last Updated: January 2025  
**Status:** Development Mode Active  
**Next:** Configure Supabase for Production Authentication
