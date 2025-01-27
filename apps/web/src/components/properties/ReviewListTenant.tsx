import { Star } from 'lucide-react';
import Image from 'next/image';

interface Review {
  id: string | number;
  rating: number;
  comment: string;
  createdAt: string;
  customer: {
    name: string;
    profileImage?: string;
  };
  reply?: string;
}

interface ReviewsListProps {
  reviews: Review[];
}

export function ReviewsList({ reviews }: ReviewsListProps) {
  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating
            ? 'fill-yellow-400 text-yellow-400'
            : 'fill-gray-200 text-gray-200'
        }`}
      />
    ));
  };

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="text-4xl font-bold">
          {averageRating > 0 ? averageRating.toFixed(1) : 'N/A'}
        </div>
        <div>
          <div className="flex mb-1">{renderStars(Math.round(averageRating))}</div>
          <p className="text-sm text-gray-600">
            Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="border rounded-lg p-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 relative rounded-full overflow-hidden bg-gray-100">
                {review.customer.profileImage ? (
                  <Image
                    src={`http://localhost:4700/images/${review.customer.profileImage}`}
                    alt={review.customer.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {review.customer.name[0]}
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-medium">{review.customer.name}</h4>
                  <div className="flex">{renderStars(review.rating)}</div>
                </div>
                <p className="text-sm text-gray-500 mb-2">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
                <p className="text-gray-700">{review.comment}</p>
                {review.reply && (
                  <div className="mt-3 pl-4 border-l-2 border-gray-200">
                    <p className="text-sm text-gray-600">Your reply:</p>
                    <p className="text-gray-700">{review.reply}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}