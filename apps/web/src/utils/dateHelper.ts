export const getDefaultDates = () => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    return {
      checkIn: today,
      checkOut: tomorrow
    };
  };