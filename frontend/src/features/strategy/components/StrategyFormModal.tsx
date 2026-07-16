import { Button, Form, Input, InputNumber, Modal, Select, Switch } from "antd";
import type { IStrategy, IStrategyForm } from "../types";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchChecklists } from "../../checklist/services/checklistApi";

interface Props {
    open: boolean;
    onOk: (data: IStrategyForm) => void;
    onCancel: () => void;
    data: IStrategy | null;
}

function StrategyFormModal(props: Props) {
    const [form] = Form.useForm();

    const { data: checklists, isLoading: isChecklistsLoading } = useQuery({
        queryKey: ["checklist"],
        queryFn: fetchChecklists,
    });

    useEffect(() => {
        if (props.data) {
            form.setFieldsValue({
                ...props.data,
                checklistIds: props.data.checklists.map((c) => c.checklistId),
            });
        } else {
            form.resetFields();
        }
    }, [form, props.data]);

    const handleSubmit = (values: IStrategyForm) => {
        props.onOk({
            ...values,
            checklistIds: values.checklistIds ?? [],
        });
    };

    return (
        <Modal
            title="Strategy"
            closable={{ 'aria-label': 'Custom Close Button' }}
            open={props.open}
            onCancel={props.onCancel}
            footer={null}
        >
            <Form
                form={form}
                onFinish={handleSubmit}
                style={{ padding: "16px 0" }}
                layout="vertical"
            >
                <Form.Item
                    label="Name"
                    name="name"
                    rules={[{ required: true, message: 'Please input strategy name' }]}
                >
                    <Input placeholder="e.g. Breakout" />
                </Form.Item>

                <Form.Item
                    label="Risk/Reward Ratio"
                    name="riskRewardRatio"
                >
                    <InputNumber min={1} style={{ width: "100%" }} placeholder="e.g. 2" />
                </Form.Item>

                <Form.Item
                    label="Risk Per Trade (%)"
                    name="riskPerTrade"
                >
                    <InputNumber min={1} style={{ width: "100%" }} placeholder="e.g. 1" />
                </Form.Item>

                <Form.Item
                    label="Description"
                    name="description"
                >
                    <Input.TextArea rows={3} placeholder="Describe the strategy..." />
                </Form.Item>

                <Form.Item
                    label="Checklists"
                    name="checklistIds"
                >
                    <Select
                        mode="multiple"
                        allowClear
                        placeholder="Select checklists"
                        loading={isChecklistsLoading}
                        options={checklists?.map((c) => ({
                            label: c.name,
                            value: c.id,
                        }))}
                    />
                </Form.Item>

                <Form.Item name="id" hidden>
                    <Input />
                </Form.Item>

                <Form.Item name="isActive" hidden>
                    <Switch />
                </Form.Item>

                <Button type="primary" htmlType="submit">Save</Button>
            </Form>
        </Modal>
    );
}

export default StrategyFormModal;
