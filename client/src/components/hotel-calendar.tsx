import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  addMonths, 
  subMonths 
} from "date-fns";
import { tr } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Booking } from "@shared/schema";

interface HotelCalendarProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  bookings: Booking[];
  onDateClick: (date: Date, bookings: Booking[]) => void;
}

export default function HotelCalendar({ 
  currentDate, 
  onDateChange, 
  bookings, 
  onDateClick 
}: HotelCalendarProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const turkishDays = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

  const getBookingsForDate = (date: Date): Booking[] => {
    const dateString = format(date, "yyyy-MM-dd");
    return bookings.filter(booking => {
      const checkin = new Date(booking.checkinDate);
      const checkout = new Date(booking.checkoutDate);
      const targetDate = new Date(dateString);
      
      return checkin <= targetDate && checkout >= targetDate;
    });
  };

  const renderCalendarDay = (date: Date) => {
    const dayBookings = getBookingsForDate(date);
    const room1Bookings = dayBookings.filter(b => b.roomNumber === 1);
    const room2Bookings = dayBookings.filter(b => b.roomNumber === 2);
    
    const isCurrentMonth = isSameMonth(date, currentDate);
    const dayNumber = format(date, "d");

    const handleClick = () => {
      if (dayBookings.length > 0) {
        onDateClick(date, dayBookings);
      }
    };

    // No bookings
    if (dayBookings.length === 0) {
      return (
        <div
          key={date.toISOString()}
          className={`h-20 rounded-lg flex items-start justify-between p-2 transition-colors ${
            isCurrentMonth 
              ? "bg-white dark:bg-gray-800 border-2 border-slate-200 dark:border-gray-600 hover:border-slate-300 dark:hover:border-gray-500" 
              : "bg-slate-100 dark:bg-gray-700 opacity-50"
          }`}
        >
          <span className={`text-sm font-medium ${isCurrentMonth ? "text-slate-900 dark:text-gray-100" : "text-slate-500 dark:text-gray-400"}`}>
            {dayNumber}
          </span>
        </div>
      );
    }

    // Both rooms occupied
    if (room1Bookings.length > 0 && room2Bookings.length > 0) {
      return (
        <div
          key={date.toISOString()}
          className="h-20 rounded-lg flex flex-col cursor-pointer"
          onClick={handleClick}
        >
          <div className="h-1/2 bg-red-600 dark:bg-red-500 rounded-t-lg flex items-start justify-between p-1 hover:bg-red-700 dark:hover:bg-red-600 transition-colors">
            <span className="text-xs font-medium text-white">{dayNumber}</span>
            <div className="flex flex-col items-end">
              {room1Bookings.length > 1 && (
                <span className="text-xs font-bold text-white bg-red-800 dark:bg-red-700 rounded-full w-4 h-4 flex items-center justify-center mb-1">
                  {room1Bookings.length}
                </span>
              )}
              {room1Bookings[0]?.checkinTime && (
                <span className="text-xs text-white opacity-75">
                  {room1Bookings[0].checkinTime}
                </span>
              )}
            </div>
          </div>
          <div className="h-1/2 bg-blue-600 dark:bg-blue-500 rounded-b-lg flex items-start justify-between p-1 hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors">
            <div></div>
            <div className="flex flex-col items-end">
              {room2Bookings.length > 1 && (
                <span className="text-xs font-bold text-white bg-blue-800 dark:bg-blue-700 rounded-full w-4 h-4 flex items-center justify-center mb-1">
                  {room2Bookings.length}
                </span>
              )}
              {room2Bookings[0]?.checkinTime && (
                <span className="text-xs text-white opacity-75">
                  {room2Bookings[0].checkinTime}
                </span>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Only room 1 occupied
    if (room1Bookings.length > 0) {
      return (
        <div
          key={date.toISOString()}
          className="h-20 bg-red-600 dark:bg-red-500 rounded-lg flex items-start justify-between p-2 cursor-pointer hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
          onClick={handleClick}
        >
          <span className="text-sm font-medium text-white">{dayNumber}</span>
          <div className="flex flex-col items-end">
            {room1Bookings.length > 1 && (
              <span className="text-xs font-bold text-white bg-red-800 dark:bg-red-700 rounded-full w-5 h-5 flex items-center justify-center mb-1">
                {room1Bookings.length}
              </span>
            )}
            {room1Bookings[0]?.checkinTime && (
              <span className="text-xs text-white opacity-75">
                {room1Bookings[0].checkinTime}
              </span>
            )}
          </div>
        </div>
      );
    }

    // Only room 2 occupied
    return (
      <div
        key={date.toISOString()}
        className="h-20 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-start justify-between p-2 cursor-pointer hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
        onClick={handleClick}
      >
        <span className="text-sm font-medium text-white">{dayNumber}</span>
        <div className="flex flex-col items-end">
          {room2Bookings.length > 1 && (
            <span className="text-xs font-bold text-white bg-blue-800 dark:bg-blue-700 rounded-full w-5 h-5 flex items-center justify-center mb-1">
              {room2Bookings.length}
            </span>
          )}
          {room2Bookings[0]?.checkinTime && (
            <span className="text-xs text-white opacity-75">
              {room2Bookings[0].checkinTime}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Month Navigation */}
      <div className="flex justify-between items-center mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDateChange(subMonths(currentDate, 1))}
          className="dark:hover:bg-gray-700"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-gray-100">
          {format(currentDate, "MMMM yyyy", { locale: tr })}
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDateChange(addMonths(currentDate, 1))}
          className="dark:hover:bg-gray-700"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {turkishDays.map((day) => (
          <div key={day} className="text-center text-sm font-medium text-slate-600 dark:text-gray-400 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map(renderCalendarDay)}
      </div>
    </div>
  );
}