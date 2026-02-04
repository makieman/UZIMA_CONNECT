"use client";

import { Card } from "@/components/ui/card";
import { useState } from "react";

export default function CalendarView() {
  const [currentDate] = useState(new Date());
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const startingDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  return (
    <Card className="p-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-primary">
          Clinic Calendar - {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <div className="flex gap-2">
          <div className="bg-surface px-4 py-2 rounded border border-border">
            <select className="bg-transparent font-medium outline-none text-sm">
              <option>TB Wing A - Nairobi Central Hospital</option>
              <option>TB Wing B - Mombasa County Hospital</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-3">
        {/* Day headers */}
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center font-bold p-2 text-text-secondary text-xs uppercase tracking-wider">
            {day}
          </div>
        ))}

        {/* Empty cells for days before month starts */}
        {Array.from({ length: startingDay }).map((_, i) => (
          <div key={`empty-${i}`} className="h-24 bg-gray-50/50 rounded-xl border border-dashed border-gray-200"></div>
        ))}

        {/* Calendar days */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const isToday = day === currentDate.getDate();
          const bookingCount = [5, 3, 8, 2, 6][(i + startingDay) % 5] || 0;
          const isFull = bookingCount >= 8;
          const isNearlyFull = bookingCount >= 6 && bookingCount < 8;

          return (
            <div
              key={day}
              className={`h-24 p-3 rounded-xl border-2 transition-all cursor-pointer hover:shadow-lg group relative ${isToday
                ? "bg-warning/10 border-warning"
                : "bg-white border-gray-100 hover:border-warning/50"
                }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-sm font-bold ${isToday ? "text-warning" : "text-gray-700"}`}>
                  {day}
                </span>
                {bookingCount > 0 && (
                  <span className={`w-2 h-2 rounded-full ${isFull ? "bg-error" : isNearlyFull ? "bg-warning" : "bg-success"
                    }`}></span>
                )}
              </div>

              {bookingCount > 0 ? (
                <div className="mt-auto">
                  <p className="text-[10px] font-bold text-text-secondary uppercase">
                    {bookingCount} Referrals
                  </p>
                  <div className="w-full bg-gray-100 h-1 rounded-full mt-1 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isFull ? "bg-error" : isNearlyFull ? "bg-warning" : "bg-success"
                        }`}
                      style={{ width: `${(bookingCount / 10) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ) : (
                <p className="text-[10px] text-gray-300 mt-2 italic">No bookings</p>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 pt-8 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="font-bold text-sm uppercase tracking-wider text-text-secondary mb-4">Legend</h3>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-success rounded-full"></div>
              <span className="text-xs font-medium text-text-secondary">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-warning rounded-full"></div>
              <span className="text-xs font-medium text-text-secondary">Nearly Full</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-error rounded-full"></div>
              <span className="text-xs font-medium text-text-secondary">Fully Booked</span>
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-xl p-4 border border-border">
          <p className="text-xs text-text-secondary mb-2">💡 Hackathon Tip</p>
          <p className="text-sm">Click any day to view detailed schedule for that date.</p>
        </div>
      </div>
    </Card>
  );
}

