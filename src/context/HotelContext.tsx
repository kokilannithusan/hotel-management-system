import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import {
  HotelState,
  Customer,
  Room,
  RoomType,
  ViewType,
  Amenity,
  RoomArea,
  Reservation,
  Channel,
  Season,
  Bill,
  Receipt,
  Refund,
  Tax,
  Policy,
  CurrencyRate,
  ChannelPricing,
  SeasonalPricing,
  StayType,
  MealPlan,
  HousekeepingRoom,
  HotelSettings,
  User,
} from '../types/entities';
import { getStorageItem, setStorageItem, storageKeys } from '../utils/storage';
import {
  mockCustomers,
  mockRooms,
  mockRoomTypes,
  mockViewTypes,
  mockAmenities,
  mockRoomAreas,
  mockReservations,
  mockChannels,
  mockSeasons,
  mockBills,
  mockReceipts,
  mockRefunds,
  mockTaxes,
  mockPolicies,
  mockCurrencyRates,
  mockChannelPricing,
  mockSeasonalPricing,
  mockStayTypes,
  mockMealPlans,
  mockHousekeeping,
  mockSettings,
  mockUsers,
} from '../data/mockData';

type HotelAction =
  | { type: 'INIT_STATE'; payload: HotelState }
  | { type: 'ADD_CUSTOMER'; payload: Customer }
  | { type: 'UPDATE_CUSTOMER'; payload: Customer }
  | { type: 'DELETE_CUSTOMER'; payload: string }
  | { type: 'ADD_ROOM'; payload: Room }
  | { type: 'UPDATE_ROOM'; payload: Room }
  | { type: 'DELETE_ROOM'; payload: string }
  | { type: 'ADD_RESERVATION'; payload: Reservation }
  | { type: 'UPDATE_RESERVATION'; payload: Reservation }
  | { type: 'DELETE_RESERVATION'; payload: string }
  | { type: 'ADD_BILL'; payload: Bill }
  | { type: 'UPDATE_BILL'; payload: Bill }
  | { type: 'ADD_RECEIPT'; payload: Receipt }
  | { type: 'ADD_REFUND'; payload: Refund }
  | { type: 'UPDATE_REFUND'; payload: Refund }
  | { type: 'ADD_ROOM_TYPE'; payload: RoomType }
  | { type: 'UPDATE_ROOM_TYPE'; payload: RoomType }
  | { type: 'DELETE_ROOM_TYPE'; payload: string }
  | { type: 'ADD_VIEW_TYPE'; payload: ViewType }
  | { type: 'UPDATE_VIEW_TYPE'; payload: ViewType }
  | { type: 'DELETE_VIEW_TYPE'; payload: string }
  | { type: 'ADD_AMENITY'; payload: Amenity }
  | { type: 'UPDATE_AMENITY'; payload: Amenity }
  | { type: 'DELETE_AMENITY'; payload: string }
  | { type: 'ADD_ROOM_AREA'; payload: RoomArea }
  | { type: 'UPDATE_ROOM_AREA'; payload: RoomArea }
  | { type: 'DELETE_ROOM_AREA'; payload: string }
  | { type: 'ADD_CHANNEL'; payload: Channel }
  | { type: 'UPDATE_CHANNEL'; payload: Channel }
  | { type: 'DELETE_CHANNEL'; payload: string }
  | { type: 'ADD_SEASON'; payload: Season }
  | { type: 'UPDATE_SEASON'; payload: Season }
  | { type: 'DELETE_SEASON'; payload: string }
  | { type: 'ADD_TAX'; payload: Tax }
  | { type: 'UPDATE_TAX'; payload: Tax }
  | { type: 'DELETE_TAX'; payload: string }
  | { type: 'ADD_POLICY'; payload: Policy }
  | { type: 'UPDATE_POLICY'; payload: Policy }
  | { type: 'DELETE_POLICY'; payload: string }
  | { type: 'UPDATE_CURRENCY_RATE'; payload: CurrencyRate }
  | { type: 'ADD_CHANNEL_PRICING'; payload: ChannelPricing }
  | { type: 'UPDATE_CHANNEL_PRICING'; payload: ChannelPricing }
  | { type: 'DELETE_CHANNEL_PRICING'; payload: string }
  | { type: 'ADD_SEASONAL_PRICING'; payload: SeasonalPricing }
  | { type: 'UPDATE_SEASONAL_PRICING'; payload: SeasonalPricing }
  | { type: 'DELETE_SEASONAL_PRICING'; payload: string }
  | { type: 'ADD_STAY_TYPE'; payload: StayType }
  | { type: 'UPDATE_STAY_TYPE'; payload: StayType }
  | { type: 'DELETE_STAY_TYPE'; payload: string }
  | { type: 'ADD_MEAL_PLAN'; payload: MealPlan }
  | { type: 'UPDATE_MEAL_PLAN'; payload: MealPlan }
  | { type: 'DELETE_MEAL_PLAN'; payload: string }
  | { type: 'UPDATE_HOUSEKEEPING'; payload: HousekeepingRoom }
  | { type: 'UPDATE_SETTINGS'; payload: HotelSettings }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'DELETE_USER'; payload: string };

