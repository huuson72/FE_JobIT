import { Button, Divider, Form, Input, message, notification } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { callLogin } from 'config/api';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUserLoginInfo } from '@/redux/slice/accountSlide';
import styles from 'styles/auth.module.scss';
import { useAppSelector } from '@/redux/hooks';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

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
            <main className={styles.main}>
                <div className={styles.container}>
                    <section className={styles.wrapper}>
                        <div className={styles.heading}>
                            <h2
                                style={{ textAlign: "center", width: "100%", fontSize: "27px", fontWeight: "bold", marginBottom: "10px" }}
                            >
                                Đăng Nhập
                            </h2>

                            <Divider />
                        </div>
                        <Form name="login-form" onFinish={onFinish} autoComplete="off">
                            <Form.Item
                                labelCol={{ span: 24 }}
                                label={<span style={{ fontSize: "18px", fontWeight: "bold" }}>Email</span>}
                                name="username"
                                rules={[{ required: true, message: 'Email không được để trống!' }]}
                            >
                                <Input
                                    prefix={<UserOutlined />}
                                    placeholder="Nhập email của bạn"
                                    style={{ fontSize: "16px", padding: "12px", height: "50px" }}
                                />
                            </Form.Item>

                            <Form.Item
                                labelCol={{ span: 24 }}
                                label={<span style={{ fontSize: "18px", fontWeight: "bold" }}>Mật khẩu</span>}
                                name="password"
                                rules={[{ required: true, message: 'Mật khẩu không được để trống!' }]}
                            >
                                <Input.Password
                                    prefix={<LockOutlined />}
                                    placeholder="Nhập mật khẩu"
                                    style={{ fontSize: "16px", padding: "12px", height: "50px" }}
                                />
                            </Form.Item>

                            {/* Căn giữa nút đăng nhập và dòng chưa có tài khoản */}
                            <Form.Item>
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "10px" }}>
                                    <Button type="primary" htmlType="submit" loading={isSubmit} style={{ fontSize: "18px", height: "45px", width: "100%" }}>
                                        Đăng nhập
                                    </Button>
                                    <Divider style={{ width: "100%" }}>Hoặc</Divider>
                                    <p style={{ fontSize: "16px" }}>
                                        Chưa có tài khoản?
                                        <Link to='/register' style={{ color: "#1890ff", fontWeight: "bold", marginLeft: "5px", textDecoration: "none" }}>
                                            Đăng Ký
                                        </Link>
                                    </p>
                                </div>
                            </Form.Item>
                        </Form>

                    </section>
                </div>
            </main>
        </div>
    );
};

export default LoginPage;
