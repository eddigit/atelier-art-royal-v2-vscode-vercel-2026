'use client';

import { useState, useEffect } from 'react';
import { Star, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Review {
  _id: string;
  user_id?: {
    first_name?: string;
    last_name?: string;
  };
  rating: number;
  comment: string;
  created_at: string;
}

interface ProductReviewsProps {
  productId: string;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/reviews?productId=${productId}`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
        if (data.reviews && data.reviews.length > 0) {
          const avg = data.reviews.reduce((sum: number, r: Review) => sum + r.rating, 0) / data.reviews.length;
          setAverageRating(Math.round(avg * 10) / 10);
        }
      }
    } catch (error) {
      console.error('Erreur chargement avis:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStars = (rating: number, size: 'sm' | 'md' = 'sm') => {
    const sizeClass = size === 'md' ? 'h-5 w-5' : 'h-4 w-4';
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${
              star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-white/30'
            }`}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <section className="mt-12 bg-white/[0.03] border border-white/10 rounded-lg p-8">
        <h2 className="font-display text-2xl font-bold mb-4 text-white">Avis clients</h2>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-white/10 rounded w-1/4"></div>
          <div className="h-20 bg-white/10 rounded"></div>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-12 bg-white/[0.03] border border-white/10 rounded-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold text-white">Avis clients</h2>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2">
            {renderStars(averageRating, 'md')}
            <span className="font-semibold text-lg text-white">{averageRating}</span>
            <span className="text-white/50">({reviews.length} avis)</span>
          </div>
        )}
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-8 text-white/50">
          <p>Aucun avis pour ce produit.</p>
          <p className="text-sm mt-2">Soyez le premier à donner votre avis !</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review._id} className="border-b border-white/10 pb-6 last:border-b-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-white/50" />
                  </div>
                  <div>
                    <p className="font-medium text-white">
                      {review.user_id?.first_name || 'Anonyme'} {review.user_id?.last_name?.[0] || ''}.
                    </p>
                    <p className="text-xs text-white/50">
                      {new Date(review.created_at).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                {renderStars(review.rating)}
              </div>
              <p className="text-white/70 mt-3">{review.comment}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
