import React, { useState, useEffect, useRef } from 'react'; // Asegúrate de importar React
import { Form, Input, InputNumber, Row, Col, } from 'antd';
import AutoCompleteAsync from '@/components/AutoCompleteAsync';
import { DeleteOutlined } from '@ant-design/icons';
import { useMoney, useDate } from '@/settings';
import calculate from '@/utils/calculate';

export default function ItemRow({ field, setInputValue, remove, current = null, form }) {

  const [totalState, setTotal] = useState(undefined);
  const [price, setPrice] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const [description, setDescription] = useState('');

  const money = useMoney();
  
  const updateQt = (value) => {
    setQuantity(value);
  };

  const updatePrice = (value) => {
    setPrice(value);
  };

  const handleAutoCompleteChange = async (codigo) => {
    form.setFieldsValue({ [field.name]: { ...form.getFieldValue(field.name), itemName: codigo } });
    try {
      const productos = await fetchProductData(codigo);
      if (productos) {
        // Suponiendo que productData contiene los campos 'price' y 'description'
        setPrice(productos.precio);
        form.setFieldsValue({ [field.name]: { ...form.getFieldValue(field.name), price: productos.precio } });
        form.setFieldsValue({ [field.name]: { ...form.getFieldValue(field.name), description: productos.descripcion } });
      }
    } catch (error) {
      console.error("Error al obtener datos del producto: ", error);
    }
  };
  useEffect(() => {
    if (current) {
      // When it accesses the /payment/Factura/ endpoint,
      // it receives an Factura.item instead of just item
      // and breaks the code, but now we can check if items exists,
      // and if it doesn't we can access Factura.items.

      const { items, Factura } = current;

      if (Factura) {
        const item = Factura[field.fieldKey];

        if (item) {
          setQuantity(item.quantity);
          setPrice(item.price);
        }
      } else {
        const item = items[field.fieldKey];

        if (item) {
          setQuantity(item.quantity);
          setPrice(item.price);
        }
      }
    }
  }, [current]);

  useEffect(() => {
    if (current) {
      const { items, invoice } = current;
      const item = invoice ? invoice[field.fieldKey] : items[field.fieldKey];
      if (item) {
        setQuantity(item.quantity);
        setPrice(item.price);
      }
    }
  }, [current]);

  useEffect(() => {
    const currentTotal = calculate.multiply(price, quantity);
    setTotal(currentTotal);
  }, [price, quantity]);

  const handleSelectProduct = (value) => {
    const selectedDescription = value.description;
    const selectedPrice = value.price;
    console.log("Description:", selectedDescription);
    console.log("Price:", selectedPrice);
    setDescription(selectedDescription);
    setPrice(selectedPrice);

    // Update the input values using setFieldsValue
    form.setFieldsValue({
      [field.name]: {
        description: selectedDescription,
        price: selectedPrice,
      },
    });

    // Call the prop to update parent state
    if (setInputValue) {
      setInputValue('description', selectedDescription);
      setInputValue('price', selectedPrice);
    } else {
      console.error('setInputValue prop not received in ItemRow');
    }
  };

  return (
    <Row gutter={[12, 12]} style={{ position: 'relative' }}>
      <Col className="gutter-row" span={4}>
        <Form.Item
          name={[field.name, 'itemName']}
          rules={[{ required: true }]}
        >
        <Input placeholder="Código" />
     
   </Form.Item>
      </Col>
      <Col className="gutter-row" span={5}>
        <Form.Item name={[field.name, 'description']}>
        <Input placeholder="Descripción" />
        </Form.Item>
      </Col>
      <Col className="gutter-row" span={3}>
        <Form.Item name={[field.name, 'quantity']} rules={[{ required: true }]}>
          <InputNumber style={{ width: '100%' }} min={0} onChange={updateQt} />
        </Form.Item>
      </Col>
      <Col className="gutter-row" span={6}>
        <Form.Item name={[field.name, 'price']} rules={[{ required: true }]}>
          <InputNumber
value={price}
            className="moneyInput"
            onChange={updatePrice}
            min={0}
            controls={false}
            addonAfter={money.currency_position === 'after' ? money.currency_symbol : undefined}
            addonBefore={money.currency_position === 'before' ? money.currency_symbol : undefined}
          />
        </Form.Item>
      </Col>
      <Col className="gutter-row" span={6}>
        <Form.Item name={[field.name, 'total']}>
          <Form.Item>
            <InputNumber
              readOnly
              className="moneyInput"
              value={totalState}
              min={0}
              controls={false}
              addonAfter={money.currency_position === 'after' ? money.currency_symbol : undefined}
              addonBefore={money.currency_position === 'before' ? money.currency_symbol : undefined}
              formatter={(value) => money.amountFormatter({ amount: value })}
            />
          </Form.Item>
        </Form.Item>
      </Col>
      <div style={{ position: 'absolute', right: '-12px', top: ' 5px' }}>
        <DeleteOutlined onClick={() => remove(field.name)} />
      </div>
    </Row>
  );
}