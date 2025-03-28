import { Col, Row, Typography, Card, Button, Badge, Tag, Spin, Divider, Modal, Space } from 'antd';
import { useEffect, useState } from 'react';
import {
    callGetActivePackages,
    callCreateVNPayPayment,
    callGetUserSubscriptions,
    callGetActivePromotions,
    callGetPackagePriceWithDiscount
} from '@/config/api';
import { useNavigate } from 'react-router-dom';
import { ISubscriptionPackage, IPromotion } from '@/types/backend';
import { CrownOutlined, CheckCircleOutlined, DollarOutlined, ArrowUpOutlined } from '@ant-design/icons';
import styles from '@/styles/subscription.module.scss';
import { notification } from 'antd';
import { useAppSelector } from '@/redux/hooks';

const { Title, Paragraph, Text } = Typography;

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

// Tính số ngày còn lại
const calculateDaysLeft = (endDateString: string) => {
    if (!endDateString) return 0;

    const endDate = new Date(endDateString);
    const today = new Date();

    // Đặt thời gian về 00:00:00 để so sánh chỉ ngày
    today.setHours(0, 0, 0, 0);

    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
};

interface IPackageWithDiscount extends ISubscriptionPackage {
    discountInfo?: {
        promotionName: string;
        discountPercentage: number;
        originalPrice: number;
        finalPrice: number;
    }
}

