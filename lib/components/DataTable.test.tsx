import { render, screen, fireEvent } from '@testing-library/react';
import DataTable from './DataTable';

interface TestItem {
  id: string;
  name: string;
  email: string;
  nested?: {
    value: string;
  };
}

describe('DataTable', () => {
  const mockData: TestItem[] = [
    { id: '1', name: 'John Doe', email: 'john@test.com' },
    { id: '2', name: 'Jane Smith', email: 'jane@test.com' },
  ];

  const columns = [
    { key: 'name' as const, header: 'Nombre' },
    { key: 'email' as const, header: 'Email' },
  ];

  describe('Rendering', () => {
    it('should render table with data', () => {
      render(<DataTable data={mockData} columns={columns} />);

      expect(screen.getByText('Nombre')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('jane@test.com')).toBeInTheDocument();
    });

    it('should render loading state', () => {
      render(<DataTable data={[]} columns={columns} isLoading={true} />);

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
      expect(screen.queryByText('Nombre')).not.toBeInTheDocument();
    });

    it('should render empty message when no data', () => {
      render(<DataTable data={[]} columns={columns} />);

      expect(screen.getByText('No hay datos disponibles')).toBeInTheDocument();
    });

    it('should render custom empty message', () => {
      const customMessage = 'No se encontraron usuarios';
      render(
        <DataTable data={[]} columns={columns} emptyMessage={customMessage} />
      );

      expect(screen.getByText(customMessage)).toBeInTheDocument();
    });
  });

  describe('Custom rendering', () => {
    it('should use custom render function for column', () => {
      const columnsWithRender = [
        {
          key: 'name',
          header: 'Nombre',
          render: (item: TestItem) => <span>Custom: {item.name}</span>,
        },
      ];

      render(<DataTable data={mockData} columns={columnsWithRender} />);

      expect(screen.getByText('Custom: John Doe')).toBeInTheDocument();
      expect(screen.getByText('Custom: Jane Smith')).toBeInTheDocument();
    });

    it('should handle nested properties', () => {
      const nestedData: TestItem[] = [
        {
          id: '1',
          name: 'Test',
          email: 'test@test.com',
          nested: { value: 'Nested Value' },
        },
      ];

      const nestedColumns = [
        { key: 'name', header: 'Name' },
        { key: 'nested.value', header: 'Nested' },
      ];

      render(<DataTable data={nestedData} columns={nestedColumns} />);

      expect(screen.getByText('Nested Value')).toBeInTheDocument();
    });

    it('should render dash for undefined nested values', () => {
      const columnsWithNested = [
        { key: 'name', header: 'Name' },
        { key: 'nested.value', header: 'Nested' },
      ];

      render(<DataTable data={mockData} columns={columnsWithNested} />);

      const cells = screen.getAllByText('-');
      expect(cells.length).toBeGreaterThan(0);
    });
  });

  describe('Actions', () => {
    it('should render action buttons when callbacks provided', () => {
      const onEdit = jest.fn();
      const onDelete = jest.fn();
      const onView = jest.fn();

      render(
        <DataTable
          data={mockData}
          columns={columns}
          onEdit={onEdit}
          onDelete={onDelete}
          onView={onView}
        />
      );

      expect(screen.getByText('Acciones')).toBeInTheDocument();
      expect(screen.getAllByText('Ver')).toHaveLength(2);
      expect(screen.getAllByText('Editar')).toHaveLength(2);
      expect(screen.getAllByText('Eliminar')).toHaveLength(2);
    });

    it('should call onView when view button clicked', () => {
      const onView = jest.fn();

      render(<DataTable data={mockData} columns={columns} onView={onView} />);

      const viewButtons = screen.getAllByText('Ver');
      fireEvent.click(viewButtons[0]);

      expect(onView).toHaveBeenCalledWith(mockData[0]);
    });

    it('should call onEdit when edit button clicked', () => {
      const onEdit = jest.fn();

      render(<DataTable data={mockData} columns={columns} onEdit={onEdit} />);

      const editButtons = screen.getAllByText('Editar');
      fireEvent.click(editButtons[1]);

      expect(onEdit).toHaveBeenCalledWith(mockData[1]);
    });

    it('should call onDelete when delete button clicked', () => {
      const onDelete = jest.fn();

      render(
        <DataTable data={mockData} columns={columns} onDelete={onDelete} />
      );

      const deleteButtons = screen.getAllByText('Eliminar');
      fireEvent.click(deleteButtons[0]);

      expect(onDelete).toHaveBeenCalledWith(mockData[0]);
    });

    it('should not render actions column when no callbacks provided', () => {
      render(<DataTable data={mockData} columns={columns} />);

      expect(screen.queryByText('Acciones')).not.toBeInTheDocument();
    });

    it('should only render provided action buttons', () => {
      const onEdit = jest.fn();

      render(<DataTable data={mockData} columns={columns} onEdit={onEdit} />);

      expect(screen.getAllByText('Editar')).toHaveLength(2);
      expect(screen.queryByText('Ver')).not.toBeInTheDocument();
      expect(screen.queryByText('Eliminar')).not.toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('should handle items without id using index', () => {
      const dataWithoutId: TestItem[] = [
        {
          id: undefined as unknown as string,
          name: 'Test 1',
          email: 'test1@test.com',
        },
        {
          id: undefined as unknown as string,
          name: 'Test 2',
          email: 'test2@test.com',
        },
      ];

      render(<DataTable data={dataWithoutId} columns={columns} />);

      expect(screen.getByText('Test 1')).toBeInTheDocument();
      expect(screen.getByText('Test 2')).toBeInTheDocument();
    });

    it('should apply hover styles to rows', () => {
      const { container } = render(
        <DataTable data={mockData} columns={columns} />
      );

      const rows = container.querySelectorAll('tbody tr');
      expect(rows[0]).toHaveClass('hover:bg-gray-50');
    });
  });
});
