"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import instance from "@/utils/axiosInstance";
import { toast } from "react-toastify";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { FaStar } from "react-icons/fa";
import Wrapper from "@/components/layout/Wrapper";
import Footer from "@/components/common/footer/Footer";
import CopyrightFooter from "@/components/common/footer/CopyrightFooter";

// Validation schema
const ReviewSchema = Yup.object().shape({
  rating: Yup.number().required("Rating is required").min(1).max(5),
  feedback: Yup.string().required("Feedback is required"),
  comment: Yup.string().required("Comment is required"),
});

const ReviewForm: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const bookingId = Number(pathname.split("/")[3]);

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const res = await instance.get("/orders", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      return res.data.data;
    },
  });

  const { data: existingReview } = useQuery({
    queryKey: ["review", bookingId],
    queryFn: async () => {
      const res = await instance.get(`/reviews/${bookingId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      return res.data.data;
    },
    enabled: !!bookingId,
  });

  const { mutate: submitReview } = useMutation({
    mutationFn: async (reviewData: any) => {
      return await instance.post("/reviews", reviewData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
    },
    onSuccess: () => {
      toast.success("Review submitted successfully!");
      router.push("/review");
    },
    onError: () => {
      toast.error("Failed to submit review.");
    },
  });

  if (ordersLoading) return <div>Loading...</div>;

  const booking = orders?.find((order: any) => order.id === bookingId);

  if (!booking) return <div>Booking not found.</div>;

  const StarRating = ({ setFieldValue, rating }: any) => {
    const [hover, setHover] = useState(0);

    return (
      <div className="flex">
        {[...Array(5)].map((_, index) => {
          const starValue = index + 1;
          return (
            <label key={starValue}>
              <FaStar
                size={30}
                color={starValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
                className="cursor-pointer"
                onClick={() => setFieldValue("rating", starValue)}
                onMouseEnter={() => setHover(starValue)}
                onMouseLeave={() => setHover(0)}
              />
            </label>
          );
        })}
      </div>
    );
  };

  return (
    <Wrapper>
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-lg bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">{booking.property.name}</h1>
            <p className="text-gray-500">{booking.property.address}</p>
          </div>
          <Formik
            initialValues={{
              rating: existingReview?.rating || 0,
              feedback: existingReview?.feedback || "",
              comment: existingReview?.comment || "",
            }}
            validationSchema={ReviewSchema}
            onSubmit={(values) => {
              submitReview({
                bookingId,
                propertyId: booking.propertyId,
                ...values,
              });
            }}
          >
            {({ values, setFieldValue, isSubmitting }) => (
              <Form>
                <div className="mb-4">
                  <label className="block font-medium mb-2">Rating</label>
                  <StarRating setFieldValue={setFieldValue} rating={values.rating} />
                  <ErrorMessage name="rating" component="div" className="text-red-500" />
                </div>
                <div className="mb-4">
                  <label className="block font-medium mb-2">Feedback</label>
                  <Field
                    as="select"
                    name="feedback"
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="">Select Feedback</option>
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="average">Average</option>
                    <option value="poor">Poor</option>
                    <option value="unsatisfactory">Unsatisfactory</option>
                  </Field>
                  <ErrorMessage name="feedback" component="div" className="text-red-500" />
                </div>
                <div className="mb-4">
                  <label className="block font-medium mb-2">Comments</label>
                  <Field
                    as="textarea"
                    name="comment"
                    rows="4"
                    className="w-full border rounded px-3 py-2"
                  />
                  <ErrorMessage name="comment" component="div" className="text-red-500" />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full bg-blue-500 text-white py-2 rounded ${
                    isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"
                  }`}
                >
                  {isSubmitting ? "Submitting..." : existingReview ? "Update Review" : "Submit Review"}
                </button>
              </Form>
            )}
          </Formik>
        </div>
      </div>
      <Footer />
      <CopyrightFooter />
    </Wrapper>
  );
};

export default ReviewForm;