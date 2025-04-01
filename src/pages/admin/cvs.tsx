import React, { useEffect, useState } from "react";
import { Table, Card, Input, Space, Tag, Button, Modal, message } from "antd";
import { SearchOutlined, EyeOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { callGetAllCVs, callDeleteCV } from "@/config/api";
import { useNavigate } from "react-router-dom";

interface CV {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    address: string;
    education: string[];
    experience: string[];
    skills: string[];
    createdAt: string;
    updatedAt: string;
}

const CVsPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [cvs, setCVs] = useState<CV[]>([]);
    const [searchText, setSearchText] = useState("");
    const [selectedCV, setSelectedCV] = useState<CV | null>(null);
    const [isPreviewModalVisible, setIsPreviewModalVisible] = useState(false);

    useEffect(() => {
        fetchCVs();
    }, []);

    const fetchCVs = async () => {
        try {
            setLoading(true);
            const response = await callGetAllCVs();
            if (response.data?.data) {
                setCVs(response.data.data);
            }
        } catch (error: any) {
            message.error(error.message || "Có lỗi xảy ra khi tải danh sách CV");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await callDeleteCV(id);
            message.success("Xóa CV thành công");
            fetchCVs();
        } catch (error: any) {
            message.error(error.message || "Có lỗi xảy ra khi xóa CV");
        }
    };

    const columns: ColumnsType<CV> = [
        {
            title: "Họ tên",
            dataIndex: "fullName",
            key: "fullName",
            sorter: (a, b) => a.fullName.localeCompare(b.fullName),
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
        },
        {
            title: "Số điện thoại",
            dataIndex: "phone",
            key: "phone",
        },
        {
            title: "Kỹ năng",
            dataIndex: "skills",
            key: "skills",
            render: (skills: string[]) => (
                <Space wrap>
                    {skills.map((skill, index) => (
                        <Tag key={index} color="blue">
                            {skill}
                        </Tag>
                    ))}
                </Space>
            ),
        },
        {
            title: "Ngày tạo",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (date: string) => new Date(date).toLocaleDateString("vi-VN"),
        },
        {
            title: "Thao tác",
            key: "action",
            render: (_, record) => (
                <Space>
                    <Button
                        type="primary"
                        icon={<EyeOutlined />}
                        size="small"
                        onClick={() => {
                            setSelectedCV(record);
                            setIsPreviewModalVisible(true);
                        }}
                    >
                        Xem
                    </Button>
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        size="small"
                        onClick={() => {
                            Modal.confirm({
                                title: "Xác nhận xóa",
                                content: "Bạn có chắc chắn muốn xóa CV này?",
                                onOk: () => handleDelete(record.id),
                            });
                        }}
                    >
                        Xóa
                    </Button>
                </Space>
            ),
        },
    ];

    const filteredCVs = cvs.filter((cv) =>
        Object.values(cv).some((value) =>
            String(value).toLowerCase().includes(searchText.toLowerCase())
        )
    );

    return (
        <div style={{ padding: "24px" }}>
            <Card
                title="Quản lý CV"
                extra={
                    <Input
                        placeholder="Tìm kiếm CV..."
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        style={{ width: 300 }}
                    />
                }
            >
                <Table
                    columns={columns}
                    dataSource={filteredCVs}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng số ${total} CV`,
                    }}
                />
            </Card>

            <Modal
                title="Xem chi tiết CV"
                open={isPreviewModalVisible}
                onCancel={() => setIsPreviewModalVisible(false)}
                width={800}
                footer={null}
            >
                {selectedCV && (
                    <div>
                        <h2>{selectedCV.fullName}</h2>
                        <p>
                            <strong>Email:</strong> {selectedCV.email}
                        </p>
                        <p>
                            <strong>Số điện thoại:</strong> {selectedCV.phone}
                        </p>
                        <p>
                            <strong>Địa chỉ:</strong> {selectedCV.address}
                        </p>
                        <div>
                            <h3>Học vấn</h3>
                            <ul>
                                {selectedCV.education.map((edu, index) => (
                                    <li key={index}>{edu}</li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h3>Kinh nghiệm</h3>
                            <ul>
                                {selectedCV.experience.map((exp, index) => (
                                    <li key={index}>{exp}</li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h3>Kỹ năng</h3>
                            <Space wrap>
                                {selectedCV.skills.map((skill, index) => (
                                    <Tag key={index} color="blue">
                                        {skill}
                                    </Tag>
                                ))}
                            </Space>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default CVsPage; 