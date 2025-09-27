# Globe Agent Server Management Rules

## Overview
This document defines the server management protocol for the Globe project to ensure proper port allocation and avoid conflicts with other projects.

## Port Allocation Rules

### 🚫 RESTRICTED PORTS (Skip Project)
**DO NOT USE - Reserved for Skip Project:**
- **Port 3000** - Skip project primary server
- **Port 3001** - Skip project secondary server  
- **Port 3002** - Skip project tertiary server

**Globe Agent MUST NEVER:**
- Kill processes on ports 3000-3002
- Start servers on ports 3000-3002
- Interfere with Skip project operations

### ✅ AVAILABLE PORTS FOR GLOBE
**Globe Project Ports:**
- **Port 3003** - Globe primary development server (default)
- **Port 3004** - Globe additional services (if needed)
- **Port 3005+** - Globe additional services (first come, first serve)

**Available for Globe:**
- Any port 3003 and above
- Any port not in use by other projects
- First come, first serve basis

## Globe Agent Protocol

### When User Says "Kill Servers"
**Globe Agent Actions:**
- ✅ Kill Globe development server (port 3003+)
- ✅ Kill Globe-related Node.js processes
- ✅ Kill Globe npm/react-scripts processes
- ❌ **NEVER** touch Skip project servers (ports 3000-3002)
- ❌ **NEVER** interfere with other project servers

### When User Says "Start Server"
**Globe Agent Actions:**
- ✅ Start Globe development server on port 3003
- ✅ Use `PORT=3003 npm start` command
- ✅ Verify port 3003 is available before starting
- ❌ **NEVER** use ports 3000-3002
- ❌ **NEVER** interfere with other projects

### Port Verification Commands
```bash
# Check if Globe port is available
lsof -i :3003

# Check if Skip ports are protected
lsof -i :3000  # Should show Skip processes
lsof -i :3001  # Should show Skip processes  
lsof -i :3002  # Should show Skip processes

# Start Globe server on correct port
cd "/Users/zinchiang/DJ HEL1X Website/interactive-globe"
PORT=3003 npm start
```

## Server Management Commands

### Globe Server Operations
```bash
# Start Globe development server
cd "/Users/zinchiang/DJ HEL1X Website/interactive-globe"
PORT=3003 npm start

# Kill Globe servers only
pkill -f "PORT=3003"
pkill -f "interactive-globe"
lsof -ti:3003 | xargs kill -9

# Check Globe server status
curl -s http://localhost:3003 > /dev/null && echo "Globe server running" || echo "Globe server stopped"
```

### Prohibited Operations
```bash
# ❌ NEVER run these commands
pkill -f "port.*3000"  # Would kill Skip servers
pkill -f "port.*3001"  # Would kill Skip servers
pkill -f "port.*3002"  # Would kill Skip servers
```

## Project Boundaries

### Skip Project (Protected)
- **Location**: `/Users/zinchiang/Skip 4.0/`
- **Ports**: 3000, 3001, 3002
- **Status**: Protected - Globe Agent cannot interfere
- **Purpose**: Skip project development and testing

### Globe Project (Managed)
- **Location**: `/Users/zinchiang/DJ HEL1X Website/interactive-globe/`
- **Ports**: 3003+
- **Status**: Managed by Globe Agent
- **Purpose**: Interactive 3D globe application

## Error Handling

### Port Conflicts
If port 3003 is occupied:
1. Check what process is using it: `lsof -i :3003`
2. If it's a Globe process, kill it: `lsof -ti:3003 | xargs kill -9`
3. If it's another project, use port 3004: `PORT=3004 npm start`

### Skip Project Protection
If Globe Agent accidentally targets Skip ports:
1. **STOP IMMEDIATELY**
2. Do not kill any processes on ports 3000-3002
3. Report the issue
4. Use only ports 3003+ for Globe

## Verification Checklist

### Before Starting Globe Server
- [ ] Port 3003 is available
- [ ] Skip servers (3000-3002) are running normally
- [ ] No conflicts with other projects
- [ ] Globe project directory is correct

### Before Killing Servers
- [ ] Only target Globe-related processes
- [ ] Verify port numbers (3003+)
- [ ] Do not touch Skip project ports (3000-3002)
- [ ] Confirm no other projects affected

## Compliance

### Globe Agent Must Always:
- ✅ Respect Skip project boundaries
- ✅ Use only assigned ports (3003+)
- ✅ Verify port availability before starting
- ✅ Target only Globe-related processes when killing
- ✅ Document any port conflicts or issues

### Globe Agent Must Never:
- ❌ Interfere with Skip project servers
- ❌ Use ports 3000-3002
- ❌ Kill processes without verifying they're Globe-related
- ❌ Start servers without checking port availability

## Emergency Procedures

### If Globe Agent Targets Wrong Ports
1. **IMMEDIATE STOP** - Do not execute kill commands
2. **VERIFY** - Check which ports are being targeted
3. **CORRECT** - Use only ports 3003+ for Globe
4. **REPORT** - Document the incident

### If Port Conflicts Occur
1. **CHECK** - What's using the port: `lsof -i :PORT`
2. **ASSESS** - Is it Globe or another project?
3. **RESOLVE** - Use next available port (3004, 3005, etc.)
4. **DOCUMENT** - Record the port assignment

## Conclusion

These rules ensure proper server management and prevent conflicts between the Globe and Skip projects. The Globe Agent must always respect these boundaries and only manage Globe-specific servers on ports 3003 and above.

**Last Updated**: 2025-09-27
**Status**: Active
**Compliance**: Mandatory
