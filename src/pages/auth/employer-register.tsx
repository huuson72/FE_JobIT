import { Button, Divider, Form, Input, Select, Upload, message, notification } from 'antd';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { callEmployerRegister, callUploadSingleFile } from '@/config/api';
import styles from '@/styles/auth.module.scss';
import {
    UserOutlined,
    LockOutlined,
    MailOutlined,
    PhoneOutlined,
    UploadOutlined,
    LinkedinOutlined,
    GoogleOutlined,
    BankOutlined,
    BuildOutlined,
    IdcardOutlined,
    EnvironmentOutlined,
    ManOutlined,
    WomanOutlined,
    TeamOutlined,
    RocketOutlined,
    GlobalOutlined,
    BulbOutlined
} from '@ant-design/icons';
import type { UploadProps } from 'antd';
import TextArea from 'antd/es/input/TextArea';

const { Option } = Select;

interface IFormValues {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    age: number;
    gender: string;
    address: string;
    phone: string;
    companyName: string;
    companyAddress: string;
    companyDescription: string;
    companyLogo: string;
}

const EmployerRegisterPage = () => {
    const navigate = useNavigate();
    const [isSubmit, setIsSubmit] = useState(false);
    const [form] = Form.useForm();
    const [imageUrl, setImageUrl] = useState<string>("");

    const onFinish = async (values: IFormValues) => {
        const { name, email, password, age, gender, address, phone, companyName, companyAddress, companyDescription } = values;
        setIsSubmit(true);
        try {
            // Kiểm tra xem đã tải logo hay chưa
            if (!imageUrl) {
                notification.warning({
                    message: "Thiếu thông tin",
                    description: "Vui lòng tải lên logo công ty trước khi đăng ký",
                    duration: 5
                });
                setIsSubmit(false);
                return;
            }

            const data = {
                name,
                email,
                password,
                age: +age,
                gender,
                address,
                phone,
                companyName,
                companyAddress,
                companyDescription,
                companyLogo: imageUrl
            };

            console.log("Sending registration data:", data);
            const res = await callEmployerRegister(data);

            // Xử lý response thành công
            if (res && 'data' in res && res.data?.id) {
                message.success('Đăng ký tài khoản nhà tuyển dụng thành công!');
                setTimeout(() => {
                    navigate('/login');
                }, 1500); // Delay để người dùng thấy thông báo thành công
                return;
            }

            // Nếu success = true (trường hợp đặc biệt từ API)
            if (res && 'success' in res && res.success === true) {
                message.success('Tài khoản đã được tạo, đang chuyển hướng...');
                setTimeout(() => {
                    navigate('/login');
                }, 1500);
                return;
            }

            // Xử lý trường hợp có lỗi
            throw new Error('Đăng ký không thành công');
        } catch (error: any) {
            console.error("Registration error:", error);
            // Trường hợp đặc biệt: Nếu lỗi chứa "Register a new employer" - có thể là đăng ký thành công
            if (error?.message?.includes("Register a new employer")) {
                message.success('Đăng ký tài khoản nhà tuyển dụng thành công!');
                setTimeout(() => {
                    navigate('/login');
                }, 1500);
                return;
            }

            const errorMsg = error.response?.data?.message || error.message || "Có lỗi xảy ra, vui lòng thử lại sau";
            notification.error({
                message: "Đăng ký thất bại",
                description: errorMsg,
                duration: 5
            });
        } finally {
            setIsSubmit(false);
        }
    };

    const handleUploadLogo: UploadProps['customRequest'] = async (options) => {
        const { file, onSuccess, onError } = options;
        try {
            setIsSubmit(true); // Hiển thị trạng thái đang tải
            console.log("Uploading file:", file);

            if (!file) {
                throw new Error("Không tìm thấy file để tải lên");
            }

            // Gọi API upload và xử lý response
            const res = await callUploadSingleFile(file, 'company');
            console.log("Upload response:", res);

            // Xử lý các trường hợp khác nhau của cấu trúc response
            let fileName = '';

            // Trường hợp 1: res là IBackendRes và có data.fileName
            if (res && typeof res === 'object' && 'data' in res && res.data && typeof res.data === 'object' && 'fileName' in res.data) {
                fileName = res.data.fileName as string;
            }
            // Trường hợp 2: res là response trực tiếp từ axios có data.data.fileName
            else if (res && typeof res === 'object' && 'data' in res && res.data && typeof res.data === 'object' && 'data' in res.data) {
                const nestedData = res.data.data;
                if (nestedData && typeof nestedData === 'object' && 'fileName' in nestedData) {
                    fileName = nestedData.fileName as string;
                }
            }
            // Trường hợp 3: res là string 
            else if (res && typeof res === 'string') {
                fileName = res;
            }

            // Nếu tìm được fileName, tiến hành cập nhật state và thông báo thành công
            if (fileName) {
                setImageUrl(fileName);
                if (onSuccess) onSuccess({ fileName });
                message.success('Tải logo lên thành công!');
                return;
            }

            throw new Error('Không thể xác định đường dẫn file đã tải lên.');
        } catch (error: any) {
            console.error("Upload error:", error);
            notification.error({
                message: "Lỗi khi tải logo",
                description: error.message || "Không thể tải logo lên, vui lòng thử lại",
                duration: 5
            });
            if (onError) {
                onError(error instanceof Error ? error : new Error('Lỗi không xác định'));
            }
        } finally {
            setIsSubmit(false);
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
                                <span className={styles["logo-tagline"]}>Tuyển Dụng & Phát Triển</span>
                            </div>
                        </div>

                        <h1 className={styles["banner-title"]}>
                            Đăng ký
                            <span className={styles["highlight"]}> Nhà Tuyển Dụng</span>
                        </h1>
                        <p className={styles["banner-subtitle"]}>
                            Kết nối với hàng nghìn ứng viên IT tài năng
                        </p>

                        <div className={styles["features-list"]}>
                            <div className={styles["feature-item"]}>
                                <BuildOutlined style={{ marginRight: '8px' }} />
                                <span>Tiếp cận ứng viên chất lượng</span>
                            </div>
                            <div className={styles["feature-item"]}>
                                <GlobalOutlined style={{ marginRight: '8px' }} />
                                <span>Đăng tin tuyển dụng hiệu quả</span>
                            </div>
                            <div className={styles["feature-item"]}>
                                <BulbOutlined style={{ marginRight: '8px' }} />
                                <span>Hệ thống quản lý ứng viên thông minh</span>
                            </div>
                            <div className={styles["feature-item"]}>
                                <TeamOutlined style={{ marginRight: '8px' }} />
                                <span>Xây dựng thương hiệu nhà tuyển dụng</span>
                            </div>
                        </div>

                        <div className={styles["banner-footer"]}>
                            <RocketOutlined />
                            <span>Bắt đầu tìm kiếm nhân tài ngay hôm nay</span>
                        </div>

                        <div className={styles["social-links"]}>
                            <a href="#" className={styles["social-link"]}>
                                <LinkedinOutlined style={{ color: "#000000", fontSize: "24px" }} />
                            </a>
                            <a href="#" className={styles["social-link"]}>
                                <GoogleOutlined style={{ color: "#000000", fontSize: "24px" }} />
                            </a>
                        </div>

                    </div>
                </div>

                {/* Form Section */}
                <div className={styles["form-section"]}>
                    <div className={styles["form-container"]}>
                        <div className={styles["form-header"]}>
                            <h2>Đăng ký tài khoản nhà tuyển dụng</h2>
                            <p>Tạo tài khoản mới để bắt đầu tuyển dụng</p>
                        </div>

                        <Form<IFormValues>
                            name="employer-register-form"
                            form={form}
                            onFinish={onFinish}
                            autoComplete="off"
                            layout="vertical"
                            scrollToFirstError
                        >
                            <h3 className={styles["form-section-title"]}>Thông tin cá nhân</h3>

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

                            <Form.Item
                                name="phone"
                                rules={[
                                    { required: true, message: 'Số điện thoại không được để trống!' },
                                    { pattern: /^[0-9]+$/, message: 'Số điện thoại chỉ được chứa số!' }
                                ]}
                            >
                                <Input
                                    prefix={<PhoneOutlined />}
                                    placeholder="Nhập số điện thoại của bạn"
                                    size="large"
                                />
                            </Form.Item>

                            <h3 className={styles["form-section-title"]}>Thông tin công ty</h3>

                            <Form.Item
                                name="companyName"
                                rules={[{ required: true, message: 'Tên công ty không được để trống!' }]}
                            >
                                <Input
                                    prefix={<BankOutlined />}
                                    placeholder="Nhập tên công ty"
                                    size="large"
                                />
                            </Form.Item>

                            <Form.Item
                                name="companyAddress"
                                rules={[{ required: true, message: 'Địa chỉ công ty không được để trống!' }]}
                            >
                                <Input
                                    prefix={<EnvironmentOutlined />}
                                    placeholder="Nhập địa chỉ công ty"
                                    size="large"
                                />
                            </Form.Item>

                            <Form.Item
                                name="companyDescription"
                                rules={[{ required: true, message: 'Mô tả công ty không được để trống!' }]}
                            >
                                <TextArea
                                    placeholder="Nhập mô tả về công ty"
                                    rows={4}
                                />
                            </Form.Item>

                            <Form.Item
                                name="companyLogo"
                                rules={[{ required: !!!imageUrl, message: 'Logo công ty không được để trống!' }]}
                            >
                                <Upload
                                    name="logo"
                                    listType="picture"
                                    maxCount={1}
                                    customRequest={handleUploadLogo}
                                    showUploadList={true}
                                    accept="image/*"
                                    beforeUpload={(file) => {
                                        const isImage = file.type.startsWith('image/');
                                        if (!isImage) {
                                            message.error('Bạn chỉ được tải lên file ảnh!');
                                        }
                                        const isLt2M = file.size / 1024 / 1024 < 2;
                                        if (!isLt2M) {
                                            message.error('Ảnh phải có kích thước nhỏ hơn 2MB!');
                                        }
                                        return isImage && isLt2M;
                                    }}
                                >
                                    <Button icon={<UploadOutlined />} loading={isSubmit}>
                                        {imageUrl ? 'Thay đổi logo' : 'Tải lên logo công ty'}
                                    </Button>
                                </Upload>
                                {imageUrl && (
                                    <div style={{ marginTop: 8 }}>
                                        Logo đã tải lên: <strong>{imageUrl}</strong>
                                    </div>
                                )}
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

                            <div className={styles.dividerContainer}>
                                <Divider>Hoặc</Divider>
                            </div>

                            <div className={styles["social-login"]}>
                                <Button className={styles["social-button"]} icon={<GoogleOutlined />}>
                                    Đăng ký với Google
                                </Button>
                                <Button className={styles["social-button"]} icon={<LinkedinOutlined />}>
                                    Đăng ký với LinkedIn
                                </Button>
                            </div>

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

export default EmployerRegisterPage; 