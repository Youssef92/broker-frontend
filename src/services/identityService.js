// استيراد الـ instance اللي فيه الإعدادات الأونلاين (الرابط والتوكن)
import axiosInstance from './axiosInstance';

const identityService = {
  
  // 1. جلب الأدوار (Roles)
  getAllRoles: () => {
    return axiosInstance.get('/api/v1/IdentityManagement/roles');
  },

  // 2. جلب قائمة البحث (Lookup)
  getRolesLookup: () => {
    return axiosInstance.get('/api/v1/IdentityManagement/roles/lookup');
  },

  // 3. إضافة دور جديد (POST)
  createRole: (roleData) => {
    return axiosInstance.post('/api/v1/IdentityManagement/roles', roleData);
  },

  // 4. تعديل دور موجود (PUT)
  // بنستخدم ${roleId} عشان نحط الـ ID اللي جاي من الفرونت في اللينك
  updateRole: (roleId, roleData) => {
    return axiosInstance.put(`/api/v1/IdentityManagement/roles/${roleId}`, roleData);
  },

  // 5. ترقية مستخدم لـ Landlord
  upgradeToLandlord: (data) => {
    return axiosInstance.post('/api/v1/IdentityManagement/upgrade-to-landlord', data);
  },

  // 6. معرفة حالة الـ KYC
  getKycStatus: () => {
    return axiosInstance.get('/api/v1/IdentityManagement/kyc/status');
  }
};

// تصدير الـ service عشان نقدر نستخدمه في أي صفحة (Page)
export default identityService;