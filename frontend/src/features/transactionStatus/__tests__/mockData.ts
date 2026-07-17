import type { ITransactionStatus } from '../types';

export const mockTransactionStatuses: ITransactionStatus[] = [
    {
        id: '1',
        text: 'win',
        value: 'W',
        colorCode: '#52c41a',
        isActive: true,
        createdBy: 'admin',
        createdAt: '2026-01-01T00:00:00.000Z',
        modifiedBy: 'admin',
        modifiedAt: '2026-01-01T00:00:00.000Z',
    },
    {
        id: '2',
        text: 'loss',
        value: 'L',
        colorCode: '#ff4d4f',
        isActive: true,
        createdBy: 'admin',
        createdAt: '2026-01-02T00:00:00.000Z',
        modifiedBy: 'admin',
        modifiedAt: '2026-01-02T00:00:00.000Z',
    },
    {
        id: '3',
        text: 'pending',
        value: 'P',
        colorCode: '#1677ff',
        isActive: false,
        createdBy: 'admin',
        createdAt: '2026-01-03T00:00:00.000Z',
        modifiedBy: 'admin',
        modifiedAt: '2026-01-03T00:00:00.000Z',
    },
];
