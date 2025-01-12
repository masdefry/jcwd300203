import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import { DateSelectArg, EventClickArg, EventContentArg, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import PageContent from '@/components/PageContent';
import { fetchPropertyReport } from './event-utils';

const Calendar = () => {
  // const [editable, setEditable] = React.useState(false);
  // const handleDateSelect = (selectInfo: DateSelectArg) => {
  //   console.log(selectInfo);
  //   setEditable(true);
  // };

  // const handleEventClick = (clickInfo: EventClickArg) => {
  //   console.log(clickInfo);
  //   setEditable(true);
  // };

  const [events, setEvents] = useState<EventInput[]>([]);

  useEffect(() => {
    const initializeEvents = async () => {
      const fetchedEvents = await fetchPropertyReport();

      // Sort events to prioritize "Booked" events
      const sortedEvents = fetchedEvents.sort((a: any, b: any) => {
        // Prioritize "Booked" events over "Available" events
        if (a.title.startsWith("Booked") && !b.title.startsWith("Booked")) {
          return -1;
        }
        if (!a.title.startsWith("Booked") && b.title.startsWith("Booked")) {
          return 1;
        }
        // If both are "Booked" or both are "Available," sort alphabetically by title
        return a.title.localeCompare(b.title);
      }); 

      console.log("sortedEvents: ", sortedEvents)

      setEvents(sortedEvents);
    };

    initializeEvents();
  }, []);

  return (
    <PageContent className="calendar-app">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        initialView="dayGridMonth"
        weekends
        editable
        selectable
        selectMirror
        dayMaxEvents
        nextDayThreshold={'09:00:00'}
        events={events}
        // select={handleDateSelect}
        // eventContent={renderEventContent} // custom render function
        // eventClick={handleEventClick}
      />
      {/* <EventModal
        open={editable}
        onClose={() => setEditable(false)}
        onAddEvent={() => {
          setEditable(false);
        }}
      /> */}
    </PageContent>
  );
};

// function renderEventContent(eventContent: EventContentArg) {
//   const { timeText, event } = eventContent;
//   return (
//     <>
//       {timeText && (
//         <>
//           <div className="fc-daygrid-event-dot"></div>
//           <div className="fc-event-time">{eventContent.timeText}</div>
//         </>
//       )}
//       <div className="fc-event-title">{event.title}</div>
//     </>
//   );
// }

export default Calendar;
