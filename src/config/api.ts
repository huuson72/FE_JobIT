import { IBackendRes, ICompany, IAccount, IUser, IModelPaginate, IGetAccount, IJob, IResume, IPermission, IRole, ISkill, ISubscribers, IReview, ICreateCVRequest, ICV, IEmployerSubscription, IPurchaseSubscriptionRequest, ISubscriptionPackage, ISubscriptionStatus } from '@/types/backend.d';

import axios from 'config/axios-customize';

/**
 * 
Module Auth
 */
export const callRegister = (name: string, email: string, password: string, age: number, gender: string, address: string) => {
    return axios.post<IBackendRes<IUser>>('/api/v1/auth/register', { name, email, password, age, gender, address })
}

export const callEmployerRegister = (data: {
    name: string;
    email: string;
    password: string;
    age: number;
    gender: string;
    address: string;
    phone: string;
    companyName: string;
    companyAddress: string;
    companyDescription: string;
    companyLogo: string;
}) => {
    console.log("API call data:", data);
    return axios.post<IBackendRes<IUser>>('/api/v1/auth/employer-register', data, {
        headers: {
            "Accept": "application/json"
        }
    })
        .then(response => {
            console.log("API Success Response:", response);
            // Nếu có data trả về thì coi như thành công
            if (response.data) {
                return response.data;
            }
            return response;
        })
        .catch(error => {
            console.error("API Error:", error.response || error);
            // Trường hợp đặc biệt: nếu response có status 200/201 nhưng vẫn vào catch
            if (error.response && (error.response.status === 200 || error.response.status === 201)) {
                console.log("Success with error pattern");
                return { success: true };
            }
            throw error;
        });
}

export const callLogin = (username: string, password: string) => {
    return axios.post<IBackendRes<IAccount>>('/api/v1/auth/login', { username, password })
}

export const callFetchAccount = () => {
    return axios.get<IBackendRes<IGetAccount>>('/api/v1/auth/account')
}

export const callRefreshToken = () => {
    return axios.get<IBackendRes<IAccount>>('/api/v1/auth/refresh')
}

export const callLogout = () => {
    return axios.post<IBackendRes<string>>('/api/v1/auth/logout')
}

/**
 * Upload single file
 */
export const callUploadSingleFile = (file: any, folderType: string) => {
    const bodyFormData = new FormData();
    bodyFormData.append('file', file);
    bodyFormData.append('folder', folderType);

    return axios<IBackendRes<{ fileName: string }>>({
        method: 'post',
        url: '/api/v1/files',
        data: bodyFormData,
        headers: {
            "Content-Type": "multipart/form-data",
            "Accept": "application/json"
        },
        timeout: 30000, // Tăng timeout cho upload file
    }).then(response => {
        // Hiển thị response cụ thể để debug
        console.log("File upload success response:", response);
        
        // Nếu API trả về dữ liệu trực tiếp từ server
        if (response && response.data) {
            // Xử lý trường hợp khi fileName nằm trong data
            if (typeof response.data === 'object') {
                // Trường hợp 1: response.data.data.fileName
                if ('data' in response.data && response.data.data && 
                    typeof response.data.data === 'object' && 'fileName' in response.data.data) {
                    return response.data.data.fileName;
                }
                
                // Trường hợp 2: response.data.fileName
                if ('fileName' in response.data) {
                    return response.data.fileName;
                }
                
                // Trường hợp 3: response.data là response chuẩn từ IBackendRes
                if ('data' in response.data && response.data.data) {
                    return response.data;
                }
            }
            
            // Trường hợp 4: response.data là string (URL trực tiếp)
            if (typeof response.data === 'string') {
                return response.data;
            }
        }
        
        // Trường hợp mặc định: trả về nguyên response để xử lý ở component
        return response;
    }).catch(error => {
        console.error("Upload Error:", error.response || error);
        console.error("Error details:", error.message);
        throw error;
    });
}




/**
 * 
Module Company
 */
export const callCreateCompany = (name: string, address: string, description: string, logo: string) => {
    return axios.post<IBackendRes<ICompany>>('/api/v1/companies', { name, address, description, logo })
}

