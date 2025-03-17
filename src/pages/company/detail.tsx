import { useLocation } from "react-router-dom";
import { useState, useEffect } from 'react';
import { ICompany, IJob } from "@/types/backend";
import { callFetchCompanyById, callFetchJobsByCompanyId, callCreateReview, callFetchReviewsByCompany } from "@/config/api";
import styles from 'styles/client.module.scss';
import parse from 'html-react-parser';
import { Col, Divider, Row, Skeleton, Form, Input, Rate, Button, message } from "antd";
import { EnvironmentOutlined } from "@ant-design/icons";
import JobCard from "@/components/client/card/job.card";
import { IReview } from "@/types/backend";
import CompanyJobCard from "@/components/client/card/companyjobcard";

const { TextArea } = Input;

interface ReviewFormProps {
    companyId: string;
    onReviewSubmit: () => void;
}


// const ReviewForm = ({ companyId, onReviewSubmit }: ReviewFormProps) => {
//     const [form] = Form.useForm();

//     const onFinish = async (values: { content: string; rating: number; }) => {
//         try {
//             await callCreateReview(companyId, values.content, values.rating);
//             message.success("Đánh giá của bạn đã được gửi thành công!");
//             onReviewSubmit(); // Gọi lại hàm fetch reviews sau khi gửi thành công
//             form.resetFields();
//         } catch (error) {
//             message.error("Có lỗi xảy ra khi gửi đánh giá!");
//         }
//     };

//     return (
//         <Form form={form} onFinish={onFinish}>
//             <Form.Item name="rating" label="Đánh giá" rules={[{ required: true, message: 'Vui lòng chọn số sao!' }]}>
//                 <Rate />
//             </Form.Item>
//             <Form.Item name="content" label="Nội dung" rules={[{ required: true, message: 'Vui lòng nhập nội dung đánh giá!' }]}>
//                 <TextArea rows={4} />
//             </Form.Item>
//             <Form.Item>
//                 <Button type="primary" htmlType="submit">
//                     Gửi đánh giá
//                 </Button>
//             </Form.Item>
//         </Form>
//     );
// };
const ReviewForm = ({ companyId, onReviewSubmit }: ReviewFormProps) => {
    const [form] = Form.useForm();
    const token = localStorage.getItem("access_token"); // 🔥 Lấy token từ localStorage

    const onFinish = async (values: { content: string; rating: number; }) => {
        if (!token) {
            message.warning("Vui lòng đăng nhập để gửi đánh giá!"); // 🔥 Hiển thị thông báo
            return;
        }

        try {
            await callCreateReview(companyId, values.content, values.rating);
            message.success("Đánh giá của bạn đã được gửi thành công!");
            onReviewSubmit();
            form.resetFields();
        } catch (error) {
            message.error("Có lỗi xảy ra khi gửi đánh giá!");
        }
    };

    return (
        <Form form={form} onFinish={onFinish}>
            <Form.Item name="rating" label="Đánh giá" rules={[{ required: true, message: 'Vui lòng chọn số sao!' }]}>
                <Rate />
            </Form.Item>
            <Form.Item name="content" label="Nội dung" rules={[{ required: true, message: 'Vui lòng nhập nội dung đánh giá!' }]}>
                <TextArea rows={4} />
            </Form.Item>
            <Form.Item>
                <Button type="primary" htmlType="submit">
                    Gửi đánh giá
                </Button>
            </Form.Item>
        </Form>
    );
};


const ClientCompanyDetailPage = () => {
    const [companyDetail, setCompanyDetail] = useState<ICompany | null>(null);
    const [jobs, setJobs] = useState<IJob[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [reviews, setReviews] = useState<IReview[]>([]);

    let location = useLocation();
    let params = new URLSearchParams(location.search);
    const id = params?.get("id"); // Lấy id công ty từ URL

    const fetchReviews = async () => {
        if (id) {
            const resReviews = await callFetchReviewsByCompany(id);
            console.log("📌 Dữ liệu từ API trước khi setState:", resReviews);

            if (Array.isArray(resReviews)) {
                setReviews(resReviews); // ✅ Đảm bảo dữ liệu đúng kiểu trước khi cập nhật state
            } else {
                console.error("❌ Lỗi: API không trả về mảng reviews.");
                setReviews([]);
            }
        }
    };


    useEffect(() => {
        const fetchData = async () => {
            if (id) {
                setIsLoading(true);
                setCompanyDetail(null);
                setJobs([]);
                setReviews([]); // Reset review trước khi fetch

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
                    }



                    // Lấy danh sách review
                    await fetchReviews();
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
                                <CompanyJobCard jobs={jobs} /> {/* Sử dụng CompanyJobCard */}
                            </Col>

                            {/* Form gửi review */}
                            <Col span={24}>
                                <Divider />
                                <div className={styles["header"]}>Gửi đánh giá</div>
                                {id && <ReviewForm companyId={id} onReviewSubmit={fetchReviews} />}
                            </Col>


                            {/* Danh sách review */}
                            <Col span={24}>
                                <Divider />
                                <div className={styles["header"]}>Review </div>
                                {reviews.length > 0 ? (
                                    <Row gutter={[20, 20]}>
                                        {reviews.map((review) => (
                                            <Col span={24} key={review.id}>
                                                <div className={styles["review-card"]}>
                                                    <strong>{review.userName}</strong> - ⭐ {review.rating}/5
                                                    <p>{review.content}</p>
                                                </div>
                                            </Col>
                                        ))}
                                    </Row>
                                ) : (
                                    <div>Chưa có đánh giá nào.</div>
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