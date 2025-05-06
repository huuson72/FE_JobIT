package vn.hstore.jobhunter.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import vn.hstore.jobhunter.domain.request.ReqUpdateHRCompanyDTO;
import vn.hstore.jobhunter.domain.request.ReqUpdateHRCompanyInfoDTO;
import vn.hstore.jobhunter.domain.request.ReqUpdateEmployerInfoDTO;
import vn.hstore.jobhunter.domain.request.ReqUpdateHRInfoDTO;
import vn.hstore.jobhunter.domain.response.ResUserDTO;
import vn.hstore.jobhunter.service.UserService;
import vn.hstore.jobhunter.util.annotation.ApiMessage;

@RestController
@RequestMapping("/api/v1/hr")
public class HRController {

    private final UserService userService;

    public HRController(UserService userService) {
        this.userService = userService;
    }

    @PutMapping("/update-company")
    @ApiMessage("Cập nhật công ty cho HR")
    public ResponseEntity<ResUserDTO> updateHRCompany(@Valid @RequestBody ReqUpdateHRCompanyDTO request) {
        ResUserDTO updatedUser = userService.updateHRCompany(
            request.getHrId(), 
            request.getCompanyId(),
            request.getName(),
            request.getDescription(),
            request.getAddress(),
            request.getLogo()
        );
        return ResponseEntity.status(HttpStatus.OK).body(updatedUser);
    }

    @PutMapping("/update-company-info")
    @ApiMessage("Cập nhật thông tin công ty")
    public ResponseEntity<ResUserDTO> updateCompanyInfo(@Valid @RequestBody ReqUpdateHRCompanyInfoDTO request) {
        ResUserDTO updatedUser = userService.updateCompanyInfo(
            request.getCompanyName(),
            request.getCompanyAddress(),
            request.getCompanyDescription(),
            request.getCompanyLogo(),
            request.getBusinessLicense()
        );
        return ResponseEntity.status(HttpStatus.OK).body(updatedUser);
    }

    @PutMapping("/update-employer-info")
    @ApiMessage("Cập nhật thông tin nhà tuyển dụng")
    public ResponseEntity<ResUserDTO> updateEmployerInfo(@Valid @RequestBody ReqUpdateEmployerInfoDTO request) {
        ResUserDTO updatedUser = userService.updateEmployerInfo(
            request.getHrId(),
            request.getCompanyId(),
            request.getCompanyName(),
            request.getCompanyAddress(),
            request.getCompanyDescription(),
            request.getCompanyLogo(),
            request.getBusinessLicense(),
            request.getName(),
            request.getAddress(),
            request.getPhone(),
            request.getAge(),
            request.getGender()
        );
        return ResponseEntity.status(HttpStatus.OK).body(updatedUser);
    }

    @PutMapping("/update-info")
    @ApiMessage("Cập nhật thông tin nhà tuyển dụng và công ty")
    public ResponseEntity<ResUserDTO> updateHRInfo(@Valid @RequestBody ReqUpdateHRInfoDTO request) {
        ResUserDTO updatedUser = userService.updateHRInfo(
            request.getName(),
            request.getAddress(),
            request.getPhone(),
            request.getAge(),
            request.getGender(),
            request.getBusinessLicense(),
            request.getCompanyName(),
            request.getCompanyAddress(),
            request.getCompanyDescription(),
            request.getCompanyLogo()
        );
        return ResponseEntity.status(HttpStatus.OK).body(updatedUser);
    }
} 