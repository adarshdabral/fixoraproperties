/**
 * Shapes returned by the API, shared between apps/api (which builds them)
 * and apps/web (which consumes them) so the two never drift apart. See
 * each apps/api `*.dto.ts` for the mapping functions that produce these.
 */

export interface PublicUserDTO {
  id: string;
  name: string;
  role: string;
}

export interface PrivateUserDTO extends PublicUserDTO {
  email: string;
  phone: string;
  isActive: boolean;
  createdAt: string;
}

export interface PropertyLocationDTO {
  address: string;
  city: string;
  state: string;
  pincode: string;
  coordinates?: { lat?: number; lng?: number };
}

export interface PropertyPriceDTO {
  amount: number;
  currency: string;
  negotiable: boolean;
}

export interface PropertySpecificationsDTO {
  bedrooms?: number;
  bathrooms?: number;
  area: number;
  areaUnit: string;
  parking?: number;
  floor?: number;
  totalFloors?: number;
}

export interface PropertyMediaDTO {
  url: string;
  type: string;
  alt: string;
  order: number;
}

export interface PublicPropertyDTO {
  id: string;
  slug: string;
  title: string;
  description: string;
  propertyType: string;
  category: string;
  listingType: string;
  location: PropertyLocationDTO;
  price: PropertyPriceDTO;
  specifications: PropertySpecificationsDTO;
  amenities: string[];
  media: PropertyMediaDTO[];
  constructionStatus: string;
  possessionStatus: string;
  featured: boolean;
  createdAt: string;
}

export interface SellerPropertyDTO extends PublicPropertyDTO {
  sellerId: string;
  status: string;
  rejectionReason: string | null;
  viewCount: number;
  updatedAt: string;
}

export type AdminPropertyDTO = SellerPropertyDTO;
export type BrokerPropertyDTO = SellerPropertyDTO;

export interface InquiryDTO {
  id: string;
  propertyId: string;
  message: string;
  status: string;
  source: string;
  createdAt: string;
}

export interface LeadNoteDTO {
  text: string;
  authorId: string;
  createdAt: string;
}

export interface LeadDTO {
  id: string;
  buyerId: string;
  propertyId: string;
  assignedTo: string | null;
  source: string;
  requirements: Record<string, unknown>;
  status: string;
  notes: LeadNoteDTO[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminDashboardDTO {
  users: { total: number; buyers: number; sellers: number; brokers: number };
  properties: { active: number; pending: number; rejected: number; sold: number };
  leads: { new: number; qualified: number; negotiation: number; converted: number };
  transactions: { completed: number };
  commissions: { total: number };
}
