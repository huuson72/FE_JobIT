import React, { useEffect, useState } from "react";
import {
    Card,
    Col,
    Row,
    Statistic,
    Spin,
    Alert,
    DatePicker,
    Button,
    Table,
    Tag
} from "antd";
import {
    DollarOutlined,
    ShoppingOutlined,
    BarChartOutlined,
    ReloadOutlined,
    CalendarOutlined
} from "@ant-design/icons";
import CountUp from 'react-countup';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { callGetRevenueStatistics, callGetRevenueStatisticsByDateRange, RevenueStatisticsDTO } from "@/config/api";
import { IBackendRes } from "@/types/backend";
import dayjs from "dayjs";
import axios from 'axios';

const { RangePicker } = DatePicker;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#82ca9d', '#8884d8'];

const RevenueStatisticsPage = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statistics, setStatistics] = useState<RevenueStatisticsDTO | null>(null);
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

    useEffect(() => {
        fetchStatistics();
    }, []);

    const fetchStatistics = async () => {
        try {
            setLoading(true);
            const response = await callGetRevenueStatistics();
            console.log("Revenue statistics response:", response);

            if (response.data) {
                console.log("Parsed statistics data:", response.data);
                setStatistics(response.data);
            } else {
                setError("Không có dữ liệu thống kê");
            }
        } catch (error: any) {
            console.error("Error details:", error);
            setError(error.message || "Có lỗi xảy ra khi tải dữ liệu thống kê doanh thu");
        } finally {
            setLoading(false);
        }
    };

    const handleDateRangeChange = async (dates: any) => {
        if (!dates || dates.length !== 2) {
            setDateRange(null);
            fetchStatistics(); // Trở về dữ liệu mặc định
            return;
        }

        setDateRange([dates[0], dates[1]]);
        try {
            setLoading(true);
            const startDate = dates[0].format('YYYY-MM-DDTHH:mm:ss');
            const endDate = dates[1].format('YYYY-MM-DDTHH:mm:ss');

            const response = await callGetRevenueStatisticsByDateRange(startDate, endDate);
            if (response.data) {
                setStatistics(response.data);
            }
        } catch (error: any) {
            setError(error.message || "Có lỗi xảy ra khi tải dữ liệu thống kê doanh thu theo khoảng thời gian");
            console.error("Error fetching revenue statistics by date range:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatter = (value: any) => {
        return <CountUp end={Number(value)} separator="," />;
    };

    const moneyFormatter = (value: any) => {
        return <CountUp end={Number(value)} separator="," decimals={0} suffix=" VND" />;
    };

    const columns = [
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

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '20px' }}>
                <Alert message="Lỗi" description={error} type="error" showIcon />
            </div>
        );
    }

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 style={{ margin: 0 }}>Thống kê doanh thu</h1>
                <div>
                    <RangePicker
                        onChange={handleDateRangeChange}
                        value={dateRange}
                        style={{ marginRight: '16px' }}
                    />
                    <Button
                        type="primary"
                        icon={<ReloadOutlined />}
                        onClick={() => {
                            setDateRange(null);
                            fetchStatistics();
                        }}
                    >
                        Làm mới
                    </Button>
                </div>
            </div>

            {statistics && (
                <>
                    {/* Thống kê tổng quan */}
                    <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                        <Col xs={24}>
                            <Card>
                                <Statistic
                                    title="Tổng số giao dịch"
                                    value={statistics.totalTransactions}
                                    formatter={formatter}
                                    prefix={<ShoppingOutlined style={{ color: '#1890ff' }} />}
                                    valueStyle={{ color: '#1890ff' }}
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
                                            data={statistics.dailyRevenueLastWeek}
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
                                            data={statistics.revenueByMonth}
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
                                                data={statistics.revenueByPackage}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="revenue"
                                                nameKey="packageName"
                                            >
                                                {statistics.revenueByPackage.map((entry, index) => (
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
                                            {statistics.revenueByPackage.map((pkg, index) => (
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
                                    dataSource={statistics.transactionCountByStatus}
                                    rowKey="status"
                                    pagination={false}
                                />
                            </Card>
                        </Col>
                    </Row>
                </>
            )}
        </div>
    );
};

export default RevenueStatisticsPage; 