export const callUpdateCompany = (id: string, name: string, address: string, description: string, logo: string) => {
    return axios.put<IBackendRes<ICompany>>(`/api/v1/companies`, { id, name, address, description, logo })
}

export const callDeleteCompany = (id: string) => {
    return axios.delete<IBackendRes<ICompany>>(`/api/v1/companies/${id}`);
}

export const callFetchCompany = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<ICompany>>>(`/api/v1/companies?${query}`);
}

export const callFetchCompanyById = (id: string) => {
    return axios.get<IBackendRes<ICompany>>(`/api/v1/companies/${id}`);
}

/**
 * 
Module Skill
 */
export const callCreateSkill = (name: string) => {
    return axios.post<IBackendRes<ISkill>>('/api/v1/skills', { name })
}

export const callUpdateSkill = (id: string, name: string) => {
    return axios.put<IBackendRes<ISkill>>(`/api/v1/skills`, { id, name })
}

export const callDeleteSkill = (id: string) => {
    return axios.delete<IBackendRes<ISkill>>(`/api/v1/skills/${id}`);
}

export const callFetchAllSkill = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<ISkill>>>(`/api/v1/skills?${query}`);
}



/**
 * 
Module User
 */
export const callCreateUser = (user: IUser) => {
    return axios.post<IBackendRes<IUser>>('/api/v1/users', { ...user })
}

export const callUpdateUser = (user: IUser) => {
    return axios.put<IBackendRes<IUser>>(`/api/v1/users`, { ...user })
}

export const callDeleteUser = (id: string) => {
    return axios.delete<IBackendRes<IUser>>(`/api/v1/users/${id}`);
}

export const callFetchUser = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IUser>>>(`/api/v1/users?${query}`);
}

/**
 * 
Module Job
 */
export const callCreateJob = (job: IJob) => {
    return axios.post<IBackendRes<IJob>>('/api/v1/jobs', { ...job })
}

export const callUpdateJob = (job: IJob, id: string) => {
    return axios.put<IBackendRes<IJob>>(`/api/v1/jobs`, { id, ...job })
}

export const callDeleteJob = (id: string) => {
    return axios.delete<IBackendRes<IJob>>(`/api/v1/jobs/${id}`);
}





export const callFetchJob = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IJob>>>(`/api/v1/jobs?${query}`);
}

export const callFetchJobCount = () => {
    console.log("Calling job count API...");
    return axios.get('/api/v1/jobs/count')
        .then(response => {
            console.log("Raw API response:", response);
            return response;
        })
        .catch(error => {
            console.error("API error:", error);
            throw error;
        });
}

export const callFetchJobById = (id: string) => {
    return axios.get<IBackendRes<IJob>>(`/api/v1/jobs/${id}`);
}

/**
 * 
Module Resume
 */
export const callCreateResume = (url: string, jobId: any, email: string, userId: string | number) => {
    return axios.post<IBackendRes<IResume>>('/api/v1/resumes', {
        email, url,
        status: "PENDING",
        user: {
            "id": userId
        },
        job: {
            "id": jobId
        }
    })
}

export const callUpdateResumeStatus = (id: any, status: string) => {
    return axios.put<IBackendRes<IResume>>(`/api/v1/resumes`, { id, status })
}

export const callDeleteResume = (id: string) => {
    return axios.delete<IBackendRes<IResume>>(`/api/v1/resumes/${id}`);
}

export const callFetchResume = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IResume>>>(`/api/v1/resumes?${query}`);
}

export const callFetchResumeById = (id: string) => {
    return axios.get<IBackendRes<IResume>>(`/api/v1/resumes/${id}`);
}

export const callFetchResumeByUser = () => {
    return axios.post<IBackendRes<IModelPaginate<IResume>>>(`/api/v1/resumes/by-user`);
}

/**
 * 
Module Permission
 */
export const callCreatePermission = (permission: IPermission) => {
    return axios.post<IBackendRes<IPermission>>('/api/v1/permissions', { ...permission })
}

export const callUpdatePermission = (permission: IPermission, id: string) => {
    return axios.put<IBackendRes<IPermission>>(`/api/v1/permissions`, { id, ...permission })
}

export const callDeletePermission = (id: string) => {
    return axios.delete<IBackendRes<IPermission>>(`/api/v1/permissions/${id}`);
}

