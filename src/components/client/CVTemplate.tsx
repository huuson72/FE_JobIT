import React from 'react';
import './CVTemplate.css';

interface CVTemplateProps {
    data: {
        fullName: string;
        title: string;
        email: string;
        phone: string;
        address: string;
        education: string;
        experience: string;
        skills: string;
        additionalInfo: string;
    };
    isEditing?: boolean;
    onEdit?: (field: string, value: string) => void;
}

const CVTemplate: React.FC<CVTemplateProps> = ({ data, isEditing = false, onEdit }) => {
    const handleEdit = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (onEdit) {
            onEdit(field, e.target.value);
        }
    };

    return (
        <div className="cv-template modern">
            <div className="cv-sidebar">
                <div className="profile-section">
                    <div className="profile-image">
                        <i className="fas fa-user"></i>
                    </div>
                    <div className="profile-name">
                        {isEditing ? (
                            <input
                                type="text"
                                className="editable-name"
                                value={data.fullName}
                                onChange={handleEdit('fullName')}
                                placeholder="Your Full Name"
                            />
                        ) : (
                            <h2>{data.fullName}</h2>
                        )}
                    </div>
                    {isEditing ? (
                        <input
                            type="text"
                            className="editable-title"
                            value={data.title}
                            onChange={handleEdit('title')}
                            placeholder="Your Professional Title"
                        />
                    ) : (
                        <div className="profile-title">{data.title}</div>
                    )}
                </div>

                <div className="contact-section">
                    <h3 className="sidebar-heading">Contact Information</h3>
                    <div className="contact-item">
                        <i className="fas fa-envelope"></i>
                        {isEditing ? (
                            <input
                                type="text"
                                className="editable-field"
                                value={data.email}
                                onChange={handleEdit('email')}
                                placeholder="Your Email"
                            />
                        ) : (
                            <span>{data.email}</span>
                        )}
                    </div>
                    <div className="contact-item">
                        <i className="fas fa-phone"></i>
                        {isEditing ? (
                            <input
                                type="text"
                                className="editable-field"
                                value={data.phone}
                                onChange={handleEdit('phone')}
                                placeholder="Your Phone"
                            />
                        ) : (
                            <span>{data.phone}</span>
                        )}
                    </div>
                    <div className="contact-item">
                        <i className="fas fa-map-marker-alt"></i>
                        {isEditing ? (
                            <input
                                type="text"
                                className="editable-field"
                                value={data.address}
                                onChange={handleEdit('address')}
                                placeholder="Your Address"
                            />
                        ) : (
                            <span>{data.address}</span>
                        )}
                    </div>
                </div>

                <div className="skills-section">
                    <h3 className="sidebar-heading">Skills</h3>
                    <div className="skills-list">
                        {isEditing ? (
                            <textarea
                                className="editable-textarea"
                                value={data.skills}
                                onChange={handleEdit('skills')}
                                placeholder="List your key skills..."
                            />
                        ) : (
                            data.skills.split('\n').map((skill, index) => (
                                <div key={index} className="skill-item">
                                    <span className="skill-name">{skill}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="cv-main">
                <div className="education-section">
                    <h3 className="section-title">
                        <i className="fas fa-graduation-cap"></i>
                        Education
                    </h3>
                    <div className="timeline">
                        {isEditing ? (
                            <textarea
                                className="editable-textarea"
                                value={data.education}
                                onChange={handleEdit('education')}
                                placeholder="Enter your education history..."
                            />
                        ) : (
                            data.education.split('\n\n').map((edu, index) => (
                                <div key={index} className="timeline-item">
                                    <div className="timeline-content">
                                        <p>{edu}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="experience-section">
                    <h3 className="section-title">
                        <i className="fas fa-briefcase"></i>
                        Professional Experience
                    </h3>
                    <div className="timeline">
                        {isEditing ? (
                            <textarea
                                className="editable-textarea"
                                value={data.experience}
                                onChange={handleEdit('experience')}
                                placeholder="Enter your work experience..."
                            />
                        ) : (
                            data.experience.split('\n\n').map((exp, index) => (
                                <div key={index} className="timeline-item">
                                    <div className="timeline-content">
                                        <p>{exp}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="additional-info-section">
                    <h3 className="section-title">
                        <i className="fas fa-info-circle"></i>
                        Additional Information
                    </h3>
                    <div className="additional-info">
                        {isEditing ? (
                            <textarea
                                className="editable-textarea"
                                value={data.additionalInfo}
                                onChange={handleEdit('additionalInfo')}
                                placeholder="Add any additional information..."
                            />
                        ) : (
                            <p>{data.additionalInfo}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CVTemplate; 