import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { DeleteModal, EditModal } from '.';
import { useLiveQuery } from 'dexie-react-hooks';

import {
    Table,
    TableHeader,
    TableBody,
    TableColumn,
    TableRow,
    TableCell,
    getKeyValue,
    Input,
    addToast,
    Tooltip,
} from '@heroui/react';
import db from '../assets/db';
import { dateOptions, checkExpiration } from '../libs';

const columns = [
    {
        key: 'sn',
        label: '№ п.п.',
        sortable: true,
    },
    {
        key: 'dateReg',
        label: 'Дата регистрации',
        sortable: true,
    },
    {
        key: 'regNumber',
        label: 'Номер договора',
    },
    {
        key: 'contrAgent',
        label: 'Контрагент',
        sortable: true,
    },
    {
        key: 'egrpou',
        label: 'ЕГРПОУ',
    },
    {
        key: 'subject',
        label: 'Предмет договора',
    },
    {
        key: 'addOns',
        label: 'Доп. соглашения',
    },
    {
        key: 'responsible',
        label: 'Ответственное лицо',
    },
    {
        key: 'dateExp',
        label: 'Дата окончания',
        sortable: true,
    },
    {
        key: 'annotations',
        label: 'Примечания',
    },
    {
        key: 'actions',
        label: 'Действия',
    },
];
function AgreementsList() {
    const toastShownRef = useRef(false);
    const [sortDescriptor, setSortDescriptor] = useState({
        column: 'dateReg',
        direction: 'ascending',
    });
    // State to hold the number of expired agreements
    const [expiredCount, setExpiredCount] = useState(0);
    const [filterValue, setFilterValue] = useState('');
    const hasSearchFilter = Boolean(filterValue);

    const renderCell = useCallback((rowData, columnKey) => {
        const value = getKeyValue(rowData, columnKey);
        switch (columnKey) {
            case 'actions':
                return (
                    <div className="relative flex items-center gap-2">
                        <Tooltip content="Редактировать">
                            <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                                <EditModal id={rowData.key} />
                            </span>
                        </Tooltip>
                        <Tooltip content="Удалить">
                            <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                                <DeleteModal id={rowData.key} />
                            </span>
                        </Tooltip>
                    </div>
                )
            default:
                return value;
        }
    }, []);

    const data = useLiveQuery(() => db.agreements.toArray()) || [];

    useEffect(() => {
        const updateExpiredStatusAndCount = async () => {
            if (data) { // Only run if data is available
                const count = await checkExpiration(data); // Call the async utility function
                setExpiredCount(count); // Update the state
            }
        };

        updateExpiredStatusAndCount();
    }, [data]); // Depend on 'data'

    // Effect for showing the toast, depends on 'expiredCount'
    useEffect(() => {
        if (expiredCount > 0 && !toastShownRef.current) {
            addToast({
                title: 'Внимание!',
                description: `У вас ${expiredCount} просроченных договоров`,
                color: 'warning',
                timeout: 10000000,
            });
            toastShownRef.current = true;
        }
    }, [expiredCount]);


    // `data` is guaranteed to be available from this point forward.
    const rows = useMemo(() => data?.map(agreement => ({
        key: agreement.id,
        sn: agreement.no,
        dateReg: new Date(agreement.dateReg).toLocaleDateString('ru', dateOptions),
        regNumber: agreement.regNumber,
        contrAgent: agreement.contrAgent,
        egrpou: agreement.egrpou,
        subject: agreement.subject,
        addOns: agreement.addOns,
        responsible: agreement.responsible,
        dateExp: agreement.autoRenew ? 'Автопролонгация' : new Date(agreement.dateExp).toLocaleDateString('ru', dateOptions),
        annotations: agreement.annotations,
        expired: agreement.expired, // Use the 'expired' status directly from the data
        // Add original Date objects for robust sorting
        originalDateReg: new Date(agreement.dateReg),
        originalDateExp: new Date(agreement.dateExp),
    })), [data]);

    const filteredItems = useMemo(() => {
        let filteredRows = [...rows];

        if (hasSearchFilter) {
            filteredRows = filteredRows.filter((item) =>
                item.egrpou.includes(filterValue),
            );
        }
        return filteredRows;
    }, [rows, filterValue]);

    const sortedItems = useMemo(() => {
        return [...filteredItems].sort((a, b) => {
            if (sortDescriptor.column === 'dateReg') {
                const dateA = a.originalDateReg;
                const dateB = b.originalDateReg;
                const cmp = dateA.getTime() < dateB.getTime() ? -1 : dateA.getTime() > dateB.getTime() ? 1 : 0;
                return sortDescriptor.direction === 'descending' ? -cmp : cmp;
            } else if (sortDescriptor.column === 'dateExp') {
                const dateA = a.originalDateExp;
                const dateB = b.originalDateExp;
                const cmp = dateA.getTime() < dateB.getTime() ? -1 : dateA.getTime() > dateB.getTime() ? 1 : 0;
                return sortDescriptor.direction === 'descending' ? -cmp : cmp;
            } else {
                const first = getKeyValue(a, sortDescriptor.column);
                const second = getKeyValue(b, sortDescriptor.column);
                const cmp = String(first).localeCompare(String(second), 'ru', { numeric: true });
                return sortDescriptor.direction === 'descending' ? -cmp : cmp;
            }
        });
    }, [sortDescriptor, filteredItems]);

    const onSearchChange = useCallback((value) => {
        if (value) {
            setFilterValue(value);
        } else {
            setFilterValue('');
        }
    }, []);

    const onClear = useCallback(() => {
        setFilterValue('');
    }, []);

    const topContent = useMemo(() => {
        return (
            <div className="flex flex-col gap-4">
                <div className="flex justify-between gap-3 items-end">
                    <Input
                        isClearable
                        className="w-full sm:max-w-[44%]"
                        placeholder="Поиск по номеру ЕГРПОУ"
                        value={filterValue}
                        onClear={() => onClear()}
                        onValueChange={onSearchChange}
                    />
                </div>
            </div>
        );
    }, [filterValue, onSearchChange, hasSearchFilter,]);

    return (
        <>
            <Table
                aria-label="Список всех договоров"
                selectionMode="single"
                isHeaderSticky
                sortDescriptor={sortDescriptor}
                onSortChange={setSortDescriptor}
                topContent={topContent}
                topContentPlacement="outside"
            >
                <TableHeader columns={columns}>
                    {column => (
                        <TableColumn key={column.key} allowsSorting={column.sortable}>
                            {column.label}
                        </TableColumn>
                    )}
                </TableHeader>
                <TableBody></TableBody>
                <TableBody items={sortedItems}>
                    {item => (
                        <TableRow key={item.key}>
                            {columnKey => (
                                <TableCell className={item.expired ? 'text-red-500' : ''}>
                                    {renderCell(item, columnKey)}
                                </TableCell>
                            )}
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </>
    )
}

export default AgreementsList