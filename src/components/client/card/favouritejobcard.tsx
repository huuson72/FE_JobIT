import { Card, Button, message, Popconfirm } from "antd";
import { IJob } from "@/types/backend";
import { useNavigate } from "react-router-dom";
import styles from "@/styles/client.module.scss";
import { DollarOutlined, EnvironmentOutlined, DeleteOutlined } from "@ant-design/icons";
import { callRemoveFromFavourite } from "@/config/api";
import { useState } from "react";
import { useSelector } from "react-redux";

interface Props {
    job: IJob;
    onRemove?: () => void;
}

const FavouriteJobCard = ({ job, onRemove }: Props) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const userId = useSelector((state: any) => state.account.user.id);

    const handleCardClick = () => {
        if (job.id && job.name) {
            const slug = job.name.toLowerCase().replace(/\s+/g, "-");
            navigate(`/job/${slug}?id=${job.id}`);
        }
    };

    const handleRemove = async (e?: React.MouseEvent) => {
        e?.stopPropagation(); // Ngăn sự kiện click lan ra card nếu có
        if (!job.id) return;

        setLoading(true);
        try {
            if (!userId) {
                message.error("Vui lòng đăng nhập để thực hiện thao tác này");
                return;
            }

            const response = await callRemoveFromFavourite(Number(job.id), userId);
            if (response.success) {
                message.success("Đã xóa khỏi danh sách yêu thích");
                if (onRemove) {
                    onRemove(); // Gọi callback để cập nhật UI
                }
            } else {
                message.error(response.message || "Có lỗi xảy ra");
            }
        } catch (error) {
            console.error("Error removing from favorites:", error);
            message.error("Có lỗi xảy ra khi xóa khỏi danh sách yêu thích");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card
            hoverable
            className={styles.card}
            extra={
                <Popconfirm
                    title="Xóa khỏi danh sách yêu thích?"
                    description="Bạn có chắc chắn muốn xóa công việc này khỏi danh sách yêu thích?"
                    onConfirm={handleRemove}
                    okText="Xóa"
                    cancelText="Hủy"
                    okButtonProps={{ danger: true }}
                >
                    <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        loading={loading}
                        onClick={e => e.stopPropagation()}
                    >
                        Xóa
                    </Button>
                </Popconfirm>
            }
        >
            <div style={{ cursor: 'pointer' }}>
                <div style={{ marginBottom: "10px" }}>
                    <h3 style={{ color: "#1e90ff", fontSize: "18px", fontWeight: "bold" }}>{job.name}</h3>
                    <p style={{ color: "#555", fontSize: "14px" }}><strong>{job.company?.name}</strong></p>
                </div>
                <div style={{ color: "#888", fontSize: "14px" }}>
                    <p><DollarOutlined /> {job.salary?.toLocaleString()} đ</p>
                    <p><EnvironmentOutlined /> {job.location}</p>
                </div>
                <Button
                    type="primary"
                    style={{ marginTop: "10px" }}
                    onClick={handleCardClick}
                >
                    Xem chi tiết
                </Button>
            </div>
        </Card>
    );
};

export default FavouriteJobCard;
