import { EventInput } from '@fullcalendar/core';
import uniqueId from 'lodash/uniqueId';
import instance from '@/utils/axiosInstance';

export const fetchPropertyReport = async (): Promise<EventInput[]> => {
  try {
    const response = await instance.get('/report/property-report');
    const result = response.data;

    if (result.success) {
      // Transform API data into FullCalendar-compatible EventInput format
      return result.data.map((item: any) => ({
        id: uniqueId(),
        title: item.title,
        start: item.start,
        end: item.end,
        color: item.color // Use color for booking status
      }));
    } else {
      console.error('Failed to fetch property report:', result.message);
      return [];
    }
  } catch (error) {
    console.error('Error fetching property report:', error);
    return [];
  }
};