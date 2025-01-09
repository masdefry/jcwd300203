"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import instance from "@/utils/axiosInstance";
import { toast } from "react-toastify";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { FaStar } from "react-icons/fa";

import Header from "@/components/home/Header";
import MobileMenu from "@/components/common/header/MobileMenu";
import PopupSignInUp from "@/components/common/PopupSignInUp";
import Footer from "@/components/common/footer/Footer";
import CopyrightFooter from "@/components/common/footer/CopyrightFooter";
import Wrapper from "@/components/layout/Wrapper";

// Validation schema for Formik
const ReviewSchema = Yup.object().shape({
  rating: Yup.number()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot exceed 5")
    .required("Rating is required"),
  feedback: Yup.string().required("Feedback is required"),
  comment: Yup.string().required("Comment is required"),
});

const ReviewForm: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const bookingId = Number(pathname.split("/")[2]); // Extract bookingId from the URL

  // Fetch all orders for the user
  const { data: orders, isLoading: ordersLoading, error: ordersError } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const res = await instance.get("/orders", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      return res.data.data;
    },
  });

  // Fetch existing review for the booking
  const { data: existingReview, isLoading: reviewLoading } = useQuery({
    queryKey: ["review", bookingId],
    queryFn: async () => {
      const res = await instance.get(`/reviews/${bookingId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      return res.data.data; // Existing review data
    },
    enabled: !!bookingId, // Only fetch if bookingId exists
    retry: false, // Avoid retrying if review doesn't exist
  });

  // Mutation for submitting/updating a review
  const { mutate: mutateReview } = useMutation({
    mutationFn: async (reviewData: any) => {
      return await instance.post("/reviews", reviewData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
    },
    onSuccess: () => {
      toast.success("Review submitted successfully!", { position: "top-center" });
      router.push("/review");
    },
    onError: (err) => {
      toast.error("Failed to submit review. Please try again.", { position: "top-center" });
      console.error(err);
    },
  });

  // Star Rating Component
  const StarRating = ({ setFieldValue, rating }: { setFieldValue: any; rating: number }) => {
    const [hover, setHover] = useState(0);

    return (
      <div className="flex space-x-2 mb-4">
        {[...Array(5)].map((_, index) => {
          const starValue = index + 1;
          return (
            <label key={starValue} className="cursor-pointer">
              <FaStar
                size={30}
                color={starValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
                onMouseEnter={() => setHover(starValue)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setFieldValue("rating", starValue)}
              />
            </label>
          );
        })}
      </div>
    );
  };

  // Loading states
  if (ordersLoading || reviewLoading) return <div>Loading...</div>;
  if (ordersError) return <div className="text-red-500">Failed to load orders.</div>;

  // Filter the specific booking by bookingId
  const booking = orders?.find((order: any) => order.id === bookingId);

  if (!booking) return <div className="text-red-500 text-center">Booking not found.</div>;

  return (
    <Wrapper>
      <Header />
      <MobileMenu />
      <PopupSignInUp />

      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="max-w-xl w-full mx-auto p-6 bg-white shadow-lg rounded-lg">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">{booking.property.name}</h1>
            <p className="text-gray-500">
              <strong>Address:</strong> {booking.property.address}
            </p>
          </div>

          {/* Review Form */}
          <h2 className="text-xl font-bold mb-4">
            {existingReview ? "Update Your Review" : "Leave a Review"}
          </h2>
          <Formik
            initialValues={{
              rating: existingReview?.rating || 0,
              feedback: existingReview?.feedback || "",
              comment: existingReview?.comment || "",
            }}
            validationSchema={ReviewSchema}
            onSubmit={(values) => {
              mutateReview({
                bookingId: booking.id,
                propertyId: booking.propertyId,
                comment: values.comment,
                rating: values.rating,
              });
            }}
          >
            {({ isSubmitting, setFieldValue, values }) => (
              <Form>
                {/* Star Rating */}
                <div className="mb-4">
                  <label className="block font-medium mb-2">Rating</label>
                  <StarRating setFieldValue={setFieldValue} rating={values.rating} />
                  <ErrorMessage name="rating" component="div" className="text-red-500" />
                </div>

                {/* Feedback Dropdown */}
                <div className="mb-4">
                  <label className="block font-medium mb-2">Feedback</label>
                  <Field as="select" name="feedback" className="w-full px-3 py-2 border rounded">
                    <option value="">Select feedback</option>
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="average">Average</option>
                    <option value="poor">Poor</option>
                    <option value="unsatisfactory">Unsatisfactory</option>
                  </Field>
                  <ErrorMessage name="feedback" component="div" className="text-red-500" />
                </div>

                {/* Comments Input */}
                <div className="mb-4">
                  <label className="block font-medium mb-2">Comments</label>
                  <Field
                    as="textarea"
                    name="comment"
                    rows={4}
                    className="w-full px-3 py-2 border rounded"
                  />
                  <ErrorMessage name="comment" component="div" className="text-red-500" />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full px-4 py-2 text-white rounded ${
                    isSubmitting ? "bg-gray-500" : "bg-blue-500 hover:bg-blue-600"
                  }`}
                >
                  {isSubmitting ? "Submitting..." : existingReview ? "Update Review" : "Submit Review"}
                </button>
              </Form>
            )}
          </Formik>
        </div>
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
};

export default ReviewForm;
