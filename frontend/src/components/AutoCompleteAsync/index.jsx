import { useState, useEffect, useRef } from 'react';

import { request } from '@/request';
import useOnFetch from '@/hooks/useOnFetch';
import useDebounce from '@/hooks/useDebounce';

import { Select, Empty } from 'antd';

export default function AutoCompleteAsync({
  entity,
  displayLabels,
  searchFields,
  outputValue = '_id',
  value, /// this is for update
  onChange, /// this is for update
}) {
  const [selectOptions, setOptions] = useState([]);
  const [currentValue, setCurrentValue] = useState(undefined);

  const isUpdating = useRef(true);
  const isSearching = useRef(false);

  const [searching, setSearching] = useState(false);

  const [valToSearch, setValToSearch] = useState('');
  const [debouncedValue, setDebouncedValue] = useState('');

  const [, cancel] = useDebounce(
    () => {
      //  setState("Typing stopped");
      setDebouncedValue(valToSearch);
    },
    500,
    [valToSearch]
  );

  const asyncSearch = async (options) => {
    return await request.search({ entity, options });
  };

  let { onFetch, result, isSuccess, isLoading } = useOnFetch();

  const labels = (optionField) => {
    return displayLabels.map((x) => optionField[x]).join(' ');
  };

  useEffect(() => {
    if (debouncedValue != '') {
      const options = {
        q: debouncedValue,
        fields: searchFields,
      };
      const callback = asyncSearch(options);
      onFetch(callback);
    }

    return () => {
      cancel();
    };
  }, [debouncedValue]);

  const onSearch = (searchText) => {
    if (searchText && searchText != '') {
      isSearching.current = true;
      setSearching(true);
      setOptions([]);
      setCurrentValue(undefined);
      setValToSearch(searchText);
    }
  };

  useEffect(() => {
    if (isSearching.current) {
      if (isSuccess) {
        setOptions(result);
      } else {
        setSearching(false);
        setCurrentValue(undefined);
        setOptions([]);
      }
    }
  }, [isSuccess, result]);
  
  useEffect(() => {
    if (value && isUpdating.current) {
      if (!isSearching.current) {
        // Evitar duplicados al actualizar las opciones
        setOptions(prevOptions => {
          const uniqueOptions = prevOptions.filter(option => option[outputValue] !== value[outputValue]);
          return [...uniqueOptions, value];
        });
      }
      setCurrentValue(value[outputValue] || value); // set nested value or value
      // Pasar el objeto del producto seleccionado, incluyendo la descripción
      onChange(value);
      isUpdating.current = false;
    }
  }, [value]);
  

  return (
    <Select
      loading={isLoading}
      showSearch
      allowClear
      placeholder={'Busca aquí'}
      defaultActiveFirstOption={false}
      filterOption={false}
      notFoundContent={searching ? '... Buscando' : <Empty />}
      value={currentValue}
      onSearch={onSearch}
      onChange={(newValue) => {
        if (onChange) {
          // Encuentra el producto seleccionado en las opciones
          const selectedProduct = selectOptions.find(option => option[outputValue] === newValue);
          if (selectedProduct) {
            // Pasa todo el objeto del producto seleccionado a la función onChange
            onChange(selectedProduct);
          }
        }
      }}      
      onClear={() => {
        setOptions([]);
        setCurrentValue(undefined);
        setSearching(false);
      }}
    >
      {selectOptions.map((optionField) => (
        <Select.Option
          key={optionField[outputValue] || optionField}
          value={optionField[outputValue] || optionField}
        >
          {labels(optionField)}
        </Select.Option>
      ))}
    </Select>
  );
}
