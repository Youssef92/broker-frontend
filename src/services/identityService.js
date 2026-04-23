import axiosInstance from "./axiosInstance";

const IDENTITY_BASE = "/api/v1/IdentityManagement";

export const getRolesLookup = async () => {
  const response = await axiosInstance.get(`${IDENTITY_BASE}/roles/lookup`);
  return response.data;
};

export const getRoles = async () => {
  const response = await axiosInstance.get(`${IDENTITY_BASE}/roles`);
  return response.data;
};

export const updateRole = async (id, data) => {
  const response = await axiosInstance.put(`${IDENTITY_BASE}/roles/${id}`, data);
  return response.data;
};

export const assignRoleToUser = async (userId, roleName) => {
  const response = await axiosInstance.post(
    `${IDENTITY_BASE}/users/${userId}/roles`,
    { roleName },
  );
  return response.data;
};

export async function upgradeToLandlord() {
  const response = await axiosInstance.post(
    "/api/v1/IdentityManagement/upgrade-to-landlord",
    {},
  );
  return response.data;
}

export async function getKycStatus() {
  const response = await axiosInstance.get(
    "/api/v1/IdentityManagement/kyc/status",
  );
  return response.data;
}
