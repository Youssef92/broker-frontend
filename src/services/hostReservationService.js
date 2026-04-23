import axiosInstance from "./axiosInstance";

export const getHostReservations = async (params) => {
  const response = await axiosInstance.get(
    "/api/v1/HostReservations/reservations",
    { params },
  );
  return response.data;
};

export const confirmCashCollection = async (bookingId) => {
  const response = await axiosInstance.post(
    `/api/v1/HostReservations/reservations/${bookingId}/cash-collection/confirm`,
  );
  return response.data;
};
