import { Table, Tag } from "antd";
import type { ITransaction } from "../../transaction/types";
import { signedAmount, toDateKey } from "../utils";

interface Props {
    transactions: ITransaction[];
    loading?: boolean;
}

export function TransactionTable({ transactions, loading }: Props) {
    const columns = [
        {
            title: "Date",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (value: string) => toDateKey(value),
        },
        {
            title: "Result",
            dataIndex: "resultValue",
            key: "resultValue",
            render: (_: unknown, record: ITransaction) => (
                <Tag color={record.resultColorCode ?? undefined}>
                    {record.resultText ?? record.resultValue}
                </Tag>
            ),
        },
        {
            title: "Amount",
            dataIndex: "amount",
            key: "amount",
            render: (_: unknown, record: ITransaction) => {
                const signed = signedAmount(record);
                const color = signed > 0 ? "#3f8600" : signed < 0 ? "#cf1322" : undefined;
                return (
                    <span style={{ color }}>
                        {signed > 0 ? "+" : ""}
                        {signed}
                    </span>
                );
            },
        },
        {
            title: "Fees",
            dataIndex: "fees",
            key: "fees",
        },
    ];

    return (
        <Table
            rowKey="id"
            dataSource={transactions}
            columns={columns}
            loading={loading}
            pagination={{ pageSize: 10 }}
        />
    );
}
