import React, { useState, useRef, useEffect } from "react";
import html2pdf from 'html2pdf.js';
import CVTemplate from './CVTemplate';
import { callCreateNewCV } from '@/config/api';
import './CreateCVForm.css';
import { useAppSelector } from '@/redux/hooks';
import html2canvas from 'html2canvas';
import jsPDF from "jspdf";
import { useReactToPrint } from 'react-to-print';
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

    // const generatePDF = () => {
    //     const element = document.createElement("div");
    //     element.innerHTML = "<h1>Test PDF</h1><p>This is a test PDF content.</p>";
    //     document.body.appendChild(element);

    //     const options = {
    //         margin: 10,
    //         filename: "test.pdf",
    //         image: { type: 'jpeg', quality: 0.98 },
    //         html2canvas: { scale: 2 },
    //         jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    //     };

    //     return html2pdf().set(options).from(element);
    // };
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

        const canvas = await html2canvas(element, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const doc = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 190; // Để lại margin
        const pageHeight = 295; // A4 height
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        doc.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            doc.addPage();
            doc.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        return doc;
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

    return (
        <div className="cv-container">
            {savedCVs.length > 0 && (
                <div className="saved-cvs-card">
                    <h3 className="saved-cvs-title">CV đã tạo</h3>
                    <div className="cv-list">
                        {savedCVs.map((cv, index) => (
                            <div key={index} className="cv-item">
                                <span>{cv.title || `CV ${index + 1}`}</span>
                                <div className="cv-actions">
                                    <button
                                        onClick={() => handleEdit(cv)}
                                        className="btn btn-info btn-sm"
                                    >
                                        ✏️ Sửa
                                    </button>
                                    <button
                                        onClick={() => handleDelete(index)}
                                        className="btn btn-danger btn-sm"
                                    >
                                        🗑️ Xóa
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="form-section">
                <form onSubmit={handleSubmit} className="cv-form">
                    <div className="form-row">
                        <div className="form-group">
                            <input
                                type="text"
                                name="title"
                                placeholder="Tiêu đề CV"
                                value={cvData.title}
                                onChange={handleChange}
                                className="form-control"
                            />
                        </div>
                        <div className="form-group">
                            <input
                                type="text"
                                name="fullName"
                                placeholder="Họ và Tên"
                                value={cvData.fullName}
                                onChange={handleChange}
                                className="form-control"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={cvData.email}
                                onChange={handleChange}
                                className="form-control"
                            />
                        </div>
                        <div className="form-group">
                            <input
                                type="tel"
                                name="phone"
                                placeholder="Số điện thoại"
                                value={cvData.phone}
                                onChange={handleChange}
                                className="form-control"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group full-width">
                            <input
                                type="text"
                                name="address"
                                placeholder="Địa chỉ"
                                value={cvData.address}
                                onChange={handleChange}
                                className="form-control"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group full-width">
                            <textarea
                                name="education"
                                placeholder="Học vấn"
                                value={cvData.education}
                                onChange={handleChange}
                                className="form-control"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group full-width">
                            <textarea
                                name="experience"
                                placeholder="Kinh nghiệm"
                                value={cvData.experience}
                                onChange={handleChange}
                                className="form-control"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <textarea
                                name="skills"
                                placeholder="Kỹ năng"
                                value={cvData.skills}
                                onChange={handleChange}
                                className="form-control"
                            />
                        </div>
                        <div className="form-group">
                            <textarea
                                name="additionalInfo"
                                placeholder="Mô tả thêm"
                                value={cvData.additionalInfo}
                                onChange={handleChange}
                                className="form-control"
                            />
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary" disabled={isLoading}>
                            {isLoading ? "Đang xử lý..." : "✨ Tạo CV"}
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
                                {isEditing ? (
                                    <button
                                        onClick={handleSave}
                                        className="btn btn-success"
                                    >
                                        💾 Lưu CV
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="btn btn-info"
                                        >
                                            ✏️ Chỉnh sửa
                                        </button>
                                        <button
                                            onClick={handleDownload}
                                            className="btn btn-success"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? "Đang xử lý..." : "📥 Tải CV PDF"}
                                        </button>
                                    </>
                                )}
                                <button
                                    onClick={() => {
                                        setShowPreview(false);
                                        setIsEditing(false);
                                    }}
                                    className="close-btn"
                                >
                                    ✖
                                </button>
                            </div>
                        </div>
                        <div className="preview-body">
                            <div ref={cvRef}>
                                <CVTemplate
                                    data={cvData}
                                    isEditing={isEditing}
                                    onEdit={handlePreviewEdit}
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
