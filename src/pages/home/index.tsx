import { Divider } from 'antd';
import styles from 'styles/client.module.scss';
import JobCard from '@/components/client/card/job.card';
import CompanyCard from '@/components/client/card/company.card';

const HomePage = () => {
    return (
        <div className={styles["container"]} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <Divider />
            <CompanyCard />
            <div style={{ flex: 1 }}></div> {/* Phần này giúp đẩy nội dung mở rộng */}
            <Divider />
            <JobCard showPagination={true} sortQuery="sort=createdAt,desc" />
        </div>
    );
};


export default HomePage;