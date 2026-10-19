import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  seedIfEmpty,
  getAllNetworkData,
  saveTerritoryContour,
  upsertPipeline,
  deletePipeline,
  upsertWell,
  deleteWell,
  upsertValve,
  deleteValve,
  upsertSwitchboard,
  deleteSwitchboard,
  upsertSubstation,
  deleteSubstation,
  upsertFireHydrant,
  deleteFireHydrant,
  upsertLightPole,
  deleteLightPole,
  upsertWifiHotspot,
  deleteWifiHotspot,
  upsertPlot,
  upsertBarrierGate,
  deleteBarrierGate,
  upsertAdminFacility,
  deleteAdminFacility,
  upsertGasRegulator,
  updateObjectCoordinates,
} from './src/db/networks.ts';
import { getOrCreateUser, getUsers } from './src/db/users.ts';
import { optionalAuth, requireAuth, AuthRequest } from './src/middleware/auth.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '10mb' }));

  // Initialize DB seed asynchronously in background
  seedIfEmpty().catch((err) => {
    console.error('Initial DB seeding error:', err);
  });

  // API ROUTES

  // Get full engineering network state from PostgreSQL
  app.get('/api/networks', async (_req, res) => {
    try {
      const data = await getAllNetworkData();
      res.json(data);
    } catch (error: any) {
      console.error('Error in GET /api/networks:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch network data' });
    }
  });

  // Save drawn territory contour / boundary to PostgreSQL
  app.post('/api/networks/boundary', async (req, res) => {
    try {
      const { polygon } = req.body;
      if (!Array.isArray(polygon)) {
        return res.status(400).json({ error: 'polygon array is required' });
      }
      const saved = await saveTerritoryContour(polygon);
      res.json({ success: true, boundary: saved });
    } catch (error: any) {
      console.error('Error saving contour boundary:', error);
      res.status(500).json({ error: error.message || 'Failed to save boundary contour' });
    }
  });

  // Pipeline CRUD
  app.post('/api/networks/pipelines', async (req, res) => {
    try {
      const saved = await upsertPipeline(req.body);
      res.json({ success: true, item: saved });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to save pipeline' });
    }
  });

  app.delete('/api/networks/pipelines/:id', async (req, res) => {
    try {
      const result = await deletePipeline(req.params.id);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to delete pipeline' });
    }
  });

  // Wells CRUD
  app.post('/api/networks/wells', async (req, res) => {
    try {
      const saved = await upsertWell(req.body);
      res.json({ success: true, item: saved });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to save well' });
    }
  });

  app.delete('/api/networks/wells/:id', async (req, res) => {
    try {
      const result = await deleteWell(req.params.id);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to delete well' });
    }
  });

  // Valves CRUD
  app.post('/api/networks/valves', async (req, res) => {
    try {
      const saved = await upsertValve(req.body);
      res.json({ success: true, item: saved });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to save valve' });
    }
  });

  app.delete('/api/networks/valves/:id', async (req, res) => {
    try {
      const result = await deleteValve(req.params.id);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to delete valve' });
    }
  });

  // Switchboards CRUD
  app.post('/api/networks/switchboards', async (req, res) => {
    try {
      const saved = await upsertSwitchboard(req.body);
      res.json({ success: true, item: saved });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to save switchboard' });
    }
  });

  app.delete('/api/networks/switchboards/:id', async (req, res) => {
    try {
      const result = await deleteSwitchboard(req.params.id);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to delete switchboard' });
    }
  });

  // Substations CRUD
  app.post('/api/networks/substations', async (req, res) => {
    try {
      const saved = await upsertSubstation(req.body);
      res.json({ success: true, item: saved });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to save substation' });
    }
  });

  app.delete('/api/networks/substations/:id', async (req, res) => {
    try {
      const result = await deleteSubstation(req.params.id);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to delete substation' });
    }
  });

  // Fire Hydrants CRUD
  app.post('/api/networks/fire-hydrants', async (req, res) => {
    try {
      const saved = await upsertFireHydrant(req.body);
      res.json({ success: true, item: saved });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to save fire hydrant' });
    }
  });

  app.delete('/api/networks/fire-hydrants/:id', async (req, res) => {
    try {
      const result = await deleteFireHydrant(req.params.id);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to delete fire hydrant' });
    }
  });

  // Light Poles CRUD
  app.post('/api/networks/light-poles', async (req, res) => {
    try {
      const saved = await upsertLightPole(req.body);
      res.json({ success: true, item: saved });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to save light pole' });
    }
  });

  app.delete('/api/networks/light-poles/:id', async (req, res) => {
    try {
      const result = await deleteLightPole(req.params.id);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to delete light pole' });
    }
  });

  // Wifi Hotspots CRUD
  app.post('/api/networks/wifi-hotspots', async (req, res) => {
    try {
      const saved = await upsertWifiHotspot(req.body);
      res.json({ success: true, item: saved });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to save wifi hotspot' });
    }
  });

  app.delete('/api/networks/wifi-hotspots/:id', async (req, res) => {
    try {
      const result = await deleteWifiHotspot(req.params.id);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to delete wifi hotspot' });
    }
  });

  // Plots CRUD
  app.post('/api/networks/plots', async (req, res) => {
    try {
      const saved = await upsertPlot(req.body);
      res.json({ success: true, item: saved });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to save plot' });
    }
  });

  // Barrier Gates CRUD
  app.post('/api/networks/barrier-gates', async (req, res) => {
    try {
      const saved = await upsertBarrierGate(req.body);
      res.json({ success: true, item: saved });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to save barrier gate' });
    }
  });

  app.delete('/api/networks/barrier-gates/:id', async (req, res) => {
    try {
      const result = await deleteBarrierGate(req.params.id);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to delete barrier gate' });
    }
  });

  // Admin Facilities CRUD
  app.post('/api/networks/admin-facilities', async (req, res) => {
    try {
      const saved = await upsertAdminFacility(req.body);
      res.json({ success: true, item: saved });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to save admin facility' });
    }
  });

  app.delete('/api/networks/admin-facilities/:id', async (req, res) => {
    try {
      const result = await deleteAdminFacility(req.params.id);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to delete admin facility' });
    }
  });

  // Gas Regulator
  app.post('/api/networks/gas-regulator', async (req, res) => {
    try {
      const saved = await upsertGasRegulator(req.body);
      res.json({ success: true, item: saved });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to save gas regulator' });
    }
  });

  // Universal Coordinate update for Drag & Drop
  app.post('/api/networks/coordinates', async (req, res) => {
    try {
      const { type, id, coordinates } = req.body;
      if (!type || !id || !coordinates) {
        return res.status(400).json({ error: 'type, id, and coordinates are required' });
      }
      const result = await updateObjectCoordinates(type, id, coordinates);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to update coordinates' });
    }
  });

  // User management endpoints
  app.get('/api/users', optionalAuth, async (_req, res) => {
    try {
      const users = await getUsers();
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch users' });
    }
  });

  app.post('/api/users/sync', optionalAuth, async (req: AuthRequest, res) => {
    try {
      const { uid, email, name, role } = req.body;
      const user = await getOrCreateUser(uid || req.user?.uid || 'guest-1', email || req.user?.email || 'admin@dtsn-pensioner.ru', name, role);
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to sync user' });
    }
  });

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', database: 'connected' });
  });

  // Mount Vite middleware for SPA
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
