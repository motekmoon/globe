import React from 'react';
import {
  NativeSelectRoot,
  NativeSelectField,
  NativeSelectIndicator,
} from '@chakra-ui/react';

interface ColumnSelectorProps {
  columnName: string;
  currentMapping: string;
  onMappingChange: (columnName: string, parameter: string) => void;
}

const ColumnSelector: React.FC<ColumnSelectorProps> = ({
  columnName,
  currentMapping,
  onMappingChange,
}) => {
  const visualizationOptions = [
    { value: "", label: "Inactive" },
    { value: "quantity", label: "Quantity" },
    { value: "flightPath", label: "Flight Path (Date)" },
  ];

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    if (value === '') {
      onMappingChange(columnName, '');
    } else {
      onMappingChange(columnName, value);
    }
  };

  return (
    <NativeSelectRoot
      size="sm"
      width="120px"
    >
      <NativeSelectField
        value={currentMapping}
        onChange={handleChange}
      >
        {visualizationOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </NativeSelectField>
      <NativeSelectIndicator />
    </NativeSelectRoot>
  );
};

export default ColumnSelector;
