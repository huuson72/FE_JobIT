import React from 'react';
import './CVTemplate.css';
import { UserOutlined, MailOutlined, PhoneOutlined, HomeOutlined, BookOutlined, TrophyOutlined, ToolOutlined, FileTextOutlined } from '@ant-design/icons';

interface CVTemplateProps {
    data: {
        title: string;
        fullName: string;
        email: string;
        phone: string;
        address: string;
        education: string;
        experience: string;
        skills: string;
        additionalInfo: string;
    };
    isEditing: boolean;
    onEdit?: (field: string, value: string) => void;
    template?: string;
}

const CVTemplate: React.FC<CVTemplateProps> = ({ data, isEditing, onEdit, template = 'modern' }) => {
    const handleEdit = (field: string, value: string) => {
        if (onEdit && isEditing) {
            onEdit(field, value);
        }
    };

    const renderSkills = () => {
        if (!data.skills) return null;
        return data.skills.split('\n').filter(skill => skill.trim().length > 0).map((skill, index) => (
            <div key={index} className="skill-item">
                <div className="skill-name">{skill}</div>
            </div>
        ));
    };

    const renderEducation = () => {
        if (!data.education) return null;
        const educationItems = data.education
            .split('\n\n\n')
            .filter(item => item.trim().length > 0)
            .map((item, index) => (
                <div key={index} className="timeline-item">
                    <div className="timeline-content">
                        <p>{item}</p>
                    </div>
                </div>
            ));

        return <div className="timeline">{educationItems}</div>;
    };

    const renderExperience = () => {
        if (!data.experience) return null;
        const experienceItems = data.experience
            .split('\n\n\n')
            .filter(item => item.trim().length > 0)
            .map((item, index) => (
                <div key={index} className="timeline-item">
                    <div className="timeline-content">
                        <p>{item}</p>
                    </div>
                </div>
            ));

        return <div className="timeline">{experienceItems}</div>;
    };

    // Modern Template
    if (template === 'modern') {
        return (
            <div className="cv-template modern">
                <div className="cv-sidebar">
                    <div className="profile-section">
                        <div className="profile-image">
                            <UserOutlined style={{ fontSize: '80px', color: '#3498db' }} />
                        </div>
                        <div className="profile-name">
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={data.fullName}
                                    onChange={e => handleEdit('fullName', e.target.value)}
                                    className="editable-name"
                                    placeholder="Họ và Tên"
                                />
                            ) : (
                                <h2>{data.fullName || "Họ và Tên"}</h2>
                            )}
                        </div>
                        <div className="profile-title">
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={e => handleEdit('title', e.target.value)}
                                    className="editable-title"
                                    placeholder="Tiêu đề CV"
                                />
                            ) : (
                                <span>{data.title || "Tiêu đề CV"}</span>
                            )}
                        </div>
                    </div>

                    <div className="contact-section">
                        <h3 className="sidebar-heading">Thông tin liên hệ</h3>
                        <div className="contact-item">
                            <MailOutlined />
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={data.email}
                                    onChange={e => handleEdit('email', e.target.value)}
                                    className="editable-field"
                                    placeholder="Email"
                                />
                            ) : (
                                <span>{data.email || "Email"}</span>
                            )}
                        </div>
                        <div className="contact-item">
                            <PhoneOutlined />
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={data.phone}
                                    onChange={e => handleEdit('phone', e.target.value)}
                                    className="editable-field"
                                    placeholder="Số điện thoại"
                                />
                            ) : (
                                <span>{data.phone || "Số điện thoại"}</span>
                            )}
                        </div>
                        <div className="contact-item">
                            <HomeOutlined />
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={data.address}
                                    onChange={e => handleEdit('address', e.target.value)}
                                    className="editable-field"
                                    placeholder="Địa chỉ"
                                />
                            ) : (
                                <span>{data.address || "Địa chỉ"}</span>
                            )}
                        </div>
                    </div>

                    <div className="skills-section">
                        <h3 className="sidebar-heading">Kỹ năng</h3>
                        {isEditing ? (
                            <textarea
                                value={data.skills}
                                onChange={e => handleEdit('skills', e.target.value)}
                                className="editable-field"
                                placeholder="Kỹ năng"
                                style={{ color: 'white', minHeight: '150px' }}
                            />
                        ) : (
                            <div className="skills-list">
                                {renderSkills()}
                            </div>
                        )}
                    </div>
                </div>

                <div className="cv-main">
                    <div className="education-section">
                        <h3 className="section-title">
                            <BookOutlined /> Học vấn
                        </h3>
                        {isEditing ? (
                            <textarea
                                value={data.education}
                                onChange={e => handleEdit('education', e.target.value)}
                                className="editable-textarea"
                                placeholder="Học vấn"
                            />
                        ) : (
                            renderEducation()
                        )}
                    </div>

                    <div className="experience-section">
                        <h3 className="section-title">
                            <TrophyOutlined /> Kinh nghiệm làm việc
                        </h3>
                        {isEditing ? (
                            <textarea
                                value={data.experience}
                                onChange={e => handleEdit('experience', e.target.value)}
                                className="editable-textarea"
                                placeholder="Kinh nghiệm làm việc"
                            />
                        ) : (
                            renderExperience()
                        )}
                    </div>

                    <div className="additional-section">
                        <h3 className="section-title">
                            <FileTextOutlined /> Thông tin khác
                        </h3>
                        {isEditing ? (
                            <textarea
                                value={data.additionalInfo}
                                onChange={e => handleEdit('additionalInfo', e.target.value)}
                                className="editable-textarea"
                                placeholder="Thông tin khác"
                            />
                        ) : (
                            <div className="additional-info">
                                <p>{data.additionalInfo || "Chưa có thông tin thêm"}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Professional Template
    if (template === 'professional') {
        return (
            <div className="cv-template professional">
                <div className="cv-header">
                    {isEditing ? (
                        <input
                            type="text"
                            value={data.fullName}
                            onChange={e => handleEdit('fullName', e.target.value)}
                            className="editable-name"
                            placeholder="Họ và Tên"
                        />
                    ) : (
                        <h1>{data.fullName || "Họ và Tên"}</h1>
                    )}
                    {isEditing ? (
                        <input
                            type="text"
                            value={data.title}
                            onChange={e => handleEdit('title', e.target.value)}
                            className="editable-title"
                            placeholder="Tiêu đề CV"
                        />
                    ) : (
                        <p>{data.title || "Tiêu đề CV"}</p>
                    )}
                </div>

                <div className="cv-contact-bar">
                    <div className="contact-item">
                        <MailOutlined />
                        {isEditing ? (
                            <input
                                type="text"
                                value={data.email}
                                onChange={e => handleEdit('email', e.target.value)}
                                className="editable-field"
                                placeholder="Email"
                                style={{ color: '#555' }}
                            />
                        ) : (
                            <span>{data.email || "Email"}</span>
                        )}
                    </div>
                    <div className="contact-item">
                        <PhoneOutlined />
                        {isEditing ? (
                            <input
                                type="text"
                                value={data.phone}
                                onChange={e => handleEdit('phone', e.target.value)}
                                className="editable-field"
                                placeholder="Số điện thoại"
                                style={{ color: '#555' }}
                            />
                        ) : (
                            <span>{data.phone || "Số điện thoại"}</span>
                        )}
                    </div>
                    <div className="contact-item">
                        <HomeOutlined />
                        {isEditing ? (
                            <input
                                type="text"
                                value={data.address}
                                onChange={e => handleEdit('address', e.target.value)}
                                className="editable-field"
                                placeholder="Địa chỉ"
                                style={{ color: '#555' }}
                            />
                        ) : (
                            <span>{data.address || "Địa chỉ"}</span>
                        )}
                    </div>
                </div>

                <div className="cv-body">
                    <div className="cv-main">
                        <div className="section">
                            <h3 className="section-title">
                                <BookOutlined /> Học vấn
                            </h3>
                            {isEditing ? (
                                <textarea
                                    value={data.education}
                                    onChange={e => handleEdit('education', e.target.value)}
                                    className="editable-textarea"
                                    placeholder="Học vấn"
                                />
                            ) : (
                                <div className="timeline">
                                    {renderEducation()}
                                </div>
                            )}
                        </div>

                        <div className="section">
                            <h3 className="section-title">
                                <TrophyOutlined /> Kinh nghiệm làm việc
                            </h3>
                            {isEditing ? (
                                <textarea
                                    value={data.experience}
                                    onChange={e => handleEdit('experience', e.target.value)}
                                    className="editable-textarea"
                                    placeholder="Kinh nghiệm làm việc"
                                />
                            ) : (
                                <div className="timeline">
                                    {renderExperience()}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="cv-sidebar">
                        <div className="section">
                            <h3 className="section-title">
                                <ToolOutlined /> Kỹ năng
                            </h3>
                            {isEditing ? (
                                <textarea
                                    value={data.skills}
                                    onChange={e => handleEdit('skills', e.target.value)}
                                    className="editable-textarea"
                                    placeholder="Kỹ năng"
                                />
                            ) : (
                                <div className="skills-list">
                                    {renderSkills()}
                                </div>
                            )}
                        </div>

                        <div className="section">
                            <h3 className="section-title">
                                <FileTextOutlined /> Thông tin khác
                            </h3>
                            {isEditing ? (
                                <textarea
                                    value={data.additionalInfo}
                                    onChange={e => handleEdit('additionalInfo', e.target.value)}
                                    className="editable-textarea"
                                    placeholder="Thông tin khác"
                                />
                            ) : (
                                <div className="additional-info">
                                    <p>{data.additionalInfo || "Chưa có thông tin thêm"}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Creative Template
    if (template === 'creative') {
        return (
            <div className="cv-template creative">
                <div className="cv-header">
                    {isEditing ? (
                        <input
                            type="text"
                            value={data.fullName}
                            onChange={e => handleEdit('fullName', e.target.value)}
                            className="editable-name"
                            placeholder="Họ và Tên"
                        />
                    ) : (
                        <h1>{data.fullName || "Họ và Tên"}</h1>
                    )}
                    {isEditing ? (
                        <input
                            type="text"
                            value={data.title}
                            onChange={e => handleEdit('title', e.target.value)}
                            className="editable-title"
                            placeholder="Tiêu đề CV"
                        />
                    ) : (
                        <p>{data.title || "Tiêu đề CV"}</p>
                    )}
                </div>

                <div className="cv-contact">
                    <div className="contact-item">
                        <MailOutlined />
                        {isEditing ? (
                            <input
                                type="text"
                                value={data.email}
                                onChange={e => handleEdit('email', e.target.value)}
                                className="editable-field"
                                placeholder="Email"
                                style={{ color: '#555' }}
                            />
                        ) : (
                            <span>{data.email || "Email"}</span>
                        )}
                    </div>
                    <div className="contact-item">
                        <PhoneOutlined />
                        {isEditing ? (
                            <input
                                type="text"
                                value={data.phone}
                                onChange={e => handleEdit('phone', e.target.value)}
                                className="editable-field"
                                placeholder="Số điện thoại"
                                style={{ color: '#555' }}
                            />
                        ) : (
                            <span>{data.phone || "Số điện thoại"}</span>
                        )}
                    </div>
                    <div className="contact-item">
                        <HomeOutlined />
                        {isEditing ? (
                            <input
                                type="text"
                                value={data.address}
                                onChange={e => handleEdit('address', e.target.value)}
                                className="editable-field"
                                placeholder="Địa chỉ"
                                style={{ color: '#555' }}
                            />
                        ) : (
                            <span>{data.address || "Địa chỉ"}</span>
                        )}
                    </div>
                </div>

                <div className="cv-body">
                    <div className="section">
                        <h3 className="section-title">
                            <BookOutlined /> Học vấn
                        </h3>
                        {isEditing ? (
                            <textarea
                                value={data.education}
                                onChange={e => handleEdit('education', e.target.value)}
                                className="editable-textarea"
                                placeholder="Học vấn"
                            />
                        ) : (
                            <div>
                                {renderEducation()}
                            </div>
                        )}
                    </div>

                    <div className="section">
                        <h3 className="section-title">
                            <TrophyOutlined /> Kinh nghiệm làm việc
                        </h3>
                        {isEditing ? (
                            <textarea
                                value={data.experience}
                                onChange={e => handleEdit('experience', e.target.value)}
                                className="editable-textarea"
                                placeholder="Kinh nghiệm làm việc"
                            />
                        ) : (
                            <div>
                                {renderExperience()}
                            </div>
                        )}
                    </div>

                    <div className="section">
                        <h3 className="section-title">
                            <ToolOutlined /> Kỹ năng
                        </h3>
                        {isEditing ? (
                            <textarea
                                value={data.skills}
                                onChange={e => handleEdit('skills', e.target.value)}
                                className="editable-textarea"
                                placeholder="Kỹ năng"
                            />
                        ) : (
                            <div className="skills-list">
                                {renderSkills()}
                            </div>
                        )}
                    </div>

                    <div className="section">
                        <h3 className="section-title">
                            <FileTextOutlined /> Thông tin khác
                        </h3>
                        {isEditing ? (
                            <textarea
                                value={data.additionalInfo}
                                onChange={e => handleEdit('additionalInfo', e.target.value)}
                                className="editable-textarea"
                                placeholder="Thông tin khác"
                            />
                        ) : (
                            <div className="additional-info">
                                <p>{data.additionalInfo || "Chưa có thông tin thêm"}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Simple Template
    if (template === 'simple') {
        return (
            <div className="cv-template simple">
                <div className="cv-header">
                    {isEditing ? (
                        <input
                            type="text"
                            value={data.fullName}
                            onChange={e => handleEdit('fullName', e.target.value)}
                            className="editable-name"
                            placeholder="Họ và Tên"
                            style={{ color: '#333' }}
                        />
                    ) : (
                        <h1>{data.fullName || "Họ và Tên"}</h1>
                    )}
                    {isEditing ? (
                        <input
                            type="text"
                            value={data.title}
                            onChange={e => handleEdit('title', e.target.value)}
                            className="editable-title"
                            placeholder="Tiêu đề CV"
                            style={{ color: '#757575' }}
                        />
                    ) : (
                        <p>{data.title || "Tiêu đề CV"}</p>
                    )}

                    <div className="cv-contact">
                        <div className="contact-item">
                            <MailOutlined />
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={data.email}
                                    onChange={e => handleEdit('email', e.target.value)}
                                    className="editable-field"
                                    placeholder="Email"
                                    style={{ color: '#555' }}
                                />
                            ) : (
                                <span>{data.email || "Email"}</span>
                            )}
                        </div>
                        <div className="contact-item">
                            <PhoneOutlined />
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={data.phone}
                                    onChange={e => handleEdit('phone', e.target.value)}
                                    className="editable-field"
                                    placeholder="Số điện thoại"
                                    style={{ color: '#555' }}
                                />
                            ) : (
                                <span>{data.phone || "Số điện thoại"}</span>
                            )}
                        </div>
                        <div className="contact-item">
                            <HomeOutlined />
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={data.address}
                                    onChange={e => handleEdit('address', e.target.value)}
                                    className="editable-field"
                                    placeholder="Địa chỉ"
                                    style={{ color: '#555' }}
                                />
                            ) : (
                                <span>{data.address || "Địa chỉ"}</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="cv-body">
                    <div className="left-column">
                        <div className="section">
                            <h3 className="section-title">Học vấn</h3>
                            {isEditing ? (
                                <textarea
                                    value={data.education}
                                    onChange={e => handleEdit('education', e.target.value)}
                                    className="editable-textarea"
                                    placeholder="Học vấn"
                                />
                            ) : (
                                <div>
                                    {renderEducation()}
                                </div>
                            )}
                        </div>

                        <div className="section">
                            <h3 className="section-title">Kỹ năng</h3>
                            {isEditing ? (
                                <textarea
                                    value={data.skills}
                                    onChange={e => handleEdit('skills', e.target.value)}
                                    className="editable-textarea"
                                    placeholder="Kỹ năng"
                                />
                            ) : (
                                <div className="skills-list">
                                    {renderSkills()}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="right-column">
                        <div className="section">
                            <h3 className="section-title">Kinh nghiệm làm việc</h3>
                            {isEditing ? (
                                <textarea
                                    value={data.experience}
                                    onChange={e => handleEdit('experience', e.target.value)}
                                    className="editable-textarea"
                                    placeholder="Kinh nghiệm làm việc"
                                />
                            ) : (
                                <div>
                                    {renderExperience()}
                                </div>
                            )}
                        </div>

                        <div className="section">
                            <h3 className="section-title">Thông tin khác</h3>
                            {isEditing ? (
                                <textarea
                                    value={data.additionalInfo}
                                    onChange={e => handleEdit('additionalInfo', e.target.value)}
                                    className="editable-textarea"
                                    placeholder="Thông tin khác"
                                />
                            ) : (
                                <div className="additional-info">
                                    <p>{data.additionalInfo || "Chưa có thông tin thêm"}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Fallback to default template
    return (
        <div className="cv-template default">
            <h1>{data.fullName}</h1>
            <p>{data.title}</p>
            <p>{data.email}</p>
            <p>{data.phone}</p>
            <p>{data.address}</p>
            <div>{data.education}</div>
            <div>{data.experience}</div>
            <div>{data.skills}</div>
            <div>{data.additionalInfo}</div>
        </div>
    );
};

export default CVTemplate; 