package vn.hstore.jobhunter.controller;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import vn.hstore.jobhunter.domain.response.RestResponse;
import vn.hstore.jobhunter.domain.response.admin.RevenueStatisticsDTO;
import vn.hstore.jobhunter.service.RevenueStatisticsService;
import vn.hstore.jobhunter.util.annotation.ApiMessage;

@RestController
@RequestMapping("/api/v1/admin/statistics/revenue")
public class RevenueStatisticsController {

    private final RevenueStatisticsService revenueStatisticsService;

    public RevenueStatisticsController(RevenueStatisticsService revenueStatisticsService) {
        this.revenueStatisticsService = revenueStatisticsService;
    }

    @GetMapping
    @ApiMessage("Get revenue statistics")
    // Tạm thời bỏ để test
    // @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getRevenueStatistics() {
        try {
            RevenueStatisticsDTO statistics = revenueStatisticsService.getRevenueStatistics();

            RestResponse<RevenueStatisticsDTO> response = new RestResponse<>();
            response.setStatusCode(200);
            response.setError(null);
            response.setMessage("Lấy thống kê doanh thu thành công");
            response.setData(statistics);

            return ResponseEntity.ok().body(response);
        } catch (Exception e) {
            RestResponse<Object> errorResponse = new RestResponse<>();
            errorResponse.setStatusCode(500);
            errorResponse.setError("Internal Server Error");
            errorResponse.setMessage(e.getMessage());
            errorResponse.setData(null);

            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/date-range")
    @ApiMessage("Get revenue statistics by date range")
    // Tạm thời bỏ để test
    // @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getRevenueStatisticsByDateRange(
            @RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam("endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        try {
            // Kiểm tra ngày hợp lệ
            if (startDate.isAfter(endDate)) {
                RestResponse<Object> errorResponse = new RestResponse<>();
                errorResponse.setStatusCode(400);
                errorResponse.setError("Bad Request");
                errorResponse.setMessage("Ngày bắt đầu phải trước ngày kết thúc");
                errorResponse.setData(null);

                return ResponseEntity.badRequest().body(errorResponse);
            }

            RevenueStatisticsDTO statistics = revenueStatisticsService.getRevenueStatisticsByDateRange(startDate, endDate);

            RestResponse<RevenueStatisticsDTO> response = new RestResponse<>();
            response.setStatusCode(200);
            response.setError(null);
            response.setMessage("Lấy thống kê doanh thu theo khoảng thời gian thành công");
            response.setData(statistics);

            return ResponseEntity.ok().body(response);
        } catch (Exception e) {
            RestResponse<Object> errorResponse = new RestResponse<>();
            errorResponse.setStatusCode(500);
            errorResponse.setError("Internal Server Error");
            errorResponse.setMessage(e.getMessage());
            errorResponse.setData(null);

            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/test")
    @ApiMessage("Test revenue statistics API")
    // Tạm thời bỏ để test
    // @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> testRevenueStatisticsAPI() {
        RestResponse<String> response = new RestResponse<>();
        response.setStatusCode(200);
        response.setError(null);
        response.setMessage("API thống kê doanh thu hoạt động");
        response.setData("API doanh thu hoạt động bình thường");

        return ResponseEntity.ok().body(response);
    }
} 