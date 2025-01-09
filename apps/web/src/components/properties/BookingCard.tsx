import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { addDays, differenceInDays, format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Users } from 'lucide-react';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@radix-ui/react-popover';
import { startOfDay } from 'date-fns';
import { isBefore } from 'date-fns';

interface BookingCardProps {
  checkIn: Date | null;    // Updated
    checkOut: Date | null;   // Updated
  guests: number;
  rooms: number;
  priceComparison?: Array<{
    date: string;
    price: string;
    availableRooms?: number;
  }>;
  onSearch: (params: {
    checkIn: Date | null;
    checkOut: Date | null;
    guests: number;
    rooms: number;
  }) => void;
}

export default function BookingCard({
  checkIn,
  checkOut,
  guests,
  rooms,
  priceComparison = [],
  onSearch,
}: BookingCardProps) {
  const [startDate, setStartDate] = useState<Date>(checkIn!);
  const [endDate, setEndDate] = useState<Date>(checkOut!);
  const [guestCount, setGuestCount] = useState(guests);
  const [roomCount, setRoomCount] = useState(rooms);
  const [showCalendar, setShowCalendar] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkIfMobile();

    window.addEventListener('resize', checkIfMobile);

    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  console.log('Price comparison data:', priceComparison);

  const handleSearch = () => {
    onSearch({
      checkIn: startDate,
      checkOut: endDate,
      guests: guestCount,
      rooms: roomCount,
    });
    setShowCalendar(false);
  };

  const renderDayContents = (dayOfMonth: number, date: Date) => {
    if (!date) return dayOfMonth;

    const priceData = priceComparison?.find((item) => {
      const itemDate = new Date(item.date);
      return (
        itemDate.getDate() === date.getDate() &&
        itemDate.getMonth() === date.getMonth() &&
        itemDate.getFullYear() === date.getFullYear()
      );
    });

    const today = startOfDay(new Date());
    const isBeforeToday = isBefore(date, today);

    return (
      <div className="flex flex-col items-center justify-center py-1">
        <div className={`mb-1 ${isBeforeToday ? 'text-gray-300' : ''}`}>
          {dayOfMonth}
        </div>
        {priceData && (
          <div
            className={`text-xs ${isBeforeToday ? 'text-gray-300' : 'text-gray-500 selected-price'}`}
          >
            {(parseInt(priceData.price) / 1000000).toFixed(1)}M
          </div>
        )}
      </div>
    );
  };

  if (showCalendar) {
    return (
      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl">Select dates</h3>
            <Button variant="ghost" onClick={() => setShowCalendar(false)}>
              Done
            </Button>
          </div>

          <div className="w-full overflow-hidden">
            <DatePicker
              selected={startDate}
              onChange={(dates: [Date | null, Date | null]) => {
                const [start, end] = dates;

                if (start) setStartDate(start);
                if (end) setEndDate(end);
                if (!end && endDate) setEndDate(startDate); // Instead of null, set it to startDate
              }}
              startDate={startDate}
              endDate={endDate}
              selectsRange
              inline
              monthsShown={isMobile ? 1 : 2}
              minDate={new Date()}
              renderDayContents={renderDayContents}
              calendarClassName="w-full"
              shouldCloseOnSelect={false}
            />
          </div>

          <div className="text-center text-gray-600">
            <div className="text-sm">
              Approximate prices in IDR for a 1-night stay
            </div>
            {startDate && endDate && (
              <div className="font-medium mt-2">
                {format(startDate, 'EEE d MMM')} -{' '}
                {format(endDate, 'EEE d MMM')} (
                {differenceInDays(endDate, startDate)}-night stay)
              </div>
            )}
          </div>
        </div>

        <style jsx global>{`
          .react-datepicker {
            width: 100%;
            border: none;
            font-family: inherit;
          }
          .react-datepicker__month-container {
            width: 100%;
            float: none;
          }
          .react-datepicker__header {
            background: white;
            border-bottom: none;
            padding: 0;
          }
          .react-datepicker__current-month {
            font-size: 1.5rem;
            font-weight: 500;
            padding: 1rem 0;
          }
          .react-datepicker__day-names {
            margin: 0;
            padding: 0.5rem 0;
          }
          .react-datepicker__day-name {
            color: #6b7280;
            width: 2.5rem;
            line-height: 2rem;
            margin: 0.2rem;
            font-weight: normal;
          }
          .react-datepicker__month {
            margin: 0;
            padding: 0;
          }
          .react-datepicker__day {
            width: 2.5rem;
            margin: 0.2rem;
            padding: 0.3rem 0;
            border-radius: 0.5rem;
            height: auto;
          }
          .react-datepicker__day:hover:not(
              .react-datepicker__day--disabled
            ):not(.react-datepicker__day--selected):not(
              .react-datepicker__day--in-range
            ) {
            background-color: #f3f4f6;
          }
          .react-datepicker__day--selected,
          .react-datepicker__day--in-range {
            background-color: #ff7b7b !important;
            color: white !important;
          }
          .react-datepicker__day--selected .selected-price,
          .react-datepicker__day--in-range .selected-price {
            color: white !important;
          }
          .react-datepicker__day--in-selecting-range:not(
              .react-datepicker__day--in-range
            ) {
            background-color: rgba(255, 123, 123, 0.8) !important;
            color: white !important;
          }
          .react-datepicker__day--in-selecting-range:not(
              .react-datepicker__day--in-range
            )
            .selected-price {
            color: white !important;
          }
          .react-datepicker__day--disabled {
            color: #d1d5db !important;
            cursor: not-allowed;
          }
          .react-datepicker__day--disabled:hover {
            background-color: transparent !important;
          }
          .react-datepicker__navigation {
            top: 1.5rem;
          }
          .react-datepicker__navigation--previous {
            left: 1.5rem;
          }
          .react-datepicker__navigation--next {
            right: 1.5rem;
          }
          .react-datepicker__day--outside-month {
            visibility: hidden;
          }

          @media (max-width: 640px) {
            .react-datepicker__month-container {
              width: 100%;
            }
            .react-datepicker__day,
            .react-datepicker__day-name {
              width: calc((100% - 2.8rem) / 7);
              margin: 0.2rem;
            }
          }
        `}</style>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-4">
      {/* Compact Date Selection */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-sm text-gray-600">Check-in</label>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => setShowCalendar(true)}
          >
            <Calendar className="mr-2 h-4 w-4" />
            {format(startDate, 'MMM d, yyyy')}
          </Button>
        </div>
        <div>
          <label className="text-sm text-gray-600">Check-out</label>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => setShowCalendar(true)}
          >
            <Calendar className="mr-2 h-4 w-4" />
            {format(endDate, 'MMM d, yyyy')}
          </Button>
        </div>
      </div>

      {/* Guest & Room Selection */}
      <div>
        <label className="text-sm text-gray-600">Guests & Rooms</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start">
              <Users className="mr-2 h-4 w-4" />
              {guestCount} guests, {roomCount} room{roomCount > 1 ? 's' : ''}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Guests</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                  >
                    -
                  </Button>
                  <span>{guestCount}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setGuestCount(guestCount + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Rooms</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setRoomCount(Math.max(1, roomCount - 1))}
                  >
                    -
                  </Button>
                  <span>{roomCount}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setRoomCount(roomCount + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Stay Duration Info */}
      <div className="text-sm text-gray-600 text-center">
        {differenceInDays(endDate, startDate)} nights
      </div>

      {/* Search Button */}
      <Button
        className="w-full bg-[#f15b5b] hover:bg-[#e54949] text-white"
        onClick={handleSearch}
      >
        Check availability
      </Button>
    </Card>
  );
}
