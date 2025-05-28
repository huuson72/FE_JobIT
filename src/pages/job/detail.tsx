import { useLocation, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useState, useEffect } from 'react';
import { IJob } from "@/types/backend";
import { callAddToFavourite, callFetchJobById, callRemoveFromFavourite } from "@/config/api";
import styles from 'styles/client.module.scss';
import parse from 'html-react-parser';
import { Col, Divider, Row, Skeleton, Tag } from "antd";
import { DollarOutlined, EnvironmentOutlined, HistoryOutlined, CalendarOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { getLocationName, calculateDaysFromNow } from "@/config/utils";
import dayjs from '@/config/dayjs';
import ApplyModal from "@/components/client/modal/apply.modal";
import { HeartOutlined, HeartFilled } from "@ant-design/icons";
import { message } from "antd";
import { useSelector } from "react-redux";
import { useFavorites } from "@/contexts/FavoriteContext";

const ClientJobDetailPage = (props: any) => {
    const [jobDetail, setJobDetail] = useState<IJob | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    let location = useLocation();
    let params = new URLSearchParams(location.search);
    const id = params?.get("id"); // job id
    const [isFavourite, setIsFavourite] = useState<boolean>(false);

    const userId = useSelector((state: any) => state.account.user?.id);
    const { isJobFavorited, toggleFavorite } = useFavorites();

    const handleToggleFavourite = async () => {
        if (!jobDetail || !jobDetail.id) {
            message.error("Lỗi: Không tìm thấy thông tin công việc!");
            return;
        }

        if (!userId) {
            message.error("Bạn cần đăng nhập để thực hiện thao tác này!");
            return;
        }

        try {
            if (isFavourite) {
                // Nếu đã yêu thích thì xóa khỏi danh sách
                const response = await callRemoveFromFavourite(Number(jobDetail.id), userId);
                if (response.success) {
                    message.success("Đã xóa khỏi danh sách yêu thích!");
                    setIsFavourite(false);
                    toggleFavorite(Number(jobDetail.id), false);
                } else {
                    message.error(response.message || "Có lỗi xảy ra khi xóa khỏi yêu thích!");
                }
            } else {
                // Nếu chưa yêu thích thì thêm vào danh sách
                const response = await callAddToFavourite(Number(jobDetail.id), userId);
                if (response.success) {
                    message.success("Đã thêm vào danh sách yêu thích!");
                    setIsFavourite(true);
                    toggleFavorite(Number(jobDetail.id), true);
                } else {
                    message.error(response.message || "Có lỗi xảy ra khi thêm vào yêu thích!");
                }
            }
        } catch (error) {
            console.error("Error toggling favourite:", error);
            message.error("Có lỗi xảy ra khi thực hiện thao tác!");
        }
    };

    useEffect(() => {
        const init = async () => {
            if (id) {
                setIsLoading(true);
                const res = await callFetchJobById(id);
                if (res?.data) {
                    setJobDetail(res.data);
                    // Check if job is in favorites using our context
                    setIsFavourite(isJobFavorited(Number(res.data.id)));
                }
                setIsLoading(false);
            }
        };
        init();
    }, [id, isJobFavorited]);

    return (
        <div className={`${styles["container"]} ${styles["detail-job-section"]}`}>
            {isLoading ?
                <Skeleton />
                :
                <Row gutter={[20, 20]}>
                    {jobDetail && jobDetail.id &&
                        <>
                            <Col span={24} md={16}>
                                <div className={styles["header"]}>
                                    {jobDetail.name}
                                </div>
                                {(() => {
                                    const now = dayjs();
                                    const endDate = dayjs(jobDetail.endDate);
                                    const isExpired = now.isAfter(endDate);

                                    return (
                                        <button
                                            onClick={() => setIsModalOpen(true)}
                                            className={`${styles["btn-apply"]} ${isExpired ? styles["btn-apply-disabled"] : ''}`}
                                            disabled={isExpired}
                                        >
                                            {isExpired ? 'Đã hết hạn nộp CV' : 'Apply Now'}
                                        </button>
                                    );
                                })()}
                                <div className={styles["extra-buttons-container"]}>
                                    <Link to="/favourites" className={styles["favourite-link"]}>
                                        ❤️ Công việc yêu thích
                                    </Link>
                                    <button
                                        onClick={handleToggleFavourite}
                                        className={`${styles["btn-favourite"]} ${isFavourite ? styles["favourite-active"] : styles["favourite-inactive"]}`}
                                    >
                                        {isFavourite ? <HeartFilled /> : <HeartOutlined />} &nbsp; {isFavourite ? 'Bỏ yêu thích' : 'Lưu vào yêu thích'}
                                    </button>
                                </div>

                                <Divider />
                                <div className={styles["skills"]}>
                                    {jobDetail?.skills?.map((item, index) => (
                                        <Tag key={`${index}-key`} color="gold" >
                                            {item.name}
                                        </Tag>
                                    ))}
                                </div>
                                <div className={styles["salary"]}>
                                    <DollarOutlined />
                                    <span>&nbsp;{(jobDetail.salary + "").replace(/\B(?=(\d{3})+(?!\d))/g, ',')} đ</span>
                                </div>
                                <div className={styles["location"]}>
                                    <EnvironmentOutlined style={{ color: '#58aaab' }} />&nbsp;{getLocationName(jobDetail.location)}
                                </div>
                                <div>
                                    <HistoryOutlined /> Cập nhật {jobDetail.updatedAt ?
                                        calculateDaysFromNow(jobDetail.updatedAt || '') :
                                        calculateDaysFromNow(jobDetail.createdAt || '')
                                    }
                                </div>
                                <div>
                                    <CalendarOutlined /> Ngày tạo: {dayjs(jobDetail.createdAt).format('DD/MM/YYYY')}
                                </div>
                                <div>
                                    <ClockCircleOutlined /> Hạn nộp: {dayjs(jobDetail.endDate).format('DD/MM/YYYY')}
                                </div>
                                <Divider />
                                {parse(jobDetail.description)}
                            </Col>

                            <Col span={24} md={8}>
                                <div className={styles["company"]}>
                                    <div>
                                        <img
                                            width={"200px"}
                                            alt="example"
                                            src={`${import.meta.env.VITE_BACKEND_URL}/storage/company/${jobDetail.company?.logo}`}
                                        />
                                    </div>
                                    <div>
                                        {jobDetail.company?.name}
                                    </div>
                                </div>
                            </Col>
                        </>
                    }
                </Row>
            }
            <ApplyModal
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                jobDetail={jobDetail}
            />
        </div>
    )
}

export default ClientJobDetailPage;
