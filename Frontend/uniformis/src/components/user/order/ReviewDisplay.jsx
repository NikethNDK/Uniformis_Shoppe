
import React, { useState, useEffect } from 'react';
import { Star, Pencil, Check, X } from 'lucide-react';
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../../components/ui/dialog";
import { productApi } from "../../../axiosconfig";
import { toast } from "react-toastify";

const ReviewDisplay = ({ orderId, itemId, onClose, onReviewSubmitted, initialReview = null }) => {

  const [rating, setRating] = useState(initialReview ? initialReview.rating : 0);
  const [comment, setComment] = useState(initialReview ? initialReview.comment : '');
  const [review, setReview] = useState(initialReview);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(!initialReview);
  const [isEditing, setIsEditing] = useState(false);
  
  useEffect(() => {
    if (!initialReview) {
      fetchReview();
    }
  }, [initialReview, orderId, itemId]);

  const fetchReview = async () => {
    try {
      setIsLoading(true);
      const response = await productApi.get(`/orders/${orderId}/items/${itemId}/reviews/`);
      console.log('fetchReview : ',response.data)
      setReview(response.data);
      setRating(response.data.rating);
      setComment(response.data.comment);
    } catch (error) {
      console.error("Failed to fetch review:", error);
      toast.error("Failed to load review. Please try again.");
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (!comment.trim()) {
      toast.error("Please write a review");
      return;
    }

    setIsSubmitting(true);

    try {
      if (review) {
        // Update existing review
        await productApi.put(`/orders/${orderId}/items/${itemId}/review/`, {
          rating,
          comment,
        });
        toast.success("Review updated successfully");
      } else {
        // Create new review
        await onReviewSubmitted(orderId, itemId, rating, comment);
      }
      
      // If we're updating, refresh the review data
      if (review) {
        await fetchReview();
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to submit review:", error);
      toast.error("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogHeader>
  <DialogTitle>Loading Review</DialogTitle>
  <DialogDescription>Please wait while we fetch your review.</DialogDescription>
</DialogHeader>
        <DialogContent>
        <DialogTitle>Loading Review</DialogTitle>
          <div className="flex justify-center items-center h-40">
            <p>Loading review...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            {isEditing ? "Edit Your Review" : "Your Review"} 
            {!isEditing && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsEditing(true)}
                className="h-8 w-8"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
          </DialogTitle>
          <DialogDescription>
    {isEditing ? "Share your thoughts about this product." : "Here's your feedback for this product."}
  </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => isEditing && setRating(star)}
                className={`focus:outline-none ${!isEditing && 'cursor-default'}`}
                disabled={!isEditing}
              >
                <Star
                  className={`w-6 h-6 ${
                    star <= rating
                      ? "fill-primary text-primary"
                      : "fill-muted text-muted-foreground"
                  }`}
                />
              </button>
            ))}
          </div>
          {isEditing ? (
            <Textarea
              placeholder="Write your review here..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[100px]"
            />
          ) : (
            <div className="border rounded-md p-3 min-h-[100px] bg-gray-50">
              {comment}
            </div>
          )}
        </div>
        <DialogFooter>
          {isEditing ? (
            <>
              <Button 
                variant="outline" 
                onClick={() => {
                  if (review) {
                    setIsEditing(false);
                    setRating(review.rating);
                    setComment(review.comment);
                  } else {
                    onClose();
                  }
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : review ? "Update" : "Submit"}
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={onClose}>Close</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewDisplay;