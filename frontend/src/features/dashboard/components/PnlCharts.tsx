import { Card, Col, Empty, Row } from "antd";
import {
    Area,
    AreaChart,
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import type { ITransaction } from "../../transaction/types";
import { buildBalanceSeries, buildDrawdownSeries } from "../utils";

interface Props {
    initBalance: number;
    transactions: ITransaction[];
}

export function PnlCharts({ initBalance, transactions }: Props) {
    const balanceSeries = buildBalanceSeries(initBalance, transactions);
    const drawdownSeries = buildDrawdownSeries(initBalance, transactions);
    const hasData = transactions.length > 0;

    return (
        <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
                <Card title="Balance Over Time">
                    {hasData ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <LineChart data={balanceSeries}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="label" />
                                <YAxis />
                                <Tooltip />
                                <Line
                                    type="monotone"
                                    dataKey="balance"
                                    stroke="#1677ff"
                                    strokeWidth={2}
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <Empty description="No transactions yet" />
                    )}
                </Card>
            </Col>
            <Col xs={24} lg={12}>
                <Card title="Drawdown (%)">
                    {hasData ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <AreaChart data={drawdownSeries}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="label" />
                                <YAxis />
                                <Tooltip />
                                <Area
                                    type="monotone"
                                    dataKey="drawdown"
                                    stroke="#cf1322"
                                    fill="#ffccc7"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <Empty description="No transactions yet" />
                    )}
                </Card>
            </Col>
        </Row>
    );
}
