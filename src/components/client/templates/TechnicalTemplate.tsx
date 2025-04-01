import React, { useState } from 'react';
import {
    MailOutlined,
    PhoneOutlined,
    EnvironmentOutlined,
    GlobalOutlined,
    CodeOutlined,
    LaptopOutlined,
    ToolOutlined,
    GithubOutlined,
    ApiOutlined,
    DatabaseOutlined,
    CloudOutlined,
    RobotOutlined,
    BranchesOutlined,
    PlusOutlined,
    InboxOutlined,
    DeleteOutlined,
    ContactsOutlined,
    HistoryOutlined,
    ReadOutlined,
    TrophyOutlined,
    InfoCircleOutlined
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

interface TechnicalTemplateProps {
    data: CVData;
    isEditable: boolean;
    onEdit?: (field: string, value: any) => void;
    draggingField?: string | null;
    onDropField?: (fieldName: string, position?: string) => void;
    dropPosition?: string;
    onDeleteField?: (fieldName: string) => void;
}

const TechnicalTemplate: React.FC<TechnicalTemplateProps> = ({
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
                onFocus={(e) => e.currentTarget.style.border = '1px dashed #eb2f96'}
                onMouseLeave={(e) => e.currentTarget.style.border = '1px dashed transparent'}
            >
                {content}
            </div>
        );
    };

    // Function to get a tech icon for a skill
    const getSkillIcon = (skill: string) => {
        const skillLower = skill.toLowerCase();
        if (skillLower.includes('java') || skillLower.includes('python') || skillLower.includes('c++') ||
            skillLower.includes('javascript') || skillLower.includes('typescript') || skillLower.includes('php')) {
            return <CodeOutlined />;
        } else if (skillLower.includes('git') || skillLower.includes('github')) {
            return <GithubOutlined />;
        } else if (skillLower.includes('api') || skillLower.includes('rest') || skillLower.includes('graphql')) {
            return <ApiOutlined />;
        } else if (skillLower.includes('cloud') || skillLower.includes('aws') || skillLower.includes('azure')) {
            return <CloudOutlined />;
        } else if (skillLower.includes('sql') || skillLower.includes('database') || skillLower.includes('mongodb')) {
            return <DatabaseOutlined />;
        } else if (skillLower.includes('ai') || skillLower.includes('machine learning') || skillLower.includes('ml')) {
            return <RobotOutlined />;
        } else if (skillLower.includes('devops') || skillLower.includes('ci/cd')) {
            return <BranchesOutlined />;
        } else {
            return <ToolOutlined />;
        }
    };

    // Generate a skill proficiency level for display
    const getRandomSkillLevel = () => {
        return Math.floor(Math.random() * 40) + 60; // Return a number between 60-100
    };

    // Determine if we should show a drop zone
    const shouldShowDropZone = (location: string) => {
        if (!isEditable || !onDropField) return false;
        if (dropPosition === 'right' && location !== 'main') return false;
        if (dropPosition === 'left' && location !== 'sidebar') return false;
        if (dropPosition === 'middle' && location !== 'middle') return false;
        return true;
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
        if (!shouldShowDropZone(location)) return null;

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

    // Check if there are custom fields
    const customFields = Object.entries(data).filter(([key]) =>
        !['fullName', 'email', 'phone', 'address', 'website', 'birthDate', 'objective',
            'education', 'experience', 'skills', 'activities', 'awards'].includes(key)
    );

    // Separate fields by position
    const leftCustomFields = customFields.filter(([key]) => !key.startsWith('right_') && !key.startsWith('middle_'));
    const rightCustomFields = customFields.filter(([key]) => key.startsWith('right_'));
    const middleCustomFields = customFields.filter(([key]) => key.startsWith('middle_'));

    return (
        <div className="cv-preview-container technical-template">
            {/* Terminal-style header with fullname as command prompt */}
            <div className="tech-header">
                <div className="tech-terminal">
                    <div className="tech-terminal-buttons">
                        <span className="tech-terminal-button tech-close"></span>
                        <span className="tech-terminal-button tech-minimize"></span>
                        <span className="tech-terminal-button tech-maximize"></span>
                    </div>
                    <div className="tech-terminal-title">{makeEditable("developer-profile.sh", "terminalTitle", "developer-profile.sh")}</div>
                </div>
                <div className="tech-terminal-content">
                    <div className="tech-prompt">
                        <span className="tech-user">{makeEditable("user@portfolio", "terminalUser", "user@portfolio")}</span>
                        <span className="tech-separator">:</span>
                        <span className="tech-directory">~</span>
                        <span className="tech-command">{makeEditable("$ ./view-profile", "terminalCommand", "$ ./view-profile")}</span>
                    </div>
                    <div className="tech-output">
                        <div className="tech-ascii-name">{makeEditable(data.fullName, 'fullName', data.fullName)}</div>
                        {data.objective && (
                            <div className="tech-objective">&gt; {makeEditable(data.objective, 'objective', data.objective)}</div>
                        )}
                    </div>
                </div>
            </div>

            <div className="tech-body">
                <div className="tech-sidebar">
                    <div className="tech-profile-section">
                        <h2 className="tech-section-title">
                            <ContactsOutlined /> {makeEditable("THÔNG TIN LIÊN HỆ", "contactSectionTitle", "THÔNG TIN LIÊN HỆ")}
                        </h2>
                        <div className="tech-contact-items">
                            {data.email && (
                                <div className="tech-contact-item">
                                    <MailOutlined />
                                    <span>{makeEditable(data.email, 'email', data.email)}</span>
                                </div>
                            )}
                            {data.phone && (
                                <div className="tech-contact-item">
                                    <PhoneOutlined />
                                    <span>{makeEditable(data.phone, 'phone', data.phone)}</span>
                                </div>
                            )}
                            {data.address && (
                                <div className="tech-contact-item">
                                    <EnvironmentOutlined />
                                    <span>{makeEditable(data.address, 'address', data.address)}</span>
                                </div>
                            )}
                            {data.website && (
                                <div className="tech-contact-item">
                                    <GlobalOutlined />
                                    <span>{makeEditable(data.website, 'website', data.website)}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {data.education && data.education.length > 0 && (
                        <div className="tech-profile-section">
                            <h2 className="tech-section-title">
                                <ReadOutlined /> {makeEditable("HỌC VẤN", "educationSectionTitle", "HỌC VẤN")}
                            </h2>
                            {data.education.map((edu, index) => (
                                <div key={index} className="tech-card">
                                    <div className="tech-card-title">
                                        {makeEditable(edu.degree, `education[${index}].degree`, edu.degree)}
                                    </div>
                                    <div className="tech-card-subtitle">
                                        {makeEditable(edu.school, `education[${index}].school`, edu.school)}
                                    </div>
                                    <div className="tech-card-date">
                                        {makeEditable(edu.date, `education[${index}].date`, edu.date)}
                                    </div>
                                    {edu.description && (
                                        <div className="tech-card-description">
                                            {makeEditable(edu.description, `education[${index}].description`, edu.description)}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {data.skills && data.skills.length > 0 && (
                        <div className="tech-profile-section">
                            <h2 className="tech-section-title">
                                <CodeOutlined /> {makeEditable("KỸ NĂNG", "skillsSectionTitle", "KỸ NĂNG")}
                            </h2>
                            <div className="tech-skills-container">
                                {data.skills.map((skill, index) => {
                                    const level = getRandomSkillLevel();
                                    return (
                                        <div key={index} className="tech-skill-item">
                                            <div className="tech-skill-header">
                                                <span className="tech-skill-icon">{getSkillIcon(skill)}</span>
                                                <span className="tech-skill-name">{makeEditable(skill, `skills[${index}]`, skill)}</span>
                                                <span className="tech-skill-percentage">{level}%</span>
                                            </div>
                                            <div className="tech-skill-bar">
                                                <div className="tech-skill-progress" style={{ width: `${level}%` }}></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Left Custom Fields Section */}
                    {(leftCustomFields.length > 0 || shouldShowDropZone('sidebar')) && (
                        <div className="tech-profile-section">
                            <h2 className="tech-section-title">
                                <InfoCircleOutlined /> {makeEditable("THÔNG TIN THÊM", "additionalInfoTitle", "THÔNG TIN THÊM")}
                            </h2>
                            <div className="tech-additional-info">
                                {leftCustomFields.map(([key, value], index) => (
                                    <div key={index} className="tech-card">
                                        <div className="tech-card-title custom-field-header">
                                            {makeEditable(key, `customFieldTitle_${key}`, key)}
                                            {isEditable && onDeleteField && (
                                                <DeleteOutlined
                                                    className="custom-field-delete"
                                                    onClick={() => onDeleteField(key)}
                                                />
                                            )}
                                        </div>
                                        <div className="tech-card-description">
                                            {makeEditable(value as string, key, value)}
                                        </div>
                                    </div>
                                ))}
                                {/* Drop zone for sidebar custom fields */}
                                {renderDropZone('sidebar-drop', 'sidebar')}
                            </div>
                        </div>
                    )}
                </div>

                <div className="tech-main">
                    {/* Middle Custom Fields Section */}
                    {(middleCustomFields.length > 0 || shouldShowDropZone('middle')) && (
                        <div className="tech-profile-section middle-section">
                            <h2 className="tech-section-title">
                                <InfoCircleOutlined /> {makeEditable("GIỮA", "middleSectionTitle", "GIỮA")}
                            </h2>
                            <div className="tech-additional-info">
                                {middleCustomFields.map(([key, value], index) => {
                                    // Remove 'middle_' prefix for display
                                    const displayKey = key.replace('middle_', '');
                                    return (
                                        <div key={index} className="tech-card">
                                            <div className="tech-card-title custom-field-header">
                                                {makeEditable(displayKey, `customFieldTitle_${key}`, displayKey)}
                                                {isEditable && onDeleteField && (
                                                    <DeleteOutlined
                                                        className="custom-field-delete"
                                                        onClick={() => onDeleteField(key)}
                                                    />
                                                )}
                                            </div>
                                            <div className="tech-card-description">
                                                {makeEditable(value as string, key, value)}
                                            </div>
                                        </div>
                                    );
                                })}
                                {/* Drop zone for middle content custom fields */}
                                {renderDropZone('middle-drop', 'middle')}
                            </div>
                        </div>
                    )}

                    {data.experience && data.experience.length > 0 && (
                        <div className="tech-profile-section">
                            <h2 className="tech-section-title">
                                <HistoryOutlined /> {makeEditable("KINH NGHIỆM LÀM VIỆC", "experienceSectionTitle", "KINH NGHIỆM LÀM VIỆC")}
                            </h2>
                            <div className="tech-timeline">
                                {data.experience.map((exp, index) => (
                                    <div key={index} className="tech-timeline-item">
                                        <div className="tech-timeline-dot"></div>
                                        <div className="tech-timeline-content">
                                            <div className="tech-timeline-header">
                                                <h3 className="tech-timeline-title">
                                                    {makeEditable(exp.position, `experience[${index}].position`, exp.position)}
                                                </h3>
                                                <span className="tech-timeline-date">
                                                    {makeEditable(exp.date, `experience[${index}].date`, exp.date)}
                                                </span>
                                            </div>
                                            <div className="tech-timeline-subtitle">
                                                @ {makeEditable(exp.company, `experience[${index}].company`, exp.company)}
                                            </div>
                                            <div className="tech-timeline-description">
                                                <pre className="tech-code-snippet">
                                                    {makeEditable(exp.description, `experience[${index}].description`, exp.description)}
                                                </pre>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {data.activities && data.activities.length > 0 && (
                        <div className="tech-profile-section">
                            <h2 className="tech-section-title">
                                <RobotOutlined /> {makeEditable("PROJECTS", "projectsSectionTitle", "PROJECTS")}
                            </h2>
                            <div className="tech-projects-grid">
                                {data.activities.map((activity, index) => (
                                    <div key={index} className="tech-project-card">
                                        <div className="tech-project-header">
                                            <h3 className="tech-project-title">
                                                {makeEditable(activity.organization, `activities[${index}].organization`, activity.organization)}
                                            </h3>
                                            <span className="tech-project-role">
                                                {makeEditable(activity.role, `activities[${index}].role`, activity.role)}
                                            </span>
                                        </div>
                                        <div className="tech-project-time">
                                            {makeEditable(activity.date, `activities[${index}].date`, activity.date)}
                                        </div>
                                        <div className="tech-project-description">
                                            {makeEditable(activity.description, `activities[${index}].description`, activity.description)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {data.awards && data.awards.length > 0 && (
                        <div className="tech-profile-section">
                            <h2 className="tech-section-title">
                                <TrophyOutlined /> {makeEditable("GIẢI THƯỞNG & CHỨNG NHẬN", "awardsSectionTitle", "GIẢI THƯỞNG & CHỨNG NHẬN")}
                            </h2>
                            <div className="tech-achievements-list">
                                {data.awards.map((award, index) => (
                                    <div key={index} className="tech-achievement-item">
                                        <div className="tech-achievement-badge">🏆</div>
                                        <div className="tech-achievement-content">
                                            <div className="tech-achievement-header">
                                                <h3 className="tech-achievement-title">
                                                    {makeEditable(award.title, `awards[${index}].title`, award.title)}
                                                </h3>
                                                <span className="tech-achievement-date">
                                                    {makeEditable(award.date, `awards[${index}].date`, award.date)}
                                                </span>
                                            </div>
                                            {award.description && (
                                                <div className="tech-achievement-description">
                                                    {makeEditable(award.description, `awards[${index}].description`, award.description)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Right Custom Fields Section */}
                    {(rightCustomFields.length > 0 || shouldShowDropZone('main')) && (
                        <div className="tech-profile-section">
                            <h2 className="tech-section-title">
                                <InfoCircleOutlined /> {makeEditable("BÊN PHẢI", "rightSideInfoTitle", "BÊN PHẢI")}
                            </h2>
                            <div className="tech-additional-info">
                                {rightCustomFields.map(([key, value], index) => {
                                    // Remove 'right_' prefix for display
                                    const displayKey = key.replace('right_', '');
                                    return (
                                        <div key={index} className="tech-card">
                                            <div className="tech-card-title custom-field-header">
                                                {makeEditable(displayKey, `customFieldTitle_${key}`, displayKey)}
                                                {isEditable && onDeleteField && (
                                                    <DeleteOutlined
                                                        className="custom-field-delete"
                                                        onClick={() => onDeleteField(key)}
                                                    />
                                                )}
                                            </div>
                                            <div className="tech-card-description">
                                                {makeEditable(value as string, key, value)}
                                            </div>
                                        </div>
                                    );
                                })}
                                {/* Drop zone for main content custom fields */}
                                {renderDropZone('main-drop', 'main')}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TechnicalTemplate; 