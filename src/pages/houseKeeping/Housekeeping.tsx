import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import {
  CheckCircle,
  AlertCircle,
  Clock,
  User,
  Home,
  Sparkles,
  Search,
  X,
  Calendar,
} from "lucide-react";

/**
 * Housekeeping Management Component
 *
 * Workflow:
 * 1. Manager/Housekeeper assigns dirty rooms to Cleaners
 * 2. Cleaner receives assignment and starts cleaning
 * 3. Cleaner completes checklist tasks one by one
 * 4. Cleaner submits completed work
 * 5. Manager/Housekeeper verifies and approves the work
 *
 * Roles:
 * - Manager: Can monitor, verify work, and reset rooms
 * - Housekeeper: Can assign tasks to cleaners and verify work
 * - Cleaner: Can complete assigned checklist tasks
 *
 * Room Status Flow:
 * dirty → assigned → in-progress → completed → verified
 */

interface Task {
  id: string;
  name: string;
  completed: boolean;
}

interface Room {
  id: string;
  number: string;
  type: string;
  floor: number;
  status: "dirty" | "assigned" | "in-progress" | "completed" | "verified";
  assignedTo?: string; // Cleaner name
  assignedBy?: string; // Housekeeper name
  priority?: "low" | "medium" | "high";
  lastCleaned?: string;
  checklist: Task[];
  notes?: string;
  assignedAt?: string;
  completedAt?: string;
}

