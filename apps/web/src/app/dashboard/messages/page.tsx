'use client';

import { useState, useEffect } from 'react';
import { FiMessageSquare, FiStar, FiCheckSquare } from 'react-icons/fi';
import instance from '@/utils/axiosInstance';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import the CSS for Toastify

type Review = {
  id: number;
  rating: number;
  comment: string;
  reply?: string;
  createdAt: string;
  customer: {
    name: string;
    profileImage?: string;
  };
  property: {
    name: string;
  };
};

export default function ReviewInbox() {
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState('');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      const response = await instance.get('/reviews');
      const result = response.data;
      return result.data;
    } catch (error) {
      console.error('Error fetching property report:', (error as any).message);
      return [];
    }
  };

  const handleReply = async () => {
    if (!selectedReview || !replyText) return;

    try {
      await instance.post(`/reviews/${selectedReview.id}/reply`, {
        reply: replyText,
      });
      setReplyText('');
      toast.success('Your reply has been successfully added!', {
        position: "top-center"
      });
      fetchReviews();
    } catch (error) {
      console.error('Failed to submit reply:', error);
      toast.error('Failed to add your reply. Please try again.');
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

  if (isLoading)
    return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <div className="flex h-screen">
      <ToastContainer position="top-right" autoClose={3000} /> {/* Toast Container */}
      <aside className="w-1/4 bg-gray-100 p-4 border-r">
        <h2 className="text-xl font-semibold mb-4">Reviews</h2>
        <ul className="space-y-2">
          <li className="flex items-center space-x-2 cursor-pointer text-gray-700">
            <FiMessageSquare />
            <span>All Reviews</span>
          </li>
          {/* <li className="flex items-center space-x-2 cursor-pointer text-gray-700">
            <FiCheckSquare />
            <span>Replied</span>
          </li>
          <li className="flex items-center space-x-2 cursor-pointer text-gray-700">
            <FiStar />
            <span>High Ratings</span>
          </li> */}
        </ul>
      </aside>

      <section className="w-1/4 bg-white p-4 border-r overflow-y-auto">
        {reviews?.map((review: Review) => (
          <div
            key={review.id}
            onClick={() => {
              setSelectedReview(review);
              setReplyText(review.reply || ''); // Populate with existing reply
            }}
            className="p-2 mb-2 border rounded-lg cursor-pointer hover:bg-gray-100"
          >
            <div className="flex justify-between">
              <span className="text-sm font-bold">{review.property.name}</span>
              <span className="text-sm bg-blue-500 text-white px-2 rounded">
                {review.rating}/5
              </span>
            </div>
            <p className="text-xs text-gray-500">
              {review.customer.name} • {new Date(review.createdAt).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-600 truncate">{review.comment}</p>
          </div>
        ))}
      </section>

      <section className="w-1/2 bg-gray-50 p-6 overflow-y-auto">
        {selectedReview ? (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold">{selectedReview.property.name}</h2>
              <p className="text-sm text-gray-500">
                From: {selectedReview.customer.name} •{' '}
                {new Date(selectedReview.createdAt).toLocaleString()}
              </p>
              <div className="mt-4 p-4 bg-white rounded-lg">
                <p className="text-gray-700">{selectedReview.comment}</p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-gray-100 rounded-lg">
              <p className="font-medium text-sm">Your Reply:</p>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="w-full p-3 border rounded-lg"
                placeholder={selectedReview.reply ? "Edit your reply..." : "Write your reply..."}
              />
              <button
                onClick={handleReply} // Use the same `handleReply` function
                className="px-4 py-2 bg-blue-500 text-white rounded-lg mt-2"
              >
                {selectedReview.reply ? "Update Reply" : "Reply"}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a review to view details
          </div>
        )}  
      </section>
    </div>
  );
}