import { Button, Col, Form, Modal, Row, Select, Table, Tabs, message, notification, Input, InputNumber, Upload, Alert, Card, Descriptions } from "antd";
import { isMobile } from "react-device-detect";
import type { TabsProps } from 'antd';
import { IResume, ISubscribers, IUpdateCompanyInfoRequest } from "@/types/backend";
import { useState, useEffect } from 'react';
import { callCreateSubscriber, callFetchAllSkill, callFetchResumeByUser, callGetSubscriberSkills, callUpdateSubscriber, callUpdateUserProfile, callChangePassword, callUpdateCompanyInfo, callHRUpdateCompany, callUploadSingleFile, callFetchCompany, callEmployerRegister } from "@/config/api";
import type { ColumnsType } from 'antd/es/table';
import dayjs from '@/config/dayjs';
import { MonitorOutlined, UploadOutlined } from "@ant-design/icons";
import { SKILLS_LIST } from "@/config/utils";
import { useAppSelector } from "@/redux/hooks";
import type { UploadProps } from 'antd';

interface IProps {
    open: boolean;
    onClose: (v: boolean) => void;
}

const UserResume = (props: any) => {
    const [listCV, setListCV] = useState<IResume[]>([]);
    const [isFetching, setIsFetching] = useState<boolean>(false);

    useEffect(() => {
        const init = async () => {
            setIsFetching(true);
            const res = await callFetchResumeByUser();
            if (res && res.data) {
                setListCV(res.data.result as IResume[])
            }
            setIsFetching(false);
        }
        init();
    }, [])

    const columns: ColumnsType<IResume> = [
        {
            title: 'STT',
            key: 'index',
            width: 50,
            align: "center",
            render: (text, record, index) => {
                return (
                    <>
                        {(index + 1)}
                    </>)
            }
        },
        {
            title: 'Công Ty',
            dataIndex: "companyName",

        },
        {
            title: 'Job title',
            dataIndex: ["job", "name"],

        },
        {
            title: 'Trạng thái',
            dataIndex: "status",
        },
        {
            title: 'Ngày rải CV',
            dataIndex: "createdAt",
            render(value, record, index) {
                return (
                    <>{dayjs(record.createdAt).format('DD-MM-YYYY HH:mm:ss')}</>
                )
            },
        },
        {
            title: '',
            dataIndex: "",
            render(value, record, index) {
                return (
                    <a
                        href={`${import.meta.env.VITE_BACKEND_URL}/storage/resume/${record?.url}`}
                        target="_blank"
                    >Chi tiết</a>
                )
            },
        },
    ];

    return (
        <div>
            <Table<IResume>
                columns={columns}
                dataSource={listCV}
                loading={isFetching}
                pagination={false}
            />
        </div>
    )
}

const UserUpdateInfo = (props: any) => {
    const [form] = Form.useForm();
    const user = useAppSelector(state => state.account.user);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            form.setFieldsValue({
                fullName: user.name,
                email: user.email,
                phone: user.phone || '',
                address: user.address || ''
            });
        }
    }, [user]);

    const onFinish = async (values: any) => {
        try {
            setLoading(true);
            const res = await callUpdateUserProfile({
                fullName: values.fullName,
                email: values.email,
                phone: values.phone,
                address: values.address
            });
            if (res.success) {
                message.success('Cập nhật thông tin thành công');
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: res.message
                });
            }
        } catch (error) {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: 'Không thể cập nhật thông tin'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form
            form={form}
            onFinish={onFinish}
            layout="vertical"
        >
            <Row gutter={[20, 20]}>
                <Col span={24}>
                    <Form.Item
                        label="Họ và tên"
                        name="fullName"
                        rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
                    >
                        <Input />
                    </Form.Item>
                </Col>
                <Col span={24}>
                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                            { required: true, message: 'Vui lòng nhập email!' },
                            { type: 'email', message: 'Email không hợp lệ!' }
                        ]}
                    >
                        <Input />
                    </Form.Item>
                </Col>
                <Col span={24}>
                    <Form.Item
                        label="Số điện thoại"
                        name="phone"
                        rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
                    >
                        <Input />
                    </Form.Item>
                </Col>
                <Col span={24}>
                    <Form.Item
                        label="Địa chỉ"
                        name="address"
                        rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
                    >
                        <Input.TextArea rows={4} />
                    </Form.Item>
                </Col>
                <Col span={24}>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Cập nhật thông tin
                    </Button>
                </Col>
            </Row>
        </Form>
    );
};

