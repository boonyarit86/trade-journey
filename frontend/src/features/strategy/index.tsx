import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Badge, Button, Flex, message, Switch, Table, Tag, Typography } from "antd";
import StrategyFormModal from "./components/StrategyFormModal";
import type { IStrategy, IStrategyForm, StrategyFormMode } from "./types";
import {
    createStrategy,
    deleteStrategyById,
    fetchStrategies,
    updateStrategyActiveStatusById,
    updateStrategyById,
} from "./services/strategyApi";
import { createStrategyChecklist, deleteStrategyChecklist, updateStrategyChecklistItem } from "./services/strategyChecklistApi";

export function StrategyScreen() {
    const strategyQueryKey = "strategy";
    const [activeStrategy, setActiveStrategy] = useState<IStrategy | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formMode, setFormMode] = useState<StrategyFormMode>("create");

    const queryClient = useQueryClient();
    const {
        data: strategies,
        isLoading: isStrategyLoading,
        isError,
        error: strategyError,
    } = useQuery({
        queryKey: [strategyQueryKey],
        queryFn: fetchStrategies,
    });

    const updateStrategyActiveStatusMutation = useMutation({
        mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
            let strategyUpdated = strategies.find((s) => s.id === id);
            strategyUpdated.isActive = isActive;
            await updateStrategyActiveStatusById(id, isActive);
            return strategyUpdated;
        },
        onSuccess: (strategyUpdated) => {
            queryClient.setQueryData(
                [strategyQueryKey],
                (oldStrategies: IStrategy[] | undefined) =>
                    oldStrategies?.map((s) => (s.id === strategyUpdated.id ? strategyUpdated : s))
            );
            message.success("Strategy updated successfully!");
        },
        onError: (error) => {
            console.error(error);
            message.error("Failed to update strategy.");
        },
    });

    const updateStrategyMutation = useMutation({
        mutationFn: async (data: IStrategyForm) => {
            const existingStrategy = strategies.find((s) => s.id === data.id);
            const existingLinks = existingStrategy?.checklists ?? [];
            const newLinks = data.checklists ?? [];

            await updateStrategyById(data);

            const toDelete = existingLinks.filter(
                (e) => !newLinks.find((n) => n.checklistId === e.checklistId)
            );
            const toAdd = newLinks.filter(
                (n) => !existingLinks.find((e) => e.checklistId === n.checklistId)
            );
            const toUpdate = newLinks.filter((n) => {
                const existing = existingLinks.find((e) => e.checklistId === n.checklistId);
                return existing && (existing.isRequired !== n.isRequired || existing.isActive !== n.isActive);
            });

            await Promise.all(toDelete.map((link) => deleteStrategyChecklist(data.id, link.checklistId)));
            await Promise.all(toAdd.map((link) =>
                createStrategyChecklist(data.id, link.checklistId, link.isRequired, link.isActive)
            ));
            await Promise.all(toUpdate.map((link) =>
                updateStrategyChecklistItem(data.id, link.checklistId, link.isRequired, link.isActive)
            ));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [strategyQueryKey] });
            message.success("Strategy updated successfully!");
        },
        onError: (error) => {
            console.error(error);
            message.error("Failed to update strategy.");
        },
    });

    const createStrategyMutation = useMutation({
        mutationFn: async (data: Omit<IStrategyForm, 'id' | 'isActive'>) => {
            const strategyId = await createStrategy(data);
            await Promise.all(
                (data.checklists ?? []).map((item) =>
                    createStrategyChecklist(strategyId, item.checklistId, item.isRequired, item.isActive)
                )
            );
            return strategyId;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [strategyQueryKey] });
            message.success("Strategy created successfully!");
        },
        onError: (error) => {
            console.error(error);
            message.error("Failed to create strategy.");
        },
    });

    const deleteStrategyMutation = useMutation({
        mutationFn: async (id: string) => {
            await deleteStrategyById(id);
            return id;
        },
        onSuccess: (id: string) => {
            queryClient.setQueryData(
                [strategyQueryKey],
                (oldStrategies: IStrategy[] | undefined) => oldStrategies?.filter((s) => s.id !== id)
            );
            message.success("Strategy deleted successfully!");
        },
        onError: (error) => {
            console.error(error);
            message.error("Failed to delete strategy.");
        },
    });

    const showModal = () => setIsModalOpen(true);

    const handleOk = (data: IStrategyForm) => {
        if (formMode === "update") {
            updateStrategyMutation.mutate(data);
        } else {
            createStrategyMutation.mutate(data);
        }
        handleCancel();
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setActiveStrategy(null);
    };

    const onClickCreateStrategyButton = () => {
        setFormMode("create");
        showModal();
    };

    const columns = [
        {
            title: '',
            dataIndex: 'isActive',
            key: 'isActive',
            width: "80px",
            render: (_: unknown, record: IStrategy) => (
                <Switch
                    checked={record.isActive}
                    onClick={() => {
                        updateStrategyActiveStatusMutation.mutate({
                            id: record.id,
                            isActive: !record.isActive,
                        });
                    }}
                />
            ),
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'RR Ratio',
            dataIndex: 'riskRewardRatio',
            key: 'riskRewardRatio',
            render: (value: number | null) => value ?? '-',
        },
        {
            title: 'Risk/Trade (%)',
            dataIndex: 'riskPerTrade',
            key: 'riskPerTrade',
            render: (value: number | null) => value ?? '-',
        },
        {
            title: 'Checklists',
            dataIndex: 'checklists',
            key: 'checklists',
            render: (checklists: IStrategy['checklists']) => {
                const count = checklists?.length ?? 0;
                if (count === 0) return <Badge status="default" text="None" />;
                return <Tag color="blue">{count} item{count > 1 ? 's' : ''}</Tag>;
            },
        },
        {
            title: 'Action',
            dataIndex: 'action',
            render: (_: unknown, record: IStrategy) => (
                <Flex gap={16}>
                    <span
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                            setFormMode("update");
                            setActiveStrategy(record);
                            showModal();
                        }}
                    >
                        View
                    </span>
                    <span
                        style={{ color: "red", cursor: "pointer" }}
                        onClick={() => {
                            deleteStrategyMutation.mutate(record.id);
                        }}
                    >
                        Delete
                    </span>
                </Flex>
            ),
        },
    ];

    return (
        <div>
            <Typography.Title>Strategy</Typography.Title>
            {!isError ? (
                <>
                    <Flex justify="end" style={{ marginBottom: 8 }}>
                        <Button
                            type="primary"
                            ghost
                            onClick={onClickCreateStrategyButton}
                        >
                            New Strategy
                        </Button>
                    </Flex>
                    <Table
                        rowKey="id"
                        dataSource={strategies}
                        columns={columns}
                        loading={isStrategyLoading}
                    />
                </>
            ) : (
                <Alert
                    title="Error"
                    showIcon
                    description={JSON.stringify(strategyError)}
                    type="error"
                />
            )}

            <StrategyFormModal
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                data={activeStrategy}
            />
        </div>
    );
}
