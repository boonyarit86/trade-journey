import { 
    ApartmentOutlined, 
    HomeOutlined,
    BorderOutlined,
    SettingOutlined,
    CheckSquareOutlined,
    WalletOutlined,
    SwapOutlined,
} from '@ant-design/icons';

export type AntIconType = 
    "ApartmentOutlined" |
    "HomeOutlined" |
    "SettingOutlined" |
    "CheckSquareOutlined" |
    "WalletOutlined" |
    "SwapOutlined";

export interface AntIconProps {
    icon: AntIconType;
}

function AntIcon(props: AntIconProps) {
    const { 
        icon,
    } = props;

    let IconSelected = BorderOutlined;

    switch (icon) {
        case "ApartmentOutlined":
            IconSelected = ApartmentOutlined;
            break;
        case "HomeOutlined":
            IconSelected = HomeOutlined;
            break
        case "SettingOutlined":
            IconSelected = SettingOutlined;
            break;
        case "CheckSquareOutlined":
            IconSelected = CheckSquareOutlined;
            break;
        case "WalletOutlined":
            IconSelected = WalletOutlined;
            break;
        case "SwapOutlined":
            IconSelected = SwapOutlined;
            break;
    }

    return <IconSelected />
}

export default AntIcon;