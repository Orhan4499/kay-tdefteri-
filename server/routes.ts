import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBookingSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all bookings
  app.get("/api/bookings", async (req, res) => {
    try {
      const bookings = await storage.getAllBookings();
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Rezervasyonlar alınırken hata oluştu" });
    }
  });

  // Get bookings by date range
  app.get("/api/bookings/range", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Başlangıç ve bitiş tarihleri gerekli" });
      }
      
      const bookings = await storage.getBookingsByDateRange(
        startDate as string, 
        endDate as string
      );
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Rezervasyonlar alınırken hata oluştu" });
    }
  });

  // Get bookings by specific date
  app.get("/api/bookings/date/:date", async (req, res) => {
    try {
      const { date } = req.params;
      const bookings = await storage.getBookingsByDate(date);
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Tarih rezervasyonları alınırken hata oluştu" });
    }
  });

  // Create booking
  app.post("/api/bookings", async (req, res) => {
    try {
      const validatedData = insertBookingSchema.parse(req.body);
      
      // Validate dates
      const checkin = new Date(validatedData.checkinDate);
      const checkout = new Date(validatedData.checkoutDate);
      
      if (checkout <= checkin) {
        return res.status(400).json({ message: "Çıkış tarihi giriş tarihinden sonra olmalıdır" });
      }
      
      const booking = await storage.createBooking(validatedData);
      res.status(201).json(booking);
    } catch (error) {
      res.status(400).json({ message: "Rezervasyon oluşturulurken hata oluştu" });
    }
  });

  // Delete booking
  app.delete("/api/bookings/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteBooking(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Rezervasyon bulunamadı" });
      }
      
      res.json({ message: "Rezervasyon başarıyla silindi" });
    } catch (error) {
      res.status(500).json({ message: "Rezervasyon silinirken hata oluştu" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
