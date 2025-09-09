import { ICampus } from '../models/Campus';
import { CampusRepository, ICampusRepository } from '../repositories/CampusRepository';
import { CustomError, ErrorCodes } from '../types';

export interface CampusInfo {
  campusId: string;
  name: string;
  shortName: string;
  address: ICampus['address'];
  contact: ICampus['contact'];
  isActive: boolean;
}

export interface ServiceInfo {
  serviceId: string;
  name: string;
  type: string;
  description?: string;
  location: string;
  hours: any;
  contact?: any;
}

export interface BuildingInfo {
  buildingId: string;
  name: string;
  shortName: string;
  floors: number;
  description?: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export interface FacilityInfo {
  facilityId: string;
  name: string;
  type: string;
  description?: string;
  location: any;
  capacity?: number;
  amenities: string[];
}

export interface LocationSearchResult {
  type: 'building' | 'service';
  id: string;
  name: string;
  description?: string;
  location?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface ICampusService {
  getAllCampuses(): Promise<CampusInfo[]>;
  getCampusInfo(campusId: string): Promise<ICampus>;
  getCampusServices(campusId: string, serviceType?: string): Promise<ServiceInfo[]>;
  getCampusBuildings(campusId: string): Promise<BuildingInfo[]>;
  getBuildingInfo(campusId: string, buildingId: string): Promise<BuildingInfo>;
  getCampusFacilities(campusId: string, facilityType?: string): Promise<FacilityInfo[]>;
  searchCampusLocations(campusId: string, query: string, type?: string): Promise<LocationSearchResult[]>;
  getServicesByType(campusId: string, serviceType: string): Promise<ServiceInfo[]>;
  validateCampusExists(campusId: string): Promise<void>;
}

export class CampusService implements ICampusService {
  private campusRepository: ICampusRepository;

  constructor(campusRepository?: ICampusRepository) {
    this.campusRepository = campusRepository || new CampusRepository();
  }

  async getAllCampuses(): Promise<CampusInfo[]> {
    try {
      const campuses = await this.campusRepository.findActiveCampuses();
      
      return campuses.map(campus => ({
        campusId: campus.campusId,
        name: campus.name,
        shortName: campus.shortName,
        address: campus.address,
        contact: campus.contact,
        isActive: campus.isActive
      }));
    } catch (error) {
      if (error instanceof Error && 'statusCode' in error) {
        throw error;
      }

      const serviceError: CustomError = new Error('Failed to get all campuses') as CustomError;
      serviceError.statusCode = 500;
      serviceError.code = ErrorCodes.INTERNAL_SERVER_ERROR;
      serviceError.details = error;
      throw serviceError;
    }
  }

  async getCampusInfo(campusId: string): Promise<ICampus> {
    try {
      const campus = await this.campusRepository.findByCampusId(campusId);
      
      if (!campus) {
        const error: CustomError = new Error('Campus not found') as CustomError;
        error.statusCode = 404;
        error.code = ErrorCodes.NOT_FOUND_ERROR;
        error.details = { campusId };
        throw error;
      }

      return campus;
    } catch (error) {
      if (error instanceof Error && 'statusCode' in error) {
        throw error;
      }

      const serviceError: CustomError = new Error('Failed to get campus info') as CustomError;
      serviceError.statusCode = 500;
      serviceError.code = ErrorCodes.INTERNAL_SERVER_ERROR;
      serviceError.details = error;
      throw serviceError;
    }
  }

  async getCampusServices(campusId: string, serviceType?: string): Promise<ServiceInfo[]> {
    try {
      const campus = await this.getCampusInfo(campusId);
      
      let services = campus.services;
      
      if (serviceType) {
        services = services.filter(service => service.type === serviceType);
      }

      return services.map(service => ({
        serviceId: service.serviceId,
        name: service.name,
        type: service.type,
        description: service.description,
        location: service.location,
        hours: service.hours,
        contact: service.contact
      }));
    } catch (error) {
      if (error instanceof Error && 'statusCode' in error) {
        throw error;
      }

      const serviceError: CustomError = new Error('Failed to get campus services') as CustomError;
      serviceError.statusCode = 500;
      serviceError.code = ErrorCodes.INTERNAL_SERVER_ERROR;
      serviceError.details = error;
      throw serviceError;
    }
  }

  async getCampusBuildings(campusId: string): Promise<BuildingInfo[]> {
    try {
      const campus = await this.getCampusInfo(campusId);
      
      return campus.buildings.map(building => ({
        buildingId: building.buildingId,
        name: building.name,
        shortName: building.shortName,
        floors: building.floors,
        description: building.description,
        coordinates: building.coordinates
      }));
    } catch (error) {
      if (error instanceof Error && 'statusCode' in error) {
        throw error;
      }

      const serviceError: CustomError = new Error('Failed to get campus buildings') as CustomError;
      serviceError.statusCode = 500;
      serviceError.code = ErrorCodes.INTERNAL_SERVER_ERROR;
      serviceError.details = error;
      throw serviceError;
    }
  }

