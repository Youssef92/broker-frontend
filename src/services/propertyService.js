import axiosInstance from "./axiosInstance";

const PROPERTY_BASE = "/api/v1/PropertyListings";

export const getProperties = async (params = {}) => {
  const response = await axiosInstance.get(PROPERTY_BASE, { params });
  return response.data;
};

export const createPropertyListing = async (data) => {
  const response = await axiosInstance.post(PROPERTY_BASE, data);
  return response.data;
};

export const uploadPropertyMedia = async (id, formData) => {
  const response = await axiosInstance.post(
    `${PROPERTY_BASE}/${id}/media`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return response.data;
};

export const publishPropertyListing = async (id) => {
  const response = await axiosInstance.post(`${PROPERTY_BASE}/${id}/publish`);
  return response.data;
};

export const getManagePropertyDetails = async (id) => {
  const response = await axiosInstance.get(`${PROPERTY_BASE}/${id}/manage`);
  return response.data;
};
