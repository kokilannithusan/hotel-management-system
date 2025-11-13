import React, { useState } from "react";
import { useHotel } from "../../context/HotelContext";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Modal } from "../../components/ui/Modal";
import { DatePicker } from "../../components/forms/DatePicker";
import { Calendar, Users, Bed, Plus } from "lucide-react";
import { generateId } from "../../utils/formatters";

export const ReserveRoom: React.FC = () => {
  const { state, dispatch } = useHotel();
  const [formData, setFormData] = useState({
    checkIn: "",
    checkOut: "",
    adults: 1,
    children: 0,
    roomId: "",
    channelId: "",
    customerId: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation and submit logic here
    console.log("Submitting reservation:", formData);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reserve Room</h1>
        <p className="text-gray-600 mt-1">Create a new room reservation</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DatePicker
              label="Check-in Date"
              value={formData.checkIn}
              onChange={(e) =>
                setFormData({ ...formData, checkIn: e.target.value })
              }
              required
            />
            <DatePicker
              label="Check-out Date"
              value={formData.checkOut}
              onChange={(e) =>
                setFormData({ ...formData, checkOut: e.target.value })
              }
              required
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="submit">Create Reservation</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
