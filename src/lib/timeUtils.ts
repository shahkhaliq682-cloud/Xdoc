/**
 * Utility functions for handling Asia/Karachi timezone
 */

export const getKarachiTime = () => {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Karachi' }));
};

export const formatKarachiClock = (date: Date) => {
  return date.toLocaleTimeString('en-US', { 
    timeZone: 'Asia/Karachi',
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    hour12: true 
  });
};

export const formatKarachiDate = (date: Date) => {
  return date.toLocaleDateString('en-US', { 
    timeZone: 'Asia/Karachi',
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });
};

export const getKarachiDateStr = (date: Date) => {
  // Returns YYYY-MM-DD in Karachi time
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Karachi',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  };
  const parts = new Intl.DateTimeFormat('en-US', options).formatToParts(date);
  const year = parts.find(p => p.type === 'year')?.value;
  const month = parts.find(p => p.type === 'month')?.value;
  const day = parts.find(p => p.type === 'day')?.value;
  return `${year}-${month}-${day}`;
};

export const getKarachiTimeStr = (date: Date) => {
  return date.toLocaleTimeString('en-US', { 
    timeZone: 'Asia/Karachi',
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
};

export const generateTimeSlots = (startHour = 9, endHour = 21, intervalMinutes = 30) => {
  const slots: string[] = [];
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      const time = new Date();
      time.setHours(hour, minute, 0, 0);
      slots.push(time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));
    }
  }
  return slots;
};

export const parseKarachiDateTime = (dateStr: string, timeStr: string) => {
  // dateStr: YYYY-MM-DD
  // timeStr: HH:MM AM/PM
  const [hStr, mStr] = timeStr.split(':');
  const [min, period] = mStr.split(' ');
  let hours = parseInt(hStr);
  const minutes = parseInt(min);

  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  // Create a string that can be parsed as a Date or use specific components
  // Note: Date.parse in different environments can be tricky with timezones.
  // Best to construct accurately.
  const d = new Date(`${dateStr}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`);
  
  // Shift to Karachi time if the system timezone is different
  // Or better: just treat the numbers as Karachi local time
  return d;
};
