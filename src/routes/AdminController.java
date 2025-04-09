package vn.hstore.jobhunter.controller;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.turkraft.springfilter.boot.Filter;

import vn.hstore.jobhunter.domain.User;
import vn.hstore.jobhunter.domain.response.ResultPaginationDTO;
import vn.hstore.jobhunter.domain.response.RestResponse;
import vn.hstore.jobhunter.service.UserService;
import vn.hstore.jobhunter.util.annotation.ApiMessage;
import vn.hstore.jobhunter.util.constant.VerificationStatus;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    private final UserService userService;

    public AdminController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/employers/pending")
    @ApiMessage("Get pending employers")
    public ResponseEntity<ResultPaginationDTO> getPendingEmployers(
            @Filter Specification<User> spec, Pageable pageable) {
        return ResponseEntity.ok(userService.getPendingEmployers(spec, pageable));
    }

    @PutMapping("/employers/{id}/verify")
    @ApiMessage("Verify employer")
    public ResponseEntity<RestResponse<User>> verifyEmployer(@PathVariable("id") Long id) {
        User verifiedUser = userService.updateEmployerVerificationStatus(id, VerificationStatus.VERIFIED);
        
        RestResponse<User> response = new RestResponse<>();
        response.setStatusCode(200);
        response.setError(null);
        response.setMessage("Xác minh nhà tuyển dụng thành công!");
        response.setData(verifiedUser);
        
        return ResponseEntity.ok(response);
    }

    @PutMapping("/employers/{id}/reject")
    @ApiMessage("Reject employer")
    public ResponseEntity<RestResponse<User>> rejectEmployer(@PathVariable("id") Long id) {
        User rejectedUser = userService.updateEmployerVerificationStatus(id, VerificationStatus.REJECTED);
        
        RestResponse<User> response = new RestResponse<>();
        response.setStatusCode(200);
        response.setError(null);
        response.setMessage("Từ chối nhà tuyển dụng thành công!");
        response.setData(rejectedUser);
        
        return ResponseEntity.ok(response);
    }
} 