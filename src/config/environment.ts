export const getEnvironmentConfig = () => {
    const isDevelopment = import.meta.env.MODE === 'development';
    
    return {
        // URL của frontend
        frontendUrl: isDevelopment 
            ? 'http://localhost:5173'  // URL local
            : 'https://fe-jobit.onrender.com', // URL production
            
        // URL của backend
        backendUrl: isDevelopment
            ? 'http://localhost:8080'  // URL local
            : 'https://be-jobit.onrender.com', // URL production
            
        // URL callback cho VNPay
        vnpayReturnUrl: isDevelopment
            ? 'http://localhost:5173/subscription/payment-result'  // URL local
            : 'https://fe-jobit.onrender.com/subscription/payment-result' // URL production
    };
}; 