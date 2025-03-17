import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { callFetchUserFavourites } from "@/config/api";
import { IJob } from "@/types/backend";
import { message, Row, Col, Skeleton, Button, Card } from "antd";
import { useNavigate } from "react-router-dom";
import { HeartFilled, EnvironmentOutlined, ThunderboltOutlined } from "@ant-design/icons";

const FavouriteJobsPage = () => {
    const [favouriteJobs, setFavouriteJobs] = useState<IJob[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const userId = useSelector((state: any) => state.account.user.id);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFavourites = async () => {
            if (!userId) {
                message.error("Bạn cần đăng nhập để xem danh sách yêu thích!");
                return;
            }
            setIsLoading(true);
            try {
                const res = await callFetchUserFavourites(userId);
                if (res?.data) {
                    setFavouriteJobs(res.data);
                }
            } catch (error) {
                message.error("Lỗi khi tải danh sách yêu thích!");
            } finally {
                setIsLoading(false);
            }
        };
        fetchFavourites();
    }, [userId]);

    const handleJobClick = (job: IJob) => {
        const jobSlug = job.name.replace(/\s+/g, "-").toLowerCase();
        navigate(`/job/${jobSlug}?id=${job.id}`);
    };

    return (
        <div style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
            <h2 style={{ color: '#000', textAlign: 'center', marginBottom: '20px', fontWeight: 'bold', fontSize: '24px' }}>
                Danh sách công việc yêu thích
            </h2>
            {isLoading ? (
                <Skeleton />
            ) : favouriteJobs.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#888', fontSize: '16px' }}>Bạn chưa có công việc yêu thích nào.</p>
            ) : (
                <Row gutter={[20, 20]}>
                    {favouriteJobs.map((job) => (
                        <Col
                            key={job.id}
                            xs={24} sm={12} md={8} lg={6}
                            onClick={() => handleJobClick(job)}
                            style={{ cursor: "pointer" }}
                        >
                            <Card
                                hoverable
                                style={{
                                    border: '1px solid #ddd',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                    boxShadow: '0 3px 8px rgba(0,0,0,0.1)',

                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <img
                                        alt="company logo"
                                        src={`${import.meta.env.VITE_BACKEND_URL}/storage/company/${job.company?.logo}`}
                                        style={{ height: '60px', width: '60px', objectFit: 'cover', borderRadius: '8px', marginRight: '10px' }}
                                    />
                                    <div>
                                        <h3 style={{ color: '#1e90ff', marginBottom: '7px', fontWeight: 'bold' }}>{job.name}</h3>
                                        <p style={{ color: '#555', fontSize: '16px' }}><strong>{job.company?.name}</strong></p>
                                        <p style={{ color: '#888', fontSize: '16px' }}>
                                            <EnvironmentOutlined style={{ color: '#58aaab' }} /> {job.location}
                                        </p>
                                        <p style={{ color: '#f39c12', fontSize: '14px' }}>
                                            <ThunderboltOutlined style={{ color: 'orange' }} /> {(job.salary || 0).toLocaleString()} đ
                                        </p>
                                    </div>
                                </div>
                                <Button type="primary" shape="round" icon={<HeartFilled />} size="small" style={{ marginTop: '10px', backgroundColor: '#ff4d4f', borderColor: '#ff4d4f', display: 'block', marginLeft: 'auto', marginRight: 'auto', textAlign: 'center' }}>
                                    Xem chi tiết
                                </Button>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )
            }
        </div >
    );
};

export default FavouriteJobsPage;