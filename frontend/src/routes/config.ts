import type { AntIconType } from "../shared/ui/Icon";

export interface IRoutePath {
    id: string;
    icon: AntIconType;
    label: string;
    path: string;
    children?: IRoutePath[];
}
export const routePaths: IRoutePath[] = [
    {id: "1", icon: "HomeOutlined", label: "Home", path: "/"},
    {id: "2", icon: "ApartmentOutlined", label: "Project", path: "/project"},
    {id: "3", icon: "SettingOutlined", label: "Asset", path: "/asset", children: [
        {id: "3.1", icon: "SettingOutlined", label: "Asset Type", path: "/type"},
        {id: "3.2", icon: "SettingOutlined", label: "Asset Item", path: "/item"},
    ]},
];