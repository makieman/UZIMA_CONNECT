"use client";

import { useState, useEffect } from "react";
import NotificationBell from "../notifications/notification-bell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BookingsList from "./bookings-list";
import BookingDetails from "./booking-details";
import { checkAndSendReminders } from "../../lib/reminders";

interface PatientDashboardProps {
  user: any;
  token: string;
  onLogout: () => void;
}

export default function PatientDashboard({
  user,
  token,
  onLogout,
}: PatientDashboardProps) {
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  useEffect(() => {
    // Check reminders immediately on load
    checkAndSendReminders(user?.id);

    // Set up interval to check reminders every minute
    const reminderInterval = setInterval(() => {
      checkAndSendReminders(user?.id);
    }, 60000); // Check every minute

    return () => clearInterval(reminderInterval);
  }, [user?.id]);

  return (
    <div className="bg-surface">
      {/* Header */}
      <header className="bg-accent text-white py-6 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Uzimacare - Patient Portal</h1>
            <p className="text-teal-100">Welcome, {user?.fullName}</p>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell userId={user?.id} />
            <Button
              onClick={onLogout}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Section */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-accent mb-2">
              Upcoming Bookings
            </h3>
            <p className="text-4xl font-bold">2</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-accent mb-2">
              Pending Payment
            </h3>
            <p className="text-4xl font-bold">1</p>
          </Card>
        </div>

        {/* Bookings Section */}
        {!selectedBooking ? (
          <BookingsList onSelectBooking={setSelectedBooking} />
        ) : (
          <BookingDetails
            booking={selectedBooking}
            onBack={() => setSelectedBooking(null)}
          />
        )}
      </main>
    </div>
  );
}
