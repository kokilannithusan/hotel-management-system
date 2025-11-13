import React, { useMemo, useState } from "react";
import { useHotel } from "../../context/HotelContext";
import { Card } from "../../components/ui/Card";
import { Table } from "../../components/ui/Table";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import {
  formatDate,
  formatCurrency,
  formatPhoneNumber,
} from "../../utils/formatters";
import { Reservation, ReservationStatus } from "../../types/entities";

type StatusKey = ReservationStatus | "all";
type SortOption = "recent" | "oldest" | "amount-high" | "amount-low";

const STATUS_FILTERS: Array<{
  value: StatusKey;
  label: string;
  tone: string;
  description: string;
}> = [
  {
    value: "all",
    label: "All",
    tone: "bg-slate-100 text-slate-700",
    description: "Every reservation in the system",
  },
  {
    value: "confirmed",
    label: "Confirmed",
    tone: "bg-blue-100 text-blue-700",
    description: "Upcoming guests with confirmed stays",
  },
  {
    value: "checked-in",
    label: "Checked-in",
    tone: "bg-green-100 text-green-700",
    description: "Guests currently staying with you",
  },
  {
    value: "checked-out",
    label: "Checked-out",
    tone: "bg-slate-100 text-slate-700",
    description: "Guests who have completed their stay",
  },
  {
    value: "canceled",
    label: "Canceled",
    tone: "bg-red-100 text-red-700",
    description: "Reservations that were canceled",
  },
];

const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: "recent", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "amount-high", label: "Highest amount" },
  { value: "amount-low", label: "Lowest amount" },
];

const STATUS_BADGE_CLASS: Record<ReservationStatus, string> = {
  confirmed: "bg-blue-100 text-blue-800",
  "checked-in": "bg-green-100 text-green-800",
  "checked-out": "bg-slate-100 text-slate-800",
  canceled: "bg-red-100 text-red-800",
};