export const callFetchPermission = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IPermission>>>(`/api/v1/permissions?${query}`);
}

export const callFetchPermissionById = (id: string) => {
    return axios.get<IBackendRes<IPermission>>(`/api/v1/permissions/${id}`);
}

/**
 * 
Module Role
 */
export const callCreateRole = (role: IRole) => {
    return axios.post<IBackendRes<IRole>>('/api/v1/roles', { ...role })
}

export const callUpdateRole = (role: IRole, id: string) => {
    return axios.put<IBackendRes<IRole>>(`/api/v1/roles`, { id, ...role })
}

export const callDeleteRole = (id: string) => {
    return axios.delete<IBackendRes<IRole>>(`/api/v1/roles/${id}`);
}

export const callFetchRole = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IRole>>>(`/api/v1/roles?${query}`);
}

export const callFetchRoleById = (id: string) => {
    return axios.get<IBackendRes<IRole>>(`/api/v1/roles/${id}`);
}

/**
 * 
Module Subscribers
 */
export const callCreateSubscriber = (subs: ISubscribers) => {
    return axios.post<IBackendRes<ISubscribers>>('/api/v1/subscribers', { ...subs })
}

export const callGetSubscriberSkills = () => {
    return axios.post<IBackendRes<ISubscribers>>('/api/v1/subscribers/skills')
}

export const callUpdateSubscriber = (subs: ISubscribers) => {
    return axios.put<IBackendRes<ISubscribers>>(`/api/v1/subscribers`, { ...subs })
}

export const callDeleteSubscriber = (id: string) => {
    return axios.delete<IBackendRes<ISubscribers>>(`/api/v1/subscribers/${id}`);
}

export const callFetchSubscriber = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<ISubscribers>>>(`/api/v1/subscribers?${query}`);
}

export const callFetchSubscriberById = (id: string) => {
    return axios.get<IBackendRes<ISubscribers>>(`/api/v1/subscribers/${id}`);
}

export const callFetchJobsByCompanyId = async (companyId: string) => {
    try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/companies/${companyId}/jobs`);
        return await res.json();
    } catch (error) {
        console.error("Lỗi lấy danh sách jobs:", error);
        return null;
    }
};
export const callCreateReview = async (companyId: string, content: string, rating: number) => {
    const token = localStorage.getItem("access_token");

    if (!token) {
        console.error("❌ Không tìm thấy access_token, người dùng có thể chưa đăng nhập.");
        return;
    }

    const reviewData = { companyId, content, rating };
    console.log("📌 Dữ liệu gửi lên API:", reviewData);

    return axios.post("/api/reviews", reviewData, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        }
    });
};


    export const callFetchReviewsByCompany = async (companyId: string) => {
        const url = `/api/reviews/company/${companyId}`;
        console.log("📌 Đang gọi API:", url); // ✅ Log API URL
    
        try {
            const response = await axios.get(url);
            console.log("🚀 API Response:", response.data);
            return response.data;
        } catch (error: any) {
            console.error("❌ Lỗi API:", error.response?.status, error.response?.data);
            return { data: [] };
        }
    };
    

// Module Favourite Job
export const callAddToFavourite = async (jobId: number, userId: number) => {
    const token = localStorage.getItem("access_token");

    if (!token) {
        console.error("❌ Không tìm thấy access_token, người dùng có thể chưa đăng nhập.");
        return { success: false, message: "Người dùng chưa đăng nhập" };
    }

    try {
        const response = await axios.post(
            `/api/favorites/${jobId}?userId=${userId}`, 
            {}, // POST không cần body
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}` 
                }
            }
        );

        console.log("✅ Thêm vào danh sách yêu thích thành công:", response.data);
        return { success: true, data: response.data };

    } catch (error: any) {
        console.error("❌ Lỗi API:", error.response?.status, error.response?.data);
        return { success: false, message: error.response?.data?.message || "Lỗi không xác định" };
    }
};

