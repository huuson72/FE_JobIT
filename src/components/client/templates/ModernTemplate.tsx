import React, { useState } from 'react';
import { Typography, Divider } from 'antd';
import {
    MailOutlined,
    PhoneOutlined,
    EnvironmentOutlined,
    GlobalOutlined,
    CalendarOutlined,
    InboxOutlined,
    InfoCircleOutlined,
    DeleteOutlined
} from '@ant-design/icons';
import '../CVPreview.css';

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

interface ModernTemplateProps {
    data: CVData;
    isEditable: boolean;
    onEdit?: (field: string, value: any) => void;
    draggingField?: string | null;
    onDropField?: (fieldName: string, position?: string) => void;
    dropPosition?: string;
    onDeleteField?: (fieldName: string) => void;
}

const ModernTemplate: React.FC<ModernTemplateProps> = ({
    data,
    isEditable,
    onEdit,
    draggingField,
    onDropField,
    dropPosition = 'left',
    onDeleteField
}) => {
    const [activeDropZone, setActiveDropZone] = useState<string | null>(null);

    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit' });
    };

    // Helper function to make content editable
    const makeEditable = (content: React.ReactNode, field: string, value: any) => {
        if (!isEditable) return content;

        return (
            <div
                contentEditable
                suppressContentEditableWarning
                style={{ outline: 'none', border: '1px dashed transparent', padding: '2px', cursor: 'text' }}
                onBlur={(e) => onEdit && onEdit(field, e.currentTarget.textContent)}
                onFocus={(e) => e.currentTarget.style.border = '1px dashed #1890ff'}
                onMouseLeave={(e) => e.currentTarget.style.border = '1px dashed transparent'}
            >
                {content}
            </div>
        );
    };

    // Handle drag over for drop zones
    const handleDragOver = (e: React.DragEvent, id: string) => {
        e.preventDefault();
        setActiveDropZone(id);
    };

    // Handle drag leave for drop zones
    const handleDragLeave = () => {
        setActiveDropZone(null);
    };

    // Handle drop for drop zones
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setActiveDropZone(null);

        if (draggingField && onDropField) {
            onDropField(draggingField, dropPosition);
        }
    };

    // Render a drop zone component
    const renderDropZone = (id: string, location: string) => {
        if (!isEditable || !onDropField) return null;

        // Only show drop zones based on current position mode
        if (dropPosition === 'right' && location !== 'main') return null;
        if (dropPosition === 'left' && location !== 'sidebar') return null;
        if (dropPosition === 'middle' && location !== 'middle') return null;

        return (
            <div
                className={`cv-drop-zone ${activeDropZone === id ? 'active' : ''}`}
                onDragOver={(e) => handleDragOver(e, id)}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <InboxOutlined />
                <div className="cv-drop-zone-text">Kéo thả trường vào đây</div>
            </div>
        );
    };

    // Get all custom fields
    const customFields = Object.entries(data).filter(([key]) =>
        !['fullName', 'email', 'phone', 'address', 'website', 'birthDate', 'objective',
            'education', 'experience', 'skills', 'activities', 'awards'].includes(key)
    );

    // Separate left, middle and right fields
    const leftCustomFields = customFields.filter(([key]) => !key.startsWith('right_') && !key.startsWith('middle_'));
    const rightCustomFields = customFields.filter(([key]) => key.startsWith('right_'));
    const middleCustomFields = customFields.filter(([key]) => key.startsWith('middle_'));

    return (
        <div className="cv-preview-container modern-template">
            <div className="cv-sidebar">
                {data.fullName && (
                    <div className="sidebar-section">
                        <h2>{makeEditable(data.fullName, 'fullName', data.fullName)}</h2>
                    </div>
                )}

                <div className="sidebar-section">
                    <div className="contact-info">
                        {data.email && (
                            <div className="info-item">
                                <MailOutlined />
                                <span>{makeEditable(data.email, 'email', data.email)}</span>
                            </div>
                        )}
                        {data.phone && (
                            <div className="info-item">
                                <PhoneOutlined />
                                <span>{makeEditable(data.phone, 'phone', data.phone)}</span>
                            </div>
                        )}
                        {data.address && (
                            <div className="info-item">
                                <EnvironmentOutlined />
                                <span>{makeEditable(data.address, 'address', data.address)}</span>
                            </div>
                        )}
                        {data.website && (
                            <div className="info-item">
                                <GlobalOutlined />
                                <span>{makeEditable(data.website, 'website', data.website)}</span>
                            </div>
                        )}
                        {data.birthDate && (
                            <div className="info-item">
                                <CalendarOutlined />
                                <span>{makeEditable(formatDate(data.birthDate), 'birthDate', data.birthDate)}</span>
                            </div>
                        )}
                    </div>
                </div>

                {data.objective && (
                    <div className="sidebar-section">
                        <h3>{makeEditable("MỤC TIÊU NGHỀ NGHIỆP", "objectiveSectionTitle", "MỤC TIÊU NGHỀ NGHIỆP")}</h3>
                        <p>{makeEditable(data.objective, 'objective', data.objective)}</p>
                    </div>
                )}

                {data.skills && data.skills.length > 0 && (
                    <div className="sidebar-section">
                        <h3>{makeEditable("KỸ NĂNG", "skillsSectionTitle", "KỸ NĂNG")}</h3>
                        <div className="skills-container">
                            {data.skills.map((skill, index) => (
                                <span key={index} className="skill-tag">
                                    {makeEditable(skill, `skills[${index}]`, skill)}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Left side Custom Fields in Sidebar */}
                {leftCustomFields.length > 0 && (
                    <div className="sidebar-section">
                        <h3>{makeEditable("THÔNG TIN THÊM", "additionalInfoTitle", "THÔNG TIN THÊM")}</h3>
                        {leftCustomFields.map(([key, value], index) => (
                            <div key={index} className="info-item custom-field">
                                <InfoCircleOutlined />
                                <div className="custom-field-content">
                                    <div className="custom-field-header">
                                        <strong>{makeEditable(key, `customFieldTitle_${key}`, key)}: </strong>
                                        {isEditable && onDeleteField && (
                                            <DeleteOutlined
                                                className="custom-field-delete"
                                                onClick={() => onDeleteField(key)}
                                            />
                                        )}
                                    </div>
                                    <span>{makeEditable(value as string, key, value)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Sidebar Drop Zone */}
                {renderDropZone('sidebar-drop', 'sidebar')}
            </div>

            <div className="cv-main">
                {/* Middle Custom Fields Section */}
                {(middleCustomFields.length > 0 || (isEditable && dropPosition === 'middle')) && (
                    <div className="cv-section middle-section">
                        <h3>{makeEditable("THÔNG TIN GIỮA", "middleSectionTitle", "THÔNG TIN GIỮA")}</h3>
                        {middleCustomFields.map(([key, value], index) => {
                            // Remove 'middle_' prefix for display
                            const displayKey = key.replace('middle_', '');
                            return (
                                <div key={index} className="section-item custom-field">
                                    <div className="item-header custom-field-header">
                                        <h4>{makeEditable(displayKey, `customFieldTitle_${key}`, displayKey)}</h4>
                                        {isEditable && onDeleteField && (
                                            <DeleteOutlined
                                                className="custom-field-delete"
                                                onClick={() => onDeleteField(key)}
                                            />
                                        )}
                                    </div>
                                    <div className="item-description">
                                        {makeEditable(value as string, key, value)}
                                    </div>
                                </div>
                            );
                        })}
                        {renderDropZone('middle-drop', 'middle')}
                    </div>
                )}

                {data.experience && data.experience.length > 0 && (
                    <div className="cv-section">
                        <h3>{makeEditable("KINH NGHIỆM LÀM VIỆC", "experienceSectionTitle", "KINH NGHIỆM LÀM VIỆC")}</h3>
                        {data.experience.map((exp, index) => (
                            <div key={index} className="section-item">
                                <div className="item-header">
                                    <h4>{makeEditable(exp.position, `experience[${index}].position`, exp.position)}</h4>
                                    <div className="item-date">{makeEditable(exp.date, `experience[${index}].date`, exp.date)}</div>
                                </div>
                                <div className="item-subheader">{makeEditable(exp.company, `experience[${index}].company`, exp.company)}</div>
                                <div className="item-description">
                                    {makeEditable(exp.description, `experience[${index}].description`, exp.description)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {data.education && data.education.length > 0 && (
                    <div className="cv-section">
                        <h3>{makeEditable("HỌC VẤN", "educationSectionTitle", "HỌC VẤN")}</h3>
                        {data.education.map((edu, index) => (
                            <div key={index} className="section-item">
                                <div className="item-header">
                                    <h4>{makeEditable(edu.school, `education[${index}].school`, edu.school)}</h4>
                                    <div className="item-date">{makeEditable(edu.date, `education[${index}].date`, edu.date)}</div>
                                </div>
                                <div className="item-subheader">{makeEditable(edu.degree, `education[${index}].degree`, edu.degree)}</div>
                                {edu.description && (
                                    <div className="item-description">
                                        <p>{makeEditable(edu.description, `education[${index}].description`, edu.description)}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {data.activities && data.activities.length > 0 && (
                    <div className="cv-section">
                        <h3>{makeEditable("HOẠT ĐỘNG", "activitiesSectionTitle", "HOẠT ĐỘNG")}</h3>
                        {data.activities.map((activity, index) => (
                            <div key={index} className="section-item">
                                <div className="item-header">
                                    <h4>{makeEditable(activity.organization, `activities[${index}].organization`, activity.organization)}</h4>
                                    <div className="item-date">{makeEditable(activity.date, `activities[${index}].date`, activity.date)}</div>
                                </div>
                                <div className="item-subheader">{makeEditable(activity.role, `activities[${index}].role`, activity.role)}</div>
                                <div className="item-description">
                                    <p>{makeEditable(activity.description, `activities[${index}].description`, activity.description)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {data.awards && data.awards.length > 0 && (
                    <div className="cv-section">
                        <h3>{makeEditable("GIẢI THƯỞNG & CHỨNG NHẬN", "awardsSectionTitle", "GIẢI THƯỞNG & CHỨNG NHẬN")}</h3>
                        {data.awards.map((award, index) => (
                            <div key={index} className="section-item">
                                <div className="item-header">
                                    <h4>{makeEditable(award.title, `awards[${index}].title`, award.title)}</h4>
                                    <div className="item-date">{makeEditable(award.date, `awards[${index}].date`, award.date)}</div>
                                </div>
                                {award.description && (
                                    <div className="item-description">
                                        <p>{makeEditable(award.description, `awards[${index}].description`, award.description)}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Right side Custom Fields in Main Area (if any) */}
                {rightCustomFields.length > 0 && (
                    <div className="cv-section">
                        <h3>{makeEditable("BÊN PHẢI", "rightSideTitle", "BÊN PHẢI")}</h3>
                        {rightCustomFields.map(([key, value], index) => {
                            // Remove 'right_' prefix for display
                            const displayKey = key.replace('right_', '');
                            return (
                                <div key={index} className="section-item custom-field">
                                    <div className="item-header custom-field-header">
                                        <h4>{makeEditable(displayKey, `customFieldTitle_${key}`, displayKey)}</h4>
                                        {isEditable && onDeleteField && (
                                            <DeleteOutlined
                                                className="custom-field-delete"
                                                onClick={() => onDeleteField(key)}
                                            />
                                        )}
                                    </div>
                                    <div className="item-description">
                                        {makeEditable(value as string, key, value)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Main Content Drop Zone */}
                {renderDropZone('main-drop', 'main')}
            </div>
        </div>
    );
};

export default ModernTemplate; 