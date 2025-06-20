"use client"
import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';

interface Column<T> {
  name: string;
  selector?: (row: T) => string;
  sortable?: boolean;
  cell?: (row: T) => React.ReactNode;
}

interface DataTableMyProps<T> {
  columns: Column<T>[]; // Use the same generic type T
  data: T[];
}

export default function DataTableMy<T>({ columns, data }: DataTableMyProps<T>) {
  const [filterText, setFilterText] = useState('');
  const [filteredData, setFilteredData] = useState(data);

 // Handle search functionality
 const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
  const searchText = event.target.value.toLowerCase();
  setFilterText(searchText);
  setFilteredData(
    data.filter(item =>
      JSON.stringify(item)
        .toLowerCase()
        .includes(searchText)
    )
  );
};


  // Update filtered data when the original data changesh
  useEffect(() => {
    setFilteredData(data);
  }, [data]);

  return (
    <div className='flex flex-col gap-3'>
      <input
        type="text"
        placeholder="Search..."
        className='w-[300px] outline-none border border-gray-400 text-[14px] rounded-[8px] px-3 py-2'
        value={filterText}
        onChange={handleSearch}
        style={{ marginBottom: '10px' }}
      />
      <DataTable
        columns={columns}
        data={filteredData}
        selectableRows
        pagination
      />
    </div>
  );
}