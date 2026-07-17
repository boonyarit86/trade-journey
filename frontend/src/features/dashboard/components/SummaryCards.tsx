import { Card, Col, Row, Statistic, Tag } from "antd";
import { ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons";
import type { IPortfolio } from "../../portfolio/types";
import { computeProfitLoss } from "../utils";

interface Props {
    portfolio: IPortfolio;
}

export function SummaryCards({ portfolio }: Props) {
    const { amount, percent } = computeProfitLoss(portfolio.initBalance, portfolio.currentBalance);
    const isPositive = amount >= 0;
    const pnlColor = isPositive ? "#3f8600" : "#cf1322";

    return (
        <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
                <Card>
                    <Statistic title="Current Balance" value={portfolio.currentBalance} />
                </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
                <Card>
                    <Statistic
                        title="Profit / Loss"
                        value={amount}
                        precision={0}
                        valueStyle={{ color: pnlColor }}
                        prefix={isPositive ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                        suffix={
                            <Tag color={isPositive ? "green" : "red"} style={{ marginLeft: 8 }}>
                                {isPositive ? "+" : ""}
                                {percent.toFixed(2)}%
                            </Tag>
                        }
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
                <Card>
                    <Statistic title="Win Rate" value={portfolio.winRatePercent} suffix="%" />
                </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
                <Card>
                    <Statistic title="Total Trades" value={portfolio.totalTrade} />
                </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
                <Card>
                    <Statistic
                        title="Wins"
                        value={portfolio.totalWinTrade}
                        valueStyle={{ color: "#3f8600" }}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
                <Card>
                    <Statistic
                        title="Losses"
                        value={portfolio.totalLossTrade}
                        valueStyle={{ color: "#cf1322" }}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
                <Card>
                    <Statistic title="Break Even" value={portfolio.totalBreakEven ?? 0} />
                </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
                <Card>
                    <Statistic
                        title="Max Profit / Loss"
                        value={portfolio.maxProfitAmount}
                        valueStyle={{ color: "#3f8600" }}
                        suffix={
                            <span style={{ color: "#cf1322", fontSize: 14 }}>
                                {" / "}-{portfolio.maxLossAmount}
                            </span>
                        }
                    />
                </Card>
            </Col>
        </Row>
    );
}
