import React, { useMemo, useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import FilterBar from '../components/FilterBar';
import DataTable, { Column } from '../components/DataTable';
import Pagination from '../components/Pagination';

const sampleData = [
    { id: '1', name: 'Nguyen Van A', email: 'a@example.com', role: 'Admin' },
    { id: '2', name: 'Tran Thi B', email: 'b@example.com', role: 'User' },
    { id: '3', name: 'Le Van C', email: 'c@example.com', role: 'Manager' },
    { id: '4', name: 'Pham Thi D', email: 'd@example.com', role: 'User' },
    { id: '5', name: 'Vu Van E', email: 'e@example.com', role: 'Support' },
    { id: '6', name: 'Do Thi F', email: 'f@example.com', role: 'User' },
    { id: '7', name: 'Hoang G', email: 'g@example.com', role: 'Admin' },
];

type SampleRow = (typeof sampleData)[number];

const columns: Column<SampleRow>[] = [
    { key: 'name', title: 'Ten' },
    { key: 'email', title: 'Email' },
    { key: 'role', title: 'Vai tro' },
];

export default function DataTableScreen() {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const pageSize = 4;

    const filteredData = useMemo(
        () =>
            sampleData.filter(
                (item) =>
                    item.name.toLowerCase().includes(search.toLowerCase()) ||
                    item.email.toLowerCase().includes(search.toLowerCase()) ||
                    item.role.toLowerCase().includes(search.toLowerCase())
            ),
        [search]
    );

    const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
    const pageData = filteredData.slice((page - 1) * pageSize, page * pageSize);

    return (
        <SafeAreaView style={styles.page}>
            <FilterBar
                onSearch={(value) => {
                    setSearch(value);
                    setPage(1);
                }}
                onRefresh={() => {
                    setSearch('');
                    setPage(1);
                }}
                onAdd={() => undefined}
                showAdd
                showRefresh
            />

            <DataTable columns={columns} data={pageData} isLoading={false} />

            <Pagination
                page={page}
                totalPages={totalPages}
                onPrev={() => setPage((value) => Math.max(1, value - 1))}
                onNext={() => setPage((value) => Math.min(totalPages, value + 1))}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    page: { flex: 1, padding: 16, backgroundColor: '#f1f5f9' },
});
