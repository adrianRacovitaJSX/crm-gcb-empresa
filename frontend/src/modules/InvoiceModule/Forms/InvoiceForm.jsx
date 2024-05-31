import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import dayjs from 'dayjs';
import { Form, Input, InputNumber, Button, Select, Divider, Row, Col } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { DatePicker } from 'antd';
import AutoCompleteAsync from '@/components/AutoCompleteAsync';
import MoneyInputFormItem from '@/components/MoneyInputFormItem';
import { selectFinanceSettings } from '@/redux/settings/selectors';
import { useDate } from '@/settings';
import useLanguage from '@/locale/useLanguage';
import calculate from '@/utils/calculate';
import { useSelector } from 'react-redux';
import SelectAsync from '@/components/SelectAsync';
import { useMoney } from '@/settings';

const ItemRow = ({ field, remove, updateSubTotal }) => {
  const [total, setTotal] = useState(0);
  const [prevTotal, setPrevTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [formData, setFormData] = useState({ items: [] });

  const money = useMoney();

  const updateQt = (value) => {
    if (form) {
      const price = form.getFieldValue([field.name, 'price']);
      const currentTotal = calculate.multiply(price, value);
      setTotal(currentTotal);
      form.setFieldsValue({ [field.name]: { quantity: value, total: currentTotal } });
    }
    console.log('Quantity:', value);
  };

  const handleRemoveItem = () => {
    if (form) {
      const removedItemTotal = total || 0;
      updateSubTotal(-removedItemTotal, field.key);
      remove(field.name);
    }
    form.setFieldsValue({
      items: { ...form.getFieldValue('items'), [field.name]: allValues[field.name] },
    });
  };

  const updatePriceValue = (value) => {
    if (form) {
      const quantity = form.getFieldValue([field.name, 'quantity']);
      const currentTotal = calculate.multiply(value, quantity);
      setTotal(currentTotal);
      form.setFieldsValue({ [field.name]: { price: value, total: currentTotal } });
    }
    console.log('Price:', value);
  };

  useEffect(() => {
    if (form) {
      const currentPrice = form.getFieldValue([field.name, 'price']) || 0;
      const quantity = form.getFieldValue([field.name, 'quantity']) || 0;
      const currentTotal = calculate.multiply(currentPrice, quantity);
      setTotal(currentTotal);
      form.setFieldsValue({ [field.name]: { total: currentTotal } });
      updateSubTotal(currentTotal - prevTotal, field.key);
      setPrevTotal(currentTotal);

      // Update form fields when itemName changes
      const itemName = form.getFieldValue([field.name, 'itemName']);
      if (itemName) {
        const updatedItemData = {
          itemName,
          price: itemName.price,
          description: itemName.description,
          quantity: form.getFieldValue([field.name, 'quantity']),
          total: form.getFieldValue([field.name, 'total']),
        };
        form.setFieldsValue({
          items: { ...form.getFieldValue('items'), [field.name]: updatedItemData },
        });
      }
    }
  }, [form, field.name, field.key, updateSubTotal, prevTotal]);

  const handleItemSelect = (selectedProduct) => {
    if (form && selectedProduct) {
      form.setFieldsValue({
        [field.name]: {
          itemName: selectedProduct,
          price: selectedProduct.price,
          description: selectedProduct.description,
        },
      });
    }
    console.log('Selected Product:', selectedProduct);
  };

  const handleValuesChange = (changedValues, allValues) => {
    const itemName = form.getFieldValue([field.name, 'itemName']);
    const description = form.getFieldValue([field.name, 'description']);
    const quantity = form.getFieldValue([field.name, 'quantity']);
    const price = form.getFieldValue([field.name, 'price']);
    const total = form.getFieldValue([field.name, 'total']);

    // Only set the itemData if all required fields have values
    if (itemName && quantity && price && total) {
      const itemData = {
        itemName,
        description,
        quantity,
        price,
        total,
      };

      // Set the item data in the main form instance
      if (form) {
        form.setFieldsValue({ items: { ...form.getFieldValue('items'), [field.name]: itemData } });
      }
    }
  };

  return (
    <Form form={form} onValuesChange={handleValuesChange}>
      <Row gutter={[12, 12]} style={{ position: 'relative' }} className="mt-5">
        <Col className="gutter-row" span={4}>
          <Form.Item
            name={[field.name, 'itemName']}
            rules={[{ required: true, message: 'Item name is required' }]}
          >
            <AutoCompleteAsync
              entity={'product'}
              displayLabels={['name']}
              searchFields={'name'}
              loading={loading}
              onChange={handleItemSelect}
            />
          </Form.Item>
        </Col>
        <Col className="gutter-row" span={5}>
          <Form.Item name={[field.name, 'description']}>
            <Input />
          </Form.Item>
        </Col>
        <Col className="gutter-row" span={3}>
          <Form.Item
            name={[field.name, 'quantity']}
            rules={[{ required: true, message: 'Quantity is required' }]}
          >
            <InputNumber style={{ width: '100%' }} min={0} onChange={updateQt} />
          </Form.Item>
        </Col>
        <Col className="gutter-row" span={6}>
          <Form.Item
            name={[field.name, 'price']}
            rules={[{ required: true, message: 'Price is required' }]}
          >
            <InputNumber
              className="moneyInput"
              min={0}
              onChange={updatePriceValue}
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
                value={total}
                min={0}
                controls={false}
                addonAfter={money.currency_position === 'after' ? money.currency_symbol : undefined}
                addonBefore={
                  money.currency_position === 'before' ? money.currency_symbol : undefined
                }
                formatter={(value) => money.amountFormatter({ amount: value })}
              />
            </Form.Item>
          </Form.Item>
        </Col>
        <div style={{ position: 'absolute', right: '-12px', top: ' 5px' }}>
          <DeleteOutlined onClick={handleRemoveItem} />
        </div>
      </Row>
    </Form>
  );
};

export default function InvoiceForm({ current = null }) {
  const { last_invoice_number } = useSelector(selectFinanceSettings);

  // if (!last_invoice_number) {
  //   return <></>;
  // }

  return <LoadInvoiceForm current={current} />;
}

function LoadInvoiceForm({ current = null }) {
  const translate = useLanguage();
  const { dateFormat } = useDate();
  const { last_invoice_number } = useSelector(selectFinanceSettings);
  const [total, setTotal] = useState(0);
  const [taxRate, setTaxRate] = useState(0);
  const [taxTotal, setTaxTotal] = useState(0);
  const [recargo, setRecargo] = useState(0);
  const [recargoTotal, setRecargoTotal] = useState(0);
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [lastNumber, setLastNumber] = useState(() => last_invoice_number + 1);
  const [formData, setFormData] = useState({ description: '' });
  const [subTotal, setSubTotal] = useState(0);
  const [itemTotals, setItemTotals] = useState([]);
  const prevSubTotal = useRef(subTotal);
  const prevTaxRate = useRef(taxRate);
  const prevRecargo = useRef(recargo);
  const [form] = Form.useForm();

  const handleUpdateSubTotal = (delta, index) => {
    setItemTotals((prevItemTotals) => {
      const updatedTotals = [...prevItemTotals];
      updatedTotals[index] = delta;
      return updatedTotals;
    });
    setSubTotal((prevSubTotal) => prevSubTotal + delta);
  };

  const handelTaxChange = useCallback((value) => {
    console.log('Selected Tax Rate:', value);
    setTaxRate(value / 1);
  }, []);

  const recargoChange = useCallback((value) => {
    setRecargo(value / 1);
  }, []);

  useEffect(() => {
    if (
      subTotal !== prevSubTotal.current ||
      taxRate !== prevTaxRate.current ||
      recargo !== prevRecargo.current
    ) {
      const taxValue = calculate.multiply(subTotal, taxRate) / 100;
      const recargoValue = calculate.multiply(subTotal, recargo) / 100;
      const currentTotal = calculate.add(subTotal, taxValue);
      setTaxTotal(taxValue);
      setRecargoTotal(recargoValue);
      const total = calculate.add(currentTotal, recargoValue) / 1;
      setTotal(total);

      prevSubTotal.current = subTotal;
      prevTaxRate.current = taxRate;
      prevRecargo.current = recargo;
    }
  }, [subTotal, taxRate, recargo]);

  const addField = useRef(false);

  const handleRemoveItem = useCallback(
    (removedField) => {
      setItemTotals((prevItemTotals) => {
        const updatedTotals = [...prevItemTotals];
        updatedTotals[removedField.key] = 0;
        return updatedTotals;
      });
      setSubTotal((prevSubTotal) => {
        const removedItemTotal = itemTotals[removedField.key] || 0;
        return prevSubTotal - removedItemTotal;
      });
    },
    [itemTotals]
  );

  useEffect(() => {
    addField.current.click();
  }, []);

  return (
    <>
      <Row gutter={[12, 0]}>
        <Col className="gutter-row" span={9}>
          <Form.Item
            name="client"
            label={translate('Client')}
            rules={[
              {
                required: true,
              },
            ]}
          >
            <AutoCompleteAsync entity={'client'} displayLabels={['name']} searchFields={'name'} />
          </Form.Item>
        </Col>
        <Col className="gutter-row" span={5}>
          <Form.Item
            label={translate('number')}
            name="number"
            initialValue={lastNumber}
            rules={[
              {
                required: true,
              },
            ]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col className="gutter-row" span={5}>
          <Form.Item
            label={translate('year')}
            name="year"
            initialValue={currentYear}
            rules={[
              {
                required: true,
              },
            ]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col className="gutter-row" span={5}>
          <Form.Item
            label={translate('status')}
            name="status"
            rules={[
              {
                required: false,
              },
            ]}
            initialValue={'draft'}
          >
            <Select
              options={[
                { value: 'draft', label: translate('Draft') },
                { value: 'pending', label: translate('Pending') },
                { value: 'sent', label: translate('Sent') },
              ]}
            ></Select>
          </Form.Item>
        </Col>
        <Col className="gutter-row" span={9}>
          <Form.Item label={translate('Note')} name="note">
            <Input />
          </Form.Item>
        </Col>
        <Col className="gutter-row" span={8}>
          <Form.Item
            name="date"
            label={translate('Date')}
            rules={[
              {
                required: true,
                type: 'object',
              },
            ]}
            initialValue={dayjs()}
          >
            <DatePicker style={{ width: '100%' }} format={dateFormat} />
          </Form.Item>
        </Col>
        <Col className="gutter-row" span={7}>
          <Form.Item
            name="expiredDate"
            label="Vencimiento"
            rules={[
              {
                required: true,
                type: 'object',
              },
            ]}
            initialValue={dayjs().add(30, 'days')}
          >
            <DatePicker style={{ width: '100%' }} format={dateFormat} />
          </Form.Item>
        </Col>
      </Row>
      <Divider dashed />
      <Row gutter={[12, 12]} style={{ position: 'relative' }} className="-mb-6">
        <Col className="gutter-row mobile-full-width" span={4}>
          <p>Código</p>
        </Col>
        <Col className="gutter-row mobile-full-width" span={5}>
          <p>Desc.</p>
        </Col>
        <Col className="gutter-row mobile-full-width" span={3}>
          <p>Cant.</p>
        </Col>
        <Col className="gutter-row mobile-full-width" span={6}>
          <p>Precio</p>
        </Col>
        <Col className="gutter-row mobile-full-width" span={6}>
          <p>Total</p>
        </Col>
      </Row>
      <Form.List
        name="items"
        className="my-10"
        onRemove={(removedField) => handleRemoveItem(removedField)}
        rules={[
          {
            validator: async (_, items) => {
              if (!items || items.length < 1) {
                return Promise.reject(new Error('Please add at least one item.'));
              }
            },
          },
        ]}
      >
        {(fields, { add, remove }) => (
          <>
            {fields.map((field) => (
              <ItemRow
                key={field.key}
                remove={remove}
                field={field}
                current={current}
                updateSubTotal={handleUpdateSubTotal}
              />
            ))}
            <br></br>
            <Form.Item className="mt-6">
              <Button
                type="dashed"
                onClick={() => add()}
                block
                icon={<PlusOutlined />}
                ref={addField}
              >
                Añadir producto
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>
      <Divider dashed />
      <div style={{ position: 'relative', width: ' 100%', float: 'right' }}>
        <Row gutter={[2, -5]}>
          <Col className="gutter-row" span={10}>
            <Form.Item>
              <Button type="primary" htmlType="submit" icon={<PlusOutlined />} block>
                {translate('Save')}
              </Button>
            </Form.Item>
          </Col>
          <Col
            className="gutter-row"
            md={{
              span: 3,
              offset: 15,
            }}
            xs={{
              span: 7,
              offset: 11,
            }}
          >
            <p
              style={{
                paddingLeft: '12px',
                paddingTop: '5px',
              }}
            >
              {translate('Sub Total')} :
            </p>
          </Col>
          <Col className="gutter-row" span={6}>
            <MoneyInputFormItem readOnly value={subTotal} />
          </Col>
        </Row>
        <Row gutter={[12, -5]}>
          <Col
            className="gutter-row"
            md={{
              span: 3,
              offset: 15,
            }}
            xs={{
              span: 7,
              offset: 11,
            }}
            style={{ textAlign: 'center' }}
          >
            <Form.Item
              name="taxRate"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <SelectAsync
                value={taxRate}
                onChange={handelTaxChange}
                entity={'taxes'}
                outputValue={'taxValue'}
                displayLabels={['taxName']}
                withRedirect={true}
              />
            </Form.Item>
          </Col>
          <Col className="gutter-row" span={6}>
            <MoneyInputFormItem readOnly value={taxTotal} />
          </Col>
        </Row>
        <Row gutter={[12, -5]}>
          <Col
            className="gutter-row"
            span={3}
            offset={15}
            style={{
              verticalAlign: 'middle',
            }}
          >
            <Form.Item
              name="recargo"
              rules={[
                {
                  required: false,
                  message: 'Introduzca recargo.',
                },
              ]}
              initialValue="¿Recargo?"
            >
              <Select
                value={recargo}
                onChange={recargoChange}
                bordered={false}
                options={[
                  { value: 0, label: 'Sin recargo' },
                  { value: 5.2, label: '5.2%' }, // recargo value is 5.2%
                ]}
                style={{
                  textSizeAdjust: '10px',
                }}
              ></Select>
            </Form.Item>
          </Col>
          <Col className="gutter-row" span={6}>
            <MoneyInputFormItem readOnly value={recargoTotal} />
          </Col>
        </Row>
        <Row gutter={[12, -5]}>
          <Col
            className="gutter-row"
            md={{
              span: 2,
              offset: 16,
            }}
            xs={{
              span: 5,
              offset: 13,
            }}
            style={{
              verticalAlign: 'middle',
            }}
          >
            <p
              style={{
                paddingLeft: '12px',
                paddingTop: '5px',
                verticalAlign: 'middle',
              }}
            >
              {translate('Total')} :
            </p>
          </Col>
          <Col className="gutter-row" span={6}>
            <MoneyInputFormItem readOnly value={total} />
          </Col>
        </Row>
      </div>
    </>
  );
}
