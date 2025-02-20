import { useLocation } from "react-router-dom";
import { useState, useEffect } from 'react';
import { ICompany, IJob } from "@/types/backend";
import { callFetchCompanyById, callFetchJobsByCompanyId } from "@/config/api";
import styles from 'styles/client.module.scss';
import parse from 'html-react-parser';
import { Col, Divider, Row, Skeleton } from "antd";
import { EnvironmentOutlined } from "@ant-design/icons";
import JobCard from "@/components/client/card/job.card";

const ClientCompanyDetailPage = () => {
    const [companyDetail, setCompanyDetail] = useState<ICompany | null>(null);
    const [jobs, setJobs] = useState<IJob[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    let location = useLocation();
    let params = new URLSearchParams(location.search);
    const id = params?.get("id"); // Lấy id công ty từ URL

    useEffect(() => {
        const fetchData = async () => {
            if (id) {
                setIsLoading(true);
                setCompanyDetail(null);
                setJobs([]); // ⚠️ Reset job list trước khi fetch

                try {
                    // Lấy thông tin công ty
                    const resCompany = await callFetchCompanyById(id);
                    if (resCompany?.data) {
                        setCompanyDetail(resCompany.data);
                    }

                    // Lấy danh sách công việc
                    const resJobs = await callFetchJobsByCompanyId(id);
                    if (resJobs?.data?.jobs) {
                        setJobs(resJobs.data.jobs);
                    } else {
                        setJobs([]); // Nếu không có job nào, reset về []
                    }
                } catch (error) {
                    console.error("Lỗi khi fetch dữ liệu:", error);
                }

                setIsLoading(false);
            }
        };

        fetchData();
    }, [id]);


    return (
        <div className={`${styles["container"]} ${styles["detail-job-section"]}`}>
            {isLoading ? (
                <Skeleton />
            ) : (
                <Row gutter={[20, 20]}>
                    {companyDetail && companyDetail.id && (
                        <>
                            {/* Thông tin công ty */}
                            <Col span={24} md={16}>
                                <div className={styles["header"]}>
                                    {companyDetail.name}
                                </div>

                                <div className={styles["location"]}>
                                    <EnvironmentOutlined style={{ color: '#58aaab' }} />&nbsp;
                                    {companyDetail?.address}
                                </div>

                                <Divider />
                                {parse(companyDetail?.description ?? "")}
                            </Col>

                            <Col span={24} md={8}>
                                <div className={styles["company"]}>
                                    <img
                                        width={200}
                                        alt="Company Logo"
                                        src={`${import.meta.env.VITE_BACKEND_URL}/storage/company/${companyDetail?.logo}`}
                                    />
                                    <div>{companyDetail?.name}</div>
                                </div>
                            </Col>

                            {/* Danh sách công việc */}
                            <Col span={24}>
                                <Divider />
                                <div className={styles["header"]}>Danh sách công việc</div>
                                {jobs.length > 0 ? (
                                    <Row gutter={[20, 20]}>
                                        {jobs.map((job) => (
                                            <Col span={24} md={12} key={job.id}>
                                                <JobCard jobs={jobs} />
                                            </Col>
                                        ))}
                                    </Row>
                                ) : (
                                    <div>Không có công việc nào.</div>
                                )}
                            </Col>
                        </>
                    )}
                </Row>
            )}
        </div>
    );
};

export default ClientCompanyDetailPage;
