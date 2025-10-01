# React Hooks Best Practices

## 🎯 Quick Reference

### **✅ DO: Correct Patterns**
```typescript
// 1. Declare functions before using them
const fetchData = useCallback(async () => {
  // implementation
}, [dependency]);

useEffect(() => {
  fetchData();
}, [fetchData]);

// 2. Include all dependencies
useEffect(() => {
  if (user) {
    doSomething(user.id);
  }
}, [user, doSomething]);

// 3. Use useCallback for functions in dependency arrays
const handleClick = useCallback(() => {
  // implementation
}, [dependency]);
```

### **❌ DON'T: Common Mistakes**
```typescript
// 1. Using function before declaration
useEffect(() => {
  fetchData(); // ❌ Error: used before declaration
}, [fetchData]);

const fetchData = useCallback(() => {
  // implementation
}, []);

// 2. Missing dependencies
useEffect(() => {
  if (user) {
    doSomething(user.id); // ❌ Missing doSomething in deps
  }
}, [user]); // ❌ Missing doSomething

// 3. Not using useCallback for functions in deps
const handleClick = () => {
  // implementation
};

useEffect(() => {
  handleClick(); // ❌ Will cause infinite re-renders
}, [handleClick]);
```

## 🔧 Common Patterns

### **Data Fetching with useCallback**
```typescript
const fetchUserData = useCallback(async () => {
  if (!user) return;
  
  try {
    setLoading(true);
    const response = await fetch(`/api/users/${user.id}`);
    const data = await response.json();
    setUserData(data);
  } catch (error) {
    console.error('Failed to fetch user data:', error);
  } finally {
    setLoading(false);
  }
}, [user]);

useEffect(() => {
  fetchUserData();
}, [fetchUserData]);
```

### **Event Handlers with useCallback**
```typescript
const handleSubmit = useCallback((e: React.FormEvent) => {
  e.preventDefault();
  if (user) {
    submitData(user.id, formData);
  }
}, [user, formData]);

const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
  setFormData(prev => ({
    ...prev,
    [e.target.name]: e.target.value
  }));
}, []);
```

### **Conditional Effects**
```typescript
useEffect(() => {
  if (user && isAuthenticated) {
    fetchUserData();
  }
}, [user, isAuthenticated, fetchUserData]);
```

## 🚨 Common Pitfalls

### **1. Infinite Re-renders**
```typescript
// ❌ WRONG: Function recreated on every render
const fetchData = () => {
  // implementation
};

useEffect(() => {
  fetchData();
}, [fetchData]); // fetchData changes every render

// ✅ CORRECT: Memoized function
const fetchData = useCallback(() => {
  // implementation
}, [dependency]);

useEffect(() => {
  fetchData();
}, [fetchData]);
```

### **2. Missing Dependencies**
```typescript
// ❌ WRONG: Missing dependencies
useEffect(() => {
  if (user) {
    fetchUserData(user.id);
  }
}, [user]); // Missing fetchUserData

// ✅ CORRECT: Include all dependencies
useEffect(() => {
  if (user) {
    fetchUserData(user.id);
  }
}, [user, fetchUserData]);
```

### **3. Declaration Order**
```typescript
// ❌ WRONG: Using function before declaration
useEffect(() => {
  fetchData();
}, [fetchData]);

const fetchData = useCallback(() => {
  // implementation
}, []);

// ✅ CORRECT: Declare function first
const fetchData = useCallback(() => {
  // implementation
}, []);

useEffect(() => {
  fetchData();
}, [fetchData]);
```

## 🛠️ Debugging Tips

### **1. Check Dependencies**
```typescript
// Add console.log to see what's changing
useEffect(() => {
  console.log('Effect running:', { user, fetchData });
  fetchData();
}, [user, fetchData]);
```

### **2. Use ESLint Rules**
```json
{
  "rules": {
    "react-hooks/exhaustive-deps": "error",
    "react-hooks/rules-of-hooks": "error"
  }
}
```

### **3. TypeScript Strict Mode**
```typescript
// Enable strict mode in tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

## 📚 Best Practices Summary

### **1. Function Declaration Order**
- Always declare functions before using them
- Use `useCallback` for functions in dependency arrays
- Keep related code together

### **2. Dependency Management**
- Include all referenced variables in dependency arrays
- Use `useCallback` to prevent unnecessary re-renders
- Be explicit about dependencies

### **3. Error Handling**
- Add null checks for optional values
- Handle loading states properly
- Provide fallback values

### **4. Performance**
- Use `useCallback` for expensive functions
- Use `useMemo` for expensive calculations
- Avoid creating objects/functions in render

## 🔍 Code Review Checklist

### **React Hooks**
- [ ] All functions declared before use
- [ ] `useCallback` used for functions in dependency arrays
- [ ] All dependencies included in dependency arrays
- [ ] No infinite re-render loops
- [ ] Proper null checks for optional values

### **TypeScript**
- [ ] No "used before declaration" errors
- [ ] Proper type annotations
- [ ] No implicit any types
- [ ] Strict mode enabled

### **Performance**
- [ ] No unnecessary re-renders
- [ ] Memoization used appropriately
- [ ] Dependencies optimized
- [ ] No memory leaks

## 🎯 Quick Fixes

### **"Used before declaration" Error**
```typescript
// Move function declaration before useEffect
const myFunction = useCallback(() => {
  // implementation
}, [dependencies]);

useEffect(() => {
  myFunction();
}, [myFunction]);
```

### **Infinite Re-render Loop**
```typescript
// Use useCallback to memoize function
const myFunction = useCallback(() => {
  // implementation
}, [dependencies]);
```

### **Missing Dependencies Warning**
```typescript
// Include all referenced variables
useEffect(() => {
  if (user) {
    doSomething(user.id);
  }
}, [user, doSomething]); // Include both user and doSomething
```

---

**Best Practices Guide** - Last Updated: January 2025  
**Status:** Active  
**Target Audience:** React Developers  
**Maintenance:** Regular Updates
