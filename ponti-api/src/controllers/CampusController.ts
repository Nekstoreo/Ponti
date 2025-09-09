import { Response, NextFunction } from 'express';
import { campusService } from '../services/CampusService';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest, CustomError, ErrorCodes } from '../types';

export class CampusController {
  /**
   * GET /api/campus
   * Get all active campuses
   */
  async getAllCampuses(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const campuses = await campusService.getAllCampuses();
      
      sendSuccess(res, campuses, 'Campuses retrieved successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/campus/:campusId
   * Get specific campus information
   */
  async getCampusInfo(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { campusId } = req.params;
      
      const campus = await campusService.getCampusInfo(campusId);
      
      sendSuccess(res, campus, 'Campus information retrieved successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/campus/:campusId/services
   * Get campus services
   */
  async getCampusServices(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { campusId } = req.params;
      const { serviceType } = req.query;
      
      const services = await campusService.getCampusServices(campusId, serviceType as string);
      
      sendSuccess(res, services, 'Campus services retrieved successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/campus/:campusId/buildings
   * Get campus buildings
   */
  async getCampusBuildings(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { campusId } = req.params;
      
      const buildings = await campusService.getCampusBuildings(campusId);
      
      sendSuccess(res, buildings, 'Campus buildings retrieved successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/campus/:campusId/buildings/:buildingId
   * Get specific building information
   */
  async getBuildingInfo(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { campusId, buildingId } = req.params;
      
      const building = await campusService.getBuildingInfo(campusId, buildingId);
      
      sendSuccess(res, building, 'Building information retrieved successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/campus/:campusId/facilities
   * Get campus facilities
   */
  async getCampusFacilities(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { campusId } = req.params;
      const { facilityType } = req.query;
      
      const facilities = await campusService.getCampusFacilities(campusId, facilityType as string);
      
      sendSuccess(res, facilities, 'Campus facilities retrieved successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/campus/:campusId/search
   * Search campus locations (buildings, services)
   */
  async searchCampusLocations(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { campusId } = req.params;
      const { query, type = 'all' } = req.query;
      
      if (!query) {
        const error: CustomError = new Error('Search query is required') as CustomError;
        error.statusCode = 400;
        error.code = ErrorCodes.VALIDATION_ERROR;
        throw error;
      }

      const results = await campusService.searchCampusLocations(
        campusId, 
        query as string, 
        type as string
      );
      
      sendSuccess(res, results, 'Search results retrieved successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/campus/:campusId/services/:serviceType
   * Get services by type
   */
  async getServicesByType(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { campusId, serviceType } = req.params;
      
      const services = await campusService.getServicesByType(campusId, serviceType);
      
      sendSuccess(res, services, `${serviceType} services retrieved successfully`, 200);
    } catch (error) {
      next(error);
    }
  }
}

// Export singleton instance
export const campusController = new CampusController();