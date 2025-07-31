import { useMutation } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Booking } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookings: Booking[];
  onBookingDeleted: () => void;
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  bookings,
  onBookingDeleted,
}: DeleteConfirmationModalProps) {
  const { toast } = useToast();

  const deleteBookingMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/bookings/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "Rezervasyon başarıyla silindi",
      });
      onBookingDeleted();
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Rezervasyon silinirken bir hata oluştu",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (booking: Booking) => {
    deleteBookingMutation.mutate(booking.id);
  };

  const formatTimestamp = (timestamp: string | Date) => {
    const date = new Date(timestamp);
    return format(date, "d MMMM yyyy, HH:mm", { locale: tr });
  };

  if (bookings.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-sm bg-white dark:bg-gray-800 border dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-gray-100">Rezervasyon Sil</h3>
              <p className="text-sm text-slate-600 dark:text-gray-400">Bu işlem geri alınamaz.</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {bookings.length === 1 ? (
            <div>
              <p className="text-slate-700 dark:text-gray-300 mb-4">
                <strong>{bookings[0].customerName} {bookings[0].customerSurname}</strong> adlı müşterinin 
                rezervasyonunu silmek istediğinizden emin misiniz?
              </p>
              <div className="text-sm text-slate-600 dark:text-gray-400 mb-4 space-y-1">
                <p>Oda: {bookings[0].roomNumber}</p>
                <p>Misafir Sayısı: {bookings[0].guestCount}</p>
                <p>Giriş: {bookings[0].checkinDate} {bookings[0].checkinTime || "14:00"}</p>
                <p>Çıkış: {bookings[0].checkoutDate} {bookings[0].checkoutTime || "11:00"}</p>
                {bookings[0].createdAt && (
                  <p className="text-xs text-slate-500 dark:text-gray-500">
                    Kayıt: {formatTimestamp(bookings[0].createdAt)}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div>
              <p className="text-slate-700 dark:text-gray-300 mb-4">
                Bu tarihte {bookings.length} rezervasyon bulunmaktadır. Hangi rezervasyonu silmek istiyorsunuz?
              </p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="border border-slate-200 dark:border-gray-600 rounded-lg p-3 bg-slate-50 dark:bg-gray-700"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-gray-100">
                          {booking.customerName} {booking.customerSurname}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-gray-400">
                          Oda {booking.roomNumber} • {booking.guestCount} misafir
                        </p>
                        <p className="text-xs text-slate-500 dark:text-gray-500">
                          Giriş: {booking.checkinDate} {booking.checkinTime || "14:00"}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-gray-500">
                          Çıkış: {booking.checkoutDate} {booking.checkoutTime || "11:00"}
                        </p>
                        {booking.createdAt && (
                          <p className="text-xs text-slate-500 dark:text-gray-500">
                            Kayıt: {formatTimestamp(booking.createdAt)}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(booking)}
                        disabled={deleteBookingMutation.isPending}
                        className="dark:bg-red-600 dark:hover:bg-red-700"
                      >
                        {deleteBookingMutation.isPending ? "Siliniyor..." : "Sil"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {bookings.length === 1 && (
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                className="flex-1 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700" 
                onClick={onClose}
              >
                İptal
              </Button>
              <Button
                variant="destructive"
                className="flex-1 dark:bg-red-600 dark:hover:bg-red-700"
                onClick={() => handleDelete(bookings[0])}
                disabled={deleteBookingMutation.isPending}
              >
                {deleteBookingMutation.isPending ? "Siliniyor..." : "Sil"}
              </Button>
            </div>
          )}

          {bookings.length > 1 && (
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                onClick={onClose}
                className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                İptal
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}