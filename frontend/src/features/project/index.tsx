import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Button, Flex, message, Switch, Table, Typography } from "antd";
import { createProject, deleteProjectById, fetchProjects, updateProjectActiveStatus, updateProjectById } from "./services/projectApi";
import ProjectFormModal from "./components/ProjectFormModal";
import type { IProject, IProjectForm, ProjectFromMode } from "./types";

export function ProjectScreen() {
    const projectQueryKey = "projects";
    const [activeProject, setActiveProject] = useState<IProject | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formMode, setFormMode] = useState<ProjectFromMode>("create");

    const queryClient = useQueryClient();
    const { 
        data: projects, 
        isLoading: isProjectLoading, 
        isError,
        error: projectError,
    } = useQuery({
        queryKey: [projectQueryKey],
        queryFn: fetchProjects,
    });

    const updateProjectActiveStatusMutation = useMutation({
        mutationFn: async ({ id, isActive }: { id: string, isActive: boolean }) => {
            let projectsUpdated = projects.find((p) => p.id === id);
            projectsUpdated.isActive = isActive;
            await updateProjectActiveStatus(id, isActive);
            return projectsUpdated;
        },
        onSuccess: (projectsUpdated) => {
            queryClient.setQueryData(
                [projectQueryKey],
                (oldProjects: IProject[] | undefined) =>
                    oldProjects?.map((p) => p.id === projectsUpdated.id ? projectsUpdated : p
                )
            );
            
            message.success("Project updated successfully!");
        },
        onError: (error) => {
            console.error(error);
            message.success("Failed to update user.");
        }
    });

    const updateProjectMutation = useMutation({
        mutationFn: (async (projectUpdated: IProjectForm) => {
            await updateProjectById(projectUpdated);
            return projectUpdated;
        }),
        onSuccess: (projectUpdated: IProjectForm) => {
            queryClient.setQueryData(
                [projectQueryKey],
                (oldProjects: IProject[] | undefined) =>
                    oldProjects?.map((p) => {
                        if (p.id === projectUpdated.id) {
                            p.name = projectUpdated.name;
                            p.isActive = projectUpdated.isActive; 
                        }
                        return p;
                    }
                )
            );
            
            message.success("Project updated successfully!");
        },
        onError: (error) => {
            console.error(error);
            message.success("Failed to update user.");
        }
    });

    const createProjectMutation = useMutation({
        mutationFn: (async (data: IProjectForm) => {
            const newProjectId = await createProject(data);
            let newProject: IProject = {
                id: newProjectId,
                name: data.name,
                isActive: true,
                isDefault: false,
                createdBy: "admin",
                createdAt: new Date(),
                modifiedBy: "admin",
                modifiedAt: new Date(),
            }
            
            return newProject;
        }),
        onSuccess: (newProject: IProject) => {
            queryClient.setQueryData(
                [projectQueryKey],
                (oldProjects: IProject[] | undefined) => {
                    return [...oldProjects, newProject];
                }
            );
            
            message.success("Project updated successfully!");
        },
        onError: (error) => {
            console.error(error);
            message.success("Failed to update user.");
        }
    });

    const deleteProjectMutation = useMutation({
        mutationFn: (async (id: string) => {
            await deleteProjectById(id);
            return id;
        }),
        onSuccess: (id: string) => {
            queryClient.setQueryData(
                [projectQueryKey],
                (oldProjects: IProject[] | undefined) => oldProjects?.filter((i) => i.id !== id)
            );
            
            message.success("Project deleted successfully!");
        },
        onError: (error) => {
            console.error(error);
            message.success("Failed to delete user.");
        }
    });

    const showModal = () => {
        setIsModalOpen(true);
    };
    
    const handleOk = (data: IProjectForm) => {
        if (formMode === "update") {
            updateProjectMutation.mutate(data);
        } else {
            createProjectMutation.mutate(data);
        }
        handleCancel();
    };
    
    const handleCancel = () => {
        setIsModalOpen(false);
        setActiveProject(null);
    };

    const onClickCreateProjectButton = () => {
        setFormMode("create");
        showModal();
    }

    const isLoading = isProjectLoading;

    const columns = [
        {
            title: '',
            dataIndex: 'isActive',
            key: 'isActive',
            width: "80px",
            render: (_, record: IProject) => {
                return (
                    <Switch
                        checked={record.isActive}
                        onClick={() => {
                            updateProjectActiveStatusMutation.mutate({ 
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
            render: (_, record: IProject) => {
                return (
                    <div>
                        <Flex gap={16}>
                            <span 
                                style={{ cursor: "pointer" }}
                                onClick={() => {
                                    setFormMode("update");
                                    setActiveProject(record);
                                    showModal();
                                }}
                            >
                                View
                            </span>
                            <span 
                                style={{ color: "red", cursor: "pointer" }}
                                onClick={() => {
                                    deleteProjectMutation.mutate(record.id);
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
            <Typography.Title>Project</Typography.Title>
            {!isError ?
                (
                <>
                    <Flex justify="end" style={{ marginBottom: 8 }}>
                        <Button 
                            type="primary" 
                            ghost
                            onClick={onClickCreateProjectButton}
                        >
                            New Project
                        </Button>
                    </Flex>
                    <Table 
                        rowKey="id"
                        dataSource={projects} 
                        columns={columns} 
                        loading={isLoading}
                    />
                </>
                ) :
                <Alert
                    title="Error"
                    showIcon
                    description={JSON.stringify(projectError)}
                    type="error"
                />
            }

            <ProjectFormModal
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                data={activeProject}
            />
        </div>
    )
}