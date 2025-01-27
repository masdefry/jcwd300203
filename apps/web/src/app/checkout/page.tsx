'use client';

import React from 'react';
import * as Yup from 'yup';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import instance from '@/utils/axiosInstance';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useSearchParams } from 'next/navigation';
import Wrapper from '@/components/layout/Wrapper';
import { Separator } from '@/components/ui/separator';
import Footer from '@/components/common/footer/Footer';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import CopyrightFooter from '@/components/common/footer/CopyrightFooter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

enum BookingStatus {
  WAITING_FOR_PAYMENT,
  WAITING_FOR_CONFIRMATION,
  CONFIRMED,
  CANCELED,
}

const updateBookingStatus = async (
  bookingId: number,
  status: BookingStatus,
) => {
  try {
    const response = await instance.put('/transaction/status/update', {
      bookingId,
      status: BookingStatus[status],
    });
    console.log('Booking status updated:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating booking status:', error);
    throw new Error('Failed to update booking status.');
  }
};

const loadMidtransScript = () => {
  return new Promise<void>((resolve, reject) => {
    if (typeof window.snap !== 'undefined') {
      resolve(); // Script is already loaded
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
    script.setAttribute('data-client-key', 'SB-Mid-client-Qu-bODSBhUtjUUQM');
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error('Failed to load Midtrans Snap script'));
    document.body.appendChild(script);
  });
};

const fetchPropertyId = async (
  roomId: string | null,
): Promise<number | null> => {
  if (!roomId) {
    throw new Error('Room ID is required to fetch Property ID.');
  }

  try {
    const response = await instance.get(`/property/roomType/propertyId`, {
      params: { roomId: parseInt(roomId) },
    });

    return response.data?.data?.propertyId || null;
  } catch (error) {
    console.error('Failed to fetch property ID:', error);
    throw new Error('Failed to fetch property ID.');
  }
};

