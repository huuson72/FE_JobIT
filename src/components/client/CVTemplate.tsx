import React from 'react';
import './CVTemplate.css';

interface CVData {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    education: string;
    experience: string;
    skills: string;
}

interface CVTemplateProps {
    data: CVData;
}

const CVTemplate: React.FC<CVTemplateProps> = ({ data }) => {
    return (
        <div className="cv-template">
            <div className="cv-header">
                <h1>{data.fullName}</h1>
                <div className="contact-info">
                    <p>{data.email}</p>
                    <p>{data.phone}</p>
                    <p>{data.address}</p>
                </div>
            </div>

            <div className="cv-section">
                <h2>Học vấn</h2>
                <div className="section-content">
                    <p>{data.education}</p>
                </div>
            </div>

            <div className="cv-section">
                <h2>Kinh nghiệm làm việc</h2>
                <div className="section-content">
                    <p>{data.experience}</p>
                </div>
            </div>

            <div className="cv-section">
                <h2>Kỹ năng</h2>
                <div className="section-content">
                    {data.skills.split(',').map((skill, index) => (
                        <span key={index} className="skill-tag">
                            {skill.trim()}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CVTemplate; 