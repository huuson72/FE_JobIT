import { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber, Switch, message, Popconfirm, Tag, Card, Typography, Tabs, DatePicker, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CrownOutlined, GiftOutlined } from '@ant-design/icons';
import { ISubscriptionPackage } from '@/types/backend';
import { callGetAllPackages, callCreatePackage, callUpdatePackage, callDeletePackage, callGetAllPromotions, callCreatePromotion, callUpdatePromotion, callDeletePromotion } from '@/config/api';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title } = Typography;
const { TabPane } = Tabs;

interface IPromotion {
    id: number;
    name: string;
    description: string;
    discountPercentage: number;
    startDate: string;
    endDate: string;
    code: string;
    subscriptionPackage: {
        id: number;
        name: string;
        description: string;
        price: number;
        durationDays: number;
        jobPostLimit: number;
        isHighlighted: boolean;
        isPrioritized: boolean;
        isActive: boolean;
    };
    active: boolean;
}

const SubscriptionManagement = () => {
    const [packages, setPackages] = useState<ISubscriptionPackage[]>([]);
    const [promotions, setPromotions] = useState<IPromotion[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [promotionModalVisible, setPromotionModalVisible] = useState(false);
    const [editingPackage, setEditingPackage] = useState<ISubscriptionPackage | null>(null);
    const [editingPromotion, setEditingPromotion] = useState<IPromotion | null>(null);
    const [form] = Form.useForm();
    const [promotionForm] = Form.useForm();

    const fetchPackages = async () => {
        try {
            setLoading(true);
            const res = await callGetAllPackages();
            console.log("Raw API Response:", res);

            if (res?.data?.data?.data) {
                setPackages(res.data.data.data);
            } else if (res?.data?.data) {
                setPackages(res.data.data);
            } else if (Array.isArray(res?.data)) {
                setPackages(res.data);
            } else {
                console.log("No packages found in response");
                setPackages([]);
            }
        } catch (error) {
            console.error("Error fetching packages:", error);
            message.error('Không thể tải danh sách gói VIP');
            setPackages([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchPromotions = async () => {
        try {
            setLoading(true);
            const res = await callGetAllPromotions();
            console.log("Raw Promotions Response:", res);

            if (res?.data) {
                setPromotions(res.data);
            } else {
                console.log("No promotions found in response");
                setPromotions([]);
            }
        } catch (error) {
            console.error("Error fetching promotions:", error);
            message.error('Không thể tải danh sách ưu đãi');
            setPromotions([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPackages();
        fetchPromotions();
    }, []);

    const handleCreate = () => {
        setEditingPackage(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (record: ISubscriptionPackage) => {
        setEditingPackage(record);
        form.setFieldsValue(record);
        setModalVisible(true);
    };

    const handleDelete = async (id: number) => {
        try {
            await callDeletePackage(id);
            message.success('Xóa gói VIP thành công');
            fetchPackages();
        } catch (error) {
            message.error('Không thể xóa gói VIP');
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (editingPackage) {
                await callUpdatePackage(editingPackage.id, values);
                message.success('Cập nhật gói VIP thành công');
            } else {
                await callCreatePackage(values);
                message.success('Tạo gói VIP thành công');
            }
            setModalVisible(false);
            fetchPackages();
        } catch (error) {
            message.error('Có lỗi xảy ra');
        }
    };

    const handleCreatePromotion = () => {
        setEditingPromotion(null);
        promotionForm.resetFields();
        setPromotionModalVisible(true);
    };

    const handleEditPromotion = (record: IPromotion) => {
        setEditingPromotion(record);
        promotionForm.setFieldsValue({
            ...record,
            startDate: dayjs(record.startDate),
            endDate: dayjs(record.endDate)
        });
        setPromotionModalVisible(true);
    };

    const handleDeletePromotion = async (id: number) => {
        try {
            await callDeletePromotion(id);
            message.success('Xóa ưu đãi thành công');
            fetchPromotions();
        } catch (error) {
            message.error('Không thể xóa ưu đãi');
        }
    };

    const handleSubmitPromotion = async () => {
        try {
            const values = await promotionForm.validateFields();
            const formattedValues = {
                ...values,
                startDate: values.startDate.format('YYYY-MM-DDTHH:mm:ss'),
                endDate: values.endDate.format('YYYY-MM-DDTHH:mm:ss'),
                discountPercentage: values.discountPercentage,
                code: values.code || values.discountPercentage.toString()
            };

            if (editingPromotion) {
                await callUpdatePromotion(editingPromotion.id, formattedValues);
                message.success('Cập nhật ưu đãi thành công');
            } else {
                await callCreatePromotion(formattedValues);
                message.success('Tạo ưu đãi thành công');
            }
            setPromotionModalVisible(false);
            fetchPromotions();
        } catch (error) {
            message.error('Có lỗi xảy ra');
        }
    };

    const columns: ColumnsType<ISubscriptionPackage> = [
        {
            title: 'Tên gói',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <Space>
                    <CrownOutlined style={{ color: record.isHighlighted ? '#f5a623' : '#1890ff' }} />
                    {text}
                </Space>
            )
        },
        {
            title: 'Giá',
            dataIndex: 'price',
            key: 'price',
            render: (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
        },
        {
            title: 'Thời hạn (ngày)',
            dataIndex: 'durationDays',
            key: 'durationDays',
            sorter: (a, b) => a.durationDays - b.durationDays
        },
        {
            title: 'Số tin đăng',
            dataIndex: 'jobPostLimit',
            key: 'jobPostLimit',
            sorter: (a, b) => a.jobPostLimit - b.jobPostLimit
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            key: 'isActive',
            render: (isActive) => (
                <Tag color={isActive ? 'success' : 'error'}>
                    {isActive ? 'Đang hoạt động' : 'Đã tắt'}
                </Tag>
            )
        },
        {
            title: 'Ưu tiên hiển thị',
            dataIndex: 'isPrioritized',
            key: 'isPrioritized',
            render: (isPrioritized) => isPrioritized ? <Tag color="gold">Phổ biến nhất</Tag> : null
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Bạn có chắc chắn muốn xóa gói VIP này?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Có"
                        cancelText="Không"
                    >
                        <Button danger icon={<DeleteOutlined />}>
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    const promotionColumns: ColumnsType<IPromotion> = [
        {
            title: 'Tên ưu đãi',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <Space>
                    <GiftOutlined style={{ color: '#f5a623' }} />
                    {text}
                </Space>
            )
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description'
        },
        {
            title: 'Gói VIP',
            dataIndex: ['subscriptionPackage', 'name'],
            key: 'subscriptionPackage',
            render: (text, record) => (
                <Space>
                    <CrownOutlined style={{ color: record.subscriptionPackage.isHighlighted ? '#f5a623' : '#1890ff' }} />
                    {text}
                </Space>
            )
        },
        {
            title: 'Giảm giá',
            dataIndex: 'discountPercentage',
            key: 'discountPercentage',
            render: (percent) => `${percent}%`
        },
        {
            title: 'Mã ưu đãi',
            dataIndex: 'code',
            key: 'code',
            render: (code) => <Tag color="blue">{code}</Tag>
        },
        {
            title: 'Thời gian',
            key: 'dateRange',
            render: (_, record) => (
                <Space direction="vertical">
                    <span>Từ: {dayjs(record.startDate).format('DD/MM/YYYY HH:mm')}</span>
                    <span>Đến: {dayjs(record.endDate).format('DD/MM/YYYY HH:mm')}</span>
                </Space>
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'active',
            key: 'active',
            render: (active) => (
                <Tag color={active ? 'success' : 'error'}>
                    {active ? 'Đang hoạt động' : 'Đã tắt'}
                </Tag>
            )
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => handleEditPromotion(record)}
                    >
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Bạn có chắc chắn muốn xóa ưu đãi này?"
                        onConfirm={() => handleDeletePromotion(record.id)}
                        okText="Có"
                        cancelText="Không"
                    >
                        <Button danger icon={<DeleteOutlined />}>
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div style={{ padding: '24px' }}>
            <Card>
                <Tabs defaultActiveKey="1">
                    <TabPane tab="Quản lý gói VIP" key="1">
                        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Title level={3} style={{ margin: 0 }}>
                                <CrownOutlined style={{ marginRight: 8, color: '#f5a623' }} />
                                Quản lý gói VIP
                            </Title>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={handleCreate}
                            >
                                Thêm gói VIP
                            </Button>
                        </div>

                        <Table
                            columns={columns}
                            dataSource={packages}
                            rowKey="id"
                            loading={loading}
                            pagination={{
                                pageSize: 10,
                                showSizeChanger: true,
                                showTotal: (total) => `Tổng số ${total} gói VIP`
                            }}
                        />
                    </TabPane>

                    <TabPane tab="Quản lý ưu đãi" key="2">
                        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Title level={3} style={{ margin: 0 }}>
                                <GiftOutlined style={{ marginRight: 8, color: '#f5a623' }} />
                                Quản lý ưu đãi
                            </Title>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={handleCreatePromotion}
                            >
                                Thêm ưu đãi
                            </Button>
                        </div>

                        <Table
                            columns={promotionColumns}
                            dataSource={promotions}
                            rowKey="id"
                            loading={loading}
                            pagination={{
                                pageSize: 10,
                                showSizeChanger: true,
                                showTotal: (total) => `Tổng số ${total} ưu đãi`
                            }}
                        />
                    </TabPane>
                </Tabs>
            </Card>

            <Modal
                title={editingPackage ? 'Sửa gói VIP' : 'Thêm gói VIP mới'}
                open={modalVisible}
                onOk={handleSubmit}
                onCancel={() => setModalVisible(false)}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                >
                    <Form.Item
                        name="name"
                        label="Tên gói"
                        rules={[{ required: true, message: 'Vui lòng nhập tên gói' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Mô tả"
                        rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
                    >
                        <Input.TextArea rows={4} />
                    </Form.Item>

                    <Form.Item
                        name="price"
                        label="Giá"
                        rules={[{ required: true, message: 'Vui lòng nhập giá' }]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                        />
                    </Form.Item>

                    <Form.Item
                        name="durationDays"
                        label="Thời hạn (ngày)"
                        rules={[{ required: true, message: 'Vui lòng nhập thời hạn' }]}
                    >
                        <InputNumber style={{ width: '100%' }} min={1} />
                    </Form.Item>

                    <Form.Item
                        name="jobPostLimit"
                        label="Số tin đăng tối đa"
                        rules={[{ required: true, message: 'Vui lòng nhập số tin đăng' }]}
                    >
                        <InputNumber style={{ width: '100%' }} min={1} />
                    </Form.Item>

                    <Form.Item
                        name="isHighlighted"
                        label="Tin nổi bật"
                        valuePropName="checked"
                    >
                        <Switch />
                    </Form.Item>

                    <Form.Item
                        name="isPrioritized"
                        label="Ưu tiên hiển thị"
                        valuePropName="checked"
                    >
                        <Switch />
                    </Form.Item>

                    <Form.Item
                        name="isActive"
                        label="Trạng thái"
                        valuePropName="checked"
                    >
                        <Switch />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title={editingPromotion ? 'Sửa ưu đãi' : 'Thêm ưu đãi mới'}
                open={promotionModalVisible}
                onOk={handleSubmitPromotion}
                onCancel={() => setPromotionModalVisible(false)}
                width={600}
            >
                <Form
                    form={promotionForm}
                    layout="vertical"
                >
                    <Form.Item
                        name="name"
                        label="Tên ưu đãi"
                        rules={[{ required: true, message: 'Vui lòng nhập tên ưu đãi' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Mô tả"
                        rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
                    >
                        <Input.TextArea rows={4} />
                    </Form.Item>

                    <Form.Item
                        name="code"
                        label="Mã ưu đãi"
                        rules={[{ required: true, message: 'Vui lòng nhập mã ưu đãi' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="discountPercentage"
                        label="Phần trăm giảm giá"
                        rules={[{ required: true, message: 'Vui lòng nhập phần trăm giảm giá' }]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            min={0}
                            max={100}
                            formatter={(value) => `${value}%`}
                            parser={(value) => {
                                if (!value) return 0;
                                const num = parseInt(value.replace('%', ''));
                                return num >= 0 && num <= 100 ? (num as 0 | 100) : 0;
                            }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="subscriptionPackageId"
                        label="Áp dụng cho gói VIP"
                        rules={[{ required: true, message: 'Vui lòng chọn gói VIP' }]}
                    >
                        <Select>
                            {packages.map(pkg => (
                                <Select.Option key={pkg.id} value={pkg.id}>
                                    {pkg.name} - {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(pkg.price)}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="startDate"
                        label="Ngày bắt đầu"
                        rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu' }]}
                    >
                        <DatePicker showTime style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        name="endDate"
                        label="Ngày kết thúc"
                        rules={[{ required: true, message: 'Vui lòng chọn ngày kết thúc' }]}
                    >
                        <DatePicker showTime style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        name="active"
                        label="Trạng thái"
                        valuePropName="checked"
                    >
                        <Switch />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default SubscriptionManagement; 