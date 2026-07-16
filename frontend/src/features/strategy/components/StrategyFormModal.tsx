import { useState, useEffect } from "react";
import { Button, Divider, Flex, Form, Input, InputNumber, Modal, Select, Switch, Typography } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import type { IStrategy, IStrategyForm, IStrategyFormChecklistItem } from "../types";
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
    const [checklistItems, setChecklistItems] = useState<IStrategyFormChecklistItem[]>([]);

    const { data: allChecklists, isLoading: isChecklistsLoading } = useQuery({
        queryKey: ["checklist"],
        queryFn: fetchChecklists,
    });

    useEffect(() => {
        if (props.data) {
            form.setFieldsValue({ ...props.data });
            setChecklistItems(
                props.data.checklists.map((c) => ({
                    checklistId: c.checklistId,
                    isRequired: c.isRequired,
                    isActive: c.isActive,
                }))
            );
        } else {
            form.resetFields();
            setChecklistItems([]);
        }
    }, [form, props.data]);

    const selectedChecklistIds = checklistItems.map((c) => c.checklistId);

    const handleChecklistSelect = (selectedIds: string[]) => {
        const added = selectedIds.filter((id) => !selectedChecklistIds.includes(id));
        const removed = selectedChecklistIds.filter((id) => !selectedIds.includes(id));

        setChecklistItems((prev) => {
            const withRemoved = prev.filter((c) => !removed.includes(c.checklistId));
            const newItems: IStrategyFormChecklistItem[] = added.map((id) => {
                const checklist = allChecklists?.find((c) => c.id === id);
                return {
                    checklistId: id,
                    isRequired: checklist?.isRequired ?? false,
                    isActive: true,
                };
            });
            return [...withRemoved, ...newItems];
        });
    };

    const updateChecklistItem = (
        checklistId: string,
        field: keyof Pick<IStrategyFormChecklistItem, 'isRequired' | 'isActive'>,
        value: boolean,
    ) => {
        setChecklistItems((prev) =>
            prev.map((c) => (c.checklistId === checklistId ? { ...c, [field]: value } : c))
        );
    };

    const handleSubmit = (values: Omit<IStrategyForm, 'checklists'>) => {
        props.onOk({ ...values, checklists: checklistItems });
    };

    const getChecklistName = (checklistId: string) =>
        allChecklists?.find((c) => c.id === checklistId)?.name ?? checklistId;

    return (
        <Modal
            title="Strategy"
            closable={{ 'aria-label': 'Custom Close Button' }}
            open={props.open}
            onCancel={props.onCancel}
            footer={null}
            width={560}
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

                <Form.Item label="Checklists">
                    <Select
                        mode="multiple"
                        allowClear
                        placeholder="Select checklists to link"
                        loading={isChecklistsLoading}
                        value={selectedChecklistIds}
                        onChange={handleChecklistSelect}
                        options={allChecklists?.map((c) => ({
                            label: c.name,
                            value: c.id,
                        }))}
                    />
                </Form.Item>

                {checklistItems.length > 0 && (
                    <>
                        <Divider style={{ margin: "0 0 12px" }} />
                        <Flex vertical gap={8}>
                            <Flex justify="space-between" style={{ padding: "0 4px" }}>
                                <Typography.Text type="secondary" style={{ flex: 1 }}>Checklist</Typography.Text>
                                <Typography.Text type="secondary" style={{ width: 72, textAlign: "center" }}>Required</Typography.Text>
                                <Typography.Text type="secondary" style={{ width: 60, textAlign: "center" }}>Active</Typography.Text>
                                <div style={{ width: 24 }} />
                            </Flex>
                            {checklistItems.map((item) => (
                                <Flex
                                    key={item.checklistId}
                                    align="center"
                                    gap={8}
                                    style={{
                                        padding: "8px 4px",
                                        background: "#fafafa",
                                        borderRadius: 6,
                                        border: "1px solid #f0f0f0",
                                    }}
                                >
                                    <Typography.Text style={{ flex: 1 }} ellipsis>
                                        {getChecklistName(item.checklistId)}
                                    </Typography.Text>
                                    <Flex justify="center" style={{ width: 72 }}>
                                        <Switch
                                            size="small"
                                            checked={item.isRequired}
                                            onChange={(val) => updateChecklistItem(item.checklistId, 'isRequired', val)}
                                        />
                                    </Flex>
                                    <Flex justify="center" style={{ width: 60 }}>
                                        <Switch
                                            size="small"
                                            checked={item.isActive}
                                            onChange={(val) => updateChecklistItem(item.checklistId, 'isActive', val)}
                                        />
                                    </Flex>
                                    <CloseOutlined
                                        style={{ width: 24, cursor: "pointer", color: "#ff4d4f" }}
                                        onClick={() =>
                                            handleChecklistSelect(
                                                selectedChecklistIds.filter((id) => id !== item.checklistId)
                                            )
                                        }
                                    />
                                </Flex>
                            ))}
                        </Flex>
                        <Divider style={{ margin: "12px 0" }} />
                    </>
                )}

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
