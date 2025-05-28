import { Card, Button, message, Popconfirm } from "antd";
import { IJob } from "@/types/backend";
import { useNavigate } from "react-router-dom";
import styles from "@/styles/client.module.scss";
import cardStyles from 'styles/card.module.scss';
import {
    DollarOutlined,
    EnvironmentOutlined,
    DeleteOutlined,
    BankOutlined,
    ClockCircleOutlined,
    CalendarOutlined,
    UserOutlined
} from "@ant-design/icons";
import { callRemoveFromFavourite, callGetJobApplicationsCount } from "@/config/api";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { convertSlug, getLocationName, calculateDaysFromNow } from '@/config/utils';
import dayjs from '@/config/dayjs';

interface Props {
    job: IJob;
    onRemove?: () => void;
}

const FavouriteJobCard = ({ job, onRemove }: Props) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [applicationCount, setApplicationCount] = useState<number>(0);
    const userId = useSelector((state: any) => state.account.user.id);

    useEffect(() => {
        if (job.id) {
            fetchApplicationCount();
        }
    }, [job.id]);

    const fetchApplicationCount = async () => {
        try {
            if (!job.id) return;
            const res = await callGetJobApplicationsCount(job.id);
            if (res?.data?.data?.totalApplications !== undefined) {
                setApplicationCount(res.data.data.totalApplications);
            }
        } catch (error) {
            console.error("Error fetching application count:", error);
        }
    };

    const handleCardClick = () => {
        if (job.id && job.name) {
            const slug = convertSlug(job.name);
            navigate(`/job/${slug}?id=${job.id}`);
        }
    };

    const handleRemove = async (e?: React.MouseEvent) => {
        e?.stopPropagation();
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
                    onRemove();
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
            className={cardStyles["job-card"]}
            hoverable
            onClick={handleCardClick}
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
            <div className={cardStyles["job-card-content"]}>
                {!job.active && <div className={styles["expired-tag"]}>Đã hết hạn</div>}
                <div className={cardStyles["company-logo"]}>
                    <img
                        alt={`${job.company?.name || 'Company'} logo`}
                        src={`${import.meta.env.VITE_BACKEND_URL}/storage/company/${job.company?.logo}`}
                    />
                </div>
                <div className={cardStyles["job-details"]}>
                    <h3 className={cardStyles["job-title"]}>{job.name}</h3>

                    <div className={cardStyles["job-meta"]}>
                        <div className={`${cardStyles["meta-item"]} ${cardStyles["location"]}`}>
                            <EnvironmentOutlined className={cardStyles["icon"]} />
                            {getLocationName(job.location)}
                        </div>
                        <div className={`${cardStyles["meta-item"]} ${cardStyles["salary"]}`}>
                            <DollarOutlined className={cardStyles["icon"]} />
                            {(job.salary || 0).toLocaleString()} đ
                        </div>
                        <div className={`${cardStyles["meta-item"]} ${cardStyles["applications"]}`}>
                            <UserOutlined className={cardStyles["icon"]} />
                            {applicationCount} ứng viên
                        </div>
                    </div>

                    <div className={cardStyles["job-footer"]} style={{ marginLeft: '-12px' }}>
                        <div className={cardStyles["company-name"]}>
                            <BankOutlined style={{ marginRight: 4 }} />
                            {job.company?.name}
                        </div>
                        <div style={{ textAlign: 'left', width: '100%' }}>
                            <div className={cardStyles["posted-time"]}>
                                <ClockCircleOutlined style={{ marginRight: 4 }} />
                                {calculateDaysFromNow(job.updatedAt || job.createdAt || '')}
                            </div>
                            <div className={cardStyles["job-dates"]}>
                                <CalendarOutlined style={{ marginRight: 4 }} />
                                {dayjs(job.createdAt).format('DD/MM/YYYY')} - {dayjs(job.endDate).format('DD/MM/YYYY')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default FavouriteJobCard;
