import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Button, Flex, message, Switch, Table, Typography } from "antd";
import AssetTypeFormModal from "./components/AssetTypeFormModal";
import type { AssetTypeFromMode, IAssetType, IAssetTypeForm } from "./types";
import { createAssetType, deleteAssetTypeById, fetchAssetTypes, updateAssetTypeActiveStatusById, updateAssetTypeById } from "./services/assetTypeApi";

export function AssetTypeScreen() {
    const assetTypeQueryKey = "assetType";
    const [activeAssetType, setActiveAssetType] = useState<IAssetType | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formMode, setFormMode] = useState<AssetTypeFromMode>("create");

    const queryClient = useQueryClient();
    const { 
        data: assetTypes, 
        isLoading: isAssetTypeLoading, 
        isError,
        error: assetTypeError,
    } = useQuery({
        queryKey: [assetTypeQueryKey],
        queryFn: fetchAssetTypes,
    });

    const updateAssetTypeActiveStatusMutation = useMutation({
        mutationFn: async ({ id, isActive }: { id: string, isActive: boolean }) => {
            let assetTypesUpdated = assetTypes.find((p) => p.id === id);
            assetTypesUpdated.isActive = isActive;
            await updateAssetTypeActiveStatusById(id, isActive);
            return assetTypesUpdated;
        },
        onSuccess: (assetTypesUpdated) => {
            queryClient.setQueryData(
                [assetTypeQueryKey],
                (oldAssetTypes: IAssetType[] | undefined) =>
                    oldAssetTypes?.map((as) => as.id === assetTypesUpdated.id ? assetTypesUpdated : as
                )
            );
            
            message.success("Asset Type updated successfully!");
        },
        onError: (error) => {
            console.error(error);
            message.success("Failed to update asset type.");
        }
    });

    const updateAssetTypeMutation = useMutation({
        mutationFn: (async (assetTypeUpdated: IAssetTypeForm) => {
            await updateAssetTypeById(assetTypeUpdated);
            return assetTypeUpdated;
        }),
        onSuccess: (assetTypeUpdated: IAssetTypeForm) => {
            queryClient.setQueryData(
                [assetTypeQueryKey],
                (oldAssetTypes: IAssetType[] | undefined) =>
                    oldAssetTypes?.map((as) => {
                        if (as.id === assetTypeUpdated.id) {
                            as.name = assetTypeUpdated.name;
                            as.isActive = assetTypeUpdated.isActive; 
                        }
                        return as;
                    }
                )
            );
            
            message.success("Asset Type updated successfully!");
        },
        onError: (error) => {
            console.error(error);
            message.success("Failed to update asset type.");
        }
    });

    const createAssetTypeMutation = useMutation({
        mutationFn: (async (data: IAssetTypeForm) => {
            const newAssetTypeId = await createAssetType(data);
            let newProject: IAssetType = {
                id: newAssetTypeId,
                name: data.name,
                isActive: true,
                createdBy: "admin",
                createdAt: new Date(),
                modifiedBy: "admin",
                modifiedAt: new Date(),
            }
            
            return newProject;
        }),
        onSuccess: (newAssetType: IAssetType) => {
            queryClient.setQueryData(
                [assetTypeQueryKey],
                (oldAssetTypes: IAssetType[] | undefined) => {
                    return [...oldAssetTypes, newAssetType];
                }
            );
            
            message.success("Asset Type updated successfully!");
        },
        onError: (error) => {
            console.error(error);
            message.success("Failed to update asset type.");
        }
    });

    const deleteAssetTypeMutation = useMutation({
        mutationFn: (async (id: string) => {
            await deleteAssetTypeById(id);
            return id;
        }),
        onSuccess: (id: string) => {
            queryClient.setQueryData(
                [assetTypeQueryKey],
                (oldAssetTypes: IAssetType[] | undefined) => oldAssetTypes?.filter((i) => i.id !== id)
            );
            
            message.success("Asset Type deleted successfully!");
        },
        onError: (error) => {
            console.error(error);
            message.success("Failed to delete asset type.");
        }
    });

    const showModal = () => {
        setIsModalOpen(true);
    };
    
    const handleOk = (data: IAssetTypeForm) => {
        if (formMode === "update") {
            updateAssetTypeMutation.mutate(data);
        } else {
            createAssetTypeMutation.mutate(data);
        }
        handleCancel();
    };
    
    const handleCancel = () => {
        setIsModalOpen(false);
        setActiveAssetType(null);
    };

    const onClickCreateAssetTypeButton = () => {
        setFormMode("create");
        showModal();
    }

    const isLoading = isAssetTypeLoading;

    const columns = [
        {
            title: '',
            dataIndex: 'isActive',
            key: 'isActive',
            width: "80px",
            render: (_, record: IAssetType) => {
                return (
                    <Switch
                        checked={record.isActive}
                        onClick={() => {
                            updateAssetTypeActiveStatusMutation.mutate({ 
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
            title: 'Action',
            dataIndex: 'action',
            render: (_, record: IAssetType) => {
                return (
                    <div>
                        <Flex gap={16}>
                            <span 
                                style={{ cursor: "pointer" }}
                                onClick={() => {
                                    setFormMode("update");
                                    setActiveAssetType(record);
                                    showModal();
                                }}
                            >
                                View
                            </span>
                            <span 
                                style={{ color: "red", cursor: "pointer" }}
                                onClick={() => {
                                    deleteAssetTypeMutation.mutate(record.id);
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
            <Typography.Title>Asset Type</Typography.Title>
            {!isError ?
                (
                <>
                    <Flex justify="end" style={{ marginBottom: 8 }}>
                        <Button 
                            type="primary" 
                            ghost
                            onClick={onClickCreateAssetTypeButton}
                        >
                            New Asset Type
                        </Button>
                    </Flex>
                    <Table 
                        rowKey="id"
                        dataSource={assetTypes} 
                        columns={columns} 
                        loading={isLoading}
                    />
                </>
                ) :
                <Alert
                    title="Error"
                    showIcon
                    description={JSON.stringify(assetTypeError)}
                    type="error"
                />
            }

            <AssetTypeFormModal
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                data={activeAssetType}
            />
        </div>
    )
}