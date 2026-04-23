import axiosInstance from "./axiosInstance";

export async function createBooking(data) {
  const response = await axiosInstance.post("/api/v1/Bookings", data);
  return response.data;
}

export async function getBlockedDates(propertyId, startDate, endDate) {
  const response = await axiosInstance.get(
    `/api/v1/Bookings/${propertyId}/blocked-dates`,
    {
      params: {
        startDate,
        endDate,
      },
    },
  );
  return response.data;
}

export const getMyTrips = (params) => {
  return axiosInstance.get("/api/v1/Bookings/my-trips", { params });
};
