import { Tabs } from 'antd';
import UpdateProfileForm from '@/components/client/profile/UpdateProfileForm';
import ChangePasswordForm from '@/components/client/profile/ChangePasswordForm';
import styles from '@/styles/profile.module.scss';

const ProfilePage = () => {
    const items = [
        {
            key: '1',
            label: 'Thông tin cá nhân',
            children: <UpdateProfileForm />,
        },
        {
            key: '2',
            label: 'Đổi mật khẩu',
            children: <ChangePasswordForm />,
        },
    ];

    return (
        <div className={styles.profileContainer}>
            <div className={styles.profileContent}>
                <h2>Quản lý tài khoản</h2>
                <Tabs defaultActiveKey="1" items={items} />
            </div>
        </div>
    );
};

export default ProfilePage; 