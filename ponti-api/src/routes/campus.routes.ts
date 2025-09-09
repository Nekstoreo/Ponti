import { Router } from 'express';
import { campusController } from '../controllers/CampusController';
import { validateQuery, validateParams } from '../middleware/validation';
import { campusQuerySchema, campusParamSchema, locationSearchSchema } from '../validators/campus.validator';
import { authenticateToken } from '../middleware/auth';

const router: Router = Router();

// All campus routes require authentication
router.use(authenticateToken);

/**
 * GET /api/campus
 * Get all active campuses
 */
router.get('/', campusController.getAllCampuses);

/**
 * GET /api/campus/:campusId
 * Get specific campus information
 */
router.get('/:campusId', validateParams(campusParamSchema), campusController.getCampusInfo);

/**
 * GET /api/campus/:campusId/services
 * Get campus services
 */
router.get('/:campusId/services', 
  validateParams(campusParamSchema), 
  validateQuery(campusQuerySchema), 
  campusController.getCampusServices
);

/**
 * GET /api/campus/:campusId/buildings
 * Get campus buildings
 */
router.get('/:campusId/buildings', 
  validateParams(campusParamSchema), 
  campusController.getCampusBuildings
);

/**
 * GET /api/campus/:campusId/buildings/:buildingId
 * Get specific building information
 */
router.get('/:campusId/buildings/:buildingId', campusController.getBuildingInfo);

/**
 * GET /api/campus/:campusId/facilities
 * Get campus facilities
 */
router.get('/:campusId/facilities', 
  validateParams(campusParamSchema), 
  campusController.getCampusFacilities
);

/**
 * GET /api/campus/:campusId/search
 * Search campus locations
 */
router.get('/:campusId/search', 
  validateParams(campusParamSchema), 
  validateQuery(locationSearchSchema), 
  campusController.searchCampusLocations
);

/**
 * GET /api/campus/:campusId/services/:serviceType
 * Get services by type
 */
router.get('/:campusId/services/:serviceType', campusController.getServicesByType);

export default router;