export const callGetFavouriteJobs = async (userId: number) => {
    const token = localStorage.getItem("access_token");

    if (!token) {
        console.error("❌ Không tìm thấy access_token, người dùng có thể chưa đăng nhập.");
        return { success: false, message: "Người dùng chưa đăng nhập" };
    }

    try {
        const response = await axios.get(`/api/favorites?userId=${userId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        console.log("✅ Lấy danh sách yêu thích thành công:", response.data);
        return { success: true, data: response.data };

    } catch (error: any) {
        console.error("❌ Lỗi API:", error.response?.status, error.response?.data);
        return { success: false, message: error.response?.data?.message || "Lỗi không xác định" };
    }
};
export const callFetchUserFavourites = async (userId: number) => {
    try {
        const response = await axios.get(`/api/favorites?userId=${userId}`);
        return response;
    } catch (error) {
        console.error("Lỗi khi lấy danh sách yêu thích", error);
        return null;
    }
};

//Module CV
/**
 * Tạo CV mới
 */
    export const callCreateNewCV = async (cvData: any): Promise<number | null> => {
        try {
            console.log("📤 Gửi request tạo CV:", cvData);
            
            const response = await axios.post("/api/v1/gencv/create", cvData, {
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                withCredentials: true,
            });

            console.log("🚀 Response từ backend:", response.data);

            // Kiểm tra response có đúng cấu trúc không
            if (response.data?.data) {
                const cvId = response.data.data;
                console.log("✅ ID CV nhận được:", cvId);
                return cvId;
            }

            console.warn("⚠️ Dữ liệu trả về không đúng định dạng:", response.data);
            return null;
        } catch (error: any) {
            console.error("❌ Lỗi tạo CV:", error.response?.data || error);
            throw error; // Ném lỗi để xử lý ở component
        }
    };

export const callExportCV = async (cvId: string) => {
    try {
        const token = localStorage.getItem("access_token");
        
        if (!token) {
            console.error("❌ Không tìm thấy access_token, người dùng có thể chưa đăng nhập.");
            alert("⚠️ Vui lòng đăng nhập để tải CV!");
            return;
        }

        console.log("🔑 Token:", token); // Log token để kiểm tra

        const response = await axios.get(`/api/v1/gencv/export/${cvId}`, {
            responseType: "blob",
            headers: {
                "Accept": "application/pdf",
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            withCredentials: true // Thêm withCredentials để gửi cookie
        });

        console.log("📥 Response headers:", response.headers); // Log headers để kiểm tra

        // Kiểm tra nếu response là JSON (error message)
        const contentType = response.headers['content-type'];
        if (contentType && contentType.includes('application/json')) {
            const reader = new FileReader();
            reader.onload = () => {
                try {
                    const errorJson = JSON.parse(reader.result as string);
                    console.error("❌ Server error:", errorJson); // Log chi tiết lỗi từ server
                    alert(`⚠️ ${errorJson.message || 'Lỗi khi tải file CV PDF!'}`);
                } catch (e) {
                    console.error("❌ Error parsing JSON:", e);
                    alert("⚠️ Lỗi khi tải file CV PDF!");
                }
            };
            reader.readAsText(response.data);
            return;
        }

        // Nếu là PDF, xử lý tải xuống
        if (!contentType || !contentType.includes('application/pdf')) {
            console.error("❌ Invalid content type:", contentType);
            throw new Error('Invalid response format. Expected PDF.');
        }

        // Tạo blob từ response data
        const blob = new Blob([response.data], { type: "application/pdf" });
        
        // Tạo URL cho blob
        const url = window.URL.createObjectURL(blob);
        
        // Tạo link để download
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `cv_${cvId}.pdf`);
        
        // Thêm link vào DOM và click
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

    } catch (error: any) {
        console.error("❌ Lỗi tải PDF:", error);
        
        if (error.response?.status === 403) {
            console.error("❌ Forbidden error details:", error.response.data);
            alert("⚠️ Bạn không có quyền tải CV này hoặc phiên đăng nhập đã hết hạn! Vui lòng đăng nhập lại.");
            // Có thể thêm logic để refresh token hoặc redirect về trang login
            return;
        }

        // Xử lý error response từ server
        if (error.response?.data instanceof Blob) {
            const reader = new FileReader();
            reader.onload = () => {
                try {
                    const errorJson = JSON.parse(reader.result as string);
                    console.error("❌ Server error response:", errorJson);
                    alert(`⚠️ ${errorJson.message || 'Lỗi khi tải file CV PDF!'}`);
                } catch (e) {
                    console.error("❌ Error parsing error response:", e);
                    alert("⚠️ Lỗi khi tải file CV PDF!");
                }
            };
            reader.readAsText(error.response.data);
        } else {
            console.error("❌ Unknown error:", error);
            alert("⚠️ Lỗi khi tải file CV PDF! Vui lòng thử lại sau.");
        }
    }
};

export const callPreviewCV = async (cvId: string) => {
    try {
        const token = localStorage.getItem("access_token");
        
        if (!token) {
            console.error("❌ Không tìm thấy access_token");
            return { success: false, message: "Vui lòng đăng nhập để xem CV!" };
        }

        const response = await axios.get(`/api/v1/gencv/preview/${cvId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        return { success: true, data: response.data?.data };
    } catch (error: any) {
        console.error("❌ Lỗi khi xem CV:", error);
        return { 
            success: false, 
            message: error.response?.data?.message || "Lỗi khi tải thông tin CV!"
        };
    }
};

export const callDownloadCV = async (cvId: string) => {
    try {
        const token = localStorage.getItem("access_token");
        
        if (!token) {
            console.error("❌ Không tìm thấy access_token");
            alert("⚠️ Vui lòng đăng nhập để tải CV!");
            return;
        }

        const response = await axios.get(`/api/v1/gencv/download/${cvId}`, {
            responseType: "blob",
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/pdf"
            }
        });

        // Tạo blob từ response data
        const blob = new Blob([response.data], { type: "application/pdf" });
        
        // Tạo URL cho blob
        const url = window.URL.createObjectURL(blob);
        
        // Tạo link để download
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `cv_${cvId}.pdf`);
        
        // Thêm link vào DOM và click
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

    } catch (error: any) {
        console.error("❌ Lỗi tải PDF:", error);
        alert("⚠️ Lỗi khi tải file CV PDF! Vui lòng thử lại sau.");
    }
};

