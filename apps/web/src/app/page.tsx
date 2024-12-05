'use client'
import React, { useState } from 'react'
import { format } from "date-fns"
import { CalendarIcon, Check, ChevronsUpDown, MapPin, Search, Star, Users } from 'lucide-react'
import Image from "next/image"
import HeroCarousel from '@/components/landing/HeroCarousel'
import { Formik, Form, Field, FormikHelpers } from 'formik'
import * as Yup from 'yup'

const cities = [
  { label: "Bali", value: "bali" },
  { label: "Jakarta", value: "jakarta" },
  { label: "Bandung", value: "bandung" },
  { label: "Yogyakarta", value: "yogyakarta" },
  { label: "Surabaya", value: "surabaya" },
] as const

interface FormValues {
  destination: string;
  dateRange: {
    from: string;
    to: string;
  };
  guests: number;
}

const validationSchema = Yup.object().shape({
  destination: Yup.string().required('Destination is required'),
  dateRange: Yup.object().shape({
    from: Yup.string().required('Check-in date is required'),
    to: Yup.string().required('Check-out date is required')
  }),
  guests: Yup.number()
    .min(1, 'At least 1 guest is required')
    .max(10, 'Maximum 10 guests allowed')
    .required('Number of guests is required')
});

const initialValues: FormValues = {
  destination: '',
  dateRange: {
    from: '',
    to: ''
  },
  guests: 1
};

export default function Home() {
  const [showCityDropdown, setShowCityDropdown] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [showGuestSelect, setShowGuestSelect] = useState(false)

  const handleSubmit = (
    values: FormValues,
    { setSubmitting }: FormikHelpers<FormValues>
  ) => {
    console.log(values)
    setSubmitting(false)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-neutral-100 via-neutral-50 to-white">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Find your perfect stay
                  </h1>
                  <p className="max-w-[600px] text-neutral-500 md:text-xl">
                    Search deals on hotels, homes, and much more...
                  </p>
                </div>

                <Formik
                  initialValues={initialValues}
                  validationSchema={validationSchema}
                  onSubmit={handleSubmit}
                >
                  {({ values, setFieldValue, errors, touched }) => (
                    <Form className="w-full max-w-sm space-y-4">
                     
                      <div className="relative">
                        <button
                          type="button"
                          className={`w-full px-4 py-2 text-left border rounded-md flex justify-between items-center ${
                            errors.destination && touched.destination ? 'border-red-500' : ''
                          }`}
                          onClick={() => setShowCityDropdown(!showCityDropdown)}
                        >
                          {values.destination ? 
                            cities.find(city => city.value === values.destination)?.label : 
                            "Select destination"
                          }
                          <ChevronsUpDown className="h-4 w-4 opacity-50" />
                        </button>
                        
                        {showCityDropdown && (
                          <div className="absolute w-full mt-1 bg-white border rounded-md shadow-lg z-10">
                            <input
                              type="text"
                              placeholder="Search destination..."
                              className="w-full px-4 py-2 border-b"
                            />
                            <div className="max-h-[200px] overflow-auto">
                              {cities.map((city) => (
                                <button
                                  key={city.value}
                                  type="button"
                                  className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center"
                                  onClick={() => {
                                    setFieldValue('destination', city.value)
                                    setShowCityDropdown(false)
                                  }}
                                >
                                  <Check
                                    className={`mr-2 h-4 w-4 ${
                                      city.value === values.destination ? "opacity-100" : "opacity-0"
                                    }`}
                                  />
                                  {city.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        {errors.destination && touched.destination && (
                          <div className="text-red-500 text-sm mt-1">{errors.destination}</div>
                        )}
                      </div>

                      {/* Date Select */}
                      <div className="space-y-2">
                        <div className="relative">
                          <Field
                            name="dateRange.from"
                            type="date"
                            className={`w-full px-4 py-2 border rounded-md ${
                              errors.dateRange?.from && touched.dateRange?.from ? 'border-red-500' : ''
                            }`}
                          />
                          {errors.dateRange?.from && touched.dateRange?.from && (
                            <div className="text-red-500 text-sm mt-1">{errors.dateRange.from}</div>
                          )}
                        </div>
                        <div className="relative">
                          <Field
                            name="dateRange.to"
                            type="date"
                            className={`w-full px-4 py-2 border rounded-md ${
                              errors.dateRange?.to && touched.dateRange?.to ? 'border-red-500' : ''
                            }`}
                          />
                          {errors.dateRange?.to && touched.dateRange?.to && (
                            <div className="text-red-500 text-sm mt-1">{errors.dateRange.to}</div>
                          )}
                        </div>
                      </div>

                      {/* Guest Select */}
                      <div className="relative">
                        <button
                          type="button"
                          className={`w-full px-4 py-2 text-left border rounded-md flex items-center ${
                            errors.guests && touched.guests ? 'border-red-500' : ''
                          }`}
                          onClick={() => setShowGuestSelect(!showGuestSelect)}
                        >
                          <Users className="mr-2 h-4 w-4" />
                          {values.guests} {values.guests === 1 ? "Guest" : "Guests"}
                        </button>
                        
                        {showGuestSelect && (
                          <div className="absolute mt-1 bg-white border rounded-md shadow-lg z-10 p-4 w-56">
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-medium">Guests</h4>
                                <p className="text-sm text-gray-500">Add the number of guests</p>
                              </div>
                              <div className="flex items-center justify-between">
                                <button
                                  type="button"
                                  className="px-3 py-1 border rounded-md"
                                  onClick={() => setFieldValue('guests', Math.max(1, values.guests - 1))}
                                >
                                  -
                                </button>
                                <span>{values.guests}</span>
                                <button
                                  type="button"
                                  className="px-3 py-1 border rounded-md"
                                  onClick={() => setFieldValue('guests', Math.min(10, values.guests + 1))}
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                        {errors.guests && touched.guests && (
                          <div className="text-red-500 text-sm mt-1">{errors.guests}</div>
                        )}
                      </div>

                      <button
                        type="submit"
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center"
                      >
                        <Search className="mr-2 h-4 w-4" />
                        Search
                      </button>
                    </Form>
                  )}
                </Formik>
              </div>

              <div className="flex items-center justify-center">
                <HeroCarousel />
              </div>
            </div>
          </div>
        </section>

        {/* Featured Properties Section - Unchanged */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                Featured Properties
              </h2>
              <p className="mt-4 text-neutral-500 md:text-xl">
                Discover our hand-picked selection of properties
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="border rounded-lg overflow-hidden shadow-sm">
                  <div className="relative h-48">
                    <Image
                      alt="Property"
                      src="/placeholder.svg"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg">Luxury Villa in Bali</h3>
                    <p className="text-neutral-500 mt-1">
                      Beautiful villa with private pool and ocean view
                    </p>
                    <div className="mt-2 flex items-center space-x-1 text-sm">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="font-medium">4.9</span>
                      <span className="text-neutral-500">(128 reviews)</span>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold">$199</span>
                        <span className="text-neutral-500">/night</span>
                      </div>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t px-4 py-6">
        <div className="container mx-auto text-center text-neutral-500">
          <p>© 2024 Travel App. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}