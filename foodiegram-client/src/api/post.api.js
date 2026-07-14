import api from "./axios";

export const getFeedApi = (page = 1, limit = 10) =>
  api.get(`/posts?page=${page}&limit=${limit}`);

export const getPostByIdApi = (id) => api.get(`/posts/${id}`);

// data: { caption, restaurantId, image (File) }
export const createPostApi = (data) => {
  const formData = new FormData();
  formData.append("caption", data.caption || "");
  if (data.restaurantId) formData.append("restaurantId", data.restaurantId);
  formData.append("image", data.image);
  return api.post("/posts", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const updatePostApi = (id, data) => {
  const formData = new FormData();
  if (data.caption !== undefined) formData.append("caption", data.caption);
  if (data.restaurantId !== undefined)
    formData.append("restaurantId", data.restaurantId || "");
  if (data.image) formData.append("image", data.image);
  return api.put(`/posts/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const deletePostApi = (id) => api.delete(`/posts/${id}`);

export const toggleLikeApi = (id) => api.post(`/posts/${id}/like`);

export const getCommentsApi = (id) => api.get(`/posts/${id}/comments`);

export const addCommentApi = (id, text) =>
  api.post(`/posts/${id}/comments`, { text });

export const deleteCommentApi = (postId, commentId) =>
  api.delete(`/posts/${postId}/comments/${commentId}`);
