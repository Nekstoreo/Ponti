import { Campus, ICampus } from '../models/Campus';
import { CustomError, ErrorCodes } from '../types';

export interface ICampusRepository {
  findAll(): Promise<ICampus[]>;
  findByCampusId(campusId: string): Promise<ICampus | null>;
  findActiveCampuses(): Promise<ICampus[]>;
  findServicesByType(campusId: string, serviceType: string): Promise<any[]>;
  findBuildingById(campusId: string, buildingId: string): Promise<any | null>;
  searchLocations(campusId: string, query: string, type?: string): Promise<any[]>;
  getFacilitiesByType(campusId: string, facilityType: string): Promise<any[]>;
}

export class CampusRepository implements ICampusRepository {
  async findAll(): Promise<ICampus[]> {
    try {
      return await Campus.find().sort({ name: 1 });
    } catch (error) {
      const repoError: CustomError = new Error('Failed to fetch campuses') as CustomError;
      repoError.statusCode = 500;
      repoError.code = ErrorCodes.DATABASE_ERROR;
      repoError.details = error;
      throw repoError;
    }
  }

  async findByCampusId(campusId: string): Promise<ICampus | null> {
    try {
      return await Campus.findOne({ campusId, isActive: true });
    } catch (error) {
      const repoError: CustomError = new Error('Failed to fetch campus') as CustomError;
      repoError.statusCode = 500;
      repoError.code = ErrorCodes.DATABASE_ERROR;
      repoError.details = error;
      throw repoError;
    }
  }

  async findActiveCampuses(): Promise<ICampus[]> {
    try {
      return await Campus.find({ isActive: true }).sort({ name: 1 });
    } catch (error) {
      const repoError: CustomError = new Error('Failed to fetch active campuses') as CustomError;
      repoError.statusCode = 500;
      repoError.code = ErrorCodes.DATABASE_ERROR;
      repoError.details = error;
      throw repoError;
    }
  }

  async findServicesByType(campusId: string, serviceType: string): Promise<any[]> {
    try {
      const campus = await Campus.findOne({ campusId, isActive: true });
      
      if (!campus) {
        return [];
      }

      return campus.services.filter(service => service.type === serviceType);
    } catch (error) {
      const repoError: CustomError = new Error('Failed to fetch services by type') as CustomError;
      repoError.statusCode = 500;
      repoError.code = ErrorCodes.DATABASE_ERROR;
      repoError.details = error;
      throw repoError;
    }
  }

  async findBuildingById(campusId: string, buildingId: string): Promise<any | null> {
    try {
      const campus = await Campus.findOne({ campusId, isActive: true });
      
      if (!campus) {
        return null;
      }

      return campus.buildings.find(building => building.buildingId === buildingId) || null;
    } catch (error) {
      const repoError: CustomError = new Error('Failed to fetch building') as CustomError;
      repoError.statusCode = 500;
      repoError.code = ErrorCodes.DATABASE_ERROR;
      repoError.details = error;
      throw repoError;
    }
  }

  async searchLocations(campusId: string, query: string, type: string = 'all'): Promise<any[]> {
    try {
      const campus = await Campus.findOne({ campusId, isActive: true });
      
      if (!campus) {
        return [];
      }

      const results: any[] = [];
      const searchTerm = query.toLowerCase();

      // Search buildings
      if (type === 'all' || type === 'building') {
        const matchingBuildings = campus.buildings.filter(building =>
          building.name.toLowerCase().includes(searchTerm) ||
          building.shortName.toLowerCase().includes(searchTerm) ||
          (building.description && building.description.toLowerCase().includes(searchTerm))
        );

        results.push(...matchingBuildings.map(building => ({
          ...building.toObject(),
          type: 'building'
        })));
      }

      // Search services
      if (type === 'all' || type === 'service') {
        const matchingServices = campus.services.filter(service =>
          service.name.toLowerCase().includes(searchTerm) ||
          (service.description && service.description.toLowerCase().includes(searchTerm)) ||
          service.location.toLowerCase().includes(searchTerm)
        );

        results.push(...matchingServices.map(service => ({
          ...service.toObject(),
          type: 'service'
        })));
      }

      return results;
    } catch (error) {
      const repoError: CustomError = new Error('Failed to search locations') as CustomError;
      repoError.statusCode = 500;
      repoError.code = ErrorCodes.DATABASE_ERROR;
      repoError.details = error;
      throw repoError;
    }
  }

  async getFacilitiesByType(campusId: string, facilityType: string): Promise<any[]> {
    try {
      const campus = await Campus.findOne({ campusId, isActive: true });
      
      if (!campus) {
        return [];
      }

      return campus.facilities.filter(facility => facility.type === facilityType);
    } catch (error) {
      const repoError: CustomError = new Error('Failed to fetch facilities by type') as CustomError;
      repoError.statusCode = 500;
      repoError.code = ErrorCodes.DATABASE_ERROR;
      repoError.details = error;
      throw repoError;
    }
  }
}

// Export singleton instance
export const campusRepository = new CampusRepository();