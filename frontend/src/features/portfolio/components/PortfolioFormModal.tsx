import { useEffect } from "react";
import { Button, Card, Descriptions, Form, Input, InputNumber, Modal, Select, Switch, Tag, Typography } from "antd";
import { useQuery } from "@tanstack/react-query";
import type { IPortfolio, IPortfolioForm } from "../types";
import { fetchProjects } from "../../project/services/projectApi";
import { fetchAssets } from "../../asset/assetItem/services/assetItemApi";
import { fetchStrategies } from "../../strategy/services/strategyApi";
import { fetchChecklists } from "../../checklist/services/checklistApi";

interface Props {
    open: boolean;
    onOk: (data: IPortfolioForm) => void;
    onCancel: () => void;
    data: IPortfolio | null;
}

function PortfolioFormModal(props: Props) {
    const [form] = Form.useForm();
    const selectedStrategyId = Form.useWatch("strategyId", form);

    const { data: projects, isLoading: isProjectsLoading } = useQuery({
        queryKey: ["project"],
        queryFn: fetchProjects,
    });

    const { data: assets, isLoading: isAssetsLoading } = useQuery({
        queryKey: ["asset"],
        queryFn: fetchAssets,
    });

    const { data: strategies, isLoading: isStrategiesLoading } = useQuery({
        queryKey: ["strategy"],
        queryFn: fetchStrategies,
    });

    const { data: checklists } = useQuery({
        queryKey: ["checklist"],
        queryFn: fetchChecklists,
    });

    useEffect(() => {
        if (props.data) {
            form.setFieldsValue({
                id: props.data.id,
                name: props.data.name,
                projectId: props.data.projectId,
                assetId: props.data.assetId,
                strategyId: props.data.strategyId ?? undefined,
                initBalance: props.data.initBalance,
                description: props.data.description ?? undefined,
                isActive: props.data.isActive,
            });
        } else {
            form.resetFields();
        }
    }, [form, props.data]);

    const handleSubmit = (values: IPortfolioForm) => {
        props.onOk(values);
    };

    const getChecklistName = (checklistId: string) =>
        checklists?.find((c) => c.id === checklistId)?.name ?? checklistId;

    const selectedStrategy = strategies?.find((s) => s.id === selectedStrategyId);

    return (
        <Modal
            title="Portfolio"
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
                    rules={[{ required: true, message: 'Please input portfolio name' }]}
                >
                    <Input placeholder="e.g. Main Portfolio" />
                </Form.Item>

                <Form.Item
                    label="Project"
                    name="projectId"
                    rules={[{ required: true, message: 'Please select project' }]}
                >
                    <Select
                        placeholder="Select project"
                        loading={isProjectsLoading}
                        options={projects?.map((p) => ({
                            label: p.name,
                            value: p.id,
                        }))}
                    />
                </Form.Item>

                <Form.Item
                    label="Asset"
                    name="assetId"
                    rules={[{ required: true, message: 'Please select asset' }]}
                >
                    <Select
                        placeholder="Select asset"
                        loading={isAssetsLoading}
                        options={assets?.map((a) => ({
                            label: a.assetTypeName ? `${a.name} (${a.assetTypeName})` : a.name,
                            value: a.id,
                        }))}
                    />
                </Form.Item>

                <Form.Item
                    label="Balance"
                    name="initBalance"
                    rules={[{ required: true, message: 'Please input balance' }]}
                >
                    <InputNumber min={0} style={{ width: "100%" }} placeholder="e.g. 10000" />
                </Form.Item>

                <Form.Item
                    label="Strategy"
                    name="strategyId"
                >
                    <Select
                        allowClear
                        placeholder="Select strategy (optional)"
                        loading={isStrategiesLoading}
                        options={strategies?.map((s) => ({
                            label: s.name,
                            value: s.id,
                        }))}
                    />
                </Form.Item>

                {selectedStrategy && (
                    <Card size="small" style={{ marginBottom: 24, background: "#fafafa" }}>
                        <Descriptions size="small" column={1} items={[
                            {
                                key: 'riskRewardRatio',
                                label: 'Risk/Reward Ratio',
                                children: selectedStrategy.riskRewardRatio ?? '-',
                            },
                            {
                                key: 'riskPerTrade',
                                label: 'Risk Per Trade (%)',
                                children: selectedStrategy.riskPerTrade ?? '-',
                            },
                            {
                                key: 'description',
                                label: 'Description',
                                children: selectedStrategy.description ?? '-',
                            },
                        ]} />
                        <Typography.Text type="secondary" style={{ display: "block", marginTop: 8, marginBottom: 4 }}>
                            Checklist
                        </Typography.Text>
                        {selectedStrategy.checklists.length === 0 ? (
                            <Typography.Text type="secondary">None</Typography.Text>
                        ) : (
                            selectedStrategy.checklists.map((c) => (
                                <Tag key={c.checklistId} color={c.isRequired ? "blue" : "default"} style={{ marginBottom: 4 }}>
                                    {getChecklistName(c.checklistId)}{c.isRequired ? " (Required)" : ""}
                                </Tag>
                            ))
                        )}
                    </Card>
                )}

                <Form.Item
                    label="Description"
                    name="description"
                >
                    <Input.TextArea rows={3} placeholder="Describe the portfolio..." />
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

export default PortfolioFormModal;
