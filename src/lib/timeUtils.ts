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
