export const getEnvironmentConfig = () => {
    // Kiểm tra xem có phải đang chạy trên local không
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    // Lấy URL từ biến môi trường
    const backendUrl = import.meta.env.VITE_BACKEND_URL || (isLocal ? 'http://localhost:8080' : 'https://be-jobit.onrender.com');
    
    // URL production
    const PROD_FRONTEND_URL = 'https://hsjobit.onrender.com';
    const PROD_BACKEND_URL = 'https://be-jobit.onrender.com';
    
    // URL local
    const LOCAL_FRONTEND_URL = 'http://localhost:3000';
    const LOCAL_BACKEND_URL = 'http://localhost:8080';
    
    // Force local for VNPay (thêm mới)
    const forceLocalVNPay = true; // Đặt thành true để luôn sử dụng URL local cho VNPay
    
    return {
        // URL của frontend
        frontendUrl: isLocal ? LOCAL_FRONTEND_URL : PROD_FRONTEND_URL,
            
        // URL của backend
        backendUrl: backendUrl,
            
        // URL callback cho VNPay
        vnpayReturnUrl: forceLocalVNPay || isLocal 
            ? `${LOCAL_FRONTEND_URL}/subscription/payment-result`
            : `${PROD_FRONTEND_URL}/subscription/payment-result`,
            
        // URL callback cho VNPay (dành cho backend)
        vnpayBackendReturnUrl: forceLocalVNPay || isLocal
            ? `${LOCAL_BACKEND_URL}/api/v1/payments/vnpay-callback`
            : `${PROD_BACKEND_URL}/api/v1/payments/vnpay-callback`
    };
}; 