import React, { useState } from 'react';
import {
    MailOutlined,
    PhoneOutlined,
    EnvironmentOutlined,
    GlobalOutlined,
    CalendarOutlined,
    InboxOutlined,
    PlusOutlined,
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

interface MinimalTemplateProps {
    data: CVData;
    isEditable: boolean;
    onEdit?: (field: string, value: any) => void;
    draggingField?: string | null;
    onDropField?: (fieldName: string, position?: string) => void;
    dropPosition?: string;
    onDeleteField?: (fieldName: string) => void;
}

const MinimalTemplate: React.FC<MinimalTemplateProps> = ({
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
                onFocus={(e) => e.currentTarget.style.border = '1px dashed #722ed1'}
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
    const renderDropZone = (id: string, position: string) => {
        if (!isEditable || !onDropField) return null;

        // Only show drop zones based on current position mode
        if (dropPosition === 'right' && position !== 'right') return null;
        if (dropPosition === 'left' && position !== 'left') return null;
        if (dropPosition === 'middle' && position !== 'middle') return null;

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

    // Get custom fields
    const customFields = Object.entries(data).filter(([key]) =>
        !['fullName', 'email', 'phone', 'address', 'website', 'birthDate', 'objective',
            'education', 'experience', 'skills', 'activities', 'awards'].includes(key)
    );

    // Separate left, middle and right side custom fields
    const leftCustomFields = customFields.filter(([key]) => !key.startsWith('right_') && !key.startsWith('middle_'));
    const rightCustomFields = customFields.filter(([key]) => key.startsWith('right_'));
    const middleCustomFields = customFields.filter(([key]) => key.startsWith('middle_'));

    return (
        <div className="cv-preview-container minimal-template">
            <header className="minimal-header">
                <h1 className="minimal-name">{makeEditable(data.fullName, 'fullName', data.fullName)}</h1>
                <div className="minimal-contact">
                    {data.email && (
                        <span className="minimal-contact-item">
                            <MailOutlined /> {makeEditable(data.email, 'email', data.email)}
                        </span>
                    )}
                    {data.phone && (
                        <span className="minimal-contact-item">
                            <PhoneOutlined /> {makeEditable(data.phone, 'phone', data.phone)}
                        </span>
                    )}
                    {data.address && (
                        <span className="minimal-contact-item">
                            <EnvironmentOutlined /> {makeEditable(data.address, 'address', data.address)}
                        </span>
                    )}
                </div>
            </header>

            <div className="minimal-container">
                <div className="minimal-left-column">
                    {data.objective && (
                        <section className="minimal-section">
                            <h2 className="minimal-section-title">{makeEditable("MỤC TIÊU NGHỀ NGHIỆP", "objectiveSectionTitle", "MỤC TIÊU NGHỀ NGHIỆP")}</h2>
                            <p className="minimal-objective">{makeEditable(data.objective, 'objective', data.objective)}</p>
                        </section>
                    )}

                    {/* Left side Custom Fields Section */}
                    {(leftCustomFields.length > 0 || (isEditable && dropPosition === 'left')) && (
                        <section className="minimal-section">
                            <h2 className="minimal-section-title">{makeEditable("THÔNG TIN BỔ SUNG", "additionalInfoTitle", "THÔNG TIN BỔ SUNG")}</h2>
                            {leftCustomFields.map(([key, value], index) => (
                                <div key={index} className="minimal-item minimal-custom-item">
                                    <div className="custom-field-header">
                                        <h3 className="minimal-item-title">
                                            {makeEditable(key, `customFieldTitle_${key}`, key)}
                                        </h3>
                                        {isEditable && onDeleteField && (
                                            <DeleteOutlined
                                                className="custom-field-delete"
                                                onClick={() => onDeleteField(key)}
                                            />
                                        )}
                                    </div>
                                    <p className="minimal-item-description">
                                        {makeEditable(value as string, key, value)}
                                    </p>
                                </div>
                            ))}
                            {/* Drop zone for left custom fields */}
                            {renderDropZone('left-custom-fields-drop', 'left')}
                        </section>
                    )}

                    {data.experience && data.experience.length > 0 && (
                        <section className="minimal-section">
                            <h2 className="minimal-section-title">{makeEditable("KINH NGHIỆM LÀM VIỆC", "experienceSectionTitle", "KINH NGHIỆM LÀM VIỆC")}</h2>
                            {data.experience.map((exp, index) => (
                                <div key={index} className="minimal-item">
                                    <h3 className="minimal-item-title">
                                        {makeEditable(exp.position, `experience[${index}].position`, exp.position)}
                                        <span className="minimal-item-company">@{makeEditable(exp.company, `experience[${index}].company`, exp.company)}</span>
                                    </h3>
                                    <p className="minimal-item-date">{makeEditable(exp.date, `experience[${index}].date`, exp.date)}</p>
                                    <p className="minimal-item-description">
                                        {makeEditable(exp.description, `experience[${index}].description`, exp.description)}
                                    </p>
                                </div>
                            ))}
                        </section>
                    )}

                    {data.education && data.education.length > 0 && (
                        <section className="minimal-section">
                            <h2 className="minimal-section-title">{makeEditable("HỌC VẤN", "educationSectionTitle", "HỌC VẤN")}</h2>
                            {data.education.map((edu, index) => (
                                <div key={index} className="minimal-item">
                                    <h3 className="minimal-item-title">
                                        {makeEditable(edu.degree, `education[${index}].degree`, edu.degree)}
                                        <span className="minimal-item-school">@{makeEditable(edu.school, `education[${index}].school`, edu.school)}</span>
                                    </h3>
                                    <p className="minimal-item-date">{makeEditable(edu.date, `education[${index}].date`, edu.date)}</p>
                                    {edu.description && (
                                        <p className="minimal-item-description">
                                            {makeEditable(edu.description, `education[${index}].description`, edu.description)}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </section>
                    )}
                </div>

                <div className="minimal-right-column">
                    {data.skills && data.skills.length > 0 && (
                        <section className="minimal-section">
                            <h2 className="minimal-section-title">{makeEditable("KỸ NĂNG", "skillsSectionTitle", "KỸ NĂNG")}</h2>
                            <div className="minimal-skills">
                                {data.skills.map((skill, index) => (
                                    <span key={index} className="minimal-skill">
                                        {makeEditable(skill, `skills[${index}]`, skill)}
                                    </span>
                                ))}
                            </div>
                        </section>
                    )}

                    {data.activities && data.activities.length > 0 && (
                        <section className="minimal-section">
                            <h2 className="minimal-section-title">{makeEditable("HOẠT ĐỘNG", "activitiesSectionTitle", "HOẠT ĐỘNG")}</h2>
                            {data.activities.map((activity, index) => (
                                <div key={index} className="minimal-item">
                                    <h3 className="minimal-item-title">
                                        {makeEditable(activity.role, `activities[${index}].role`, activity.role)}
                                        <span className="minimal-item-organization">@{makeEditable(activity.organization, `activities[${index}].organization`, activity.organization)}</span>
                                    </h3>
                                    <p className="minimal-item-date">{makeEditable(activity.date, `activities[${index}].date`, activity.date)}</p>
                                    <p className="minimal-item-description">
                                        {makeEditable(activity.description, `activities[${index}].description`, activity.description)}
                                    </p>
                                </div>
                            ))}
                        </section>
                    )}

                    {data.awards && data.awards.length > 0 && (
                        <section className="minimal-section">
                            <h2 className="minimal-section-title">{makeEditable("GIẢI THƯỞNG & CHỨNG NHẬN", "awardsSectionTitle", "GIẢI THƯỞNG & CHỨNG NHẬN")}</h2>
                            {data.awards.map((award, index) => (
                                <div key={index} className="minimal-item">
                                    <h3 className="minimal-item-title">
                                        {makeEditable(award.title, `awards[${index}].title`, award.title)}
                                    </h3>
                                    <p className="minimal-item-date">{makeEditable(award.date, `awards[${index}].date`, award.date)}</p>
                                    {award.description && (
                                        <p className="minimal-item-description">
                                            {makeEditable(award.description, `awards[${index}].description`, award.description)}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </section>
                    )}

                    {/* Right side Custom Fields Section */}
                    {(rightCustomFields.length > 0 || (isEditable && dropPosition === 'right')) && (
                        <section className="minimal-section">
                            <h2 className="minimal-section-title">{makeEditable("THÔNG TIN BÊN PHẢI", "rightSideInfoTitle", "THÔNG TIN BÊN PHẢI")}</h2>
                            {rightCustomFields.map(([key, value], index) => {
                                // Remove 'right_' prefix for display
                                const displayKey = key.replace('right_', '');
                                return (
                                    <div key={index} className="minimal-item minimal-custom-item">
                                        <div className="custom-field-header">
                                            <h3 className="minimal-item-title">
                                                {makeEditable(displayKey, `customFieldTitle_${key}`, displayKey)}
                                            </h3>
                                            {isEditable && onDeleteField && (
                                                <DeleteOutlined
                                                    className="custom-field-delete"
                                                    onClick={() => onDeleteField(key)}
                                                />
                                            )}
                                        </div>
                                        <p className="minimal-item-description">
                                            {makeEditable(value as string, key, value)}
                                        </p>
                                    </div>
                                );
                            })}
                            {/* Drop zone for right custom fields */}
                            {renderDropZone('right-custom-fields-drop', 'right')}
                        </section>
                    )}
                </div>
            </div>

            {/* Middle Custom Fields Section */}
            {(middleCustomFields.length > 0 || (isEditable && dropPosition === 'middle')) && (
                <section className="minimal-section minimal-middle-section">
                    <h2 className="minimal-section-title">{makeEditable("THÔNG TIN GIỮA", "middleSectionTitle", "THÔNG TIN GIỮA")}</h2>
                    {middleCustomFields.map(([key, value], index) => {
                        // Remove 'middle_' prefix for display
                        const displayKey = key.replace('middle_', '');
                        return (
                            <div key={index} className="minimal-item minimal-custom-item">
                                <div className="custom-field-header">
                                    <h3 className="minimal-item-title">
                                        {makeEditable(displayKey, `customFieldTitle_${key}`, displayKey)}
                                    </h3>
                                    {isEditable && onDeleteField && (
                                        <DeleteOutlined
                                            className="custom-field-delete"
                                            onClick={() => onDeleteField(key)}
                                        />
                                    )}
                                </div>
                                <p className="minimal-item-description">
                                    {makeEditable(value as string, key, value)}
                                </p>
                            </div>
                        );
                    })}
                    {/* Drop zone for middle custom fields */}
                    {renderDropZone('middle-custom-fields-drop', 'middle')}
                </section>
            )}
        </div>
    );
};

export default MinimalTemplate; 