import axiosInstance from "./axiosInstance";

export const getBlockedDates = async (propertyListingId, startDate, endDate) => {
  const response = await axiosInstance.get(
    `/api/v1/Bookings/${propertyListingId}/blocked-dates`,
    {
      params: {
        startDate,
        endDate,
      },
    }
  );
  return response.data;
};

export const createBooking = async (bookingData) => {
  const response = await axiosInstance.post("/api/v1/Bookings", bookingData);
  return response.data;
};
