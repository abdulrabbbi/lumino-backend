"use client"

/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from "react"
import {
  ArrowLeft,
  MoreVertical,
  LogOut,
  Heart,
  MessageCircle,
  Share2,
  Send,
  Users,
  FileText,
  MessageSquare,
} from "lucide-react"
import { useParams, useNavigate } from "react-router-dom"
import { PostInput } from "../../components/community-components/post-input"
import { useCommunity } from "../../hooks/useCommunity"
import LoaderOverlay from "../../components/LoaderOverlay"
import { toast, ToastContainer } from "react-toastify"

export function CommunityDetailPage() {
  const { communityId } = useParams()
  const navigate = useNavigate()
  const {
    getCommunity,
    getCommunityPosts,
    toggleLike,
    leaveCommunity,
    createPost,
    addComment,
    getComments,
    loading,
    error,
  } = useCommunity()

  const [community, setCommunity] = useState(null)
  const [posts, setPosts] = useState([])
  const [comments, setComments] = useState({})
  const [commentText, setCommentText] = useState({})
  const [replyText, setReplyText] = useState({})
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false)
  const [isCommenting, setIsCommenting] = useState({})
  const [isReplying, setIsReplying] = useState({})
  const commentInputRefs = useRef({})
  const replyInputRefs = useRef({})

  useEffect(() => {
    const fetchCommunityData = async () => {
      try {
        const communityData = await getCommunity(communityId)
        setCommunity(communityData)

        const postsData = await getCommunityPosts(communityId)
        setPosts(postsData.posts || [])

        const initialComments = {}
        const initialCommentText = {}
        postsData.posts?.forEach((post) => {
          initialComments[post._id] = {
            comments: [],
            showAll: false,
            loading: false,
          }
          initialCommentText[post._id] = ""
        })
        setComments(initialComments)
        setCommentText(initialCommentText)
      } catch (err) {
        console.error("Error fetching community data:", err)
      }
    }

    if (communityId) {
      fetchCommunityData()
    }
  }, [communityId])

  const handleAddPost = async (content, image = null) => {
    try {
      const formData = new FormData()
      formData.append("content", content)
      if (image) {
        formData.append("file", image)
      }

      const response = await createPost(communityId, formData)

      if (response) {
        const newPost = {
          ...response,
          stats: {
            likes: 0,
            comments: 0,
            shares: 0,
          },
          userLiked: false,
          likeType: null,
          canInteract: true,
        }
        setPosts([newPost, ...posts])

        setComments((prev) => ({
          ...prev,
          [response._id]: {
            comments: [],
            showAll: false,
            loading: false,
          },
        }))
        setCommentText((prev) => ({
          ...prev,
          [response._id]: "",
        }))

        toast.success("Post created successfully!")
      }
    } catch (err) {
      console.error("Error creating post:", err)
      toast.error("Failed to create post. Please try again.")
    }
  }

  const handleLikePost = async (postId, currentLikedState) => {
    try {
      await toggleLike(postId)

      setPosts(
        posts.map((post) =>
          post._id === postId
            ? {
                ...post,
                userLiked: !currentLikedState,
                stats: {
                  ...post.stats,
                  likes: currentLikedState ? post.stats.likes - 1 : post.stats.likes + 1,
                },
              }
            : post,
        ),
      )
    } catch (err) {
      console.error("Error toggling like:", err)
    }
  }

  const handleAddComment = async (postId) => {
    if (!commentText[postId]?.trim()) return

    try {
      setIsCommenting((prev) => ({ ...prev, [postId]: true }))

      const response = await addComment(postId, {
        content: commentText[postId],
        parentComment: null,
      })

      setPosts(
        posts.map((post) =>
          post._id === postId
            ? {
                ...post,
                stats: {
                  ...post.stats,
                  comments: post.stats.comments + 1,
                },
              }
            : post,
        ),
      )

      setComments((prev) => ({
        ...prev,
        [postId]: {
          ...prev[postId],
          comments: [response, ...prev[postId].comments],
        },
      }))

      setCommentText((prev) => ({ ...prev, [postId]: "" }))
    } catch (err) {
      console.error("Error adding comment:", err)
      alert("Failed to add comment. Please try again.")
    } finally {
      setIsCommenting((prev) => ({ ...prev, [postId]: false }))
    }
  }

  const handleAddReply = async (postId, commentId) => {
    if (!replyText[commentId]?.trim()) return

    try {
      setIsReplying((prev) => ({ ...prev, [commentId]: true }))

      const response = await addComment(postId, {
        content: replyText[commentId],
        parentComment: commentId,
      })

      setComments((prev) => ({
        ...prev,
        [postId]: {
          ...prev[postId],
          comments: prev[postId].comments.map((comment) =>
            comment._id === commentId
              ? {
                  ...comment,
                  replies: [...(comment.replies || []), response],
                }
              : comment,
          ),
        },
      }))

      setReplyText((prev) => ({ ...prev, [commentId]: "" }))
      setIsReplying((prev) => ({ ...prev, [commentId]: false }))
    } catch (err) {
      console.error("Error adding reply:", err)
      alert("Failed to add reply. Please try again.")
    }
  }

  const handleLoadComments = async (postId) => {
    try {
      setComments((prev) => ({
        ...prev,
        [postId]: {
          ...prev[postId],
          loading: true,
        },
      }))

      const response = await getComments(postId)
      setComments((prev) => ({
        ...prev,
        [postId]: {
          comments: response.comments || [],
          showAll: true,
          loading: false,
        },
      }))
    } catch (err) {
      console.error("Error loading comments:", err)
      setComments((prev) => ({
        ...prev,
        [postId]: {
          ...prev[postId],
          loading: false,
        },
      }))
    }
  }

  const handleLeaveCommunity = async () => {
    try {
      await leaveCommunity(communityId)
      setIsLeaveModalOpen(false)
      setIsDropdownOpen(false)

      toast.success(`You have left ${community.name}`)
      setTimeout(() => {
        navigate("/communities")
      }, 2000)
      navigate("/communities")
    } catch (err) {
      toast.error("Failed to leave community. Please try again.")
    }
  }

  const handleClickOutside = (e) => {
    if (!e.target.closest(".dropdown-container") && !e.target.closest(".three-dots-button")) {
      setIsDropdownOpen(false)
    }
  }

  useEffect(() => {
    if (isDropdownOpen) {
      document.addEventListener("click", handleClickOutside)
    }
    return () => {
      document.removeEventListener("click", handleClickOutside)
    }
  }, [isDropdownOpen])

  if (loading && !community) {
    return <LoaderOverlay />
  }

  if (error && !community) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-red-600 text-lg font-medium mb-6">Error: {error}</p>
          <button
            onClick={() => navigate("/communities")}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 transform hover:scale-105"
          >
            Back to Communities
          </button>
        </div>
      </div>
    )
  }

  if (!community) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-gray-700 text-lg font-medium mb-6">Community not found</p>
          <button
            onClick={() => navigate("/communities")}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 transform hover:scale-105"
          >
            Back to Communities
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen ">
      <ToastContainer style={{ zIndex: 1000000000000000 }} />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Left Section */}
            <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
              <button
                onClick={() => navigate("/communities")}
                className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-full transition-all duration-200 active:scale-95"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
              </button>
              <div className="flex flex-col min-w-0">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate">{community.name}</h1>
                  {/* <div className="flex items-center gap-2 sm:gap-3 mt-1 text-xs sm:text-sm text-gray-600 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="font-medium">{community.stats?.memberCount || 0}</span>
                      <span className="hidden xs:inline">members</span>
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="flex items-center gap-1">
                      <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="font-medium">{community.stats?.postCount || 0}</span>
                      <span className="hidden xs:inline">posts</span>
                    </span>
                  </div> */}
              </div>
            </div>

            {/* Right Section - More Options */}
            <div className="relative dropdown-container flex-shrink-0">
              <button
                className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200 active:scale-95 three-dots-button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                aria-label="More options"
                aria-expanded={isDropdownOpen}
              >
                <MoreVertical className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <button
                    onClick={() => {
                      setIsLeaveModalOpen(true)
                      setIsDropdownOpen(false)
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                    Leave Community
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>


      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Post Input */}
        <div className="mb-6">
          <PostInput onPost={handleAddPost} />
        </div>

        {/* Posts Feed */}
        <div className="space-y-4 sm:space-y-6">
          {loading && posts.length === 0 ? (
            <LoaderOverlay />
          ) : posts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full mb-4">
                <MessageSquare className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-600" />
              </div>
              <p className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No posts yet</p>
              <p className="text-sm sm:text-base text-gray-600">Be the first to share something with the community!</p>
            </div>
          ) : (
            posts.map((post) => (
              <article
                key={post._id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow duration-300"
              >
                {/* Post Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <img
                      src={
                        post.author?.avatar ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author?._id || "user"}`
                      }
                      alt={post.author?.username || "User"}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full ring-2 ring-gray-100 flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-sm sm:text-base text-gray-900 truncate">
                        {post.author?.firstName && post.author?.surname
                          ? `${post.author.firstName} ${post.author.surname}`
                          : post.author?.username || "Anonymous"}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500">{formatTimeAgo(post.createdAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Post Content */}
                <div className="mb-4">
                  <p className="text-sm sm:text-base text-gray-800 leading-relaxed whitespace-pre-wrap break-words">
                    {post.content}
                  </p>
                  {post.image && (
                    <div className="mt-4 rounded-xl overflow-hidden">
                      <img
                        src={post.image || "/placeholder.svg"}
                        alt="Post"
                        className="w-full max-h-[400px] sm:max-h-[500px] object-cover"
                      />
                    </div>
                  )}
                </div>

                {/* Post Stats */}
                <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-4 pb-4 border-b border-gray-100">
                  <span className="font-medium">{post.stats?.likes || 0} likes</span>
                  <span className="text-gray-300">•</span>
                  <span className="font-medium">{post.stats?.comments || 0} comments</span>
                  {/* <span className="text-gray-300">•</span> */}
                  {/* <span className="font-medium">{post.stats?.shares || 0} shares</span> */}
                </div>

                {/* Post Actions */}
                <div className="flex items-center gap-2 sm:gap-4">
                  <button
                    onClick={() => handleLikePost(post._id, post.userLiked)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 sm:py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${
                      post.userLiked
                        ? "text-red-500 bg-red-50 hover:bg-red-100"
                        : "text-gray-700 hover:bg-gray-100 active:scale-95"
                    }`}
                  >
                    <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${post.userLiked ? "fill-current" : ""}`} />
                    <span className="hidden xs:inline">{post.userLiked ? "Liked" : "Like"}</span>
                  </button>
                  <button
                    onClick={() => {
                      if (!comments[post._id]?.showAll) {
                        handleLoadComments(post._id)
                      }
                      setTimeout(() => {
                        commentInputRefs.current[post._id]?.focus()
                      }, 100)
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-2 sm:py-2.5 rounded-lg font-medium text-sm text-gray-700 hover:bg-gray-100 transition-all duration-200 active:scale-95"
                  >
                    <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden xs:inline">Comment</span>
                  </button>
                  {/* <button className="flex-1 flex items-center justify-center gap-2 py-2 sm:py-2.5 rounded-lg font-medium text-sm text-gray-700 hover:bg-gray-100 transition-all duration-200 active:scale-95">
                    <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden xs:inline">Share</span>
                  </button> */}
                </div>

                {/* Comments Section */}
                {(comments[post._id]?.comments.length > 0 || comments[post._id]?.showAll) && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <h4 className="font-semibold text-sm sm:text-base text-gray-900 mb-4">Comments</h4>

                    <div className="space-y-4">
                      {comments[post._id]?.comments.map((comment) => (
                        <div key={comment._id} className="pl-3 sm:pl-4 border-l-2 border-emerald-200">
                          <div className="flex items-start gap-2 sm:gap-3">
                            <img
                              src={
                                comment.author?.avatar ||
                                `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.author?._id || "user"}`
                              }
                              alt={comment.author?.username || "User"}
                              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full ring-2 ring-gray-100 flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <span className="font-semibold text-xs sm:text-sm text-gray-900">
                                    {comment.author?.firstName && comment.author?.surname
                                      ? `${comment.author.firstName} ${comment.author.surname}`
                                      : comment.author?.username || "Anonymous"}
                                  </span>
                                  <span className="text-xs text-gray-500">{formatTimeAgo(comment.createdAt)}</span>
                                </div>
                                <p className="text-xs sm:text-sm text-gray-800 leading-relaxed break-words">
                                  {comment.content}
                                </p>
                              </div>

                              {/* Reply Button */}
                              <button
                                onClick={() =>
                                  setIsReplying((prev) => ({ ...prev, [comment._id]: !prev[comment._id] }))
                                }
                                className="text-xs sm:text-sm text-emerald-600 hover:text-emerald-700 font-medium mt-2 ml-3 transition-colors"
                              >
                                Reply
                              </button>

                              {/* Reply Input */}
                              {isReplying[comment._id] && (
                                <div className="mt-3 ml-3">
                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      ref={(el) => (replyInputRefs.current[comment._id] = el)}
                                      value={replyText[comment._id] || ""}
                                      onChange={(e) =>
                                        setReplyText((prev) => ({ ...prev, [comment._id]: e.target.value }))
                                      }
                                      placeholder="Write a reply..."
                                      className="flex-1 text-xs sm:text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                      onKeyPress={(e) => e.key === "Enter" && handleAddReply(post._id, comment._id)}
                                    />
                                    <button
                                      onClick={() => handleAddReply(post._id, comment._id)}
                                      disabled={isReplying[comment._id] || !replyText[comment._id]?.trim()}
                                      className="p-2 sm:px-4 sm:py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-95 flex items-center justify-center"
                                    >
                                      {isReplying[comment._id] ? (
                                        <span className="text-xs sm:text-sm">...</span>
                                      ) : (
                                        <Send className="w-4 h-4" />
                                      )}
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* Replies */}
                              {comment.replies?.length > 0 && (
                                <div className="mt-3 space-y-3 pl-3 sm:pl-4 border-l border-gray-200">
                                  {comment.replies.map((reply) => (
                                    <div key={reply._id} className="flex items-start gap-2">
                                      <img
                                        src={
                                          reply.author?.avatar ||
                                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${reply.author?._id || "user"}`
                                        }
                                        alt={reply.author?.username || "User"}
                                        className="w-6 h-6 sm:w-7 sm:h-7 rounded-full ring-1 ring-gray-100 flex-shrink-0"
                                      />
                                      <div className="flex-1 min-w-0">
                                        <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <span className="font-semibold text-xs text-gray-900">
                                              {reply.author?.firstName && reply.author?.surname
                                                ? `${reply.author.firstName} ${reply.author.surname}`
                                                : reply.author?.username || "Anonymous"}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                              {formatTimeAgo(reply.createdAt)}
                                            </span>
                                          </div>
                                          <p className="text-xs text-gray-800 leading-relaxed break-words">
                                            {reply.content}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Load More Comments */}
                    {post.stats?.comments > (comments[post._id]?.comments.length || 0) && (
                      <button
                        onClick={() => handleLoadComments(post._id)}
                        disabled={comments[post._id]?.loading}
                        className="text-xs sm:text-sm text-emerald-600 hover:text-emerald-700 font-medium mt-4 transition-colors disabled:opacity-50"
                      >
                        {comments[post._id]?.loading
                          ? "Loading..."
                          : `Load more comments (${post.stats.comments - (comments[post._id]?.comments.length || 0)} remaining)`}
                      </button>
                    )}
                  </div>
                )}

                {/* Comment Input */}
                <div className="mt-4 sm:mt-6 pt-4 border-t border-gray-100">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      ref={(el) => (commentInputRefs.current[post._id] = el)}
                      value={commentText[post._id] || ""}
                      onChange={(e) => setCommentText((prev) => ({ ...prev, [post._id]: e.target.value }))}
                      placeholder="Write a comment..."
                      className="flex-1 border border-gray-300 text-sm rounded-xl px-4 py-2.5 sm:py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      onKeyPress={(e) => e.key === "Enter" && handleAddComment(post._id)}
                    />
                    <button
                      onClick={() => handleAddComment(post._id)}
                      disabled={isCommenting[post._id] || !commentText[post._id]?.trim()}
                      className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold text-sm rounded-xl hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
                    >
                      {isCommenting[post._id] ? (
                        <span className="text-xs sm:text-sm">...</span>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span className="hidden sm:inline">Post</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </main>

      {/* Leave Community Modal */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Leave Community?</h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-6">
              Are you sure you want to leave "{community.name}"? You won't be able to post or see community updates
              anymore.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleLeaveCommunity}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                Confirm, Leave
              </button>
              <button
                onClick={() => setIsLeaveModalOpen(false)}
                className="flex-1 py-3 px-6 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-all duration-200 active:scale-95"
              >
                Stay in Community
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Helper function to format time ago
function formatTimeAgo(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)

  if (diffInSeconds < 60) return "just now"
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}