  async getBuildingInfo(campusId: string, buildingId: string): Promise<BuildingInfo> {
    try {
      const building = await this.campusRepository.findBuildingById(campusId, buildingId);
      
      if (!building) {
        const error: CustomError = new Error('Building not found') as CustomError;
        error.statusCode = 404;
        error.code = ErrorCodes.NOT_FOUND_ERROR;
        error.details = { campusId, buildingId };
        throw error;
      }

      return {
        buildingId: building.buildingId,
        name: building.name,
        shortName: building.shortName,
        floors: building.floors,
        description: building.description,
        coordinates: building.coordinates
      };
    } catch (error) {
      if (error instanceof Error && 'statusCode' in error) {
        throw error;
      }

      const serviceError: CustomError = new Error('Failed to get building info') as CustomError;
      serviceError.statusCode = 500;
      serviceError.code = ErrorCodes.INTERNAL_SERVER_ERROR;
      serviceError.details = error;
      throw serviceError;
    }
  }

  async getCampusFacilities(campusId: string, facilityType?: string): Promise<FacilityInfo[]> {
    try {
      const campus = await this.getCampusInfo(campusId);
      
      let facilities = campus.facilities;
      
      if (facilityType) {
        facilities = facilities.filter(facility => facility.type === facilityType);
      }

      return facilities.map(facility => ({
        facilityId: facility.facilityId,
        name: facility.name,
        type: facility.type,
        description: facility.description,
        location: facility.location,
        capacity: facility.capacity,
        amenities: facility.amenities
      }));
    } catch (error) {
      if (error instanceof Error && 'statusCode' in error) {
        throw error;
      }

      const serviceError: CustomError = new Error('Failed to get campus facilities') as CustomError;
      serviceError.statusCode = 500;
      serviceError.code = ErrorCodes.INTERNAL_SERVER_ERROR;
      serviceError.details = error;
      throw serviceError;
    }
  }

  async searchCampusLocations(campusId: string, query: string, type: string = 'all'): Promise<LocationSearchResult[]> {
    try {
      const results = await this.campusRepository.searchLocations(campusId, query, type);
      
      return results.map(result => ({
        type: result.type,
        id: result.type === 'building' ? result.buildingId : result.serviceId,
        name: result.name,
        description: result.description,
        location: result.type === 'service' ? result.location : undefined,
        coordinates: result.type === 'building' ? result.coordinates : undefined
      }));
    } catch (error) {
      if (error instanceof Error && 'statusCode' in error) {
        throw error;
      }

      const serviceError: CustomError = new Error('Failed to search campus locations') as CustomError;
      serviceError.statusCode = 500;
      serviceError.code = ErrorCodes.INTERNAL_SERVER_ERROR;
      serviceError.details = error;
      throw serviceError;
    }
  }

  async getServicesByType(campusId: string, serviceType: string): Promise<ServiceInfo[]> {
    try {
      const services = await this.campusRepository.findServicesByType(campusId, serviceType);
      
      return services.map(service => ({
        serviceId: service.serviceId,
        name: service.name,
        type: service.type,
        description: service.description,
        location: service.location,
        hours: service.hours,
        contact: service.contact
      }));
    } catch (error) {
      if (error instanceof Error && 'statusCode' in error) {
        throw error;
      }

      const serviceError: CustomError = new Error('Failed to get services by type') as CustomError;
      serviceError.statusCode = 500;
      serviceError.code = ErrorCodes.INTERNAL_SERVER_ERROR;
      serviceError.details = error;
      throw serviceError;
    }
  }

  async validateCampusExists(campusId: string): Promise<void> {
    try {
      const campus = await this.campusRepository.findByCampusId(campusId);
      
      if (!campus) {
        const error: CustomError = new Error('Campus not found') as CustomError;
        error.statusCode = 404;
        error.code = ErrorCodes.NOT_FOUND_ERROR;
        error.details = { campusId };
        throw error;
      }
    } catch (error) {
      if (error instanceof Error && 'statusCode' in error) {
        throw error;
      }

      const serviceError: CustomError = new Error('Failed to validate campus existence') as CustomError;
      serviceError.statusCode = 500;
      serviceError.code = ErrorCodes.INTERNAL_SERVER_ERROR;
      serviceError.details = error;
      throw serviceError;
    }
  }
}

// Export singleton instance
export const campusService = new CampusService();