import { IJob } from '@/types/backend';
import { EnvironmentOutlined, ThunderboltOutlined, BankOutlined, ClockCircleOutlined, DollarOutlined, CalendarOutlined, UserOutlined } from '@ant-design/icons';
import { Card, Col, Empty, Row } from 'antd';
import { useNavigate } from 'react-router-dom';
import styles from 'styles/client.module.scss';
import cardStyles from 'styles/card.module.scss';
import { convertSlug, getLocationName, calculateDaysFromNow } from '@/config/utils';
import dayjs from '@/config/dayjs';
import { callGetJobApplicationsCount } from '@/config/api';
import { useState, useEffect } from 'react';

interface IProps {
    jobs: IJob[]; // Nhận danh sách công việc từ bên ngoài
}

const CompanyJobCard = ({ jobs }: IProps) => {
    const navigate = useNavigate();
    const [applicationCounts, setApplicationCounts] = useState<Record<number | string, number>>({});

    useEffect(() => {
        if (jobs.length > 0) {
            fetchApplicationCounts();
        }
    }, [jobs]);

    const fetchApplicationCounts = async () => {
        try {
            const counts: Record<number | string, number> = {};
            const promises = jobs.map(job => {
                const jobId = job.id;
                if (jobId) {
                    return callGetJobApplicationsCount(jobId)
                        .then(res => {
                            if (res?.data?.data?.totalApplications !== undefined) {
                                counts[jobId] = res.data.data.totalApplications;
                            }
                        })
                        .catch(error => {
                            console.error(`Error fetching applications count for job ${jobId}:`, error);
                        });
                } else {
                    return Promise.resolve();
                }
            });
            await Promise.all(promises);
            setApplicationCounts(counts);
        } catch (error) {
            console.error("Error fetching application counts:", error);
        }
    };

    const handleViewDetailJob = (item: IJob) => {
        const slug = convertSlug(item.name);
        navigate(`/job/${slug}?id=${item.id}`);
    };

    return (
        <div className={cardStyles["card-container"]}>
            <div className={cardStyles["job-content"]}>
                <Row gutter={[20, 20]}>
                    {jobs.length > 0 ? (
                        jobs.map((job) => {
                            const jobId = job.id;
                            return (
                                <Col span={24} md={12} key={job.id}>
                                    <Card
                                        className={cardStyles["job-card"]}
                                        hoverable
                                        onClick={() => handleViewDetailJob(job)}
                                        size="default"
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
                                                        {jobId && applicationCounts[jobId] !== undefined
                                                            ? `${applicationCounts[jobId]} ứng viên`
                                                            : "Đang tải..."}
                                                    </div>
                                                </div>

                                                <div className={cardStyles["job-footer"]}>
                                                    <div className={cardStyles["company-name"]}>
                                                        <BankOutlined style={{ marginRight: 4 }} />
                                                        {job.company?.name}
                                                    </div>
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
                                    </Card>
                                </Col>
                            );
                        })
                    ) :
                        <Col span={24}>
                            <div className={cardStyles["empty-state"]}>
                                <Empty description="Không có công việc nào." />
                            </div>
                        </Col>
                    }
                </Row>
            </div>
        </div>
    );
};

export default CompanyJobCard;