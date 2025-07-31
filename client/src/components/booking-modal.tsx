import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { insertBookingSchema, type InsertBooking } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookingCreated: () => void;
}

const extendedBookingSchema = insertBookingSchema.extend({
  checkinDate: insertBookingSchema.shape.checkinDate.refine(
    (date) => new Date(date) >= new Date(format(new Date(), "yyyy-MM-dd")),
    "Giriş tarihi bugünden önce olamaz"
  ),
  checkoutDate: insertBookingSchema.shape.checkoutDate,
}).refine(
  (data) => new Date(data.checkoutDate) > new Date(data.checkinDate),
  {
    message: "Çıkış tarihi giriş tarihinden sonra olmalıdır",
    path: ["checkoutDate"],
  }
);

export default function BookingModal({ isOpen, onClose, onBookingCreated }: BookingModalProps) {
  const { toast } = useToast();
  
  const form = useForm<InsertBooking>({
    resolver: zodResolver(extendedBookingSchema),
    defaultValues: {
      customerName: "",
      customerSurname: "",
      guestCount: 1,
      roomNumber: 1,
      checkinDate: format(new Date(), "yyyy-MM-dd"),
      checkoutDate: format(new Date(), "yyyy-MM-dd"),
      checkinTime: "14:00",
      checkoutTime: "11:00",
    },
  });

  const createBookingMutation = useMutation({
    mutationFn: async (booking: InsertBooking) => {
      const response = await apiRequest("POST", "/api/bookings", booking);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "Rezervasyon başarıyla oluşturuldu",
      });
      form.reset();
      onBookingCreated();
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Rezervasyon oluşturulurken bir hata oluştu",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertBooking) => {
    createBookingMutation.mutate(data);
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-md bg-white dark:bg-gray-800 border dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center text-slate-900 dark:text-gray-100">
            Yeni Rezervasyon
            <Button variant="ghost" size="sm" onClick={handleClose} className="dark:hover:bg-gray-700">
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="customerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 dark:text-gray-300">Müşteri Adı</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ad girin" 
                      {...field} 
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customerSurname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 dark:text-gray-300">Müşteri Soyadı</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Soyad girin" 
                      {...field} 
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="guestCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 dark:text-gray-300">Misafir Sayısı</FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value.toString()}>
                    <FormControl>
                      <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
                        <SelectValue placeholder="Seçin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                      <SelectItem value="1" className="dark:text-gray-100 dark:hover:bg-gray-600">1 Misafir</SelectItem>
                      <SelectItem value="2" className="dark:text-gray-100 dark:hover:bg-gray-600">2 Misafir</SelectItem>
                      <SelectItem value="3" className="dark:text-gray-100 dark:hover:bg-gray-600">3 Misafir</SelectItem>
                      <SelectItem value="4" className="dark:text-gray-100 dark:hover:bg-gray-600">4 Misafir</SelectItem>
                      <SelectItem value="5" className="dark:text-gray-100 dark:hover:bg-gray-600">5+ Misafir</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="roomNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 dark:text-gray-300">Oda Seçimi</FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value.toString()}>
                    <FormControl>
                      <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
                        <SelectValue placeholder="Oda seçin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                      <SelectItem value="1" className="dark:text-gray-100 dark:hover:bg-gray-600">Oda 1</SelectItem>
                      <SelectItem value="2" className="dark:text-gray-100 dark:hover:bg-gray-600">Oda 2</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="checkinDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 dark:text-gray-300">Giriş Tarihi</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      {...field} 
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="checkoutDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 dark:text-gray-300">Çıkış Tarihi</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      {...field} 
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="checkinTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 dark:text-gray-300">Giriş Saati</FormLabel>
                    <FormControl>
                      <Input 
                        type="time" 
                        {...field} 
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="checkoutTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 dark:text-gray-300">Çıkış Saati</FormLabel>
                    <FormControl>
                      <Input 
                        type="time" 
                        {...field} 
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700" 
                onClick={handleClose}
              >
                İptal
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600" 
                disabled={createBookingMutation.isPending}
              >
                {createBookingMutation.isPending ? "Kaydediliyor..." : "Rezervasyon Kaydet"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}