export const ReservationsHistory: React.FC = () => {
  const { state, dispatch } = useHotel();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusKey>("all");
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [sortOption, setSortOption] = useState<SortOption>("recent");
  const [selectedReservationId, setSelectedReservationId] = useState<
    string | null
  >(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const currencyCode = state.settings?.currency ?? "USD";

  const customerById = useMemo(() => {
    const map = new Map<string, (typeof state.customers)[number]>();
    state.customers.forEach((customer) => map.set(customer.id, customer));
    return map;
  }, [state.customers]);

  const roomById = useMemo(() => {
    const map = new Map<string, (typeof state.rooms)[number]>();
    state.rooms.forEach((room) => map.set(room.id, room));
    return map;
  }, [state.rooms]);

  const roomTypeById = useMemo(() => {
    const map = new Map<string, (typeof state.roomTypes)[number]>();
    state.roomTypes.forEach((roomType) => map.set(roomType.id, roomType));
    return map;
  }, [state.roomTypes]);

  const channelById = useMemo(() => {
    const map = new Map<string, (typeof state.channels)[number]>();
    state.channels.forEach((channel) => map.set(channel.id, channel));
    return map;
  }, [state.channels]);

  const statusCounts = useMemo(() => {
    const counts: Record<StatusKey, number> = {
      all: state.reservations.length,
      confirmed: 0,
      "checked-in": 0,
      "checked-out": 0,
      canceled: 0,
    };

    state.reservations.forEach((res) => {
      counts[res.status] += 1;
    });

    return counts;
  }, [state.reservations]);

  const filteredReservations = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const filtered = state.reservations.filter((res) => {
      const customer = customerById.get(res.customerId);
      const matchesSearch =
        !normalizedSearch ||
        res.id.toLowerCase().includes(normalizedSearch) ||
        (customer &&
          (customer.name.toLowerCase().includes(normalizedSearch) ||
            customer.email.toLowerCase().includes(normalizedSearch)));
      const matchesStatus =
        statusFilter === "all" || res.status === statusFilter;
      const matchesChannel =
        channelFilter === "all" || res.channelId === channelFilter;
      return matchesSearch && matchesStatus && matchesChannel;
    });

    return filtered.sort((a, b) => {
      switch (sortOption) {
        case "recent":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "amount-high":
          return b.totalAmount - a.totalAmount;
        case "amount-low":
          return a.totalAmount - b.totalAmount;
        default:
          return 0;
      }
    });
  }, [
    state.reservations,
    customerById,
    searchTerm,
    statusFilter,
    channelFilter,
    sortOption,
  ]);

  const filtersActive =
    searchTerm.trim().length > 0 ||
    statusFilter !== "all" ||
    channelFilter !== "all";

  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setChannelFilter("all");
  };

  const reservationStats = useMemo(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const summary = {
      total: filteredReservations.length,
      upcoming: 0,
      inHouse: 0,
      canceled: 0,
      revenue: 0,
    };

    filteredReservations.forEach((res) => {
      const checkInDate = new Date(res.checkIn);
      const checkOutDate = new Date(res.checkOut);

      if (res.status === "canceled") {
        summary.canceled += 1;
      }

      if (checkInDate > startOfToday) {
        summary.upcoming += 1;
      }

      if (
        res.status !== "canceled" &&
        checkInDate <= startOfToday &&
        checkOutDate >= startOfToday
      ) {
        summary.inHouse += 1;
      }

      if (res.status !== "canceled") {
        summary.revenue += res.totalAmount;
      }
    });

    return summary;
  }, [filteredReservations]);

  const totalReservations = state.reservations.length;

  const getNightCount = (checkIn: string, checkOut: string) => {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const diff = Math.round(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diff > 0 ? diff : 1;
  };

  const selectedReservation = useMemo(() => {
    if (!selectedReservationId) {
      return null;
    }
    return (
      state.reservations.find((res) => res.id === selectedReservationId) || null
    );
  }, [selectedReservationId, state.reservations]);

  const selectedCustomer = selectedReservation
    ? customerById.get(selectedReservation.customerId)
    : undefined;
  const selectedRoom = selectedReservation
    ? roomById.get(selectedReservation.roomId)
    : undefined;
  const selectedRoomType = selectedRoom?.roomTypeId
    ? roomTypeById.get(selectedRoom.roomTypeId)
    : undefined;
  const selectedChannel = selectedReservation
    ? channelById.get(selectedReservation.channelId)
    : undefined;
  const selectedNights = selectedReservation
    ? getNightCount(selectedReservation.checkIn, selectedReservation.checkOut)
    : 0;

  const handleCancel = (reservation: Reservation, onSuccess?: () => void) => {
    if (window.confirm("Are you sure you want to cancel this reservation?")) {
      dispatch({
        type: "UPDATE_RESERVATION",
        payload: { ...reservation, status: "canceled" },
      });
      onSuccess?.();
    }
  };

  const handleOpenReservation = (reservation: Reservation) => {
    setSelectedReservationId(reservation.id);
    setDetailsOpen(true);
  };

  const handleCloseReservation = () => {
    setDetailsOpen(false);
    setSelectedReservationId(null);
  };

  const columns = [
    {
      key: "reservation",
      header: "Reservation",
      cellClassName: "whitespace-normal",
      render: (res: Reservation) => {
        const channel = channelById.get(res.channelId);
        const createdLabel = formatDate(res.createdAt);

        return (
          <div className="space-y-2">
            <span className="inline-flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-700">
                #{res.id.slice(0, 8)}
              </span>
              <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">
                {channel?.name || "Direct booking"}
              </span>
            </span>
            {createdLabel && (
              <span className="text-xs text-slate-500">
                Created {createdLabel}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "guest",
      header: "Guest",
      cellClassName: "whitespace-normal",
      render: (res: Reservation) => {
        const customer = customerById.get(res.customerId);
        if (!customer) {
          return <span className="text-sm text-slate-500">Unknown guest</span>;
        }
        return (
          <div className="space-y-1">
            <span className="text-sm font-medium text-slate-900">
              {customer.name}
            </span>
            <span className="text-xs text-slate-500 break-words">
              {customer.email}
            </span>
            {customer.phone && (
              <span className="text-xs text-slate-500">
                {formatPhoneNumber(customer.phone)}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "stay",
      header: "Stay",
      cellClassName: "whitespace-normal",
      render: (res: Reservation) => {
        const nights = getNightCount(res.checkIn, res.checkOut);
        return (
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-900">
              <span>{formatDate(res.checkIn)}</span>
              <span className="text-xs font-normal uppercase tracking-wide text-slate-400">
                to
              </span>
              <span>{formatDate(res.checkOut)}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>
                {nights} night{nights !== 1 ? "s" : ""}
              </span>
              <span>
                {res.adults} adult{res.adults !== 1 ? "s" : ""}
              </span>
              {res.children > 0 && (
                <span>
                  {res.children} child{res.children !== 1 ? "ren" : ""}
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: "room",
      header: "Room",
      cellClassName: "whitespace-normal",
      render: (res: Reservation) => {
        const room = roomById.get(res.roomId);
        const roomType = room?.roomTypeId
          ? roomTypeById.get(room.roomTypeId)
          : undefined;
        const roomStatusLabel = room
          ? room.status.charAt(0).toUpperCase() +
            room.status.slice(1).replace("-", " ")
          : undefined;
        return room ? (
          <div className="space-y-1">
            <span className="text-sm font-medium text-slate-900">
              Room {room.roomNumber}
            </span>
            <span className="text-xs text-slate-500">
              {roomType?.name || "Unknown type"}
            </span>
            {roomStatusLabel && (
              <span className="text-xs text-slate-500">
                Status: {roomStatusLabel}
              </span>
            )}
          </div>
        ) : (
          <span className="text-sm text-slate-500">Unknown room</span>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      render: (res: Reservation) => {
        const badgeClass =
          STATUS_BADGE_CLASS[res.status] || "bg-slate-100 text-slate-800";
        return (
          <span
            className={`px-2 py-1 text-xs font-semibold rounded-full ${badgeClass}`}
          >
            {res.status.charAt(0).toUpperCase() +
              res.status.slice(1).replace("-", " ")}
          </span>
        );
      },
    },
    {
      key: "totalAmount",
      header: "Amount",
      headerClassName: "text-right",
      cellClassName: "whitespace-nowrap text-right text-slate-900 font-semibold",
      render: (res: Reservation) =>
        formatCurrency(res.totalAmount, currencyCode),
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "text-right",
      cellClassName: "whitespace-nowrap text-right",
      render: (res: Reservation) => (
        <div className="flex justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={(event) => {
              event.stopPropagation();
              handleOpenReservation(res);
            }}
          >
            View
          </Button>
          {res.status !== "canceled" && res.status !== "checked-out" && (
            <Button
              size="sm"
              variant="danger"
              onClick={(event) => {
                event.stopPropagation();
                handleCancel(res);
              }}
            >
              Cancel
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="mb-6 pb-4 border-b border-slate-200">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
          Reservation History
        </h1>
        <p className="text-slate-600 mt-1 font-medium">
          View all past and current reservations
        </p>
      </div>
      <Card>
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Reservation overview
              </p>
              <p className="text-xs text-slate-500">
                Showing {reservationStats.total} of {totalReservations}{" "}
                reservations
              </p>
            </div>
            {filtersActive && (
              <Button variant="outline" size="sm" onClick={handleResetFilters}>
                Reset filters
              </Button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map(({ value, label, tone, description }) => {
              const isActive = statusFilter === value;
              const count = statusCounts[value] ?? 0;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setStatusFilter(
                      value === statusFilter && value !== "all" ? "all" : value
                    )
                  }
                  className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
                    isActive
                      ? "border border-blue-300 bg-blue-50 text-blue-700 shadow-sm"
                      : `border border-slate-200 ${tone} hover:brightness-95`
                  }`}
                  title={description}
                >
                  <span>{label}</span>
                  <span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Visible results
              </p>
              <p className="text-xl font-semibold text-slate-900">
                {reservationStats.total}
              </p>
              <p className="text-xs text-slate-500">
                of {totalReservations} total | {reservationStats.canceled}{" "}
                canceled
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                In house today
              </p>
              <p className="text-xl font-semibold text-slate-900">
                {reservationStats.inHouse}
              </p>
              <p className="text-xs text-slate-500">Guests currently staying</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Upcoming arrivals
              </p>
              <p className="text-xl font-semibold text-slate-900">
                {reservationStats.upcoming}
              </p>
              <p className="text-xs text-slate-500">Future check-ins</p>
            </div>
            <div className="col-span-2 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm md:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Projected revenue
              </p>
              <p className="text-xl font-semibold text-blue-600">
                {formatCurrency(reservationStats.revenue, currencyCode)}
              </p>
              <p className="text-xs text-slate-500">
                Excludes canceled reservations
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Search
              </span>
              <Input
                placeholder="Search by reservation ID, guest, or email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Channel
              </span>
              <Select
                value={channelFilter}
                onChange={(e) => setChannelFilter(e.target.value)}
                options={[
                  { value: "all", label: "All Channels" },
                  ...state.channels.map((c) => ({
                    value: c.id,
                    label: c.name,
                  })),
                ]}
              />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Sort results
              </span>
              <Select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                options={SORT_OPTIONS.map((option) => ({
                  value: option.value,
                  label: option.label,
                }))}
              />
            </div>
          </div>

          <Table
            columns={columns}
            data={filteredReservations}
            emptyMessage="No reservations match your current filters."
            onRowClick={handleOpenReservation}
          />
        </div>
      </Card>
      {selectedReservation && (
        <Modal
          isOpen={detailsOpen}
          onClose={handleCloseReservation}
          title={`Reservation #${selectedReservation.id.slice(0, 8)}`}
          footer={
            <div className="flex w-full flex-col gap-2 sm:flex-row-reverse sm:items-center sm:justify-between">
              {selectedReservation.status !== "canceled" &&
                selectedReservation.status !== "checked-out" && (
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() =>
                      handleCancel(selectedReservation, handleCloseReservation)
                    }
                  >
                    Cancel reservation
                  </Button>
                )}
              <Button
                size="sm"
                variant="secondary"
                onClick={handleCloseReservation}
              >
                Close
              </Button>
            </div>
          }
        >
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                  STATUS_BADGE_CLASS[selectedReservation.status]
                }`}
              >
                {selectedReservation.status.charAt(0).toUpperCase() +
                  selectedReservation.status.slice(1).replace("-", " ")}
              </span>
              {selectedChannel && (
                <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
                  {selectedChannel.name}
                </span>
              )}
              <span className="text-xs text-slate-500">
                Created {formatDate(selectedReservation.createdAt)}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Guest
                </p>
                <div className="mt-1 space-y-1 text-sm text-slate-900">
                  <p className="font-medium">
                    {selectedCustomer ? selectedCustomer.name : "Unknown guest"}
                  </p>
                  {selectedCustomer && (
                    <>
                      <p className="text-xs text-slate-500">
                        {selectedCustomer.email}
                      </p>
                      {selectedCustomer.phone && (
                        <p className="text-xs text-slate-500">
                          {formatPhoneNumber(selectedCustomer.phone)}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Stay details
                </p>
                <div className="mt-1 space-y-1 text-sm text-slate-900">
                  <p>
                    {formatDate(selectedReservation.checkIn)} —{" "}
                    {formatDate(selectedReservation.checkOut)}
                  </p>
                  <p className="text-xs text-slate-500">
                    {selectedNights} night{selectedNights !== 1 ? "s" : ""},{" "}
                    {selectedReservation.adults} adult
                    {selectedReservation.adults !== 1 ? "s" : ""}
                    {selectedReservation.children > 0 && (
                      <>
                        , {selectedReservation.children} child
                        {selectedReservation.children !== 1 ? "ren" : ""}
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Room
                </p>
                <div className="mt-1 space-y-1 text-sm text-slate-900">
                  <p className="font-medium">
                    {selectedRoom
                      ? `Room ${selectedRoom.roomNumber}`
                      : "Unknown room"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {selectedRoomType?.name || "Room type unavailable"}
                  </p>
                  {selectedRoom && (
                    <p className="text-xs text-slate-500">
                      Status:{" "}
                      {selectedRoom.status.charAt(0).toUpperCase() +
                        selectedRoom.status.slice(1).replace("-", " ")}
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Billing
                </p>
                <div className="mt-1 space-y-1 text-sm text-slate-900">
                  <p className="font-semibold text-blue-600">
                    {formatCurrency(
                      selectedReservation.totalAmount,
                      currencyCode
                    )}
                  </p>
                  <p className="text-xs text-slate-500">
                    Reservation reference: {selectedReservation.id}
                  </p>
                </div>
              </div>
            </div>

            {selectedReservation.notes && (
              <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Notes
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">
                  {selectedReservation.notes}
                </p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
