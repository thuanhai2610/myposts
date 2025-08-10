// src/components/CommentSection.tsx
import React, { useState } from 'react';

interface Comment {
  _id: string;
  content: string;
  authorId: { email: string };
  createdAt: string;
}

interface Props {
  postId: string;
  comments: Comment[];
  onCommentSuccess: () => void; // Để gọi lại fetchPosts sau khi comment
}

export default function CommentSection({ postId, comments, onCommentSuccess }: Props) {
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');
const api = process.env.REACT_APP_BACKEND
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newComment.trim()) return;

    try {
      const res = await fetch(`${api}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ postId, content: newComment }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || 'Lỗi khi gửi bình luận');
        return;
      }

      setNewComment('');
      onCommentSuccess();
    } catch (err) {
      setError('Lỗi mạng khi gửi bình luận');
    }
  };

  return (
    <div className="mt-4 border-t pt-2">
      <h4 className="text-md font-semibold mb-2">Bình luận:</h4>
      {comments.length > 0 ? (
        comments.map((comment) => (
          <div key={comment._id} className="pl-2 border-l mb-2">
            <p className="text-xs text-blue-500">
              {comment.authorId?.email || 'Ẩn danh'} •{' '}
              {new Date(comment.createdAt).toLocaleString()}
            </p>
            <p className="text-sm">{comment.content}</p>
          </div>
        ))
      ) : (
        <p className="text-sm text-gray-400">Chưa có bình luận.</p>
      )}

      {/* Form bình luận */}
      <form onSubmit={handleCommentSubmit} className="mt-2">
        <textarea
          className="w-full border rounded p-2 text-sm"
          rows={2}
          placeholder="Viết bình luận..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button
          type="submit"
          className="mt-1 bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
        >
          Gửi
        </button>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </form>
    </div>
  );
}
