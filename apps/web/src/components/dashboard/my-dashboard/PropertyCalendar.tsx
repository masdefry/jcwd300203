'use client';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useEffect, useState } from 'react';
import instance from '@/utils/axiosInstance';

const PropertyCalendar = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchCalendarData = async () => {
      try {
        const response = await instance.get('/report/property-report');
        const result = response.data;

        if (result.success) {
          const formattedEvents = result.data.map((item: any) => ({
            title: item.title,
            start: item.start,
            end: item.end,
            color: item.color, // Color based on availability or booking
          }));

          setEvents(formattedEvents);
        }
      } catch (error) {
        console.error('Error fetching property report:', error);
      }
    };

    fetchCalendarData();
  }, []);

  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      headerToolbar={{
        start: 'prev,next today',
        center: 'title',
        end: 'dayGridMonth,timeGridWeek,timeGridDay',
      }}
      events={events}
      height="500px"
    />
  );
};

export default PropertyCalendar;