export const Housekeeping: React.FC = () => {
  const { user } = useAuth();
  const userRole = (user as any)?.role; // "Manager", "Housekeeper", or "Cleaner"
  const isManager = userRole === "Manager";
  const isHousekeeper = userRole === "Housekeeper";
  const isCleaner = userRole === "Cleaner";

  const [rooms, setRooms] = useState<Room[]>([
    // Floor 1 - Standard Rooms
    {
      id: "1",
      number: "101",
      type: "Standard",
      floor: 1,
      status: "dirty",
      priority: "high",
      checklist: [
        { id: "1", name: "Vacuum floor and carpets", completed: false },
        {
          id: "2",
          name: "Change bed linens and pillowcases",
          completed: false,
        },
        { id: "3", name: "Clean and sanitize bathroom", completed: false },
        { id: "4", name: "Dust all surfaces and furniture", completed: false },
        { id: "5", name: "Restock toiletries and towels", completed: false },
        { id: "6", name: "Empty trash and replace bags", completed: false },
        { id: "7", name: "Check and refill minibar", completed: false },
      ],
    },
    {
      id: "2",
      number: "102",
      type: "Standard",
      floor: 1,
      status: "assigned",
      assignedTo: "Maria Garcia",
      assignedBy: "Sarah Johnson",
      priority: "medium",
      assignedAt: new Date(Date.now() - 1800000).toISOString(),
      checklist: [
        { id: "1", name: "Vacuum floor and carpets", completed: false },
        {
          id: "2",
          name: "Change bed linens and pillowcases",
          completed: false,
        },
        { id: "3", name: "Clean and sanitize bathroom", completed: false },
        { id: "4", name: "Dust all surfaces and furniture", completed: false },
        { id: "5", name: "Restock toiletries and towels", completed: false },
        { id: "6", name: "Empty trash and replace bags", completed: false },
      ],
    },
    {
      id: "3",
      number: "103",
      type: "Standard",
      floor: 1,
      status: "in-progress",
      assignedTo: "Maria Garcia",
      assignedBy: "Sarah Johnson",
      priority: "medium",
      assignedAt: new Date(Date.now() - 3600000).toISOString(),
      checklist: [
        { id: "1", name: "Vacuum floor and carpets", completed: true },
        { id: "2", name: "Change bed linens and pillowcases", completed: true },
        { id: "3", name: "Clean and sanitize bathroom", completed: true },
        { id: "4", name: "Dust all surfaces and furniture", completed: false },
        { id: "5", name: "Restock toiletries and towels", completed: false },
        { id: "6", name: "Empty trash and replace bags", completed: false },
      ],
    },
    {
      id: "4",
      number: "104",
      type: "Standard",
      floor: 1,
      status: "verified",
      assignedTo: "John Smith",
      assignedBy: "Sarah Johnson",
      completedAt: new Date(Date.now() - 7200000).toISOString(),
      lastCleaned: new Date().toISOString().split("T")[0],
      checklist: [
        { id: "1", name: "Vacuum floor and carpets", completed: true },
        { id: "2", name: "Change bed linens and pillowcases", completed: true },
        { id: "3", name: "Clean and sanitize bathroom", completed: true },
        { id: "4", name: "Dust all surfaces and furniture", completed: true },
        { id: "5", name: "Restock toiletries and towels", completed: true },
        { id: "6", name: "Empty trash and replace bags", completed: true },
      ],
    },
    {
      id: "5",
      number: "105",
      type: "Standard",
      floor: 1,
      status: "dirty",
      priority: "low",
      checklist: [
        { id: "1", name: "Vacuum floor and carpets", completed: false },
        {
          id: "2",
          name: "Change bed linens and pillowcases",
          completed: false,
        },
        { id: "3", name: "Clean and sanitize bathroom", completed: false },
        { id: "4", name: "Dust all surfaces and furniture", completed: false },
        { id: "5", name: "Restock toiletries and towels", completed: false },
        { id: "6", name: "Empty trash and replace bags", completed: false },
      ],
    },
    // Floor 2 - Deluxe Rooms
    {
      id: "6",
      number: "201",
      type: "Deluxe",
      floor: 2,
      status: "dirty",
      priority: "high",
      notes: "VIP guest checking in - extra attention to details",
      checklist: [
        { id: "1", name: "Vacuum floor and carpets", completed: false },
        {
          id: "2",
          name: "Change bed linens and pillowcases",
          completed: false,
        },
        { id: "3", name: "Clean and sanitize bathroom", completed: false },
        { id: "4", name: "Dust all surfaces and furniture", completed: false },
        { id: "5", name: "Restock toiletries and towels", completed: false },
        { id: "6", name: "Empty trash and replace bags", completed: false },
        { id: "7", name: "Check and refill minibar", completed: false },
        {
          id: "8",
          name: "Polish mirrors and glass surfaces",
          completed: false,
        },
        { id: "9", name: "Arrange welcome amenities", completed: false },
      ],
    },
    {
      id: "7",
      number: "202",
      type: "Deluxe",
      floor: 2,
      status: "completed",
      assignedTo: "Lisa Chen",
      assignedBy: "Sarah Johnson",
      priority: "medium",
      assignedAt: new Date(Date.now() - 5400000).toISOString(),
      completedAt: new Date(Date.now() - 1800000).toISOString(),
      lastCleaned: new Date().toISOString().split("T")[0],
      checklist: [
        { id: "1", name: "Vacuum floor and carpets", completed: true },
        { id: "2", name: "Change bed linens and pillowcases", completed: true },
        { id: "3", name: "Clean and sanitize bathroom", completed: true },
        { id: "4", name: "Dust all surfaces and furniture", completed: true },
        { id: "5", name: "Restock toiletries and towels", completed: true },
        { id: "6", name: "Empty trash and replace bags", completed: true },
        { id: "7", name: "Check and refill minibar", completed: true },
        { id: "8", name: "Polish mirrors and glass surfaces", completed: true },
      ],
    },
    {
      id: "8",
      number: "203",
      type: "Deluxe",
      floor: 2,
      status: "assigned",
      assignedTo: "John Smith",
      assignedBy: "Sarah Johnson",
      priority: "low",
      assignedAt: new Date(Date.now() - 900000).toISOString(),
      checklist: [
        { id: "1", name: "Vacuum floor and carpets", completed: false },
        {
          id: "2",
          name: "Change bed linens and pillowcases",
          completed: false,
        },
        { id: "3", name: "Clean and sanitize bathroom", completed: false },
        { id: "4", name: "Dust all surfaces and furniture", completed: false },
        { id: "5", name: "Restock toiletries and towels", completed: false },
        { id: "6", name: "Empty trash and replace bags", completed: false },
        { id: "7", name: "Check and refill minibar", completed: false },
      ],
    },
    // Floor 3 - Suites
    {
      id: "9",
      number: "301",
      type: "Suite",
      floor: 3,
      status: "dirty",
      priority: "high",
      notes: "Suite requires deep cleaning - extended checkout",
      checklist: [
        { id: "1", name: "Vacuum all rooms and carpets", completed: false },
        {
          id: "2",
          name: "Change bed linens in all bedrooms",
          completed: false,
        },
        { id: "3", name: "Clean and sanitize all bathrooms", completed: false },
        { id: "4", name: "Dust all surfaces and furniture", completed: false },
        {
          id: "5",
          name: "Clean kitchen area and appliances",
          completed: false,
        },
        { id: "6", name: "Restock toiletries and towels", completed: false },
        { id: "7", name: "Empty all trash and replace bags", completed: false },
        { id: "8", name: "Check and refill minibar", completed: false },
        {
          id: "9",
          name: "Polish mirrors and glass surfaces",
          completed: false,
        },
        { id: "10", name: "Clean balcony/terrace area", completed: false },
      ],
    },
    {
      id: "10",
      number: "302",
      type: "Suite",
      floor: 3,
      status: "in-progress",
      assignedTo: "Lisa Chen",
      assignedBy: "Sarah Johnson",
      priority: "high",
      assignedAt: new Date(Date.now() - 2700000).toISOString(),
      checklist: [
        { id: "1", name: "Vacuum all rooms and carpets", completed: true },
        { id: "2", name: "Change bed linens in all bedrooms", completed: true },
        { id: "3", name: "Clean and sanitize all bathrooms", completed: true },
        { id: "4", name: "Dust all surfaces and furniture", completed: true },
        { id: "5", name: "Clean kitchen area and appliances", completed: true },
        { id: "6", name: "Restock toiletries and towels", completed: false },
        { id: "7", name: "Empty all trash and replace bags", completed: false },
        { id: "8", name: "Check and refill minibar", completed: false },
        {
          id: "9",
          name: "Polish mirrors and glass surfaces",
          completed: false,
        },
        { id: "10", name: "Clean balcony/terrace area", completed: false },
      ],
    },
    {
      id: "11",
      number: "303",
      type: "Suite",
      floor: 3,
      status: "verified",
      assignedTo: "Maria Garcia",
      assignedBy: "Sarah Johnson",
      priority: "medium",
      assignedAt: new Date(Date.now() - 10800000).toISOString(),
      completedAt: new Date(Date.now() - 7200000).toISOString(),
      lastCleaned: new Date().toISOString().split("T")[0],
      checklist: [
        { id: "1", name: "Vacuum all rooms and carpets", completed: true },
        { id: "2", name: "Change bed linens in all bedrooms", completed: true },
        { id: "3", name: "Clean and sanitize all bathrooms", completed: true },
        { id: "4", name: "Dust all surfaces and furniture", completed: true },
        { id: "5", name: "Clean kitchen area and appliances", completed: true },
        { id: "6", name: "Restock toiletries and towels", completed: true },
        { id: "7", name: "Empty all trash and replace bags", completed: true },
        { id: "8", name: "Check and refill minibar", completed: true },
        { id: "9", name: "Polish mirrors and glass surfaces", completed: true },
        { id: "10", name: "Clean balcony/terrace area", completed: true },
      ],
    },
    // Floor 1 - More Standard Rooms
    {
      id: "12",
      number: "106",
      type: "Standard",
      floor: 1,
      status: "dirty",
      priority: "medium",
      checklist: [
        { id: "1", name: "Vacuum floor and carpets", completed: false },
        {
          id: "2",
          name: "Change bed linens and pillowcases",
          completed: false,
        },
        { id: "3", name: "Clean and sanitize bathroom", completed: false },
        { id: "4", name: "Dust all surfaces and furniture", completed: false },
        { id: "5", name: "Restock toiletries and towels", completed: false },
        { id: "6", name: "Empty trash and replace bags", completed: false },
      ],
    },
    {
      id: "13",
      number: "107",
      type: "Standard",
      floor: 1,
      status: "assigned",
      assignedTo: "John Smith",
      assignedBy: "Sarah Johnson",
      priority: "low",
      assignedAt: new Date(Date.now() - 600000).toISOString(),
      checklist: [
        { id: "1", name: "Vacuum floor and carpets", completed: false },
        {
          id: "2",
          name: "Change bed linens and pillowcases",
          completed: false,
        },
        { id: "3", name: "Clean and sanitize bathroom", completed: false },
        { id: "4", name: "Dust all surfaces and furniture", completed: false },
        { id: "5", name: "Restock toiletries and towels", completed: false },
        { id: "6", name: "Empty trash and replace bags", completed: false },
      ],
    },
    {
      id: "14",
      number: "204",
      type: "Deluxe",
      floor: 2,
      status: "dirty",
      priority: "high",
      checklist: [
        { id: "1", name: "Vacuum floor and carpets", completed: false },
        {
          id: "2",
          name: "Change bed linens and pillowcases",
          completed: false,
        },
        { id: "3", name: "Clean and sanitize bathroom", completed: false },
        { id: "4", name: "Dust all surfaces and furniture", completed: false },
        { id: "5", name: "Restock toiletries and towels", completed: false },
        { id: "6", name: "Empty trash and replace bags", completed: false },
        { id: "7", name: "Check and refill minibar", completed: false },
        {
          id: "8",
          name: "Polish mirrors and glass surfaces",
          completed: false,
        },
      ],
    },
    {
      id: "15",
      number: "205",
      type: "Deluxe",
      floor: 2,
      status: "in-progress",
      assignedTo: "John Smith",
      assignedBy: "Sarah Johnson",
      priority: "medium",
      assignedAt: new Date(Date.now() - 1200000).toISOString(),
      checklist: [
        { id: "1", name: "Vacuum floor and carpets", completed: true },
        { id: "2", name: "Change bed linens and pillowcases", completed: true },
        { id: "3", name: "Clean and sanitize bathroom", completed: false },
        { id: "4", name: "Dust all surfaces and furniture", completed: false },
        { id: "5", name: "Restock toiletries and towels", completed: false },
        { id: "6", name: "Empty trash and replace bags", completed: false },
        { id: "7", name: "Check and refill minibar", completed: false },
        {
          id: "8",
          name: "Polish mirrors and glass surfaces",
          completed: false,
        },
      ],
    },
  ]);

  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [floorFilter, setFloorFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [assignee, setAssignee] = useState("");
  const [taskNotes, setTaskNotes] = useState("");

  const filteredRooms = rooms.filter((room) => {
    const matchesStatus =
      statusFilter === "all" || room.status === statusFilter;
    const matchesPriority =
      priorityFilter === "all" || room.priority === priorityFilter;
    const matchesFloor =
      floorFilter === "all" || room.floor.toString() === floorFilter;
    const matchesSearch =
      room.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.assignedTo?.toLowerCase().includes(searchQuery.toLowerCase());

    // Filter by user role
    if (isCleaner) {
      return (
        matchesStatus &&
        matchesPriority &&
        matchesFloor &&
        matchesSearch &&
        room.assignedTo === user?.name
      );
    }

    return matchesStatus && matchesPriority && matchesFloor && matchesSearch;
  });

  const dirtyRooms = rooms.filter((r) => r.status === "dirty").length;
  const assignedRooms = rooms.filter((r) => r.status === "assigned").length;
  const inProgressRooms = rooms.filter(
    (r) => r.status === "in-progress"
  ).length;
  const completedRooms = rooms.filter((r) => r.status === "completed").length;
  const totalRooms = rooms.length;
  const completionRate = Math.round(
    ((completedRooms + inProgressRooms) / totalRooms) * 100
  );

  // Housekeeper assigns task to cleaner
  const handleAssignTask = () => {
    if (selectedRoom && assignee) {
      setRooms(
        rooms.map((r) =>
          r.id === selectedRoom.id
            ? {
                ...r,
                status: "assigned",
                assignedTo: assignee,
                assignedBy: user?.name || "Housekeeper",
                assignedAt: new Date().toISOString(),
                notes: taskNotes,
              }
            : r
        )
      );
      setShowAssignModal(false);
      setAssignee("");
      setTaskNotes("");
      setSelectedRoom(null);
    }
  };

  // Cleaner starts working on the task
  const handleStartCleaning = (roomId: string) => {
    setRooms(
      rooms.map((r) =>
        r.id === roomId && r.status === "assigned"
          ? { ...r, status: "in-progress" }
          : r
      )
    );
  };

  // Cleaner updates checklist
  const handleToggleChecklistItem = (taskId: string) => {
    if (selectedRoom) {
      const updatedChecklist = selectedRoom.checklist.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      );
      setSelectedRoom({ ...selectedRoom, checklist: updatedChecklist });
    }
  };

  // Cleaner submits completed work
  const handleSubmitWork = () => {
    if (selectedRoom) {
      setRooms(
        rooms.map((r) =>
          r.id === selectedRoom.id
            ? {
                ...r,
                status: "completed",
                checklist: selectedRoom.checklist,
                completedAt: new Date().toISOString(),
                lastCleaned: new Date().toISOString().split("T")[0],
              }
            : r
        )
      );
      setShowTaskModal(false);
      setSelectedRoom(null);
    }
  };

  // Manager/Housekeeper verifies completed work
  const handleVerifyWork = (roomId: string) => {
    setRooms(
      rooms.map((r) =>
        r.id === roomId && r.status === "completed"
          ? { ...r, status: "verified" }
          : r
      )
    );
  };

  // Reset room to dirty status
  const handleResetRoom = (roomId: string) => {
    setRooms(
      rooms.map((r) =>
        r.id === roomId
          ? {
              ...r,
              status: "dirty",
              assignedTo: undefined,
              assignedBy: undefined,
              assignedAt: undefined,
              completedAt: undefined,
              notes: undefined,
              checklist: r.checklist.map((task) => ({
                ...task,
                completed: false,
              })),
            }
          : r
      )
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Clean Professional Header */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-slate-200">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <Sparkles className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">
                  Housekeeping Management
                </h1>
                <p className="text-slate-500 mt-1">
                  {isManager
                    ? "Monitor and verify cleaning operations"
                    : isHousekeeper
                    ? "Assign tasks to cleaners and monitor progress"
                    : "Complete assigned cleaning tasks"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 px-4 py-2 rounded-lg">
                <p className="text-xs text-slate-600 mb-1">Completion</p>
                <p className="text-2xl font-bold text-blue-600">
                  {completionRate}%
                </p>
              </div>
              <div className="bg-slate-50 px-4 py-2 rounded-lg flex items-center gap-2">
                <User className="w-4 h-4 text-slate-600" />
                <p className="text-sm font-medium text-slate-700">
                  {user?.name || "Staff"}
                </p>
              </div>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by room, type, or cleaner name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 outline-none focus:border-blue-400 focus:bg-white transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-medium outline-none focus:border-blue-400 cursor-pointer"
              >
                <option value="all">All Status ({totalRooms})</option>
                <option value="dirty">
                  Awaiting Assignment ({dirtyRooms})
                </option>
                <option value="assigned">Assigned ({assignedRooms})</option>
                <option value="in-progress">
                  In Progress ({inProgressRooms})
                </option>
                <option value="completed">Completed ({completedRooms})</option>
              </select>
            </div>

            {/* Additional Filters */}
            <div className="flex flex-wrap gap-3">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-4 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-sm font-medium outline-none focus:border-blue-400 cursor-pointer"
              >
                <option value="all">All Priorities</option>
                <option value="high">🔴 High Priority</option>
                <option value="medium">🟡 Medium Priority</option>
                <option value="low">🟢 Low Priority</option>
              </select>

              <select
                value={floorFilter}
                onChange={(e) => setFloorFilter(e.target.value)}
                className="px-4 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-sm font-medium outline-none focus:border-blue-400 cursor-pointer"
              >
                <option value="all">All Floors</option>
                <option value="1">Floor 1</option>
                <option value="2">Floor 2</option>
                <option value="3">Floor 3</option>
              </select>

              {/* Quick Filter Badges */}
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-xs text-slate-500">
                  {filteredRooms.length} room
                  {filteredRooms.length !== 1 ? "s" : ""}
                </span>
                {(statusFilter !== "all" ||
                  priorityFilter !== "all" ||
                  floorFilter !== "all" ||
                  searchQuery) && (
                  <button
                    onClick={() => {
                      setStatusFilter("all");
                      setPriorityFilter("all");
                      setFloorFilter("all");
                      setSearchQuery("");
                    }}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div
            className="cursor-pointer transition-all hover:-translate-y-1"
            onClick={() => setStatusFilter("dirty")}
          >
            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600 mb-1">
                    Awaiting Assignment
                  </p>
                  <p className="text-4xl font-bold text-red-700">
                    {dirtyRooms}
                  </p>
                </div>
                <div className="bg-red-200 p-3 rounded-lg">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
              </div>
            </Card>
          </div>

          <div
            className="cursor-pointer transition-all hover:-translate-y-1"
            onClick={() => setStatusFilter("assigned")}
          >
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 mb-1">
                    Assigned
                  </p>
                  <p className="text-4xl font-bold text-blue-700">
                    {assignedRooms}
                  </p>
                </div>
                <div className="bg-blue-200 p-3 rounded-lg">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </Card>
          </div>

          <div
            className="cursor-pointer transition-all hover:-translate-y-1"
            onClick={() => setStatusFilter("in-progress")}
          >
            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-600 mb-1">
                    In Progress
                  </p>
                  <p className="text-4xl font-bold text-amber-700">
                    {inProgressRooms}
                  </p>
                </div>
                <div className="bg-amber-200 p-3 rounded-lg">
                  <Clock className="w-8 h-8 text-amber-600" />
                </div>
              </div>
            </Card>
          </div>

          <div
            className="cursor-pointer transition-all hover:-translate-y-1"
            onClick={() => setStatusFilter("completed")}
          >
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 mb-1">
                    Completed
                  </p>
                  <p className="text-4xl font-bold text-green-700">
                    {completedRooms}
                  </p>
                </div>
                <div className="bg-green-200 p-3 rounded-lg">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Clean Modern Room Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRooms.map((room) => {
            const completedTasks = room.checklist.filter(
              (t) => t.completed
            ).length;
            const totalTasks = room.checklist.length;
            const progress = Math.round((completedTasks / totalTasks) * 100);

            // Calculate time since assignment
            const getTimeAgo = (isoString?: string) => {
              if (!isoString) return null;
              const minutes = Math.floor(
                (Date.now() - new Date(isoString).getTime()) / 60000
              );
              if (minutes < 60) return `${minutes}m ago`;
              const hours = Math.floor(minutes / 60);
              if (hours < 24) return `${hours}h ago`;
              return `${Math.floor(hours / 24)}d ago`;
            };

            return (
              <Card
                key={room.id}
                className={`hover:shadow-lg transition-all ${
                  room.priority === "high" ? "border-2 border-red-300" : ""
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          room.priority === "high"
                            ? "bg-red-50"
                            : room.priority === "medium"
                            ? "bg-amber-50"
                            : "bg-blue-50"
                        }`}
                      >
                        <Home
                          className={`w-5 h-5 ${
                            room.priority === "high"
                              ? "text-red-600"
                              : room.priority === "medium"
                              ? "text-amber-600"
                              : "text-blue-600"
                          }`}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-bold text-slate-800">
                            Room {room.number}
                          </h3>
                          {room.priority && (
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                room.priority === "high"
                                  ? "bg-red-100 text-red-700"
                                  : room.priority === "medium"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                              title={`${
                                room.priority.charAt(0).toUpperCase() +
                                room.priority.slice(1)
                              } Priority`}
                            >
                              {room.priority === "high"
                                ? "🔴"
                                : room.priority === "medium"
                                ? "🟡"
                                : "🟢"}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500">
                          {room.type} • Floor {room.floor}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          room.status === "dirty"
                            ? "bg-red-100 text-red-700"
                            : room.status === "assigned"
                            ? "bg-blue-100 text-blue-700"
                            : room.status === "in-progress"
                            ? "bg-amber-100 text-amber-700"
                            : room.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : "bg-purple-100 text-purple-700"
                        }`}
                      >
                        {room.status === "dirty"
                          ? "Awaiting"
                          : room.status === "assigned"
                          ? "Assigned"
                          : room.status === "in-progress"
                          ? "Working"
                          : room.status === "completed"
                          ? "Completed"
                          : "Verified"}
                      </span>
                      {room.assignedAt && (
                        <span className="text-xs text-slate-400">
                          {getTimeAgo(room.assignedAt)}
                        </span>
                      )}
                    </div>
                  </div>

                  {room.assignedTo && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-4 h-4 text-blue-600" />
                        <p className="text-xs text-slate-500">Cleaner</p>
                      </div>
                      <p className="text-sm text-slate-800 font-medium">
                        {room.assignedTo}
                      </p>
                      {room.assignedBy && (
                        <p className="text-xs text-slate-500 mt-1">
                          Assigned by: {room.assignedBy}
                        </p>
                      )}
                    </div>
                  )}

                  {room.notes && (
                    <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                      <p className="text-xs text-amber-600 font-semibold mb-1">
                        Notes
                      </p>
                      <p className="text-sm text-amber-900">{room.notes}</p>
                    </div>
                  )}

                  {(room.status === "in-progress" ||
                    room.status === "completed") && (
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-xs font-semibold text-slate-600">
                          Checklist Progress
                        </p>
                        <p className="text-xs font-bold text-slate-700">
                          {completedTasks}/{totalTasks}
                        </p>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {room.lastCleaned && room.status === "verified" && (
                    <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                      <Calendar className="w-4 h-4 text-slate-500" />
                      <span>Completed: {room.lastCleaned}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 pt-2">
                    {/* Housekeeper can assign dirty rooms to cleaners */}
                    {(isManager || isHousekeeper) &&
                      room.status === "dirty" && (
                        <Button
                          onClick={() => {
                            setSelectedRoom(room);
                            setShowAssignModal(true);
                          }}
                          className="flex-1 min-w-[150px] bg-blue-600 hover:bg-blue-700 text-white font-medium"
                        >
                          Assign to Cleaner
                        </Button>
                      )}

                    {/* Cleaner can start working on assigned rooms */}
                    {isCleaner &&
                      room.status === "assigned" &&
                      room.assignedTo === user?.name && (
                        <Button
                          onClick={() => handleStartCleaning(room.id)}
                          className="flex-1 min-w-[150px] bg-amber-600 hover:bg-amber-700 text-white font-medium"
                        >
                          Start Cleaning
                        </Button>
                      )}

                    {/* Cleaner can work on checklist */}
                    {isCleaner &&
                      room.status === "in-progress" &&
                      room.assignedTo === user?.name && (
                        <Button
                          onClick={() => {
                            setSelectedRoom(room);
                            setShowTaskModal(true);
                          }}
                          className="flex-1 min-w-[150px] bg-green-600 hover:bg-green-700 text-white font-medium"
                        >
                          Complete Checklist
                        </Button>
                      )}

                    {/* Manager/Housekeeper can verify completed work */}
                    {(isManager || isHousekeeper) &&
                      room.status === "completed" && (
                        <Button
                          onClick={() => handleVerifyWork(room.id)}
                          className="flex-1 min-w-[150px] bg-green-600 hover:bg-green-700 text-white font-medium"
                        >
                          Verify & Approve
                        </Button>
                      )}

                    {/* Show verified status */}
                    {room.status === "verified" && (
                      <>
                        <div className="flex-1 min-w-[150px] bg-green-50 text-green-700 px-4 py-2 rounded-lg font-medium text-center border border-green-200 flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Verified
                        </div>
                        {/* Manager can reset rooms */}
                        {isManager && (
                          <Button
                            onClick={() => handleResetRoom(room.id)}
                            variant="secondary"
                            className="min-w-[100px]"
                          >
                            Reset Room
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {filteredRooms.length === 0 && (
          <Card className="p-12 text-center">
            <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              No rooms found
            </h3>
            <p className="text-slate-500">
              Try adjusting your search or filter criteria
            </p>
          </Card>
        )}
      </div>

      {/* Assign Cleaner Modal - For Housekeeper/Manager */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          setSelectedRoom(null);
          setAssignee("");
          setTaskNotes("");
        }}
        title={`Assign Cleaner to Room ${selectedRoom?.number}`}
      >
        <div className="space-y-4">
          {/* Room Info */}
          <div className="bg-slate-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="text-sm font-semibold text-slate-800">
                  Room {selectedRoom?.number}
                </h4>
                <p className="text-xs text-slate-500">
                  {selectedRoom?.type} • Floor {selectedRoom?.floor}
                </p>
              </div>
              {selectedRoom?.priority && (
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    selectedRoom.priority === "high"
                      ? "bg-red-100 text-red-700"
                      : selectedRoom.priority === "medium"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {selectedRoom.priority.charAt(0).toUpperCase() +
                    selectedRoom.priority.slice(1)}{" "}
                  Priority
                </span>
              )}
            </div>
          </div>

          {/* Cleaner Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Select Cleaner <span className="text-red-500">*</span>
            </label>
            <select
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:border-blue-400 focus:outline-none bg-white text-slate-700"
            >
              <option value="">Choose a cleaner...</option>
              <option value="Maria Garcia">Maria Garcia</option>
              <option value="John Smith">John Smith</option>
              <option value="Lisa Chen">Lisa Chen</option>
              <option value="Ahmed Hassan">Ahmed Hassan</option>
              <option value="Sofia Rodriguez">Sofia Rodriguez</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Special Instructions (Optional)
            </label>
            <textarea
              value={taskNotes}
              onChange={(e) => setTaskNotes(e.target.value)}
              placeholder="VIP guest, extra attention required, check-in at 2 PM, etc..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-400 focus:outline-none resize-none"
              rows={3}
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Cleaning Checklist ({selectedRoom?.checklist.length} tasks)
            </h4>
            <ul className="space-y-1.5 text-sm text-blue-800">
              {selectedRoom?.checklist.map((task) => (
                <li key={task.id} className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">•</span>
                  <span>{task.name}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => {
                setShowAssignModal(false);
                setSelectedRoom(null);
                setAssignee("");
                setTaskNotes("");
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAssignTask}
              disabled={!assignee}
              className="flex-1"
            >
              Assign Task
            </Button>
          </div>
        </div>
      </Modal>

      {/* Checklist Modal - For Cleaner */}
      <Modal
        isOpen={showTaskModal}
        onClose={() => {
          setShowTaskModal(false);
          setSelectedRoom(null);
        }}
        title={`Complete Checklist - Room ${selectedRoom?.number}`}
      >
        <div className="space-y-4">
          {selectedRoom?.notes && (
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <h4 className="text-sm font-semibold text-amber-900 mb-1">
                Special Instructions
              </h4>
              <p className="text-sm text-amber-800">{selectedRoom.notes}</p>
            </div>
          )}

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-3">
              Cleaning Checklist
            </h4>
            <ul className="space-y-2">
              {selectedRoom?.checklist.map((task) => (
                <li
                  key={task.id}
                  className="flex items-center gap-3 p-2 bg-white rounded-lg"
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleToggleChecklistItem(task.id)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span
                    className={`flex-1 text-sm ${
                      task.completed
                        ? "text-slate-500 line-through"
                        : "text-slate-800"
                    }`}
                  >
                    {task.name}
                  </span>
                  {task.completed && (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                </li>
              ))}
            </ul>
          </div>

          {selectedRoom && (
            <div className="bg-slate-50 p-3 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Progress</span>
                <span className="font-semibold text-slate-800">
                  {selectedRoom.checklist.filter((t) => t.completed).length} /{" "}
                  {selectedRoom.checklist.length}
                </span>
              </div>
              <div className="mt-2 w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${
                      (selectedRoom.checklist.filter((t) => t.completed)
                        .length /
                        selectedRoom.checklist.length) *
                      100
                    }%`,
                  }}
                ></div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => {
                setShowTaskModal(false);
                setSelectedRoom(null);
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmitWork}
              disabled={
                !selectedRoom ||
                selectedRoom.checklist.filter((t) => t.completed).length !==
                  selectedRoom.checklist.length
              }
              className="flex-1"
            >
              Submit Work
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
