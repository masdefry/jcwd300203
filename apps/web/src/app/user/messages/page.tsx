'use client';

import { useState, useEffect } from 'react';
import { FiMessageSquare } from 'react-icons/fi';
import instance from '@/utils/axiosInstance';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Footer from '@/components/common/footer/Footer';
import CopyrightFooter from '@/components/common/footer/CopyrightFooter';

type Review = {
  id: number;
  rating: number;
  comment: string;
  reply?: string;
  createdAt: string;
  updatedAt: string;
  property: {
    name: string;
  };
  customerId: number;
  propertyId: number;
};

export default function ReviewInbox() {
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState('');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      const response = await instance.get('/reviews/customer/reviews');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return [];
    }
  };

  const handleUpdateReview = async () => {
    if (!selectedReview || !replyText) return;

    try {
      await instance.post(`/reviews`, {
        usersId: selectedReview.customerId,
        propertyId: selectedReview.propertyId,
        comment: replyText,
        rating: selectedReview.rating,
      });

      toast.success('Your review has been successfully updated!');
      const updatedReviews = await fetchReviews();
      setReviews(updatedReviews);
      setSelectedReview(null);
      setReplyText('');
    } catch (error) {
      console.error('Failed to update review:', error);
      toast.error('Failed to update your review. Please try again.');
    }
  };

  useEffect(() => {
    const getReviews = async () => {
      setIsLoading(true);
      const data = await fetchReviews();
      setReviews(data);
      setIsLoading(false);
    };

    getReviews();
  }, []);

  if (isLoading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <>
      <div className="flex flex-col lg:flex-row h-screen">
        <ToastContainer position="top-center" autoClose={3000} />
        
        {/* Sidebar */}
        <aside className="w-full lg:w-1/4 bg-gray-100 p-4 border-b lg:border-b-0 lg:border-r">
          <h2 className="text-xl font-semibold mb-4">Reviews</h2>
          <ul className="space-y-2">
            <li className="flex items-center space-x-2 cursor-pointer text-gray-700">
              <FiMessageSquare />
              <span>All Reviews</span>
            </li>
          </ul>
          <div className="mt-4 space-y-4 overflow-y-auto max-h-[calc(100vh-150px)]">
            {reviews.map((review) => (
              <div
                key={review.id}
                onClick={() => {
                  setSelectedReview(review);
                  setReplyText(review.comment || '');
                }}
                className="p-2 border rounded-lg cursor-pointer hover:bg-gray-200"
              >
                <div className="flex justify-between">
                  <span className="text-sm font-bold">{review.property.name}</span>
                  <span className="text-sm bg-blue-500 text-white px-2 rounded">
                    {review.rating}/5
                  </span>
                </div>
                <p className="text-sm text-gray-600 truncate">{review.comment}</p>
              </div>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <section className="w-full lg:w-3/4 bg-white p-6 overflow-y-auto">
          {selectedReview ? (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold">{selectedReview.property.name}</h2>
                <p className="text-sm text-gray-500">
                  Last updated: {new Date(selectedReview.updatedAt).toLocaleString()}
                </p>
                <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                  <p className="font-medium text-sm">Your Review:</p>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="w-full p-3 border rounded-lg"
                    placeholder="Edit your review..."
                  />
                </div>
              </div>

              {selectedReview.reply && (
                <div className="mt-4 p-4 bg-white rounded-lg border">
                  <p className="font-medium text-sm">Reply from Tenant:</p>
                  <p className="text-gray-700">{selectedReview.reply}</p>
                </div>
              )}

              <button
                onClick={handleUpdateReview}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg mt-2"
              >
                Update Review
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select a review to view details
            </div>
          )}
        </section>
      </div>

      {/* Footer */}
      <section className="footer_one">
        <div className="container">
          <div className="row">
            <Footer />
          </div>
        </div>
      </section>
      <section className="footer_middle_area pt40 pb40">
        <div className="container">
          <CopyrightFooter />
        </div>
      </section>
    </>
  );
}
