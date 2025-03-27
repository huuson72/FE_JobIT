import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Result, Button, Spin, Card, Descriptions, Typography, Divider, Row, Col, Steps, Tag, Space, Input, Form, Alert } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, HomeOutlined, FileTextOutlined, CrownOutlined, DollarOutlined, SafetyOutlined, SyncOutlined } from '@ant-design/icons';
import styles from '@/styles/subscription.module.scss';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

// Format currency
const formatCurrency = (value: string) => {
    const numValue = parseInt(value, 10);
    if (isNaN(numValue)) return value;
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(numValue / 100);
};

// Format date from YYYYMMDDHHMMSS to DD/MM/YYYY HH:MM:SS
const formatDate = (dateString: string) => {
    if (!dateString || dateString.length !== 14) return dateString;

    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    const hour = dateString.substring(8, 10);
    const minute = dateString.substring(10, 12);
    const second = dateString.substring(12, 14);

    return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
};

const PaymentResultPage = () => {
    const [loading, setLoading] = useState<boolean>(true);
    const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [paymentDetails, setPaymentDetails] = useState<Record<string, string>>({});
    const [orderIdInput, setOrderIdInput] = useState<string>('');
    const [checkingStatus, setCheckingStatus] = useState<boolean>(false);
    const [noQueryParams, setNoQueryParams] = useState<boolean>(false);
    const [manualCheckDone, setManualCheckDone] = useState<boolean>(false);

    const navigate = useNavigate();
    const location = useLocation();

    // Hàm kiểm tra trạng thái thanh toán dựa vào orderId
    const checkPaymentStatus = async (orderId: string) => {
        try {
            setCheckingStatus(true);
            // Gọi API để kiểm tra trạng thái đơn hàng
            const response = await axios.get(`/api/v1/payments/status/${orderId}`);
            console.log("Payment status response:", response.data);

            if (response.data && response.data.data) {
                const transactionData = response.data.data;
                // Thiết lập trạng thái thanh toán dựa vào kết quả API
                setPaymentSuccess(transactionData.status === 'SUCCESS');

                // Chuyển đổi dữ liệu từ transaction sang định dạng params
                const formattedData: Record<string, string> = {
                    vnp_Amount: transactionData.amount?.toString() || '',
                    vnp_OrderInfo: transactionData.orderInfo || '',
                    vnp_PayDate: transactionData.paymentDate || '',
                    vnp_ResponseCode: transactionData.responseCode || '',
                    vnp_TransactionNo: transactionData.transactionNo || '',
                    vnp_TxnRef: transactionData.orderId || '',
                    vnp_BankCode: transactionData.bankCode || '',
                    vnp_CardType: transactionData.cardType || ''
                };

                setPaymentDetails(formattedData);
                setManualCheckDone(true);

                if (transactionData.status !== 'SUCCESS') {
                    setErrorMessage(`Giao dịch có trạng thái: ${transactionData.status}. ${transactionData.responseCode !== '00' ? 'Mã lỗi: ' + transactionData.responseCode : ''}`);
                }
            } else {
                setPaymentSuccess(false);
                setErrorMessage('Không tìm thấy thông tin giao dịch. Vui lòng kiểm tra lại mã đơn hàng.');
            }
        } catch (error) {
            console.error("Error checking payment status:", error);
            setPaymentSuccess(false);
            setErrorMessage('Không thể kiểm tra trạng thái giao dịch. Vui lòng thử lại sau.');
        } finally {
            setCheckingStatus(false);
            setLoading(false);
        }
    };

    // Thêm hàm checkLastTransaction để xử lý khi không có query params nhưng người dùng đã thanh toán xong
    const checkLastTransaction = async () => {
        try {
            setLoading(true);
            // Gọi API endpoint này sẽ trả về giao dịch gần nhất của người dùng
            const response = await axios.get('/api/v1/payments/last-transaction');
            console.log("Last transaction response:", response.data);

            if (response.data && response.data.data) {
                const transactionData = response.data.data;

                // Kiểm tra trạng thái thanh toán
                setPaymentSuccess(transactionData.status === 'SUCCESS');

                // Chuyển đổi dữ liệu từ transaction sang định dạng params
                const formattedData: Record<string, string> = {
                    vnp_Amount: transactionData.amount?.toString() || '',
                    vnp_OrderInfo: transactionData.orderInfo || '',
                    vnp_PayDate: transactionData.paymentDate || '',
                    vnp_ResponseCode: transactionData.responseCode || '',
                    vnp_TransactionNo: transactionData.transactionNo || '',
                    vnp_TxnRef: transactionData.orderId || '',
                    vnp_BankCode: transactionData.bankCode || '',
                    vnp_CardType: transactionData.cardType || ''
                };

                setPaymentDetails(formattedData);
                setManualCheckDone(true);

                if (transactionData.status !== 'SUCCESS') {
                    setErrorMessage(`Giao dịch có trạng thái: ${transactionData.status}. ${transactionData.responseCode !== '00' ? 'Mã lỗi: ' + transactionData.responseCode : ''}`);
                }
            } else {
                setPaymentSuccess(false);
                setErrorMessage('Không tìm thấy thông tin giao dịch gần đây. Vui lòng kiểm tra lại mã đơn hàng hoặc liên hệ hỗ trợ.');
            }
        } catch (error) {
            console.error("Error checking last transaction:", error);
            setPaymentSuccess(false);
            setErrorMessage('Không thể kiểm tra giao dịch gần đây. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Lấy thông tin từ query string
        const queryParams = new URLSearchParams(location.search);
        const vnp_ResponseCode = queryParams.get('vnp_ResponseCode');

        // Nếu không có query params, hiển thị form để nhập mã đơn hàng
        if (!vnp_ResponseCode && queryParams.entries().next().done) {
            setNoQueryParams(true);
            setLoading(false);
            return;
        }

        const params: Record<string, string> = {};
        queryParams.forEach((value, key) => {
            params[key] = value;
        });

        setPaymentDetails(params);

        // Kiểm tra trạng thái thanh toán
        const isSuccess = vnp_ResponseCode === '00';
        setPaymentSuccess(isSuccess);

        if (!isSuccess && vnp_ResponseCode) {
            let message = 'Thanh toán thất bại.';

            // Mã lỗi phổ biến của VNPay
            const errorCodes: Record<string, string> = {
                '01': 'Giao dịch đã tồn tại',
                '02': 'Merchant không hợp lệ',
                '03': 'Dữ liệu gửi sang không đúng định dạng',
                '04': 'Khởi tạo GD không thành công do Website đang bị tạm khóa',
                '05': 'Giao dịch không thành công do: Quý khách nhập sai mật khẩu thanh toán quá số lần quy định',
                '06': 'Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực',
                '07': 'Giao dịch bị nghi ngờ gian lận',
                '09': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa',
                '10': 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ không đúng quá 3 lần',
                '11': 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán',
                '12': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa',
                '24': 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
                '51': 'Giao dịch không thành công do: Tài khoản không đủ số dư',
                '65': 'Giao dịch không thành công do: Tài khoản vượt hạn mức giao dịch',
                '75': 'Ngân hàng thanh toán đang bảo trì',
                '99': 'Lỗi không xác định'
            };

            if (vnp_ResponseCode && errorCodes[vnp_ResponseCode]) {
                message += ` ${errorCodes[vnp_ResponseCode]}.`;
            }

            setErrorMessage(message);
        }

        setLoading(false);
    }, [location]);

    // Thêm tự động kiểm tra khi người dùng vào trang
    useEffect(() => {
        // Nếu không có query params và trang vừa mới load, tự động kiểm tra giao dịch gần nhất
        if (noQueryParams && !manualCheckDone) {
            // Tự động kiểm tra sau 1 giây để người dùng thấy UI trước
            const timer = setTimeout(() => {
                checkLastTransaction();
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [noQueryParams, manualCheckDone]);

    // Sửa phần Form để nhập mã đơn hàng khi không có query params
    const renderOrderIdForm = () => {
        return (
            <Card
                style={{
                    maxWidth: '500px',
                    margin: '0 auto 24px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
            >
                <Form
                    onFinish={() => checkPaymentStatus(orderIdInput)}
                    layout="vertical"
                >
                    <Title level={4} style={{ textAlign: 'center', marginBottom: '20px' }}>
                        Kiểm tra kết quả thanh toán
                    </Title>

                    <Alert
                        message="Không tìm thấy thông tin giao dịch tự động"
                        description="Bạn vừa thực hiện thanh toán qua VNPay? Hãy kiểm tra tự động giao dịch gần nhất hoặc nhập mã đơn hàng để kiểm tra."
                        type="info"
                        showIcon
                        style={{ marginBottom: '20px' }}
                    />

                    <Space style={{ width: '100%', marginBottom: '20px' }} direction="vertical">
                        <Button
                            type="primary"
                            onClick={checkLastTransaction}
                            size="large"
                            block
                            icon={<SyncOutlined />}
                            style={{ marginBottom: '8px' }}
                        >
                            Kiểm tra giao dịch gần nhất
                        </Button>

                        <Divider plain>hoặc nhập mã đơn hàng</Divider>
                    </Space>

                    <Form.Item
                        label="Mã đơn hàng"
                        name="orderId"
                        rules={[{ required: true, message: 'Vui lòng nhập mã đơn hàng!' }]}
                    >
                        <Input
                            placeholder="Nhập mã đơn hàng (VD: 1742964928849)"
                            value={orderIdInput}
                            onChange={(e) => setOrderIdInput(e.target.value)}
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="default"
                            htmlType="submit"
                            size="large"
                            block
                            loading={checkingStatus}
                        >
                            Kiểm tra theo mã đơn hàng
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        );
    };

    const renderOrderSummary = () => {
        if (!paymentDetails || Object.keys(paymentDetails).length === 0) return null;

        // Xác định thông tin hiển thị
        const orderInfo = paymentDetails['vnp_OrderInfo'] || 'Thanh toán gói VIP';
        const amount = paymentDetails['vnp_Amount'] ? formatCurrency(paymentDetails['vnp_Amount']) : 'N/A';
        const txnRef = paymentDetails['vnp_TxnRef'] || 'N/A';
        const payDate = paymentDetails['vnp_PayDate'] ? formatDate(paymentDetails['vnp_PayDate']) : 'N/A';
        const bankCode = paymentDetails['vnp_BankCode'] || 'N/A';
        const cardType = paymentDetails['vnp_CardType'] || 'N/A';

        return (
            <Card
                className={styles.orderSummaryCard}
                style={{
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                    marginBottom: '24px'
                }}
            >
                <Row gutter={[24, 24]}>
                    <Col xs={24} md={12}>
                        <div className={styles.summarySection}>
                            <Title level={4}>
                                <DollarOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                                Thông tin đơn hàng
                            </Title>
                            <Descriptions column={1} bordered size="small">
                                <Descriptions.Item label="Mã đơn hàng" labelStyle={{ fontWeight: 'bold' }}>
                                    <Text copyable>{txnRef}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Dịch vụ thanh toán" labelStyle={{ fontWeight: 'bold' }}>
                                    {orderInfo}
                                </Descriptions.Item>
                                <Descriptions.Item label="Số tiền" labelStyle={{ fontWeight: 'bold' }}>
                                    <Text strong style={{ color: '#f5222d', fontSize: '16px' }}>{amount}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Thời gian thanh toán" labelStyle={{ fontWeight: 'bold' }}>
                                    {payDate}
                                </Descriptions.Item>
                            </Descriptions>
                        </div>
                    </Col>
                    <Col xs={24} md={12}>
                        <div className={styles.summarySection}>
                            <Title level={4}>
                                <SafetyOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                                Thông tin thanh toán
                            </Title>
                            <Descriptions column={1} bordered size="small">
                                <Descriptions.Item label="Ngân hàng" labelStyle={{ fontWeight: 'bold' }}>
                                    {bankCode}
                                </Descriptions.Item>
                                <Descriptions.Item label="Loại thẻ" labelStyle={{ fontWeight: 'bold' }}>
                                    {cardType === 'ATM' ? 'Thẻ ATM nội địa' :
                                        cardType === 'CREDIT' ? 'Thẻ tín dụng/ghi nợ' : cardType}
                                </Descriptions.Item>
                                <Descriptions.Item label="Trạng thái" labelStyle={{ fontWeight: 'bold' }}>
                                    {paymentSuccess ? (
                                        <Tag color="success" style={{ fontSize: '14px' }}>
                                            <CheckCircleOutlined /> Thành công
                                        </Tag>
                                    ) : (
                                        <Tag color="error" style={{ fontSize: '14px' }}>
                                            <CloseCircleOutlined /> Thất bại
                                        </Tag>
                                    )}
                                </Descriptions.Item>
                                <Descriptions.Item label="Mã giao dịch VNPay" labelStyle={{ fontWeight: 'bold' }}>
                                    <Text copyable>{paymentDetails['vnp_TransactionNo'] || 'N/A'}</Text>
                                </Descriptions.Item>
                            </Descriptions>
                        </div>
                    </Col>
                </Row>
            </Card>
        );
    };

    // Hiển thị nút điều hướng với nhiều lựa chọn hơn
    const renderActionButtons = () => {
        if (paymentSuccess) {
            return (
                <Space size={16} wrap style={{ justifyContent: 'center', marginTop: '24px' }}>
                    <Button
                        type="primary"
                        size="large"
                        icon={<CrownOutlined />}
                        onClick={() => navigate('/subscription/my-packages')}
                        style={{
                            height: '48px',
                            minWidth: '200px',
                            borderRadius: '8px',
                            background: '#1890ff'
                        }}
                    >
                        Xem gói VIP của tôi
                    </Button>
                    <Button
                        type="primary"
                        size="large"
                        icon={<FileTextOutlined />}
                        onClick={() => navigate('/admin/job/upsert')}
                        style={{
                            height: '48px',
                            minWidth: '200px',
                            borderRadius: '8px',
                            background: '#52c41a'
                        }}
                    >
                        Đăng tin tuyển dụng
                    </Button>
                    <Button
                        size="large"
                        icon={<HomeOutlined />}
                        onClick={() => navigate('/')}
                        style={{
                            height: '48px',
                            minWidth: '200px',
                            borderRadius: '8px'
                        }}
                    >
                        Về trang chủ
                    </Button>
                </Space>
            );
        } else {
            return (
                <Space size={16} wrap style={{ justifyContent: 'center', marginTop: '24px' }}>
                    <Button
                        type="primary"
                        size="large"
                        danger
                        icon={<DollarOutlined />}
                        onClick={() => navigate('/subscription')}
                        style={{
                            height: '48px',
                            minWidth: '200px',
                            borderRadius: '8px'
                        }}
                    >
                        Thử thanh toán lại
                    </Button>
                    <Button
                        type="primary"
                        size="large"
                        icon={<HomeOutlined />}
                        onClick={() => navigate('/')}
                        style={{
                            height: '48px',
                            minWidth: '200px',
                            borderRadius: '8px',
                            background: '#1890ff'
                        }}
                    >
                        Về trang chủ
                    </Button>
                    <Button
                        size="large"
                        onClick={() => window.location.href = 'mailto:support@hsjob.com'}
                        style={{
                            height: '48px',
                            minWidth: '200px',
                            borderRadius: '8px'
                        }}
                    >
                        Liên hệ hỗ trợ
                    </Button>
                </Space>
            );
        }
    };

    const paymentSteps = [
        {
            title: 'Đặt hàng',
            status: 'finish',
            icon: <DollarOutlined />
        },
        {
            title: 'Thanh toán',
            status: paymentSuccess ? 'finish' : 'error',
            icon: paymentSuccess ? <CheckCircleOutlined /> : <CloseCircleOutlined />
        },
        {
            title: 'Kích hoạt',
            status: paymentSuccess ? 'finish' : 'wait',
            icon: <CrownOutlined />
        }
    ];

    // Thêm thông báo khi tự động kiểm tra
    const renderAutoCheckNotice = () => {
        if (loading && noQueryParams) {
            return (
                <Alert
                    message="Đang tự động kiểm tra giao dịch gần nhất của bạn..."
                    type="info"
                    showIcon
                    style={{ marginBottom: '20px', maxWidth: '500px', margin: '0 auto 20px' }}
                />
            );
        }
        return null;
    };

    // Render trạng thái kết quả
    const renderResultContent = () => {
        if (noQueryParams && !manualCheckDone) {
            return renderOrderIdForm();
        }

        return (
            <>
                <div className={styles.resultSection} style={{ textAlign: 'center', padding: '0 16px 32px' }}>
                    {paymentSuccess ? (
                        <Result
                            status="success"
                            icon={<CheckCircleOutlined style={{ color: '#52c41a', fontSize: '72px' }} />}
                            title={
                                <Title level={2} style={{ color: '#52c41a', margin: '16px 0' }}>
                                    Thanh toán thành công!
                                </Title>
                            }
                            subTitle={
                                <Paragraph style={{ fontSize: '16px', maxWidth: '600px', margin: '0 auto 20px' }}>
                                    Gói VIP của bạn đã được kích hoạt thành công. Bạn có thể bắt đầu sử dụng
                                    các tính năng cao cấp và đăng tin tuyển dụng ngay bây giờ.
                                </Paragraph>
                            }
                        />
                    ) : (
                        <Result
                            status="error"
                            icon={<CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: '72px' }} />}
                            title={
                                <Title level={2} style={{ color: '#ff4d4f', margin: '16px 0' }}>
                                    Thanh toán thất bại
                                </Title>
                            }
                            subTitle={
                                <Paragraph style={{ fontSize: '16px', maxWidth: '600px', margin: '0 auto 20px' }}>
                                    {errorMessage || "Đã xảy ra lỗi trong quá trình thanh toán. Vui lòng thử lại hoặc chọn phương thức thanh toán khác."}
                                </Paragraph>
                            }
                        />
                    )}
                </div>

                <Divider style={{ margin: '8px 0 24px' }} />

                {renderOrderSummary()}
                {renderActionButtons()}

                {/* Chi tiết kỹ thuật (chỉ hiển thị khi click vào) */}
                <Divider style={{ margin: '32px 0 16px' }}>
                    <Button type="link">Chi tiết kỹ thuật</Button>
                </Divider>

                <div style={{ marginBottom: '16px' }}>
                    <Card bordered={false} size="small" style={{ background: '#f9f9f9' }}>
                        <Descriptions
                            column={{ xxl: 3, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}
                            size="small"
                            bordered
                            title="Thông tin chi tiết giao dịch"
                        >
                            {Object.keys(paymentDetails).map(key => (
                                <Descriptions.Item key={key} label={key} labelStyle={{ fontWeight: 'bold' }}>
                                    <Text copyable>{paymentDetails[key]}</Text>
                                </Descriptions.Item>
                            ))}
                        </Descriptions>
                    </Card>
                </div>
            </>
        );
    };

    return (
        <div className={styles.paymentResultContainer} style={{ padding: '40px 16px' }}>
            {loading ? (
                <div className={styles.loadingContainer} style={{ textAlign: 'center', padding: '60px 0' }}>
                    <Spin size="large" />
                    <div style={{ marginTop: 16, fontSize: '16px' }}>
                        {noQueryParams
                            ? "Đang tự động kiểm tra giao dịch gần nhất của bạn..."
                            : "Đang xử lý kết quả thanh toán..."}
                    </div>
                </div>
            ) : (
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    {renderAutoCheckNotice()}
                    <Card
                        style={{
                            borderRadius: '12px',
                            overflow: 'hidden',
                            boxShadow: '0 6px 16px rgba(0, 0, 0, 0.12)'
                        }}
                    >
                        <div
                            style={{
                                padding: '24px 0',
                                borderRadius: '8px 8px 0 0',
                                marginBottom: '24px'
                            }}
                        >
                            <Steps
                                current={paymentSuccess ? 2 : 1}
                                status={paymentSuccess ? 'finish' : 'error'}
                                style={{ maxWidth: '800px', margin: '0 auto 20px' }}
                            >
                                {paymentSteps.map(step => (
                                    <Step
                                        key={step.title}
                                        title={step.title}
                                        status={step.status as any}
                                        icon={step.icon}
                                    />
                                ))}
                            </Steps>
                        </div>

                        {renderResultContent()}
                    </Card>
                </div>
            )}
        </div>
    );
};

export default PaymentResultPage; 