/**
 * Get all active subscription packages
 */
export const callGetActivePackages = () => {
  return axios.get<IBackendRes<ISubscriptionPackage[]>>('/api/v1/packages');
}

/**
 * Get subscription package by ID
 */
export const callGetPackageById = (id: number) => {
  return axios.get<IBackendRes<ISubscriptionPackage>>(`/api/v1/packages/${id}`);
}

/**
 * Purchase a subscription package
 */
export const callPurchaseSubscription = (data: IPurchaseSubscriptionRequest) => {
  return axios.post<IBackendRes<IEmployerSubscription>>('/api/v1/employer/subscribe', data);
}

/**
 * Get active subscriptions for an employer
 */
export const callGetActiveSubscriptions = (userId: number) => {
  return axios.get<IBackendRes<IEmployerSubscription[]>>(`/api/v1/employer/${userId}/subscriptions`);
}

/**
 * Get subscription status for an employer and company
 */
export const callGetSubscriptionStatus = (userId: number, companyId: number) => {
  return axios.get<IBackendRes<ISubscriptionStatus>>(`/api/v1/employer/${userId}/company/${companyId}/status`);
}

/**
 * Create VNPay payment for subscription package
 */
export const callCreateVNPayPayment = (data: any) => {
    // Đảm bảo returnUrl trỏ về frontend
    const updatedData = {
        ...data,
        // Điều chỉnh returnUrl để đảm bảo nó trỏ về frontend thay vì backend
        returnUrl: `${window.location.origin}/subscription/payment-result`
    };
    
    console.log("Gọi API tạo VNPay payment, request data:", updatedData);
    
    return axios.post("/api/v1/payments/create", updatedData, {
        headers: {
            'Content-Type': 'application/json'
        },
        responseType: 'text', // Thay đổi responseType thành 'text' vì backend trả về chuỗi URL trực tiếp
        transformResponse: [(responseData) => {
            // Xử lý response gốc từ backend
            console.log("VNPay API raw response:", responseData);
            
            try {
                // Kiểm tra xem response có phải là URL VNPay không
                if (responseData && typeof responseData === 'string' && 
                    (responseData.startsWith('http') || responseData.includes('vnpayment.vn'))) {
                    // Trả về đúng định dạng mà frontend đang mong đợi
                    return { 
                        paymentUrl: responseData.trim() 
                    };
                }
                
                // Nếu không phải URL trực tiếp, thử parse JSON
                return JSON.parse(responseData);
            } catch (error) {
                console.log("Error parsing VNPay response:", error);
                // Nếu không parse được JSON và có vẻ là URL, trả về trực tiếp
                if (responseData && typeof responseData === 'string' && 
                    (responseData.startsWith('http') || responseData.includes('vnpayment.vn'))) {
                    return { 
                        paymentUrl: responseData.trim() 
                    };
                }
                return { 
                    error: true, 
                    message: responseData 
                };
            }
        }],
        timeout: 15000 // Tăng timeout lên 15 giây
    });
};

