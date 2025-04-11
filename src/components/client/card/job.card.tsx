import { callFetchJob } from '@/config/api';
import { convertSlug, getLocationName } from '@/config/utils';
import { IJob } from '@/types/backend';
import { EnvironmentOutlined, ThunderboltOutlined, BankOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { Card, Col, Empty, Pagination, Row, Spin } from 'antd';
import { useState, useEffect } from 'react';
import { isMobile } from 'react-device-detect';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import styles from 'styles/client.module.scss';
import cardStyles from 'styles/card.module.scss';
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

        // Xây dựng query cơ bản
        let query = `page=${current}&size=${pageSize}`;
        if (filter) query += `&${filter}`;
        if (sortQuery) query += `&${sortQuery}`;

        // Lấy params từ URL
        const queryLocation = searchParams.get("location");
        const querySkills = searchParams.get("skills");
        const queryLevel = searchParams.get("level");
        const queryMinSalary = searchParams.get("minSalary"); // Thêm minSalary
        const queryMaxSalary = searchParams.get("maxSalary"); // Thêm maxSalary

        // Xây dựng mảng filter
        let q = [];
        if (queryLocation) q.push(sfIn("location", queryLocation.split(",")).toString());
        if (querySkills) q.push(sfIn("skills", querySkills.split(",")).toString());
        if (queryLevel) q.push(sfIn("level", queryLevel.split(",")).toString());

        // Thêm điều kiện lọc lương với minSalary và maxSalary
        if (queryMinSalary) q.push(`salary>=${queryMinSalary}`);
        if (queryMaxSalary) q.push(`salary<=${queryMaxSalary}`);

        // Gộp các filter lại bằng "and"
        if (q.length > 0) {
            query += `&filter=${encodeURIComponent(q.join(" and "))}`;
        }

        console.log("Final Query:", query); // Debug query cuối cùng

        try {
            const res = await callFetchJob(query);

            // Log dữ liệu API trả về
            console.log("API Response:", res?.data);

            if (res?.data) {
                setDisplayJob(res.data.result);
                setTotal(res.data.meta.total);
            }
        } catch (error) {
            console.error("Lỗi fetch job:", error);
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
        <div className={cardStyles["card-container"]}>
            <Spin spinning={isLoading} tip="Loading...">
                <div className={cardStyles["card-header"]}>
                    <h2 className={cardStyles["card-title"]}>Việc làm mới</h2>
                    {!showPagination && (
                        <Link to="job" className={cardStyles["view-all"]}>
                            Xem tất cả
                        </Link>
                    )}
                </div>

                <Row gutter={[20, 20]}>
                    {displayJob.length > 0 ? (
                        displayJob.map((item) => (
                            <Col span={24} md={12} key={item.id}>
                                <Card
                                    className={cardStyles["job-card"]}
                                    hoverable
                                    onClick={() => handleViewDetailJob(item)}
                                >
                                    <div className={cardStyles["job-card-content"]}>
                                        <div className={cardStyles["company-logo"]}>
                                            <img
                                                alt={`${item.company?.name || 'Company'} logo`}
                                                src={`${import.meta.env.VITE_BACKEND_URL}/storage/company/${item.company?.logo}`}
                                            />
                                        </div>
                                        <div className={cardStyles["job-details"]}>
                                            <h3 className={cardStyles["job-title"]}>{item.name}</h3>

                                            <div className={cardStyles["job-meta"]}>
                                                <div className={`${cardStyles["meta-item"]} ${cardStyles["location"]}`}>
                                                    <EnvironmentOutlined className={cardStyles["icon"]} />
                                                    {getLocationName(item.location)}
                                                </div>
                                                <div className={`${cardStyles["meta-item"]} ${cardStyles["salary"]}`}>
                                                    <ThunderboltOutlined className={cardStyles["icon"]} />
                                                    {(item.salary || 0).toLocaleString()} đ
                                                </div>
                                            </div>

                                            <div className={cardStyles["job-footer"]}>
                                                <div className={cardStyles["company-name"]}>
                                                    <BankOutlined style={{ marginRight: 4 }} />
                                                    {item.company?.name}
                                                </div>
                                                <div className={cardStyles["posted-time"]}>
                                                    <ClockCircleOutlined style={{ marginRight: 4 }} />
                                                    {dayjs(item.updatedAt || item.createdAt).locale('vi').fromNow()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </Col>
                        ))
                    ) : (
                        !isLoading && (
                            <Col span={24}>
                                <div className={cardStyles["empty-state"]}>
                                    <Empty description="Không có dữ liệu" />
                                </div>
                            </Col>
                        )
                    )}
                </Row>

                {showPagination && (
                    <div className={cardStyles["pagination-container"]}>
                        <Pagination
                            current={current}
                            total={total}
                            pageSize={pageSize}
                            responsive
                            onChange={handleOnChangePage}
                        />
                    </div>
                )}
            </Spin>
        </div>
    );
};

export default JobCard;
