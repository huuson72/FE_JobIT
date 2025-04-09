import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Modal, Layout, Typography, Card, Row, Col, Space, Tag, Select, DatePicker } from 'antd';
import { FileTextOutlined, DownloadOutlined, EyeOutlined } from '@ant-design/icons';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './CreateCVForm.css';
import CVPreview from './CVPreview';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface Template {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
}

const templates: Template[] = [
    {
        id: 'modern',
        name: 'Chuyên Nghiệp Hiện Đại',
        description: 'Mẫu CV hiện đại với thiết kế sạch sẽ, phù hợp cho các ngành nghề chuyên nghiệp',
        icon: '💼',
        color: '#1890ff'
    },
    {
        id: 'creative',
        name: 'Sáng Tạo',
        description: 'Mẫu CV sáng tạo với thiết kế độc đáo, phù hợp cho ngành nghệ thuật và thiết kế',
        icon: '🎨',
        color: '#52c41a'
    },
    {
        id: 'minimal',
        name: 'Tối Giản',
        description: 'Mẫu CV đơn giản, tối giản, phù hợp cho các ngành nghề truyền thống',
        icon: '📝',
        color: '#722ed1'
    },
    {
        id: 'technical',
        name: 'Kỹ Thuật',
        description: 'Mẫu CV chuyên biệt cho ngành công nghệ và kỹ thuật',
        icon: '💻',
        color: '#eb2f96'
    }
];

interface CVData {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    website?: string;
    birthDate?: string;
    objective?: string;
    education: Array<{
        school: string;
        degree: string;
        date: string;
        description?: string;
    }>;
    experience: Array<{
        company: string;
        position: string;
        date: string;
        description: string;
    }>;
    skills: string[];
    activities?: Array<{
        organization: string;
        role: string;
        date: string;
        description: string;
    }>;
    awards?: Array<{
        title: string;
        date: string;
        description?: string;
    }>;
}

