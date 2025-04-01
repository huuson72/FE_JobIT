import React from 'react';
import { Typography } from 'antd';
import {
    MailOutlined,
    PhoneOutlined,
    EnvironmentOutlined,
    GlobalOutlined,
    CalendarOutlined
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
}

interface CreativeTemplateProps {
    data: CVData;
    isEditable: boolean;
    onEdit?: (field: string, value: any) => void;
}

const CreativeTemplate: React.FC<CreativeTemplateProps> = ({ data, isEditable, onEdit }) => {
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
                onFocus={(e) => e.currentTarget.style.border = '1px dashed #52c41a'}
                onMouseLeave={(e) => e.currentTarget.style.border = '1px dashed transparent'}
            >
                {content}
            </div>
        );
    };

    return (
        <div className="cv-preview-container creative-template">
            <div className="cv-header">
                <h1 className="creative-name">{makeEditable(data.fullName, 'fullName', data.fullName)}</h1>

                {data.objective && (
                    <div className="creative-objective">
                        <p>{makeEditable(data.objective, 'objective', data.objective)}</p>
                    </div>
                )}
            </div>

            <div className="cv-body">
                <div className="left-column">
                    <div className="contact-section">
                        <h3 className="section-title">THÔNG TIN LIÊN HỆ</h3>
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

                    {data.skills && data.skills.length > 0 && (
                        <div className="skills-section">
                            <h3 className="section-title">KỸ NĂNG</h3>
                            <div className="creative-skills">
                                {data.skills.map((skill, index) => (
                                    <div key={index} className="creative-skill-tag">
                                        {makeEditable(skill, `skills[${index}]`, skill)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {data.education && data.education.length > 0 && (
                        <div className="education-section">
                            <h3 className="section-title">HỌC VẤN</h3>
                            {data.education.map((edu, index) => (
                                <div key={index} className="creative-item">
                                    <h4>{makeEditable(edu.school, `education[${index}].school`, edu.school)}</h4>
                                    <div className="creative-subtitle">{makeEditable(edu.degree, `education[${index}].degree`, edu.degree)}</div>
                                    <div className="creative-date">{makeEditable(edu.date, `education[${index}].date`, edu.date)}</div>
                                    {edu.description && (
                                        <p>{makeEditable(edu.description, `education[${index}].description`, edu.description)}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="right-column">
                    {data.experience && data.experience.length > 0 && (
                        <div className="experience-section">
                            <h3 className="section-title">KINH NGHIỆM LÀM VIỆC</h3>
                            {data.experience.map((exp, index) => (
                                <div key={index} className="creative-item">
                                    <div className="creative-item-header">
                                        <h4>{makeEditable(exp.position, `experience[${index}].position`, exp.position)}</h4>
                                        <div className="creative-date">{makeEditable(exp.date, `experience[${index}].date`, exp.date)}</div>
                                    </div>
                                    <div className="creative-subtitle">{makeEditable(exp.company, `experience[${index}].company`, exp.company)}</div>
                                    <div className="creative-description">
                                        {makeEditable(exp.description, `experience[${index}].description`, exp.description)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {data.activities && data.activities.length > 0 && (
                        <div className="activities-section">
                            <h3 className="section-title">HOẠT ĐỘNG</h3>
                            {data.activities.map((activity, index) => (
                                <div key={index} className="creative-item">
                                    <div className="creative-item-header">
                                        <h4>{makeEditable(activity.organization, `activities[${index}].organization`, activity.organization)}</h4>
                                        <div className="creative-date">{makeEditable(activity.date, `activities[${index}].date`, activity.date)}</div>
                                    </div>
                                    <div className="creative-subtitle">{makeEditable(activity.role, `activities[${index}].role`, activity.role)}</div>
                                    <div className="creative-description">
                                        {makeEditable(activity.description, `activities[${index}].description`, activity.description)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {data.awards && data.awards.length > 0 && (
                        <div className="awards-section">
                            <h3 className="section-title">GIẢI THƯỞNG & CHỨNG NHẬN</h3>
                            {data.awards.map((award, index) => (
                                <div key={index} className="creative-item">
                                    <div className="creative-item-header">
                                        <h4>{makeEditable(award.title, `awards[${index}].title`, award.title)}</h4>
                                        <div className="creative-date">{makeEditable(award.date, `awards[${index}].date`, award.date)}</div>
                                    </div>
                                    {award.description && (
                                        <div className="creative-description">
                                            {makeEditable(award.description, `awards[${index}].description`, award.description)}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreativeTemplate; 