const initialState: HotelState = {
  customers: [],
  rooms: [],
  roomTypes: [],
  viewTypes: [],
  amenities: [],
  roomAreas: [],
  reservations: [],
  channels: [],
  seasons: [],
  bills: [],
  receipts: [],
  refunds: [],
  taxes: [],
  policies: [],
  currencyRates: [],
  channelPricing: [],
  seasonalPricing: [],
  stayTypes: [],
  mealPlans: [],
  housekeeping: [],
  settings: null,
  users: [],
};

const hotelReducer = (state: HotelState, action: HotelAction): HotelState => {
  switch (action.type) {
    case 'INIT_STATE':
      return action.payload;
    case 'ADD_CUSTOMER':
      return { ...state, customers: [...state.customers, action.payload] };
    case 'UPDATE_CUSTOMER':
      return {
        ...state,
        customers: state.customers.map((c) => (c.id === action.payload.id ? action.payload : c)),
      };
    case 'DELETE_CUSTOMER':
      return { ...state, customers: state.customers.filter((c) => c.id !== action.payload) };
    case 'ADD_ROOM':
      return { ...state, rooms: [...state.rooms, action.payload] };
    case 'UPDATE_ROOM':
      return {
        ...state,
        rooms: state.rooms.map((r) => (r.id === action.payload.id ? action.payload : r)),
      };
    case 'DELETE_ROOM':
      return { ...state, rooms: state.rooms.filter((r) => r.id !== action.payload) };
    case 'ADD_RESERVATION':
      return { ...state, reservations: [...state.reservations, action.payload] };
    case 'UPDATE_RESERVATION':
      return {
        ...state,
        reservations: state.reservations.map((r) => (r.id === action.payload.id ? action.payload : r)),
      };
    case 'DELETE_RESERVATION':
      return { ...state, reservations: state.reservations.filter((r) => r.id !== action.payload) };
    case 'ADD_BILL':
      return { ...state, bills: [...state.bills, action.payload] };
    case 'UPDATE_BILL':
      return {
        ...state,
        bills: state.bills.map((b) => (b.id === action.payload.id ? action.payload : b)),
      };
    case 'ADD_RECEIPT':
      return { ...state, receipts: [...state.receipts, action.payload] };
    case 'ADD_REFUND':
      return { ...state, refunds: [...state.refunds, action.payload] };
    case 'UPDATE_REFUND':
      return {
        ...state,
        refunds: state.refunds.map((r) => (r.id === action.payload.id ? action.payload : r)),
      };
    case 'ADD_ROOM_TYPE':
      return { ...state, roomTypes: [...state.roomTypes, action.payload] };
    case 'UPDATE_ROOM_TYPE':
      return {
        ...state,
        roomTypes: state.roomTypes.map((rt) => (rt.id === action.payload.id ? action.payload : rt)),
      };
    case 'DELETE_ROOM_TYPE':
      return { ...state, roomTypes: state.roomTypes.filter((rt) => rt.id !== action.payload) };
    case 'ADD_VIEW_TYPE':
      return { ...state, viewTypes: [...state.viewTypes, action.payload] };
    case 'UPDATE_VIEW_TYPE':
      return {
        ...state,
        viewTypes: state.viewTypes.map((vt) => (vt.id === action.payload.id ? action.payload : vt)),
      };
    case 'DELETE_VIEW_TYPE':
      return { ...state, viewTypes: state.viewTypes.filter((vt) => vt.id !== action.payload) };
    case 'ADD_AMENITY':
      return { ...state, amenities: [...state.amenities, action.payload] };
    case 'UPDATE_AMENITY':
      return {
        ...state,
        amenities: state.amenities.map((a) => (a.id === action.payload.id ? action.payload : a)),
      };
    case 'DELETE_AMENITY':
      return { ...state, amenities: state.amenities.filter((a) => a.id !== action.payload) };
    case 'ADD_ROOM_AREA':
      return { ...state, roomAreas: [...state.roomAreas, action.payload] };
    case 'UPDATE_ROOM_AREA':
      return {
        ...state,
        roomAreas: state.roomAreas.map((ra) => (ra.id === action.payload.id ? action.payload : ra)),
      };
    case 'DELETE_ROOM_AREA':
      return { ...state, roomAreas: state.roomAreas.filter((ra) => ra.id !== action.payload) };
    case 'ADD_CHANNEL':
      return { ...state, channels: [...state.channels, action.payload] };
    case 'UPDATE_CHANNEL':
      return {
        ...state,
        channels: state.channels.map((c) => (c.id === action.payload.id ? action.payload : c)),
      };
    case 'DELETE_CHANNEL':
      return { ...state, channels: state.channels.filter((c) => c.id !== action.payload) };
    case 'ADD_SEASON':
      return { ...state, seasons: [...state.seasons, action.payload] };
    case 'UPDATE_SEASON':
      return {
        ...state,
        seasons: state.seasons.map((s) => (s.id === action.payload.id ? action.payload : s)),
      };
    case 'DELETE_SEASON':
      return { ...state, seasons: state.seasons.filter((s) => s.id !== action.payload) };
    case 'ADD_TAX':
      return { ...state, taxes: [...state.taxes, action.payload] };
    case 'UPDATE_TAX':
      return {
        ...state,
        taxes: state.taxes.map((t) => (t.id === action.payload.id ? action.payload : t)),
      };
    case 'DELETE_TAX':
      return { ...state, taxes: state.taxes.filter((t) => t.id !== action.payload) };
    case 'ADD_POLICY':
      return { ...state, policies: [...state.policies, action.payload] };
    case 'UPDATE_POLICY':
      return {
        ...state,
        policies: state.policies.map((p) => (p.id === action.payload.id ? action.payload : p)),
      };
    case 'DELETE_POLICY':
      return { ...state, policies: state.policies.filter((p) => p.id !== action.payload) };
    case 'UPDATE_CURRENCY_RATE':
      return {
        ...state,
        currencyRates: state.currencyRates.map((cr) =>
          cr.id === action.payload.id ? action.payload : cr
        ),
      };
    case 'ADD_CHANNEL_PRICING':
      return { ...state, channelPricing: [...state.channelPricing, action.payload] };
    case 'UPDATE_CHANNEL_PRICING':
      return {
        ...state,
        channelPricing: state.channelPricing.map((cp) =>
          cp.id === action.payload.id ? action.payload : cp
        ),
      };
    case 'DELETE_CHANNEL_PRICING':
      return { ...state, channelPricing: state.channelPricing.filter((cp) => cp.id !== action.payload) };
    case 'ADD_SEASONAL_PRICING':
      return { ...state, seasonalPricing: [...state.seasonalPricing, action.payload] };
    case 'UPDATE_SEASONAL_PRICING':
      return {
        ...state,
        seasonalPricing: state.seasonalPricing.map((sp) =>
          sp.id === action.payload.id ? action.payload : sp
        ),
      };
    case 'DELETE_SEASONAL_PRICING':
      return { ...state, seasonalPricing: state.seasonalPricing.filter((sp) => sp.id !== action.payload) };
    case 'ADD_STAY_TYPE':
      return { ...state, stayTypes: [...state.stayTypes, action.payload] };
    case 'UPDATE_STAY_TYPE':
      return {
        ...state,
        stayTypes: state.stayTypes.map((st) => (st.id === action.payload.id ? action.payload : st)),
      };
    case 'DELETE_STAY_TYPE':
      return { ...state, stayTypes: state.stayTypes.filter((st) => st.id !== action.payload) };
    case 'ADD_MEAL_PLAN':
      return { ...state, mealPlans: [...state.mealPlans, action.payload] };
    case 'UPDATE_MEAL_PLAN':
      return {
        ...state,
        mealPlans: state.mealPlans.map((mp) => (mp.id === action.payload.id ? action.payload : mp)),
      };
    case 'DELETE_MEAL_PLAN':
      return { ...state, mealPlans: state.mealPlans.filter((mp) => mp.id !== action.payload) };
    case 'UPDATE_HOUSEKEEPING':
      return {
        ...state,
        housekeeping: state.housekeeping.map((h) =>
          h.roomId === action.payload.roomId ? action.payload : h
        ),
      };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: action.payload };
    case 'ADD_USER':
      return { ...state, users: [...state.users, action.payload] };
    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map((u) => (u.id === action.payload.id ? action.payload : u)),
      };
    case 'DELETE_USER':
      return { ...state, users: state.users.filter((u) => u.id !== action.payload) };
    default:
      return state;
  }
};

