import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { callGetActiveSubscriptions, callGetUserSubscriptions, callGetActivePackages } from '@/config/api';
import { useAppSelector } from '@/redux/hooks';
import { IEmployerSubscription, ISubscriptionPackage } from '@/types/backend';
import {
    Card,
    Typography,
    Button,
    Table,
    Tag,
    Progress,
    Empty,
    Spin,
    Statistic,
    Row,
    Col,
    Alert,
    Divider,
    notification,
    Space,
    Descriptions,
    Badge
} from 'antd';
import {
    ClockCircleOutlined,
    FileAddOutlined,
    CrownOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    BankOutlined,
    DollarOutlined,
    ArrowUpOutlined,
    InfoCircleOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import styles from '@/styles/subscription.module.scss';

const { Title, Paragraph, Text } = Typography;

interface IUserSubscription {
    id: number;
    user: any;
    company: any;
    subscriptionPackage: ISubscriptionPackage;
    remainingPosts: number;
    startDate: string;
    endDate: string;
    status: string;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
};

const calculateDaysLeft = (endDateString: string) => {
    if (!endDateString) return 0;

    const endDate = new Date(endDateString);
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
};

const MyPackagesPage = () => {
    const [oldSubscriptions, setOldSubscriptions] = useState<IEmployerSubscription[]>([]);
    const [userSubscriptions, setUserSubscriptions] = useState<IUserSubscription[]>([]);
    const [availablePackages, setAvailablePackages] = useState<ISubscriptionPackage[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();

    const user = useAppSelector(state => state.account.user);

    useEffect(() => {
        const fetchData = async () => {
            if (!user || !user.id) {
                notification.error({
                    message: 'Lỗi',
                    description: 'Vui lòng đăng nhập để xem thông tin gói VIP.',
                });
                navigate('/login');
                return;
            }

            try {
                setLoading(true);

                const subscriptionsRes = await callGetUserSubscriptions(Number(user.id));

                if (subscriptionsRes && subscriptionsRes.data && subscriptionsRes.data.data) {
                    setUserSubscriptions(subscriptionsRes.data.data);
                }

                const packagesRes = await callGetActivePackages();
                if (packagesRes && packagesRes.data) {
                    let packagesList: ISubscriptionPackage[] = [];
                    if (Array.isArray(packagesRes.data)) {
                        packagesList = packagesRes.data;
                    } else if (typeof packagesRes.data === 'object' && packagesRes.data !== null && 'data' in packagesRes.data) {
                        packagesList = (packagesRes.data as any).data;
                    }

                    if (userSubscriptions.length > 0) {
                        const currentPackagePrice = userSubscriptions[0].subscriptionPackage.price;
                        const availablePackagesList = packagesList.filter(pkg => pkg.price > currentPackagePrice);
                        setAvailablePackages(availablePackagesList);
                    } else {
                        setAvailablePackages(packagesList);
                    }
                }

            } catch (error) {
                console.error("Error fetching subscription data:", error);
                notification.error({
                    message: 'Lỗi',
                    description: 'Không thể tải thông tin gói VIP. Vui lòng thử lại sau.',
                });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, navigate]);

    const canUpgradeToPackage = (packagePrice: number) => {
        if (!userSubscriptions || userSubscriptions.length === 0) return true;
        return packagePrice > userSubscriptions[0].subscriptionPackage.price;
    };

    const renderSubscriptionDetails = () => {
        if (!userSubscriptions || userSubscriptions.length === 0) {
            return (
                <Empty
                    description="Bạn chưa đăng ký gói VIP nào"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                >
                    <Button
                        type="primary"
                        onClick={() => navigate('/subscription')}
                        icon={<CrownOutlined />}
                    >
                        Đăng ký gói VIP ngay
                    </Button>
                </Empty>
            );
        }

        return userSubscriptions.map((subscription, index) => {
            const daysLeft = calculateDaysLeft(subscription.endDate);
            const totalDays = subscription.subscriptionPackage.durationDays;
            const percentLeft = Math.round((daysLeft / totalDays) * 100);

            return (
                <Card
                    key={subscription.id}
                    className={styles.subscriptionCard}
                    style={{
                        marginBottom: '24px',
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                        background: 'linear-gradient(to right, #fff, #f0f7ff)'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <div>
                            <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
                                {subscription.subscriptionPackage.name}
                                <Tag color="gold" style={{ marginLeft: 12 }}>
                                    VIP
                                </Tag>
                            </Title>
                        </div>
                        <div>
                            <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
                                {formatCurrency(subscription.subscriptionPackage.price)}
                            </Text>
                        </div>
                    </div>

                    <Paragraph>
                        {subscription.subscriptionPackage.description}
                    </Paragraph>

                    <Divider style={{ margin: '12px 0' }} />

                    <Row gutter={[24, 24]}>
                        <Col xs={24} md={8}>
                            <Statistic
                                title="Ngày bắt đầu"
                                value={formatDate(subscription.startDate)}
                                prefix={<CalendarOutlined style={{ color: '#52c41a' }} />}
                            />
                        </Col>

                        <Col xs={24} md={8}>
                            <Statistic
                                title="Ngày hết hạn"
                                value={formatDate(subscription.endDate)}
                                prefix={<CalendarOutlined style={{ color: '#faad14' }} />}
                            />
                        </Col>

                        <Col xs={24} md={8}>
                            <Statistic
                                title="Tin tuyển dụng còn lại"
                                value={subscription.remainingPosts}
                                suffix={`/${subscription.subscriptionPackage.jobPostLimit}`}
                                prefix={<FileAddOutlined style={{ color: '#1890ff' }} />}
                            />
                        </Col>
                    </Row>

                    <div style={{ marginTop: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <Text>Thời gian còn lại</Text>
                            <Text strong>{daysLeft} ngày</Text>
                        </div>
                        <Progress
                            percent={percentLeft}
                            status="active"
                            strokeColor={{
                                '0%': '#108ee9',
                                '100%': '#87d068',
                            }}
                        />
                    </div>

                    <Divider style={{ margin: '16px 0' }} />

                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 18, marginRight: 8 }} />
                                <Text>{subscription.subscriptionPackage.isHighlighted ? "Tin tuyển dụng nổi bật" : "Tin tuyển dụng thường"}</Text>
                            </div>
                        </Col>
                        <Col xs={24} sm={12}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 18, marginRight: 8 }} />
                                <Text>{subscription.subscriptionPackage.isPrioritized ? "Được ưu tiên hiển thị" : "Hiển thị thường"}</Text>
                            </div>
                        </Col>
                    </Row>

                    <Divider style={{ margin: '16px 0' }} />

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                        <Button
                            type="primary"
                            icon={<FileAddOutlined />}
                            onClick={() => navigate('/admin/job/upsert')}
                            disabled={subscription.remainingPosts <= 0}
                        >
                            Đăng tin tuyển dụng
                        </Button>
                        {availablePackages.length > 0 && (
                            <Button
                                icon={<CrownOutlined />}
                                onClick={() => navigate('/subscription')}
                                type="primary"
                            >
                                Nâng cấp gói VIP
                            </Button>
                        )}
                    </div>

                    {subscription.remainingPosts <= 0 && (
                        <Alert
                            message="Cảnh báo"
                            description="Bạn đã sử dụng hết số lượng tin đăng trong gói này. Vui lòng nâng cấp gói VIP để tiếp tục đăng tin."
                            type="warning"
                            showIcon
                            style={{ marginTop: 16 }}
                        />
                    )}

                    {daysLeft <= 5 && (
                        <Alert
                            message="Sắp hết hạn"
                            description={`Gói VIP của bạn sẽ hết hạn trong ${daysLeft} ngày. Vui lòng gia hạn để tiếp tục sử dụng dịch vụ.`}
                            type="warning"
                            showIcon
                            style={{ marginTop: daysLeft === 0 ? 0 : 16 }}
                        />
                    )}
                </Card>
            );
        });
    };

    return (
        <div className={styles.myPackagesContainer} style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <Title level={2} style={{ margin: 0 }}>
                    <CrownOutlined style={{ color: '#FFD700', marginRight: 12 }} />
                    Gói VIP của tôi
                </Title>
                {availablePackages.length > 0 && (
                    <Button
                        type="primary"
                        onClick={() => navigate('/subscription')}
                        icon={<CrownOutlined />}
                        size="large"
                    >
                        Nâng cấp gói VIP
                    </Button>
                )}
            </div>

            <Divider />

            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                    <Spin size="large" />
                    <div style={{ marginTop: 16 }}>Đang tải thông tin gói VIP...</div>
                </div>
            ) : (
                renderSubscriptionDetails()
            )}
        </div>
    );
};

export default MyPackagesPage; 