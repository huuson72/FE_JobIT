import { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { IUpdateProfileRequest } from '@/types/backend';
import { callUpdateUserProfile } from '@/config/api';
import { useSelector } from 'react-redux';

const UpdateProfileForm = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const user = useSelector((state: any) => state.account.user);

    const onFinish = async (values: IUpdateProfileRequest) => {
        setLoading(true);
        try {
            const response = await callUpdateUserProfile(values);
            if (response.success) {
                message.success('Cập nhật thông tin thành công!');
                // Có thể thêm logic để cập nhật Redux store nếu cần
            } else {
                message.error(response.message || 'Có lỗi xảy ra khi cập nhật thông tin');
            }
        } catch (error) {
            message.error('Có lỗi xảy ra khi cập nhật thông tin');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{
                fullName: user?.name,
                email: user?.email,
                phone: user?.phone,
                address: user?.address,
            }}
        >
            <Form.Item
                label="Họ và tên"
                name="fullName"
                rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
            >
                <Input placeholder="Nhập họ và tên" />
            </Form.Item>

            <Form.Item
                label="Email"
                name="email"
                rules={[
                    { required: true, message: 'Vui lòng nhập email!' },
                    { type: 'email', message: 'Email không hợp lệ!' }
                ]}
            >
                <Input placeholder="Nhập email" />
            </Form.Item>

            <Form.Item
                label="Số điện thoại"
                name="phone"
                rules={[
                    { required: true, message: 'Vui lòng nhập số điện thoại!' },
                    { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ!' }
                ]}
            >
                <Input placeholder="Nhập số điện thoại" />
            </Form.Item>

            <Form.Item
                label="Địa chỉ"
                name="address"
                rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
            >
                <Input.TextArea placeholder="Nhập địa chỉ" rows={3} />
            </Form.Item>

            <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} block>
                    Cập nhật thông tin
                </Button>
            </Form.Item>
        </Form>
    );
};

export default UpdateProfileForm; 