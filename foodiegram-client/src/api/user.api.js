import api from "./axios";

export const getProfileApi = (username) => api.get(`/users/${username}`);

export const searchUsersApi = (q) =>
  api.get(`/users/search?q=${encodeURIComponent(q)}`);

// data: { name, bio, avatar (File, optional) }
export const updateProfileApi = (data) => {
  const formData = new FormData();
  if (data.name !== undefined) formData.append("name", data.name);
  if (data.bio !== undefined) formData.append("bio", data.bio);
  if (data.avatar) formData.append("avatar", data.avatar);
  return api.put("/users/me", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
