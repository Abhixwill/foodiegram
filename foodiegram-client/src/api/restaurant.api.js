import api from "./axios";

export const getRestaurantsApi = (page = 1, limit = 12) =>
  api.get(`/restaurants?page=${page}&limit=${limit}`);

export const getRestaurantByIdApi = (id) => api.get(`/restaurants/${id}`);

export const searchRestaurantsApi = (q) =>
  api.get(`/restaurants/search?q=${encodeURIComponent(q)}`);

// data: { name, description, address, cuisine, image (File, optional) }
export const createRestaurantApi = (data) => {
  const formData = new FormData();
  formData.append("name", data.name);
  formData.append("description", data.description || "");
  formData.append("address", data.address || "");
  formData.append("cuisine", data.cuisine || "");
  if (data.image) formData.append("image", data.image);
  return api.post("/restaurants", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
