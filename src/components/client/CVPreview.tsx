import React, { useState, useEffect, useRef } from 'react';
import { Tooltip, Switch, Select, Button, Modal, Input, Form, Card, Space, Popconfirm, message, Dropdown } from 'antd';
import { EditOutlined, PlusOutlined, DragOutlined, DeleteOutlined, ArrowRightOutlined, DownOutlined, SaveOutlined, DownloadOutlined, MoreOutlined } from '@ant-design/icons';
import ModernTemplate from './templates/ModernTemplate';
import CreativeTemplate from './templates/CreativeTemplate';
import MinimalTemplate from './templates/MinimalTemplate';
import TechnicalTemplate from './templates/TechnicalTemplate';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './CVPreview.css';

const { Option } = Select;

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
    [key: string]: any; // Allow dynamic fields
}

interface CVPreviewProps {
    data: CVData;
    template: string;
    onDataChange?: (data: CVData) => void;
}

interface BaseTemplateProps {
    data: CVData;
    isEditable: boolean;
    onEdit: (field: string, value: any) => void;
    draggingField: string | null;
    dropPosition: string;
    onDeleteField: (fieldName: string) => void;
    dropTarget: string | null;
}

interface ModernTemplateProps extends BaseTemplateProps {
    onDropField: (fieldName: string, position?: string) => void;
}

interface CreativeTemplateProps extends BaseTemplateProps {
    onDropField: (fieldName: string, position?: string) => void;
}

interface MinimalTemplateProps extends BaseTemplateProps {
    onDropField: (fieldName: string, position?: string) => void;
}

interface TechnicalTemplateProps extends BaseTemplateProps {
    onDropField: (fieldName: string, position?: string) => void;
}

interface DraggableFieldProps {
    name: string;
    onDragStart: (name: string) => void;
}

const DraggableField: React.FC<DraggableFieldProps> = ({ name, onDragStart }) => {
    return (
        <div className="draggable-field">
            <div
                draggable
                onDragStart={() => onDragStart(name)}
                className="draggable-field-content"
            >
                <DragOutlined /> {name}
            </div>
            <div className="draggable-field-actions">
                <Tooltip title="Kéo để thêm vào giữa">
                    <div
                        draggable
                        onDragStart={(e) => {
                            e.stopPropagation();
                            onDragStart(`middle_${name}`);
                        }}
                        className="draggable-field-middle"
                    >
                        <DownOutlined />
                    </div>
                </Tooltip>
                <Tooltip title="Kéo để thêm vào bên phải">
                    <div
                        draggable
                        onDragStart={(e) => {
                            e.stopPropagation();
                            onDragStart(`right_${name}`);
                        }}
                        className="draggable-field-right"
                    >
                        <ArrowRightOutlined />
                    </div>
                </Tooltip>
            </div>
        </div>
    );
};

