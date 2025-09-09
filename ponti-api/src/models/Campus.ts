import mongoose, { Document, Schema } from 'mongoose';

// Interface for Campus document
export interface ICampus extends Document {
  _id: mongoose.Types.ObjectId;
  campusId: string;
  name: string;
  shortName: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  contact: {
    phone: string;
    email: string;
    website?: string;
  };
  facilities: Array<{
    facilityId: string;
    name: string;
    type: string;
    description?: string;
    location: {
      building: string;
      floor?: string;
      room?: string;
    };
    capacity?: number;
    amenities: string[];
  }>;
  buildings: Array<{
    buildingId: string;
    name: string;
    shortName: string;
    floors: number;
    description?: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  }>;
  services: Array<{
    serviceId: string;
    name: string;
    type: string;
    description?: string;
    location: string;
    hours: {
      monday: { open: string; close: string; };
      tuesday: { open: string; close: string; };
      wednesday: { open: string; close: string; };
      thursday: { open: string; close: string; };
      friday: { open: string; close: string; };
      saturday?: { open: string; close: string; };
      sunday?: { open: string; close: string; };
    };
    contact?: {
      phone?: string;
      email?: string;
    };
  }>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Coordinates subdocument schema
const coordinatesSchema = new Schema({
  latitude: {
    type: Number,
    required: [true, 'Latitude is required'],
    min: [-90, 'Latitude must be between -90 and 90'],
    max: [90, 'Latitude must be between -90 and 90']
  },
  longitude: {
    type: Number,
    required: [true, 'Longitude is required'],
    min: [-180, 'Longitude must be between -180 and 180'],
    max: [180, 'Longitude must be between -180 and 180']
  }
}, { _id: false });

// Address subdocument schema
const addressSchema = new Schema({
  street: {
    type: String,
    required: [true, 'Street address is required'],
    trim: true,
    maxlength: [200, 'Street address cannot exceed 200 characters']
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
    maxlength: [100, 'City name cannot exceed 100 characters']
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true,
    maxlength: [100, 'State name cannot exceed 100 characters']
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true,
    maxlength: [100, 'Country name cannot exceed 100 characters'],
    default: 'Colombia'
  },
  postalCode: {
    type: String,
    required: [true, 'Postal code is required'],
    trim: true,
    validate: {
      validator: function(v: string) {
        return /^\d{6}$/.test(v);
      },
      message: 'Postal code must be 6 digits'
    }
  },
  coordinates: {
    type: coordinatesSchema,
    required: [true, 'Coordinates are required']
  }
}, { _id: false });

// Contact subdocument schema
const contactSchema = new Schema({
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    validate: {
      validator: function(v: string) {
        return /^\+?[\d\s\-\(\)]{10,15}$/.test(v);
      },
      message: 'Please provide a valid phone number'
    }
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    validate: {
      validator: function(v: string) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Please provide a valid email address'
    }
  },
  website: {
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Website must be a valid URL'
    }
  }
}, { _id: false });

// Facility location subdocument schema
const facilityLocationSchema = new Schema({
  building: {
    type: String,
    required: [true, 'Building is required'],
    trim: true
  },
  floor: {
    type: String,
    trim: true
  },
  room: {
    type: String,
    trim: true
  }
}, { _id: false });

