export const getEnvironmentConfig = () => {
    // Kiểm tra xem có phải đang chạy trên local không
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    return {
        // URL của frontend
        frontendUrl: isLocal
            ? 'http://localhost:5173'  // URL local
            : 'https://hsjobit.onrender.com', // URL production
            
        // URL của backend
        backendUrl: isLocal
            ? 'http://localhost:8080'  // URL local
            : 'https://be-jobit.onrender.com', // URL production
            
        // URL callback cho VNPay
        vnpayReturnUrl: isLocal
            ? 'http://localhost:5173/subscription/payment-result'  // URL local
            : 'https://hsjobit.onrender.com/subscription/payment-result', // URL production
            
        // URL callback cho VNPay (dành cho backend)
        vnpayBackendReturnUrl: isLocal
            ? 'http://localhost:8080/api/v1/payments/vnpay-callback'  // URL local
            : 'https://be-jobit.onrender.com/api/v1/payments/vnpay-callback' // URL production
    };
}; 