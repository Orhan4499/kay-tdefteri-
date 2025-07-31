import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { tr } from "date-fns/locale";
import { Plus, Moon, Sun } from "lucide-react";
import HotelCalendar from "@/components/hotel-calendar";
import BookingModal from "@/components/booking-modal";
import DeleteConfirmationModal from "@/components/delete-confirmation-modal";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Booking } from "@shared/schema";

export default function HotelManagement() {
  const { theme, toggleTheme } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBookings, setSelectedBookings] = useState<Booking[]>([]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  const { data: bookings = [], isLoading, refetch } = useQuery({
    queryKey: ["/api/bookings/range"],
    queryFn: async () => {
      const response = await fetch(`/api/bookings/range?startDate=${format(monthStart, "yyyy-MM-dd")}&endDate=${format(monthEnd, "yyyy-MM-dd")}`);
      if (!response.ok) throw new Error("Rezervasyonlar alınamadı");
      return response.json() as Promise<Booking[]>;
    },
  });

  const room1Bookings = bookings.filter(b => b.roomNumber === 1);
  const room2Bookings = bookings.filter(b => b.roomNumber === 2);

  const handleDateClick = (date: Date, dayBookings: Booking[]) => {
    if (dayBookings.length > 0) {
      setSelectedBookings(dayBookings);
      setIsDeleteModalOpen(true);
    }
  };

  const handleBookingCreated = () => {
    refetch();
    setIsBookingModalOpen(false);
  };

  const handleBookingDeleted = () => {
    refetch();
    setIsDeleteModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-gray-400">Rezervasyonlar yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-slate-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">GA</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900 dark:text-gray-100">Garden Aframe</h1>
                <p className="text-sm text-slate-600 dark:text-gray-400">Otel Rezervasyon Yönetimi</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-600 dark:bg-red-500 rounded"></div>
                <span className="text-sm text-slate-700 dark:text-gray-300">Oda 1</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-600 dark:bg-blue-500 rounded"></div>
                <span className="text-sm text-slate-700 dark:text-gray-300">Oda 2</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="dark:hover:bg-gray-700"
              >
                {theme === "light" ? (
                  <Moon className="w-5 h-5" />
                ) : (
                  <Sun className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Calendar Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-slate-200 dark:border-gray-700 mb-6">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-gray-100">
                {format(currentDate, "MMMM yyyy", { locale: tr })}
              </h2>
              <Button
                onClick={() => setIsBookingModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
              >
                <Plus className="w-5 h-5 mr-2" />
                Rezervasyon Ekle
              </Button>
            </div>
          </div>

          <div className="p-6">
            <HotelCalendar
              currentDate={currentDate}
              onDateChange={setCurrentDate}
              bookings={bookings}
              onDateClick={handleDateClick}
            />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                  <div className="w-6 h-6 bg-red-600 dark:bg-red-500 rounded"></div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-gray-100">Oda 1</h3>
                  <p className="text-sm text-slate-600 dark:text-gray-400">Bu ay {room1Bookings.length} rezervasyon</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <div className="w-6 h-6 bg-blue-600 dark:bg-blue-500 rounded"></div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-gray-100">Oda 2</h3>
                  <p className="text-sm text-slate-600 dark:text-gray-400">Bu ay {room2Bookings.length} rezervasyon</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-gray-100">Toplam Rezervasyon</h3>
                  <p className="text-sm text-slate-600 dark:text-gray-400">{bookings.length} rezervasyon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Modals */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onBookingCreated={handleBookingCreated}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        bookings={selectedBookings}
        onBookingDeleted={handleBookingDeleted}
      />
    </div>
  );
}
