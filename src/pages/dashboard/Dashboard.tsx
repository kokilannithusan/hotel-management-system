import React, { useState, useMemo } from "react";
import { useHotel } from "../../context/HotelContext";
import { Card } from "../../components/ui/Card";
import { Table } from "../../components/ui/Table";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { Select } from "../../components/ui/Select";
import { Input } from "../../components/ui/Input";
import { formatDate } from "../../utils/formatters";
import { Reservation, Room } from "../../types/entities";
import {
  Search,
  BarChart3,
  Wrench,
  UserPlus,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export const Welcome: React.FC = () => {
  const { state, dispatch } = useHotel();
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);
  const [checkoutAction, setCheckoutAction] = useState<
    "extend" | "checkout" | null
  >(null);
  const [extendDays, setExtendDays] = useState(1);
  const [selectedStayType, setSelectedStayType] = useState("");

  // Room management states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "available" | "occupied" | "maintenance"
  >("all");
  const [sortBy, setSortBy] = useState<"number" | "floor" | "status">("number");

  // Calendar view states - viewport navigation
  const [calendarStartIndex, setCalendarStartIndex] = useState(0);
  const daysPerView = 7; // Show 7 days at a time (1 week)

  // Generate 60 days (about 2 months)
  const allCalendarDays = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 60; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push({
        date: date.toISOString().split("T")[0],
        dayName: date.toLocaleDateString("en-US", { weekday: "short" }),
        dayNumber: date.getDate(),
        month: date.toLocaleDateString("en-US", { month: "short" }),
      });
    }
    return days;
  }, []);

  // Get visible days based on viewport
  const visibleCalendarDays = useMemo(() => {
    return allCalendarDays.slice(
      calendarStartIndex,
      calendarStartIndex + daysPerView
    );
  }, [allCalendarDays, calendarStartIndex]);

  const canGoToPrevious = calendarStartIndex > 0;
  const canGoToNext = calendarStartIndex + daysPerView < allCalendarDays.length;

  const handlePreviousWeek = () => {
    if (canGoToPrevious) {
      setCalendarStartIndex(Math.max(0, calendarStartIndex - daysPerView));
    }
  };

  const handleNextWeek = () => {
    if (canGoToNext) {
      setCalendarStartIndex(
        Math.min(
          allCalendarDays.length - daysPerView,
          calendarStartIndex + daysPerView
        )
      );
    }
  };

  const getCurrentDateRange = () => {
    if (visibleCalendarDays.length === 0) return "";
    const firstDay = visibleCalendarDays[0];
    const lastDay = visibleCalendarDays[visibleCalendarDays.length - 1];
    return `${firstDay.month} ${firstDay.dayNumber} - ${lastDay.month} ${lastDay.dayNumber}`;
  };

  // Room statistics
  const roomStats = useMemo(() => {
    const totalRooms = state.rooms.length;
    const availableCount = state.rooms.filter((room) => {
      const today = new Date().toISOString().split("T")[0];
      const isOccupied = state.reservations.some(
        (res) =>
          res.roomId === room.id &&
          res.checkIn <= today &&
          res.checkOut > today &&
          res.status !== "checked-out"
      );
      return !isOccupied && room.status !== "maintenance";
    }).length;
    const occupiedCount = state.rooms.filter((room) => {
      const today = new Date().toISOString().split("T")[0];
      return state.reservations.some(
        (res) =>
          res.roomId === room.id &&
          res.checkIn <= today &&
          res.checkOut > today &&
          res.status !== "checked-out"
      );
    }).length;
    const maintenanceCount = state.rooms.filter(
      (room) => room.status === "maintenance"
    ).length;

    return { totalRooms, availableCount, occupiedCount, maintenanceCount };
  }, [state.rooms, state.reservations]);

  // Filtered and sorted rooms
  const filteredRooms = useMemo(() => {
    let filtered = state.rooms.filter((room) => {
      // Search filter
      if (
        searchTerm &&
        !room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }

      // Status filter
      if (statusFilter !== "all") {
        const today = new Date().toISOString().split("T")[0];
        const isOccupied = state.reservations.some(
          (res) =>
            res.roomId === room.id &&
            res.checkIn <= today &&
            res.checkOut > today &&
            res.status !== "checked-out"
        );
        const isMaintenance = room.status === "maintenance";

        if (statusFilter === "available" && (isOccupied || isMaintenance))
          return false;
        if (statusFilter === "occupied" && !isOccupied) return false;
        if (statusFilter === "maintenance" && !isMaintenance) return false;
      }

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "number":
          return parseInt(a.roomNumber) - parseInt(b.roomNumber);
        case "floor":
          return (a.floor || 0) - (b.floor || 0);
        case "status":
          const getStatusOrder = (room: Room) => {
            const today = new Date().toISOString().split("T")[0];
            const isOccupied = state.reservations.some(
              (res) =>
                res.roomId === room.id &&
                res.checkIn <= today &&
                res.checkOut > today &&
                res.status !== "checked-out"
            );
            if (room.status === "maintenance") return 3;
            if (isOccupied) return 2;
            return 1; // available
          };
          return getStatusOrder(a) - getStatusOrder(b);
        default:
          return 0;
      }
    });

    return filtered;
  }, [state.rooms, state.reservations, searchTerm, statusFilter, sortBy]);

  // Filter reservations for all reservations and sort by check-out priority
  const todayReservations = useMemo(() => {
    const reservations = state.reservations;

    // Sort: check-outs first (by check-out date), then check-ins (by check-in date)
    return reservations.sort((a, b) => {
      const aIsCheckout =
        a.status === "checked-in" &&
        new Date(a.checkOut).toDateString() === new Date().toDateString();
      const bIsCheckout =
        b.status === "checked-in" &&
        new Date(b.checkOut).toDateString() === new Date().toDateString();

      if (aIsCheckout && !bIsCheckout) return -1;
      if (!aIsCheckout && bIsCheckout) return 1;

      // Within check-outs, sort by check-out date
      if (aIsCheckout && bIsCheckout) {
        return new Date(a.checkOut).getTime() - new Date(b.checkOut).getTime();
      }

      // Within check-ins, sort by check-in date
      return new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime();
    });
  }, [state.reservations]);

  const handleReservationAction = (
    reservation: Reservation,
    action: "checkin" | "checkout"
  ) => {
    if (action === "checkout") {
      setSelectedReservation(reservation);
      setShowCheckoutModal(true);
    } else {
      // Handle check-in
      dispatch({
        type: "UPDATE_RESERVATION",
        payload: { ...reservation, status: "checked-in" as const },
      });
    }
  };

  const handleCheckoutConfirm = () => {
    if (!selectedReservation) return;

    if (checkoutAction === "checkout") {
      dispatch({
        type: "UPDATE_RESERVATION",
        payload: { ...selectedReservation, status: "checked-out" as const },
      });
    } else if (checkoutAction === "extend") {
      const newCheckOut = new Date(selectedReservation.checkOut);
      newCheckOut.setDate(newCheckOut.getDate() + extendDays);
      dispatch({
        type: "UPDATE_RESERVATION",
        payload: {
          ...selectedReservation,
          checkOut: newCheckOut.toISOString().split("T")[0],
          // Update total amount based on extension (simplified)
          totalAmount: selectedReservation.totalAmount + extendDays * 100, // Assuming $100 per day
        },
      });
    }

    setShowCheckoutModal(false);
    setSelectedReservation(null);
    setCheckoutAction(null);
    setExtendDays(1);
    setSelectedStayType("");
  };

  const getCustomerName = (customerId: string) => {
    const customer = state.customers.find((c) => c.id === customerId);
    return customer?.name || "Unknown";
  };

  const getRoomNumber = (roomId: string) => {
    const room = state.rooms.find((r) => r.id === roomId);
    return room?.roomNumber || "Unknown";
  };

  const tableColumns = [
    {
      key: "id",
      header: "ID",
      render: (item: Reservation) => item.id.slice(-8),
    },
    {
      key: "customer",
      header: "Name",
      render: (item: Reservation) => getCustomerName(item.customerId),
    },
    {
      key: "room",
      header: "Room No",
      render: (item: Reservation) => getRoomNumber(item.roomId),
    },
    {
      key: "status",
      header: "Status",
      render: (item: Reservation) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            item.status === "confirmed"
              ? "bg-blue-100 text-blue-800"
              : item.status === "checked-in"
              ? "bg-green-100 text-green-800"
              : item.status === "checked-out"
              ? "bg-gray-100 text-gray-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {item.status.charAt(0).toUpperCase() +
            item.status.slice(1).replace("-", " ")}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (item: Reservation) => (
        <div className="flex space-x-2">
          {item.status === "confirmed" && (
            <Button
              size="sm"
              onClick={() => handleReservationAction(item, "checkin")}
            >
              Check-in
            </Button>
          )}
          {item.status === "checked-in" && (
            <Button
              size="sm"
              variant="danger"
              onClick={() => handleReservationAction(item, "checkout")}
            >
              Check-out
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-amber-700 bg-clip-text text-transparent">
            Welcome to {state.settings?.name || "Hotel Management System"}
          </h1>
          <p className="text-gray-600 mt-1">
            Today's overview and quick actions
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <Card title="Today's Reservations" className="hover-lift">
          <Table
            columns={tableColumns}
            data={todayReservations}
            emptyMessage="No reservations for the selected period"
          />
        </Card>

        {/* Room Statistics Dashboard */}
        <Card title="Room Statistics" className="hover-lift">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-3">
                <BarChart3 className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-600">
                    Total Rooms
                  </p>
                  <p className="text-2xl font-bold text-blue-900">
                    {roomStats.totalRooms}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center space-x-3">
                <Eye className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-600">
                    Available
                  </p>
                  <p className="text-2xl font-bold text-green-900">
                    {roomStats.availableCount}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <div className="flex items-center space-x-3">
                <UserPlus className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-orange-600">
                    Occupied
                  </p>
                  <p className="text-2xl font-bold text-orange-900">
                    {roomStats.occupiedCount}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="flex items-center space-x-3">
                <Wrench className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-red-600">
                    Maintenance
                  </p>
                  <p className="text-2xl font-bold text-red-900">
                    {roomStats.maintenanceCount}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Room Management" className="hover-lift">
          <div className="space-y-4">
            {/* Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by room number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                label=""
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                options={[
                  { value: "all", label: "All Status" },
                  { value: "available", label: "Available" },
                  { value: "occupied", label: "Occupied" },
                  { value: "maintenance", label: "Maintenance" },
                ]}
                className="w-40"
              />
              <Select
                label=""
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                options={[
                  { value: "number", label: "Sort by Number" },
                  { value: "floor", label: "Sort by Floor" },
                  { value: "status", label: "Sort by Status" },
                ]}
                className="w-40"
              />
            </div>

            {/* Room Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRooms.map((room) => {
                const today = new Date().toISOString().split("T")[0];
                const isOccupied = state.reservations.some((res) => {
                  if (res.roomId !== room.id) return false;
                  return (
                    res.checkIn <= today &&
                    res.checkOut > today &&
                    res.status !== "checked-out"
                  );
                });
                const isMaintenance = room.status === "maintenance";

                let statusColor = "bg-green-100 text-green-800";
                let statusText = "Available";

                if (isMaintenance) {
                  statusColor = "bg-red-100 text-red-800";
                  statusText = "Maintenance";
                } else if (isOccupied) {
                  statusColor = "bg-orange-100 text-orange-800";
                  statusText = "Occupied";
                }

                return (
                  <div
                    key={room.id}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg">
                        Room {room.roomNumber}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}
                      >
                        {statusText}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>
                        Type:{" "}
                        {state.roomTypes.find((rt) => rt.id === room.roomTypeId)
                          ?.name || "Unknown"}
                      </p>
                      <p>Floor: {room.floor || "N/A"}</p>
                      <p>
                        Capacity:{" "}
                        {state.roomTypes.find((rt) => rt.id === room.roomTypeId)
                          ?.capacity || 0}{" "}
                        guests
                      </p>
                      {isOccupied && (
                        <p className="text-orange-600 font-medium">
                          {(() => {
                            const res = state.reservations.find(
                              (r) =>
                                r.roomId === room.id &&
                                r.checkIn <= today &&
                                r.checkOut > today &&
                                r.status !== "checked-out"
                            );
                            return res
                              ? `${formatDate(res.checkIn)} - ${formatDate(
                                  res.checkOut
                                )}`
                              : "";
                          })()}
                        </p>
                      )}
                      {!isOccupied && !isMaintenance && (
                        <p className="text-green-600 font-medium">
                          Available today
                        </p>
                      )}
                      {isMaintenance && (
                        <p className="text-red-600 font-medium">
                          Under maintenance
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Calendar View */}
        <Card title="Room Availability Calendar" className="hover-lift">
          <div className="space-y-4">
            {/* Navigation and Legend */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b">
              {/* Legend */}
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 rounded shadow-sm"></div>
                  <span className="text-sm text-gray-700 font-medium">
                    Available
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-500 rounded shadow-sm"></div>
                  <span className="text-sm text-gray-700 font-medium">
                    Occupied
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-500 rounded shadow-sm"></div>
                  <span className="text-sm text-gray-700 font-medium">
                    Maintenance
                  </span>
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousWeek}
                  disabled={!canGoToPrevious}
                  className="flex items-center space-x-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous</span>
                </Button>
                <div className="px-4 py-1 bg-amber-50 border border-amber-200 rounded-lg">
                  <span className="text-sm font-semibold text-amber-900">
                    {getCurrentDateRange()}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextWeek}
                  disabled={!canGoToNext}
                  className="flex items-center space-x-1"
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="sticky left-0 z-10 bg-white border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700 min-w-[120px] shadow-sm">
                      Room
                    </th>
                    {visibleCalendarDays.map((day) => (
                      <th
                        key={day.date}
                        className="border border-gray-200 px-3 py-2 text-center bg-gray-50 min-w-[80px]"
                      >
                        <div className="text-xs font-medium text-gray-500 uppercase">
                          {day.dayName}
                        </div>
                        <div className="text-lg font-bold text-gray-900 mt-1">
                          {day.dayNumber}
                        </div>
                        <div className="text-xs text-gray-500">{day.month}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {state.rooms
                    .sort(
                      (a, b) => parseInt(a.roomNumber) - parseInt(b.roomNumber)
                    )
                    .map((room) => {
                      const roomType = state.roomTypes.find(
                        (rt) => rt.id === room.roomTypeId
                      );
                      return (
                        <tr
                          key={room.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="sticky left-0 z-10 bg-white border border-gray-200 px-4 py-3 shadow-sm">
                            <div className="font-bold text-gray-900 text-base">
                              {room.roomNumber}
                            </div>
                            <div className="text-xs text-gray-600 mt-0.5">
                              {roomType?.name || "Unknown"}
                            </div>
                          </td>
                          {visibleCalendarDays.map((day) => {
                            const isMaintenance = room.status === "maintenance";
                            const reservation = state.reservations.find(
                              (res) =>
                                res.roomId === room.id &&
                                res.checkIn <= day.date &&
                                res.checkOut > day.date &&
                                res.status !== "checked-out"
                            );

                            let bgColor = "bg-green-500 hover:bg-green-600";
                            let textColor = "text-white";
                            let statusLabel = "";
                            let borderClass = "";

                            if (isMaintenance) {
                              bgColor = "bg-red-500 hover:bg-red-600";
                              textColor = "text-white";
                              statusLabel = "M";
                            } else if (reservation) {
                              bgColor = "bg-blue-500 hover:bg-blue-600";
                              textColor = "text-white";
                              // Show "IN" on check-in day, "OUT" on check-out day
                              if (reservation.checkIn === day.date) {
                                statusLabel = "IN";
                                borderClass = "border-l-4 border-l-blue-900";
                              } else if (reservation.checkOut === day.date) {
                                statusLabel = "OUT";
                                borderClass = "border-r-4 border-r-blue-900";
                              }
                            }

                            const today = new Date()
                              .toISOString()
                              .split("T")[0];
                            const isToday = day.date === today;

                            return (
                              <td
                                key={day.date}
                                className={`border border-gray-200 p-0 ${
                                  isToday
                                    ? "ring-2 ring-amber-400 ring-inset"
                                    : ""
                                }`}
                              >
                                <div
                                  className={`${bgColor} ${textColor} ${borderClass} h-16 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer`}
                                  title={
                                    isMaintenance
                                      ? "Under Maintenance"
                                      : reservation
                                      ? `Occupied by ${getCustomerName(
                                          reservation.customerId
                                        )}\n${reservation.checkIn} to ${
                                          reservation.checkOut
                                        }`
                                      : "Available for booking"
                                  }
                                >
                                  {statusLabel}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            {/* Summary Footer */}
            <div className="pt-4 border-t">
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span>
                  Showing week{" "}
                  {Math.floor(calendarStartIndex / daysPerView) + 1} of{" "}
                  {Math.ceil(allCalendarDays.length / daysPerView)}
                </span>
                <span>•</span>
                <span>Total rooms: {state.rooms.length}</span>
                <span>•</span>
                <span className="text-green-600 font-medium">
                  {roomStats.availableCount} Available
                </span>
                <span>•</span>
                <span className="text-blue-600 font-medium">
                  {roomStats.occupiedCount} Occupied
                </span>
                <span>•</span>
                <span className="text-red-600 font-medium">
                  {roomStats.maintenanceCount} Maintenance
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Checkout Modal */}
      <Modal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        title="Check-out Options"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            What would you like to do for{" "}
            {selectedReservation &&
              getCustomerName(selectedReservation.customerId)}
            's reservation?
          </p>
          <div className="flex space-x-4">
            <Button
              variant={checkoutAction === "extend" ? "primary" : "outline"}
              onClick={() => setCheckoutAction("extend")}
            >
              Extend Stay
            </Button>
            <Button
              variant={checkoutAction === "checkout" ? "danger" : "outline"}
              onClick={() => setCheckoutAction("checkout")}
            >
              Check-out
            </Button>
          </div>

          {checkoutAction === "extend" && (
            <div className="space-y-4 pt-4 border-t">
              <Input
                type="number"
                label="Number of additional days"
                value={extendDays}
                onChange={(e) => setExtendDays(parseInt(e.target.value) || 1)}
                min={1}
              />
              <Select
                label="Stay Type"
                value={selectedStayType}
                onChange={(e) => setSelectedStayType(e.target.value)}
                options={state.stayTypes.map((st) => ({
                  value: st.id,
                  label: st.name,
                }))}
              />
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="outline" onClick={() => setShowCheckoutModal(false)}>
            Cancel
          </Button>
          <Button onClick={handleCheckoutConfirm} disabled={!checkoutAction}>
            Confirm
          </Button>
        </div>
      </Modal>
    </div>
  );
};

// Export as Dashboard for backward compatibility
export const Dashboard = Welcome;
