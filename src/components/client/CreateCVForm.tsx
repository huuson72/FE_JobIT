import React, { useState, useRef } from "react";
import html2canvas from 'html2canvas';
import jsPDF from "jspdf";
import CVTemplate from './CVTemplate';
import './CreateCVForm.css';
import './CVTemplatePDF.css';

const CreateCVForm: React.FC = () => {
    const [cvData, setCvData] = useState({
        fullName: "",
        email: "",
        phone: "",
        address: "",
        education: "",
        experience: "",
        skills: "",
    });

    const [isLoading, setIsLoading] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const cvRef = useRef<HTMLDivElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCvData({ ...cvData, [name]: value });
    };

    const generatePDF = async () => {
        const element = cvRef.current;
        if (!element) {
            throw new Error("Không tìm thấy nội dung CV");
        }

        try {
            // Tạo canvas từ element
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false,
                width: 794, // A4 width in pixels
                height: 1123, // A4 height in pixels
            });

            // Tạo PDF
            const imgData = canvas.toDataURL('image/jpeg', 1.0);
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight);
            return pdf;

        } catch (error) {
            console.error("Lỗi trong quá trình tạo PDF:", error);
            throw error;
        }
    };

    const handleDownload = async () => {
        try {
            setIsLoading(true);
            const pdfGenerator = await generatePDF();
            if (pdfGenerator) {
                pdfGenerator.save(`cv_${cvData.fullName.replace(/\s+/g, '_')}.pdf`);
            }
        } catch (error: any) {
            alert(`Lỗi khi tải CV: ${error.message || "Vui lòng thử lại"}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="cv-container">
            {isLoading && (
                <div className="loading-overlay">
                    <div className="spinner"></div>
                </div>
            )}

            <div className="cv-page-header">
                <h1>Tạo CV</h1>
            </div>

            <div className="form-section">
                <form className="cv-form">
                    <div className="form-group">
                        <label htmlFor="fullName">Họ và Tên</label>
                        <input
                            type="text"
                            id="fullName"
                            name="fullName"
                            placeholder="Nguyễn Văn A"
                            value={cvData.fullName}
                            onChange={handleChange}
                            className="form-control"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="example@example.com"
                            value={cvData.email}
                            onChange={handleChange}
                            className="form-control"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="phone">Số điện thoại</label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            placeholder="0123456789"
                            value={cvData.phone}
                            onChange={handleChange}
                            className="form-control"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="address">Địa chỉ</label>
                        <input
                            type="text"
                            id="address"
                            name="address"
                            placeholder="Thành phố Hồ Chí Minh"
                            value={cvData.address}
                            onChange={handleChange}
                            className="form-control"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="education">Học vấn</label>
                        <textarea
                            id="education"
                            name="education"
                            placeholder="2018-2022: Cử nhân CNTT - Đại học ABC"
                            value={cvData.education}
                            onChange={handleChange}
                            className="form-control"
                        ></textarea>
                    </div>

                    <div className="form-group">
                        <label htmlFor="experience">Kinh nghiệm làm việc</label>
                        <textarea
                            id="experience"
                            name="experience"
                            placeholder="2022-Hiện tại: Developer - Công ty XYZ"
                            value={cvData.experience}
                            onChange={handleChange}
                            className="form-control"
                        ></textarea>
                    </div>

                    <div className="form-group">
                        <label htmlFor="skills">Kỹ năng</label>
                        <textarea
                            id="skills"
                            name="skills"
                            placeholder="React JS, JavaScript, HTML/CSS"
                            value={cvData.skills}
                            onChange={handleChange}
                            className="form-control"
                        ></textarea>
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            onClick={() => setShowPreview(true)}
                            className="btn btn-primary"
                        >
                            Xem trước
                        </button>
                    </div>
                </form>
            </div>

            {showPreview && (
                <div className="preview-modal">
                    <div className="preview-content">
                        <div className="preview-header">
                            <h3>Xem trước CV</h3>
                            <div className="preview-actions">
                                <button
                                    onClick={handleDownload}
                                    className="btn btn-success"
                                    disabled={isLoading}
                                >
                                    Tải PDF
                                </button>
                                <button
                                    onClick={() => setShowPreview(false)}
                                    className="btn btn-secondary"
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                        <div className="preview-body">
                            <div ref={cvRef}>
                                <CVTemplate data={cvData} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateCVForm;