interface HotelContextType {
  state: HotelState;
  dispatch: React.Dispatch<HotelAction>;
  initializeData: () => void;
}

const HotelContext = createContext<HotelContextType | undefined>(undefined);

export const HotelProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(hotelReducer, initialState);

  const initializeData = () => {
    // Check if this is first time loading (no data in localStorage or empty arrays)
    const storedCustomers = localStorage.getItem(storageKeys.customers);
    let isFirstLoad = !storedCustomers;
    if (storedCustomers) {
      try {
        const parsed = JSON.parse(storedCustomers);
        isFirstLoad = Array.isArray(parsed) && parsed.length === 0;
      } catch {
        isFirstLoad = true;
      }
    }
    
    // Load data from localStorage or use mock data
    const customers = getStorageItem(storageKeys.customers, mockCustomers);
    const rooms = getStorageItem(storageKeys.rooms, mockRooms);
    const roomTypes = getStorageItem(storageKeys.roomTypes, mockRoomTypes);
    const viewTypes = getStorageItem(storageKeys.viewTypes, mockViewTypes);
    const amenities = getStorageItem(storageKeys.amenities, mockAmenities);
    const roomAreas = getStorageItem(storageKeys.roomAreas, mockRoomAreas);
    const reservations = getStorageItem(storageKeys.reservations, mockReservations);
    const channels = getStorageItem(storageKeys.channels, mockChannels);
    const seasons = getStorageItem(storageKeys.seasons, mockSeasons);
    const bills = getStorageItem(storageKeys.bills, mockBills);
    const receipts = getStorageItem(storageKeys.receipts, mockReceipts);
    const refunds = getStorageItem(storageKeys.refunds, mockRefunds);
    const taxes = getStorageItem(storageKeys.taxes, mockTaxes);
    const policies = getStorageItem(storageKeys.policies, mockPolicies);
    const currencyRates = getStorageItem(storageKeys.currencyRates, mockCurrencyRates);
    const channelPricing = getStorageItem(storageKeys.channelPricing, mockChannelPricing);
    const seasonalPricing = getStorageItem(storageKeys.seasonalPricing, mockSeasonalPricing);
    const stayTypes = getStorageItem(storageKeys.stayTypes, mockStayTypes);
    const mealPlans = getStorageItem(storageKeys.mealPlans, mockMealPlans);
    const housekeeping = getStorageItem(storageKeys.housekeeping, mockHousekeeping);
    const settings = getStorageItem(storageKeys.settings, mockSettings);
    const users = getStorageItem(storageKeys.users, mockUsers);
    
    // Backfill defaults for new fields if missing (migration)
    const channelsWithPercent = (channels || []).map((c) => {
      if (c.priceModifierPercent !== undefined) return c;
      const name = (c.name || '').toLowerCase();
      let pct = 0;
      if (name.includes('booking.com')) pct = 10;
      else if (name.includes('agoda')) pct = 8;
      else if (name.includes('expedia')) pct = 12;
      else if (name.includes('hotels.com')) pct = 9;
      else if (name.includes('tripadvisor')) pct = 7;
      else if (name.includes('agent')) pct = 5;
      else pct = 0; // direct, walk-in, corporate, group booking default
      return { ...c, priceModifierPercent: pct };
    });

    const seasonsWithPercent = (seasons || []).map((s) => {
      if (s.priceModifierPercent !== undefined) return s;
      const name = (s.name || '').toLowerCase();
      let pct = 0;
      if (name.includes('peak')) pct = 20;
      else if (name.includes('holiday')) pct = 15;
      else if (name.includes('low')) pct = -10;
      else if (name.includes('spring')) pct = 5;
      else if (name.includes('fall') || name.includes('autumn')) pct = 3;
      return { ...s, priceModifierPercent: pct };
    });

    // Persist back immediately to ensure existing installations get the defaults
    try {
      setStorageItem(storageKeys.channels, channelsWithPercent);
      setStorageItem(storageKeys.seasons, seasonsWithPercent);
    } catch {}

    const defaultState: HotelState = {
      customers: customers.length > 0 ? customers : mockCustomers,
      rooms: rooms.length > 0 ? rooms : mockRooms,
      roomTypes: roomTypes.length > 0 ? roomTypes : mockRoomTypes,
      viewTypes: viewTypes.length > 0 ? viewTypes : mockViewTypes,
      amenities: amenities.length > 0 ? amenities : mockAmenities,
      roomAreas: roomAreas.length > 0 ? roomAreas : mockRoomAreas,
      reservations: reservations.length > 0 ? reservations : mockReservations,
      channels: channelsWithPercent.length > 0 ? channelsWithPercent : mockChannels,
      seasons: seasonsWithPercent.length > 0 ? seasonsWithPercent : mockSeasons,
      bills: bills.length > 0 ? bills : mockBills,
      receipts: receipts.length > 0 ? receipts : mockReceipts,
      refunds: refunds.length > 0 ? refunds : mockRefunds,
      taxes: taxes.length > 0 ? taxes : mockTaxes,
      policies: policies.length > 0 ? policies : mockPolicies,
      currencyRates: currencyRates.length > 0 ? currencyRates : mockCurrencyRates,
      channelPricing: channelPricing.length > 0 ? channelPricing : mockChannelPricing,
      seasonalPricing: seasonalPricing.length > 0 ? seasonalPricing : mockSeasonalPricing,
      stayTypes: stayTypes.length > 0 ? stayTypes : mockStayTypes,
      mealPlans: mealPlans.length > 0 ? mealPlans : mockMealPlans,
      housekeeping: housekeeping.length > 0 ? housekeeping : mockHousekeeping,
      settings: settings || mockSettings,
      users: users.length > 0 ? users : mockUsers,
    };
    
    dispatch({ type: 'INIT_STATE', payload: defaultState });
    
    // If first load or empty data, save all mock data to localStorage
    if (isFirstLoad || customers.length === 0) {
      setStorageItem(storageKeys.customers, defaultState.customers);
      setStorageItem(storageKeys.rooms, defaultState.rooms);
      setStorageItem(storageKeys.roomTypes, defaultState.roomTypes);
      setStorageItem(storageKeys.viewTypes, defaultState.viewTypes);
      setStorageItem(storageKeys.amenities, defaultState.amenities);
      setStorageItem(storageKeys.roomAreas, defaultState.roomAreas);
      setStorageItem(storageKeys.reservations, defaultState.reservations);
      setStorageItem(storageKeys.channels, defaultState.channels);
      setStorageItem(storageKeys.seasons, defaultState.seasons);
      setStorageItem(storageKeys.bills, defaultState.bills);
      setStorageItem(storageKeys.receipts, defaultState.receipts);
      setStorageItem(storageKeys.refunds, defaultState.refunds);
      setStorageItem(storageKeys.taxes, defaultState.taxes);
      setStorageItem(storageKeys.policies, defaultState.policies);
      setStorageItem(storageKeys.currencyRates, defaultState.currencyRates);
      setStorageItem(storageKeys.channelPricing, defaultState.channelPricing);
      setStorageItem(storageKeys.seasonalPricing, defaultState.seasonalPricing);
      setStorageItem(storageKeys.stayTypes, defaultState.stayTypes);
      setStorageItem(storageKeys.mealPlans, defaultState.mealPlans);
      setStorageItem(storageKeys.housekeeping, defaultState.housekeeping);
      setStorageItem(storageKeys.settings, defaultState.settings);
      setStorageItem(storageKeys.users, defaultState.users);
    }
  };

  useEffect(() => {
    initializeData();
  }, []);

  useEffect(() => {
    // Persist state to localStorage whenever it changes
    // Only save if state is initialized (not empty)
    if (state.customers.length > 0 || state.rooms.length > 0) {
      Object.entries(storageKeys).forEach(([key, storageKey]) => {
        if (key !== 'auth') {
          const stateValue = state[key as keyof HotelState];
          if (stateValue !== null && stateValue !== undefined) {
            if (Array.isArray(stateValue) ? stateValue.length > 0 : true) {
              setStorageItem(storageKey, stateValue);
            }
          }
        }
      });
    }
  }, [state]);

  return (
    <HotelContext.Provider value={{ state, dispatch, initializeData }}>
      {children}
    </HotelContext.Provider>
  );
};

export const useHotel = () => {
  const context = useContext(HotelContext);
  if (context === undefined) {
    throw new Error('useHotel must be used within a HotelProvider');
  }
  return context;
};