const ChangePassword = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values: any) => {
        try {
            setLoading(true);
            const res = await callChangePassword({
                currentPassword: values.currentPassword,
                newPassword: values.newPassword,
                confirmNewPassword: values.confirmPassword
            });
            if (res.success) {
                message.success('Đổi mật khẩu thành công');
                form.resetFields();
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: res.message
                });
            }
        } catch (error) {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: 'Không thể đổi mật khẩu'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form
            form={form}
            onFinish={onFinish}
            layout="vertical"
        >
            <Row gutter={[20, 20]}>
                <Col span={24}>
                    <Form.Item
                        label="Mật khẩu hiện tại"
                        name="currentPassword"
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }]}
                    >
                        <Input.Password />
                    </Form.Item>
                </Col>
                <Col span={24}>
                    <Form.Item
                        label="Mật khẩu mới"
                        name="newPassword"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>
                </Col>
                <Col span={24}>
                    <Form.Item
                        label="Xác nhận mật khẩu mới"
                        name="confirmPassword"
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
                        <Input.Password />
                    </Form.Item>
                </Col>
                <Col span={24}>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Đổi mật khẩu
                    </Button>
                </Col>
            </Row>
        </Form>
    );
};

const JobByEmail = (props: any) => {
    const [form] = Form.useForm();
    const user = useAppSelector(state => state.account.user);
    const [optionsSkills, setOptionsSkills] = useState<{
        label: string;
        value: string;
    }[]>([]);

    const [subscriber, setSubscriber] = useState<ISubscribers | null>(null);

    useEffect(() => {
        const init = async () => {
            await fetchSkill();
            const res = await callGetSubscriberSkills();
            if (res && res.data) {
                setSubscriber(res.data);
                const d = res.data.skills;
                const arr = d.map((item: any) => {
                    return {
                        label: item.name as string,
                        value: item.id + "" as string
                    }
                });
                form.setFieldValue("skills", arr);
            }
        }
        init();
    }, [])

    const fetchSkill = async () => {
        let query = `page=1&size=100&sort=createdAt,desc`;

        const res = await callFetchAllSkill(query);
        if (res && res.data) {
            const arr = res?.data?.result?.map(item => {
                return {
                    label: item.name as string,
                    value: item.id + "" as string
                }
            }) ?? [];
            setOptionsSkills(arr);
        }
    }

    const onFinish = async (values: any) => {
        const { skills } = values;

        const arr = skills?.map((item: any) => {
            if (item?.id) return { id: item.id };
            return { id: item }
        });

        if (!subscriber?.id) {
            //create subscriber
            const data = {
                email: user.email,
                name: user.name,
                skills: arr
            }

            const res = await callCreateSubscriber(data);
            if (res.data) {
                message.success("Cập nhật thông tin thành công");
                setSubscriber(res.data);
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: res.message
                });
            }


        } else {
            //update subscriber
            const res = await callUpdateSubscriber({
                id: subscriber?.id,
                skills: arr
            });
            if (res.data) {
                message.success("Cập nhật thông tin thành công");
                setSubscriber(res.data);
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: res.message
                });
            }
        }


    }

    return (
        <>
            <Form
                onFinish={onFinish}
                form={form}
            >
                <Row gutter={[20, 20]}>
                    <Col span={24}>
                        <Form.Item
                            label={"Kỹ năng"}
                            name={"skills"}
                            rules={[{ required: true, message: 'Vui lòng chọn ít nhất 1 skill!' }]}

                        >
                            <Select
                                mode="multiple"
                                allowClear
                                suffixIcon={null}
                                style={{ width: '100%' }}
                                placeholder={
                                    <>
                                        <MonitorOutlined /> Tìm theo kỹ năng...
                                    </>
                                }
                                optionLabelProp="label"
                                options={optionsSkills}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Button onClick={() => form.submit()}>Cập nhật</Button>
                    </Col>
                </Row>
            </Form>
        </>
    )
}

const ManageAccount = (props: IProps) => {
    const { open, onClose } = props;
    const user = useAppSelector(state => state.account.user);
    const isHR = user?.role?.name === 'HR';

    const onChange = (key: string) => {
        // console.log(key);
    };

    const items: TabsProps['items'] = [
        ...(!isHR ? [
            {
                key: 'user-info',
                label: `Thông tin cá nhân`,
                children: <UserUpdateInfo />,
            }
        ] : []),
        {
            key: 'change-password',
            label: `Đổi mật khẩu`,
            children: <ChangePassword />,
        },
        ...(isHR ? [
            {
                key: 'company-info',
                label: `Cập nhật thông tin`,
                children: <CompanyInfo />,
            }
        ] : []),
        ...(!isHR ? [
            {
                key: 'user-resume',
                label: `Rải CV`,
                children: <UserResume />,
            },
            {
                key: 'email-by-skills',
                label: `Nhận Jobs qua Email`,
                children: <JobByEmail />,
            }
        ] : [])
    ];

    return (
        <>
            <Modal
                title="Quản lý tài khoản"
                open={open}
                onCancel={() => onClose(false)}
                maskClosable={false}
                footer={null}
                destroyOnClose={true}
                width={isMobile ? "100%" : "1000px"}
            >

                <div style={{ minHeight: 400 }}>
                    <Tabs
                        defaultActiveKey="user-info"
                        items={items}
                        onChange={onChange}
                    />
                </div>

            </Modal>
        </>
    )
}

