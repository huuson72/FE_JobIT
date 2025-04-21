export const getEnvironmentConfig = () => {
    const isDevelopment = import.meta.env.MODE === 'development';
    
    return {
        // URL của frontend
        frontendUrl: isDevelopment 
            ? 'http://localhost:3000'  // URL local
            : 'https://hsjobit.onrender.com', // URL production
            
        // URL của backend
        backendUrl: isDevelopment
            ? 'http://localhost:8080'  // URL local
            : 'https://hsjobit.onrender.com', // URL production
            
        // URL callback cho VNPay
        vnpayReturnUrl: isDevelopment
            ? 'http://localhost:3000/subscription/payment-result'  // URL local
            : 'https://hsjobit.onrender.com/subscription/payment-result' // URL production
    };
}; 