const CVPreview: React.FC<CVPreviewProps> = ({ data, template, onDataChange }) => {
    const [selectedTemplate, setSelectedTemplate] = useState<string>(template);
    const [isEditable, setIsEditable] = useState<boolean>(false);
    const [cvData, setCvData] = useState<CVData>(data);
    const [isAddFieldModalVisible, setIsAddFieldModalVisible] = useState<boolean>(false);
    const [showFieldsPanel, setShowFieldsPanel] = useState<boolean>(false);
    const [hoveredOnHelp, setHoveredOnHelp] = useState<boolean>(false);
    const [draggingField, setDraggingField] = useState<string | null>(null);
    const [dropPosition, setDropPosition] = useState<string>('left'); // 'left', 'middle', or 'right'
    const [fieldToDelete, setFieldToDelete] = useState<string | null>(null);
    const [suggestedFields] = useState([
        'languages', 'certifications', 'projects', 'references',
        'interests', 'publications', 'patents', 'volunteering'
    ]);
    const [form] = Form.useForm();
    const [isSaved, setIsSaved] = useState<boolean>(false);
    const cvRef = useRef<HTMLDivElement>(null);
    const [dropTarget, setDropTarget] = useState<string | null>(null);

    // Sync props data to local state when props change
    useEffect(() => {
        setCvData(data);
    }, [data]);

    // Sync template when template prop changes
    useEffect(() => {
        setSelectedTemplate(template);
    }, [template]);

    // Load data from localStorage when component mounts
    useEffect(() => {
        const savedData = localStorage.getItem('cv_data');
        const savedTemplate = localStorage.getItem('cv_template');

        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData);
                setCvData(parsedData);
                if (onDataChange) {
                    onDataChange(parsedData);
                }
                message.success('Đã tải CV từ bộ nhớ cục bộ');
            } catch (error) {
                console.error('Error parsing saved CV data:', error);
            }
        }

        if (savedTemplate) {
            setSelectedTemplate(savedTemplate);
        }
    }, []);

    // Notify parent component when local data changes
    useEffect(() => {
        if (onDataChange && isEditable) {
            onDataChange(cvData);
        }
        if (isSaved) {
            setIsSaved(false);
        }
    }, [cvData, onDataChange, isEditable]);

    // Thêm auto-save khi người dùng rời trang
    useEffect(() => {
        const handleBeforeUnload = () => {
            if (!isSaved && isEditable && Object.keys(cvData).length > 0) {
                localStorage.setItem('cv_data', JSON.stringify(cvData));
                localStorage.setItem('cv_template', selectedTemplate);
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [cvData, selectedTemplate, isSaved, isEditable]);

    // Thêm hàm xóa dữ liệu đã lưu
    const clearSavedData = () => {
        try {
            localStorage.removeItem('cv_data');
            localStorage.removeItem('cv_template');
            message.success('Đã xóa dữ liệu CV đã lưu');
            setIsSaved(false);
        } catch (error) {
            console.error('Error clearing CV data:', error);
            message.error('Lỗi khi xóa dữ liệu CV');
        }
    };

    const handleEdit = (field: string, value: any) => {
        const updatedData = { ...cvData };

        // Handle nested fields with array notation like 'education[0].school'
        if (field.includes('[')) {
            const matches = field.match(/^([a-zA-Z]+)\[(\d+)\]\.([a-zA-Z]+)$/);
            if (matches) {
                const [, arrayName, indexStr, propertyName] = matches;
                const index = parseInt(indexStr, 10);

                if (updatedData[arrayName as keyof CVData] && Array.isArray(updatedData[arrayName as keyof CVData])) {
                    const array = updatedData[arrayName as keyof CVData] as any[];
                    if (array[index]) {
                        array[index][propertyName] = value;
                    }
                }
            }
        } else {
            // Handle simple fields
            Object.assign(updatedData, { [field]: value });
        }

        setCvData(updatedData);
    };

    const handleAddField = (values: { fieldName: string, fieldValue: string }) => {
        const updatedData = { ...cvData };
        // Add the new field to the data object
        Object.assign(updatedData, { [values.fieldName]: values.fieldValue });
        setCvData(updatedData);
        setIsAddFieldModalVisible(false);
        form.resetFields();
    };

    const handleDeleteField = (fieldName: string) => {
        const updatedData = { ...cvData };
        delete updatedData[fieldName];
        setCvData(updatedData);
        setFieldToDelete(null);
    };

    const handleDragStart = (fieldName: string) => {
        setDraggingField(fieldName);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, targetArea: string) => {
        e.preventDefault();
        e.stopPropagation();
        setDropTarget(targetArea);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDropTarget(null);
    };

    const handleDropField = (fieldNameOrEvent: string | React.DragEvent<HTMLDivElement>, position?: string) => {
        if (fieldNameOrEvent instanceof Event) {
            const e = fieldNameOrEvent as React.DragEvent<HTMLDivElement>;
            e.preventDefault();
            e.stopPropagation();
            setDropTarget(null);

            if (!draggingField) return;
            position = position || 'left';
        }

        const fieldName = typeof fieldNameOrEvent === 'string' ? fieldNameOrEvent : draggingField;
        if (!fieldName) return;

        const fieldPrefix = position === 'right' ? 'right_' :
            position === 'middle' ? 'middle_' : '';
        const finalFieldName = `${fieldPrefix}${fieldName}`;

        Modal.confirm({
            title: 'Thêm trường mới',
            content: (
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{ fieldName: finalFieldName }}
                >
                    <Form.Item
                        name="fieldValue"
                        label="Giá trị"
                        rules={[{ required: true, message: 'Vui lòng nhập giá trị!' }]}
                    >
                        <Input placeholder="Nhập giá trị cho trường mới" />
                    </Form.Item>
                </Form>
            ),
            onOk: () => {
                const values = form.getFieldsValue();
                const updatedData = { ...cvData };
                Object.assign(updatedData, { [finalFieldName]: values.fieldValue });
                setCvData(updatedData);
                form.resetFields();
            },
            okText: 'Thêm',
            cancelText: 'Hủy',
            maskClosable: true,
            centered: true,
        });
    };

    const templates = [
        { value: 'modern', label: 'Chuyên Nghiệp Hiện Đại' },
        { value: 'creative', label: 'Sáng Tạo' },
        { value: 'minimal', label: 'Tối Giản' },
        { value: 'technical', label: 'Kỹ Thuật' },
    ];

    const renderTemplate = () => {
        const baseProps: BaseTemplateProps = {
            data: cvData,
            isEditable,
            onEdit: handleEdit,
            draggingField,
            dropPosition,
            onDeleteField: (fieldName: string) => setFieldToDelete(fieldName),
            dropTarget,
        };

        const templateProps = {
            ...baseProps,
            onDropField: handleDropField,
        };

        switch (selectedTemplate) {
            case 'creative':
                return <CreativeTemplate {...templateProps} />;
            case 'minimal':
                return <MinimalTemplate {...templateProps} />;
            case 'technical':
                return <TechnicalTemplate {...templateProps} />;
            case 'modern':
            default:
                return <ModernTemplate {...templateProps} />;
        }
    };

    // Function to save CV to localStorage
    const saveCV = () => {
        try {
            localStorage.setItem('cv_data', JSON.stringify(cvData));
            localStorage.setItem('cv_template', selectedTemplate);
            setIsSaved(true);
            message.success('Đã lưu CV vào bộ nhớ cục bộ');
        } catch (error) {
            console.error('Error saving CV data:', error);
            message.error('Lỗi khi lưu CV');
        }
    };

    // Function to export CV as PDF
    const exportAsPDF = async () => {
        if (!cvRef.current) return;

        message.loading({ content: 'Đang tạo PDF...', key: 'pdfExport' });

        try {
            const canvas = await html2canvas(cvRef.current, {
                scale: 2, // Higher scale for better quality
                useCORS: true,
                logging: false,
                backgroundColor: '#FFFFFF'
            });

            const imgData = canvas.toDataURL('image/jpeg', 1.0);
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
            const imgX = (pdfWidth - imgWidth * ratio) / 2;
            const imgY = 0;

            pdf.addImage(imgData, 'JPEG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
            pdf.save(`CV_${data.fullName || 'Export'}.pdf`);

            message.success({ content: 'Xuất PDF thành công!', key: 'pdfExport' });
        } catch (error) {
            console.error('Error exporting PDF:', error);
            message.error({ content: 'Lỗi khi xuất PDF. Vui lòng thử lại!', key: 'pdfExport' });
        }
    };

    // Additional menu items
    const menuItems = [
        {
            key: 'export',
            label: 'Xuất PDF',
            icon: <DownloadOutlined />,
            onClick: exportAsPDF
        },
        {
            key: 'save',
            label: 'Lưu CV',
            icon: <SaveOutlined />,
            onClick: saveCV
        },
        {
            key: 'clear',
            label: 'Xóa dữ liệu đã lưu',
            icon: <DeleteOutlined />,
            danger: true,
            onClick: () => {
                Modal.confirm({
                    title: 'Xóa dữ liệu đã lưu?',
                    content: 'Bạn có chắc chắn muốn xóa dữ liệu CV đã lưu không?',
                    okText: 'Xóa',
                    cancelText: 'Hủy',
                    onOk: clearSavedData
                });
            }
        }
    ];

    return (
        <div style={{ position: 'relative' }}>
            <div style={{
                position: 'absolute',
                zIndex: 1000,
                top: 10,
                right: 10,
                display: 'flex',
                gap: '10px',
                backgroundColor: 'white',
                padding: '8px',
                borderRadius: '4px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                <Select
                    value={selectedTemplate}
                    onChange={setSelectedTemplate}
                    style={{ width: 180 }}
                >
                    {templates.map(tmpl => (
                        <Option key={tmpl.value} value={tmpl.value}>{tmpl.label}</Option>
                    ))}
                </Select>
                <Tooltip title={isEditable ? "Chỉnh sửa đang bật" : "Bật chế độ chỉnh sửa"}>
                    <div
                        style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                        onMouseEnter={() => setHoveredOnHelp(true)}
                        onMouseLeave={() => setHoveredOnHelp(false)}
                    >
                        <EditOutlined />
                        <Switch
                            checked={isEditable}
                            onChange={(checked) => {
                                setIsEditable(checked);
                                if (checked) {
                                    setShowFieldsPanel(true);
                                } else {
                                    setShowFieldsPanel(false);
                                }
                            }}
                            size="small"
                        />
                    </div>
                </Tooltip>
                {isEditable && (
                    <>
                        <Tooltip title="Thêm trường mới">
                            <Button
                                icon={<PlusOutlined />}
                                size="small"
                                onClick={() => setIsAddFieldModalVisible(true)}
                                style={{ backgroundColor: '#eb2f96', color: 'white' }}
                            />
                        </Tooltip>
                        <Tooltip title={isSaved ? "CV đã được lưu" : "Lưu CV"}>
                            <Button
                                icon={<SaveOutlined />}
                                size="small"
                                onClick={saveCV}
                                style={{
                                    backgroundColor: isSaved ? '#52c41a' : '#1890ff',
                                    color: 'white'
                                }}
                            />
                        </Tooltip>
                    </>
                )}
                <Dropdown menu={{ items: menuItems }} placement="bottomRight">
                    <Button icon={<MoreOutlined />} size="small" style={{ border: '1px solid #d9d9d9' }} />
                </Dropdown>
            </div>

            {isEditable && (hoveredOnHelp || showFieldsPanel) && (
                <div className="edit-instructions">
                    <p style={{ margin: 0, color: '#eb2f96' }}>
                        <strong>Chế độ chỉnh sửa đang bật!</strong>
                    </p>
                    <p style={{ margin: '5px 0 0 0', fontSize: '12px' }}>
                        Nhấp vào bất kỳ phần nào trên CV để chỉnh sửa nội dung.
                    </p>
                    <p style={{ margin: '5px 0 0 0', fontSize: '12px' }}>
                        Kéo và thả các trường từ bảng bên dưới vào các khu vực trống trên CV.
                    </p>
                    <p style={{ margin: '5px 0 0 0', fontSize: '12px' }}>
                        <span>→ Kéo mũi tên phải để thêm vào bên phải</span><br />
                        <span>↓ Kéo mũi tên xuống để thêm vào giữa</span>
                    </p>
                    <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#1890ff' }}>
                        <SaveOutlined style={{ marginRight: '5px' }} />
                        <strong>Nhấn nút lưu để giữ lại CV khi thoát.</strong>
                    </p>
                    <Button
                        type="link"
                        size="small"
                        style={{ padding: 0, fontSize: '12px' }}
                        onClick={() => setShowFieldsPanel(prev => !prev)}
                    >
                        {showFieldsPanel ? 'Ẩn bảng trường' : 'Hiện bảng trường'}
                    </Button>
                </div>
            )}

            {isEditable && showFieldsPanel && (
                <div className="draggable-fields-panel">
                    <Card
                        title="Kéo và thả trường vào CV"
                        size="small"
                        extra={
                            <Button
                                type="text"
                                size="small"
                                onClick={() => setShowFieldsPanel(false)}
                                style={{ padding: '0', lineHeight: '1' }}
                            >
                                X
                            </Button>
                        }
                    >
                        <div className="draggable-fields-container">
                            {suggestedFields.map((field) => (
                                <DraggableField
                                    key={field}
                                    name={field}
                                    onDragStart={handleDragStart}
                                />
                            ))}
                            <Button
                                type="dashed"
                                onClick={() => setIsAddFieldModalVisible(true)}
                                style={{ marginTop: '8px', width: '100%', fontSize: '12px', height: '28px' }}
                            >
                                <PlusOutlined /> Tùy chỉnh trường mới
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            <Modal
                title="Thêm trường mới"
                open={isAddFieldModalVisible}
                onCancel={() => {
                    setIsAddFieldModalVisible(false);
                    form.resetFields();
                }}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleAddField}
                >
                    <Form.Item
                        name="fieldName"
                        label="Tên trường"
                        rules={[{ required: true, message: 'Vui lòng nhập tên trường!' }]}
                    >
                        <Input placeholder="Ví dụ: languages, certificates..." />
                    </Form.Item>
                    <Form.Item
                        name="fieldValue"
                        label="Giá trị"
                        rules={[{ required: true, message: 'Vui lòng nhập giá trị!' }]}
                    >
                        <Input placeholder="Giá trị của trường" />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Thêm
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            <Popconfirm
                title="Xóa trường"
                description="Bạn có chắc chắn muốn xóa trường này?"
                open={!!fieldToDelete}
                onConfirm={() => fieldToDelete && handleDeleteField(fieldToDelete)}
                onCancel={() => setFieldToDelete(null)}
                okText="Xóa"
                cancelText="Hủy"
            />

            <div ref={cvRef}>
                {renderTemplate()}
            </div>
        </div>
    );
};

export default CVPreview; 