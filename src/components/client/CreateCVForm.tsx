import React, { useState, useRef, useEffect } from "react";
import html2pdf from 'html2pdf.js';
import CVTemplate from './CVTemplate';
import { callCreateNewCV } from '@/config/api';
import './CreateCVForm.css';
import { useAppSelector } from '@/redux/hooks';
import html2canvas from 'html2canvas';
import jsPDF from "jspdf";
import { useReactToPrint } from 'react-to-print';
import {
    FileTextOutlined,
    SaveOutlined,
    DownloadOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    PlusOutlined,
    CheckOutlined,
    CloseOutlined,
    InfoCircleOutlined,
    PrinterOutlined,
    UserOutlined
} from '@ant-design/icons';

// Template thumbnails - in a real application these would be actual images
const TEMPLATES = [
    { id: 'modern', name: 'Modern', thumbnail: 'modern-template.jpg' },
    { id: 'professional', name: 'Professional', thumbnail: 'professional-template.jpg' },
    { id: 'creative', name: 'Creative', thumbnail: 'creative-template.jpg' },
    { id: 'simple', name: 'Simple', thumbnail: 'simple-template.jpg' },
];

const CreateCVForm: React.FC = () => {
    const [cvData, setCvData] = useState({
        title: "",
        fullName: "",
        email: "",
        phone: "",
        address: "",
        education: "",
        experience: "",
        skills: "",
        additionalInfo: "",
    });

    const [isLoading, setIsLoading] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [savedCVs, setSavedCVs] = useState<Array<typeof cvData>>([]);
    const [selectedTemplate, setSelectedTemplate] = useState('modern');
    const cvRef = useRef<HTMLDivElement>(null);

    // Load saved CVs from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('savedCVs');
        if (saved) {
            setSavedCVs(JSON.parse(saved));
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCvData({ ...cvData, [name]: value });
    };

    const handlePreviewEdit = (field: string, value: string) => {
        setCvData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            setShowPreview(true);
            setIsEditing(true); // Start in edit mode
        } catch (error) {
            console.error("❌ Lỗi tạo CV:", error);
            alert("⚠️ Lỗi khi tạo CV! Vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    };

    // Lấy thông tin user từ Redux
    const user = useAppSelector(state => state.account.user); // Giả sử user nằm trong account slice

    const handleSave = async () => {
        try {
            setIsLoading(true);

            // Kiểm tra xem user đã đăng nhập chưa
            if (!user?.id) {
                throw new Error("Bạn cần đăng nhập để lưu CV!");
            }

            const cvRequestData = {
                title: cvData.title,
                fullName: cvData.fullName,
                email: cvData.email,
                phoneNumber: cvData.phone, // Đồng bộ với DTO nếu cần (phoneNumber)
                address: cvData.address,
                education: cvData.education,
                experience: cvData.experience,
                skills: cvData.skills,
                customContent: cvData.additionalInfo,
                userId: user.id, // Lấy userId từ Redux
            };

            console.log("📤 Dữ liệu gửi đi:", cvRequestData);

            const response = await callCreateNewCV(cvRequestData);
            console.log("📥 Response từ API:", response);

            if (response && typeof response === 'number') {
                const newSavedCVs = [...savedCVs, { ...cvData, id: response }];
                localStorage.setItem('savedCVs', JSON.stringify(newSavedCVs));
                setSavedCVs(newSavedCVs);
                setIsEditing(false);
                alert("✅ Lưu CV thành công!");
            } else {
                console.error("❌ Response không phải là số:", response);
                throw new Error("Không nhận được ID CV hợp lệ từ server");
            }
        } catch (error: any) {
            console.error("❌ Lỗi khi lưu CV:", error);
            const errorMessage = error.response?.data?.message || error.message || "Lỗi khi lưu CV! Vui lòng thử lại.";
            alert(`⚠️ ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    const generatePDF = async () => {
        const element = cvRef.current;
        if (!element) {
            throw new Error("Không tìm thấy nội dung CV để tạo PDF");
        }

        try {
            // Tạm thời ẩn các phần tử không cần thiết
            const elementsToHide = element.querySelectorAll('.preview-actions, .editable-field, .editable-textarea');
            elementsToHide.forEach(el => {
                (el as HTMLElement).style.display = 'none';
            });

            // Đảm bảo tất cả các phần tử đều có màu nền và màu chữ rõ ràng
            const allElements = element.querySelectorAll('*');
            allElements.forEach(el => {
                const style = window.getComputedStyle(el);
                if (style.backgroundColor === 'transparent' || style.backgroundColor === 'rgba(0, 0, 0, 0)') {
                    (el as HTMLElement).style.backgroundColor = '#ffffff';
                }
                if (style.color === 'transparent' || style.color === 'rgba(0, 0, 0, 0)') {
                    (el as HTMLElement).style.color = '#333333';
                }
            });

            // Tạo canvas với các tùy chọn tối ưu
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: true,
                backgroundColor: '#ffffff',
                removeContainer: true,
                foreignObjectRendering: true,
                allowTaint: true,
                onclone: (clonedDoc) => {
                    // Xử lý các phần tử trong bản sao
                    const clonedElement = clonedDoc.querySelector('.cv-template');
                    if (clonedElement) {
                        // Đảm bảo tất cả các phần tử đều có màu nền trắng
                        (clonedElement as HTMLElement).style.backgroundColor = '#ffffff';

                        // Xử lý các gradient và màu sắc đặc biệt
                        const elementsWithGradient = clonedElement.querySelectorAll('[style*="gradient"]');
                        elementsWithGradient.forEach(el => {
                            (el as HTMLElement).style.background = '#ffffff';
                        });

                        // Đảm bảo tất cả các phần tử đều có màu chữ
                        const allTextElements = clonedElement.querySelectorAll('*');
                        allTextElements.forEach(el => {
                            const style = window.getComputedStyle(el);
                            if (style.color === 'transparent' || style.color === 'rgba(0, 0, 0, 0)') {
                                (el as HTMLElement).style.color = '#333333';
                            }
                        });
                    }
                }
            });

            // Khôi phục hiển thị các phần tử
            elementsToHide.forEach(el => {
                (el as HTMLElement).style.display = '';
            });

            // Tạo PDF
            const imgData = canvas.toDataURL('image/jpeg', 1.0);
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const imgWidth = 190; // Để lại margin
            const pageHeight = 295; // A4 height
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            // Thêm trang đầu tiên
            pdf.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            // Thêm các trang tiếp theo nếu cần
            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            return pdf;
        } catch (error) {
            console.error("Lỗi khi tạo PDF:", error);
            throw error;
        }
    };

    const handleDownload = async () => {
        try {
            setIsLoading(true);
            setIsEditing(false);

            await new Promise(resolve => setTimeout(resolve, 100));
            const pdfGenerator = await generatePDF();
            if (!pdfGenerator) {
                throw new Error("Không tạo được PDF do nội dung trống");
            }

            pdfGenerator.save(`cv_${cvData.fullName ? cvData.fullName.replace(/\s+/g, '_') : 'unnamed'}.pdf`);
        } catch (error: any) {
            console.error("❌ Lỗi tải CV:", error.message || error);
            alert(`⚠️ Lỗi khi tải CV: ${error.message || "Vui lòng thử lại"}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrint = useReactToPrint({
        content: () => cvRef.current,
        documentTitle: `cv_${cvData.fullName ? cvData.fullName.replace(/\s+/g, '_') : 'unnamed'}`,
        onBeforeGetContent: () => {
            setIsEditing(false);
            return new Promise<void>(resolve => {
                setTimeout(() => {
                    resolve();
                }, 100);
            });
        },
        onAfterPrint: () => {
            setIsEditing(true);
        }
    });

    const handleEdit = (cv: typeof cvData) => {
        setCvData(cv);
        setShowPreview(true);
        setIsEditing(true);
    };

    const handleDelete = (index: number) => {
        const newSavedCVs = savedCVs.filter((_, i) => i !== index);
        localStorage.setItem('savedCVs', JSON.stringify(newSavedCVs));
        setSavedCVs(newSavedCVs);
    };

    const handleClosePreview = () => {
        setShowPreview(false);
        setIsEditing(false);
    };

    return (
        <div className="cv-container fade-in">
            {isLoading && (
                <div className="loading-overlay">
                    <div className="spinner"></div>
                </div>
            )}

            <div className="cv-page-header">
                <h1>Tạo CV chuyên nghiệp</h1>
                <p>Tạo CV ấn tượng để tăng cơ hội được nhà tuyển dụng chú ý. Dễ dàng tùy chỉnh và tải xuống dưới dạng PDF.</p>
            </div>

            {savedCVs.length > 0 && (
                <div className="cv-grid">
                    {savedCVs.map((cv, index) => (
                        <div key={index} className="saved-cvs-card">
                            <h3 className="saved-cvs-title">{cv.title || `CV ${index + 1}`}</h3>
                            <div className="cv-list">
                                <div className="cv-item">
                                    <span><UserOutlined /> {cv.fullName || "Chưa có tên"}</span>
                                </div>
                                <div className="cv-item">
                                    <span><InfoCircleOutlined /> {cv.email || "Chưa có email"}</span>
                                </div>
                            </div>
                            <div className="form-actions" style={{ marginTop: 'auto', justifyContent: 'center' }}>
                                <button
                                    onClick={() => handleEdit(cv)}
                                    className="btn btn-primary btn-sm"
                                >
                                    <EditOutlined /> Sửa
                                </button>
                                <button
                                    onClick={() => handleDelete(index)}
                                    className="btn btn-danger btn-sm"
                                >
                                    <DeleteOutlined /> Xóa
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="form-section">
                <div className="form-section-header">
                    <h2><FileTextOutlined /> Tạo CV mới</h2>
                </div>

                <div className="template-selector">
                    <h3>Chọn mẫu CV</h3>
                    <div className="template-options">
                        {TEMPLATES.map(template => (
                            <div
                                key={template.id}
                                className={`template-option ${selectedTemplate === template.id ? 'selected' : ''}`}
                                onClick={() => setSelectedTemplate(template.id)}
                            >
                                <div
                                    className="template-preview"
                                    style={{
                                        backgroundColor: selectedTemplate === template.id ? '#e8eaf6' : '#f5f5f5',
                                        border: `1px solid ${selectedTemplate === template.id ? '#3f51b5' : '#e0e0e0'}`
                                    }}
                                >
                                    {selectedTemplate === template.id && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '5px',
                                            right: '5px',
                                            background: '#3f51b5',
                                            color: 'white',
                                            borderRadius: '50%',
                                            width: '24px',
                                            height: '24px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <CheckOutlined />
                                        </div>
                                    )}
                                </div>
                                <div className="template-info">
                                    <h4>{template.name}</h4>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="cv-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="title">Tiêu đề CV</label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                placeholder="Ví dụ: CV Developer React"
                                value={cvData.title}
                                onChange={handleChange}
                                className="form-control"
                            />
                        </div>
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
                    </div>

                    <div className="form-row">
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
                        <div className="form-tip">Liệt kê theo định dạng: Thời gian - Bằng cấp - Trường. Mỗi mục cách nhau bằng 2 dòng trống.</div>
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
                        <div className="form-tip">Liệt kê theo định dạng: Thời gian - Vị trí - Công ty. Mỗi mục cách nhau bằng 2 dòng trống.</div>
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
                        <div className="form-tip">Liệt kê mỗi kỹ năng trên một dòng.</div>
                        <textarea
                            id="skills"
                            name="skills"
                            placeholder="React JS
JavaScript
HTML/CSS"
                            value={cvData.skills}
                            onChange={handleChange}
                            className="form-control"
                        ></textarea>
                    </div>

                    <div className="form-group">
                        <label htmlFor="additionalInfo">Thông tin khác</label>
                        <textarea
                            id="additionalInfo"
                            name="additionalInfo"
                            placeholder="Giới thiệu thêm về bản thân, sở thích, mục tiêu nghề nghiệp..."
                            value={cvData.additionalInfo}
                            onChange={handleChange}
                            className="form-control"
                        ></textarea>
                    </div>

                    <div className="form-actions">
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isLoading}
                        >
                            <EyeOutlined /> Xem trước
                        </button>
                    </div>
                </form>
            </div>

            {showPreview && (
                <div className="preview-modal">
                    <div className="preview-content">
                        <div className="preview-header">
                            <h3>{isEditing ? "Chỉnh sửa CV" : "Xem trước CV"}</h3>
                            <div className="preview-actions">
                                {!isEditing ? (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="btn btn-info"
                                        disabled={isLoading}
                                    >
                                        <EditOutlined /> Chỉnh sửa
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="btn btn-success"
                                        disabled={isLoading}
                                    >
                                        <CheckOutlined /> Hoàn tất chỉnh sửa
                                    </button>
                                )}

                                <button
                                    onClick={handleSave}
                                    className="btn btn-primary"
                                    disabled={isLoading}
                                >
                                    <SaveOutlined /> Lưu CV
                                </button>

                                <button
                                    onClick={handleDownload}
                                    className="btn btn-success"
                                    disabled={isLoading}
                                >
                                    <DownloadOutlined /> Tải PDF
                                </button>

                                <button
                                    onClick={handlePrint}
                                    className="btn btn-info"
                                    disabled={isLoading}
                                >
                                    <PrinterOutlined /> In CV
                                </button>

                                <button
                                    onClick={handleClosePreview}
                                    className="close-btn"
                                    aria-label="Close preview"
                                >
                                    <CloseOutlined />
                                </button>
                            </div>
                        </div>
                        <div className="preview-body">
                            <div ref={cvRef}>
                                <CVTemplate
                                    data={cvData}
                                    isEditing={isEditing}
                                    onEdit={handlePreviewEdit}
                                    template={selectedTemplate}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateCVForm;
