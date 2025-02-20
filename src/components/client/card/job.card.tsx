import { callFetchJob } from '@/config/api';
import { convertSlug, getLocationName } from '@/config/utils';
import { IJob } from '@/types/backend';
import { EnvironmentOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { Card, Col, Empty, Pagination, Row, Spin } from 'antd';
import { useState, useEffect } from 'react';
import { isMobile } from 'react-device-detect';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import styles from 'styles/client.module.scss';
import { sfIn } from 'spring-filter-query-builder';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

interface IProps {
    showPagination?: boolean;
    jobs?: IJob[]; // Nhận danh sách công việc từ bên ngoài
}

const JobCard = ({ showPagination = false, jobs }: IProps) => {
    const [displayJob, setDisplayJob] = useState<IJob[]>(jobs || []);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(6);
    const [total, setTotal] = useState(0);
    const [filter, setFilter] = useState("");
    const [sortQuery, setSortQuery] = useState("sort=updatedAt,desc");
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const location = useLocation();

    useEffect(() => {
        if (!jobs) fetchJob();
    }, [current, pageSize, filter, sortQuery, location]);

    const fetchJob = async () => {
        setIsLoading(true);
        let query = `page=${current}&size=${pageSize}`;
        if (filter) query += `&${filter}`;
        if (sortQuery) query += `&${sortQuery}`;

        const queryLocation = searchParams.get("location");
        const querySkills = searchParams.get("skills");
        if (queryLocation || querySkills) {
            let q = "";
            if (queryLocation) q = sfIn("location", queryLocation.split(",")).toString();
            if (querySkills) q += queryLocation ? ` and ${sfIn("skills", querySkills.split(","))}` : sfIn("skills", querySkills.split(",")).toString();
            query += `&filter=${encodeURIComponent(q)}`;
        }

        const res = await callFetchJob(query);
        if (res?.data) {
            setDisplayJob(res.data.result);
            setTotal(res.data.meta.total);
        }
        setIsLoading(false);
    };

    const handleOnChangePage = (page: number, size: number) => {
        setCurrent(page);
        setPageSize(size);
    };

    const handleViewDetailJob = (item: IJob) => {
        const slug = convertSlug(item.name);
        navigate(`/job/${slug}?id=${item.id}`);
    };

    return (
        <div className={styles["card-job-section"]}>
            <div className={styles["job-content"]}>
                <Spin spinning={isLoading} tip="Loading...">
                    <Row gutter={[20, 20]}>
                        <Col span={24}>
                            <div className={isMobile ? styles["dflex-mobile"] : styles["dflex-pc"]}>
                                <span className={styles["title"]} style={{ fontWeight: "bold", fontSize: "1.2rem" }}>Việc làm mới</span>
                                {!showPagination && <Link to="job">Xem tất cả</Link>}
                            </div>
                        </Col>

                        {displayJob.length > 0 ? (
                            displayJob.map((item) => (
                                <Col span={24} md={12} key={item.id}>
                                    <Card size="small" hoverable onClick={() => handleViewDetailJob(item)}>
                                        <div className={styles["card-job-content"]}>
                                            <div className={styles["card-job-left"]}>
                                                <img
                                                    alt="company logo"
                                                    src={`${import.meta.env.VITE_BACKEND_URL}/storage/company/${item.company?.logo}`}
                                                />
                                            </div>
                                            <div className={styles["card-job-right"]}>
                                                <div className={styles["job-title"]}>{item.name}</div>
                                                <div className={styles["job-location"]}>
                                                    <EnvironmentOutlined style={{ color: '#58aaab' }} /> {getLocationName(item.location)}
                                                </div>
                                                <div>
                                                    <ThunderboltOutlined style={{ color: 'orange' }} /> {(item.salary || 0).toLocaleString()} đ
                                                </div>
                                                <div className={styles["job-updatedAt"]}>
                                                    {dayjs(item.updatedAt || item.createdAt).locale('en').fromNow()}
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </Col>
                            ))
                        ) : (
                            !isLoading && <Empty description="Không có dữ liệu" className={styles["empty"]} />
                        )}
                    </Row>

                    {showPagination && (
                        <Row justify="center" style={{ marginTop: 30 }}>
                            <Pagination
                                current={current}
                                total={total}
                                pageSize={pageSize}
                                responsive
                                onChange={handleOnChangePage}
                            />
                        </Row>
                    )}
                </Spin>
            </div>
        </div>
    );
};

export default JobCard;
