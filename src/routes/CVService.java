package vn.hstore.jobhunter.service;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;

import org.springframework.stereotype.Service;

import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;

import vn.hstore.jobhunter.domain.CV;
import vn.hstore.jobhunter.domain.Job;
import vn.hstore.jobhunter.domain.User;
import vn.hstore.jobhunter.domain.request.CVRequestDTO;
import vn.hstore.jobhunter.repository.CVRepository;
import vn.hstore.jobhunter.repository.JobRepository;
import vn.hstore.jobhunter.repository.UserRepository;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;

@Service
public class CVService {

    private final CVRepository cvRepository;
    private final UserRepository userRepository;
    private final JobRepository jobRepository;

    public CVService(CVRepository cvRepository, UserRepository userRepository, JobRepository jobRepository) {
        this.cvRepository = cvRepository;
        this.userRepository = userRepository;
        this.jobRepository = jobRepository;
    }

    public CV createCV(CVRequestDTO cvRequest) {
        User user = userRepository.findById(cvRequest.getUserId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user"));

        Job job = jobRepository.findById(cvRequest.getJobId()).orElse(null);

        CV cv = new CV();
        cv.setTitle(cvRequest.getTitle());
        cv.setFullName(cvRequest.getFullName());
        cv.setEmail(cvRequest.getEmail());
        cv.setPhoneNumber(cvRequest.getPhoneNumber());
        cv.setAddress(cvRequest.getAddress());
        cv.setEducation(cvRequest.getEducation());
        cv.setExperience(cvRequest.getExperience());
        cv.setSkills(cvRequest.getSkills());
        cv.setCustomContent(cvRequest.getCustomContent());
        cv.setUser(user);
        cv.setJob(job);

        return cvRepository.save(cv);
    }

    public byte[] exportCVToPDF(CV cv) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            // Header với tên và thông tin liên hệ
            Table headerTable = new Table(2);
            headerTable.setWidth(UnitValue.createPercentValue(100));
            
            // Phần bên trái - Tên và tiêu đề
            Cell leftCell = new Cell(2, 1);
            leftCell.add(new Paragraph(cv.getTitle() != null ? cv.getTitle() : "CURRICULUM VITAE")
                    .setFontSize(24)
                    .setBold()
                    .setTextAlignment(TextAlignment.LEFT));
            leftCell.add(new Paragraph(cv.getFullName() != null ? cv.getFullName() : "")
                    .setFontSize(20)
                    .setBold()
                    .setTextAlignment(TextAlignment.LEFT));
            headerTable.addCell(leftCell);

            // Phần bên phải - Thông tin liên hệ
            Cell rightCell = new Cell(2, 1);
            rightCell.add(new Paragraph("Thông tin liên hệ")
                    .setFontSize(14)
                    .setBold()
                    .setTextAlignment(TextAlignment.RIGHT));
            rightCell.add(new Paragraph(cv.getEmail() != null ? "Email: " + cv.getEmail() : "")
                    .setFontSize(12)
                    .setTextAlignment(TextAlignment.RIGHT));
            rightCell.add(new Paragraph(cv.getPhoneNumber() != null ? "Số điện thoại: " + cv.getPhoneNumber() : "")
                    .setFontSize(12)
                    .setTextAlignment(TextAlignment.RIGHT));
            rightCell.add(new Paragraph(cv.getAddress() != null ? "Địa chỉ: " + cv.getAddress() : "")
                    .setFontSize(12)
                    .setTextAlignment(TextAlignment.RIGHT));
            headerTable.addCell(rightCell);

            document.add(headerTable);
            document.add(new Paragraph("\n"));

            // Học vấn
            if (cv.getEducation() != null && !cv.getEducation().isEmpty()) {
                document.add(new Paragraph("Học vấn")
                        .setFontSize(16)
                        .setBold()
                        .setTextAlignment(TextAlignment.LEFT));
                document.add(new Paragraph(cv.getEducation())
                        .setFontSize(12)
                        .setTextAlignment(TextAlignment.LEFT));
                document.add(new Paragraph("\n"));
            }

            // Kinh nghiệm làm việc
            if (cv.getExperience() != null && !cv.getExperience().isEmpty()) {
                document.add(new Paragraph("Kinh nghiệm làm việc")
                        .setFontSize(16)
                        .setBold()
                        .setTextAlignment(TextAlignment.LEFT));
                document.add(new Paragraph(cv.getExperience())
                        .setFontSize(12)
                        .setTextAlignment(TextAlignment.LEFT));
                document.add(new Paragraph("\n"));
            }

            // Kỹ năng
            if (cv.getSkills() != null && !cv.getSkills().isEmpty()) {
                document.add(new Paragraph("Kỹ năng")
                        .setFontSize(16)
                        .setBold()
                        .setTextAlignment(TextAlignment.LEFT));
                
                // Tạo bảng kỹ năng với 2 cột
                Table skillsTable = new Table(2);
                skillsTable.setWidth(UnitValue.createPercentValue(100));
                
                // Chia kỹ năng thành 2 cột
                String[] skills = cv.getSkills().split("\n");
                for (int i = 0; i < skills.length; i++) {
                    Cell skillCell = new Cell();
                    skillCell.add(new Paragraph(skills[i].trim())
                            .setFontSize(12)
                            .setTextAlignment(TextAlignment.LEFT));
                    skillsTable.addCell(skillCell);
                }
                
                document.add(skillsTable);
                document.add(new Paragraph("\n"));
            }

            // Thông tin thêm
            if (cv.getCustomContent() != null && !cv.getCustomContent().isEmpty()) {
                document.add(new Paragraph("Thông tin thêm")
                        .setFontSize(16)
                        .setBold()
                        .setTextAlignment(TextAlignment.LEFT));
                document.add(new Paragraph(cv.getCustomContent())
                        .setFontSize(12)
                        .setTextAlignment(TextAlignment.LEFT));
            }

            // Footer
            document.add(new Paragraph("\n"));
            document.add(new Paragraph("Được tạo bởi JobHunter - " + new java.text.SimpleDateFormat("dd/MM/yyyy HH:mm").format(new java.util.Date()))
                    .setFontSize(10)
                    .setTextAlignment(TextAlignment.CENTER));

            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi tạo PDF: " + e.getMessage());
        }
    }

    public CV getCVById(Long cvId) {
        return cvRepository.findById(cvId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy CV với id: " + cvId));
    }

    private String sanitizeHtml(String input) {
        if (input == null) {
            return "";
        }
        return input.replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\n", "<br>");
    }

    public List<CV> getCVsByUserId(Long userId) {
        return cvRepository.findByUserId(userId);
    }

    public CV updateCV(Long cvId, CVRequestDTO cvRequest) {
        CV cv = getCVById(cvId);
        
        // Cập nhật thông tin CV
        cv.setTitle(cvRequest.getTitle());
        cv.setFullName(cvRequest.getFullName());
        cv.setEmail(cvRequest.getEmail());
        cv.setPhoneNumber(cvRequest.getPhoneNumber());
        cv.setAddress(cvRequest.getAddress());
        cv.setEducation(cvRequest.getEducation());
        cv.setExperience(cvRequest.getExperience());
        cv.setSkills(cvRequest.getSkills());
        cv.setCustomContent(cvRequest.getCustomContent());
        
        // Cập nhật job nếu có
        if (cvRequest.getJobId() != null) {
            Job job = jobRepository.findById(cvRequest.getJobId()).orElse(null);
            cv.setJob(job);
        }

        return cvRepository.save(cv);
    }

    public void deleteCV(Long cvId) {
        CV cv = getCVById(cvId);
        cvRepository.delete(cv);
    }

}
