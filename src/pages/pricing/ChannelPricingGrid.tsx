import React, { useState, useMemo } from "react";
import { useHotel } from "../../context/HotelContext";
import { formatCurrency } from "../../utils/formatters";
import {
  DollarSign,
  Info,
  User,
  Calendar,
  Percent,
  TrendingUp,
  RefreshCw,
  Check,
  Copy,
  Save,
  Download,
  Upload,
  Lock,
  Unlock,
} from "lucide-react";

type ChannelTab = "DIRECT" | "WEB" | "OTA" | "TA";
type PricingCurrency = "LKR" | "USD";

// Guest type definitions
const guestTypes = [
  { code: "AO", name: "Adult Only", icon: "👤" },
  { code: "AC", name: "Adult + Child", icon: "👨‍👧" },
];

export const ChannelPricingGrid: React.FC = () => {
  const { state } = useHotel();
  const [activeTab, setActiveTab] = useState<ChannelTab>("DIRECT");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [showComparison, setShowComparison] = useState<boolean>(false);
  const mealPlans =
    state.mealPlans && state.mealPlans.length > 0
      ? state.mealPlans
      : [
          {
            id: "mp-bb",
            name: "Bed & Breakfast",
            code: "BB",
            description: "Breakfast included",
            perPersonRate: 0,
            isActive: true,
          },
          {
            id: "mp-hb",
            name: "Half Board",
            code: "HB",
            description: "Breakfast & Dinner",
            perPersonRate: 0,
            isActive: true,
          },
          {
            id: "mp-fb",
            name: "Full Board",
            code: "FB",
            description: "All meals",
            perPersonRate: 0,
            isActive: true,
          },
          {
            id: "mp-ro",
            name: "Room Only",
            code: "RO",
            description: "No meals",
            perPersonRate: 0,
            isActive: true,
          },
        ];
  // Top currency selection (radio). Renamed UI label to Currency.
  const [campingCurrency, setCampingCurrency] =
    useState<PricingCurrency>("LKR");
  const [percentage, setPercentage] = useState<string>("");
  const [typeValue, setTypeValue] = useState<string>("Percentage");
  const [amount, setAmount] = useState<string>("");
  const [hikeColumn, setHikeColumn] = useState<string>("");
  const [bottomCurrency, setBottomCurrency] = useState<PricingCurrency>("LKR");
  const [enterPercentage, setEnterPercentage] = useState<string>("");
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<null | {
    type: "error" | "success";
    message: string;
  }>(null);

  const currencyCode = bottomCurrency === "LKR" ? "LKR" : "USD";

  // Generate columns 1-8
  const columns = Array.from({ length: 8 }, (_, i) => i + 1);

  // Build pricing grid data from room types combined with meal plans and guest types
  const pricingGridData = useMemo(() => {
    // Show all room type + meal plan + guest type combinations
    return state.roomTypes.flatMap((roomType) =>
      mealPlans.flatMap((mealPlan) =>
        guestTypes.map((guestType) => {
          const basePrice = roomType.basePrice || 0;
          const basePrices = columns.map((col) => {
            const variation = basePrice * (col * 0.02);
            return basePrice + variation;
          });

          return {
            roomTypeId: roomType.id,
            roomTypeName: roomType.name,
            mealPlanCode: mealPlan.code,
            mealPlanName: mealPlan.name,
            guestTypeCode: guestType.code,
            guestTypeName: guestType.name,
            guestTypeIcon: guestType.icon,
            basePrices,
          };
        })
      )
    );
  }, [state.roomTypes, mealPlans, columns]);

  // Calculate final prices with meal plan adjustment and channel modifier
  const calculatePrice = (basePrice: number, mealPlanCode: string): number => {
    let working = basePrice;

    // Add meal plan perRoomRate (preferred) or perPersonRate based on the row's meal plan
    const mealPlan = mealPlans.find((mp) => mp.code === mealPlanCode);
    if (mealPlan) {
      const mealAddon = mealPlan.perRoomRate ?? mealPlan.perPersonRate ?? 0;
      working += mealAddon;
    }

    // Apply user-entered percentage or fixed amount adjustments (preview only)
    if (enterPercentage) {
      const pct = parseFloat(enterPercentage);
      if (!isNaN(pct)) {
        working = working * (1 + pct / 100);
      }
    } else if (percentage) {
      const pctPreset = parseFloat(percentage);
      if (!isNaN(pctPreset)) {
        working = working * (1 + pctPreset / 100);
      }
    }

    if (typeValue === "Amount" && amount) {
      const amt = parseFloat(amount);
      if (!isNaN(amt)) working += amt;
    }

    // Highlighted column hike could conceptually add a small premium (example: +2%)
    // This is illustrative; adjust logic if hike represents something else.
    if (hikeColumn) {
      // For demonstration, do not alter working yet; could integrate if required.
    }

    // Apply channel modifier last
    const channelData = state.channels.find((ch) =>
      ch.name.toUpperCase().includes(activeTab)
    );
    if (channelData && channelData.priceModifierPercent) {
      working = working * (1 + channelData.priceModifierPercent / 100);
    }

    return working;
  };

  const handleApply = () => {
    // Determine if there is any actionable change
    const hasChange = !!(enterPercentage || percentage || amount || hikeColumn);
    if (!hasChange) {
      setFeedback({
        type: "error",
        message: "Please select at least one pricing adjustment to apply.",
      });
      return;
    }

    // Simple validation of numeric custom percentage
    if (enterPercentage) {
      const valueNum = parseFloat(enterPercentage);
      if (isNaN(valueNum)) {
        setFeedback({
          type: "error",
          message: "Custom percentage must be a valid number.",
        });
        return;
      }
      if (valueNum < -100 || valueNum > 100) {
        setFeedback({
          type: "error",
          message: "Custom percentage must be between -100% and 100%.",
        });
        return;
      }
    }

    // Calculate preview impact
    let affectedCombos = displayedPricingGridData.length;
    let affectedColumns = hikeColumn ? 1 : columns.length;
    let totalCells = affectedCombos * affectedColumns;

    setFeedback({
      type: "success",
      message: `✓ Applied to ${totalCells} price ${
        totalCells === 1 ? "cell" : "cells"
      } across ${affectedCombos} ${
        affectedCombos === 1 ? "combination" : "combinations"
      } for ${activeTab} channel.`,
    });
    // TODO: Integrate persistence logic (context update / API call) here.
  };

  const handleCancel = () => {
    setPercentage("");
    setAmount("");
    setHikeColumn("");
    setEnterPercentage("");
    setSelectedDate("");
    setFeedback(null);
  };

  const disableApply =
    !enterPercentage && !percentage && !amount && !hikeColumn;

  const tabButtons: Array<{ key: ChannelTab; label: string }> = [
    { key: "DIRECT", label: "DIRECT" },
    { key: "WEB", label: "WEB" },
    { key: "OTA", label: "OTA" },
    { key: "TA", label: "TA" },
  ];

  // Use the full pricing grid data (no additional filtering needed)
  const displayedPricingGridData = pricingGridData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-stone-50 to-amber-50/20 p-6">
      {/* Modern Header */}
      <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 rounded-2xl shadow-2xl p-8 mb-6 border border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 backdrop-blur-sm p-3 rounded-xl shadow-lg">
                <DollarSign className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white">
                Channel Price Management
              </h1>
            </div>
            <p className="text-slate-300 text-base ml-14">
              Dynamic pricing control with real-time updates across all booking
              channels
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Lock/Unlock Toggle */}
            <button
              type="button"
              onClick={() => setIsLocked(!isLocked)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg ${
                isLocked
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-white text-slate-700 hover:bg-blue-50 border border-blue-200"
              }`}
              title={isLocked ? "Unlock for editing" : "Lock prices"}
            >
              {isLocked ? (
                <Lock className="h-4 w-4" />
              ) : (
                <Unlock className="h-4 w-4" />
              )}
              {isLocked ? "Locked" : "Unlocked"}
            </button>

            {/* Save Button */}
            <button
              type="button"
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg"
              title="Save all changes"
            >
              <Save className="h-4 w-4" />
              Save
            </button>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all backdrop-blur-sm border border-white/10"
                title="Download this video"
              >
                <Download className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all backdrop-blur-sm border border-white/10"
                title="Upload"
              >
                <Upload className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all backdrop-blur-sm border border-white/10"
                title="Copy"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Channel Tabs */}
        <div className="mt-6 flex items-center gap-4 border-t border-slate-600 pt-6">
          <div className="text-sm font-semibold text-slate-300">
            Select Channel:
          </div>
          <div className="flex gap-3">
            {tabButtons.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`relative px-8 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 ${
                  activeTab === tab.key
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/50"
                    : "bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 border border-slate-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200">
        {/* Reservation Type Section */}
        <div className="border-b border-slate-200 px-6 py-5 bg-gradient-to-r from-slate-50 to-stone-50">
          <div className="flex items-center gap-2 text-slate-700">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
              <Calendar className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-base">Reservation Type</span>
          </div>
        </div>

        {/* Filter & Controls Panel */}
        <div className="p-6 bg-gradient-to-br from-slate-50/50 to-stone-50/50 border-b border-slate-200">
          <div className="space-y-4">
            {/* Header with Feedback */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-800 tracking-wide flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-blue-600" />
                <span>Pricing Controls & Filters</span>
              </h3>
              {feedback && (
                <div
                  className={`text-xs px-3 py-2 rounded-lg flex items-center gap-2 shadow-sm ${
                    feedback.type === "error"
                      ? "bg-red-50 text-red-700 border-2 border-red-200"
                      : "bg-emerald-50 text-emerald-700 border-2 border-emerald-200"
                  }`}
                >
                  <Info className="h-4 w-4" />
                  <span className="font-medium">{feedback.message}</span>
                  <button
                    type="button"
                    onClick={() => setFeedback(null)}
                    className="ml-2 text-sm font-bold hover:scale-110 transition-transform"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            {/* First Row - Main Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Date Range - Start */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <Calendar className="h-3.5 w-3.5 text-blue-600" />
                  From Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full rounded-lg border-2 border-slate-300 bg-white px-3 py-2 text-sm shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="Start date"
                />
              </div>

              {/* Date Range - End */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <Calendar className="h-3.5 w-3.5 text-blue-600" />
                  To Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-lg border-2 border-slate-300 bg-white px-3 py-2 text-sm shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="End date"
                />
              </div>

              {/* Currency */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <DollarSign className="h-3.5 w-3.5 text-green-600" />
                  Display Currency
                </label>
                <div className="flex items-center gap-4 rounded-lg border-2 border-slate-300 bg-white px-4 py-2 shadow-sm">
                  <label className="flex cursor-pointer items-center gap-2 hover:opacity-80 transition-opacity">
                    <input
                      type="radio"
                      name="camping"
                      checked={campingCurrency === "LKR"}
                      onChange={() => setCampingCurrency("LKR")}
                      className="h-4 w-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-slate-700">
                      LKR
                    </span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 hover:opacity-80 transition-opacity">
                    <input
                      type="radio"
                      name="camping"
                      checked={campingCurrency === "USD"}
                      onChange={() => setCampingCurrency("USD")}
                      className="h-4 w-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-slate-700">
                      USD
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Second Row - View Options & Quick Actions */}
            <div className="flex items-center justify-between gap-4 py-3 border-t border-blue-100">
              {/* Comparison Toggle */}
              <div className="flex items-center gap-3">
                <label className="text-xs font-semibold text-slate-700">
                  View Options:
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showComparison}
                    onChange={(e) => setShowComparison(e.target.checked)}
                    className="h-4 w-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700">
                    Show Base Price Comparison
                  </span>
                </label>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-700">
                  Quick Actions:
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPercentage("10");
                      setTypeValue("Percentage");
                    }}
                    className="px-3 py-1 text-xs font-medium rounded-md bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                  >
                    +10% Increase
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPercentage("-10");
                      setTypeValue("Percentage");
                    }}
                    className="px-3 py-1 text-xs font-medium rounded-md bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                  >
                    -10% Decrease
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPercentage("20");
                      setTypeValue("Percentage");
                    }}
                    className="px-3 py-1 text-xs font-medium rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                  >
                    +20% Peak
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAmount("500");
                      setTypeValue("Amount");
                    }}
                    className="px-3 py-1 text-xs font-medium rounded-md bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors"
                  >
                    +500 Fixed
                  </button>
                </div>
              </div>
            </div>

            {/* Third Row - Detailed Controls */}
            <div className="space-y-3 pt-3 border-t border-blue-100">
              <label className="text-xs font-semibold text-slate-700">
                Advanced Adjustments:
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {/* Percentage */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                    <Percent className="h-3.5 w-3.5 text-purple-600" />
                    Preset %
                  </label>
                  <select
                    value={percentage}
                    onChange={(e) => setPercentage(e.target.value)}
                    className="w-full rounded-lg border-2 border-slate-300 bg-white px-3 py-2 text-sm shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="">Select %</option>
                    <option value="5">+5%</option>
                    <option value="10">+10%</option>
                    <option value="15">+15%</option>
                    <option value="20">+20%</option>
                    <option value="-5">-5%</option>
                    <option value="-10">-10%</option>
                  </select>
                </div>

                {/* Type */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                    <TrendingUp className="h-3.5 w-3.5 text-blue-700" />
                    Adjustment Type
                  </label>
                  <select
                    value={typeValue}
                    onChange={(e) => setTypeValue(e.target.value)}
                    className="w-full rounded-lg border-2 border-slate-300 bg-white px-3 py-2 text-sm shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="Percentage">Percentage</option>
                    <option value="Amount">Fixed Amount</option>
                  </select>
                </div>

                {/* Amount */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                    <DollarSign className="h-3.5 w-3.5 text-green-600" />
                    Fixed Amount
                  </label>
                  <select
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full rounded-lg border-2 border-slate-300 bg-white px-3 py-2 text-sm shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="">Select Amount</option>
                    <option value="100">+100</option>
                    <option value="500">+500</option>
                    <option value="1000">+1000</option>
                    <option value="2000">+2000</option>
                  </select>
                </div>

                {/* Hike */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                    <TrendingUp className="h-3.5 w-3.5 text-red-600" />
                    Target Column
                  </label>
                  <select
                    value={hikeColumn}
                    onChange={(e) => setHikeColumn(e.target.value)}
                    className="w-full rounded-lg border-2 border-slate-300 bg-white px-3 py-2 text-sm shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="">All Columns</option>
                    {columns.map((col) => (
                      <option key={col} value={col.toString()}>
                        Column {col}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Enter Percentage */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                    <Percent className="h-3.5 w-3.5 text-indigo-600" />
                    Custom %
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={enterPercentage}
                    onChange={(e) => setEnterPercentage(e.target.value)}
                    placeholder="Enter custom %"
                    className="w-full rounded-lg border-2 border-slate-300 bg-white px-3 py-2 text-sm shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-blue-100">
              {/* Summary Info */}
              <div className="flex items-center gap-4 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>
                    <strong>{displayedPricingGridData.length}</strong>{" "}
                    combinations
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span>
                    <strong>{columns.length}</strong> columns
                  </span>
                </div>
                {hikeColumn && (
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-blue-600" />
                    <span>
                      Targeting <strong>Column {hikeColumn}</strong>
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex items-center gap-2 rounded-lg border-2 border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:border-gray-400 transition-all"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reset All
                </button>
                <button
                  type="button"
                  onClick={handleApply}
                  disabled={disableApply}
                  className={`flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold shadow-md transition-all ${
                    disableApply
                      ? "bg-gray-300 text-slate-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:shadow-lg hover:scale-105"
                  }`}
                  title={
                    disableApply
                      ? "Select at least one pricing adjustment"
                      : "Apply pricing changes"
                  }
                >
                  <Check className="h-4 w-4" />
                  Apply Changes
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Channel Statistics Cards */}
        <div className="p-6 border-b border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-5 border border-slate-300 shadow-sm hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Total Combinations
                </span>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                  <User className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="text-4xl font-bold text-slate-900 mb-1">
                {displayedPricingGridData.length}
              </div>
              <div className="text-xs font-medium text-slate-600">
                Room + Meal + Guest combos
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-5 border border-emerald-300 shadow-sm hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">
                  Price Points
                </span>
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="text-4xl font-bold text-emerald-900 mb-1">
                {displayedPricingGridData.length * columns.length}
              </div>
              <div className="text-xs font-medium text-emerald-600">
                Total cells in grid
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 border border-blue-300 shadow-sm hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">
                  Avg Markup
                </span>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                  <Percent className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="text-4xl font-bold text-blue-900 mb-1">
                {state.channels.find((ch) =>
                  ch.name.toUpperCase().includes(activeTab)
                )?.priceModifierPercent || 0}
                %
              </div>
              <div className="text-xs font-medium text-blue-600">
                For {activeTab} channel
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl p-5 border border-indigo-300 shadow-sm hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-indigo-700 uppercase tracking-wide">
                  Date Range
                </span>
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold text-indigo-900 mb-1">
                {selectedDate
                  ? new Date(selectedDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  : "Not set"}
              </div>
              <div className="text-xs text-indigo-600 mt-1">
                {endDate
                  ? `to ${new Date(endDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}`
                  : "Single date"}
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Grid Section */}
        <div className="p-6">
          {/* Channel Price Heading & Controls */}
          <div className="mb-5 flex items-center justify-between bg-gradient-to-r from-slate-50 to-stone-50 px-6 py-4 rounded-xl border border-slate-300 shadow-sm">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
                <span>Pricing Grid</span>
              </h2>
              {isLocked && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-4 py-1.5 text-xs font-bold text-red-700 border-2 border-red-200">
                  <Lock className="h-3.5 w-3.5" />
                  Locked
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 border border-slate-300 shadow-sm">
                <label className="text-xs font-bold text-slate-700">
                  Currency:
                </label>
                <select
                  value={bottomCurrency}
                  onChange={(e) =>
                    setBottomCurrency(e.target.value as PricingCurrency)
                  }
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-bold focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
                >
                  <option value="LKR">🇱🇰 LKR</option>
                  <option value="USD">🇺🇸 USD</option>
                </select>
              </div>
              <div className="flex items-center gap-2 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-xl px-5 py-2.5 shadow-lg">
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-bold">November 2025</span>
              </div>
            </div>
          </div>

          {/* Pricing Grid Table */}
          <div className="overflow-x-auto rounded-xl border-2 border-slate-300 shadow-xl bg-white">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800">
                  <th className="sticky left-0 z-10 border-b-2 border-r-2 border-slate-600 px-5 py-4 text-left text-xs font-bold text-white uppercase tracking-wider bg-slate-800 shadow-lg">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      <span>Stay Type Name</span>
                    </div>
                  </th>
                  {columns.map((col) => (
                    <th
                      key={col}
                      className={`border-b-2 border-r border-slate-600 px-5 py-4 text-center text-xs font-bold text-white uppercase transition-all ${
                        hikeColumn && parseInt(hikeColumn) === col
                          ? "bg-blue-600 scale-105 shadow-lg"
                          : ""
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span>Day {col}</span>
                        {hikeColumn && parseInt(hikeColumn) === col && (
                          <TrendingUp className="h-3 w-3" />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayedPricingGridData.map((row, rowIndex) => {
                  // Find the meal plan for this row
                  const rowMealPlan = mealPlans.find(
                    (mp) => mp.code === row.mealPlanCode
                  );

                  return (
                    <tr
                      key={`${row.roomTypeId}-${row.mealPlanCode}-${row.guestTypeCode}`}
                      className={`transition-all hover:bg-blue-50/30 ${
                        rowIndex % 2 === 0 ? "bg-slate-50/30" : "bg-white"
                      }`}
                    >
                      <td className="sticky left-0 z-10 border-b-2 border-r-2 border-slate-300 bg-gradient-to-r from-slate-100 via-stone-50 to-slate-50 px-5 py-4 text-sm font-bold text-slate-900 shadow-md">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                            <span className="text-base">
                              {row.guestTypeIcon}
                            </span>
                          </div>
                          <div className="flex flex-col flex-1">
                            <span className="font-bold text-slate-900">
                              {row.roomTypeName}
                            </span>
                            <span className="text-xs text-slate-600">
                              {row.guestTypeName}
                            </span>
                          </div>
                          {rowMealPlan && (
                            <span
                              className="ml-auto inline-flex items-center rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 px-3 py-1 text-xs font-bold text-white shadow-md"
                              title={`${rowMealPlan.name}: ${rowMealPlan.description}`}
                            >
                              {rowMealPlan.code}
                            </span>
                          )}
                        </div>
                      </td>
                      {row.basePrices.map((basePrice, colIndex) => {
                        const finalPrice = calculatePrice(
                          basePrice,
                          row.mealPlanCode
                        );
                        const cellKey = `${row.roomTypeId}-${row.guestTypeCode}-${colIndex}`;
                        const isHovered = hoveredCell === cellKey;
                        const isSelectedColumn =
                          hikeColumn && parseInt(hikeColumn) === colIndex + 1;

                        return (
                          <td
                            key={colIndex}
                            onMouseEnter={() => setHoveredCell(cellKey)}
                            onMouseLeave={() => setHoveredCell(null)}
                            className={`border-b border-r border-slate-200 px-4 py-3 text-center text-sm font-semibold transition-all cursor-pointer relative group ${
                              isSelectedColumn
                                ? "bg-blue-200 ring-2 ring-inset ring-blue-500 text-blue-900 shadow-inner"
                                : isHovered
                                ? "bg-blue-100 text-blue-800 scale-105 shadow-md z-10"
                                : "text-slate-700 hover:shadow-sm"
                            }`}
                            title={`Base: ${formatCurrency(
                              basePrice,
                              currencyCode
                            )} → Final: ${formatCurrency(
                              finalPrice,
                              currencyCode
                            )}`}
                          >
                            <div className="flex flex-col items-center gap-0.5">
                              <span
                                className={`${
                                  isSelectedColumn || isHovered
                                    ? "font-bold text-base"
                                    : ""
                                }`}
                              >
                                {formatCurrency(finalPrice, currencyCode)}
                              </span>
                              {(isSelectedColumn || isHovered) &&
                                basePrice !== finalPrice && (
                                  <span className="text-[10px] text-slate-500 line-through">
                                    {formatCurrency(basePrice, currencyCode)}
                                  </span>
                                )}
                              {isHovered && (
                                <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-[9px] text-blue-600 font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                  Click to edit
                                </span>
                              )}
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

          {displayedPricingGridData.length === 0 && (
            <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 py-12 text-center">
              <User className="mx-auto h-12 w-12 text-slate-400 mb-3" />
              <p className="text-sm font-semibold text-slate-600 mb-1">
                No room types available
              </p>
              <p className="text-xs text-slate-500">
                Please add room types first to manage pricing
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
