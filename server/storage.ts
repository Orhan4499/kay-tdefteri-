import { type User, type InsertUser, type Booking, type InsertBooking, users, bookings } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Booking operations
  getAllBookings(): Promise<Booking[]>;
  getBookingsByDateRange(startDate: string, endDate: string): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  deleteBooking(id: string): Promise<boolean>;
  getBookingsByDate(date: string): Promise<Booking[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getAllBookings(): Promise<Booking[]> {
    return await db.select().from(bookings);
  }

  async getBookingsByDateRange(startDate: string, endDate: string): Promise<Booking[]> {
    const allBookings = await db.select().from(bookings);
    return allBookings.filter(booking => {
      const checkin = new Date(booking.checkinDate);
      const checkout = new Date(booking.checkoutDate);
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      return (checkin <= end && checkout >= start);
    });
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const [booking] = await db
      .insert(bookings)
      .values({
        ...insertBooking,
        checkinTime: insertBooking.checkinTime || "14:00",
        checkoutTime: insertBooking.checkoutTime || "11:00",
      })
      .returning();
    return booking;
  }

  async deleteBooking(id: string): Promise<boolean> {
    const result = await db.delete(bookings).where(eq(bookings.id, id));
    return result.rowCount > 0;
  }

  async getBookingsByDate(date: string): Promise<Booking[]> {
    const allBookings = await db.select().from(bookings);
    return allBookings.filter(booking => {
      const checkin = new Date(booking.checkinDate);
      const checkout = new Date(booking.checkoutDate);
      const targetDate = new Date(date);
      
      return checkin <= targetDate && checkout >= targetDate;
    });
  }
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private bookings: Map<string, Booking>;

  constructor() {
    this.users = new Map();
    this.bookings = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllBookings(): Promise<Booking[]> {
    return Array.from(this.bookings.values());
  }

  async getBookingsByDateRange(startDate: string, endDate: string): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(booking => {
      const checkin = new Date(booking.checkinDate);
      const checkout = new Date(booking.checkoutDate);
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      return (checkin <= end && checkout >= start);
    });
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = randomUUID();
    const booking: Booking = { 
      ...insertBooking, 
      id,
      checkinTime: insertBooking.checkinTime || "14:00",
      checkoutTime: insertBooking.checkoutTime || "11:00",
      createdAt: new Date()
    };
    this.bookings.set(id, booking);
    return booking;
  }

  async deleteBooking(id: string): Promise<boolean> {
    return this.bookings.delete(id);
  }

  async getBookingsByDate(date: string): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(booking => {
      const checkin = new Date(booking.checkinDate);
      const checkout = new Date(booking.checkoutDate);
      const targetDate = new Date(date);
      
      return checkin <= targetDate && checkout >= targetDate;
    });
  }
}

export const storage = new DatabaseStorage();
