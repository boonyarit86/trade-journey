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
    {id: "4", icon: "SettingOutlined", label: "Trading Setup", path: "/trading-setup", children: [
        {id: "4.1", icon: "CheckSquareOutlined", label: "Checklist", path: "/checklist"},
        {id: "4.2", icon: "SettingOutlined", label: "Strategy", path: "/strategy"},
        {id: "4.3", icon: "WalletOutlined", label: "Portfolio", path: "/portfolio"},
    ]},
    {id: "5", icon: "SettingOutlined", label: "General Setting", path: "/general-setting", children: [
        {id: "5.1", icon: "SwapOutlined", label: "Trade Result", path: "/trade-result"},
    ]},
];