import axiosInstance from "./axiosInstance";

export const getRoles = async () => {
  const response = await axiosInstance.get("/api/v1/IdentityManagement/roles");
  return response.data;
};

export const getRolesLookup = async () => {
  const response = await axiosInstance.get(
    "/api/v1/IdentityManagement/roles/lookup",
  );
  return response.data;
};

export const createRole = async (data) => {
  const response = await axiosInstance.post(
    "/api/v1/IdentityManagement/roles",
    data,
  );
  return response.data;
};

export const updateRole = async (roleId, data) => {
  const response = await axiosInstance.put(
    `/api/v1/IdentityManagement/roles/${roleId}`,
    data,
  );
  return response.data;
};

export const assignRoleToUser = async (userId, roleName) => {
  const response = await axiosInstance.post(
    `/api/v1/IdentityManagement/users/${userId}/roles`,
    { roleName },
  );
  return response.data;
};

export const getPayoutBalance = async () => {
  const response = await axiosInstance.get("/api/v1/Payouts/balance");
  return response.data;
};

export const getPlatformSettings = async () => {
  const response = await axiosInstance.get("/api/v1/PlatformSettings");
  return response.data;
};

export const updatePlatformSetting = async (key, newValue) => {
  const response = await axiosInstance.put(`/api/v1/PlatformSettings/${key}`, {
    newValue,
  });
  return response.data;
};