export default function ReservationPage() {
  const [roomData, setRoomData] = useState<any>(null);
  const [reservationDetails, setReservationDetails] = useState({
    guests: 1,
    rooms: 1,
    paymentMethod: 'credit_card',
    specialRequest: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [totalPrice, setTotalPrice] = useState<number | null>(null);
  const [selectedDaysArray, setSelectedDaysArray] = useState<{ date: string; availableRooms: number }[] | null>(null);
  const [priceBreakdown, setPriceBreakdown] = useState<
    { date: string; price: number }[] | null
  >(null);

  const searchParams = useSearchParams();
  const roomId = searchParams.get('roomId');
  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');
  const router = useRouter(); // Initialize useRouter

  // Calculate the duration of stay
  const calculateDuration = () => {
    if (!checkIn || !checkOut) return null;

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    const duration = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    const formattedCheckIn = checkInDate.toLocaleDateString('en-GB'); // Format as DD/MM/YYYY
    const formattedCheckOut = checkOutDate.toLocaleDateString('en-GB');

    return `${duration} days (${formattedCheckIn} - ${formattedCheckOut})`;
  };

  useEffect(() => {
    const fetchRoomDetails = async () => {
      if (!roomId || !checkIn || !checkOut) {
        setError('Missing required query parameters.');
        return;
      }

      try {
        const response = await instance.get(`/property/roomType/details`, {
          params: {
            roomId,
            checkIn: new Date(checkIn.replace(/\//g, '-')).toISOString(),
            checkOut: new Date(checkOut.replace(/\//g, '-')).toISOString(),
          },
        });

        if (response.data?.data) {
          setRoomData(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch room details:', error);
        setError('Failed to fetch room details. Please try again.');
      }
    };

    fetchRoomDetails();
  }, [roomId, checkIn, checkOut]);

  useEffect(() => {
    if (roomData && roomData.priceComparison && checkIn && checkOut) {
      const calculateTotalPrice = (
        priceComparison: any[],
        checkIn: string,
        checkOut: string
      ) => {
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
  
        // Filter the priceComparison array for the selected dates
        const selectedDays = priceComparison.filter((day: any) => {
          const currentDate = new Date(day.date);
          return currentDate >= checkInDate && currentDate < checkOutDate;
        });
  
        setSelectedDaysArray(selectedDays); // Keep track of selected days
      
        // Calculate the total price based on rooms and days
        const total = selectedDays.reduce((total: number, day: any) => {
          const dayPrice = day.price || 0;
          return total + dayPrice * reservationDetails.rooms; // Multiply by the number of rooms
        }, 0);
  
        // Return the total and breakdown
        return {
          total,
          breakdown: selectedDays.map((day: any) => ({
            date: day.date,
            price: day.price,
          })),
        };
      };
      
      console.log("selected days: ", )

      // Perform the calculation
      const { total, breakdown } = calculateTotalPrice(
        roomData.priceComparison,
        checkIn,
        checkOut
      );
      
      setTotalPrice(total); // Update total price dynamically
      setPriceBreakdown(breakdown); // Update breakdown dynamically
    }
  }, [reservationDetails.rooms, roomData, checkIn, checkOut]); // Ensure rooms is in the dependency array
  
  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  if (!roomData) {
    return (
      <div className="text-center text-gray-500">Loading room details...</div>
    );
  }

  const stayDuration = calculateDuration();

  // console log room data
  console.log("roomData: ",roomData)

  // Formik validation schema
  const validationSchema = Yup.object({
    guests: Yup.number()
      .required('Number of guests is required')
      .integer('Number of guests must be an integer')
      .min(1, 'At least 1 guest is required')
      .max(
        roomData.guestCapacity,
        `Maximum ${roomData.guestCapacity} guests allowed`
      ),
    rooms: Yup.number()
      .required('Number of rooms is required')
      .integer('Number of rooms must be an integer')
      .min(1, 'At least 1 room is required')
      .max(
        roomData.priceComparison[0]?.availableRooms || 0,
        `Only ${roomData.priceComparison[0]?.availableRooms} rooms available`
      ),
  }); 

  return (
    <Wrapper>
      <div className="container mx-auto py-6">
        {/* Room Details Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">{roomData.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-2">
              {roomData.description || "No description available."}
            </p>
            <p>
              <span className="font-semibold">Price: </span>
              {new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
              }).format(roomData.price)}{" "}
              / night
            </p>
            <p>
              <span className="font-semibold">Guest Capacity: </span>
              {roomData.guestCapacity} guests
            </p>
            <p>
              <span className="font-semibold">Available Rooms: </span>
            </p>
            {selectedDaysArray && selectedDaysArray.length > 0 ? (
              <ul className="list-disc ml-6">
                {selectedDaysArray.map((day) => (
                  <li key={day?.date}>
                    {new Date(day?.date).toLocaleDateString('en-GB')}: {day.availableRooms} rooms available
                  </li>
                ))}
              </ul>
            ) : (
              <p>Loading or no data available</p>
            )}
          </CardContent>
        </Card>

        {/* Reservation Details Form */}
        <Formik
          initialValues={{
            guests: 1,
            rooms: 1,
            paymentMethod: "online",
          }}
          validationSchema={validationSchema}
          onSubmit={async (values) => {
            try {
              // fetch propertyId in here
              const propertyId = await fetchPropertyId(roomId);

              console.log("Submitted Reservation Details:", values);
              
              // Send the reservation request to the backend
              const response = await instance.post("/transaction/reserve", {
                roomId,
                propertyId,
                checkInDate: checkIn,
                checkOutDate: checkOut,
                room_qty: values.rooms,
                paymentMethod: values.paymentMethod === "online" ? "GATEWAY" : "MANUAL",
              });
          
              const data = response.data;
              console.log(data);
          
              if (data.error) {
                throw new Error(data.message);
              }
          
              if (values.paymentMethod === "online") {
                try {
                  console.log("Online payment triggered. Token:", data.data.token.token);
          
                  // Ensure Snap script is loaded
                  await loadMidtransScript();
          
                  // Call Snap payment gateway
                  if (typeof window.snap !== "undefined") {
                    window.snap.pay(data.data.token.token, {
                      onSuccess: (result) => {
                        console.log("Payment success:", result);
                        alert("Payment successful! Your reservation is confirmed.");
                        updateBookingStatus(data.data.booking.id, BookingStatus.CONFIRMED);
                        router.push("/user/dashboard"); // redirect to user dashboard
                      },
                      onPending: (result) => {
                        console.log("Waiting for payment:", result);
                        alert("Waiting for your payment!");
                      },
                      onError: (result) => {
                        console.error("Payment error:", result);
                        alert("Payment failed. Please try again.");
                        updateBookingStatus(data.data.booking.id, BookingStatus.CANCELED);
                      },
                      onClose: () => {
                        alert("Payment popup closed. Please complete your payment.");
                        updateBookingStatus(data.data.booking.id, BookingStatus.CANCELED);
                      },
                    });
                  } else {
                    console.error("Midtrans Snap is not loaded.");
                    alert("Payment system is not initialized. Please try again later.");
                    updateBookingStatus(data.data.booking.id, BookingStatus.CANCELED);
                  }
                } catch (error) {
                  console.error("Error initializing payment:", error);
                  alert("Something went wrong during the payment process.");
                  updateBookingStatus(data.data.booking.id, BookingStatus.CANCELED);
                }
              } else {
                console.log("Manual transfer selected. Awaiting confirmation.");
                alert("Your reservation is awaiting confirmation. Please upload your proof of payment.");
                router.push("/user/dashboard");
              }
            } catch (error: any) {
              console.error("Error submitting reservation:", error);
              alert(error.message || "Something went wrong. Please try again.");
            }
          }}
          
        >
          {({ values, setFieldValue }) => (
            <Form>
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-semibold">Reservation Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6">
                    {/* Duration of Stay */}
                    <div>
                      <Label>Stay Duration</Label>
                      <p className="text-lg font-semibold">{stayDuration || "Calculating..."}</p>
                    </div>

                  {/* Guest Count */}
                  <div>
                    <Label htmlFor="guests">Number of Guests</Label>
                    <Field
                      id="guests"
                      type="number"
                      name="guests"
                      step="1" // Restrict to integers
                      className="w-full border rounded p-2"
                      placeholder="Enter number of guests"
                    />
                    <ErrorMessage
                      name="guests"
                      component="p"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  {/* Room Count */}
                  <div>
                    <Label htmlFor="rooms">Number of Rooms</Label>
                    <Field
                      id="rooms"
                      name="rooms"
                      type="number"
                      step="1" // Restrict to integers
                      className="w-full border rounded p-2"
                      placeholder="Enter number of rooms"
                    />
                    <ErrorMessage
                      name="rooms"
                      component="p"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  {/* Price Breakdown */}
                  <div>
                    <Label>Price Breakdown (flexible pricing)</Label>
                    <ul className="list-disc ml-6 text-muted-foreground">
                      {priceBreakdown && priceBreakdown.length > 0 ? (
                        priceBreakdown.map((day) => (
                          <li key={day.date}>
                            {new Date(day.date).toLocaleDateString('en-GB')}:{' '}
                            {new Intl.NumberFormat('id-ID', {
                              style: 'currency',
                              currency: 'IDR',
                            }).format(day.price)}{' '}
                            / night
                          </li>
                        ))
                      ) : (
                        <p>No breakdown available.</p>
                      )}
                    </ul>
                  </div>

                  {/* Total Price */}
                  <div>
                    <Label>Total Price</Label>
                    <p className="text-lg font-semibold">
                      {totalPrice !== null
                        ? new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                          }).format(totalPrice)
                        : 'Calculating...'}
                    </p>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <Label>Payment Method</Label>
                    <RadioGroup
                      value={values.paymentMethod}
                      onValueChange={(value) =>
                        setFieldValue('paymentMethod', value)
                      }
                    >
                      <div className="flex items-center space-x-4">
                        <RadioGroupItem value="online" id="online" />
                        <Label htmlFor="online">Online Payment</Label>
                      </div>
                      <div className="flex items-center space-x-4">
                        <RadioGroupItem value="manual" id="manual" />
                        <Label htmlFor="manual">Manual Transfer</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Separator */}
                  <Separator />

                  {/* Confirm Reservation */}
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    type="submit"
                  >
                    Confirm Reservation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Form>
        )}
      </Formik>
    </div>

    {/* Footer */}
    <section className="footer_one">
      <div className="container">
        <div className="row">
          <Footer />
        </div>
      </div>
    </section>

    {/* Footer Bottom Area */}
    <section className="footer_middle_area pt40 pb40">
      <div className="container">
        <CopyrightFooter />
      </div>
    </section>
    </Wrapper>
  );
}
