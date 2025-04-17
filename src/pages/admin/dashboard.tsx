import React, { useEffect, useState } from "react";
import { Card, Col, Row, Statistic, Spin, Alert, DatePicker, Button, Table, Tag, Tabs, notification } from "antd";
import {
    UserOutlined,
    BankOutlined,
    FileTextOutlined,
    RiseOutlined,
    DollarOutlined,
    ShoppingOutlined,
    BarChartOutlined,
    ReloadOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined
} from "@ant-design/icons";
import CountUp from 'react-countup';
import {
    callGetAllStatistics,
    callGetRevenueStatistics,
    callGetRevenueStatisticsByDateRange,
    RevenueStatisticsDTO,
    AdminStatisticsDTO
} from "@/config/api";
import { IBackendRes } from "@/types/backend";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line
} from 'recharts';
import { useNavigate, useLocation } from 'react-router-dom';
import dayjs from 'dayjs';
import { useAppSelector } from '@/redux/hooks';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

interface StatisticsData {
    totalUsers: number;
    totalCompanies: number;
    totalJobs: number;
    totalCVs: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#82ca9d', '#8884d8'];

const DashboardPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const user = useAppSelector(state => state.account.user);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statistics, setStatistics] = useState<StatisticsData>({
        totalUsers: 0,
        totalCompanies: 0,
        totalJobs: 0,
        totalCVs: 0
    });

    // Thêm state cho thống kê doanh thu
    const [revenueLoading, setRevenueLoading] = useState(true);
    const [revenueError, setRevenueError] = useState<string | null>(null);
    const [revenueStats, setRevenueStats] = useState<RevenueStatisticsDTO['data'] | null>(null);
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

    // Xử lý tab từ query param
    const queryParams = new URLSearchParams(location.search);
    const tabParam = queryParams.get('tab');
    const [activeTab, setActiveTab] = useState<string>(tabParam === 'revenue' ? "2" : "1");

    useEffect(() => {
        // Cập nhật activeTab khi query param thay đổi
        if (tabParam === 'revenue') {
            setActiveTab("2");
            fetchRevenueStatistics();
        } else {
            setActiveTab("1");
            fetchStatistics();
        }
    }, [location.search]);

    // Cập nhật URL khi tab thay đổi
    const handleTabChange = (key: string) => {
        setActiveTab(key);
        if (key === "2") {
            navigate('/admin/revenue', { replace: true });
        } else {
            navigate('/admin', { replace: true });
        }
    };

    const fetchStatistics = async () => {
        try {
            setLoading(true);
            const response: IBackendRes<AdminStatisticsDTO> = await callGetAllStatistics();
            console.log("Overview statistics full response:", response);

            if (response.data) {
                console.log("Overview Response.data:", response.data);
                // Check if response might have a nested data structure
                if (response.data && typeof response.data === 'object' && 'data' in response.data) {
                    // Handle the case where the API returns nested data
                    const nestedData = (response.data as any).data;
                    console.log("Nested overview data found:", nestedData);
                    setStatistics(nestedData);
                } else {
                    // Regular data structure
                    setStatistics(response.data);
                }
            } else {
                console.log("No data in overview response");
            }
        } catch (error: any) {
            setError(error.message || "Có lỗi xảy ra khi tải dữ liệu thống kê");
            console.error("Error fetching statistics:", error);
        } finally {
            setLoading(false);
        }
    };

    // Thêm hàm fetch doanh thu
    const fetchRevenueStatistics = async () => {
        try {
            setRevenueLoading(true);
            const response: IBackendRes<RevenueStatisticsDTO> = await callGetRevenueStatistics();
            console.log("Revenue statistics full response:", response);

            if (response.data) {
                console.log("Response.data:", response.data);
                if (response.data.data) {
                    console.log("Response.data.data:", response.data.data);
                    setRevenueStats(response.data.data);
                } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
                    // Handle the case where the API returns { data: { data: { ... } } }
                    const nestedData = (response.data as any).data;
                    console.log("Nested data found:", nestedData);
                    setRevenueStats(nestedData);
                } else {
                    console.log("No nested data structure found");
                }
            } else {
                console.log("No data in response");
            }
        } catch (error: any) {
            setRevenueError(error.message || "Có lỗi xảy ra khi tải dữ liệu thống kê doanh thu");
            console.error("Error fetching revenue statistics:", error);
        } finally {
            setRevenueLoading(false);
        }
    };

    // Hàm xử lý thay đổi khoảng thời gian
    const handleDateRangeChange = async (dates: any) => {
        if (!dates || dates.length !== 2) {
            setDateRange(null);
            fetchRevenueStatistics(); // Trở về dữ liệu mặc định
            return;
        }

        setDateRange([dates[0], dates[1]]);
        try {
            setRevenueLoading(true);
            const startDate = dates[0].format('YYYY-MM-DDTHH:mm:ss');
            const endDate = dates[1].format('YYYY-MM-DDTHH:mm:ss');

            const response: IBackendRes<RevenueStatisticsDTO> = await callGetRevenueStatisticsByDateRange(startDate, endDate);
            console.log("Revenue statistics by date range response:", response);

            if (response.data) {
                // The API response has a double-nested structure: response.data.data.data
                // Check both data structures to ensure we get the correct data
                if (response.data.data) {
                    setRevenueStats(response.data.data);
                } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
                    // Handle the case where the API returns { data: { data: { ... } } }
                    const nestedData = (response.data as any).data;
                    setRevenueStats(nestedData);
                } else {
                    setRevenueError("Không có dữ liệu thống kê");
                }
            } else {
                setRevenueError("Không có dữ liệu thống kê");
            }
        } catch (error: any) {
            console.error("Error fetching revenue statistics by date range:", error);
            setRevenueError(error.message || "Có lỗi xảy ra khi tải dữ liệu thống kê doanh thu theo khoảng thời gian");
        } finally {
            setRevenueLoading(false);
        }
    };

    const formatter = (value: any) => {
        return <CountUp end={Number(value)} separator="," />;
    };

    const moneyFormatter = (value: any) => {
        return <CountUp end={Number(value)} separator="," decimals={0} suffix=" VND" />;
    };

    const handleCardClick = (path: string) => {
        navigate(path);
    };

    const barChartData = [
        { name: 'Người dùng', value: statistics.totalUsers },
        { name: 'Công ty', value: statistics.totalCompanies },
        { name: 'Việc làm', value: statistics.totalJobs },
        { name: 'CV', value: statistics.totalCVs }
    ];

    const pieChartData = [
        { name: 'Người dùng', value: statistics.totalUsers },
        { name: 'Công ty', value: statistics.totalCompanies },
        { name: 'Việc làm', value: statistics.totalJobs },
        { name: 'CV', value: statistics.totalCVs }
    ];

    // Columns cho bảng giao dịch gần đây
    const transactionColumns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 100,
        },
        {
            title: 'Tên khách hàng',
            dataIndex: 'customerName',
            key: 'customerName',
        },
        {
            title: 'Gói dịch vụ',
            dataIndex: 'packageName',
            key: 'packageName',
            render: (text: string) => (
                <Tag color="blue">{text}</Tag>
            )
        },
        {
            title: 'Ngày mua',
            dataIndex: 'date',
            key: 'date',
            render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
        },
        {
            title: 'Số tiền',
            dataIndex: 'amount',
            key: 'amount',
            align: 'right' as const,
            render: (amount: number) => (
                <span style={{ color: '#389e0d', fontWeight: 'bold' }}>
                    {new Intl.NumberFormat('vi-VN').format(amount)} VND
                </span>
            ),
        },
    ];

    if (loading && activeTab === "1") {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (error && activeTab === "1") {
        return (
            <div style={{ padding: '20px' }}>
                <Alert message="Lỗi" description={error} type="error" showIcon />
            </div>
        );
    }

    // Render tab thống kê tổng quan
    const renderOverviewStats = () => {
        return (
            <>
                <h1 style={{ marginBottom: '24px' }}>Thống kê tổng quan</h1>

                {/* Statistics Cards */}
                <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                    <Col xs={24} sm={12} lg={6}>
                        <Card
                            hoverable
                            onClick={() => handleCardClick('/admin/user')}
                            style={{ cursor: 'pointer' }}
                        >
                            <Statistic
                                title="Tổng số người dùng"
                                value={statistics.totalUsers}
                                formatter={formatter}
                                prefix={<UserOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card
                            hoverable
                            onClick={() => handleCardClick('/admin/company')}
                            style={{ cursor: 'pointer' }}
                        >
                            <Statistic
                                title="Tổng số công ty"
                                value={statistics.totalCompanies}
                                formatter={formatter}
                                prefix={<BankOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card
                            hoverable
                            onClick={() => handleCardClick('/admin/job')}
                            style={{ cursor: 'pointer' }}
                        >
                            <Statistic
                                title="Tổng số việc làm"
                                value={statistics.totalJobs}
                                formatter={formatter}
                                prefix={<RiseOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card
                            hoverable
                            onClick={() => handleCardClick('/admin/cv')}
                            style={{ cursor: 'pointer' }}
                        >
                            <Statistic
                                title="Tổng số CV"
                                value={statistics.totalCVs}
                                formatter={formatter}
                                prefix={<FileTextOutlined />}
                            />
                        </Card>
                    </Col>
                </Row>

                {/* Charts */}
                <Row gutter={[16, 16]}>
                    <Col xs={24} lg={12}>
                        <Card title="Thống kê theo dạng cột">
                            <div style={{ height: 300 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={barChartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="value" fill="#8884d8" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </Col>
                    <Col xs={24} lg={12}>
                        <Card title="Thống kê theo dạng tròn">
                            <div style={{ height: 300 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieChartData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {pieChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </Col>
                </Row>
            </>
        );
    };

    // Render tab thống kê doanh thu
    const renderRevenueStats = () => {
        if (revenueLoading) {
            return (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                    <Spin size="large" />
                </div>
            );
        }

        if (revenueError) {
            return (
                <div style={{ padding: '20px' }}>
                    <Alert message="Lỗi" description={revenueError} type="error" showIcon />
                </div>
            );
        }

        // Add default empty values if revenueStats is null
        const stats = revenueStats || {
            totalRevenue: 0,
            totalTransactions: 0,
            lastMonthRevenue: 0,
            lastWeekRevenue: 0,
            dailyRevenueLastWeek: [],
            revenueByMonth: [],
            revenueByPackage: [],
            transactionCountByStatus: []
        };

        return (
            <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h1 style={{ margin: 0 }}>Thống kê doanh thu</h1>
                    <Button
                        type="primary"
                        icon={<ReloadOutlined />}
                        onClick={fetchRevenueStatistics}
                    >
                        Làm mới
                    </Button>
                </div>

                {/* Thống kê tổng quan */}
                <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                    <Col xs={24} sm={6}>
                        <Card>
                            <Statistic
                                title="Tổng doanh thu"
                                value={stats.totalRevenue}
                                formatter={moneyFormatter}
                                prefix={<DollarOutlined style={{ color: '#52c41a' }} />}
                                valueStyle={{ color: '#3f8600' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={6}>
                        <Card>
                            <Statistic
                                title="Tổng số giao dịch"
                                value={stats.totalTransactions}
                                formatter={formatter}
                                prefix={<ShoppingOutlined style={{ color: '#1890ff' }} />}
                                valueStyle={{ color: '#1890ff' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={6}>
                        <Card>
                            <Statistic
                                title="Doanh thu tháng"
                                value={stats.lastMonthRevenue}
                                formatter={moneyFormatter}
                                prefix={<DollarOutlined style={{ color: '#722ed1' }} />}
                                valueStyle={{ color: '#722ed1' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={6}>
                        <Card>
                            <Statistic
                                title="Doanh thu tuần"
                                value={stats.lastWeekRevenue}
                                formatter={moneyFormatter}
                                prefix={<DollarOutlined style={{ color: '#fa8c16' }} />}
                                valueStyle={{ color: '#fa8c16' }}
                            />
                        </Card>
                    </Col>
                </Row>

                {/* Biểu đồ doanh thu theo ngày */}
                <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                    <Col span={24}>
                        <Card title="Doanh thu theo ngày" style={{ height: '100%' }}>
                            <div style={{ height: 300 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart
                                        data={stats.dailyRevenueLastWeek}
                                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip formatter={(value) => [`${value.toLocaleString()} VND`, 'Doanh thu']} />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="revenue"
                                            name="Doanh thu"
                                            stroke="#8884d8"
                                            activeDot={{ r: 8 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </Col>
                </Row>

                {/* Biểu đồ doanh thu theo tháng và theo gói */}
                <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                    <Col xs={24} lg={12}>
                        <Card title="Doanh thu theo tháng" style={{ height: '100%' }}>
                            <div style={{ height: 300 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={stats.revenueByMonth}
                                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip formatter={(value) => [`${value.toLocaleString()} VND`, 'Doanh thu']} />
                                        <Legend />
                                        <Bar
                                            dataKey="revenue"
                                            name="Doanh thu"
                                            fill="#8884d8"
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </Col>
                    <Col xs={24} lg={12}>
                        <Card title="Doanh thu theo gói dịch vụ" style={{ height: '100%' }}>
                            <div style={{ height: 300 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={stats.revenueByPackage}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="revenue"
                                            nameKey="packageName"
                                        >
                                            {stats.revenueByPackage.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => `${value.toLocaleString()} VND`} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </Col>
                </Row>

                {/* Bảng gói bán chạy */}
                <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                    <Col span={24}>
                        <Card title="Top gói dịch vụ bán chạy" style={{ height: '100%' }}>
                            <div style={{ overflow: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#f0f0f0' }}>
                                            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Tên gói</th>
                                            <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>Số lượng bán</th>
                                            <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Doanh thu</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.revenueByPackage.map((pkg, index) => (
                                            <tr key={index} style={{ backgroundColor: index % 2 === 0 ? 'white' : '#f9f9f9' }}>
                                                <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>
                                                    <Tag color={COLORS[index % COLORS.length]}>{pkg.packageName}</Tag>
                                                </td>
                                                <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>{pkg.count}</td>
                                                <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>
                                                    {new Intl.NumberFormat('vi-VN').format(pkg.revenue)} VND
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </Col>
                </Row>

                {/* Bảng giao dịch gần đây */}
                <Row gutter={[16, 16]}>
                    <Col span={24}>
                        <Card title="Giao dịch gần đây">
                            <Table
                                columns={[
                                    {
                                        title: 'Trạng thái',
                                        dataIndex: 'status',
                                        key: 'status',
                                        render: (status: string) => (
                                            <Tag color={
                                                status === 'SUCCESS' ? 'success' :
                                                    status === 'PENDING' ? 'warning' :
                                                        'error'
                                            }>{status}</Tag>
                                        )
                                    },
                                    {
                                        title: 'Số lượng',
                                        dataIndex: 'count',
                                        key: 'count',
                                        align: 'center'
                                    }
                                ]}
                                dataSource={stats.transactionCountByStatus}
                                rowKey="status"
                                pagination={false}
                            />
                        </Card>
                    </Col>
                </Row>
            </>
        );
    };

    return (
        <div style={{ padding: '24px' }}>
            <Tabs
                defaultActiveKey="1"
                activeKey={activeTab}
                onChange={handleTabChange}
            >
                <TabPane tab="Thống kê tổng quan" key="1">
                    {renderOverviewStats()}
                </TabPane>
                <TabPane tab="Thống kê doanh thu" key="2">
                    {renderRevenueStats()}
                </TabPane>
            </Tabs>
        </div>
    );
};

export default DashboardPage;