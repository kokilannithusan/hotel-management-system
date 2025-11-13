import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProviders } from "./context";
import { useAuth } from "./hooks/useAuth";
import { Layout } from "./components/layout/Layout";
import { Login } from "./pages/auth/Login";
import { Dashboard } from "./pages/dashboard/Dashboard";

// Reservations
import { ReservationsOverview } from "./pages/reservations/Overview";
import { ReserveRoom } from "./pages/reservations/ReserveRoom";
import { ReservationsHistory } from "./pages/reservations/History";

// Customers
import { ManageCustomer } from "./pages/customers/ManageCustomer";

// Invoicing
import { Bill } from "./pages/invoicing/Bill";
import { Receipts } from "./pages/invoicing/Receipts";
import { Refunds } from "./pages/invoicing/Refunds";
import { AdditionalBilling } from "./pages/invoicing/AdditionalBilling";

// Rooms
import { RoomsOverview } from "./pages/rooms/Overview";
import { AllRooms } from "./pages/rooms/AllRooms";
import { ViewType } from "./pages/rooms/ViewType";
import { Amenities } from "./pages/rooms/Amenities";
import { RoomAreas } from "./pages/rooms/RoomAreas";
import { RoomTypes } from "./pages/rooms/RoomTypes";
import { Price } from "./pages/rooms/Price";

import { MealPlan } from "./pages/rooms/MealPlan";
import { RoomChecklist } from "./pages/rooms/RoomChecklist";

// Room Status
import { Housekeeping } from "./pages/houseKeeping/Housekeeping";

// Channels
import { ReservationType } from "./pages/channels/ReservationType";
import { Seasonal } from "./pages/channels/Seasonal";
import { StayType } from "./pages/channels/StayType";

// Pricing
import { ChannelPricing } from "./pages/pricing/ChannelPricing";
import { ChannelPricingGrid } from "./pages/pricing/ChannelPricingGrid";
import { SeasonalPricing } from "./pages/pricing/SeasonalPricing";

// Other
import { Tax } from "./pages/tax/Tax";
import { Policies } from "./pages/policies/Policies";
import { CurrencyRate } from "./pages/currency/CurrencyRate";
import { Settings } from "./pages/settings/Settings";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route
                      path="/reservations/overview"
                      element={<ReservationsOverview />}
                    />
                    <Route
                      path="/reservations/reserve"
                      element={<ReserveRoom />}
                    />
                    <Route
                      path="/reservations/history"
                      element={<ReservationsHistory />}
                    />
                    <Route path="/customers" element={<ManageCustomer />} />
                    <Route path="/invoicing/bill" element={<Bill />} />
                    <Route path="/invoicing/receipts" element={<Receipts />} />
                    <Route path="/invoicing/refunds" element={<Refunds />} />
                    <Route
                      path="/invoicing/additional"
                      element={<AdditionalBilling />}
                    />
                    <Route path="/rooms/overview" element={<RoomsOverview />} />
                    <Route path="/rooms/all" element={<AllRooms />} />
                    <Route
                      path="/rooms/checklist"
                      element={<RoomChecklist />}
                    />
                    <Route path="/rooms/view-type" element={<ViewType />} />
                    <Route path="/rooms/amenities" element={<Amenities />} />
                    <Route path="/rooms/areas" element={<RoomAreas />} />
                    <Route path="/rooms/types" element={<RoomTypes />} />
                    <Route path="/rooms/price" element={<Price />} />
                    <Route path="/rooms/meal-plan" element={<MealPlan />} />
                    <Route path="/room-status" element={<Housekeeping />} />
                    <Route
                      path="/channels/reservation-type"
                      element={<ReservationType />}
                    />
                    <Route path="/channels/seasonal" element={<Seasonal />} />
                    <Route path="/channels/stay-type" element={<StayType />} />
                    <Route
                      path="/channels/price-grid"
                      element={<ChannelPricingGrid />}
                    />
                    <Route
                      path="/pricing/channel"
                      element={<ChannelPricing />}
                    />
                    <Route
                      path="/pricing/seasonal"
                      element={<SeasonalPricing />}
                    />
                    <Route path="/tax" element={<Tax />} />
                    <Route path="/policies" element={<Policies />} />
                    <Route path="/currency" element={<CurrencyRate />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route
                      path="/"
                      element={<Navigate to="/dashboard" replace />}
                    />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AppProviders>
  );
}

export default App;
