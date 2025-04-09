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
    dropPosition,
    onDeleteField
}) => {
    const [editingField, setEditingField] = useState<string | null>(null);

    const makeEditable = (content: string, field: string, originalValue: any) => {
        if (!isEditable) return content;

        const isEditing = editingField === field;

        const handleClick = () => {
            setEditingField(field);
        };

        const handleBlur = (e: React.FocusEvent<HTMLSpanElement>) => {
            setEditingField(null);
            if (onEdit && e.target.textContent !== originalValue) {
                onEdit(field, e.target.textContent);
            }
        };

        const handleKeyDown = (e: React.KeyboardEvent) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                (e.target as HTMLElement).blur();
            }
        };

        return (
            <span
                contentEditable={isEditable}
                onBlur={handleBlur}
                onClick={handleClick}
                onKeyDown={handleKeyDown}
                style={{
                    position: 'relative',
                    outline: isEditing ? '2px solid #1890ff' : 'none',
                    padding: '2px 4px',
                    borderRadius: '4px',
                    minWidth: '20px',
                    display: 'inline-block'
                }}
                suppressContentEditableWarning
            >
                {content}
            </span>
        );
    };

    const renderDropZone = (id: string, position: string) => {
        if (!isEditable || !onDropField) return null;

        const isValidDrop = draggingField && dropPosition === position;

        const handleDrop = (e: React.DragEvent) => {
            e.preventDefault();
            if (draggingField) {
                onDropField(draggingField, position);
            }
        };

        const handleDragOver = (e: React.DragEvent) => {
            e.preventDefault();
        };

        return (
            <div
                id={id}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                style={{
                    padding: '10px',
                    margin: '10px 0',
                    border: `2px dashed ${isValidDrop ? '#1890ff' : '#d9d9d9'}`,
                    borderRadius: '4px',
                    backgroundColor: isValidDrop ? 'rgba(24, 144, 255, 0.1)' : 'transparent',
                    transition: 'all 0.3s'
                }}
            >
                {isValidDrop ? 'Thả để thêm trường mới' : ''}
            </div>
        );
    };

    // Separate custom fields by position
    const customFields = Object.entries(data).filter(([key]) => !['fullName', 'email', 'phone', 'address', 'website', 'birthDate', 'objective', 'education', 'experience', 'skills', 'activities', 'awards'].includes(key));
    const leftCustomFields = customFields.filter(([key]) => !key.startsWith('right_') && !key.startsWith('middle_'));
    const middleCustomFields = customFields.filter(([key]) => key.startsWith('middle_'));
    const rightCustomFields = customFields.filter(([key]) => key.startsWith('right_'));

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
                        <div className="skills-list">
                            {data.skills.map((skill, index) => (
                                <div key={index} className="skill-item">
                                    {makeEditable(skill, `skills[${index}]`, skill)}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Left side Custom Fields */}
                {(leftCustomFields.length > 0 || (isEditable && dropPosition === 'left')) && (
                    <div className="sidebar-section">
                        {leftCustomFields.map(([key, value]) => (
                            <div key={key} className="custom-field">
                                <div className="custom-field-header">
                                    <h3>{makeEditable(key, `customFieldTitle_${key}`, key)}</h3>
                                    {isEditable && onDeleteField && (
                                        <DeleteOutlined
                                            className="delete-field-icon"
                                            onClick={() => onDeleteField(key)}
                                        />
                                    )}
                                </div>
                                <p>{makeEditable(value as string, key, value)}</p>
                            </div>
                        ))}
                        {/* Drop zone for left custom fields */}
                        {renderDropZone('left-custom-fields-drop', 'left')}
                    </div>
                )}
            </div>

            <div className="cv-main">
                <div className="cv-main-left">
                    {data.education && data.education.length > 0 && (
                        <div className="cv-section">
                            <h3>{makeEditable("HỌC VẤN", "educationSectionTitle", "HỌC VẤN")}</h3>
                            {data.education.map((edu, index) => (
                                <div key={index} className="section-item">
                                    <div className="item-header">
                                        <h4>{makeEditable(edu.school, `education[${index}].school`, edu.school)}</h4>
                                        <div className="item-date">{makeEditable(edu.date, `education[${index}].date`, edu.date)}</div>
                                    </div>
                                    <div className="item-subheader">
                                        {makeEditable(edu.degree, `education[${index}].degree`, edu.degree)}
                                    </div>
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
                                    <div className="item-subheader">
                                        {makeEditable(activity.role, `activities[${index}].role`, activity.role)}
                                    </div>
                                    <div className="item-description">
                                        <p>{makeEditable(activity.description, `activities[${index}].description`, activity.description)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Middle Custom Fields */}
                    {(middleCustomFields.length > 0 || (isEditable && dropPosition === 'middle')) && (
                        <div className="cv-section">
                            {middleCustomFields.map(([key, value]) => (
                                <div key={key} className="custom-field">
                                    <div className="custom-field-header">
                                        <h3>{makeEditable(key.replace('middle_', ''), `customFieldTitle_${key}`, key)}</h3>
                                        {isEditable && onDeleteField && (
                                            <DeleteOutlined
                                                className="delete-field-icon"
                                                onClick={() => onDeleteField(key)}
                                            />
                                        )}
                                    </div>
                                    <p>{makeEditable(value as string, key, value)}</p>
                                </div>
                            ))}
                            {/* Drop zone for middle custom fields */}
                            {renderDropZone('middle-custom-fields-drop', 'middle')}
                        </div>
                    )}
                </div>

                <div className="cv-main-right">
                    {data.experience && data.experience.length > 0 && (
                        <div className="cv-section">
                            <h3>{makeEditable("KINH NGHIỆM LÀM VIỆC", "experienceSectionTitle", "KINH NGHIỆM LÀM VIỆC")}</h3>
                            {data.experience.map((exp, index) => (
                                <div key={index} className="section-item">
                                    <div className="item-header">
                                        <h4>{makeEditable(exp.position, `experience[${index}].position`, exp.position)}</h4>
                                        <div className="item-date">{makeEditable(exp.date, `experience[${index}].date`, exp.date)}</div>
                                    </div>
                                    <div className="item-subheader">
                                        {makeEditable(exp.company, `experience[${index}].company`, exp.company)}
                                    </div>
                                    <div className="item-description">
                                        <p>{makeEditable(exp.description, `experience[${index}].description`, exp.description)}</p>
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

                    {/* Right side Custom Fields */}
                    {(rightCustomFields.length > 0 || (isEditable && dropPosition === 'right')) && (
                        <div className="cv-section">
                            {rightCustomFields.map(([key, value]) => (
                                <div key={key} className="custom-field">
                                    <div className="custom-field-header">
                                        <h3>{makeEditable(key.replace('right_', ''), `customFieldTitle_${key}`, key)}</h3>
                                        {isEditable && onDeleteField && (
                                            <DeleteOutlined
                                                className="delete-field-icon"
                                                onClick={() => onDeleteField(key)}
                                            />
                                        )}
                                    </div>
                                    <p>{makeEditable(value as string, key, value)}</p>
                                </div>
                            ))}
                            {/* Drop zone for right custom fields */}
                            {renderDropZone('right-custom-fields-drop', 'right')}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ModernTemplate; 