import { callFetchJob, callGetJobApplicationsCount } from '@/config/api';
import { convertSlug, getLocationName, calculateDaysFromNow } from '@/config/utils';
import { IJob } from '@/types/backend';
import { EnvironmentOutlined, ThunderboltOutlined, BankOutlined, ClockCircleOutlined, DollarOutlined, HistoryOutlined, CalendarOutlined, UserOutlined } from '@ant-design/icons';
import { Card, Col, Empty, Pagination, Row, Spin, Divider, Tag } from 'antd';
import { useState, useEffect } from 'react';
import { isMobile } from 'react-device-detect';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import styles from 'styles/client.module.scss';
import cardStyles from 'styles/card.module.scss';
import { sfIn } from 'spring-filter-query-builder';
import { JOB_STATUS } from '@/config/constants';

import dayjs from '@/config/dayjs';

interface IProps {
    showPagination?: boolean;
    jobs?: IJob[]; // Nhận danh sách công việc từ bên ngoài
    sortQuery?: string; // Thêm sortQuery vào interface
}

const JobCard = ({ showPagination = false, jobs, sortQuery = "sort=createdAt,desc" }: IProps) => {
    const [displayJob, setDisplayJob] = useState<IJob[]>(jobs || []);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [applicationCounts, setApplicationCounts] = useState<Record<number | string, number>>({});

    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(6);
    const [total, setTotal] = useState(0);
    const [filter, setFilter] = useState("");
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const location = useLocation();


    useEffect(() => {
        if (!jobs) fetchJob();
    }, [current, pageSize, filter, sortQuery, location]);

    useEffect(() => {
        if (displayJob.length > 0) {
            fetchApplicationCounts();
        }
    }, [displayJob]);

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
        const queryMinSalary = searchParams.get("minSalary");
        const queryMaxSalary = searchParams.get("maxSalary");

        // Xây dựng mảng filter
        let q = [];

        // Xử lý filter location
        if (queryLocation) {
            const locations = queryLocation.split(",");
            if (locations.includes("Others")) {
                // Nếu có chọn "Others", tìm các job không thuộc HANOI, HOCHIMINH, DANANG
                q.push(`location not in ('HANOI','HOCHIMINH','DANANG')`);
            } else {
                // Nếu không chọn "Others", tìm theo các location được chọn
                q.push(sfIn("location", locations).toString());
            }
        }

        if (querySkills) q.push(sfIn("skills", querySkills.split(",")).toString());
        if (queryLevel) q.push(sfIn("level", queryLevel.split(",")).toString());

        // Thêm điều kiện lọc lương với minSalary và maxSalary
        if (queryMinSalary) q.push(`salary>=${queryMinSalary}`);
        if (queryMaxSalary) q.push(`salary<=${queryMaxSalary}`);

        // Thêm điều kiện chỉ hiển thị job active
        q.push(`active:true`);

        // Gộp các filter lại bằng "and"
        if (q.length > 0) {
            query += `&filter=${encodeURIComponent(q.join(" and "))}`;
        }

        console.log("Final Query:", query); // Debug query cuối cùng

        try {
            const res = await callFetchJob(query);
            console.log("API Response:", res?.data); // Debug response

            if (res?.data) {
                setDisplayJob(res.data.result);
                setTotal(res.data.meta.total);
            }
        } catch (error) {
            console.error("Lỗi fetch job:", error);
        }

        setIsLoading(false);
    };

    const fetchApplicationCounts = async () => {
        try {
            const counts: Record<number | string, number> = {};

            // Create an array of promises for parallel fetching
            const promises = displayJob.map(job => {
                // Make sure job.id is a valid string or number
                const jobId = job.id;
                if (jobId) {
                    return callGetJobApplicationsCount(jobId)
                        .then(res => {
                            // Log the full response to debug
                            console.log(`Application count for job ${jobId}:`, res.data);

                            // Based on the log, the API response has a single nesting:
                            // { statusCode, error, message, data: { jobId, jobName, totalApplications, cvCount, resumeCount } }
                            if (res?.data?.data?.totalApplications !== undefined) {
                                // Direct access to the totalApplications field
                                counts[jobId] = res.data.data.totalApplications;
                                console.log(`Job ${jobId} has ${res.data.data.totalApplications} applications`);
                            } else {
                                console.warn(`Missing application count data for job ${jobId}`, res.data);
                            }
                        })
                        .catch(error => {
                            console.error(`Error fetching applications count for job ${jobId}:`, error);
                        });
                }
                return Promise.resolve(); // Return resolved promise for jobs without id
            });

            // Wait for all promises to resolve
            await Promise.all(promises);

            // Update state with the counts
            setApplicationCounts(counts);
            console.log("Final application counts:", counts);
        } catch (error) {
            console.error("Error fetching application counts:", error);
        }
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
                        displayJob.map((item) => {
                            const jobId = item.id;
                            return (
                                <Col span={24} md={12} key={jobId}>
                                    <Card
                                        className={cardStyles["job-card"]}
                                        hoverable
                                        onClick={() => handleViewDetailJob(item)}
                                    >
                                        <div className={cardStyles["job-card-content"]}>
                                            {!item.active && <div className={styles["expired-tag"]}>Đã hết hạn</div>}
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
                                                        {item.company?.name}
                                                    </div>
                                                    <div className={cardStyles["posted-time"]}>
                                                        <ClockCircleOutlined style={{ marginRight: 4 }} />
                                                        {calculateDaysFromNow(item.updatedAt || item.createdAt || '')}
                                                    </div>
                                                    <div className={cardStyles["job-dates"]}>
                                                        <CalendarOutlined style={{ marginRight: 4 }} />
                                                        {dayjs(item.createdAt).format('DD/MM/YYYY')} - {dayjs(item.endDate).format('DD/MM/YYYY')}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </Col>
                            );
                        })
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
