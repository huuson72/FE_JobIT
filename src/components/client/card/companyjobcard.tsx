import { IJob } from '@/types/backend';
import { EnvironmentOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { Card, Col, Empty, Row } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import styles from 'styles/client.module.scss';
import { convertSlug, getLocationName } from '@/config/utils';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

interface IProps {
    jobs: IJob[]; // Nhận danh sách công việc từ bên ngoài
}

const CompanyJobCard = ({ jobs }: IProps) => {
    const navigate = useNavigate();

    const handleViewDetailJob = (item: IJob) => {
        const slug = convertSlug(item.name);
        navigate(`/job/${slug}?id=${item.id}`);
    };

    return (
        <div className={styles["card-job-section"]}>
            <div className={styles["job-content"]}>
                <Row gutter={[20, 20]}>
                    {jobs.length > 0 ? (
                        jobs.map((job) => (
                            <Col span={24} md={12} key={job.id}>
                                <Card size="small" hoverable onClick={() => handleViewDetailJob(job)}>
                                    <div className={styles["card-job-content"]}>
                                        <div className={styles["card-job-left"]}>
                                            <img
                                                alt="company logo"
                                                src={`${import.meta.env.VITE_BACKEND_URL}/storage/company/${job.company?.logo}`}
                                            />
                                        </div>
                                        <div className={styles["card-job-right"]}>
                                            <div className={styles["job-title"]}>{job.name}</div>
                                            <div className={styles["job-location"]}>
                                                <EnvironmentOutlined style={{ color: '#58aaab' }} /> {getLocationName(job.location)}
                                            </div>
                                            <div>
                                                <ThunderboltOutlined style={{ color: 'orange' }} /> {(job.salary || 0).toLocaleString()} đ
                                            </div>
                                            <div className={styles["job-updatedAt"]}>
                                                {dayjs(job.updatedAt || job.createdAt).locale('en').fromNow()}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </Col>
                        ))
                    ) : (
                        <Empty description="Không có công việc nào." className={styles["empty"]} />
                    )}
                </Row>
            </div>
        </div>
    );
};

export default CompanyJobCard;