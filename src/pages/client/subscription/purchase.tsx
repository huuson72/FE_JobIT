import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { callGetPackageById, callPurchaseSubscription, callCreateVNPayPayment } from '@/config/api';
import { useAppSelector } from '@/redux/hooks';
import { ISubscriptionPackage } from '@/types/backend';
import {
    Card,
    Typography,
    Divider,
    Button,
    Steps,
    Radio,
    Form,
    Spin,
    Alert,
    Modal,
    Result,
    Space,
    Descriptions,
    notification
} from 'antd';
import {
    CreditCardOutlined,
    BankOutlined,
    WalletOutlined,
    ShoppingCartOutlined,
    CheckCircleOutlined,
    BankTwoTone,
    GlobalOutlined
} from '@ant-design/icons';
import styles from '@/styles/subscription.module.scss';

const { Title, Paragraph, Text } = Typography;

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const SubscriptionPurchasePage = () => {
    const { packageId } = useParams();
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [packageData, setPackageData] = useState<ISubscriptionPackage | null>(null);
    const [loading, setLoading] = useState(true);
    const [paymentMethod, setPaymentMethod] = useState('BANK_TRANSFER');
    const [form] = Form.useForm();
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);
    const [vnpayProcessing, setVnpayProcessing] = useState(false);

    const user = useAppSelector(state => state.account.user);

    useEffect(() => {
        const fetchPackageData = async () => {
            if (!packageId) {
                navigate('/subscription');
                return;
            }

            try {
                setLoading(true);
                const res = await callGetPackageById(Number(packageId));
                if (res && res.data) {
                    setPackageData(res.data);
                } else {
                    notification.error({
                        message: 'Lỗi',
                        description: 'Không thể tải thông tin gói VIP. Vui lòng thử lại sau.',
                    });
                    navigate('/subscription');
                }
            } catch (error) {
                console.error("Error fetching package:", error);
                notification.error({
                    message: 'Lỗi',
                    description: 'Không thể tải thông tin gói VIP. Vui lòng thử lại sau.',
                });
                navigate('/subscription');
            } finally {
                setLoading(false);
            }
        };

        fetchPackageData();
    }, [packageId, navigate]);

    const handlePaymentMethodChange = (e: any) => {
        setPaymentMethod(e.target.value);
    };

    const handleNext = () => {
        if (currentStep === 1) {
            form.validateFields().then(() => {
                setCurrentStep(currentStep + 1);
            });
        } else {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        setCurrentStep(currentStep - 1);
    };

    // Xử lý thanh toán thông thường
    const handlePurchase = async () => {
        if (!user || !user.id || !packageData) {
            notification.error({
                message: 'Lỗi',
                description: 'Vui lòng đăng nhập để tiếp tục.',
            });
            return;
        }

        // Type guard to check for company property and create a properly typed interface
        type UserWithCompany = typeof user & {
            company?: {
                id: number;
                name: string;
            }
        };

        const typedUser = user as UserWithCompany;

        if (!typedUser.company || !typedUser.company.id) {
            notification.error({
                message: 'Thiếu thông tin công ty',
                description: 'Bạn cần cập nhật thông tin công ty trước khi mua gói VIP.',
            });
            return;
        }

        try {
            setProcessing(true);
            const res = await callPurchaseSubscription({
                userId: Number(user.id),
                companyId: Number(typedUser.company.id),
                packageId: packageData.id,
                paymentMethod: paymentMethod
            });

            if (res && res.data) {
                setSuccess(true);
            } else {
                notification.error({
                    message: 'Lỗi',
                    description: 'Không thể hoàn tất giao dịch. Vui lòng thử lại sau.',
                });
            }
        } catch (error: any) {
            console.error("Error purchasing subscription:", error);
            notification.error({
                message: 'Lỗi',
                description: error.message || 'Không thể hoàn tất giao dịch. Vui lòng thử lại sau.',
            });
        } finally {
            setProcessing(false);
        }
    };

    // Xử lý thanh toán qua VNPay
    const handleVNPayPayment = async () => {
        if (!user || !user.id || !packageData) {
            notification.error({
                message: 'Lỗi',
                description: 'Vui lòng đăng nhập để tiếp tục.',
            });
            return;
        }

        // Type guard to check for company property
        type UserWithCompany = typeof user & {
            company?: {
                id: number;
                name: string;
            }
        };

        const typedUser = user as UserWithCompany;

        if (!typedUser.company || !typedUser.company.id) {
            notification.error({
                message: 'Thiếu thông tin công ty',
                description: 'Bạn cần cập nhật thông tin công ty trước khi mua gói VIP.',
            });
            return;
        }

        try {
            setVnpayProcessing(true);

            // Tạo đường dẫn callback
            const returnUrl = `${window.location.origin}/subscription/payment-result`;

            // Tạo thông tin đơn hàng
            const orderInfo = `Thanh toán gói VIP: ${packageData.name}`;

            const res = await callCreateVNPayPayment({
                userId: Number(user.id),
                companyId: Number(typedUser.company.id),
                packageId: packageData.id,
                amount: packageData.price * 100,
                orderInfo: orderInfo,
                returnUrl: returnUrl
            });

            if (res && res.data && res.data.paymentUrl) {
                // Chuyển hướng người dùng đến trang thanh toán VNPay
                window.location.href = res.data.paymentUrl;
            } else {
                notification.error({
                    message: 'Lỗi',
                    description: 'Không thể tạo liên kết thanh toán. Vui lòng thử lại sau.',
                });
                setVnpayProcessing(false);
            }
        } catch (error: any) {
            console.error("Error creating VNPay payment:", error);
            notification.error({
                message: 'Lỗi',
                description: error.message || 'Không thể tạo liên kết thanh toán. Vui lòng thử lại sau.',
            });
            setVnpayProcessing(false);
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                return (
                    <div className={styles.packageReview}>
                        <Title level={3}>Thông tin gói VIP</Title>
                        {packageData && (
                            <Card className={styles.summaryCard}>
                                <Descriptions title="Chi tiết gói" bordered column={1}>
                                    <Descriptions.Item label="Tên gói">{packageData.name}</Descriptions.Item>
                                    <Descriptions.Item label="Mô tả">{packageData.description}</Descriptions.Item>
                                    <Descriptions.Item label="Giá">{formatCurrency(packageData.price)}</Descriptions.Item>
                                    <Descriptions.Item label="Thời hạn">{packageData.durationDays} ngày</Descriptions.Item>
                                    <Descriptions.Item label="Số lượng tin đăng">{packageData.jobPostLimit} tin</Descriptions.Item>
                                    <Descriptions.Item label="Điểm thưởng">{packageData.rewardPoints} điểm</Descriptions.Item>
                                </Descriptions>
                                <div className={styles.packageSummary}>
                                    <div className={styles.totalAmount}>
                                        <Text strong>Tổng thanh toán:</Text>
                                        <Title level={3}>{formatCurrency(packageData.price)}</Title>
                                    </div>
                                </div>

                                {/* Nút thanh toán nhanh */}
                                <div style={{ marginTop: 24, textAlign: 'center' }}>
                                    <Divider>
                                        <Text strong>Thanh toán nhanh</Text>
                                    </Divider>
                                    <Button
                                        type="primary"
                                        size="large"
                                        icon={<GlobalOutlined />}
                                        loading={vnpayProcessing}
                                        onClick={handleVNPayPayment}
                                        style={{
                                            height: "54px",
                                            background: "#0A5896",
                                            margin: "16px 0",
                                            width: "100%",
                                            maxWidth: "280px"
                                        }}
                                    >
                                        <span style={{ marginLeft: 8 }}>Thanh toán ngay qua VNPay</span>
                                    </Button>
                                </div>
                            </Card>
                        )}
                    </div>
                );
            case 1:
                return (
                    <div className={styles.paymentMethod}>
                        <Title level={3}>Chọn phương thức thanh toán</Title>
                        <Form form={form} layout="vertical" requiredMark={false}>
                            <Form.Item
                                name="paymentMethod"
                                initialValue={paymentMethod}
                                rules={[{ required: true, message: 'Vui lòng chọn phương thức thanh toán' }]}
                            >
                                <Radio.Group onChange={handlePaymentMethodChange} value={paymentMethod}>
                                    <Space direction="vertical" style={{ width: '100%' }}>
                                        <Radio value="BANK_TRANSFER" className={styles.paymentOption}>
                                            <div className={styles.paymentOptionContent}>
                                                <BankOutlined className={styles.paymentIcon} />
                                                <div>
                                                    <Text strong>Chuyển khoản ngân hàng</Text>
                                                    <div>Chuyển khoản đến tài khoản ngân hàng của chúng tôi</div>
                                                </div>
                                            </div>
                                        </Radio>
                                        <Radio value="CREDIT_CARD" className={styles.paymentOption}>
                                            <div className={styles.paymentOptionContent}>
                                                <CreditCardOutlined className={styles.paymentIcon} />
                                                <div>
                                                    <Text strong>Thẻ tín dụng / Ghi nợ</Text>
                                                    <div>Thanh toán trực tuyến bằng thẻ Visa, MasterCard, JCB</div>
                                                </div>
                                            </div>
                                        </Radio>
                                        <Radio value="E_WALLET" className={styles.paymentOption}>
                                            <div className={styles.paymentOptionContent}>
                                                <WalletOutlined className={styles.paymentIcon} />
                                                <div>
                                                    <Text strong>Ví điện tử</Text>
                                                    <div>Thanh toán qua Momo, ZaloPay, VNPay</div>
                                                </div>
                                            </div>
                                        </Radio>
                                    </Space>
                                </Radio.Group>
                            </Form.Item>
                        </Form>

                        {paymentMethod === 'BANK_TRANSFER' && (
                            <Alert
                                type="info"
                                message="Thông tin chuyển khoản"
                                description={
                                    <div>
                                        <p>Số tài khoản: <strong>0123456789</strong></p>
                                        <p>Ngân hàng: <strong>Vietcombank</strong></p>
                                        <p>Chủ tài khoản: <strong>CÔNG TY HSJob</strong></p>
                                        <p>Nội dung: <strong>VIP_{user?.id}_{packageData?.id}</strong></p>
                                        <p>Sau khi chuyển khoản, vui lòng chụp màn hình và gửi về email: support@hsjob.com</p>
                                    </div>
                                }
                                showIcon
                            />
                        )}

                        {/* Nút thanh toán nhanh */}
                        <div style={{ marginTop: 24, textAlign: 'center' }}>
                            <Divider>
                                <Text strong>Hoặc thanh toán trực tiếp</Text>
                            </Divider>
                            <Button
                                type="primary"
                                size="large"
                                icon={<GlobalOutlined />}
                                loading={vnpayProcessing}
                                onClick={handleVNPayPayment}
                                style={{
                                    height: "54px",
                                    background: "#0A5896",
                                    margin: "16px 0",
                                    width: "100%",
                                    maxWidth: "280px"
                                }}
                            >
                                <span style={{ marginLeft: 8 }}>Thanh toán ngay qua VNPay</span>
                            </Button>
                            <div style={{ fontSize: '13px', color: 'rgba(0, 0, 0, 0.45)' }}>
                                Thanh toán ngay không cần xác nhận thêm
                            </div>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className={styles.confirmation}>
                        <Title level={3}>Xác nhận đăng ký</Title>
                        <Card className={styles.summaryCard}>
                            <Descriptions title="Thông tin đơn hàng" bordered>
                                <Descriptions.Item label="Gói VIP" span={3}>{packageData?.name}</Descriptions.Item>
                                <Descriptions.Item label="Thời hạn" span={3}>{packageData?.durationDays} ngày</Descriptions.Item>
                                <Descriptions.Item label="Phương thức thanh toán" span={3}>
                                    {paymentMethod === 'BANK_TRANSFER' && 'Chuyển khoản ngân hàng'}
                                    {paymentMethod === 'CREDIT_CARD' && 'Thẻ tín dụng / Ghi nợ'}
                                    {paymentMethod === 'E_WALLET' && 'Ví điện tử'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Tổng thanh toán" span={3}>
                                    <Title level={4} style={{ margin: 0 }}>
                                        {formatCurrency(packageData?.price || 0)}
                                    </Title>
                                </Descriptions.Item>
                            </Descriptions>

                            <Alert
                                message="Lưu ý"
                                description={
                                    <div>
                                        <p>Bằng việc nhấn nút thanh toán, bạn đồng ý với các điều khoản dịch vụ của chúng tôi.</p>
                                        <p>Đối với phương thức chuyển khoản ngân hàng, gói VIP sẽ được kích hoạt sau khi chúng tôi xác nhận thanh toán (trong vòng 24 giờ làm việc).</p>
                                    </div>
                                }
                                type="warning"
                                showIcon
                                style={{ marginTop: 16 }}
                            />

                            {/* Thay đổi giao diện phần nút thanh toán VNPay */}
                            <div className={styles.paymentActions} style={{ marginTop: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <Button
                                    type="primary"
                                    size="large"
                                    icon={<GlobalOutlined />}
                                    loading={vnpayProcessing}
                                    onClick={handleVNPayPayment}
                                    style={{
                                        height: "60px",
                                        background: "#0A5896",
                                        margin: "16px 0 24px",
                                        width: "100%",
                                        maxWidth: "320px",
                                        fontSize: "18px",
                                        boxShadow: "0 4px 12px rgba(10, 88, 150, 0.3)"
                                    }}
                                >
                                    <span style={{ marginLeft: 8 }}>Thanh toán qua VNPay</span>
                                </Button>
                                <Card
                                    style={{
                                        width: '100%',
                                        maxWidth: '320px',
                                        border: '1px solid #e8e8e8',
                                        marginBottom: '16px',
                                        borderRadius: '8px'
                                    }}
                                    bodyStyle={{ padding: '12px' }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <img
                                            src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-VNPAY-QR-1.png"
                                            alt="VNPay Logo"
                                            style={{ height: '40px', marginRight: '12px' }}
                                        />
                                        <div>
                                            <div style={{ fontWeight: 'bold' }}>Hỗ trợ thanh toán qua:</div>
                                            <div style={{ fontSize: '12px' }}>Thẻ ATM, Visa, MasterCard, JCB, QR Code</div>
                                        </div>
                                    </div>
                                </Card>

                                <Divider style={{ margin: '16px 0' }}>hoặc</Divider>

                                <Button
                                    type="default"
                                    onClick={handlePurchase}
                                    loading={processing}
                                    style={{ height: '44px', width: '100%', maxWidth: '320px' }}
                                >
                                    Thanh toán bằng phương thức khác
                                </Button>
                            </div>
                        </Card>
                    </div>
                );
            default:
                return null;
        }
    };

    if (success) {
        return (
            <div className={styles.subscriptionContainer}>
                <Result
                    status="success"
                    title="Đăng ký gói VIP thành công!"
                    subTitle={
                        paymentMethod === 'BANK_TRANSFER'
                            ? "Vui lòng hoàn tất thanh toán chuyển khoản theo hướng dẫn để kích hoạt gói VIP."
                            : "Gói VIP của bạn đã được kích hoạt thành công."
                    }
                    extra={[
                        <Button
                            type="primary"
                            key="console"
                            onClick={() => navigate('/subscription/my-packages')}
                        >
                            Xem gói VIP của tôi
                        </Button>,
                        <Button
                            key="job"
                            onClick={() => navigate('/admin/job/upsert')}
                        >
                            Đăng tin tuyển dụng ngay
                        </Button>,
                    ]}
                />
            </div>
        );
    }

    return (
        <div className={styles.subscriptionContainer}>
            <div className={styles.purchaseContainer}>
                <Card className={styles.purchaseCard}>
                    {loading ? (
                        <div className={styles.loadingContainer}>
                            <Spin size="large" />
                            <div style={{ marginTop: 16 }}>Đang tải thông tin gói VIP...</div>
                        </div>
                    ) : (
                        <>
                            <Steps
                                current={currentStep}
                                items={[
                                    {
                                        title: 'Thông tin gói',
                                        icon: <ShoppingCartOutlined />,
                                    },
                                    {
                                        title: 'Phương thức thanh toán',
                                        icon: <WalletOutlined />,
                                    },
                                    {
                                        title: 'Xác nhận',
                                        icon: <CheckCircleOutlined />,
                                    },
                                ]}
                                className={styles.steps}
                            />

                            <Divider />

                            <div className={styles.stepContent}>
                                {renderStepContent()}
                            </div>

                            <div className={styles.stepsAction}>
                                {currentStep > 0 && (
                                    <Button style={{ margin: '0 8px' }} onClick={handlePrevious}>
                                        Quay lại
                                    </Button>
                                )}
                                {currentStep < 2 ? (
                                    <Button type="primary" onClick={handleNext}>
                                        {currentStep === 0 ? 'Chọn phương thức thanh toán' : 'Tiếp tục để xác nhận'}
                                    </Button>
                                ) : null}
                            </div>
                        </>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default SubscriptionPurchasePage; 