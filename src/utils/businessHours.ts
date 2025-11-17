/**
 * Service for managing business hours
 */
export type BusinessHours = {
    day: string;
    hours: string;
  };
  
  export default class BusinessHoursService {
    private businessHours: BusinessHours[] = [
      { day: "Monday", hours: "Closed" },
      { day: "Tuesday", hours: "Closed" },
      { day: "Wednesday", hours: "4:00 PM - 10:00 PM" },
      { day: "Thursday", hours: "4:00 PM - 10:00 PM" },
      { day: "Friday", hours: "12:00 PM - 10:00 PM" },
      { day: "Saturday", hours: "12:00 PM - 10:00 PM" },
      { day: "Sunday", hours: "12:00 PM - 6:00 PM" }
    ];
  
    // Enhanced caching system
    private holidayCache: Map<string, boolean> = new Map();
    private messageCache: { message: string; timestamp: number } = { message: '', timestamp: 0 };
    
    // Cache holiday dates for the current year
    private cachedHolidays: { year: number; dates: Set<string> } = { year: 0, dates: new Set() };
    
    constructor() {
      // Initialize the holiday cache for the current year
      this.cacheHolidaysForYear(new Date().getFullYear());
    }
    
    /**
     * Cache all holidays for a specific year to avoid recalculating
     */
    private cacheHolidaysForYear(year: number): void {
      if (this.cachedHolidays.year === year) return; // Already cached
      
      const holidays = new Set<string>();
      
      // Add all holiday dates to the cache
      [
        new Date(year, 0, 1),            // New Year's Day (Jan 1)
        this.getMLKDay(year),            // Martin Luther King Jr. Day
        this.getPresidentsDay(year),     // Presidents' Day
        this.getMemorialDay(year),       // Memorial Day
        new Date(year, 5, 19),           // Juneteenth National Independence Day
        new Date(year, 6, 4),            // Independence Day
        this.getLaborDay(year),          // Labor Day
        this.getColumbusDay(year),       // Columbus Day
        new Date(year, 10, 11),          // Veterans Day
        this.getThanksgivingDay(year),   // Thanksgiving
        new Date(year, 11, 24),          // Christmas Eve
        new Date(year, 11, 25),          // Christmas Day
      ].forEach(date => {
        holidays.add(date.toDateString());
      });
      
      // Update the cache
      this.cachedHolidays = { year, dates: holidays };
    }
  
    getBusinessHours(): BusinessHours[] {
      return this.businessHours;
    }
  
        /**
     * Returns a status message based on current time and business hours
     * Uses caching for better performance
     * All times are calculated in EST timezone
     */
    getHoursMessage(): string {
      // Check if we have a cached message that's less than 1 minute old
      const now = Date.now();
      if (this.messageCache.message && now - this.messageCache.timestamp < 60000) {
        return this.messageCache.message;
      }

      // Get current time in EST timezone using a simpler approach
      const date = new Date();
      const estDate = new Date(date.toLocaleString("en-US", {timeZone: "America/New_York"}));
      
      const day = estDate.getDay();
      const hours = estDate.getHours();
      const minutes = estDate.getMinutes();
      

      
      // Make sure holidays for the current year are cached
      const currentYear = estDate.getFullYear();
      if (this.cachedHolidays.year !== currentYear) {
        this.cacheHolidaysForYear(currentYear);
      }

      // Check if today is a holiday - use the cached holidays for fast lookup
      if (this.isHoliday(estDate)) {
        const message = "Closed for Holiday";
        this.messageCache = { message, timestamp: now };
        return message;
      }

      let message: string;
      const currentTime = hours * 60 + minutes; // Convert to minutes for easier comparison
      

      
      switch (day) {
        case 0: // Sunday: 12:00 PM - 6:00 PM
          if (currentTime >= 720 && currentTime < 1080) { // 12:00 PM to 6:00 PM
            if (currentTime >= 1065) { // Within 15 minutes of closing (5:45 PM)
              message = "Closing soon at 6:00 PM";
            } else {
              message = "Open today until 6:00 PM";
            }
          } else if (currentTime < 720) {
            message = "Opening today at 12:00 PM";
          } else {
            message = "Closed - Opens Wednesday at 4:00 PM";
          }
          break;
          
        case 1: // Monday: Closed
          message = "Closed - Opens Wednesday at 4:00 PM";
          break;
          
        case 2: // Tuesday: Closed
          message = "Closed - Opens Wednesday at 4:00 PM";
          break;
          
        case 3: // Wednesday: 4:00 PM - 10:00 PM
        case 4: // Thursday: 4:00 PM - 10:00 PM
          if (currentTime >= 960 && currentTime < 1320) { // 4:00 PM to 10:00 PM
            if (currentTime >= 1305) { // Within 15 minutes of closing (9:45 PM)
              message = "Closing soon at 10:00 PM";
            } else {
              message = "Open today until 10:00 PM";
            }
          } else if (currentTime < 960) {
            message = "Opening today at 4:00 PM";
          } else {
            const nextDay = day === 3 ? "Thursday" : "Friday";
            const nextTime = day === 3 ? "4:00 PM" : "12:00 PM";
            message = `Closed - Opens ${nextDay} at ${nextTime}`;
          }
          break;
          
        case 5: // Friday: 12:00 PM - 10:00 PM
          if (currentTime >= 720 && currentTime < 1320) { // 12:00 PM to 10:00 PM
            if (currentTime >= 1305) { // Within 15 minutes of closing (9:45 PM)
              message = "Closing soon at 10:00 PM";
            } else {
              message = "Open today until 10:00 PM";
            }
          } else if (currentTime < 720) {
            message = "Opening today at 12:00 PM";
          } else {
            message = "Closed - Opens Saturday at 12:00 PM";
          }
          break;
          
        case 6: // Saturday: 12:00 PM - 10:00 PM
          if (currentTime >= 720 && currentTime < 1320) { // 12:00 PM to 10:00 PM
            if (currentTime >= 1305) { // Within 15 minutes of closing (9:45 PM)
              message = "Closing soon at 10:00 PM";
            } else {
              message = "Open today until 10:00 PM";
            }
          } else if (currentTime < 720) {
            message = "Opening today at 12:00 PM";
          } else {
            message = "Closed - Opens Sunday at 12:00 PM";
          }
          break;
          
        default:
          message = "Hours information unavailable";
          break;
      }
      

      
      // Update cache
      this.messageCache = { message, timestamp: now };
      return message;
    }
    
    /**
     * Checks if a specific date is a holiday - with efficient caching
     */
    private isHoliday(date: Date): boolean {
      const dateString = date.toDateString();
      
      // Check cache first
      if (this.holidayCache.has(dateString)) {
        return this.holidayCache.get(dateString) || false;
      }
      
      // Check against cached holiday dates for the year
      const isHoliday = this.cachedHolidays.dates.has(dateString);
      
      // Update the instance cache
      this.holidayCache.set(dateString, isHoliday);
      
      return isHoliday;
    }
  
    // Helper function to calculate Martin Luther King Jr. Day (3rd Monday in January)
    private getMLKDay(year: number): Date {
      return this.getNthDayOfMonth(year, 0, 1, 3); // 3rd Monday in January
    }
  
    // Helper function to calculate Presidents' Day (3rd Monday in February)
    private getPresidentsDay(year: number): Date {
      return this.getNthDayOfMonth(year, 1, 1, 3); // 3rd Monday in February
    }
  
    // Helper function to calculate Memorial Day (last Monday in May)
    private getMemorialDay(year: number): Date {
      const lastDayOfMay = new Date(year, 5, 0).getDate();
      const date = new Date(year, 4, lastDayOfMay);
      
      // Go backwards to find the last Monday
      while (date.getDay() !== 1) {
        date.setDate(date.getDate() - 1);
      }
      
      return date;
    }
  
    // Helper function to calculate Labor Day (1st Monday in September)
    private getLaborDay(year: number): Date {
      return this.getNthDayOfMonth(year, 8, 1, 1); // 1st Monday in September
    }
  
    // Helper function to calculate Columbus Day (2nd Monday in October)
    private getColumbusDay(year: number): Date {
      return this.getNthDayOfMonth(year, 9, 1, 2); // 2nd Monday in October
    }
  
    // Helper function to calculate Thanksgiving Day (4th Thursday in November)
    private getThanksgivingDay(year: number): Date {
      return this.getNthDayOfMonth(year, 10, 4, 4); // 4th Thursday in November
    }
    
    /**
     * Gets the nth occurrence of a specific day in a month
     * @param year - The year
     * @param month - The month (0-11)
     * @param dayOfWeek - The day of week (0-6, 0 = Sunday)
     * @param n - The occurrence (1st, 2nd, 3rd, etc.)
     * @returns The date object
     */
    private getNthDayOfMonth(year: number, month: number, dayOfWeek: number, n: number): Date {
      // Start with the first day of the month
      const date = new Date(year, month, 1);
      
      // Find the first occurrence of the specified day
      const firstDayOfWeek = date.getDay();
      const daysUntilFirst = (dayOfWeek - firstDayOfWeek + 7) % 7;
      date.setDate(1 + daysUntilFirst);
      
      // Add weeks to get to the nth occurrence
      date.setDate(date.getDate() + (n - 1) * 7);
      
      return date;
    }
  
      /**
   * Get current business status as an object with status and message
   */
  getCurrentStatus(): { isOpen: boolean; message: string } {
    const message = this.getHoursMessage();
    const isOpen = message.startsWith('Open');
    
    return {
      isOpen,
      message
    };
  }

  /**
   * Get enhanced business status with specific states
   */
  getEnhancedStatus(): { 
    status: 'open' | 'opening-soon' | 'closing-soon' | 'closed';
    statusText: string;
    message: string;
    isOpen: boolean;
  } {
    // Get current time in EST timezone
    const date = new Date();
    const estDate = new Date(date.toLocaleString("en-US", {timeZone: "America/New_York"}));
    
    const day = estDate.getDay();
    const hours = estDate.getHours();
    const minutes = estDate.getMinutes();
    const currentTime = hours * 60 + minutes; // Convert to minutes from midnight
    
    // Make sure holidays for the current year are cached
    const currentYear = estDate.getFullYear();
    if (this.cachedHolidays.year !== currentYear) {
      this.cacheHolidaysForYear(currentYear);
    }

    // Check if today is a holiday
    if (this.isHoliday(estDate)) {
      return {
        status: 'closed',
        statusText: 'Closed',
        message: 'Closed for Holiday',
        isOpen: false
      };
    }

    // Get today's business hours
    const todayHours = this.getTodayBusinessHours(day);
    if (!todayHours) {
      return {
        status: 'closed',
        statusText: 'Closed',
        message: this.getHoursMessage(),
        isOpen: false
      };
    }

    const { openTime, closeTime } = todayHours;
    
    // Check if we're currently open
    if (currentTime >= openTime && currentTime < closeTime) {
      // Check if closing soon (within 45 minutes)
      const minutesUntilClose = closeTime - currentTime;
      if (minutesUntilClose <= 45) {
        return {
          status: 'closing-soon',
          statusText: 'Closing Soon',
          message: this.getHoursMessage(),
          isOpen: true
        };
      } else {
        return {
          status: 'open',
          statusText: 'Open Now',
          message: this.getHoursMessage(),
          isOpen: true
        };
      }
    }
    
    // Check if opening soon (within 30 minutes)
    if (currentTime < openTime) {
      const minutesUntilOpen = openTime - currentTime;
      if (minutesUntilOpen <= 30) {
        return {
          status: 'opening-soon',
          statusText: 'Opening Soon',
          message: this.getHoursMessage(),
          isOpen: false
        };
      }
    }
    
    // Otherwise, we're closed
    return {
      status: 'closed',
      statusText: 'Closed',
      message: this.getHoursMessage(),
      isOpen: false
    };
  }

  /**
   * Get today's business hours in minutes from midnight
   */
  private getTodayBusinessHours(day: number): { openTime: number; closeTime: number } | null {
    switch (day) {
      case 0: // Sunday: 12:00 PM - 6:00 PM
        return { openTime: 720, closeTime: 1080 }; // 12:00 PM to 6:00 PM
      case 1: // Monday: Closed
        return null;
      case 2: // Tuesday: Closed
        return null;
      case 3: // Wednesday: 4:00 PM - 10:00 PM
      case 4: // Thursday: 4:00 PM - 10:00 PM
        return { openTime: 960, closeTime: 1320 }; // 4:00 PM to 10:00 PM
      case 5: // Friday: 12:00 PM - 10:00 PM
      case 6: // Saturday: 12:00 PM - 10:00 PM
        return { openTime: 720, closeTime: 1320 }; // 12:00 PM to 10:00 PM
      default:
        return null;
    }
  }
  
      /**
   * Debug method to get current time info in EST
   */
  getDebugInfo(): { currentTime: string; day: string; hours: number; minutes: number; message: string; minutesFromMidnight: number } {
    const date = new Date();
    const estDate = new Date(date.toLocaleString("en-US", {timeZone: "America/New_York"}));
    
    const day = estDate.getDay();
    const hours = estDate.getHours();
    const minutes = estDate.getMinutes();
    const message = this.getHoursMessage();
    
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    return {
      currentTime: `${hours}:${minutes.toString().padStart(2, '0')} EST`,
      day: dayNames[day],
      hours: hours,
      minutes: minutes,
      minutesFromMidnight: hours * 60 + minutes,
      message
    };
  }
  
      /**
   * Get formatted business hours for display
   */
  getFormattedBusinessHours(): BusinessHours[] {
    return this.businessHours;
  }

  /**
   * Clear cache and get fresh message (for debugging)
   */
  getFreshMessage(): string {
    this.messageCache = { message: '', timestamp: 0 };
    return this.getHoursMessage();
  }
  }
  
  // Export a singleton instance
  export const businessHoursService = new BusinessHoursService(); 