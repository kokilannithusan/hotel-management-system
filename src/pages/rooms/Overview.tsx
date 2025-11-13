import React, { useState, useRef } from "react";
import { useHotel } from "../../context/HotelContext";
import { Card } from "../../components/ui/Card";
import { Select } from "../../components/ui/Select";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { formatDate, formatCurrency } from "../../utils/formatters";
import { Reservation } from "../../types/entities";

export const RoomsOverview: React.FC = () => {
  const { state } = useHotel();
  const [selectedRoomType, setSelectedRoomType] = useState<string>("all");
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const filteredRooms =
    selectedRoomType === "all"
      ? state.rooms
      : state.rooms.filter((r) => r.roomTypeId === selectedRoomType);

  // Get days in current month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }
    return days;
  };

  const daysInMonth = getDaysInMonth(currentMonth);

  const scrollToStart = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        left: 0,
        behavior: "smooth",
      });
    }
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
    setTimeout(scrollToStart, 100);
  };

  const prevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
    setTimeout(scrollToStart, 100);
  };

  const isDateBooked = (roomId: string, date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return state.reservations.some((res) => {
      if (res.roomId !== roomId) return false;
      const checkIn = new Date(res.checkIn);
      const checkOut = new Date(res.checkOut);
      const currentDate = new Date(dateStr);
      return (
        currentDate >= checkIn &&
        currentDate < checkOut &&
        res.status !== "canceled"
      );
    });
  };

  const getReservationForDate = (roomId: string, date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return state.reservations.find((res) => {
      if (res.roomId !== roomId || res.status === "canceled") return false;
      const checkIn = new Date(res.checkIn);
      const checkOut = new Date(res.checkOut);
      const currentDate = new Date(dateStr);
      return currentDate >= checkIn && currentDate < checkOut;
    });
  };

  const totalRooms = filteredRooms.length;
  const occupiedRooms = state.reservations.filter((res) => {
    if (selectedRoomType === "all") {
      return res.status === "checked-in";
    }
    const room = state.rooms.find((r) => r.id === res.roomId);
    return room?.roomTypeId === selectedRoomType && res.status === "checked-in";
  }).length;
  const availableRooms = totalRooms - occupiedRooms;
  const todayReservations = state.reservations.filter((res) => {
    const today = new Date().toISOString().split("T")[0];
    if (selectedRoomType === "all") {
      return res.checkIn === today;
    }
    const room = state.rooms.find((r) => r.id === res.roomId);
    return room?.roomTypeId === selectedRoomType && res.checkIn === today;
  }).length;

  const statusColors: Record<string, string> = {
    confirmed: "bg-blue-500",
    "checked-in": "bg-emerald-500",
    "checked-out": "bg-slate-400",
    canceled: "bg-red-500",
  };

  const getCustomerName = (customerId: string) => {
    const customer = state.customers.find((c) => c.id === customerId);
    return customer?.name || "Guest";
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
            Room Occupancy Calendar
          </h1>
          <p className="text-slate-600 mt-1">
            Visualize room availability and bookings
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-stagger">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover-lift">
          <p className="text-sm font-semibold text-blue-700 uppercase tracking-wide">
            Total Rooms
          </p>
          <p className="text-4xl font-bold text-blue-900 mt-2">{totalRooms}</p>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover-lift">
          <p className="text-sm font-semibold text-green-700 uppercase tracking-wide">
            Available
          </p>
          <p className="text-4xl font-bold text-green-900 mt-2">
            {availableRooms}
          </p>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover-lift">
          <p className="text-sm font-semibold text-blue-700 uppercase tracking-wide">
            Occupied
          </p>
          <p className="text-4xl font-bold text-blue-900 mt-2">
            {occupiedRooms}
          </p>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover-lift">
          <p className="text-sm font-semibold text-purple-700 uppercase tracking-wide">
            Check-ins Today
          </p>
          <p className="text-4xl font-bold text-purple-900 mt-2">
            {todayReservations}
          </p>
        </Card>
      </div>

      <Card className="hover-lift premium-calendar-card">
        <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <Select
            label="Filter by Room Type"
            value={selectedRoomType}
            onChange={(e) => setSelectedRoomType(e.target.value)}
            options={[
              { value: "all", label: "All Room Types" },
              ...state.roomTypes.map((rt) => ({
                value: rt.id,
                label: rt.name,
              })),
            ]}
            className="w-full md:w-64"
          />
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={prevMonth}
              className="border-blue-300 text-blue-600 hover:bg-blue-50"
            >
              ← Previous
            </Button>
            <h2 className="text-xl font-bold text-slate-900 min-w-[180px] text-center px-4">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h2>
            <Button
              variant="outline"
              onClick={nextMonth}
              className="border-blue-300 text-blue-600 hover:bg-blue-50"
            >
              Next →
            </Button>
          </div>
        </div>

        {/* Horizontal Calendar View */}
        <div
          ref={scrollContainerRef}
          className="overflow-x-auto border border-slate-200 rounded-lg relative"
        >
          <div className="inline-block min-w-full">
            {/* Calendar Header - Days */}
            <div className="flex border-b-2 border-slate-300 bg-gradient-to-r from-slate-50 to-slate-100 sticky top-0 z-[2]">
              <div className="w-[180px] flex-shrink-0 p-3 font-bold text-slate-700 border-r-2 border-slate-300 bg-white sticky left-0 z-[3]">
                Room
              </div>
              {daysInMonth.map((day, idx) => {
                const isToday =
                  day.toDateString() === new Date().toDateString();
                const isWeekend = day.getDay() === 0 || day.getDay() === 6;

                return (
                  <div
                    key={idx}
                    className={`w-[60px] flex-shrink-0 p-2 text-center border-r border-slate-200 ${
                      isToday
                        ? "bg-blue-100 border-l-2 border-r-2 border-blue-400"
                        : isWeekend
                        ? "bg-slate-100"
                        : "bg-white"
                    }`}
                  >
                    <div
                      className={`text-xs font-semibold ${
                        isToday ? "text-blue-700" : "text-slate-600"
                      }`}
                    >
                      {day.toLocaleDateString("en-US", { weekday: "short" })}
                    </div>
                    <div
                      className={`text-sm font-bold ${
                        isToday ? "text-blue-900" : "text-slate-900"
                      }`}
                    >
                      {day.getDate()}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Room Rows */}
            {filteredRooms.map((room) => {
              const roomType = state.roomTypes.find(
                (rt) => rt.id === room.roomTypeId
              );
              return (
                <div
                  key={room.id}
                  className="flex border-b border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <div className="w-[180px] flex-shrink-0 p-3 border-r-2 border-slate-300 bg-white sticky left-0 z-[3]">
                    <div className="font-bold text-slate-900 text-base">
                      {room.roomNumber}
                    </div>
                    <div className="text-xs text-slate-600 mt-1">
                      {roomType?.name}
                    </div>
                  </div>
                  {daysInMonth.map((day, idx) => {
                    const reservation = getReservationForDate(room.id, day);
                    const isBooked = isDateBooked(room.id, day);
                    const isToday =
                      day.toDateString() === new Date().toDateString();
                    const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                    const isCheckIn =
                      reservation &&
                      day.toISOString().split("T")[0] === reservation.checkIn;
                    const isCheckOut =
                      reservation &&
                      day.toISOString().split("T")[0] === reservation.checkOut;

                    return (
                      <div
                        key={idx}
                        className={`w-[60px] flex-shrink-0 p-1 border-r border-slate-200 cursor-pointer transition-all relative ${
                          isToday ? "border-l-2 border-r-2 border-blue-400" : ""
                        } ${
                          isBooked
                            ? statusColors[reservation?.status || "confirmed"] +
                              " hover:opacity-90 text-white"
                            : isWeekend
                            ? "hover:bg-slate-100 bg-slate-50"
                            : "hover:bg-blue-50 bg-white"
                        }`}
                        onClick={() => {
                          if (reservation) {
                            setSelectedReservation(reservation);
                            setShowDetailsModal(true);
                          }
                        }}
                        title={
                          reservation
                            ? `${
                                state.customers.find(
                                  (c) => c.id === reservation.customerId
                                )?.name || "Guest"
                              } - ${reservation.status}`
                            : ""
                        }
                      >
                        {isBooked && (
                          <div className="h-full min-h-[60px] flex items-center justify-center">
                            {isCheckIn && (
                              <span className="text-xs font-bold text-white bg-black bg-opacity-20 px-2 py-1 rounded">
                                IN
                              </span>
                            )}
                            {isCheckOut && !isCheckIn && (
                              <span className="text-xs font-bold text-white bg-black bg-opacity-20 px-2 py-1 rounded">
                                OUT
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-sm text-slate-700">Confirmed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-500 rounded"></div>
            <span className="text-sm text-slate-700">Checked-in</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-slate-400 rounded"></div>
            <span className="text-sm text-slate-700">Checked-out</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span className="text-sm text-slate-700">Canceled</span>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <div className="w-3 h-3 border-2 border-blue-400 rounded"></div>
            <span className="text-sm text-slate-700">Today</span>
          </div>
        </div>
      </Card>

      <Card className="hover-lift premium-calendar-card">
        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
          <span className="w-1 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full mr-3"></span>
          All Rooms
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredRooms.map((room) => {
            const roomType = state.roomTypes.find(
              (rt) => rt.id === room.roomTypeId
            );
            const currentReservation = state.reservations.find(
              (res) => res.roomId === room.id && res.status === "checked-in"
            );
            const customer = currentReservation
              ? state.customers.find(
                  (c) => c.id === currentReservation.customerId
                )
              : null;

            const statusConfig: Record<
              string,
              {
                bg: string;
                border: string;
                text: string;
                badge: string;
                label: string;
              }
            > = {
              available: {
                bg: "bg-gradient-to-br from-green-50 to-green-100",
                border: "border-green-200",
                text: "text-green-700",
                badge: "bg-green-500",
                label: "Available",
              },
              occupied: {
                bg: "bg-gradient-to-br from-blue-50 to-blue-100",
                border: "border-blue-200",
                text: "text-blue-700",
                badge: "bg-blue-500",
                label: "Occupied",
              },
              maintenance: {
                bg: "bg-gradient-to-br from-yellow-50 to-yellow-100",
                border: "border-yellow-200",
                text: "text-yellow-700",
                badge: "bg-yellow-500",
                label: "Maintenance",
              },
              cleaned: {
                bg: "bg-gradient-to-br from-emerald-50 to-emerald-100",
                border: "border-emerald-200",
                text: "text-emerald-700",
                badge: "bg-emerald-500",
                label: "Cleaned",
              },
              "to-clean": {
                bg: "bg-gradient-to-br from-blue-50 to-blue-100",
                border: "border-blue-200",
                text: "text-blue-700",
                badge: "bg-blue-600",
                label: "To Clean",
              },
            };

            const config = statusConfig[room.status] || statusConfig.available;

            return (
              <div
                key={room.id}
                className={`${config.bg} ${config.border} border-2 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer premium-room-card`}
                onClick={() => {
                  if (currentReservation) {
                    setSelectedReservation(currentReservation);
                    setShowDetailsModal(true);
                  }
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">
                      {room.roomNumber}
                    </h4>
                    <p className="text-sm text-slate-600 mt-1">
                      {roomType?.name || "N/A"}
                    </p>
                  </div>
                  <div
                    className={`${config.badge} w-3 h-3 rounded-full shadow-sm`}
                  ></div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Status
                    </span>
                    <span
                      className={`text-xs font-bold ${config.text} px-2 py-1 rounded-full ${config.bg}`}
                    >
                      {config.label}
                    </span>
                  </div>

                  {room.floor && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Floor
                      </span>
                      <span className="text-sm font-medium text-slate-700">
                        {room.floor}
                      </span>
                    </div>
                  )}

                  {customer && currentReservation && (
                    <div className="pt-2 border-t border-slate-200">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                        Guest
                      </p>
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {customer.name}
                      </p>
                      <p className="text-xs text-slate-600 mt-1">
                        {formatDate(currentReservation.checkIn)} -{" "}
                        {formatDate(currentReservation.checkOut)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {selectedReservation && (
        <Modal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedReservation(null);
          }}
          title="Reservation Details"
          footer={
            <Button
              onClick={() => {
                setShowDetailsModal(false);
                setSelectedReservation(null);
              }}
            >
              Close
            </Button>
          }
        >
          {(() => {
            const customer = state.customers.find(
              (c) => c.id === selectedReservation.customerId
            );
            const room = state.rooms.find(
              (r) => r.id === selectedReservation.roomId
            );
            const roomType = room
              ? state.roomTypes.find((rt) => rt.id === room.roomTypeId)
              : null;
            const channel = state.channels.find(
              (ch) => ch.id === selectedReservation.channelId
            );
            // Compute customer type
            const customerReservations = state.reservations.filter(
              (r) =>
                r.customerId === selectedReservation.customerId &&
                r.status !== "canceled"
            );
            const visitCount = customerReservations.length;
            const customerBills = state.bills.filter((b) =>
              customerReservations.some((r) => r.id === b.reservationId)
            );
            const hasExtras = customerBills.some((b) => {
              const relatedRes = customerReservations.find(
                (r) => r.id === b.reservationId
              );
              if (!relatedRes) return false;
              // VIP if billed base (amount before tax) exceeds reservation totalAmount
              // or if there are multiple line items indicating extras
              const extrasByAmount = b.amount > relatedRes.totalAmount;
              const extrasByLines =
                Array.isArray(b.lineItems) && b.lineItems.length > 1;
              return extrasByAmount || extrasByLines;
            });
            const customerType: "VIP" | "Regular" | "New" = hasExtras
              ? "VIP"
              : visitCount > 1
              ? "Regular"
              : "New";
            const typeStyles: Record<string, string> = {
              VIP: "bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900",
              Regular: "bg-green-100 text-green-800",
              New: "bg-blue-100 text-blue-800",
            };
            const statusColors = {
              confirmed: "bg-blue-100 text-blue-800",
              "checked-in": "bg-green-100 text-green-800",
              "checked-out": "bg-slate-100 text-slate-800",
              canceled: "bg-red-100 text-red-800",
            };

            return (
              <div className="space-y-6">
                {/* Customer Information */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-200">
                    Customer Information
                  </h3>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${typeStyles[customerType]}`}
                    >
                      <span>
                        {customerType === "VIP" ? "VIP" : customerType}
                      </span>
                      {customerType !== "New" && (
                        <span className="opacity-80">
                          • {visitCount} visit{visitCount > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-500">Name</p>
                      <p className="text-base text-slate-900 mt-1">
                        {customer?.name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Email
                      </p>
                      <p className="text-base text-slate-900 mt-1">
                        {customer?.email || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Phone
                      </p>
                      <p className="text-base text-slate-900 mt-1">
                        {customer?.phone || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Nationality
                      </p>
                      <p className="text-base text-slate-900 mt-1">
                        {customer?.nationality || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Reservation Information */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-200">
                    Reservation Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Room Number
                      </p>
                      <p className="text-base text-slate-900 mt-1">
                        {room?.roomNumber || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Room Type
                      </p>
                      <p className="text-base text-slate-900 mt-1">
                        {roomType?.name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Check-in Date
                      </p>
                      <p className="text-base text-slate-900 mt-1">
                        {formatDate(selectedReservation.checkIn)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Check-out Date
                      </p>
                      <p className="text-base text-slate-900 mt-1">
                        {formatDate(selectedReservation.checkOut)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Adults
                      </p>
                      <p className="text-base text-slate-900 mt-1">
                        {selectedReservation.adults}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Children
                      </p>
                      <p className="text-base text-slate-900 mt-1">
                        {selectedReservation.children}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Status
                      </p>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-1 ${
                          statusColors[selectedReservation.status]
                        }`}
                      >
                        {selectedReservation.status.charAt(0).toUpperCase() +
                          selectedReservation.status.slice(1).replace("-", " ")}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Channel
                      </p>
                      <p className="text-base text-slate-900 mt-1">
                        {channel?.name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Total Amount
                      </p>
                      <p className="text-base font-semibold text-slate-900 mt-1">
                        {formatCurrency(selectedReservation.totalAmount)}
                      </p>
                    </div>
                    {selectedReservation.notes && (
                      <div className="md:col-span-2">
                        <p className="text-sm font-medium text-slate-500">
                          Notes
                        </p>
                        <p className="text-base text-slate-900 mt-1">
                          {selectedReservation.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
        </Modal>
      )}
    </div>
  );
};