const SubscriptionPage = () => {
    const [packages, setPackages] = useState<IPackageWithDiscount[]>([]);
    const [promotions, setPromotions] = useState<IPromotion[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [paymentProcessing, setPaymentProcessing] = useState<Record<string, boolean>>({});
    const [currentSubscription, setCurrentSubscription] = useState<any>(null);
    const navigate = useNavigate();

    // Lấy thông tin user từ redux store
    const user = useAppSelector(state => state.account.user);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Lấy danh sách gói VIP
                const packagesRes = await callGetActivePackages();
                if (packagesRes && packagesRes.data) {
                    let packagesList: ISubscriptionPackage[] = [];
                    if (Array.isArray(packagesRes.data)) {
                        packagesList = packagesRes.data as ISubscriptionPackage[];
                    } else if (typeof packagesRes.data === 'object' && packagesRes.data !== null && 'data' in packagesRes.data) {
                        packagesList = (packagesRes.data as any).data as ISubscriptionPackage[];
                    }
                    if (packagesList.length > 0) {
                        const sortedPackages = packagesList.sort((a, b) =>
                            (a.displayPriority || 999) - (b.displayPriority || 999)
                        );

                        // Fetch discount information for each package
                        const packagesWithDiscount = await Promise.all(
                            sortedPackages.map(async (pkg) => {
                                try {
                                    const discountRes = await callGetPackagePriceWithDiscount(pkg.id);
                                    console.log(`Discount response for package ${pkg.id}:`, discountRes);

                                    // Kiểm tra từng cấu trúc response có thể có
                                    if (discountRes?.data?.data?.data) {
                                        return {
                                            ...pkg,
                                            discountInfo: discountRes.data.data.data
                                        };
                                    } else if (discountRes?.data?.data) {
                                        return {
                                            ...pkg,
                                            discountInfo: discountRes.data.data
                                        };
                                    }
                                    return pkg;
                                } catch (error) {
                                    console.error(`Error fetching discount for package ${pkg.id}:`, error);
                                    return pkg;
                                }
                            })
                        );

                        console.log("Setting packages with discount info to state:", packagesWithDiscount);
                        setPackages(packagesWithDiscount);
                    }
                }

                // Lấy danh sách ưu đãi
                const promotionsRes = await callGetActivePromotions();
                if (promotionsRes && promotionsRes.data) {
                    let promotionsList: IPromotion[] = [];
                    if (Array.isArray(promotionsRes.data)) {
                        promotionsList = promotionsRes.data as IPromotion[];
                    } else if (typeof promotionsRes.data === 'object' && promotionsRes.data !== null && 'data' in promotionsRes.data) {
                        promotionsList = (promotionsRes.data as any).data as IPromotion[];
                    }
                    setPromotions(promotionsList);
                }

                // Lấy thông tin gói VIP hiện tại của user
                if (user && user.id) {
                    const subscriptionsRes = await callGetUserSubscriptions(Number(user.id));
                    if (subscriptionsRes && subscriptionsRes.data && subscriptionsRes.data.data) {
                        const activeSubscriptions = subscriptionsRes.data.data.filter((sub: any) => sub.status === 'ACTIVE');
                        if (activeSubscriptions.length > 0) {
                            setCurrentSubscription(activeSubscriptions[0]);
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const renderFeaturesList = (pkg: IPackageWithDiscount) => {
        const defaultFeatures = [
            `Đăng tối đa ${pkg.jobPostLimit} tin tuyển dụng`,
            `Thời hạn sử dụng ${pkg.durationDays} ngày`,
            `Tặng ${pkg.rewardPoints} điểm thưởng`
        ];

        const allFeatures = pkg.features ? [...defaultFeatures, ...pkg.features] : defaultFeatures;

        return (
            <ul className={styles.featuresList}>
                {allFeatures.map((feature, index) => (
                    <li key={index}>
                        <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                        {feature}
                    </li>
                ))}
            </ul>
        );
    };

    // Đảm bảo returnUrl sử dụng URL frontend đầy đủ
    const getFullReturnUrl = () => {
        return `${window.location.origin}/subscription/payment-result`;
    };

    const handleDirectVNPayPayment = async (packageId: number, packageName: string) => {
        console.log("handleDirectVNPayPayment called");

        if (!user || !user.id) {
            console.error("User not logged in");
            notification.error({
                message: 'Lỗi',
                description: 'Vui lòng đăng nhập để tiếp tục.',
            });
            navigate('/login');
            return;
        }

        const pkg = packages.find(p => p.id === packageId);
        if (!pkg) {
            notification.error({
                message: 'Lỗi',
                description: 'Không tìm thấy thông tin gói VIP.',
            });
            return;
        }

        const finalPrice = getDiscountedPrice(pkg);

        console.log("User information:", {
            userId: user.id,
            companyId: 1, // Hardcode company ID = 1
            packageId: packageId,
            packagePrice: finalPrice
        });

        setPaymentProcessing(prev => ({ ...prev, [packageId]: true }));
        notification.info({
            message: 'Đang xử lý',
            description: 'Đang tạo đơn hàng thanh toán...',
            duration: 2
        });

        const requestData = {
            packageId: packageId,
            userId: Number(user.id),
            companyId: 1, // Hardcode company ID = 1
            orderType: "billpayment",
            orderInfo: "Thanh toan goi VIP",
            amount: finalPrice, // Sử dụng giá sau giảm giá
            returnUrl: getFullReturnUrl()
        };

        console.log("VNPay request data:", requestData);

        try {
            const response = await callCreateVNPayPayment(requestData);
            console.log("VNPay API response:", response);

            // Extract paymentUrl - Sửa logic trích xuất URL
            let paymentUrl = null;

            // Nếu response chính là URL
            if (typeof response === 'string' && (response.startsWith('http') || response.includes('vnpay'))) {
                paymentUrl = response;
                console.log("✅ URL từ response string:", paymentUrl);
            }
            // Nếu response là object với paymentUrl
            else if (response && typeof response === 'object' && response.paymentUrl) {
                paymentUrl = response.paymentUrl;
                console.log("✅ URL từ response.paymentUrl:", paymentUrl);
            }
            // Nếu response có data.paymentUrl
            else if (response && response.data && typeof response.data === 'object' && response.data.paymentUrl) {
                paymentUrl = response.data.paymentUrl;
                console.log("✅ URL từ response.data.paymentUrl:", paymentUrl);
            }
            // Nếu response.data là URL trực tiếp
            else if (response && response.data && typeof response.data === 'string' &&
                (response.data.startsWith('http') || response.data.includes('vnpay'))) {
                paymentUrl = response.data;
                console.log("✅ URL từ response.data string:", paymentUrl);
            }
            // Nếu response là object nhưng không có định dạng chuẩn
            else if (response && typeof response === 'object') {
                // Log toàn bộ response để debug
                console.log("Đang tìm URL trong response object:", JSON.stringify(response));

                // Thử tìm bất kỳ trường nào có thể chứa URL
                for (const key in response) {
                    if (typeof response[key] === 'string' &&
                        (response[key].startsWith('http') || response[key].includes('vnpay'))) {
                        paymentUrl = response[key];
                        console.log(`✅ URL tìm thấy trong response.${key}:`, paymentUrl);
                        break;
                    }
                }
            }

            if (paymentUrl) {
                console.log("🚀 Redirecting to VNPay URL:", paymentUrl);

                // Mở URL VNPay trong tab mới
                setTimeout(() => {
                    try {
                        const newWindow = window.open(paymentUrl, '_blank');
                        if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
                            // Thử phương pháp chuyển hướng
                            window.location.href = paymentUrl;
                        }
                    } catch (error) {
                        console.error("Error opening new window:", error);
                        window.location.href = paymentUrl;
                    }

                    notification.success({
                        message: 'Thành công',
                        description: 'Đang chuyển hướng đến trang thanh toán VNPay. Vui lòng kiểm tra nếu bạn không thấy cửa sổ mới hiện ra.',
                    });
                }, 100); // Thêm setTimeout để đảm bảo React có thể render trước khi mở URL
            } else {
                console.error("❌ No payment URL in response:", response);
                notification.error({
                    message: 'Lỗi thanh toán',
                    description: 'Không thể tạo đường dẫn thanh toán. Vui lòng thử lại sau.',
                });
            }
        } catch (error) {
            console.error("Error calling VNPay API:", error);
            notification.error({
                message: 'Lỗi thanh toán',
                description: 'Đã xảy ra lỗi khi tạo đơn hàng. Vui lòng thử lại sau.',
            });
        } finally {
            setPaymentProcessing(prev => ({ ...prev, [packageId]: false }));
        }
    };

    // Hàm kiểm tra xem gói có thể nâng cấp không
    const canUpgradeToPackage = (packagePrice: number) => {
        if (!currentSubscription) return true; // Nếu chưa có gói nào thì có thể mua tất cả
        return packagePrice > currentSubscription.subscriptionPackage.price;
    };

    // Hàm kiểm tra xem gói có ưu đãi không
    const hasDiscount = (pkg: IPackageWithDiscount) => {
        return !!pkg.discountInfo;
    };

    // Hàm lấy giá sau giảm giá
    const getDiscountedPrice = (pkg: IPackageWithDiscount) => {
        return pkg.discountInfo ? pkg.discountInfo.finalPrice : pkg.price;
    };

    // Hàm lấy phần trăm giảm giá
    const getDiscountPercentage = (pkg: IPackageWithDiscount) => {
        return pkg.discountInfo ? pkg.discountInfo.discountPercentage : 0;
    };

    // Hàm kiểm tra xem gói có ưu đãi không
    const hasActivePromotion = (pkg: IPackageWithDiscount) => {
        return promotions.some(p => p.subscriptionPackageId === pkg.id && p.active);
    };

    // Hàm lấy ưu đãi của gói
    const getPackagePromotion = (pkg: IPackageWithDiscount) => {
        return promotions.find(p => p.subscriptionPackageId === pkg.id && p.active);
    };

    return (
        <div className={styles.subscriptionContainer}>
            <div className={styles.pageHeader}>
                <Title level={2}>Gói VIP</Title>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <Button
                        type="primary"
                        onClick={() => navigate('/subscription/my-packages')}
                        icon={<CrownOutlined />}
                        size="large"
                    >
                        Xem gói VIP của tôi
                    </Button>
                </div>
            </div>

            {currentSubscription && (
                <Card
                    style={{
                        marginBottom: '24px',
                        background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                        color: 'white'
                    }}
                >
                    <Row align="middle">
                        <Col xs={24} md={16}>
                            <Title level={4} style={{ color: 'white', margin: 0 }}>
                                Gói VIP hiện tại của bạn: {currentSubscription.subscriptionPackage.name}
                            </Title>
                            <Text style={{ color: 'white', opacity: 0.8 }}>
                                Còn {currentSubscription.remainingPosts} tin tuyển dụng và {calculateDaysLeft(currentSubscription.endDate)} ngày sử dụng
                            </Text>
                        </Col>
                        <Col xs={24} md={8} style={{ textAlign: 'right' }}>
                            <Button
                                type="primary"
                                ghost
                                onClick={() => navigate('/subscription/my-packages')}
                                icon={<ArrowUpOutlined style={{ fontSize: '16px', fontWeight: 'bold', color: '#ffffff' }} />}
                                disabled={!packages.some(pkg => pkg.price > currentSubscription.subscriptionPackage.price)}
                                style={{
                                    borderRadius: '6px',
                                    boxShadow: '0 2px 8px rgba(255, 255, 255, 0.2)',
                                    height: '40px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                {packages.some(pkg => pkg.price > currentSubscription.subscriptionPackage.price)
                                    ? <span style={{ color: '#ffffff', fontWeight: '600', fontSize: '15px', textTransform: 'uppercase' }}>Xem chi tiết gói VIP</span>
                                    : <span style={{ color: '#ffffff', fontWeight: '600', fontSize: '15px', textTransform: 'uppercase' }}>Không có gói nâng cấp</span>}
                            </Button>
                        </Col>
                    </Row>
                </Card>
            )}

            <div className={styles.heroSection}>
                <Title level={1}>Nâng cấp gói dịch vụ</Title>
                <Paragraph className={styles.heroText}>
                    Tiếp cận nhiều ứng viên hơn và tăng hiệu quả tuyển dụng với các gói VIP của chúng tôi
                </Paragraph>

                <div className={styles.heroCta}>
                    <Button
                        type="primary"
                        size="large"
                        className={styles.vnpayButton}
                        onClick={(e) => {
                            e.preventDefault();
                            if (packages && packages.length > 0) {
                                const firstPackage = packages.find(p => p.displayPriority === 1) || packages[0];
                                handleDirectVNPayPayment(firstPackage.id, firstPackage.name);
                            } else {
                                document.querySelector('.' + styles.packagesContainer)?.scrollIntoView({
                                    behavior: 'smooth',
                                    block: 'start'
                                });
                            }
                        }}
                        style={{
                            height: '60px',
                            fontSize: '22px',
                            fontWeight: 'bold',
                            padding: '0 40px',
                            background: '#1890ff',
                            boxShadow: '0 6px 16px rgba(24, 144, 255, 0.3)'
                        }}
                    >
                        NÂNG CẤP VIP NGAY
                    </Button>

                    {/* Thêm nút mở trực tiếp tab mới VNPay */}


                    <div style={{ marginTop: '20px' }}>
                        <Button
                            type="default"
                            size="large"
                            onClick={(e) => {
                                e.preventDefault(); // Ngăn chặn hành vi mặc định
                                document.querySelector('.' + styles.packagesContainer)?.scrollIntoView({
                                    behavior: 'smooth',
                                    block: 'start'
                                });
                            }}
                            style={{
                                height: '48px',
                                fontSize: '16px',
                                padding: '0 30px',
                            }}
                        >
                            Xem các gói dịch vụ
                        </Button>
                    </div>
                </div>
            </div>

            <Divider />

            <div className={styles.benefitsSection}>
                <Title level={2}>Lợi ích khi nâng cấp tài khoản VIP</Title>
                <Row gutter={[24, 24]} className={styles.benefitsRow}>
                    <Col xs={24} sm={12} md={8}>
                        <Card className={styles.benefitCard}>
                            <DollarOutlined className={styles.benefitIcon} />
                            <Title level={4}>Tiết kiệm chi phí</Title>
                            <Paragraph>Tiết kiệm đến 40% chi phí tuyển dụng so với các phương thức quảng cáo truyền thống</Paragraph>
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <Card className={styles.benefitCard}>
                            <CrownOutlined className={styles.benefitIcon} />
                            <Title level={4}>Ưu tiên hiển thị</Title>
                            <Paragraph>Tin tuyển dụng của bạn sẽ được ưu tiên hiển thị trên đầu kết quả tìm kiếm</Paragraph>
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <Card className={styles.benefitCard}>
                            <CheckCircleOutlined className={styles.benefitIcon} />
                            <Title level={4}>Đăng nhiều tin hơn</Title>
                            <Paragraph>Tăng số lượng tin đăng tối đa và tiếp cận nhiều ứng viên tiềm năng hơn</Paragraph>
                        </Card>
                    </Col>
                </Row>

                <div style={{ textAlign: 'center', marginTop: '40px' }}>
                    <Button
                        type="primary"
                        size="large"
                        danger
                        className={styles.vnpayButton}
                        onClick={(e) => {
                            e.preventDefault(); // Ngăn chặn hành vi mặc định
                            if (packages && packages.length > 0) {
                                // Nếu có gói, chọn gói đầu tiên (thường là gói phổ biến nhất)
                                const firstPackage = packages.find(p => p.displayPriority === 1) || packages[0];
                                handleDirectVNPayPayment(firstPackage.id, firstPackage.name);
                            }
                        }}
                        style={{
                            height: '54px',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            padding: '0 40px',
                            background: '#0A5896',
                            boxShadow: '0 4px 12px rgba(10, 88, 150, 0.2)'
                        }}
                        icon={<CrownOutlined />}
                    >
                        Nâng cấp ngay qua VNPay
                    </Button>
                </div>
            </div>

            <Divider />

            {loading ? (
                <div className={styles.loadingContainer}>
                    <Spin size="large" />
                </div>
            ) : (
                <>
                    <div style={{ textAlign: 'center', margin: '20px 0 40px' }}>
                        <Card
                            style={{
                                maxWidth: '600px',
                                margin: '0 auto',
                                borderRadius: '8px',
                                borderColor: '#0A5896'
                            }}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <Title level={4} style={{ margin: '0 0 16px' }}>Mua gói VIP phổ biến nhất</Title>
                                {packages && packages.length > 0 && (
                                    <>
                                        <div style={{ margin: '8px 0 16px', fontSize: '16px' }}>
                                            <Text strong>
                                                {packages.find(p => p.displayPriority === 1)?.name || packages[0].name} -
                                            </Text>{' '}
                                            <Text type="danger" style={{ fontSize: '18px', fontWeight: 'bold' }}>
                                                {formatCurrency(packages.find(p => p.displayPriority === 1)?.price || packages[0].price)}
                                            </Text>
                                        </div>
                                        <Button
                                            type="primary"
                                            size="large"
                                            className={styles.vnpayButton}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                const pack = packages.find(p => p.displayPriority === 1) || packages[0];
                                                handleDirectVNPayPayment(pack.id, pack.name);
                                            }}
                                            loading={paymentProcessing[packages.find(p => p.displayPriority === 1)?.id || packages[0].id]}
                                            disabled={currentSubscription &&
                                                (packages.find(p => p.displayPriority === 1)?.price || packages[0].price) <= currentSubscription.subscriptionPackage.price}
                                            style={{
                                                height: '50px',
                                                fontSize: '16px',
                                                background: '#0A5896',
                                                margin: '10px 0',
                                                color: '#ffffff',
                                                fontWeight: 'bold'
                                            }}
                                            icon={<CrownOutlined />}
                                        >
                                            {currentSubscription &&
                                                (packages.find(p => p.displayPriority === 1)?.price || packages[0].price) <= currentSubscription.subscriptionPackage.price
                                                ? "Bạn đã mua gói VIP này"
                                                : "Thanh toán qua VNPay"}
                                        </Button>
                                    </>
                                )}
                            </div>
                        </Card>
                    </div>

                    <Row gutter={[24, 24]} className={styles.packagesContainer}>
                        {packages.map((pkg) => (
                            <Col xs={24} sm={12} md={8} key={pkg.id}>
                                <Badge.Ribbon
                                    text={pkg.displayPriority === 1 ? "Phổ biến nhất" : ""}
                                    color="gold"
                                    style={{ display: pkg.displayPriority === 1 ? 'block' : 'none' }}
                                >
                                    <Card
                                        className={`${styles.packageCard} ${pkg.displayPriority === 1 ? styles.popularPackage : ''}`}
                                        title={
                                            <div className={styles.packageHeader}>
                                                <Title level={3}>{pkg.name}</Title>
                                                <Tag color={pkg.displayPriority === 1 ? 'gold' : 'blue'}>
                                                    {pkg.displayPriority === 1 ? 'Ưu đãi tốt nhất' : 'Tiêu chuẩn'}
                                                </Tag>
                                            </div>
                                        }
                                    >
                                        <div className={styles.packagePrice}>
                                            {hasDiscount(pkg) ? (
                                                <Space direction="vertical" style={{ width: '100%' }}>
                                                    <span style={{ textDecoration: 'line-through', color: '#999' }}>
                                                        {formatCurrency(pkg.price)}
                                                    </span>
                                                    <Title level={2} style={{ color: '#f5222d', margin: 0 }}>
                                                        {formatCurrency(getDiscountedPrice(pkg))}
                                                    </Title>
                                                    <Tag color="red">-{getDiscountPercentage(pkg)}%</Tag>
                                                </Space>
                                            ) : (
                                                <>
                                                    <Title level={2}>{formatCurrency(pkg.price)}</Title>
                                                    <Text type="secondary">/ {pkg.durationDays} ngày</Text>
                                                </>
                                            )}
                                        </div>

                                        <Paragraph className={styles.packageDescription}>
                                            {pkg.description}
                                        </Paragraph>

                                        {renderFeaturesList(pkg)}

                                        <Button
                                            type="primary"
                                            block
                                            size="large"
                                            className={`${styles.subscribeButton} ${styles.vnpayButton}`}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleDirectVNPayPayment(pkg.id, pkg.name);
                                            }}
                                            loading={paymentProcessing[pkg.id]}
                                            disabled={!canUpgradeToPackage(pkg.price)}
                                            style={{
                                                height: "56px",
                                                fontSize: "18px",
                                                fontWeight: "bold",
                                                marginTop: "16px",
                                                background: pkg.displayPriority === 1 ? "#f5a623" : "#1890ff",
                                                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)"
                                            }}
                                        >
                                            {!canUpgradeToPackage(pkg.price)
                                                ? "Bạn đã mua gói VIP này"
                                                : (currentSubscription ? "Nâng cấp gói VIP" : "Thanh Toán Qua VNPay")}
                                        </Button>
                                    </Card>
                                </Badge.Ribbon>
                            </Col>
                        ))}
                    </Row>
                </>
            )}
        </div>
    );
};

export default SubscriptionPage; 