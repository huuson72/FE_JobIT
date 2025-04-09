import { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { IChangePasswordRequest } from '@/types/backend';
import { callChangePassword } from '@/config/api';

const ChangePasswordForm = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values: IChangePasswordRequest) => {
        setLoading(true);
        try {
            const response = await callChangePassword(values);
            if (response.success) {
                message.success('Đổi mật khẩu thành công!');
                form.resetFields();
            } else {
                message.error(response.message || 'Có lỗi xảy ra khi đổi mật khẩu');
            }
        } catch (error) {
            message.error('Có lỗi xảy ra khi đổi mật khẩu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
        >
            <Form.Item
                label="Mật khẩu hiện tại"
                name="currentPassword"
                rules={[
                    { required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' },
                    { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
                ]}
            >
                <Input.Password placeholder="Nhập mật khẩu hiện tại" />
            </Form.Item>

            <Form.Item
                label="Mật khẩu mới"
                name="newPassword"
                rules={[
                    { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                    { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
                ]}
            >
                <Input.Password placeholder="Nhập mật khẩu mới" />
            </Form.Item>

            <Form.Item
                label="Xác nhận mật khẩu mới"
                name="confirmNewPassword"
                dependencies={['newPassword']}
                rules={[
                    { required: true, message: 'Vui lòng xác nhận mật khẩu mới!' },
                    ({ getFieldValue }) => ({
                        validator(_, value) {
                            if (!value || getFieldValue('newPassword') === value) {
                                return Promise.resolve();
                            }
                            return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                        },
                    }),
                ]}
            >
                <Input.Password placeholder="Xác nhận mật khẩu mới" />
            </Form.Item>

            <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} block>
                    Đổi mật khẩu
                </Button>
            </Form.Item>
        </Form>
    );
};

export default ChangePasswordForm; 