# Quick Start Guide

## Prerequisites

1. **Supabase Database Setup** ✅ COMPLETED
   - Database schema has been created via Supabase MCP
   - All 7 tables are ready: pages, ad_accounts, business_managers, pixels, business_assets, sync_history, tokens
   - Phase 1 tests passed successfully

2. **Environment Variables**
   - Backend `.env` file is already created with your credentials
   - Frontend `.env` file is already created

## Starting the Application

### 1. Start Backend Server

```bash
npm start
# or for development with auto-reload
npm run dev
```

Server will start on http://localhost:3001

### 2. Start Frontend

```bash
cd frontend
npm run dev
```

Frontend will start on http://localhost:5173

## Testing

### Test Token
```bash
npm run test:token
```

### Test Phase 1 (After database setup)
```bash
npm run test:phase1
```

## API Endpoints

### Health Check
```bash
curl http://localhost:3001/health
```

### Token Status
```bash
curl http://localhost:3001/api/token/status
```

### Sync Assets
```bash
curl -X POST http://localhost:3001/api/sync-assets
```

## Current Status

✅ **Completed:**
- Phase 0.5: Token testing
- Phase 0: Token management
- Phase 1: Backend setup + Database schema created ✅
- Phase 2: Frontend setup and sidebar
- Phase 3-6: API services and forms
- Phase 8: UI integration

⏳ **Pending:**
- Phase 7: Placement customization UI
- Additional testing and refinement

## Next Steps

1. ✅ Database tables created (via Supabase MCP)
2. ✅ Phase 1 tested and working
3. Start frontend and test UI: `cd frontend && npm run dev`
4. Test campaign creation flow
5. Implement Phase 7: Placement customization UI
