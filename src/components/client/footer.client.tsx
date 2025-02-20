import { CSSProperties } from 'react';

const Footer = () => {
    const styles: { [key: string]: CSSProperties } = {
        container: {
            background: "linear-gradient(to right, #000000, #8B0000)",
            color: "#fff",
            padding: "15px 30px",
            fontFamily: "Arial, sans-serif",
            fontSize: "14px",
            marginTop: "30px",
        },
        top: {
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            borderBottom: "1px solid #444",
            paddingBottom: "10px",
            marginBottom: "10px",
        },
        logoSection: {
            flex: "1 1 20%",
            marginBottom: "10px",
        },
        logo: {
            color: "#e50914",
            fontSize: "20px",
            fontWeight: "bold",
        },
        description: {
            margin: "5px 0",
            fontSize: "12px",
            color: "#ddd",
        },
        socialIcons: {
            display: "flex",
            gap: "8px",
            marginTop: "5px",
        },
        icon: {
            color: "#fff",
            fontSize: "18px",
            textDecoration: "none",
        },
        linksContainer: {
            flex: "1 1 75%",
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
        },
        linkGroup: {
            marginBottom: "10px",
        },
        groupTitle: {
            marginBottom: "5px",
            fontSize: "14px",
            fontWeight: "bold",
            color: "#fff",
        },
        link: {
            textDecoration: "none",
            color: "#ccc",
            fontSize: "12px",
            marginBottom: "5px",
            display: "block",
        },
        contactInfo: {
            fontSize: "12px",
            color: "#ccc",
            marginBottom: "3px",
        },
        bottom: {
            textAlign: "center",
            padding: "5px 0",
            fontSize: "12px",
            color: "#ccc",
        },
    };

    return (
        <footer style={styles.container}>
            <div style={styles.top}>
                <div style={styles.logoSection}>
                    <h2 style={styles.logo}>HSJob</h2>
                    <p style={styles.description}>Ít nhưng mà chất</p>
                    <div style={styles.socialIcons}>
                        <a href="#" style={styles.icon}>
                            <i className="fa fa-linkedin"></i>
                        </a>
                        <a href="#" style={styles.icon}>
                            <i className="fa fa-facebook"></i>
                        </a>
                        <a href="#" style={styles.icon}>
                            <i className="fa fa-youtube"></i>
                        </a>
                    </div>
                </div>
                <div style={styles.linksContainer}>
                    <div style={styles.linkGroup}>
                        <h3 style={styles.groupTitle}>About Us</h3>
                        <a href="#" style={styles.link}>Home</a>
                        <a href="#" style={styles.link}>About Us</a>
                        <a href="#" style={styles.link}>AI Match Service</a>
                        <a href="#" style={styles.link}>Contact Us</a>
                        <a href="#" style={styles.link}>All Jobs</a>
                        <a href="#" style={styles.link}>FAQ</a>
                    </div>
                    <div style={styles.linkGroup}>
                        <h3 style={styles.groupTitle}>Campaign</h3>
                        <a href="#" style={styles.link}>IT Story</a>
                        <a href="#" style={styles.link}>Writing Contest</a>
                        <a href="#" style={styles.link}>Featured IT Jobs</a>
                        <a href="#" style={styles.link}>Annual Survey</a>
                    </div>
                    <div style={styles.linkGroup}>
                        <h3 style={styles.groupTitle}>Terms & Conditions</h3>
                        <a href="#" style={styles.link}>Privacy Policy</a>
                        <a href="#" style={styles.link}>Operating Regulation</a>
                        <a href="#" style={styles.link}>Complaint Handling</a>
                        <a href="#" style={styles.link}>Terms & Conditions</a>
                        <a href="#" style={styles.link}>Press</a>
                    </div>
                    <div style={styles.linkGroup}>
                        <h3 style={styles.groupTitle}>Contact</h3>
                        <p style={styles.contactInfo}>Ho Chi Minh: (+84) 977 460 519</p>
                        <p style={styles.contactInfo}>Ha Noi: (+84) 983 131 351</p>
                        <p style={styles.contactInfo}>
                            Email: <a href="mailto:love@itviec.com" style={styles.link}>love@itviec.com</a>
                        </p>
                        <a href="#" style={styles.link}>Submit contact information</a>
                    </div>
                </div>
            </div>
            <div style={styles.bottom}>
                Copyright © IT VIEC JSC | Tax code: 0312192258
            </div>
        </footer>
    );
};

export default Footer;
