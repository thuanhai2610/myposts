
import React, { useEffect, useState } from "react";
import AuthPage from './Auth';

// CommentSection component from src/components/CommentSection.tsx
interface Comment {
  _id: string;
  content: string;
  authorId: { email: string };
  createdAt: string;
}

interface Post {
  _id: string;
  title: string;
  content: string;
  authorId: { email: string };
  createdAt: string;
  comments: Comment[];
}

interface User {
  email: string;
}

// Original CommentSection component
function CommentSection({ postId, comments, onCommentSuccess }: { postId: string; comments: Comment[]; onCommentSuccess: () => void }) {
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newComment.trim()) return;

    try {
      const res = await fetch('http://localhost:3000/comments', {
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

export default function ForumHome() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showAuthPage, setShowAuthPage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false)
const api = process.env.REACT_APP_BACKEND
console.log(api)
  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        setIsLoggedIn(true);
        setUser({ email: "user@example.com" });
      }
    } catch (error) {
      console.error("Error checking token:", error);
    }
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch(`${api}/posts/all`);
      if (!res.ok) throw new Error("Failed to fetch posts");
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      setMessage("Không thể tải bài viết");
      setPosts([
      
      ]);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setUser({ email: "user@example.com" }); // This should come from token validation
    setShowAuthPage(false);
    setMessage("✅ Đăng nhập thành công!");
    setTimeout(() => setMessage(""), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setUser(null);
    setMessage("👋 Đã đăng xuất");
    setTimeout(() => setMessage(""), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      setMessage("❌ Vui lòng đăng nhập để đăng bài");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    setMessage("");
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content }),
      });
      const data = await res.json();
      
      if (res.ok) {
        setTitle("");
        setContent("");
        setMessage("✅ Đăng bài thành công");
        fetchPosts();
      } else {
        setMessage(data.message || "❌ Lỗi khi đăng bài");
      }
    } catch (err) {
      setMessage("❌ Lỗi mạng khi đăng bài");
      if (user) {
        const newPost: Post = {
          _id: Date.now().toString(),
   
          title,
          content,
          authorId: { email: user.email },
          createdAt: new Date().toISOString(),
          comments: []
        };
        setPosts([newPost, ...posts]);
        setTitle("");
        setContent("");
        setMessage("✅ Đăng bài thành công");
      }
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleDeletePost = async (postId: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("❌ Bạn cần đăng nhập để xoá bài viết.");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    const confirmDelete = window.confirm("Bạn có chắc muốn xoá bài viết này?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`http://localhost:3000/posts/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Xoá bài viết thành công");
        fetchPosts();
      } else {
        setMessage(data.message || "❌ Không thể xoá bài viết");
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Lỗi khi xoá bài viết");
      setPosts(posts.filter(post => post._id !== postId));
      setMessage("✅ Xoá bài viết thành công");
    } finally {
      setTimeout(() => setMessage(""), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {showAuthPage && (
        <AuthPage onLoginSuccess={handleLoginSuccess} />
      )}
      {!showAuthPage && (
        <>
          <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-40">
            <div className="max-w-4xl mx-auto px-6 py-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Diễn đàn học tập
                    </h1>
                    <p className="text-sm text-gray-500">Nơi chia sẻ kiến thức và kinh nghiệm</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  {isLoggedIn && user ? (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 rounded-xl border border-blue-100">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-700">{user.email}</p>
                          <p className="text-xs text-gray-500">Thành viên</p>
                        </div>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span className="font-medium">Đăng xuất</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowAuthPage(true)}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      Đăng nhập
                    </button>
                  )}
                </div>
              </div>
            </div>
          </header>

          <div className="max-w-4xl mx-auto px-6 py-8">
            {message && (
              <div className="mb-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl text-blue-800 font-medium shadow-md animate-pulse">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  {message}
                </div>
              </div>
            )}

            <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl mb-8 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="text-2xl font-bold text-gray-800">Chia sẻ kiến thức mới</h2>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Tiêu đề bài viết của bạn..."
                    className="w-full p-4 text-lg border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 bg-white/80"
                    required
                  />
                </div>
                <div>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Chia sẻ kiến thức, kinh nghiệm học tập của bạn..."
                    className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 resize-none bg-white/80"
                    rows={6}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={!isLoggedIn || isSubmitting}
                  className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                    isLoggedIn && !isSubmitting
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Đang đăng...
                    </>
                  ) : isLoggedIn ? (
                    <>🚀 Đăng bài</>
                  ) : (
                    <>🔒 Đăng nhập để đăng bài</>
                  )}
                </button>
              </form>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg">📰</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Bài viết gần đây</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent"></div>
              </div>
              
              {posts.length === 0 ? (
                <div className="bg-white/90 backdrop-blur-sm p-16 rounded-2xl shadow-xl text-center">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-4xl">📝</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">Chưa có bài viết nào</h3>
                  <p className="text-gray-500">Hãy là người đầu tiên chia sẻ kiến thức!</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {posts.map((post) => (
                    <article
                      key={post._id}
                      className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-gray-800 mb-4 leading-tight hover:text-blue-600 transition-colors">
                            {post.title}
                          </h3>
                          <p className="text-gray-700 leading-relaxed text-lg">
                            {post.content}
                          </p>
                        </div>
                        {isLoggedIn && user?.email === post.authorId?.email && (
                          <button
                            onClick={() => handleDeletePost(post._id)}
                            className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors duration-200 ml-4"
                            title="Xoá bài viết"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-6 pb-6 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center shadow-md">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-700">{post.authorId?.email || "Ẩn danh"}</p>
                            <p className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleString('vi-VN')}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 mb-4">
                        <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors duration-200">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          <span className="font-medium">Thích</span>
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-colors duration-200">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <span className="font-medium">Bình luận</span>
                        </button>
                      </div>

                      <CommentSection
                        postId={post._id}
                        comments={post.comments}
                        onCommentSuccess={fetchPosts}
                      />
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
