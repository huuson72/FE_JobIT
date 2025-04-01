import React, { useEffect, useState } from "react";
import { Card, Col, Row, Statistic, Spin, Alert } from "antd";
import { UserOutlined, BankOutlined, FileTextOutlined, RiseOutlined } from "@ant-design/icons";
import CountUp from 'react-countup';
import { callGetAllStatistics } from "@/config/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';

interface StatisticsData {
    totalUsers: number;
    totalCompanies: number;
    totalJobs: number;
    totalCVs: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const DashboardPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statistics, setStatistics] = useState<StatisticsData>({
        totalUsers: 0,
        totalCompanies: 0,
        totalJobs: 0,
        totalCVs: 0
    });

    useEffect(() => {
        fetchStatistics();
    }, []);

    const fetchStatistics = async () => {
        try {
            setLoading(true);
            const response = await callGetAllStatistics();
            if (response.data?.data) {
                setStatistics(response.data.data);
            }
        } catch (error: any) {
            setError(error.message || "Có lỗi xảy ra khi tải dữ liệu thống kê");
            console.error("Error fetching statistics:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatter = (value: any) => {
        return <CountUp end={Number(value)} separator="," />;
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
        </div>
    );
};

export default DashboardPage;