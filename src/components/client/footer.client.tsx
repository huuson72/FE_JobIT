import { CSSProperties } from 'react';
import './Footer.css';

const Footer = () => {
    const styles: { [key: string]: CSSProperties } = {
        container: {
            background: "linear-gradient(to right, #2c3e50, #1a2530)",
            color: "#ecf0f1",
            padding: "60px 0 20px",
            fontFamily: "'Roboto', sans-serif",
            marginTop: "70px",
            boxShadow: "0 -5px 15px rgba(0,0,0,0.1)"
        },
        content: {
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0 30px",
        },
        top: {
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            marginBottom: "40px",
            gap: "40px"
        },
        logoSection: {
            flex: "1 1 320px",
            marginBottom: "20px",
        },
        logo: {
            color: "#ecf0f1",
            fontSize: "32px",
            fontWeight: "bold",
            marginBottom: "20px",
            letterSpacing: "1px",
            display: "flex",
            alignItems: "center",
            gap: "10px"
        },
        logoIcon: {
            color: "#3498db"
        },
        description: {
            color: "#bdc3c7",
            fontSize: "15px",
            lineHeight: "1.7",
            marginBottom: "25px",
            maxWidth: "90%"
        },
        socialIcons: {
            display: "flex",
            gap: "18px",
        },
        icon: {
            color: "#ecf0f1",
            fontSize: "22px",
            textDecoration: "none",
            transition: "color 0.3s, transform 0.2s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.1)"
        },
        linksContainer: {
            display: "flex",
            justifyContent: "flex-end",
            flexWrap: "wrap",
            gap: "60px",
            flex: "2 1 600px"
        },
        linkGroup: {
            flex: "1 1 180px",
            maxWidth: "220px"
        },
        groupTitle: {
            color: "#ecf0f1",
            fontSize: "18px",
            fontWeight: "bold",
            marginBottom: "20px",
            position: "relative",
            paddingBottom: "12px"
        },
        link: {
            color: "#bdc3c7",
            textDecoration: "none",
            fontSize: "15px",
            display: "block",
            marginBottom: "12px",
            transition: "color 0.3s, transform 0.2s",
            paddingLeft: "5px"
        },
        bottom: {
            textAlign: "center",
            padding: "25px 0 0",
            borderTop: "1px solid rgba(255,255,255,0.1)",
            marginTop: "30px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
        },
        copyright: {
            color: "#bdc3c7",
            fontSize: "14px",
            marginTop: "10px"
        },
        contactInfo: {
            color: "#bdc3c7",
            fontSize: "15px",
            marginBottom: "10px",
            display: "flex",
            alignItems: "center",
            gap: "10px"
        },
        contactIcon: {
            color: "#3498db",
            fontSize: "16px",
            marginRight: "5px"
        }
    };

    return (
        <footer style={styles.container}>
            <div style={styles.content}>
                <div style={styles.top}>
                    <div style={styles.logoSection}>
                        <h2 style={styles.logo}>
                            <span style={styles.logoIcon}><i className="fa fa-briefcase"></i></span>
                            HSJob
                        </h2>
                        <p style={styles.description}>
                            Nền tảng kết nối việc làm thông minh, giúp doanh nghiệp tìm được nhân tài phù hợp và ứng viên tìm được công việc mơ ước.
                        </p>
                        <div style={styles.socialIcons}>
                            <a href="#" style={styles.icon} className="footer-icon" aria-label="LinkedIn">
                                <i className="fa fa-linkedin"></i>
                            </a>
                            <a href="#" style={styles.icon} className="footer-icon" aria-label="Facebook">
                                <i className="fa fa-facebook"></i>
                            </a>
                            <a href="#" style={styles.icon} className="footer-icon" aria-label="YouTube">
                                <i className="fa fa-youtube"></i>
                            </a>
                            <a href="#" style={styles.icon} className="footer-icon" aria-label="Twitter">
                                <i className="fa fa-twitter"></i>
                            </a>
                        </div>
                    </div>
                    <div style={styles.linksContainer}>
                        <div style={styles.linkGroup}>
                            <h3 style={styles.groupTitle} className="group-title">Về chúng tôi</h3>
                            <a href="#" style={styles.link} className="footer-link">Trang chủ</a>
                            <a href="#" style={styles.link} className="footer-link">Giới thiệu</a>
                            <a href="#" style={styles.link} className="footer-link">Dịch vụ AI Match</a>
                            <a href="#" style={styles.link} className="footer-link">Liên hệ</a>
                        </div>
                        <div style={styles.linkGroup}>
                            <h3 style={styles.groupTitle} className="group-title">Hỗ trợ</h3>
                            <a href="#" style={styles.link} className="footer-link">FAQ</a>
                            <a href="#" style={styles.link} className="footer-link">Chính sách bảo mật</a>
                            <a href="#" style={styles.link} className="footer-link">Điều khoản sử dụng</a>
                            <a href="#" style={styles.link} className="footer-link">Quy định hoạt động</a>
                        </div>
                        <div style={styles.linkGroup}>
                            <h3 style={styles.groupTitle} className="group-title">Liên hệ</h3>
                            <p style={styles.contactInfo}>
                                <span style={styles.contactIcon}><i className="fa fa-phone"></i></span>
                                (+84) 977 460 519
                            </p>
                            <p style={styles.contactInfo}>
                                <span style={styles.contactIcon}><i className="fa fa-envelope"></i></span>
                                support@hsjob.com
                            </p>
                            <p style={styles.contactInfo}>
                                <span style={styles.contactIcon}><i className="fa fa-map-marker"></i></span>
                                TP.Hồ Chí Minh, Việt Nam
                            </p>
                        </div>
                    </div>
                </div>
                <div style={styles.bottom}>
                    <p style={styles.copyright}>
                        Copyright © {new Date().getFullYear()} HSJob. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
