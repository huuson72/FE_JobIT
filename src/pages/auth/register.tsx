import { Button, Divider, Form, Input, Select, message, notification } from 'antd';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { callRegister } from 'config/api';
import styles from 'styles/auth.module.scss';
import { IUser } from '@/types/backend';

const { Option } = Select;

const RegisterPage = () => {
    const navigate = useNavigate();
    const [isSubmit, setIsSubmit] = useState(false);

    const onFinish = async (values: IUser) => {
        const { name, email, password, age, gender, address } = values;
        setIsSubmit(true);
        const res = await callRegister(name, email, password as string, +age, gender, address);
        setIsSubmit(false);
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
    };

    return (
        <div className={styles["register-page"]}>
            <main className={styles.main}>
                <div className={styles.container}>
                    <section className={styles.wrapper}>
                        <div className={styles.heading}>
                            <h2 className={`${styles.text} ${styles["text-large"]}`}> Đăng Ký Tài Khoản </h2>
                            <Divider />
                        </div>
                        <Form<IUser>
                            name="basic"
                            onFinish={onFinish}
                            autoComplete="off"
                        >
                            <Form.Item
                                labelCol={{ span: 24 }}
                                label="Họ tên"
                                name="name"
                                rules={[{ required: true, message: 'Họ tên không được để trống!' }]}
                            >
                                <Input style={{ height: "45px", fontSize: "16px" }} />
                            </Form.Item>

                            <Form.Item
                                labelCol={{ span: 24 }}
                                label="Email"
                                name="email"
                                rules={[{ required: true, message: 'Email không được để trống!' }]}
                            >
                                <Input type='email' style={{ height: "45px", fontSize: "16px" }} />
                            </Form.Item>

                            <Form.Item
                                labelCol={{ span: 24 }}
                                label="Mật khẩu"
                                name="password"
                                rules={[{ required: true, message: 'Mật khẩu không được để trống!' }]}
                            >
                                <Input.Password style={{ height: "45px", fontSize: "16px" }} />
                            </Form.Item>

                            <Form.Item
                                labelCol={{ span: 24 }}
                                label="Tuổi"
                                name="age"
                                rules={[{ required: true, message: 'Tuổi không được để trống!' }]}
                            >
                                <Input type='number' style={{ height: "45px", fontSize: "16px" }} />
                            </Form.Item>

                            <Form.Item
                                labelCol={{ span: 24 }}
                                name="gender"
                                label="Giới tính"
                                rules={[{ required: true, message: 'Giới tính không được để trống!' }]}
                            >
                                <Select style={{ height: "45px", fontSize: "16px" }}>
                                    <Option value="MALE">Nam</Option>
                                    <Option value="FEMALE">Nữ</Option>
                                    <Option value="OTHER">Khác</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item
                                labelCol={{ span: 24 }}
                                label="Địa chỉ"
                                name="address"
                                rules={[{ required: true, message: 'Địa chỉ không được để trống!' }]}
                            >
                                <Input style={{ height: "45px", fontSize: "16px" }} />
                            </Form.Item>

                            {/* Căn giữa nút đăng ký */}
                            <Form.Item style={{ textAlign: "center" }}>
                                <Button type="primary" htmlType="submit" loading={isSubmit} style={{ width: "200px", fontSize: "16px", height: "45px" }}>
                                    Đăng ký
                                </Button>
                            </Form.Item>

                            <Divider>Hoặc</Divider>

                            {/* Căn giữa dòng đăng nhập */}
                            <p style={{ textAlign: "center", fontSize: "16px" }}>
                                Đã có tài khoản?
                                <Link to='/login' style={{ color: "#1890ff", fontWeight: "bold", marginLeft: "5px" }}>
                                    Đăng Nhập
                                </Link>
                            </p>
                        </Form>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default RegisterPage;