// Facility subdocument schema
const facilitySchema = new Schema({
  facilityId: {
    type: String,
    required: [true, 'Facility ID is required'],
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Facility name is required'],
    trim: true,
    maxlength: [100, 'Facility name cannot exceed 100 characters']
  },
  type: {
    type: String,
    required: [true, 'Facility type is required'],
    enum: {
      values: ['classroom', 'laboratory', 'library', 'auditorium', 'cafeteria', 'gym', 'office', 'parking', 'other'],
      message: 'Facility type must be one of: classroom, laboratory, library, auditorium, cafeteria, gym, office, parking, other'
    }
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  location: {
    type: facilityLocationSchema,
    required: [true, 'Facility location is required']
  },
  capacity: {
    type: Number,
    min: [1, 'Capacity must be at least 1']
  },
  amenities: [{
    type: String,
    trim: true
  }]
}, { _id: false });

// Building subdocument schema
const buildingSchema = new Schema({
  buildingId: {
    type: String,
    required: [true, 'Building ID is required'],
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Building name is required'],
    trim: true,
    maxlength: [100, 'Building name cannot exceed 100 characters']
  },
  shortName: {
    type: String,
    required: [true, 'Building short name is required'],
    trim: true,
    maxlength: [10, 'Building short name cannot exceed 10 characters']
  },
  floors: {
    type: Number,
    required: [true, 'Number of floors is required'],
    min: [1, 'Building must have at least 1 floor']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  coordinates: {
    type: coordinatesSchema,
    required: [true, 'Building coordinates are required']
  }
}, { _id: false });

// Service hours subdocument schema
const serviceHoursSchema = new Schema({
  monday: {
    open: { type: String, required: true },
    close: { type: String, required: true }
  },
  tuesday: {
    open: { type: String, required: true },
    close: { type: String, required: true }
  },
  wednesday: {
    open: { type: String, required: true },
    close: { type: String, required: true }
  },
  thursday: {
    open: { type: String, required: true },
    close: { type: String, required: true }
  },
  friday: {
    open: { type: String, required: true },
    close: { type: String, required: true }
  },
  saturday: {
    open: { type: String },
    close: { type: String }
  },
  sunday: {
    open: { type: String },
    close: { type: String }
  }
}, { _id: false });

// Service contact subdocument schema
const serviceContactSchema = new Schema({
  phone: {
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^\+?[\d\s\-\(\)]{10,15}$/.test(v);
      },
      message: 'Please provide a valid phone number'
    }
  },
  email: {
    type: String,
    lowercase: true,
    validate: {
      validator: function(v: string) {
        return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Please provide a valid email address'
    }
  }
}, { _id: false });

// Service subdocument schema
const serviceSchema = new Schema({
  serviceId: {
    type: String,
    required: [true, 'Service ID is required'],
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true,
    maxlength: [100, 'Service name cannot exceed 100 characters']
  },
  type: {
    type: String,
    required: [true, 'Service type is required'],
    enum: {
      values: ['academic', 'administrative', 'health', 'food', 'transportation', 'recreation', 'technology', 'other'],
      message: 'Service type must be one of: academic, administrative, health, food, transportation, recreation, technology, other'
    }
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  location: {
    type: String,
    required: [true, 'Service location is required'],
    trim: true
  },
  hours: {
    type: serviceHoursSchema,
    required: [true, 'Service hours are required']
  },
  contact: {
    type: serviceContactSchema
  }
}, { _id: false });

// Main Campus schema
const campusSchema = new Schema<ICampus>({
  campusId: {
    type: String,
    required: [true, 'Campus ID is required'],
    unique: true,
    trim: true,
    maxlength: [20, 'Campus ID cannot exceed 20 characters'],
    index: true
  },
  name: {
    type: String,
    required: [true, 'Campus name is required'],
    trim: true,
    maxlength: [100, 'Campus name cannot exceed 100 characters']
  },
  shortName: {
    type: String,
    required: [true, 'Campus short name is required'],
    trim: true,
    maxlength: [10, 'Campus short name cannot exceed 10 characters']
  },
  address: {
    type: addressSchema,
    required: [true, 'Campus address is required']
  },
  contact: {
    type: contactSchema,
    required: [true, 'Campus contact information is required']
  },
  facilities: [facilitySchema],
  buildings: [buildingSchema],
  services: [serviceSchema],
  isActive: {
    type: Boolean,
    required: true,
    default: true
  }
}, {
  timestamps: true,
  collection: 'campuses'
});

// Indexes for optimization
campusSchema.index({ campusId: 1 }, { unique: true });
campusSchema.index({ isActive: 1 });
campusSchema.index({ 'address.city': 1 });
campusSchema.index({ 'facilities.type': 1 });
campusSchema.index({ 'services.type': 1 });

// Static methods
campusSchema.statics.findActiveCampuses = function() {
  return this.find({ isActive: true });
};

campusSchema.statics.findByCampusId = function(campusId: string) {
  return this.findOne({ campusId, isActive: true });
};

// Instance methods
campusSchema.methods.getFacilitiesByType = function(type: string) {
  return this.facilities.filter((facility: any) => facility.type === type);
};

campusSchema.methods.getServicesByType = function(type: string) {
  return this.services.filter((service: any) => service.type === type);
};

// Create and export the model
export const Campus = mongoose.model<ICampus>('Campus', campusSchema);