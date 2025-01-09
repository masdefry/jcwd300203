import Image from "next/image";

interface ReviewsListProps {
  reviews: Array<{
    id: string | number;
    rating: number;
    comment: string;
    createdAt: string | Date;
    customer: {
      name: string;
      profileImage?: string;
    };
  }>;
}

export default function ReviewsList({ reviews }: ReviewsListProps) {
  // Calculate average rating, avoid division by zero
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
      : 0;

  return (
    <div className="space-y-8">
      {/* Reviews Summary */}
      <div className="bg-white shadow-md p-6 rounded-lg">
        <div className="flex items-center gap-6">
          <div className="text-5xl font-bold text-[#f15b5b] hover:text-[#e54949]">
            {reviews.length > 0 ? averageRating.toFixed(1) : "N/A"}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Overall Rating</h2>
            <p className="text-sm text-gray-500">
              Based on {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
            </p>
          </div>
        </div>
      </div>

      {/* No Reviews Fallback */}
      {reviews.length === 0 ? (
        <div className="text-center p-10 bg-gray-100 rounded-lg shadow-md">
          <p className="text-lg font-medium text-gray-600">
            No reviews yet. Be the first to leave a review!
          </p>
        </div>
      ) : (
        /* Individual Reviews */
        <div className="space-y-6">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white shadow p-6 rounded-lg border border-gray-200"
            >
              <div className="flex items-start gap-4">
                {/* Profile Image */}
                <div className="w-12 h-12 relative rounded-full overflow-hidden bg-gray-100">
                  {review.customer.profileImage ? (
                    <Image
                      src={review.customer.profileImage}
                      alt={review.customer.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 text-lg font-medium">
                      {review.customer.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Review Details */}
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {review.customer.name}
                    </h3>
                    <div className="bg-blue-500 text-white text-sm font-medium px-3 py-1 rounded">
                      {review.rating}/5
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                  <p className="mt-2 text-gray-700 leading-relaxed">{review.comment}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}