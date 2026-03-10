import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, XCircle, Clock, AlertCircle, ShieldAlert } from "lucide-react";
import identityService from "../../services/identityService";

function KycStatus() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await identityService.getKycStatus();
        setStatus(response.data.status); 
      } catch (error) {
        console.error("Error fetching status:", error);
        setStatus("ERROR");
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, []);

  // الـ 7 حالات اللي طلبتهم
  const statusConfig = {
    'PENDING': {
      title: "قيد المراجعة",
      desc: "طلبك وصل للفريق المختص وجاري مراجعته الآن.",
      icon: <Clock className="text-yellow-500" size={50} />,
      style: "border-yellow-500/20 bg-yellow-500/5"
    },
    'APPROVED': {
      title: "تم قبول التوثيق",
      desc: "مبروك! تم تفعيل حسابك كـ Landlord بنجاح.",
      icon: <CheckCircle2 className="text-green-500" size={50} />,
      style: "border-green-500/20 bg-green-500/5"
    },
    'REJECTED': {
      title: "طلب مرفوض",
      desc: "للأسف لم يتم قبول المستندات، يرجى إعادة المحاولة.",
      icon: <XCircle className="text-red-500" size={50} />,
      style: "border-red-500/20 bg-red-500/5"
    },
    'SUBMITTED': {
      title: "تم استلام الطلب",
      desc: "شكراً لك، تم رفع بياناتك بنجاح وسنرد عليك قريباً.",
      icon: <AlertCircle className="text-blue-500" size={50} />,
      style: "border-blue-500/20 bg-blue-500/5"
    },
    'REQUIRED': {
      title: "مطلوب بيانات KYC",
      desc: "يرجى رفع المستندات المطلوبة لتفعيل حسابك.",
      icon: <ShieldAlert className="text-[var(--gold)]" size={50} />,
      style: "border-[var(--gold)]/20 bg-[var(--gold)]/5"
    },
    'SUSPENDED': {
      title: "الحساب معلق",
      desc: "تم تعليق طلبك مؤقتاً لأسباب أمنية، تواصل مع الدعم.",
      icon: <XCircle className="text-orange-600" size={50} />,
      style: "border-orange-500/20 bg-orange-500/5"
    },
    'EXPIRED': {
      title: "وثائق منتهية",
      desc: "المستندات التي قمت برفعها قديمة، يرجى تحديثها.",
      icon: <AlertCircle className="text-gray-400" size={50} />,
      style: "border-gray-400/20 bg-gray-400/5"
    },
    'ERROR': {
      title: "خطأ في الاتصال",
      desc: "نواجه مشكلة في الوصول لبياناتك حالياً.",
      icon: <XCircle className="text-red-800" size={50} />,
      style: "border-red-800/20 bg-red-800/5"
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--dark)]">
        <Loader2 className="animate-spin text-[var(--gold)]" size={40} />
      </div>
    );
  }

  const current = statusConfig[status] || statusConfig['ERROR'];

  return (
    <div className="min-h-screen bg-[var(--dark)] pt-44 px-6 flex justify-center">
      <div className={`max-w-md w-full p-12 rounded-xl border ${current.style} text-center h-fit`}>
        <div className="flex justify-center mb-8">{current.icon}</div>
        <h1 className="text-[var(--gold)] font-cormorant text-2xl uppercase tracking-[4px] mb-4">
          {current.title}
        </h1>
        <p className="text-[#f5f0e8]/70 font-jost text-sm leading-relaxed">
          {current.desc}
        </p>
      </div>
    </div>
  );
}

export default KycStatus;