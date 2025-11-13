export type ReservationStatus =
  | "confirmed"
  | "checked-in"
  | "checked-out"
  | "canceled";
export type RoomStatus =
  | "available"
  | "occupied"
  | "maintenance"
  | "cleaned"
  | "to-clean";
export type HousekeepingStatus =
  | "cleaned"
  | "to-clean"
  | "cleaning-in-progress"
  | "maintenance";
export type PaymentStatus = "paid" | "unpaid" | "partial";
export type RefundStatus = "pending" | "completed" | "rejected";
export type CustomerStatus = "VIP" | "regular customer" | "new customer";
export type ChannelStatus = "active" | "inactive";

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  nationality: string;
  status?: CustomerStatus; // Optional, calculated dynamically
  createdAt: string;
  hasPremiumCard?: boolean; // Track if customer has premium card
}

export interface RoomType {
  id: string;
  name: string;
  description: string;
  capacity: number;
  basePrice: number;
  viewTypeId?: string;
}

export interface ViewType {
  id: string;
  name: string;
  priceDifference?: number;
}

export interface Amenity {
  id: string;
  name: string;
  icon?: string;
}

export interface RoomArea {
  id: string;
  name: string;
  description?: string;
}

export interface Room {
  id: string;
  roomNumber: string;
  roomTypeId: string;
  areaId?: string;
  status: RoomStatus;
  amenities: string[];
  floor?: number;
}

export interface Reservation {
  id: string;
  customerId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  channelId: string;
  status: ReservationStatus;
  totalAmount: number;
  createdAt: string;
  notes?: string;
}

export interface Channel {
  id: string;
  name: string;
  type: string;
  apiKey?: string;
  contactPerson?: string;
  status: ChannelStatus;
  priceModifierPercent?: number; // Percentage modifier for this channel
}

export interface Season {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface Bill {
  id: string;
  billNumber: string;
  reservationId: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  status: PaymentStatus;
  createdAt: string;
  dueDate?: string;
  lineItems: BillLineItem[];
}

export interface BillLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Receipt {
  id: string;
  receiptNumber: string;
  billId: string;
  reservationId: string;
  customerId: string;
  amount: number;
  paymentType: string;
  paymentDate: string;
  notes?: string;
}

export interface Refund {
  id: string;
  refundNumber: string;
  reservationId: string;
  customerId: string;
  amount: number;
  reason: string;
  status: RefundStatus;
  createdAt: string;
  processedAt?: string;
}

export interface Tax {
  id: string;
  name: string;
  rate: number;
  type: "percentage" | "fixed";
  appliesTo: "room" | "invoice" | "both";
  isActive: boolean;
}

export interface Policy {
  id: string;
  title: string;
  description: string;
  category: string;
  isActive: boolean;
}

export interface CurrencyRate {
  id: string;
  currency: string;
  code: string;
  rate: number;
  lastUpdated: string;
}

export interface ChannelPricing {
  id: string;
  channelId: string;
  roomTypeId: string;
  modifierType: "percentage" | "fixed";
  modifierValue: number;
}

export interface SeasonalPricing {
  id: string;
  seasonId: string;
  roomTypeId: string;
  modifierType: "percentage" | "fixed";
  modifierValue: number;
}

export interface StayType {
  id: string;
  name: string;
  hours?: number;
  rateMultiplier: number;
  description?: string;
}

export interface MealPlan {
  id: string;
  name: string;
  code: string; // BB, HB, FB, AI
  description: string;
  perPersonRate: number;
  perRoomRate?: number;
  isActive: boolean;
}

export interface HousekeepingTask {
  id: string;
  roomId: string;
  task: string;
  completed: boolean;
  assignedTo?: string;
  completedAt?: string;
}

export interface MaintenanceIssue {
  id: string;
  description: string;
  reportedAt: string;
  resolved?: boolean;
  resolvedAt?: string;
}

export interface HousekeepingRoom {
  roomId: string;
  roomNumber: string;
  status: HousekeepingStatus;
  tasks: HousekeepingTask[];
  lastCleaned?: string;
  issues?: MaintenanceIssue[];
}

export interface HotelSettings {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  website?: string;
  logo?: string;
  currency: string;
  timezone: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

export interface HotelState {
  customers: Customer[];
  rooms: Room[];
  roomTypes: RoomType[];
  viewTypes: ViewType[];
  amenities: Amenity[];
  roomAreas: RoomArea[];
  reservations: Reservation[];
  channels: Channel[];
  seasons: Season[];
  bills: Bill[];
  receipts: Receipt[];
  refunds: Refund[];
  taxes: Tax[];
  policies: Policy[];
  currencyRates: CurrencyRate[];
  channelPricing: ChannelPricing[];
  seasonalPricing: SeasonalPricing[];
  stayTypes: StayType[];
  mealPlans: MealPlan[];
  housekeeping: HousekeepingRoom[];
  settings: HotelSettings | null;
  users: User[];
}
