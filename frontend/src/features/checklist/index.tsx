import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Badge, Button, Flex, message, Switch, Table, Typography } from "antd";
import ChecklistFormModal from "./components/ChecklistFormModal";
import type { ChecklistFormMode, IChecklist, IChecklistForm } from "./types";
import { createChecklist, deleteChecklistById, fetchChecklists, updateChecklistActiveStatusById, updateChecklistById } from "./services/checklistApi";

export function ChecklistScreen() {
    const checklistQueryKey = "checklist";
    const [activeChecklist, setActiveChecklist] = useState<IChecklist | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formMode, setFormMode] = useState<ChecklistFormMode>("create");

    const queryClient = useQueryClient();
    const { 
        data: checklists, 
        isLoading: isChecklistLoading, 
        isError,
        error: checklistError,
    } = useQuery({
        queryKey: [checklistQueryKey],
        queryFn: fetchChecklists,
    });

    const updateChecklistActiveStatusMutation = useMutation({
        mutationFn: async ({ id, isActive }: { id: string, isActive: boolean }) => {
            let checklistUpdated = checklists.find((c) => c.id === id);
            checklistUpdated.isActive = isActive;
            await updateChecklistActiveStatusById(id, isActive);
            return checklistUpdated;
        },
        onSuccess: (checklistUpdated) => {
            queryClient.setQueryData(
                [checklistQueryKey],
                (oldChecklists: IChecklist[] | undefined) =>
                    oldChecklists?.map((c) => c.id === checklistUpdated.id ? checklistUpdated : c
                )
            );
            
            message.success("Checklist updated successfully!");
        },
        onError: (error) => {
            console.error(error);
            message.error("Failed to update checklist.");
        }
    });

    const updateChecklistMutation = useMutation({
        mutationFn: (async (checklistUpdated: IChecklistForm) => {
            await updateChecklistById(checklistUpdated);
            return checklistUpdated;
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [checklistQueryKey] });
            message.success("Checklist updated successfully!");
        },
        onError: (error) => {
            console.error(error);
            message.error("Failed to update checklist.");
        }
    });

    const createChecklistMutation = useMutation({
        mutationFn: (async (data: Omit<IChecklistForm, 'id' | 'isActive'>) => {
            const newChecklistId = await createChecklist(data);
            return newChecklistId;
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [checklistQueryKey] });
            message.success("Checklist created successfully!");
        },
        onError: (error) => {
            console.error(error);
            message.error("Failed to create checklist.");
        }
    });

    const deleteChecklistMutation = useMutation({
        mutationFn: (async (id: string) => {
            await deleteChecklistById(id);
            return id;
        }),
        onSuccess: (id: string) => {
            queryClient.setQueryData(
                [checklistQueryKey],
                (oldChecklists: IChecklist[] | undefined) => oldChecklists?.filter((i) => i.id !== id)
            );
            
            message.success("Checklist deleted successfully!");
        },
        onError: (error) => {
            console.error(error);
            message.error("Failed to delete checklist.");
        }
    });

    const showModal = () => {
        setIsModalOpen(true);
    };
    
    const handleOk = (data: IChecklistForm) => {
        if (formMode === "update") {
            updateChecklistMutation.mutate(data);
        } else {
            createChecklistMutation.mutate(data);
        }
        handleCancel();
    };
    
    const handleCancel = () => {
        setIsModalOpen(false);
        setActiveChecklist(null);
    };

    const onClickCreateChecklistButton = () => {
        setFormMode("create");
        showModal();
    }

    const isLoading = isChecklistLoading;

    const columns = [
        {
            title: '',
            dataIndex: 'isActive',
            key: 'isActive',
            width: "80px",
            render: (_, record: IChecklist) => {
                return (
                    <Switch
                        checked={record.isActive}
                        onClick={() => {
                            updateChecklistActiveStatusMutation.mutate({ 
                                id: record.id, 
                                isActive: !record.isActive 
                            });
                        }}
                    />
                );
            },
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Required',
            dataIndex: 'isRequired',
            key: 'isRequired',
            render: (isRequired: boolean) => {
                return isRequired ? <Badge status="success" text="Required" /> : <Badge status="default" text="Optional" />;
            },
        },
        {
            title: 'Action',
            dataIndex: 'action',
            render: (_, record: IChecklist) => {
                return (
                    <div>
                        <Flex gap={16}>
                            <span 
                                style={{ cursor: "pointer" }}
                                onClick={() => {
                                    setFormMode("update");
                                    setActiveChecklist(record);
                                    showModal();
                                }}
                            >
                                View
                            </span>
                            <span 
                                style={{ color: "red", cursor: "pointer" }}
                                onClick={() => {
                                    deleteChecklistMutation.mutate(record.id);
                                }}
                            >
                                Delete
                            </span>
                        </Flex>
                    </div>
                )
            }
        },
    ];

    return (
        <div>
            <Typography.Title>Checklist</Typography.Title>
            {!isError ?
                (
                <>
                    <Flex justify="end" style={{ marginBottom: 8 }}>
                        <Button 
                            type="primary" 
                            ghost
                            onClick={onClickCreateChecklistButton}
                        >
                            New Checklist
                        </Button>
                    </Flex>
                    <Table 
                        rowKey="id"
                        dataSource={checklists} 
                        columns={columns} 
                        loading={isLoading}
                    />
                </>
                ) :
                <Alert
                    title="Error"
                    showIcon
                    description={JSON.stringify(checklistError)}
                    type="error"
                />
            }

            <ChecklistFormModal
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                data={activeChecklist}
            />
        </div>
    )
}
