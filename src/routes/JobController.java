package vn.hstore.jobhunter.controller;

import java.util.Map;
import java.util.Optional;
import java.util.List;
import java.util.ArrayList;
import java.util.HashMap;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.turkraft.springfilter.boot.Filter;

import jakarta.validation.Valid;
import vn.hstore.jobhunter.domain.Job;
import vn.hstore.jobhunter.domain.response.RestResponse;
import vn.hstore.jobhunter.domain.response.ResultPaginationDTO;
import vn.hstore.jobhunter.domain.response.job.ResCreateJobDTO;
import vn.hstore.jobhunter.domain.response.job.ResUpdateJobDTO;
import vn.hstore.jobhunter.service.JobService;
import vn.hstore.jobhunter.util.annotation.ApiMessage;
import vn.hstore.jobhunter.util.constant.LevelEnum;
import vn.hstore.jobhunter.util.error.IdInvalidException;
import vn.hstore.jobhunter.util.error.QuotaExceededException;
import vn.hstore.jobhunter.util.constant.LocationEnum;

@RestController
@RequestMapping("/api/v1")
public class JobController {

    private final JobService jobService;

    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    @PostMapping("/jobs")
    @ApiMessage("Create a job")
    public ResponseEntity<?> create(@Valid @RequestBody Job job) {
        try {
            ResCreateJobDTO createdJob = this.jobService.create(job);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdJob);
        } catch (QuotaExceededException e) {
            // Return specific error for quota exceeded
            RestResponse<Object> errorResponse = new RestResponse<>();
            errorResponse.setStatusCode(403);
            errorResponse.setError("Quota Exceeded");
            errorResponse.setMessage(e.getMessage());
            errorResponse.setData(null);

            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
        } catch (Exception e) {
            // General error handling
            RestResponse<Object> errorResponse = new RestResponse<>();
            errorResponse.setStatusCode(500);
            errorResponse.setError("Internal Server Error");
            errorResponse.setMessage(e.getMessage());
            errorResponse.setData(null);

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PutMapping("/jobs")
    @ApiMessage("Update a job")
    public ResponseEntity<ResUpdateJobDTO> update(@Valid @RequestBody Job job) throws IdInvalidException {
        Optional<Job> currentJob = this.jobService.fetchJobById(job.getId());
        if (!currentJob.isPresent()) {
            throw new IdInvalidException("Job not found");
        }

        return ResponseEntity.ok()
                .body(this.jobService.update(job, currentJob.get()));
    }

    // @DeleteMapping("/jobs/{id}")
    // @ApiMessage("Delete a job by id")
    // public ResponseEntity<Void> delete(@PathVariable("id") long id) throws IdInvalidException {
    //     Optional<Job> currentJob = this.jobService.fetchJobById(id);
    //     if (!currentJob.isPresent()) {
    //         throw new IdInvalidException("Job not found");
    //     }
    //     this.jobService.delete(id);
    //     return ResponseEntity.ok().body(null);
    // }
    @DeleteMapping("/jobs/{id}")
    @ApiMessage("Delete a job by id")
    public ResponseEntity<?> delete(@PathVariable("id") long id) throws IdInvalidException {
        Optional<Job> currentJob = this.jobService.fetchJobById(id);
        if (!currentJob.isPresent()) {
            throw new IdInvalidException("Job not found");
        }

        this.jobService.delete(id);

        // Trả về thông báo thành công rõ ràng
        return ResponseEntity.ok().body(Map.of("message", "Xóa công việc thành công"));
    }

    @GetMapping("/jobs/{id}")
    @ApiMessage("Get a job by id")
    public ResponseEntity<Job> getJob(@PathVariable("id") long id) throws IdInvalidException {
        Optional<Job> currentJob = this.jobService.fetchJobById(id);
        if (!currentJob.isPresent()) {
            throw new IdInvalidException("Job not found");
        }

        return ResponseEntity.ok().body(currentJob.get());
    }

    @GetMapping("/jobs")
    @ApiMessage("Get job with pagination")
    public ResponseEntity<ResultPaginationDTO> getAllJob(
            @Filter Specification<Job> spec,
            Pageable pageable,
            @RequestParam(required = false, name = "level") LevelEnum level,
            @RequestParam(required = false, name = "minSalary") Double minSalary,
            @RequestParam(required = false, name = "maxSalary") Double maxSalary,
            @RequestParam(required = false, name = "location") String location) {

        return ResponseEntity.ok().body(this.jobService.fetchAll(spec, pageable, level, minSalary, maxSalary, location));
    }

    @GetMapping("/jobs/statistics")
    @ApiMessage("Get job statistics")
    public ResponseEntity<?> getJobStatistics() {
        try {
            Map<String, Object> statistics = this.jobService.getJobStatistics();

            RestResponse<Map<String, Object>> response = new RestResponse<>();
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

    @GetMapping("/jobs/count")
    @ApiMessage("Get total number of jobs")
    public ResponseEntity<?> getTotalJobCount() {
        try {
            long totalJobs = this.jobService.getTotalJobCount();

            RestResponse<Long> response = new RestResponse<>();
            response.setStatusCode(200);
            response.setError(null);
            response.setMessage("Lấy tổng số công việc thành công");
            response.setData(totalJobs);

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

    @GetMapping("/jobs/locations")
    @ApiMessage("Get list of available locations")
    public ResponseEntity<List<Map<String, String>>> getLocations() {
        List<Map<String, String>> locations = new ArrayList<>();
        
        // Thêm các thành phố lớn
        Map<String, String> majorCities = new HashMap<>();
        majorCities.put("id", "major");
        majorCities.put("name", "Thành phố lớn");
        majorCities.put("locations", String.join(",", 
            LocationEnum.HA_NOI.getDisplayName(),
            LocationEnum.HO_CHI_MINH.getDisplayName(),
            LocationEnum.DA_NANG.getDisplayName()
        ));
        locations.add(majorCities);
        
        // Thêm Others
        Map<String, String> others = new HashMap<>();
        others.put("id", "others");
        others.put("name", "Tỉnh thành khác");
        others.put("locations", "Others");
        locations.add(others);
        
        // Thêm tất cả các tỉnh thành
        for (LocationEnum location : LocationEnum.values()) {
            Map<String, String> locationMap = new HashMap<>();
            locationMap.put("id", location.name());
            locationMap.put("name", location.getDisplayName());
            locations.add(locationMap);
        }
        
        return ResponseEntity.ok(locations);
    }
}
