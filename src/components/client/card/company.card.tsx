import { callFetchCompany } from '@/config/api';
import { convertSlug } from '@/config/utils';
import { ICompany } from '@/types/backend';
import { Card, Col, Empty, Pagination, Row, Spin } from 'antd';
import { useState, useEffect } from 'react';
import { isMobile } from 'react-device-detect';
import { Link, useNavigate } from 'react-router-dom';
import styles from 'styles/client.module.scss';
import cardStyles from 'styles/card.module.scss';
import { EnvironmentOutlined } from '@ant-design/icons';

interface IProps {
    showPagination?: boolean;
}

const CompanyCard = (props: IProps) => {
    const { showPagination = false } = props;

    const [displayCompany, setDisplayCompany] = useState<ICompany[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(4);
    const [total, setTotal] = useState(0);
    const [filter, setFilter] = useState("");
    const [sortQuery, setSortQuery] = useState("sort=updatedAt,desc");
    const navigate = useNavigate();

    useEffect(() => {
        fetchCompany();
    }, [current, pageSize, filter, sortQuery]);

    const fetchCompany = async () => {
        setIsLoading(true)
        let query = `page=${current}&size=${pageSize}`;
        if (filter) {
            query += `&${filter}`;
        }
        if (sortQuery) {
            query += `&${sortQuery}`;
        }

        const res = await callFetchCompany(query);
        if (res && res.data) {
            setDisplayCompany(res.data.result);
            setTotal(res.data.meta.total)
        }
        setIsLoading(false)
    }

    const handleOnchangePage = (pagination: { current: number, pageSize: number }) => {
        if (pagination && pagination.current !== current) {
            setCurrent(pagination.current)
        }
        if (pagination && pagination.pageSize !== pageSize) {
            setPageSize(pagination.pageSize)
            setCurrent(1);
        }
    }

    const handleViewDetailJob = (item: ICompany) => {
        if (item.name) {
            const slug = convertSlug(item.name);
            navigate(`/company/${slug}?id=${item.id}`)
        }
    }

    return (
        <div className={cardStyles["card-container"]}>
            <Spin spinning={isLoading} tip="Loading...">
                <div className={cardStyles["card-header"]}>
                    <h2 className={cardStyles["card-title"]}>Các nhà tuyển dụng hàng đầu</h2>
                    {!showPagination && (
                        <Link to="company" className={cardStyles["view-all"]}>
                            Xem tất cả
                        </Link>
                    )}
                </div>

                <Row gutter={[20, 20]}>
                    {displayCompany?.map(item => (
                        <Col span={24} md={6} key={item.id}>
                            <Card
                                className={cardStyles["company-card"]}
                                hoverable
                                onClick={() => handleViewDetailJob(item)}
                            >
                                <div className={cardStyles["company-logo-container"]}>
                                    <img
                                        alt={`${item.name} logo`}
                                        src={`${import.meta.env.VITE_BACKEND_URL}/storage/company/${item?.logo}`}
                                    />
                                </div>
                                <div className={cardStyles["company-info"]}>
                                    <h3 className={cardStyles["company-name"]}>{item.name}</h3>
                                    {item.address && (
                                        <div className={cardStyles["company-location"]}>
                                            <EnvironmentOutlined />
                                            {item.address}
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </Col>
                    ))}

                    {(!displayCompany || displayCompany.length === 0) && !isLoading && (
                        <Col span={24}>
                            <div className={cardStyles["empty-state"]}>
                                <Empty description="Không có dữ liệu" />
                            </div>
                        </Col>
                    )}
                </Row>

                {showPagination && (
                    <div className={cardStyles["pagination-container"]}>
                        <Pagination
                            current={current}
                            total={total}
                            pageSize={pageSize}
                            responsive
                            onChange={(p: number, s: number) => handleOnchangePage({ current: p, pageSize: s })}
                        />
                    </div>
                )}
            </Spin>
        </div>
    );
}

export default CompanyCard;