import axiosInstance from "./axiosInstance";

/**
 * Get reservations for the current host (landlord).
 * @param {Object} params - Query parameters
 * @param {number} params.PageNumber - The page number
 * @param {number} params.PageSize - The page size
 * @param {string} params.StatusFilter - The status filter (BookingStatus)
 * @param {string} params.SearchTerm - Search term for filtering
 * @returns {Promise<Object>} The reservations data
 */
export const getHostReservations = async (params = {}) => {
  const response = await axiosInstance.get("/api/v1/HostReservations/reservations", {
    params,
  });
  return response.data;
};
/**
 * Confirm cash collection for a specific booking.
 * @param {string} bookingId - The ID of the booking
 * @returns {Promise<Object>} The response data
 */
export const confirmCashCollection = async (bookingId) => {
  const response = await axiosInstance.post(
    `/api/v1/HostReservations/reservations/${bookingId}/cash-collection/confirm`,
  );
  return response.data;
};
