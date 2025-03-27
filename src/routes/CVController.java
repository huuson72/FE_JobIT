package vn.hstore.jobhunter.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ContentDisposition;

import jakarta.validation.Valid;
import vn.hstore.jobhunter.domain.CV;
import vn.hstore.jobhunter.domain.request.CVRequestDTO;
import vn.hstore.jobhunter.domain.response.RestResponse;
import vn.hstore.jobhunter.service.CVService;

import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/gencv")
public class CVController {

    private final CVService cvService;

    public CVController(CVService cvService) {
        this.cvService = cvService;
    }

    @PostMapping("/create")
    public ResponseEntity<?> createCV(@Valid @RequestBody CVRequestDTO cvRequest) {
        try {
            CV cv = cvService.createCV(cvRequest);

            RestResponse<Long> response = new RestResponse<>();
            response.setStatusCode(200);
            response.setError(null);
            response.setMessage("Tạo CV thành công!");
            response.setData(cv.getId());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            RestResponse<Object> errorResponse = new RestResponse<>();
            errorResponse.setStatusCode(500);
            errorResponse.setError("Internal Server Error");
            errorResponse.setMessage(e.getMessage());
            errorResponse.setData(null);

            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/preview/{cvId}")
    public ResponseEntity<?> previewCV(@PathVariable("cvId") Long cvId) {
        try {
            CV cv = cvService.getCVById(cvId);
            
            Map<String, Object> cvData = new HashMap<>();
            cvData.put("title", cv.getTitle());
            cvData.put("fullName", cv.getFullName());
            cvData.put("email", cv.getEmail());
            cvData.put("phoneNumber", cv.getPhoneNumber());
            cvData.put("address", cv.getAddress());
            cvData.put("education", cv.getEducation());
            cvData.put("experience", cv.getExperience());
            cvData.put("skills", cv.getSkills());
            cvData.put("customContent", cv.getCustomContent());

            RestResponse<Map<String, Object>> response = new RestResponse<>();
            response.setStatusCode(200);
            response.setError(null);
            response.setMessage("Lấy thông tin CV thành công!");
            response.setData(cvData);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            RestResponse<Object> errorResponse = new RestResponse<>();
            errorResponse.setStatusCode(500);
            errorResponse.setError("Internal Server Error");
            errorResponse.setMessage(e.getMessage());
            errorResponse.setData(null);

            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping(value = "/download/{cvId}", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> downloadCVAsPDF(@PathVariable("cvId") Long cvId) {
        try {
            CV cv = cvService.getCVById(cvId);
            byte[] pdfBytes = cvService.exportCVToPDF(cv);

            if (pdfBytes == null || pdfBytes.length == 0) {
                throw new RuntimeException("PDF xuất ra bị rỗng!");
            }

            String filename = "cv_" + (cv.getFullName() != null ? cv.getFullName().replaceAll("\\s+", "_") : "no_name") + ".pdf";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDisposition(ContentDisposition.attachment().filename(filename).build());
            headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

            return ResponseEntity.ok()
                    .headers(headers)
                    .contentLength(pdfBytes.length)
                    .body(pdfBytes);

        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi tạo PDF: " + e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getCVsByUserId(@PathVariable("userId") Long userId) {
        try {
            List<CV> cvs = cvService.getCVsByUserId(userId);
            
            RestResponse<List<CV>> response = new RestResponse<>();
            response.setStatusCode(200);
            response.setError(null);
            response.setMessage("Lấy danh sách CV thành công!");
            response.setData(cvs);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            RestResponse<Object> errorResponse = new RestResponse<>();
            errorResponse.setStatusCode(500);
            errorResponse.setError("Internal Server Error");
            errorResponse.setMessage(e.getMessage());
            errorResponse.setData(null);

            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @PutMapping("/{cvId}")
    public ResponseEntity<?> updateCV(@PathVariable("cvId") Long cvId, @Valid @RequestBody CVRequestDTO cvRequest) {
        try {
            CV cv = cvService.updateCV(cvId, cvRequest);

            RestResponse<CV> response = new RestResponse<>();
            response.setStatusCode(200);
            response.setError(null);
            response.setMessage("Cập nhật CV thành công!");
            response.setData(cv);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            RestResponse<Object> errorResponse = new RestResponse<>();
            errorResponse.setStatusCode(500);
            errorResponse.setError("Internal Server Error");
            errorResponse.setMessage(e.getMessage());
            errorResponse.setData(null);

            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @DeleteMapping("/{cvId}")
    public ResponseEntity<?> deleteCV(@PathVariable("cvId") Long cvId) {
        try {
            cvService.deleteCV(cvId);

            RestResponse<Object> response = new RestResponse<>();
            response.setStatusCode(200);
            response.setError(null);
            response.setMessage("Xóa CV thành công!");
            response.setData(null);

            return ResponseEntity.ok(response);
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
