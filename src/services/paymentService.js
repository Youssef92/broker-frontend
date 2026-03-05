import axiosInstance from "./axiosInstance";

const PAYMENT_BASE = "/api/v1/PaymentMethods";

export const addPaymentMethod = async (data) => {
  const response = await axiosInstance.post(PAYMENT_BASE, {
    idempotencyKey: Math.random().toString(36).substring(7),
    paymentMethod: 1,
    billingData: {
      firstName: data.firstName,
      lastName: data.lastName,
      phoneNumber: data.phoneNumber,
      email: data.email,
      city: data.city,
      country: data.country,
      street: data.street,
      zipCode: data.zipCode,
    },
  });
  return response.data;
};