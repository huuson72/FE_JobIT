import { Divider } from 'antd';
import styles from 'styles/client.module.scss';
import SearchClient from '@/components/client/search.client';
import JobCard from '@/components/client/card/job.card';
import CompanyCard from '@/components/client/card/company.card';

const HomePage = () => {
    return (
        <div className={styles["container"]} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div className="search-content" style={{ marginTop: 20 }}>
                <SearchClient />
            </div>
            <Divider />
            <CompanyCard />
            <div style={{ flex: 1 }}></div> {/* Phần này giúp đẩy nội dung mở rộng */}
            <Divider />
            <JobCard />
        </div>
    );
};


export default HomePage;