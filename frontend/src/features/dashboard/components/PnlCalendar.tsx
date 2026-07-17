import { Calendar, Card, Tag } from "antd";
import type { Dayjs } from "dayjs";
import type { ITransaction } from "../../transaction/types";
import { buildDailyPnl } from "../utils";

interface Props {
    transactions: ITransaction[];
}

export function PnlCalendar({ transactions }: Props) {
    const dailyPnl = buildDailyPnl(transactions);

    const renderDateCell = (current: Dayjs) => {
        const key = current.format("YYYY-MM-DD");
        const pnl = dailyPnl[key];
        if (pnl === undefined || pnl === 0) return null;
        const isPositive = pnl > 0;
        return (
            <Tag color={isPositive ? "green" : "red"}>
                {isPositive ? "+" : ""}
                {pnl}
            </Tag>
        );
    };

    return (
        <Card title="Daily Profit / Loss">
            <Calendar
                fullscreen
                cellRender={(current, info) =>
                    info.type === "date" ? renderDateCell(current as Dayjs) : info.originNode
                }
            />
        </Card>
    );
}