const CreateCVForm: React.FC = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<string>('modern');
    const [cvData, setCvData] = useState<CVData | null>(null);

    // Handle data changes from CVPreview component
    const handleCVPreviewDataChange = (updatedData: CVData) => {
        console.log("Data updated from preview:", updatedData);
        setCvData(updatedData);

        // Update form values (only for simple fields)
        const formValues = form.getFieldsValue(true);
        const fieldsToUpdate: Record<string, any> = {};

        // Update simple fields
        ['fullName', 'email', 'phone', 'address', 'website', 'objective'].forEach(field => {
            if (updatedData[field as keyof CVData] !== undefined &&
                updatedData[field as keyof CVData] !== formValues[field]) {
                fieldsToUpdate[field] = updatedData[field as keyof CVData];
            }
        });

        // Update skills array
        if (updatedData.skills && JSON.stringify(updatedData.skills) !== JSON.stringify(formValues.skills)) {
            fieldsToUpdate.skills = updatedData.skills;
        }

        // Update complex arrays (education, experience, etc.)
        ['education', 'experience', 'activities', 'awards'].forEach(arrayField => {
            if (updatedData[arrayField as keyof CVData] &&
                Array.isArray(updatedData[arrayField as keyof CVData])) {
                const array = updatedData[arrayField as keyof CVData] as any[];
                if (array.length > 0) {
                    fieldsToUpdate[arrayField] = array;
                }
            }
        });

        if (Object.keys(fieldsToUpdate).length > 0) {
            form.setFieldsValue(fieldsToUpdate);
        }
    };

    // Effect to update form fields when CV data is modified
    useEffect(() => {
        if (cvData) {
            // Set the form values with the updated CV data if needed
            // The main update is handled in handleCVPreviewDataChange
        }
    }, [cvData, form]);

    const handleInputChange = (changedValues: any, allValues: any) => {
        const formattedValues = { ...allValues };

        // Format dates for education
        if (formattedValues.education) {
            formattedValues.education = formattedValues.education.map((edu: any) => ({
                ...edu,
                date: typeof edu.date === 'string' ? edu.date :
                    (edu.date && Array.isArray(edu.date) ?
                        `${edu.date[0].format('DD/MM/YYYY')} - ${edu.date[1].format('DD/MM/YYYY')}` : '')
            }));
        }

        // Format dates for experience
        if (formattedValues.experience) {
            formattedValues.experience = formattedValues.experience.map((exp: any) => ({
                ...exp,
                date: typeof exp.date === 'string' ? exp.date :
                    (exp.date && Array.isArray(exp.date) ?
                        `${exp.date[0].format('DD/MM/YYYY')} - ${exp.date[1].format('DD/MM/YYYY')}` : '')
            }));
        }

        setCvData(formattedValues);
    };

    const handleTemplateSelect = (templateId: string) => {
        setSelectedTemplate(templateId);

        // Nếu modal preview đang mở, hãy cập nhật lại CVPreview với template mới
        if (previewVisible && cvData) {
            // Tạo một bản sao của cvData để kích hoạt re-render của CVPreview
            setCvData({ ...cvData });
        }
    };

    const handlePreview = (e: React.MouseEvent) => {
        e.preventDefault();
        const formData = form.getFieldsValue(true);

        // Format dates before preview
        if (formData.education) {
            formData.education = formData.education.map((edu: any) => ({
                ...edu,
                date: typeof edu.date === 'string' ? edu.date :
                    (edu.date && Array.isArray(edu.date) ?
                        `${edu.date[0].format('DD/MM/YYYY')} - ${edu.date[1].format('DD/MM/YYYY')}` : '')
            }));
        }

        if (formData.experience) {
            formData.experience = formData.experience.map((exp: any) => ({
                ...exp,
                date: typeof exp.date === 'string' ? exp.date :
                    (exp.date && Array.isArray(exp.date) ?
                        `${exp.date[0].format('DD/MM/YYYY')} - ${exp.date[1].format('DD/MM/YYYY')}` : '')
            }));
        }

        setCvData(formData);
        setPreviewVisible(true);
    };

    const handleDownload = async () => {
        setLoading(true);
        try {
            const element = document.getElementById('cv-preview');
            if (element) {
                // Hide the controls for PDF export
                const controls = element.querySelector('[style*="z-index: 100"]');
                if (controls) {
                    (controls as HTMLElement).style.display = 'none';
                }

                // Add temporary styles to replace any oklch colors with fallback colors
                const tempStyle = document.createElement('style');
                tempStyle.innerHTML = `
                    * {
                        color: #333333 !important;
                        background-color: initial !important;
                    }
                    .tech-header, .tech-terminal, .tech-terminal-buttons, .tech-terminal-title, 
                    .tech-timeline-dot, .tech-skill-progress, .tech-project-card {
                        background-color: #61dafb !important;
                    }
                    .tech-timeline:before {
                        background-color: #dddddd !important;
                    }
                    .tech-skill-bar {
                        background-color: #eeeeee !important;
                    }
                    .tech-project-role {
                        background-color: #e6f7ff !important;
                        color: #1890ff !important;
                    }
                    .tech-code-snippet {
                        background-color: #f5f5f5 !important;
                    }
                `;
                document.head.appendChild(tempStyle);

                const canvas = await html2canvas(element, {
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    backgroundColor: '#ffffff'
                });

                // Remove temporary styles
                document.head.removeChild(tempStyle);

                // Restore controls display
                if (controls) {
                    (controls as HTMLElement).style.display = 'flex';
                }

                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'a4'
                });
                const imgWidth = 210;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
                pdf.save('CV.pdf');
            }
        } catch (error) {
            console.error('Lỗi khi tạo PDF:', error);
        }
        setLoading(false);
    };

    return (
        <div className="cv-container">
            <div className="cv-page-header">
                <Title level={2} style={{ color: 'white' }}>Tạo CV Chuyên Nghiệp</Title>
                <Text type="secondary" style={{ color: 'white' }}>Tạo CV đẹp và chuyên nghiệp chỉ trong vài phút</Text>
            </div>

            <Row gutter={[24, 24]}>
                <Col xs={24} lg={16}>
                    <Form
                        form={form}
                        layout="vertical"
                        onValuesChange={handleInputChange}
                        onFinish={() => false}
                        autoComplete="off"
                        initialValues={{
                            fullName: '',
                            email: '',
                            phone: '',
                            address: '',
                            objective: '',
                            education: [],
                            experience: [],
                            skills: []
                        }}
                    >
                        <Row gutter={[24, 24]}>
                            {/* Left Column */}
                            <Col xs={24} md={12}>
                                <Title level={3}>Thông Tin Cá Nhân</Title>
                                <Form.Item
                                    name="fullName"
                                    label="Họ và Tên"
                                    rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
                                >
                                    <Input placeholder="Nhập họ và tên của bạn" />
                                </Form.Item>

                                <Form.Item
                                    name="email"
                                    label="Email"
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập email!' },
                                        { type: 'email', message: 'Email không hợp lệ!' }
                                    ]}
                                >
                                    <Input placeholder="example@email.com" />
                                </Form.Item>

                                <Form.Item
                                    name="phone"
                                    label="Số Điện Thoại"
                                    rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
                                >
                                    <Input placeholder="0123456789" />
                                </Form.Item>

                                <Form.Item
                                    name="address"
                                    label="Địa Chỉ"
                                    rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
                                >
                                    <Input placeholder="Nhập địa chỉ của bạn" />
                                </Form.Item>

                                <Form.Item
                                    name="objective"
                                    label="Mục Tiêu Nghề Nghiệp"
                                >
                                    <TextArea rows={4} placeholder="Mô tả mục tiêu nghề nghiệp của bạn" />
                                </Form.Item>

                                <Form.List name="education">
                                    {(fields, { add, remove }) => (
                                        <>
                                            <Title level={4}>Học Vấn</Title>
                                            {fields.map(({ key, name, ...restField }) => (
                                                <div key={key} className="form-item-group">
                                                    <Form.Item
                                                        {...restField}
                                                        name={[name, 'school']}
                                                        label="Trường Học"
                                                        rules={[{ required: true, message: 'Vui lòng nhập tên trường!' }]}
                                                    >
                                                        <Input placeholder="Tên trường học" />
                                                    </Form.Item>
                                                    <Form.Item
                                                        {...restField}
                                                        name={[name, 'degree']}
                                                        label="Bằng Cấp"
                                                        rules={[{ required: true, message: 'Vui lòng nhập bằng cấp!' }]}
                                                    >
                                                        <Input placeholder="Ví dụ: Cử nhân, Thạc sĩ" />
                                                    </Form.Item>
                                                    <Form.Item
                                                        {...restField}
                                                        name={[name, 'date']}
                                                        label="Thời Gian"
                                                        rules={[{ required: true, message: 'Vui lòng nhập thời gian!' }]}
                                                    >
                                                        <Input placeholder="Ví dụ: 09/2019 - 06/2023" />
                                                    </Form.Item>
                                                    <Form.Item
                                                        {...restField}
                                                        name={[name, 'description']}
                                                        label="Mô Tả"
                                                    >
                                                        <TextArea rows={2} placeholder="Thành tích học tập" />
                                                    </Form.Item>
                                                    <Button type="link" danger onClick={() => remove(name)}>
                                                        Xóa
                                                    </Button>
                                                </div>
                                            ))}
                                            <Form.Item>
                                                <Button type="dashed" onClick={() => add()} block>
                                                    + Thêm Học Vấn
                                                </Button>
                                            </Form.Item>
                                        </>
                                    )}
                                </Form.List>
                            </Col>

                            {/* Right Column */}
                            <Col xs={24} md={12}>
                                <Form.List name="experience">
                                    {(fields, { add, remove }) => (
                                        <>
                                            <Title level={3}>Kinh Nghiệm Làm Việc</Title>
                                            {fields.map(({ key, name, ...restField }) => (
                                                <div key={key} className="form-item-group">
                                                    <Form.Item
                                                        {...restField}
                                                        name={[name, 'company']}
                                                        label="Công Ty"
                                                        rules={[{ required: true, message: 'Vui lòng nhập tên công ty!' }]}
                                                    >
                                                        <Input placeholder="Tên công ty" />
                                                    </Form.Item>
                                                    <Form.Item
                                                        {...restField}
                                                        name={[name, 'position']}
                                                        label="Vị Trí"
                                                        rules={[{ required: true, message: 'Vui lòng nhập vị trí!' }]}
                                                    >
                                                        <Input placeholder="Vị trí công việc" />
                                                    </Form.Item>
                                                    <Form.Item
                                                        {...restField}
                                                        name={[name, 'date']}
                                                        label="Thời Gian"
                                                        rules={[{ required: true, message: 'Vui lòng nhập thời gian!' }]}
                                                    >
                                                        <Input placeholder="Ví dụ: 03/2020 - 05/2022" />
                                                    </Form.Item>
                                                    <Form.Item
                                                        {...restField}
                                                        name={[name, 'description']}
                                                        label="Mô Tả Công Việc"
                                                        rules={[{ required: true, message: 'Vui lòng nhập mô tả công việc!' }]}
                                                    >
                                                        <TextArea rows={4} placeholder="Mô tả chi tiết công việc và thành tích" />
                                                    </Form.Item>
                                                    <Button type="link" danger onClick={() => remove(name)}>
                                                        Xóa
                                                    </Button>
                                                </div>
                                            ))}
                                            <Form.Item>
                                                <Button type="dashed" onClick={() => add()} block>
                                                    + Thêm Kinh Nghiệm
                                                </Button>
                                            </Form.Item>
                                        </>
                                    )}
                                </Form.List>

                                <Title level={4}>Kỹ Năng</Title>
                                <Form.Item
                                    name="skills"
                                    rules={[{ required: true, message: 'Vui lòng nhập ít nhất một kỹ năng!' }]}
                                >
                                    <Select
                                        mode="tags"
                                        placeholder="Nhập kỹ năng và nhấn Enter"
                                        style={{ width: '100%' }}
                                    />
                                </Form.Item>

                                <Space className="form-actions">
                                    <Button
                                        type="primary"
                                        icon={<EyeOutlined />}
                                        onClick={handlePreview}
                                        htmlType="button"
                                    >
                                        Xem Trước
                                    </Button>
                                    <Button
                                        type="primary"
                                        icon={<DownloadOutlined />}
                                        onClick={(e: React.MouseEvent) => {
                                            e.preventDefault();
                                            handleDownload();
                                        }}
                                        loading={loading}
                                        htmlType="button"
                                    >
                                        Tải Xuống PDF
                                    </Button>
                                </Space>
                            </Col>
                        </Row>
                    </Form>
                </Col>

                <Col xs={24} lg={8}>
                    <div className="template-section">
                        <Title level={3}>Chọn Mẫu CV</Title>
                        <Space direction="vertical" style={{ width: '100%' }}>
                            {templates.map((template) => (
                                <Card
                                    key={template.id}
                                    className={`template-card ${selectedTemplate === template.id ? 'selected' : ''}`}
                                    onClick={() => handleTemplateSelect(template.id)}
                                    hoverable
                                >
                                    <div className="template-icon" style={{ backgroundColor: template.color }}>
                                        {template.icon}
                                    </div>
                                    <div className="template-info">
                                        <Title level={4}>{template.name}</Title>
                                        <Text type="secondary">{template.description}</Text>
                                    </div>
                                </Card>
                            ))}
                        </Space>
                    </div>
                </Col>
            </Row>

            <Modal
                title="Xem Trước CV"
                open={previewVisible}
                onCancel={() => setPreviewVisible(false)}
                width={800}
                footer={[
                    <Button key="download" type="primary" onClick={handleDownload} loading={loading}>
                        Tải Xuống PDF
                    </Button>,
                    <Button key="close" onClick={() => setPreviewVisible(false)}>
                        Đóng
                    </Button>
                ]}
            >
                <div id="cv-preview" className="cv-preview-controls">
                    {cvData && <CVPreview data={cvData} template={selectedTemplate} onDataChange={handleCVPreviewDataChange} />}
                </div>
            </Modal>
        </div>
    );
};

export default CreateCVForm;