/**
 * Lấy danh sách gói VIP đang hoạt động của user
 */
export const callGetUserSubscriptions = (userId: number) => {
  return axios.get<IBackendRes<any>>(`/api/v1/payments/user/${userId}/subscriptions`);
};

// Subscription Package Management APIs
export const callGetAllPackages = () => {
    return axios.get<IBackendRes<{
        meta: {
            page: number;
            pageSize: number;
            pages: number;
            total: number;
        };
        result: ISubscriptionPackage[];
    }>>('/api/v1/packages');
};

export const callCreatePackage = (data: any) => {
    return axios.post<IBackendRes<ISubscriptionPackage>>('/api/v1/packages', data);
};

export const callUpdatePackage = (id: number, data: any) => {
    return axios.put<IBackendRes<ISubscriptionPackage>>(`/api/v1/packages/${id}`, data);
};

export const callDeletePackage = (id: number) => {
    return axios.delete<IBackendRes<ISubscriptionPackage>>(`/api/v1/packages/${id}`);
};

// Promotion Management APIs
export interface IPromotion {
    id: number;
    name: string;
    description: string;
    discountPercentage: number;
    startDate: string;
    endDate: string;
    isActive: boolean;
    code: string;
    subscriptionPackageId: number;
}

export const callGetAllPromotions = () => {
    return axios.get<IBackendRes<IPromotion[]>>('/api/v1/promotions');
};

export const callGetPromotionById = (id: number) => {
    return axios.get<IBackendRes<IPromotion>>(`/api/v1/promotions/${id}`);
};

export const callCreatePromotion = (data: Omit<IPromotion, 'id'>) => {
    return axios.post<IBackendRes<IPromotion>>('/api/v1/promotions', data);
};

export const callUpdatePromotion = (id: number, data: Partial<IPromotion>) => {
    return axios.put<IBackendRes<IPromotion>>(`/api/v1/promotions/${id}`, data);
};

export const callDeletePromotion = (id: number) => {
    return axios.delete<IBackendRes<IPromotion>>(`/api/v1/promotions/${id}`);
};

export const callGetPromotionsByPackage = (packageId: number) => {
    return axios.get<IBackendRes<IPromotion[]>>(`/api/v1/promotions/package/${packageId}`);
};

export const callGetActivePromotions = () => {
    return axios.get<IBackendRes<IPromotion[]>>('/api/v1/promotions/active');
};

export const callGetPackagePriceWithDiscount = (packageId: number): Promise<IBackendRes<any>> => {
    return axios.get(`/api/v1/packages/${packageId}/price-with-discount`);
};

// Admin Statistics DTO
export interface AdminStatisticsDTO {
    totalUsers: number;
    totalCompanies: number;
    totalJobs: number;
    totalCVs: number;
}

// Admin Statistics APIs
export const callGetAllStatistics = () => {
    return axios.get<IBackendRes<AdminStatisticsDTO>>('/api/v1/admin/statistics');
};

export const callGetJobStatistics = () => {
    return axios.get<IBackendRes<AdminStatisticsDTO>>('/api/v1/admin/statistics/jobs');
};

export const callGetUserStatistics = () => {
    return axios.get<IBackendRes<AdminStatisticsDTO>>('/api/v1/admin/statistics/users');
};

export const callGetCompanyStatistics = () => {
    return axios.get<IBackendRes<AdminStatisticsDTO>>('/api/v1/admin/statistics/companies');
};

export const callGetCVStatistics = () => {
    return axios.get<IBackendRes<AdminStatisticsDTO>>('/api/v1/admin/statistics/cvs');
};

