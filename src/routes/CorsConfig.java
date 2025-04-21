package vn.hstore.jobhunter.config;

import java.util.Arrays;
import java.util.Collections;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    private static final String[] ALLOWED_ORIGINS = {
        "http://localhost:3000", 
        "http://localhost:4173", 
        "http://localhost:5173",
        "https://fe-jobit.onrender.com", 
        "https://jobit-fe.onrender.com",
        "https://be-jobit.onrender.com",
        "https://hsjobit.onrender.com"
    };
    
    private static final String[] ALLOWED_METHODS = {
        HttpMethod.GET.name(),
        HttpMethod.POST.name(),
        HttpMethod.PUT.name(),
        HttpMethod.DELETE.name(),
        HttpMethod.OPTIONS.name(),
        HttpMethod.PATCH.name()
    };
    
    private static final String[] EXPOSED_HEADERS = {
        "Content-Disposition",
        "X-Auth-Token",
        "Authorization",
        "Access-Control-Allow-Origin"
    };
    
    private static final String[] ALLOWED_HEADERS = {
        "Origin",
        "X-Requested-With",
        "Content-Type",
        "Accept",
        "Authorization",
        "x-no-retry"
    };

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(ALLOWED_ORIGINS)
                .allowedMethods(ALLOWED_METHODS)
                .allowedHeaders(ALLOWED_HEADERS)
                .exposedHeaders(EXPOSED_HEADERS)
                .allowCredentials(true)
                .maxAge(3600);
    }

    @Bean
    @Order(Ordered.HIGHEST_PRECEDENCE)
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        // Cho phép credentials
        config.setAllowCredentials(true);
        
        // Thêm các origins được phép
        config.setAllowedOrigins(Arrays.asList(ALLOWED_ORIGINS));
        
        // Thêm các headers
        config.setAllowedHeaders(Arrays.asList(ALLOWED_HEADERS));
        
        // Thêm các methods
        config.setAllowedMethods(Arrays.asList(ALLOWED_METHODS));
        
        // Thêm exposed headers
        config.setExposedHeaders(Arrays.asList(EXPOSED_HEADERS));
        
        // Thời gian cache preflight
        config.setMaxAge(3600L);
        
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
