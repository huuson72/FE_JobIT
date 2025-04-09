import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { callFetchUserFavourites } from "@/config/api";
import { IJob } from "@/types/backend";
import { Row, Col, Skeleton, message } from "antd";
import FavouriteJobCard from "@/components/client/card/favouritejobcard";

const FavouriteJobsPage = () => {
    const [favouriteJobs, setFavouriteJobs] = useState<IJob[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const userId = useSelector((state: any) => state.account.user.id);

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

    useEffect(() => {
        fetchFavourites();
    }, [userId]);

    const handleRemoveFromFavourites = () => {
        fetchFavourites(); // Tải lại danh sách sau khi xóa
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
                        <Col key={job.id} xs={24} sm={12} md={8} lg={6}>
                            <FavouriteJobCard
                                job={job}
                                onRemove={handleRemoveFromFavourites}
                            />
                        </Col>
                    ))}
                </Row>
            )}
        </div>
    );
};

export default FavouriteJobsPage;