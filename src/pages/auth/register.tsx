import { Button, Divider, Form, Input, Select, message, notification } from 'antd';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { callRegister } from 'config/api';
import styles from 'styles/auth.module.scss';
import { IUser } from '@/types/backend';
import {
    UserOutlined,
    LockOutlined,
    MailOutlined,
    TeamOutlined,
    RocketOutlined,
    LinkedinOutlined,
    GithubOutlined,
    GoogleOutlined,
    BankOutlined,
    BuildOutlined,
    GlobalOutlined,
    BulbOutlined,
    IdcardOutlined,
    EnvironmentOutlined,
    ManOutlined,
    WomanOutlined,
    UserAddOutlined
} from '@ant-design/icons';

const { Option } = Select;

const RegisterPage = () => {
    const navigate = useNavigate();
    const [isSubmit, setIsSubmit] = useState(false);

    const onFinish = async (values: IUser) => {
        const { name, email, password, age, gender, address } = values;
        setIsSubmit(true);
        try {
            const res = await callRegister(name, email, password as string, +age, gender, address);
            if (res?.data?.id) {
                message.success('Đăng ký tài khoản thành công!');
                navigate('/login');
            } else {
                notification.error({
                    message: "Có lỗi xảy ra",
                    description: res.message && Array.isArray(res.message) ? res.message[0] : res.message,
                    duration: 5
                });
            }
        } catch (error) {
            notification.error({
                message: "Có lỗi xảy ra",
                description: "Vui lòng thử lại sau",
                duration: 5
            });
        } finally {
            setIsSubmit(false);
        }
    };

    return (
        <div className={styles["register-page"]}>
            <div className={styles["register-container"]}>
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
                            Bắt đầu hành trình sự nghiệp
                            <span className={styles["highlight"]}> cùng chúng tôi</span>
                        </h1>
                        <p className={styles["banner-subtitle"]}>
                            Tạo tài khoản để khám phá vô vàn cơ hội việc làm
                        </p>

                        <div className={styles["features-list"]}>
                            <div className={styles["feature-item"]}>
                                <BuildOutlined />
                                <span>Hàng nghìn việc làm chất lượng</span>
                            </div>
                            <div className={styles["feature-item"]}>
                                <GlobalOutlined />
                                <span>Kết nối toàn cầu</span>
                            </div>
                            <div className={styles["feature-item"]}>
                                <BulbOutlined />
                                <span>Đề xuất việc làm thông minh</span>
                            </div>
                            <div className={styles["feature-item"]}>
                                <TeamOutlined />
                                <span>Cộng đồng chuyên nghiệp</span>
                            </div>
                        </div>

                        <div className={styles["banner-footer"]}>
                            <RocketOutlined />
                            <span>Tham gia cộng đồng việc làm hàng đầu</span>
                        </div>

                        <div className={styles["social-links"]}>
                            <a href="#" className={styles["social-link"]}>
                                <LinkedinOutlined />
                            </a>
                            <a href="#" className={styles["social-link"]}>
                                <GithubOutlined />
                            </a>
                            <a href="#" className={styles["social-link"]}>
                                <GoogleOutlined />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Register Form Section */}
                <div className={styles["form-section"]}>
                    <div className={styles["form-container"]}>
                        <div className={styles["form-header"]}>
                            <div className={styles["form-icon"]}>
                                <UserAddOutlined />
                            </div>
                            <h2>Đăng ký tài khoản</h2>
                            <p>Tạo tài khoản mới để bắt đầu</p>
                        </div>

                        <Form<IUser>
                            name="register-form"
                            onFinish={onFinish}
                            autoComplete="off"
                            layout="vertical"
                        >
                            <Form.Item
                                name="name"
                                rules={[{ required: true, message: 'Họ tên không được để trống!' }]}
                            >
                                <Input
                                    prefix={<UserOutlined />}
                                    placeholder="Nhập họ tên của bạn"
                                    size="large"
                                />
                            </Form.Item>

                            <Form.Item
                                name="email"
                                rules={[
                                    { required: true, message: 'Email không được để trống!' },
                                    { type: 'email', message: 'Email không hợp lệ!' }
                                ]}
                            >
                                <Input
                                    prefix={<MailOutlined />}
                                    type="email"
                                    placeholder="Nhập email của bạn"
                                    size="large"
                                />
                            </Form.Item>

                            <Form.Item
                                name="password"
                                rules={[
                                    { required: true, message: 'Mật khẩu không được để trống!' },
                                    { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
                                ]}
                            >
                                <Input.Password
                                    prefix={<LockOutlined />}
                                    placeholder="Nhập mật khẩu"
                                    size="large"
                                />
                            </Form.Item>

                            <Form.Item
                                name="confirmPassword"
                                dependencies={['password']}
                                rules={[
                                    { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue('password') === value) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                                        },
                                    }),
                                ]}
                            >
                                <Input.Password
                                    prefix={<LockOutlined />}
                                    placeholder="Xác nhận mật khẩu"
                                    size="large"
                                />
                            </Form.Item>

                            <div className={styles["form-row"]}>
                                <Form.Item
                                    name="age"
                                    rules={[{ required: true, message: 'Tuổi không được để trống!' }]}
                                    className={styles["form-item-half"]}
                                >
                                    <Input
                                        prefix={<IdcardOutlined />}
                                        type="number"
                                        placeholder="Tuổi"
                                        size="large"
                                    />
                                </Form.Item>

                                <Form.Item
                                    name="gender"
                                    rules={[{ required: true, message: 'Giới tính không được để trống!' }]}
                                    className={styles["form-item-half"]}
                                >
                                    <Select
                                        placeholder="Giới tính"
                                        size="large"
                                        style={{ width: '100%' }}
                                        suffixIcon={null}
                                    >
                                        <Option value="MALE">
                                            <ManOutlined /> Nam
                                        </Option>
                                        <Option value="FEMALE">
                                            <WomanOutlined /> Nữ
                                        </Option>
                                        <Option value="OTHER">
                                            <UserOutlined /> Khác
                                        </Option>
                                    </Select>
                                </Form.Item>
                            </div>

                            <Form.Item
                                name="address"
                                rules={[{ required: true, message: 'Địa chỉ không được để trống!' }]}
                            >
                                <Input
                                    prefix={<EnvironmentOutlined />}
                                    placeholder="Nhập địa chỉ của bạn"
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
                                    {isSubmit ? 'Đang xử lý...' : 'Đăng ký tài khoản'}
                                </Button>
                            </Form.Item>

                            <div className={styles.registerContainer}>
                                <p className={styles.registerText}>
                                    Đã có tài khoản?
                                    <Link to='/login' className={styles.registerLink}>
                                        Đăng nhập
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

export default RegisterPage;
