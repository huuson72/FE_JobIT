package vn.hstore.jobhunter.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import vn.hstore.jobhunter.domain.response.RestResponse;
import vn.hstore.jobhunter.domain.response.admin.AdminStatisticsDTO;
import vn.hstore.jobhunter.service.AdminStatisticsService;
import vn.hstore.jobhunter.util.annotation.ApiMessage;

@RestController
@RequestMapping("/api/v1/admin/statistics")
public class AdminStatisticsController {

    private final AdminStatisticsService adminStatisticsService;

    public AdminStatisticsController(AdminStatisticsService adminStatisticsService) {
        this.adminStatisticsService = adminStatisticsService;
    }

    @GetMapping
    @ApiMessage("Get all admin statistics")
    public ResponseEntity<?> getAllStatistics() {
        try {
            AdminStatisticsDTO statistics = adminStatisticsService.getStatistics();

            RestResponse<AdminStatisticsDTO> response = new RestResponse<>();
            response.setStatusCode(200);
            response.setError(null);
            response.setMessage("Lấy thống kê thành công");
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

    @GetMapping("/jobs")
    @ApiMessage("Get job statistics")
    public ResponseEntity<?> getJobStatistics() {
        try {
            AdminStatisticsDTO statistics = adminStatisticsService.getJobStatistics();

            RestResponse<AdminStatisticsDTO> response = new RestResponse<>();
            response.setStatusCode(200);
            response.setError(null);
            response.setMessage("Lấy thống kê công việc thành công");
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

    @GetMapping("/users")
    @ApiMessage("Get user statistics")
    public ResponseEntity<?> getUserStatistics() {
        try {
            AdminStatisticsDTO statistics = adminStatisticsService.getUserStatistics();

            RestResponse<AdminStatisticsDTO> response = new RestResponse<>();
            response.setStatusCode(200);
            response.setError(null);
            response.setMessage("Lấy thống kê người dùng thành công");
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

    @GetMapping("/companies")
    @ApiMessage("Get company statistics")
    public ResponseEntity<?> getCompanyStatistics() {
        try {
            AdminStatisticsDTO statistics = adminStatisticsService.getCompanyStatistics();

            RestResponse<AdminStatisticsDTO> response = new RestResponse<>();
            response.setStatusCode(200);
            response.setError(null);
            response.setMessage("Lấy thống kê công ty thành công");
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

    @GetMapping("/cvs")
    @ApiMessage("Get CV statistics")
    public ResponseEntity<?> getCVStatistics() {
        try {
            AdminStatisticsDTO statistics = adminStatisticsService.getCVStatistics();

            RestResponse<AdminStatisticsDTO> response = new RestResponse<>();
            response.setStatusCode(200);
            response.setError(null);
            response.setMessage("Lấy thống kê CV thành công");
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
} 