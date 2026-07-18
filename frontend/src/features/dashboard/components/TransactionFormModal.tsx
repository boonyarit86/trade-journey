import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Checkbox, DatePicker, Form, InputNumber, Modal, Select, Space, Typography } from "antd";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import { useQuery } from "@tanstack/react-query";
import type { IPortfolio } from "../../portfolio/types";
import type { ITransactionForm, TransactionResultValue } from "../../transaction/types";
import { fetchStrategies } from "../../strategy/services/strategyApi";
import { fetchChecklists } from "../../checklist/services/checklistApi";

interface Props {
    open: boolean;
    portfolio: IPortfolio | null;
    onOk: (data: ITransactionForm) => void;
    onCancel: () => void;
}

const RESULT_OPTIONS: { label: string; value: TransactionResultValue }[] = [
    { label: "Win", value: "W" },
    { label: "Loss", value: "L" },
    { label: "Break Even", value: "B" },
];

export function TransactionFormModal({ open, portfolio, onOk, onCancel }: Props) {
    const [form] = Form.useForm();
    const resultValue = Form.useWatch("resultValue", form) as TransactionResultValue | undefined;
    const amount = Form.useWatch("amount", form) as number | undefined;
    const [checkedIds, setCheckedIds] = useState<string[]>([]);

    const { data: strategies } = useQuery({
        queryKey: ["strategy"],
        queryFn: fetchStrategies,
    });

    const { data: checklists } = useQuery({
        queryKey: ["checklist"],
        queryFn: fetchChecklists,
    });

    useEffect(() => {
        if (open) {
            form.resetFields();
            setCheckedIds([]);
        }
    }, [open, form, portfolio]);

    const strategy = useMemo(
        () => strategies?.find((s) => s.id === portfolio?.strategyId),
        [strategies, portfolio?.strategyId],
    );

    const activeChecklistItems = useMemo(
        () => strategy?.checklists.filter((c) => c.isActive) ?? [],
        [strategy],
    );

    const requiredChecklistIds = useMemo(
        () => activeChecklistItems.filter((c) => c.isRequired).map((c) => c.checklistId),
        [activeChecklistItems],
    );

    const getChecklistName = (checklistId: string) =>
        checklists?.find((c) => c.id === checklistId)?.name ?? checklistId;

    const allRequiredChecked = requiredChecklistIds.every((id) => checkedIds.includes(id));

    const insufficientBalance =
        resultValue === "L" &&
        typeof amount === "number" &&
        !!portfolio &&
        amount > portfolio.currentBalance;

    const canSubmit = !!portfolio && allRequiredChecked && !insufficientBalance;

    const handleSubmit = (values: {
        resultValue: TransactionResultValue;
        amount: number;
        fees?: number;
        tradeDate?: Dayjs;
    }) => {
        if (!portfolio || !canSubmit) return;
        onOk({
            portfolioId: portfolio.id,
            amount: values.amount,
            fees: values.fees ?? 0,
            resultValue: values.resultValue,
            tradeDate: values.tradeDate ? values.tradeDate.format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD"),
        });
    };

    return (
        <Modal title="New Transaction" open={open} onCancel={onCancel} footer={null} width={520}>
            {!portfolio ? (
                <Alert type="info" showIcon title="Please select a portfolio first." />
            ) : (
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    style={{ paddingTop: 12 }}
                    initialValues={{ fees: 0, tradeDate: dayjs() }}
                >
                    <Typography.Paragraph type="secondary">
                        Portfolio: <strong>{portfolio.name}</strong> · Balance:{" "}
                        <strong>{portfolio.currentBalance}</strong>
                    </Typography.Paragraph>

                    <Form.Item
                        label="Trade Date"
                        name="tradeDate"
                        rules={[{ required: true, message: "Please select a trade date" }]}
                    >
                        <DatePicker
                            style={{ width: "100%" }}
                            disabledDate={(current) => current && current > dayjs().endOf("day")}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Result"
                        name="resultValue"
                        rules={[{ required: true, message: "Please select a result" }]}
                    >
                        <Select placeholder="Select result" options={RESULT_OPTIONS} />
                    </Form.Item>

                    <Form.Item
                        label="Amount"
                        name="amount"
                        rules={[{ required: true, message: "Please input amount" }]}
                    >
                        <InputNumber min={0} style={{ width: "100%" }} placeholder="e.g. 100" />
                    </Form.Item>

                    <Form.Item label="Fees" name="fees">
                        <InputNumber min={0} style={{ width: "100%" }} placeholder="e.g. 5" />
                    </Form.Item>

                    {insufficientBalance && (
                        <Alert
                            type="error"
                            showIcon
                            style={{ marginBottom: 16 }}
                            title="Insufficient balance for this loss."
                        />
                    )}

                    {activeChecklistItems.length > 0 && (
                        <Form.Item label="Checklist">
                            <Space orientation="vertical">
                                {activeChecklistItems.map((item) => (
                                    <Checkbox
                                        key={item.checklistId}
                                        checked={checkedIds.includes(item.checklistId)}
                                        onChange={(e) =>
                                            setCheckedIds((prev) =>
                                                e.target.checked
                                                    ? [...prev, item.checklistId]
                                                    : prev.filter((id) => id !== item.checklistId),
                                            )
                                        }
                                    >
                                        {getChecklistName(item.checklistId)}
                                        {item.isRequired ? " (Required)" : ""}
                                    </Checkbox>
                                ))}
                            </Space>
                        </Form.Item>
                    )}

                    <Button type="primary" htmlType="submit" disabled={!canSubmit}>
                        Save
                    </Button>
                </Form>
            )}
        </Modal>
    );
}
