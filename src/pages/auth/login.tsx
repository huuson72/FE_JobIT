import { Button, Divider, Form, Input, message, notification } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { callLogin } from 'config/api';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUserLoginInfo } from '@/redux/slice/accountSlide';
import styles from 'styles/auth.module.scss';
import { useAppSelector } from '@/redux/hooks';
import { UserOutlined, LockOutlined, MailOutlined, TeamOutlined, RocketOutlined, CheckCircleOutlined, LinkedinOutlined, GithubOutlined, GoogleOutlined, BankOutlined, BuildOutlined, GlobalOutlined, BulbOutlined } from '@ant-design/icons';

const LoginPage = () => {
    const navigate = useNavigate();
    const [isSubmit, setIsSubmit] = useState(false);
    const dispatch = useDispatch();
    const isAuthenticated = useAppSelector(state => state.account.isAuthenticated);

    let location = useLocation();
    let params = new URLSearchParams(location.search);
    const callback = params?.get("callback");

    useEffect(() => {
        if (isAuthenticated) {
            window.location.href = '/';
        }
    }, [isAuthenticated]);

    const onFinish = async (values: any) => {
        const { username, password } = values;
        setIsSubmit(true);
        const res = await callLogin(username, password);
        setIsSubmit(false);

        if (res?.data) {
            localStorage.setItem('access_token', res.data.access_token);
            dispatch(setUserLoginInfo(res.data.user));
            message.success('Đăng nhập tài khoản thành công!');
            window.location.href = callback ? callback : '/';
        } else {
            notification.error({
                message: "Có lỗi xảy ra",
                description: res.message && Array.isArray(res.message) ? res.message[0] : res.message,
                duration: 5
            });
        }
    };

    return (
        <div className={styles["login-page"]}>
            <div className={styles["login-container"]}>
                {/* Banner Section */}
                <div className={styles["banner-section"]}>
                    <div className={styles["banner-content"]}>
                        <div className={styles["banner-logo-container"]}>
                            <div className={styles["banner-logo"]}>
                                <BankOutlined />
                            </div>
                            <div className={styles["banner-logo-text"]}>
                                <span className={styles["logo-title"]}>HSJob</span>
                                <span className={styles["logo-tagline"]}>Find Your Dream Job</span>
                            </div>
                        </div>

                        <h1 className={styles["banner-title"]}>
                            Khám phá cơ hội việc làm
                            <span className={styles["highlight"]}> không giới hạn</span>
                        </h1>
                        <p className={styles["banner-subtitle"]}>
                            Kết nối với hàng nghìn doanh nghiệp hàng đầu
                        </p>

                        <div className={styles["features-list"]}>
                            <div className={styles["feature-item"]}>
                                <BuildOutlined style={{ marginRight: '8px' }} />
                                <span>Hàng nghìn việc làm chất lượng</span>
                            </div>
                            <div className={styles["feature-item"]}>
                                <GlobalOutlined style={{ marginRight: '8px' }} />
                                <span>Kết nối toàn cầu</span>
                            </div>
                            <div className={styles["feature-item"]}>
                                <BulbOutlined style={{ marginRight: '8px' }} />
                                <span>Đề xuất việc làm thông minh</span>
                            </div>
                            <div className={styles["feature-item"]}>
                                <TeamOutlined style={{ marginRight: '8px' }} />
                                <span>Cộng đồng chuyên nghiệp</span>
                            </div>
                        </div>


                        <div className={styles["banner-footer"]}>
                            <RocketOutlined />
                            <span>Bắt đầu hành trình sự nghiệp của bạn ngay hôm nay</span>
                        </div>

                        <div className={styles["social-links"]}>
                            <a href="#" className={styles["social-link"]}>
                                <LinkedinOutlined style={{ color: "#000000", fontSize: "24px" }} />
                            </a>
                            <a href="#" className={styles["social-link"]}>
                                <GithubOutlined style={{ color: "#000000", fontSize: "24px" }} />
                            </a>
                            <a href="#" className={styles["social-link"]}>
                                <GoogleOutlined style={{ color: "#000000", fontSize: "24px" }} />
                            </a>
                        </div>

                    </div>
                </div>

                {/* Login Form Section */}
                <div className={styles["form-section"]}>
                    <div className={styles["form-container"]}>
                        <div className={styles["form-header"]}>
                            <h2>Đăng nhập</h2>
                            <p>Đăng nhập để tiếp tục với tài khoản của bạn</p>
                        </div>

                        <Form
                            name="login-form"
                            onFinish={onFinish}
                            autoComplete="off"
                            layout="vertical"
                        >
                            <Form.Item
                                name="username"
                                rules={[{ required: true, message: 'Email không được để trống!' }]}
                            >
                                <Input
                                    prefix={<UserOutlined />}
                                    placeholder="Nhập email của bạn"
                                    size="large"
                                />
                            </Form.Item>

                            <Form.Item
                                name="password"
                                rules={[{ required: true, message: 'Mật khẩu không được để trống!' }]}
                            >
                                <Input.Password
                                    prefix={<LockOutlined />}
                                    placeholder="Nhập mật khẩu"
                                    size="large"
                                />
                            </Form.Item>

                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={isSubmit}
                                    size="large"
                                    block
                                    className={styles.loginButton}
                                >
                                    Đăng nhập
                                </Button>
                            </Form.Item>

                            <div className={styles.dividerContainer}>
                                <Divider>Hoặc</Divider>
                            </div>

                            <div className={styles["social-login"]}>
                                <Button className={styles["social-button"]} icon={<GoogleOutlined />}>
                                    Đăng nhập với Google
                                </Button>
                                <Button className={styles["social-button"]} icon={<LinkedinOutlined />}>
                                    Đăng nhập với LinkedIn
                                </Button>
                            </div>

                            <div className={styles.registerContainer}>
                                <p className={styles.registerText}>
                                    Chưa có tài khoản?
                                    <Link to='/register' className={styles.registerLink}>
                                        Đăng Ký
                                    </Link>
                                </p>
                            </div>
                        </Form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
