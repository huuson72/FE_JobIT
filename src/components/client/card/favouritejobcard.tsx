import { Card } from "antd";
import { IJob } from "@/types/backend";
import { useNavigate } from "react-router-dom";
import styles from "@/styles/client.module.scss";
import { DollarOutlined, EnvironmentOutlined } from "@ant-design/icons";

interface Props {
    job: IJob;
}

const FavouriteJobCard = ({ job }: Props) => {
    const navigate = useNavigate(); // 🔥 Hook điều hướng

    const handleCardClick = () => {
        if (job.id) {
            navigate(`/job/${job.id}`); // 🔥 Chuyển hướng đến trang chi tiết công việc
        }
    };

    return (
        <Card
            hoverable
            onClick={handleCardClick}
            className={styles.card}
        >
            <div style={{ marginBottom: "10px" }}>
                <h3 style={{ color: "#1e90ff", fontSize: "18px", fontWeight: "bold" }}>{job.name}</h3>
                <p style={{ color: "#555", fontSize: "14px" }}><strong>{job.company?.name}</strong></p>
            </div>
            <div style={{ color: "#888", fontSize: "14px" }}>
                <p><DollarOutlined /> {job.salary?.toLocaleString()} đ</p>
                <p><EnvironmentOutlined /> {job.location}</p>
            </div>
        </Card>

    );
};

export default FavouriteJobCard;