const CompanyInfo = () => {
    const [form] = Form.useForm();
    const user = useAppSelector(state => state.account.user);
    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState<string>("");
    const [businessLicenseUrl, setBusinessLicenseUrl] = useState<string>("");

    useEffect(() => {
        console.log("User data from Redux:", user);
        if (user) {
            console.log("Company data:", user.company);
            form.setFieldsValue({
                // Thông tin cá nhân
                name: user.name,
                address: user.address,
                phone: user.phone,
                age: user.age,
                gender: user.gender,
                // Thông tin công ty
                companyName: user.company?.name,
                companyAddress: user.company?.address,
                companyDescription: user.company?.description
            });
            if (user.company?.logo) {
                setImageUrl(user.company.logo);
            }
            if (user.businessLicense) {
                setBusinessLicenseUrl(user.businessLicense);
            }
        }
    }, [user]);

    const handleUploadLogo: UploadProps['customRequest'] = async (options) => {
        const { file, onSuccess, onError } = options;
        try {
            setLoading(true);
            console.log("Uploading file:", file);

            if (!file) {
                throw new Error("Không tìm thấy file để tải lên");
            }

            // Kiểm tra kích thước file (tối đa 5MB)
            if ((file as File).size > 5 * 1024 * 1024) {
                throw new Error("File quá lớn. Vui lòng chọn file nhỏ hơn 5MB");
            }

            // Kiểm tra định dạng file
            const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
            if (!allowedTypes.includes((file as File).type)) {
                throw new Error("Chỉ chấp nhận file ảnh (JPEG, PNG, JPG)");
            }

            const res = await callUploadSingleFile(file, 'company');
            console.log("Upload response:", res);

            if (res?.data?.fileName) {
                setImageUrl(res.data.fileName);
                if (onSuccess) onSuccess(res.data);
                message.success('Tải logo lên thành công!');
            } else {
                throw new Error("Không nhận được tên file từ server");
            }
        } catch (error: any) {
            console.error("Upload error:", error);
            if (onError) {
                onError(error);
            }
            message.error(error.message || 'Tải logo lên thất bại!');
        } finally {
            setLoading(false);
        }
    };

    const handleUploadBusinessLicense: UploadProps['customRequest'] = async (options) => {
        const { file, onSuccess, onError } = options;
        try {
            setLoading(true);
            console.log("Uploading business license:", file);

            if (!file) {
                throw new Error("Không tìm thấy file để tải lên");
            }

            // Kiểm tra kích thước file (tối đa 5MB)
            if ((file as File).size > 5 * 1024 * 1024) {
                throw new Error("File quá lớn. Vui lòng chọn file nhỏ hơn 5MB");
            }

            // Kiểm tra định dạng file
            const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
            if (!allowedTypes.includes((file as File).type)) {
                throw new Error("Chỉ chấp nhận file ảnh (JPEG, PNG, JPG) hoặc PDF");
            }

            const res = await callUploadSingleFile(file, 'company');
            console.log("Upload response:", res);

            if (res?.data?.fileName) {
                setBusinessLicenseUrl(res.data.fileName);
                if (onSuccess) onSuccess(res.data);
                message.success('Tải giấy phép kinh doanh lên thành công!');
            } else {
                throw new Error("Không nhận được tên file từ server");
            }
        } catch (error: any) {
            console.error("Upload error:", error);
            if (onError) {
                onError(error);
            }
            message.error(error.message || 'Tải giấy phép kinh doanh lên thất bại!');
        } finally {
            setLoading(false);
        }
    };

    const onFinish = async (values: any) => {
        try {
            // Kiểm tra xem đã tải logo hay chưa
            if (!imageUrl) {
                notification.warning({
                    message: "Thiếu thông tin",
                    description: "Vui lòng tải lên logo công ty trước khi cập nhật",
                    duration: 5
                });
                return;
            }

            // Kiểm tra xem đã tải giấy phép kinh doanh hay chưa
            if (!businessLicenseUrl) {
                notification.warning({
                    message: "Thiếu thông tin",
                    description: "Vui lòng tải lên giấy phép kinh doanh trước khi cập nhật",
                    duration: 5
                });
                return;
            }

            const data = {
                // Thông tin cá nhân
                name: values.name,
                address: values.address,
                phone: values.phone,
                age: +values.age,
                gender: values.gender,
                businessLicense: businessLicenseUrl,
                // Thông tin công ty
                companyName: values.companyName,
                companyAddress: values.companyAddress,
                companyDescription: values.companyDescription,
                companyLogo: imageUrl
            };

            console.log("Sending update request with:", data);

            setLoading(true);
            const res = await callHRUpdateCompany(data);

            if (res.data) {
                message.success('Cập nhật thông tin thành công.');
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: res.message || 'Không thể cập nhật thông tin'
                });
            }
        } catch (error: any) {
            console.error("Error updating info:", error);
            notification.error({
                message: 'Có lỗi xảy ra',
                description: error.response?.data?.message || 'Không thể cập nhật thông tin'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form
            form={form}
            onFinish={onFinish}
            layout="vertical"
        >
            <Row gutter={[20, 20]}>
                <Col span={24}>
                    <h3>Thông tin cá nhân</h3>
                </Col>
                <Col span={24}>
                    <Form.Item
                        label="Họ và tên"
                        name="name"
                        rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
                    >
                        <Input />
                    </Form.Item>
                </Col>
                <Col span={24}>
                    <Form.Item
                        label="Địa chỉ"
                        name="address"
                        rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
                    >
                        <Input.TextArea rows={4} />
                    </Form.Item>
                </Col>
                <Col span={24}>
                    <Form.Item
                        label="Số điện thoại"
                        name="phone"
                        rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
                    >
                        <Input />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                        label="Tuổi"
                        name="age"
                        rules={[{ required: true, message: 'Vui lòng nhập tuổi!' }]}
                    >
                        <InputNumber style={{ width: '100%' }} />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                        label="Giới tính"
                        name="gender"
                        rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
                    >
                        <Select>
                            <Select.Option value="MALE">Nam</Select.Option>
                            <Select.Option value="FEMALE">Nữ</Select.Option>
                            <Select.Option value="OTHER">Khác</Select.Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={24}>
                    <Form.Item
                        label="Giấy phép kinh doanh"
                        name="businessLicense"
                        rules={[{ required: true, message: 'Vui lòng tải lên giấy phép kinh doanh!' }]}
                    >
                        <Upload
                            name="businessLicense"
                            listType="picture-card"
                            showUploadList={false}
                            customRequest={handleUploadBusinessLicense}
                            maxCount={1}
                            accept="image/jpeg,image/png,image/jpg,application/pdf"
                        >
                            {businessLicenseUrl ? (
                                <img
                                    src={`${import.meta.env.VITE_BACKEND_URL}/storage/company/${businessLicenseUrl}`}
                                    alt="Giấy phép kinh doanh"
                                    style={{ width: '100%' }}
                                />
                            ) : (
                                <div>
                                    <UploadOutlined />
                                    <div style={{ marginTop: 8 }}>Tải lên</div>
                                </div>
                            )}
                        </Upload>
                    </Form.Item>
                </Col>

                <Col span={24}>
                    <h3>Thông tin công ty</h3>
                </Col>
                <Col span={24}>
                    <Form.Item
                        label="Logo công ty"
                        name="companyLogo"
                        rules={[{ required: true, message: 'Vui lòng tải lên logo công ty!' }]}
                    >
                        <Upload
                            name="companyLogo"
                            listType="picture-card"
                            showUploadList={false}
                            customRequest={handleUploadLogo}
                            maxCount={1}
                            accept="image/jpeg,image/png,image/jpg"
                        >
                            {imageUrl ? (
                                <img
                                    src={`${import.meta.env.VITE_BACKEND_URL}/storage/company/${imageUrl}`}
                                    alt="Logo công ty"
                                    style={{ width: '100%' }}
                                />
                            ) : (
                                <div>
                                    <UploadOutlined />
                                    <div style={{ marginTop: 8 }}>Tải lên</div>
                                </div>
                            )}
                        </Upload>
                    </Form.Item>
                </Col>
                <Col span={24}>
                    <Form.Item
                        label="Tên công ty"
                        name="companyName"
                        rules={[{ required: true, message: 'Vui lòng nhập tên công ty!' }]}
                    >
                        <Input />
                    </Form.Item>
                </Col>
                <Col span={24}>
                    <Form.Item
                        label="Địa chỉ công ty"
                        name="companyAddress"
                        rules={[{ required: true, message: 'Vui lòng nhập địa chỉ công ty!' }]}
                    >
                        <Input.TextArea rows={4} />
                    </Form.Item>
                </Col>
                <Col span={24}>
                    <Form.Item
                        label="Mô tả công ty"
                        name="companyDescription"
                        rules={[{ required: true, message: 'Vui lòng nhập mô tả công ty!' }]}
                    >
                        <Input.TextArea rows={4} />
                    </Form.Item>
                </Col>
                <Col span={24}>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                    >
                        Cập nhật thông tin
                    </Button>
                </Col>
            </Row>
        </Form>
    );
};

export default ManageAccount;